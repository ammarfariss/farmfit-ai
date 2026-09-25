"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CROPS, MODEL_ASSUMPTIONS, TECHNIQUES, type CropId, type TechniqueId } from "@/lib/model/assumptions";
import { DEMO_PLOTS } from "@/lib/data/demo-plots";
import { optimizePortfolio, type PortfolioResult, type SiteContext } from "@/lib/model/optimizer";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const FarmMap = dynamic(() => import("@/components/FarmMap"), { ssr: false });
const money = (value: number) => `QAR ${Math.round(value).toLocaleString()}`;

type SourceStatus = { nasa: boolean; osm: boolean; soil: boolean; qatar: boolean };
type SiteData = {
  source: string;
  climate: { temperatureC: number | null; solarKwhM2Day: number | null; humidityPct: number | null; windMps: number | null };
  nearby?: { markets: number; roads: number };
  soil?: { pH: number | null; source: string };
  qatarDatasets?: Array<{ id: string; title: string }>;
  sourceStatus?: SourceStatus;
  warning?: string;
};

const finite = (value: number | null | undefined): value is number => typeof value === "number" && Number.isFinite(value);

export default function Home() {
  const [step, setStep] = useState(0);
  const [selectedPlots, setSelectedPlots] = useState(["plot-a"]);
  const [crops, setCrops] = useState<CropId[]>(["tomato", "lettuce", "cucumber"]);
  const [techniques, setTechniques] = useState<TechniqueId[]>(["greenhouse", "hydroponic", "open-field"]);
  const [budget, setBudget] = useState(MODEL_ASSUMPTIONS.defaultBudgetQar);
  const [water, setWater] = useState(MODEL_ASSUMPTIONS.defaultWaterLimitM3);
  const [energy, setEnergy] = useState(MODEL_ASSUMPTIONS.defaultEnergyLimitKwh);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [siteLoading, setSiteLoading] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const selectedPlot = useMemo(() => DEMO_PLOTS.features.find((plot) => plot.properties?.id === selectedPlots[0]) ?? DEMO_PLOTS.features[0], [selectedPlots]);
  const areaM2 = selectedPlot.properties?.areaM2 ?? 0;

  const selectPlot = useCallback((id: string) => {
    setSelectedPlots([id]);
    setResult(null);
    setRunError(null);
  }, []);

  const setMapSelection = useCallback((ids: string[]) => {
    if (ids[0]) selectPlot(ids[0]);
  }, [selectPlot]);

  useEffect(() => {
    const plot = DEMO_PLOTS.features.find((feature) => selectedPlots.includes(feature.properties!.id));
    if (!plot?.properties?.centroid) {
      setSiteData(null);
      return;
    }

    const controller = new AbortController();
    const [longitude, latitude] = plot.properties.centroid;
    setSiteLoading(true);

    fetch(`/api/site-data?lat=${latitude}&lon=${longitude}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setSiteData(data))
      .catch((error) => {
        if (error instanceof Error && error.name !== "AbortError") setSiteData(null);
      })
      .finally(() => setSiteLoading(false));

    return () => controller.abort();
  }, [selectedPlots]);

  const liveSourceCount = siteData?.sourceStatus ? Object.values(siteData.sourceStatus).filter(Boolean).length : 0;

  const run = () => {
    setRunError(null);

    const nasaLive = siteData?.sourceStatus?.nasa ?? siteData?.source === "NASA POWER climatology";
    const soilLive = siteData?.sourceStatus?.soil ?? finite(siteData?.soil?.pH);
    const context: SiteContext = {
      temperatureC: nasaLive ? siteData?.climate.temperatureC ?? null : null,
      windMps: nasaLive ? siteData?.climate.windMps ?? null : null,
      soilPh: soilLive ? siteData?.soil?.pH ?? null : null,
    };
    const hasLiveContext = finite(context.temperatureC) || finite(context.windMps) || finite(context.soilPh);

    try {
      setResult(optimizePortfolio({
        areaM2,
        budgetQar: budget,
        waterLimitM3: water,
        energyLimitKwh: energy,
        crops,
        techniques,
        siteContext: hasLiveContext ? context : undefined,
      }));
      setStep(3);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "Unable to generate this plan.");
    }
  };

  const toggle = <T extends string>(value: T, values: T[], setter: (next: T[]) => void) => {
    setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
    setResult(null);
  };

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">FF</span><span>Farm<em>Fit</em></span></div>
      <span className="demo-pill">Open-source hackathon MVP · scenario estimates</span>
    </header>

    {step === 0 && <section className="landing">
      <div className="eyebrow">QATAR · SITE SUITABILITY + FARM PORTFOLIO DESIGN</div>
      <h1>Design the farm.<br /><span>Don&apos;t guess the farm.</span></h1>
      <p className="lead">Explainable decision intelligence that combines site conditions, crop-system economics, land, budget, water and energy into one farm blueprint.</p>
      <button className="primary-button" onClick={() => setStep(1)}>Build a farm plan <span>→</span></button>
      <div className="value-strip">
        <span><b>Site-aware</b>NASA POWER + SoilGrids</span>
        <span><b>Resource-constrained</b>Budget · water · energy</span>
        <span><b>Transparent</b>Open source + explainable logic</span>
      </div>
      <div className="landing-note"><strong>FarmFit designs the portfolio, not just the crop.</strong><span>Prototype assumptions are visible and replaceable.</span></div>
    </section>}

    {step > 0 && <div className="workspace">
      <aside className="sidebar">
        <div className="step-label">FARM PLAN / 0{Math.min(step, 3)}</div>
        <h2>{result ? "Your farm blueprint" : "Build your plan"}</h2>

        {step < 3 && <div className="stepper">
          {["Select site", "Choose options", "Set limits"].map((label, index) => <button key={label} className={step === index + 1 ? "active" : step > index + 1 ? "complete" : ""} onClick={() => setStep(index + 1)}><span>{index + 1}</span>{label}</button>)}
        </div>}

        {step === 1 && <div className="form-section">
          <p className="section-kicker">STEP 01</p>
          <h3>Select a representative site</h3>
          <p className="muted">Choose one demo farm plot near Al Khor. Keeping the MVP site-specific makes the environmental recommendation traceable.</p>
          <div className="plot-list">{DEMO_PLOTS.features.map((plot) => {
            const id = plot.properties!.id;
            const checked = selectedPlots.includes(id);
            return <button key={id} className={`plot-option ${checked ? "selected" : ""}`} onClick={() => selectPlot(id)}>
              <span className="checkbox">{checked ? "✓" : ""}</span>
              <span><strong>{plot.properties!.name}</strong><small>{plot.properties!.areaM2.toLocaleString()} m² · representative demo GIS</small></span>
            </button>;
          })}</div>
          <div className="area-total"><span>Selected land</span><strong>{areaM2.toLocaleString()} m²</strong></div>
          <button className="primary-button full" onClick={() => setStep(2)}>Continue <span>→</span></button>
        </div>}

        {step === 2 && <div className="form-section">
          <p className="section-kicker">STEP 02</p>
          <h3>Choose the decision space</h3>
          <p className="muted">FarmFit compares compatible crop × production-system combinations rather than recommending one crop in isolation.</p>
          <label className="field-label">Crops</label>
          <div className="choice-grid">{CROPS.map((crop) => <button key={crop.id} className={`choice ${crops.includes(crop.id) ? "selected" : ""}`} onClick={() => toggle(crop.id, crops, setCrops)}><i style={{ background: crop.color }} />{crop.name}</button>)}</div>
          <label className="field-label">Production systems</label>
          <div className="choice-grid">{TECHNIQUES.map((technique) => <button key={technique.id} className={`choice ${techniques.includes(technique.id) ? "selected" : ""}`} onClick={() => toggle(technique.id, techniques, setTechniques)}><i className="tech-dot" />{technique.name}</button>)}</div>
          <button className="primary-button full" disabled={!crops.length || !techniques.length} onClick={() => setStep(3)}>Continue <span>→</span></button>
        </div>}

        {step === 3 && !result && <div className="form-section">
          <p className="section-kicker">STEP 03</p>
          <h3>Set hard limits</h3>
          <p className="muted">The engine never spends or consumes beyond the limits you enter. Financial and agronomic parameters remain prototype assumptions.</p>
          {[["Budget (QAR)", budget, setBudget, 10000], ["Water limit (m³ / year)", water, setWater, 100], ["Energy limit (kWh / year)", energy, setEnergy, 1000]].map(([label, value, setter, min]) => <label className="input-row" key={label as string}>
            <span>{label as string}<small>User constraint</small></span>
            <input type="number" min={min as number} value={value as number} onChange={(event) => (setter as (value: number) => void)(Math.max(0, Number(event.target.value)))} />
          </label>)}
          <div className={`data-readiness ${liveSourceCount ? "ready" : ""}`}>
            <span className="status-dot" />
            {siteLoading ? "Loading external site context…" : liveSourceCount ? `${liveSourceCount}/4 external sources ready · live site factors can influence ranking` : "External site sources unavailable · baseline optimization remains available"}
          </div>
          {runError && <p className="error-note">{runError}</p>}
          <button className="primary-button full" disabled={!crops.length || !techniques.length || areaM2 <= 0} onClick={run}>Optimize my farm <span>↗</span></button>
        </div>}

        {result && <ResultsPanel result={result} siteData={siteData} onReset={() => { setResult(null); setRunError(null); setStep(1); }} />}
      </aside>

      <section className="map-area"><FarmMap selectedPlots={selectedPlots} setSelectedPlots={setMapSelection} result={result} /></section>
    </div>}
  </main>;
}

function ResultsPanel({ result, siteData, onReset }: { result: PortfolioResult; siteData: SiteData | null; onReset: () => void }) {
  if (!result.allocations.length) {
    return <div className="results">
      <div className="result-head"><p className="section-kicker">NO FEASIBLE PORTFOLIO</p><h3>These constraints are too tight.</h3></div>
      <div className="infeasible-card">
        <strong>FarmFit refused to invent a solution.</strong>
        {result.explanations.map((explanation) => <p key={explanation}>{explanation}</p>)}
      </div>
      <button className="primary-button full" onClick={onReset}>Adjust the plan <span>→</span></button>
    </div>;
  }

  const resourceData = [
    { name: "Budget", usedPct: Math.round(result.constraintUtilization.budgetPct) },
    { name: "Water", usedPct: Math.round(result.constraintUtilization.waterPct) },
    { name: "Energy", usedPct: Math.round(result.constraintUtilization.energyPct) },
    { name: "Land", usedPct: Math.round(result.constraintUtilization.landPct) },
  ];
  const allocatedPct = result.availableAreaM2 > 0 ? result.totalAreaM2 / result.availableAreaM2 : 0;
  const unallocatedPct = Math.max(0, 1 - allocatedPct);
  const sourceCount = siteData?.sourceStatus ? Object.values(siteData.sourceStatus).filter(Boolean).length : 0;
  const bindingPct = result.constraintUtilization[`${result.bindingConstraint.toLowerCase()}Pct` as keyof typeof result.constraintUtilization] ?? 0;

  return <div className="results">
    <div className="result-head"><p className="section-kicker">OPTIMIZED PORTFOLIO</p><h3>Built around this site.</h3><button className="text-button" onClick={onReset}>Edit plan</button></div>

    <div className="metric-hero">
      <span>Scenario 5-year ROI</span>
      <strong>{Math.round(result.roi5Year * 100)}%</strong>
      <small>Payback in {Number.isFinite(result.paybackYears) ? `${result.paybackYears.toFixed(1)} years` : "not reached"} · estimate, not guarantee</small>
    </div>

    <div className="metric-grid">
      {[["Annual revenue", money(result.annualRevenueQar)], ["Annual profit", money(result.annualProfitQar)], ["CapEx", money(result.capexQar)], ["Annual OpEx", money(result.annualOpexQar)], ["Water", `${Math.round(result.waterM3).toLocaleString()} m³`], ["Energy", `${Math.round(result.energyKwh).toLocaleString()} kWh`], ["Site fit", result.siteFitPct === null ? "Baseline" : `${Math.round(result.siteFitPct)}%`], ["Yield", `${Math.round(result.annualYieldKg).toLocaleString()} kg/yr`], ["ROI if revenue -20%", `${Math.round(result.roi5YearRevenueStress * 100)}%`]].map(([label, value]) => <div className="metric" key={label}><span>{label}</span><strong>{value}</strong></div>)}
    </div>

    <div className="decision-card">
      <div className="subhead"><h4>Explainable decision trace</h4><span>why this plan won</span></div>
      <div className="decision-grid">
        <span><b>{result.siteContextUsed ? "Active" : "Baseline"}</b>site-aware ranking</span>
        <span><b>{result.bindingConstraint}</b>tightest constraint · {Math.round(Number(bindingPct))}%</span>
        <span><b>{result.allocations.length}</b>crop-system zones</span>
        <span><b>{Math.round(result.constraintUtilization.landPct)}%</b>usable land allocated</span>
      </div>
    </div>

    <div className="visual-card">
      <div className="subhead"><h4>Constraint envelope</h4><span>% of selected limit / capacity</span></div>
      <ResponsiveContainer width="100%" height={170}><BarChart data={resourceData} layout="vertical" margin={{ top: 5, right: 12, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5ebe6" />
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis dataKey="name" type="category" width={48} tick={{ fontSize: 10, fill: "#6f7d77" }} />
        <Tooltip formatter={(value) => [`${value}%`, "utilization"]} />
        <Bar dataKey="usedPct" fill="#2d5b52" radius={[0, 5, 5, 0]} />
      </BarChart></ResponsiveContainer>
    </div>

    <div className="site-card">
      <div><span className="section-kicker">SITE INTELLIGENCE</span><h4>Climate + soil snapshot</h4></div>
      {siteData ? <>
        <span className="source-badge">{sourceCount}/4 live sources</span>
        <div className="site-grid">
          <span><b>{siteData.climate.temperatureC?.toFixed(1) ?? "—"}°C</b>temperature</span>
          <span><b>{siteData.climate.solarKwhM2Day?.toFixed(1) ?? "—"}</b>kWh/m²/day solar</span>
          <span><b>{siteData.climate.humidityPct?.toFixed(0) ?? "—"}%</b>humidity</span>
          <span><b>{siteData.climate.windMps?.toFixed(1) ?? "—"} m/s</b>wind</span>
          <span><b>{siteData.soil?.pH?.toFixed(1) ?? "—"}</b>soil pH</span>
          <span><b>{siteData.nearby?.markets ?? "—"}</b>markets within 3 km</span>
          <span><b>{siteData.nearby?.roads ?? "—"}</b>major roads in 3 km</span>
          <span><b>{siteData.qatarDatasets?.length ?? "—"}</b>Qatar datasets found</span>
        </div>
        <small className="source-method">Scored in site fit: temperature · wind · soil pH. Context only: solar · market/road access · Qatar dataset discovery.</small>
        {siteData.warning && <small className="source-warning">{siteData.warning}</small>}
      </> : <small>External context unavailable; the baseline plan remains transparent.</small>}
    </div>

    <div className="portfolio">
      <div className="subhead"><h4>Land portfolio</h4><span>{Math.round(result.totalAreaM2).toLocaleString()} / {Math.round(result.availableAreaM2).toLocaleString()} m² allocated</span></div>
      {result.allocations.map((item) => <div className="allocation" key={`${item.cropId}-${item.techniqueId}`}>
        <span className="allocation-bar" style={{ width: `${item.percentage * 100}%`, background: CROPS.find((crop) => crop.id === item.cropId)?.color }} />
        <div><strong>{CROPS.find((crop) => crop.id === item.cropId)?.name}</strong><small>{TECHNIQUES.find((technique) => technique.id === item.techniqueId)?.name} · site fit {Math.round(item.siteFit * 100)}%</small></div>
        <b>{Math.round(item.percentage * 100)}%</b>
      </div>)}
      {unallocatedPct > 0.01 && <div className="allocation reserve">
        <span className="allocation-bar" style={{ width: `${unallocatedPct * 100}%`, background: "#d7ddd9" }} />
        <div><strong>Unallocated reserve</strong><small>Held back because {result.bindingConstraint.toLowerCase()} is the tightest constraint</small></div>
        <b>{Math.round(unallocatedPct * 100)}%</b>
      </div>}
    </div>

    <div className="why"><h4>Why this plan?</h4>{result.explanations.map((explanation) => <p key={explanation}><span>↗</span>{explanation}</p>)}</div>
    <p className="result-note">Decision-support prototype · values are scenario estimates from explicit, replaceable assumptions. The -20% revenue stress test keeps the same farm layout and changes revenue only.</p>
  </div>;
}
