import { NextRequest, NextResponse } from "next/server";

type NASAResponse = {
  properties?: {
    parameter?: Record<string, Record<string, number>>;
  };
};

type SoilGridResponse = {
  properties?: {
    layers?: Array<{
      name?: string;
      depths?: Array<{ label?: string; values?: { mean?: number | null } }>;
    }>;
  };
};

type SourceStatus = { nasa: boolean; osm: boolean; soil: boolean; qatar: boolean };

async function safeFetch(input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1], timeoutMs = 5500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function safeJson<T>(response: Response | null): Promise<T | null> {
  if (!response?.ok) return null;
  try {
    return await response.json() as T;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat") ?? 25.703);
  const longitude = Number(request.nextUrl.searchParams.get("lon") ?? 51.512);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "A valid latitude and longitude are required." }, { status: 400 });
  }

  const nasaUrl = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  nasaUrl.searchParams.set("parameters", "T2M,ALLSKY_SFC_SW_DWN,RH2M,WS2M");
  nasaUrl.searchParams.set("community", "AG");
  nasaUrl.searchParams.set("longitude", longitude.toString());
  nasaUrl.searchParams.set("latitude", latitude.toString());
  nasaUrl.searchParams.set("format", "JSON");

  const overpassQuery = `[out:json][timeout:6];(nwr(around:3000,${latitude},${longitude})["shop"~"supermarket|greengrocer|market"];nwr(around:3000,${latitude},${longitude})["highway"~"primary|secondary|tertiary"];);out center tags;`;

  const soilUrl = new URL("https://rest.isric.org/soilgrids/v2.0/properties/query");
  soilUrl.searchParams.set("lon", longitude.toString());
  soilUrl.searchParams.set("lat", latitude.toString());
  soilUrl.searchParams.set("property", "phh2o");
  soilUrl.searchParams.set("depth", "0-5cm");
  soilUrl.searchParams.set("value", "mean");

  const qatarSearchUrl = new URL("https://qatar.opendatasoft.com/api/explore/v2.1/catalog/datasets");
  qatarSearchUrl.searchParams.set("search", "production area average yield crops");
  qatarSearchUrl.searchParams.set("limit", "3");

  const [nasaResponse, overpassResponse, soilResponse, qatarResponse] = await Promise.all([
    safeFetch(nasaUrl, { next: { revalidate: 86400 } }),
    safeFetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: overpassQuery,
      next: { revalidate: 86400 },
    }, 6500),
    safeFetch(soilUrl, { next: { revalidate: 86400 } }),
    safeFetch(qatarSearchUrl, { next: { revalidate: 86400 } }),
  ]);

  const [nasa, overpass, soilData, qatarData] = await Promise.all([
    safeJson<NASAResponse>(nasaResponse),
    safeJson<{ elements?: Array<{ tags?: Record<string, string>; center?: { lat: number; lon: number }; lat?: number; lon?: number }> }>(overpassResponse),
    safeJson<SoilGridResponse>(soilResponse),
    safeJson<{ results?: Array<{ dataset?: { dataset_id?: string; title?: string }; dataset_id?: string; metas?: { default?: { title?: string } } }> }>(qatarResponse),
  ]);

  const sourceStatus: SourceStatus = {
    nasa: Boolean(nasa),
    osm: Boolean(overpass),
    soil: Boolean(soilData),
    qatar: Boolean(qatarData),
  };

  const parameter = nasa?.properties?.parameter ?? {};
  const climatology = (key: string) => {
    const series = parameter[key] ?? {};
    if (Number.isFinite(series.ANN)) return series.ANN;
    const monthly = Object.entries(series)
      .filter(([name, value]) => name !== "ANN" && Number.isFinite(value))
      .map(([, value]) => value);
    return monthly.length ? monthly.reduce((sum, value) => sum + value, 0) / monthly.length : null;
  };

  const climate = sourceStatus.nasa
    ? {
        temperatureC: climatology("T2M"),
        solarKwhM2Day: climatology("ALLSKY_SFC_SW_DWN"),
        humidityPct: climatology("RH2M"),
        windMps: climatology("WS2M"),
      }
    : { temperatureC: 27.4, solarKwhM2Day: 5.8, humidityPct: 58, windMps: 4.1 };

  const soil = soilData ? readSoilGrid(soilData) : { pH: null, source: "SoilGrids unavailable" };
  const nearby = overpass ? summarizeNearby(overpass) : { markets: 0, roads: 0, places: [] as Array<{ name: string; type: string; latitude?: number; longitude?: number }> };
  const qatarDatasets = qatarData ? readQatarCatalog(qatarData) : [];

  const unavailable = Object.entries(sourceStatus).filter(([, ready]) => !ready).map(([name]) => name.toUpperCase());

  return NextResponse.json({
    source: sourceStatus.nasa ? "NASA POWER climatology" : "Demo climate baseline",
    coordinates: { latitude, longitude },
    climate,
    nearby,
    soil,
    qatarDatasets,
    sourceStatus,
    warning: unavailable.length ? `${unavailable.join(", ")} unavailable; remaining sources and documented fallbacks were used.` : undefined,
  }, {
    status: 200,
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}

function readSoilGrid(data: SoilGridResponse) {
  const layer = data.properties?.layers?.find((item) => item.name === "phh2o") ?? data.properties?.layers?.[0];
  const value = layer?.depths?.find((item) => item.label === "0-5cm")?.values?.mean ?? layer?.depths?.[0]?.values?.mean ?? null;
  return { pH: typeof value === "number" ? value / 10 : null, source: "SoilGrids v2 beta · 0–5 cm" };
}

function readQatarCatalog(data: { results?: Array<{ dataset?: { dataset_id?: string; title?: string }; dataset_id?: string; metas?: { default?: { title?: string } } }> }) {
  return (data.results ?? []).map((item) => ({
    id: item.dataset?.dataset_id ?? item.dataset_id ?? "unknown",
    title: item.dataset?.title ?? item.metas?.default?.title ?? "Qatar Open Data dataset",
  })).filter((item) => item.id !== "unknown");
}

function summarizeNearby(data: { elements?: Array<{ tags?: Record<string, string>; center?: { lat: number; lon: number }; lat?: number; lon?: number }> }) {
  const elements = data.elements ?? [];
  const marketElements = elements.filter((element) => Boolean(element.tags?.shop));
  const places = marketElements.slice(0, 5).map((element) => ({
    name: element.tags?.name ?? "Unnamed market",
    type: element.tags?.shop ?? "market",
    latitude: element.center?.lat ?? element.lat,
    longitude: element.center?.lon ?? element.lon,
  }));

  return {
    markets: marketElements.length,
    roads: elements.filter((element) => Boolean(element.tags?.highway)).length,
    places,
  };
}
