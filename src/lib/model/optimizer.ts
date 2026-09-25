import { CROPS, MODEL_ASSUMPTIONS, TECHNIQUES, type CropId, type TechniqueId } from "./assumptions";

export type SiteContext = { temperatureC?: number | null; soilPh?: number | null; windMps?: number | null };
export type Allocation = { cropId: CropId; techniqueId: TechniqueId; areaM2: number; percentage: number; annualYieldKg: number; annualRevenueQar: number; annualOpexQar: number; capexQar: number; waterM3: number; energyKwh: number; siteFit: number };
export type OptimizerInput = { areaM2: number; budgetQar: number; waterLimitM3: number; energyLimitKwh: number; crops: readonly CropId[]; techniques: readonly TechniqueId[]; priceOverrides?: Partial<Record<CropId, number>>; siteContext?: SiteContext };
export type PortfolioResult = { allocations: Allocation[]; totalAreaM2: number; capexQar: number; annualOpexQar: number; annualRevenueQar: number; annualProfitQar: number; annualYieldKg: number; waterM3: number; energyKwh: number; paybackYears: number; roi5Year: number; sharedInfrastructureQar: number; siteFitPct: number | null; siteContextUsed: boolean; explanations: string[] };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function siteSuitability(input: OptimizerInput, cropId: CropId, techniqueId: TechniqueId) {
  if (!input.siteContext) return 1;

  const crop = CROPS.find((item) => item.id === cropId)!;
  const temperatureRange = crop.temperature.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const [minTemp, maxTemp] = temperatureRange;

  let temperatureFit = 1;
  if (Number.isFinite(input.siteContext.temperatureC) && Number.isFinite(minTemp) && Number.isFinite(maxTemp)) {
    const temperature = input.siteContext.temperatureC as number;
    const distance = temperature < minTemp ? minTemp - temperature : temperature > maxTemp ? temperature - maxTemp : 0;
    const protection = techniqueId === "open-field" ? 1 : techniqueId === "greenhouse" ? 0.55 : techniqueId === "hydroponic" ? 0.35 : 0.25;
    temperatureFit = clamp(1 - distance * 0.055 * protection, 0.6, 1);
  }

  let soilFit = 1;
  if (Number.isFinite(input.siteContext.soilPh)) {
    const ph = input.siteContext.soilPh as number;
    const distance = ph < 5.8 ? 5.8 - ph : ph > 7.2 ? ph - 7.2 : 0;
    const soilDependency = techniqueId === "open-field" ? 1 : techniqueId === "greenhouse" ? 0.5 : 0.1;
    soilFit = clamp(1 - distance * 0.11 * soilDependency, 0.65, 1);
  }

  let windFit = 1;
  if (Number.isFinite(input.siteContext.windMps)) {
    const excess = Math.max(0, (input.siteContext.windMps as number) - 4.5);
    const windExposure = techniqueId === "open-field" ? 1 : techniqueId === "greenhouse" ? 0.45 : techniqueId === "hydroponic" ? 0.35 : 0.25;
    windFit = clamp(1 - excess * 0.04 * windExposure, 0.7, 1);
  }

  return 0.55 * temperatureFit + 0.3 * soilFit + 0.15 * windFit;
}

function economics(input: OptimizerInput, cropId: CropId, techniqueId: TechniqueId, areaM2: number) {
  const crop = CROPS.find((item) => item.id === cropId)!;
  const technique = TECHNIQUES.find((item) => item.id === techniqueId)!;
  const price = input.priceOverrides?.[cropId] ?? crop.priceQarPerKg;
  const annualYieldKg = areaM2 * crop.baselineYieldKgM2 * technique.yieldMultiplier;
  return { annualYieldKg, annualRevenueQar: annualYieldKg * price, annualOpexQar: areaM2 * technique.opexPerM2, capexQar: areaM2 * technique.capexPerM2, waterM3: annualYieldKg * crop.waterLPerKg * technique.waterMultiplier / 1000, energyKwh: areaM2 * technique.energyKwhM2 };
}

export function optimizePortfolio(input: OptimizerInput): PortfolioResult {
  const valid = input.crops.flatMap((cropId) => input.techniques.flatMap((techniqueId) => {
    const technique = TECHNIQUES.find((item) => item.id === techniqueId)!;
    return technique.compatibleCrops.includes(cropId) ? [{ cropId, techniqueId }] : [];
  }));
  if (!valid.length) throw new Error("Choose at least one compatible crop and technique.");

  const usableArea = Math.max(0, input.areaM2 * 0.94);
  const scored = valid.map((item) => {
    const sample = economics(input, item.cropId, item.techniqueId, 1);
    const economicScore = (sample.annualRevenueQar * 5 - sample.capexQar - sample.annualOpexQar * 5) / Math.max(sample.capexQar, 1);
    const siteFit = siteSuitability(input, item.cropId, item.techniqueId);
    const sitePenalty = (1 - siteFit) * Math.max(Math.abs(economicScore), 1) * 0.5;
    const score = economicScore - sitePenalty;
    return { ...item, score, siteFit };
  }).sort((a, b) => b.score - a.score);

  const allocations: Allocation[] = [];
  let remaining = usableArea;
  const slice = Math.min(usableArea * 0.42, remaining);

  for (const item of scored) {
    if (remaining <= 0.5 || allocations.length >= 4) break;
    const technique = TECHNIQUES.find((tech) => tech.id === item.techniqueId)!;
    const area = Math.min(remaining, Math.max(technique.minimumAreaM2, slice / Math.max(1, allocations.length + 1)));
    const metrics = economics(input, item.cropId, item.techniqueId, area);
    allocations.push({ cropId: item.cropId, techniqueId: item.techniqueId, siteFit: item.siteFit, areaM2: area, percentage: usableArea > 0 ? area / usableArea : 0, ...metrics });
    remaining -= area;
  }

  if (remaining > 0.5 && allocations.length) {
    const first = allocations[0];
    const extra = economics(input, first.cropId, first.techniqueId, remaining);
    const newArea = first.areaM2 + remaining;
    Object.assign(first, {
      areaM2: newArea,
      annualYieldKg: first.annualYieldKg + extra.annualYieldKg,
      annualRevenueQar: first.annualRevenueQar + extra.annualRevenueQar,
      annualOpexQar: first.annualOpexQar + extra.annualOpexQar,
      capexQar: first.capexQar + extra.capexQar,
      waterM3: first.waterM3 + extra.waterM3,
      energyKwh: first.energyKwh + extra.energyKwh,
      percentage: usableArea > 0 ? newArea / usableArea : 0,
    });
  }

  const candidateCapex = allocations.reduce((sum, item) => sum + item.capexQar, 0);
  const candidateWater = allocations.reduce((sum, item) => sum + item.waterM3, 0);
  const candidateEnergy = allocations.reduce((sum, item) => sum + item.energyKwh, 0);

  const plannedInfrastructureTypes = new Set(allocations.map((allocation) => TECHNIQUES.find((technique) => technique.id === allocation.techniqueId)!.infrastructure));
  const plannedSharedInfrastructureQar =
    (plannedInfrastructureTypes.has("water") || plannedInfrastructureTypes.has("water-energy") || plannedInfrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedWaterInfrastructureQar : 0) +
    (plannedInfrastructureTypes.has("water-energy") || plannedInfrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedEnergyInfrastructureQar : 0) +
    (plannedInfrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedCoolingInfrastructureQar : 0);
  const fixedInfrastructureQar = plannedSharedInfrastructureQar * (1 - MODEL_ASSUMPTIONS.sharedInfrastructureDiscount);

  if (input.budgetQar < fixedInfrastructureQar) {
    return {
      allocations: [],
      totalAreaM2: 0,
      capexQar: 0,
      annualOpexQar: 0,
      annualRevenueQar: 0,
      annualProfitQar: 0,
      annualYieldKg: 0,
      waterM3: 0,
      energyKwh: 0,
      paybackYears: Infinity,
      roi5Year: 0,
      sharedInfrastructureQar: 0,
      siteFitPct: input.siteContext ? 0 : null,
      siteContextUsed: Boolean(input.siteContext),
      explanations: [
        `No feasible portfolio fits the QAR ${input.budgetQar.toLocaleString()} budget with the selected production systems.`,
        "Increase the budget or choose a lower-infrastructure production system.",
      ],
    };
  }

  const resourceScale = Math.min(
    1,
    Math.max(0, input.budgetQar - fixedInfrastructureQar) / Math.max(candidateCapex, 1),
    input.waterLimitM3 / Math.max(candidateWater, 1),
    input.energyLimitKwh / Math.max(candidateEnergy, 1),
  );

  if (resourceScale < 1) {
    allocations.forEach((item) => {
      item.areaM2 *= resourceScale;
      item.percentage *= resourceScale;
      item.annualYieldKg *= resourceScale;
      item.annualRevenueQar *= resourceScale;
      item.annualOpexQar *= resourceScale;
      item.capexQar *= resourceScale;
      item.waterM3 *= resourceScale;
      item.energyKwh *= resourceScale;
    });
  }

  const infrastructureTypes = new Set(allocations.map((allocation) => TECHNIQUES.find((technique) => technique.id === allocation.techniqueId)!.infrastructure));
  const sharedInfrastructureQar =
    (infrastructureTypes.has("water") || infrastructureTypes.has("water-energy") || infrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedWaterInfrastructureQar : 0) +
    (infrastructureTypes.has("water-energy") || infrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedEnergyInfrastructureQar : 0) +
    (infrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedCoolingInfrastructureQar : 0);

  const capexQar = allocations.reduce((sum, item) => sum + item.capexQar, 0) + sharedInfrastructureQar * (1 - MODEL_ASSUMPTIONS.sharedInfrastructureDiscount);
  const annualOpexQar = allocations.reduce((sum, item) => sum + item.annualOpexQar, 0);
  const annualRevenueQar = allocations.reduce((sum, item) => sum + item.annualRevenueQar, 0);
  const annualProfitQar = annualRevenueQar - annualOpexQar - allocations.reduce((sum, item) => sum + item.waterM3 * MODEL_ASSUMPTIONS.waterCostQarM3 + item.energyKwh * MODEL_ASSUMPTIONS.electricityCostQarKwh, 0);
  const waterM3 = allocations.reduce((sum, item) => sum + item.waterM3, 0);
  const energyKwh = allocations.reduce((sum, item) => sum + item.energyKwh, 0);
  const riskPenalty = allocations.length && Math.max(...allocations.map((item) => item.percentage)) > MODEL_ASSUMPTIONS.concentrationRiskThreshold ? 0.06 : 0;
  const roi5Year = (annualProfitQar * 5 - capexQar) / Math.max(capexQar, 1) - riskPenalty;

  const lead = allocations[0];
  const leadCrop = lead ? CROPS.find((crop) => crop.id === lead.cropId)?.name : "The lead crop";
  const leadTechnique = lead ? TECHNIQUES.find((technique) => technique.id === lead.techniqueId)?.name : "production system";
  const usesHydroponics = allocations.some((item) => item.techniqueId === "hydroponic" || item.techniqueId === "vertical");

  const siteFitPct = input.siteContext && allocations.length
    ? allocations.reduce((sum, item) => sum + item.siteFit * item.areaM2, 0) / Math.max(allocations.reduce((sum, item) => sum + item.areaM2, 0), 1) * 100
    : null;

  const explanations = [
    siteFitPct !== null
      ? `${leadCrop} with ${leadTechnique} leads after combining economics with an explainable site-fit score (${Math.round(siteFitPct)}% portfolio fit).`
      : `${leadCrop} with ${leadTechnique} receives the highest-value block under the current assumptions.`,
    usesHydroponics
      ? "Hydroponic production appears in the portfolio where its lower water demand can justify higher energy and capital intensity."
      : "The selected portfolio favors non-hydroponic systems under the current crop, budget, water and energy limits.",
    `Shared infrastructure is modelled with a ${Math.round(MODEL_ASSUMPTIONS.sharedInfrastructureDiscount * 100)}% prototype discount.`,
    resourceScale < 1
      ? "The initial allocation was scaled down to remain inside the selected budget, water and energy limits."
      : `The plan stays within the QAR ${input.budgetQar.toLocaleString()} budget and selected resource limits.`,
  ];

  return {
    allocations,
    totalAreaM2: allocations.reduce((sum, item) => sum + item.areaM2, 0),
    capexQar,
    annualOpexQar,
    annualRevenueQar,
    annualProfitQar,
    annualYieldKg: allocations.reduce((sum, item) => sum + item.annualYieldKg, 0),
    waterM3,
    energyKwh,
    paybackYears: annualProfitQar > 0 ? capexQar / annualProfitQar : Infinity,
    roi5Year,
    sharedInfrastructureQar,
    siteFitPct,
    siteContextUsed: Boolean(input.siteContext),
    explanations,
  };
}
