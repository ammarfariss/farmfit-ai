import type { FeatureCollection, Polygon } from "geojson";

export const DEMO_PLOTS: FeatureCollection<Polygon, { id: string; name: string; areaM2: number; centroid: [number, number] }> = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { id: "plot-a", name: "Al Khor plot A", areaM2: 10000, centroid: [51.512, 25.703] }, geometry: { type: "Polygon", coordinates: [[[51.507, 25.699], [51.517, 25.699], [51.517, 25.707], [51.507, 25.707], [51.507, 25.699]]] } },
    { type: "Feature", properties: { id: "plot-b", name: "Al Khor plot B", areaM2: 7200, centroid: [51.524, 25.705] }, geometry: { type: "Polygon", coordinates: [[[51.520, 25.702], [51.528, 25.702], [51.528, 25.708], [51.520, 25.708], [51.520, 25.702]]] } },
    { type: "Feature", properties: { id: "plot-c", name: "Al Khor plot C", areaM2: 5400, centroid: [51.500, 25.714] }, geometry: { type: "Polygon", coordinates: [[[51.496, 25.711], [51.504, 25.711], [51.504, 25.717], [51.496, 25.717], [51.496, 25.711]]] } },
  ],
};
