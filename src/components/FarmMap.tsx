"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { DEMO_PLOTS } from "@/lib/data/demo-plots";
import { buildLayout } from "@/lib/model/geometry";
import type { PortfolioResult } from "@/lib/model/optimizer";
import { CROPS } from "@/lib/model/assumptions";

export default function FarmMap({ selectedPlots, setSelectedPlots, result }: { selectedPlots: string[]; setSelectedPlots: (ids: string[]) => void; result: PortfolioResult | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const selectedFeature = DEMO_PLOTS.features.find((feature) => selectedPlots.includes(feature.properties!.id));
    const center = selectedFeature?.properties?.centroid ?? [51.515, 25.708];

    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center,
      zoom: 13.8,
      minZoom: 10,
      maxZoom: 17,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");

    map.on("load", () => {
      const selectedPayload = {
        ...DEMO_PLOTS,
        features: DEMO_PLOTS.features.map((feature) => ({
          ...feature,
          properties: { ...feature.properties, selected: selectedPlots.includes(feature.properties!.id) },
        })),
      };

      map.addSource("plots", { type: "geojson", data: selectedPayload });
      map.addLayer({
        id: "plot-fill",
        type: "fill",
        source: "plots",
        paint: {
          "fill-color": ["case", ["==", ["get", "selected"], true], "#355f54", "#dfe8e1"],
          "fill-opacity": ["case", ["==", ["get", "selected"], true], 0.18, 0.06],
        },
      });
      map.addLayer({
        id: "plot-line",
        type: "line",
        source: "plots",
        paint: {
          "line-color": ["case", ["==", ["get", "selected"], true], "#23473d", "#82978e"],
          "line-width": ["case", ["==", ["get", "selected"], true], 2.4, 1.1],
        },
      });
      map.addLayer({
        id: "plot-label",
        type: "symbol",
        source: "plots",
        layout: {
          "text-field": ["format", ["get", "name"], { "font-scale": 0.9 }, "\n", ["get", "areaM2"], " m²", { "font-scale": 0.75 }],
          "text-size": 11,
          "text-anchor": "center",
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#3e5d52", "text-halo-color": "#f5f6f2", "text-halo-width": 1.5 },
      });

      map.on("click", "plot-fill", (event) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (id) setSelectedPlots([id]);
      });
      map.on("mouseenter", "plot-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "plot-fill", () => { map.getCanvas().style.cursor = ""; });

      if (result && selectedFeature) {
        const blocks = buildLayout(selectedFeature, result.allocations);
        blocks.forEach((block, index) => {
          const sourceId = `layout-${index}`;
          map.addSource(sourceId, { type: "geojson", data: block.geometry });
          map.addLayer({
            id: `${sourceId}-fill`,
            type: "fill",
            source: sourceId,
            paint: {
              "fill-color": CROPS.find((crop) => crop.id === block.cropId)?.color ?? "#7f8f8a",
              "fill-opacity": 0.78,
              "fill-outline-color": "#ffffff",
            },
          });
          map.addLayer({
            id: `${sourceId}-label`,
            type: "symbol",
            source: sourceId,
            layout: {
              "text-field": ["format", CROPS.find((crop) => crop.id === block.cropId)?.name ?? block.cropId, { "font-scale": 1.0 }, "\n", `${Math.round(block.areaM2).toLocaleString()} m²`, { "font-scale": 0.75 }],
              "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
              "text-size": 11,
              "text-anchor": "center",
            },
            paint: { "text-color": "#12362e", "text-halo-color": "#f4f4f0", "text-halo-width": 1.3 },
          });
        });
      }
    });

    return () => map.remove();
  }, [result, selectedPlots, setSelectedPlots]);

  return (
    <div className="map-wrap">
      <div ref={ref} className="map" />
      <div className="map-label">
        <span className="status-dot" />
        Qatar demo GIS · 1 representative site selected
      </div>
      <div className="map-legend">
        <span><i className="legend-boundary" />Plot boundary</span>
        <span><i className="legend-zone" />Production zone</span>
      </div>
      {result && (
        <div className="map-title">
          <span>Farm blueprint</span>
          <strong>{result.bindingConstraint} constrained · {result.siteFitPct === null ? "baseline fit" : `${Math.round(result.siteFitPct)}% site fit`}</strong>
        </div>
      )}
    </div>
  );
}
