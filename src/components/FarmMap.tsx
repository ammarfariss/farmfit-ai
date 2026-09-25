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
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [51.515, 25.708],
      zoom: 13.6,
      minZoom: 10,
      maxZoom: 17,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), "top-right");

    map.on("load", () => {
      map.addSource("plots", { type: "geojson", data: DEMO_PLOTS });
      map.addLayer({
        id: "plot-fill",
        type: "fill",
        source: "plots",
        paint: {
          "fill-color": ["case", ["==", ["get", "selected"], true], "#355f54", "#dfe8e1"],
          "fill-opacity": ["case", ["==", ["get", "selected"], true], 0.18, 0.08],
        },
      });
      map.addLayer({
        id: "plot-line",
        type: "line",
        source: "plots",
        paint: {
          "line-color": "#23473d",
          "line-width": ["case", ["==", ["get", "selected"], true], 2.2, 1.4],
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

      map.addSource("service-road", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [[51.505, 25.697], [51.514, 25.705], [51.525, 25.706], [51.531, 25.703]] },
          }],
        },
      });
      map.addLayer({
        id: "service-road",
        type: "line",
        source: "service-road",
        paint: {
          "line-color": "#9db4a7",
          "line-width": 2,
          "line-dasharray": [3, 3],
        },
      });

      const updateSelection = () => {
        const payload = {
          ...DEMO_PLOTS,
          features: DEMO_PLOTS.features.map((feature) => ({
            ...feature,
            properties: { ...feature.properties, selected: selectedPlots.includes(feature.properties!.id) },
          })),
        };
        (map.getSource("plots") as maplibregl.GeoJSONSource).setData(payload);
      };

      updateSelection();

      map.on("click", "plot-fill", (event) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (!id) return;
        const next = selectedPlots.includes(id) ? selectedPlots.filter((item) => item !== id) : [...selectedPlots, id];
        setSelectedPlots(next);
      });

      map.on("mouseenter", "plot-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "plot-fill", () => {
        map.getCanvas().style.cursor = "";
      });

      const existingLayoutIds: string[] = [];
      const drawLayout = () => {
        existingLayoutIds.forEach((layerId) => {
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(layerId)) map.removeSource(layerId);
        });
        existingLayoutIds.length = 0;

        if (!result) return;

        const selectedFeatures = DEMO_PLOTS.features.filter((feature) => selectedPlots.includes(feature.properties!.id));
        selectedFeatures.forEach((plot, plotIndex) => {
          const blocks = buildLayout(plot, result.allocations);
          blocks.forEach((block, index) => {
            const sourceId = `layout-${plotIndex}-${index}`;
            existingLayoutIds.push(`${sourceId}-fill`, `${sourceId}-label`);
            map.addSource(sourceId, { type: "geojson", data: block.geometry });
            map.addLayer({
              id: `${sourceId}-fill`,
              type: "fill",
              source: sourceId,
              paint: {
                "fill-color": CROPS.find((crop) => crop.id === block.cropId)?.color ?? "#7f8f8a",
                "fill-opacity": 0.76,
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
                "text-offset": [0, 0.2],
              },
              paint: { "text-color": "#12362e", "text-halo-color": "#f4f4f0", "text-halo-width": 1.3 },
            });
          });
        });
      };

      drawLayout();
    });

    return () => map.remove();
  }, [result, selectedPlots, setSelectedPlots]);

  return (
    <div className="map-wrap">
      <div ref={ref} className="map" />
      <div className="map-label">
        <span className="status-dot" />
        Qatar demo GIS · {selectedPlots.length} plot{selectedPlots.length === 1 ? "" : "s"} selected
      </div>
      <div className="map-legend">
        <span><i className="legend-boundary" />Plot boundary</span>
        <span><i className="legend-zone" />Production zone</span>
      </div>
      {result && (
        <div className="map-title">
          <span>Farm blueprint</span>
          <strong>Resource-aware layout</strong>
        </div>
      )}
    </div>
  );
}
