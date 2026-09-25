import type { Feature, Polygon } from "geojson";
import { area } from "@turf/area";
import { polygon } from "@turf/helpers";

export type LayoutBlock = { id: string; cropId: string; techniqueId: string; percentage: number; areaM2: number; geometry: Feature<Polygon> };

export function buildLayout(feature: Feature<Polygon>, allocations: Array<{ cropId: string; techniqueId: string; percentage: number; areaM2: number }>): LayoutBlock[] {
  const ring = feature.geometry.coordinates[0];
  const minX = Math.min(...ring.map(([x]) => x)); const maxX = Math.max(...ring.map(([x]) => x));
  const minY = Math.min(...ring.map(([, y]) => y)); const maxY = Math.max(...ring.map(([, y]) => y));
  let cursor = minX;
  return allocations.map((allocation, index) => {
    const width = (maxX - minX) * allocation.percentage;
    const block = polygon([[[cursor, minY], [cursor + width, minY], [cursor + width, maxY], [cursor, maxY], [cursor, minY]]]);
    cursor += width;
    return { ...allocation, id: `block-${index}`, geometry: { ...block, properties: { cropId: allocation.cropId, techniqueId: allocation.techniqueId, percentage: allocation.percentage, areaM2: allocation.areaM2 } }, areaM2: area(block) };
  });
}
