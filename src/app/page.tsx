"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CROPS, MODEL_ASSUMPTIONS, TECHNIQUES, type CropId, type TechniqueId } from "@/lib/model/assumptions";
import { DEMO_PLOTS } from "@/lib/data/demo-plots";
import { optimizePortfolio, type PortfolioResult } from "@/lib/model/optimizer";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const FarmMap = dynamic(() => import("@/components/FarmMap"), { ssr: false });
const money = (value: number) => `QAR ${Math.round(value).toLocaleString()}`;

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedPlots, setSelectedPlots] = useState(["plot-a"]);
  const [crops, setCrops] = useState<CropId[]>(["tomato", "lettuce", "cucumber"]);
  const [techniques, setTechniques] = useState<TechniqueId[]>(["greenhouse", "hydroponic", "open-field"]);
  const [budget, setBudget] = useState(MODEL_ASSUMPTIONS.defaultBudgetQar);
  const [water, setWater] = useState(MODEL_ASSUMPTIONS.defaultWaterLimitM3);
  const [energy, setEnergy] = useState(MODEL_ASSUMPTIONS.defaultEnergyLimitKwh);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [siteData, setSiteData] = useState<{ source: string; climate: { temperatureC: number | null; solarKwhM2Day: number | null; humidityPct: number | null; windMps: number | null }; nearby?: { markets: number; roads: number }; soil?: { pH: number | null; source: string }; qatarDatasets?: Array<{ id: string; title: string }> } | null>(null);
  const areaM2 = useMemo(() => DEMO_PLOTS.features.filter((plot) => selectedPlots.includes(plot.properties?.id ?? "")).reduce((sum, plot) => sum + (plot.properties?.areaM2 ?? 0), 0), [selectedPlots]);

  useEffect(() => {
    const plot = DEMO_PLOTS.features.find((feature) => selectedPlots.includes(feature.properties!.id));
    if (!plot?.properties?.centroid) {
      setSiteData(null);
      return;
    }

    const controller = new AbortController();
    const [longitude, latitude] = plot.properties.centroid;
    fetch(`/api/site-data?lat=${latitude}&lon=${longitude}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) setSiteData(data); })
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") setSiteData(null);
      });

    return () => controller.abort();
  }, [selectedPlots]);

  const run = () => {
    setResult(optimizePortfolio({
      areaM2,
      budgetQar: budget,
      waterLimitM3: water,
      energyLimitKwh: energy,
      crops,
      techniques,
      siteContext: siteData ? {
        temperatureC: siteData.climate.temperatureC,
        soilPh: siteData.soil?.pH ?? null,
        windMps: siteData.climate.windMps,
      } : undefined,
    }));
    setStep(3);
  };
  const toggle = <T extends string>(value: T, values: T[], setter: (next: T[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">FF</span><span>Farm<em>Fit</em></span></div><span className="demo-pill">Demo data / Prototype assumptions</span></header>
    {step === 0 && <section className="landing"><div className="eyebrow">QATAR · SITE SUITABILITY + PORTFOLIO DESIGN</div><h1>Design the farm.<br /><span>Don&apos;t guess the farm.</span></h1><p className="lead">Turn farm-plot choices, resource limits, and crop options into a transparent farm-management blueprint.</p><button className="primary-button" onClick={() => setStep(1)}>Start a farm plan <span>→</span></button><div className="landing-note"><strong>Built for the plot, not the brochure.</strong><span>Map-first planning with transparent assumptions and a 5-year ROI lens.</span></div></section>}
    {step > 0 && <div className="workspace"><aside className="sidebar"><div className="step-label">FARM PLAN / 0{Math.min(step, 3)}</div><h2>{step === 3 ? "Your farm blueprint" : "Build your plan"}</h2>{step < 3 && <div className="stepper">{["Select land", "Choose what you can use", "Set limits"].map((label, index) => <button key={label} className={step === index + 1 ? "active" : step > index + 1 ? "complete" : ""} onClick={() => setStep(index + 1)}><span>{index + 1}</span>{label}</button>)}</div>}
      {step === 1 && <div className="form-section"><p className="section-kicker">STEP 01</p><h3>Select land</h3><p className="muted">Choose one or multiple farm plots. This prototype uses representative demo plots near Al Khor.</p><div className="plot-list">{DEMO_PLOTS.features.map((plot) => { const id = plot.properties!.id; const checked = selectedPlots.includes(id); return <button key={id} className={`plot-option ${checked ? "selected" : ""}`} onClick={() => toggle(id, selectedPlots, setSelectedPlots)}><span className="checkbox">{checked ? "✓" : ""}</span><span><strong>{plot.properties!.name}</strong><small>{plot.properties!.areaM2.toLocaleString()} m² · Qatar demo GIS</small></span></button> })}</div><div className="area-total"><span>Selected area</span><strong>{areaM2.toLocaleString()} m²</strong></div><button className="primary-button full" disabled={!selectedPlots.length} onClick={() => setStep(2)}>Continue <span>→</span></button></div>}
      {step === 2 && <div className="form-section"><p className="section-kicker">STEP 02</p><h3>Choose what you can use</h3><p className="muted">Your available crops and techniques become the optimizer&apos;s decision space.</p><label className="field-label">Crops</label><div className="choice-grid">{CROPS.map((crop) => <button key={crop.id} className={`choice ${crops.includes(crop.id) ? "selected" : ""}`} onClick={() => toggle(crop.id, crops, setCrops)}><i style={{ background: crop.color }} />{crop.name}</button>)}</div><label className="field-label">Techniques</label><div className="choice-grid">{TECHNIQUES.map((technique) => <button key={technique.id} className={`choice ${techniques.includes(technique.id) ? "selected" : ""}`} onClick={() => toggle(technique.id, techniques, setTechniques)}><i className="tech-dot" />{technique.name}</button>)}</div><button className="primary-button full" disabled={!crops.length || !techniques.length} onClick={() => setStep(3)}>Continue <span>→</span></button></div>}
      {step === 3 && !result && <div className="form-section"><p className="section-kicker">STEP 03</p><h3>Set limits</h3><p className="muted">Keep the plan honest. Prices and utilities are editable user assumptions.</p>{[["Budget (QAR)", budget, setBudget, 10000], ["Water limit (m³ / year)", water, setWater, 100], ["Energy limit (kWh / year)", energy, setEnergy, 1000]].map(([label, value, setter, min]) => <label className="input-row" key={label as string}><span>{label as string}<small>User assumption</small></span><input type="number" min={min as number} value={value as number} onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))} /></label>)}<p className="muted">{siteData ? "✓ Site context ready — temperature, wind and soil pH can influence the ranking." : "Loading site context; you can still run the baseline optimizer."}</p><button className="primary-button full" onClick={run}>Optimize my farm <span>↗</span></button></div>}
      {result && <ResultsPanel result={result} siteData={siteData} onReset={() => { setResult(null); setSiteData(null); setStep(1); }} />}
    </aside><section className="map-area"><FarmMap selectedPlots={selectedPlots} setSelectedPlots={setSelectedPlots} result={result} /></section></div>}
  </main>;
}

function ResultsPanel({ result, siteData, onReset }: { result: PortfolioResult; siteData: { source: string; climate: { temperatureC: number | null; solarKwhM2Day: number | null; humidityPct: number | null; windMps: number | null }; nearby?: { markets: number; roads: number }; soil?: { pH: number | null; source: string }; qatarDatasets?: Array<{ id: string; title: string }> } | null; onReset: () => void }) {
  const resourceData = [
    { name: "Water", used: Math.round(result.waterM3), limit: 22000 },
    { name: "Energy", used: Math.round(result.energyKwh / 10), limit: 13000 },
  ];
  return <div className="results"><div className="result-head"><p className="section-kicker">OPTIMIZED PORTFOLIO</p><h3>Built around your land.</h3><button className="text-button" onClick={onReset}>Edit plan</button></div><div className="metric-hero"><span>5-year ROI</span><strong>{Math.round(result.roi5Year * 100)}%</strong><small>Payback in {Number.isFinite(result.paybackYears) ? `${result.paybackYears.toFixed(1)} years` : "not reached"}</small></div><div className="metric-grid">{[["Annual revenue", money(result.annualRevenueQar)], ["Annual profit", money(result.annualProfitQar)], ["CapEx", money(result.capexQar)], ["Annual OpEx", money(result.annualOpexQar)], ["Water", `${Math.round(result.waterM3).toLocaleString()} m³`], ["Energy", `${Math.round(result.energyKwh).toLocaleString()} kWh`], ["Site fit", result.siteFitPct === null ? "Baseline" : `${Math.round(result.siteFitPct)}%`]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="visual-card"><div className="subhead"><h4>Resource envelope</h4><span>used vs reference limit</span></div><ResponsiveContainer width="100%" height={120}><BarChart data={resourceData} layout="vertical" margin={{ top: 0, right: 12, left: 8, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5ebe6" /><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={48} tick={{ fontSize: 10, fill: "#6f7d77" }} /><Tooltip formatter={(value) => [`${value}`, "used"]} /><Bar dataKey="used" fill="#2d5b52" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer></div><div className="site-card"><div><span className="section-kicker">SITE CONDITIONS</span><h4>Climate + soil snapshot</h4></div>{siteData ? <><small>{siteData.source}</small><div className="site-grid"><span><b>{siteData.climate.temperatureC?.toFixed(1) ?? "—"}°C</b>temperature</span><span><b>{siteData.climate.solarKwhM2Day?.toFixed(1) ?? "—"}</b>kWh/m²/day solar</span><span><b>{siteData.climate.humidityPct?.toFixed(0) ?? "—"}%</b>humidity</span><span><b>{siteData.climate.windMps?.toFixed(1) ?? "—"} m/s</b>wind</span><span><b>{siteData.soil?.pH?.toFixed(1) ?? "—"}</b>soil pH</span><span><b>{siteData.nearby?.markets ?? "—"}</b>nearby markets</span><span><b>{siteData.nearby?.roads ?? "—"}</b>roads in 3 km</span><span><b>{siteData.qatarDatasets?.length ?? "—"}</b>Qatar datasets found</span></div></> : <small>Loading NASA POWER, SoilGrids, Qatar Open Data, and OpenStreetMap context…</small>}</div><div className="portfolio"><div className="subhead"><h4>Portfolio</h4><span>{Math.round(result.totalAreaM2).toLocaleString()} m² usable</span></div>{result.allocations.map((item) => <div className="allocation" key={`${item.cropId}-${item.techniqueId}`}><span className="allocation-bar" style={{ width: `${item.percentage * 100}%`, background: CROPS.find((crop) => crop.id === item.cropId)?.color }} /><div><strong>{CROPS.find((crop) => crop.id === item.cropId)?.name}</strong><small>{TECHNIQUES.find((technique) => technique.id === item.techniqueId)?.name}</small></div><b>{Math.round(item.percentage * 100)}%</b></div>)}</div><div className="why"><h4>Why this layout?</h4>{result.explanations.slice(0, 4).map((explanation) => <p key={explanation}><span>↗</span>{explanation}</p>)}</div></div>;
}
