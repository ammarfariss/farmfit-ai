import type { FeatureCollection, Polygon } from "geojson";
import { DEMO_PLOTS } from "./demo-plots";

export type PlotSource = "official" | "demo";
export type PlotData = { plots: FeatureCollection<Polygon>; source: PlotSource; message: string };

export async function getQatarCadastralPlots(): Promise<PlotData> {
  const endpoint = process.env.QATAR_CADASTRAL_FEATURE_SERVER;
  if (!endpoint) return { plots: DEMO_PLOTS, source: "demo", message: "Demo data / Prototype assumptions" };
  try {
    const response = await fetch(`${endpoint}?where=1%3D1&outFields=*&f=geojson`, { next: { revalidate: 86400 } });
    if (!response.ok) throw new Error(`GIS service returned ${response.status}`);
    const plots = (await response.json()) as FeatureCollection<Polygon>;
    return { plots, source: "official", message: "Qatar cadastral service" };
  } catch {
    return { plots: DEMO_PLOTS, source: "demo", message: "Official GIS unavailable — using demo data / prototype assumptions" };
  }
}
