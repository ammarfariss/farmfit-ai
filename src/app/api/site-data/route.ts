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

  try {
    const overpassQuery = `[out:json][timeout:8];(nwr(around:3000,${latitude},${longitude})["shop"~"supermarket|greengrocer|market"];nwr(around:3000,${latitude},${longitude})["highway"~"primary|secondary|tertiary"];);out center tags;`;
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
      fetch(nasaUrl, { next: { revalidate: 86400 } }),
      fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: overpassQuery,
        next: { revalidate: 86400 },
      }),
      fetch(soilUrl, { next: { revalidate: 86400 } }),
      fetch(qatarSearchUrl, { next: { revalidate: 86400 } }),
    ]);
    if (!nasaResponse.ok) throw new Error(`NASA POWER returned ${nasaResponse.status}`);
    const nasa = (await nasaResponse.json()) as NASAResponse;
    const parameter = nasa.properties?.parameter ?? {};
    const average = (key: string) => {
      const values = Object.values(parameter[key] ?? {}).filter(Number.isFinite);
      return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    };
    const soil = soilResponse.ok ? readSoilGrid(await soilResponse.json() as SoilGridResponse) : null;
    const qatar = qatarResponse.ok ? readQatarCatalog(await qatarResponse.json() as { results?: Array<{ dataset?: { dataset_id?: string; title?: string } }> }) : [];

    return NextResponse.json({
      source: "NASA POWER climatology",
      coordinates: { latitude, longitude },
      climate: {
        temperatureC: average("T2M"),
        solarKwhM2Day: average("ALLSKY_SFC_SW_DWN"),
        humidityPct: average("RH2M"),
        windMps: average("WS2M"),
      },
      nearby: overpassResponse.ok ? summarizeNearby(await overpassResponse.json()) : { markets: 0, roads: 0, places: [] },
      soil,
      qatarDatasets: qatar,
    });
  } catch (error) {
    return NextResponse.json({
      source: "Demo climate baseline",
      coordinates: { latitude, longitude },
      climate: { temperatureC: 27.4, solarKwhM2Day: 5.8, humidityPct: 58, windMps: 4.1 },
      nearby: { markets: 0, roads: 0, places: [] },
      soil: { pH: null, source: "SoilGrids unavailable" },
      qatarDatasets: [],
      warning: error instanceof Error ? error.message : "NASA POWER unavailable",
    }, { status: 200 });
  }
}

function readSoilGrid(data: SoilGridResponse) {
  const layer = data.properties?.layers?.find((item) => item.name === "phh2o") ?? data.properties?.layers?.[0];
  const value = layer?.depths?.find((item) => item.label === "0-5cm")?.values?.mean ?? layer?.depths?.[0]?.values?.mean ?? null;
  return { pH: typeof value === "number" ? value / 10 : null, source: "SoilGrids v2 beta · 0–5 cm" };
}

function readQatarCatalog(data: { results?: Array<{ dataset?: { dataset_id?: string; title?: string } }> }) {
  return (data.results ?? []).map((item) => ({
    id: item.dataset?.dataset_id ?? "unknown",
    title: item.dataset?.title ?? "Qatar Open Data dataset",
  })).filter((item) => item.id !== "unknown");
}

function summarizeNearby(data: { elements?: Array<{ tags?: Record<string, string>; center?: { lat: number; lon: number }; lat?: number; lon?: number }> }) {
  const elements = data.elements ?? [];
  const places = elements
    .filter((element) => element.tags?.shop)
    .slice(0, 5)
    .map((element) => ({ name: element.tags?.name ?? "Unnamed market", type: element.tags?.shop ?? "market", latitude: element.center?.lat ?? element.lat, longitude: element.center?.lon ?? element.lon }));
  return {
    markets: places.length,
    roads: elements.filter((element) => Boolean(element.tags?.highway)).length,
    places,
  };
}
