import { CROPS, MODEL_ASSUMPTIONS, TECHNIQUES, type CropId, type TechniqueId } from "./assumptions";

export type SiteContext = { temperatureC?: number | null; soilPh?: number | null; windMps?: number | null };
export type ConstraintUtilization = { budgetPct: number; waterPct: number; energyPct: number; landPct: number };
export type Allocation = {
  cropId: CropId;
  techniqueId: TechniqueId;
  areaM2: number;
  percentage: number;
  annualYieldKg: number;
  annualRevenueQar: number;
  annualOpexQar: number;
  capexQar: number;
  waterM3: number;
  energyKwh: number;
  siteFit: number;
};
export type OptimizerInput = {
  areaM2: number;
  budgetQar: number;
  waterLimitM3: number;
  energyLimitKwh: number;
  crops: readonly CropId[];
  techniques: readonly TechniqueId[];
  priceOverrides?: Partial<Record<CropId, number>>;
  siteContext?: SiteContext;
};
export type PortfolioResult = {
  allocations: Allocation[];
  totalAreaM2: number;
  availableAreaM2: number;
  capexQar: number;
  annualOpexQar: number;
  annualRevenueQar: number;
  annualProfitQar: number;
  annualYieldKg: number;
  waterM3: number;
  energyKwh: number;
  paybackYears: number;
  roi5Year: number;
  sharedInfrastructureQar: number;
  siteFitPct: number | null;
  siteContextUsed: boolean;
  bindingConstraint: "Budget" | "Water" | "Energy" | "Land" | "Feasibility";
  constraintUtilization: ConstraintUtilization;
  explanations: string[];
};

type Candidate = { cropId: CropId; techniqueId: TechniqueId; economicScore: number; siteFit: number; score: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const finite = (value: number | null | undefined): value is number => typeof value === "number" && Number.isFinite(value);

function hasSiteContext(context?: SiteContext) {
  return Boolean(context && (finite(context.temperatureC) || finite(context.soilPh) || finite(context.windMps)));
}

function siteSuitability(input: OptimizerInput, cropId: CropId, techniqueId: TechniqueId) {
  if (!hasSiteContext(input.siteContext)) return 1;

  const crop = CROPS.find((item) => item.id === cropId)!;
  const temperatureRange = crop.temperature.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const [minTemp, maxTemp] = temperatureRange;

  let temperatureFit = 1;
  if (finite(input.siteContext?.temperatureC) && Number.isFinite(minTemp) && Number.isFinite(maxTemp)) {
    const temperature = input.siteContext!.temperatureC!;
    const distance = temperature < minTemp ? minTemp - temperature : temperature > maxTemp ? temperature - maxTemp : 0;
    const protection = techniqueId === "open-field" ? 1 : techniqueId === "greenhouse" ? 0.55 : techniqueId === "hydroponic" ? 0.35 : 0.25;
    temperatureFit = clamp(1 - distance * 0.055 * protection, 0.55, 1);
  }

  let soilFit = 1;
  if (finite(input.siteContext?.soilPh)) {
    const ph = input.siteContext!.soilPh!;
    const distance = ph < 5.8 ? 5.8 - ph : ph > 7.2 ? ph - 7.2 : 0;
    const soilDependency = techniqueId === "open-field" ? 1 : techniqueId === "greenhouse" ? 0.5 : 0.1;
    soilFit = clamp(1 - distance * 0.11 * soilDependency, 0.6, 1);
  }

  let windFit = 1;
  if (finite(input.siteContext?.windMps)) {
    const excess = Math.max(0, input.siteContext!.windMps! - 4.5);
    const windExposure = techniqueId === "open-field" ? 1 : techniqueId === "greenhouse" ? 0.45 : techniqueId === "hydroponic" ? 0.35 : 0.25;
    windFit = clamp(1 - excess * 0.04 * windExposure, 0.65, 1);
  }

  return 0.55 * temperatureFit + 0.3 * soilFit + 0.15 * windFit;
}

function economics(input: OptimizerInput, cropId: CropId, techniqueId: TechniqueId, areaM2: number) {
  const crop = CROPS.find((item) => item.id === cropId)!;
  const technique = TECHNIQUES.find((item) => item.id === techniqueId)!;
  const price = input.priceOverrides?.[cropId] ?? crop.priceQarPerKg;
  const annualYieldKg = areaM2 * crop.baselineYieldKgM2 * technique.yieldMultiplier;
  return {
    annualYieldKg,
    annualRevenueQar: annualYieldKg * price,
    annualOpexQar: areaM2 * technique.opexPerM2,
    capexQar: areaM2 * technique.capexPerM2,
    waterM3: annualYieldKg * crop.waterLPerKg * technique.waterMultiplier / 1000,
    energyKwh: areaM2 * technique.energyKwhM2,
  };
}

function rawInfrastructureCost(techniqueIds: readonly TechniqueId[]) {
  let water = false;
  let energy = false;
  let cooling = false;

  techniqueIds.forEach((id) => {
    const infrastructure = TECHNIQUES.find((item) => item.id === id)!.infrastructure;
    if (infrastructure === "water" || infrastructure === "water-energy" || infrastructure === "water-energy-cooling") water = true;
    if (infrastructure === "water-energy" || infrastructure === "water-energy-cooling") energy = true;
    if (infrastructure === "water-energy-cooling") cooling = true;
  });

  return (water ? MODEL_ASSUMPTIONS.sharedWaterInfrastructureQar : 0)
    + (energy ? MODEL_ASSUMPTIONS.sharedEnergyInfrastructureQar : 0)
    + (cooling ? MODEL_ASSUMPTIONS.sharedCoolingInfrastructureQar : 0);
}

function allocationTotals(allocations: readonly Allocation[]) {
  return allocations.reduce((sum, item) => ({
    areaM2: sum.areaM2 + item.areaM2,
    annualYieldKg: sum.annualYieldKg + item.annualYieldKg,
    annualRevenueQar: sum.annualRevenueQar + item.annualRevenueQar,
    annualOpexQar: sum.annualOpexQar + item.annualOpexQar,
    areaCapexQar: sum.areaCapexQar + item.capexQar,
    waterM3: sum.waterM3 + item.waterM3,
    energyKwh: sum.energyKwh + item.energyKwh,
  }), { areaM2: 0, annualYieldKg: 0, annualRevenueQar: 0, annualOpexQar: 0, areaCapexQar: 0, waterM3: 0, energyKwh: 0 });
}

function utilization(value: number, limit: number) {
  return limit > 0 ? clamp(value / limit * 100, 0, 100) : 0;
}

function emptyResult(input: OptimizerInput, usableArea: number, message: string): PortfolioResult {
  return {
    allocations: [],
    totalAreaM2: 0,
    availableAreaM2: usableArea,
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
    siteFitPct: null,
    siteContextUsed: hasSiteContext(input.siteContext),
    bindingConstraint: "Feasibility",
    constraintUtilization: { budgetPct: 0, waterPct: 0, energyPct: 0, landPct: 0 },
    explanations: [message, "Increase a limiting resource or choose a lower-cost production system."],
  };
}

export function optimizePortfolio(input: OptimizerInput): PortfolioResult {
  const validPairs = input.crops.flatMap((cropId) => input.techniques.flatMap((techniqueId) => {
    const technique = TECHNIQUES.find((item) => item.id === techniqueId)!;
    return technique.compatibleCrops.includes(cropId) ? [{ cropId, techniqueId }] : [];
  }));

  if (!validPairs.length) throw new Error("Choose at least one compatible crop and technique.");

  const usableArea = Math.max(0, input.areaM2 * MODEL_ASSUMPTIONS.usableAreaFactor);
  if (usableArea <= 0) return emptyResult(input, usableArea, "No usable land area is available for this plan.");

  const rawCandidates = validPairs.map((item) => {
    const sample = economics(input, item.cropId, item.techniqueId, 1);
    const economicScore = (sample.annualRevenueQar * 5 - sample.capexQar - sample.annualOpexQar * 5) / Math.max(sample.capexQar, 1);
    return { ...item, economicScore, siteFit: siteSuitability(input, item.cropId, item.techniqueId) };
  });

  const minEconomic = Math.min(...rawCandidates.map((item) => item.economicScore));
  const maxEconomic = Math.max(...rawCandidates.map((item) => item.economicScore));
  const span = Math.max(maxEconomic - minEconomic, 0.0001);

  const scored: Candidate[] = rawCandidates.map((item) => {
    const economicFit = (item.economicScore - minEconomic) / span;
    const score = MODEL_ASSUMPTIONS.economicScoreWeight * economicFit + MODEL_ASSUMPTIONS.siteScoreWeight * item.siteFit;
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);

  const allocations: Allocation[] = [];

  const canAddNewBlock = (candidate: Candidate, areaM2: number) => {
    const metrics = economics(input, candidate.cropId, candidate.techniqueId, areaM2);
    const current = allocationTotals(allocations);
    const nextTechniqueIds = [...allocations.map((item) => item.techniqueId), candidate.techniqueId];
    const infrastructureQar = rawInfrastructureCost(nextTechniqueIds) * (1 - MODEL_ASSUMPTIONS.sharedInfrastructureDiscount);
    return current.areaM2 + areaM2 <= usableArea + 0.001
      && current.areaCapexQar + metrics.capexQar + infrastructureQar <= input.budgetQar + 0.001
      && current.waterM3 + metrics.waterM3 <= input.waterLimitM3 + 0.001
      && current.energyKwh + metrics.energyKwh <= input.energyLimitKwh + 0.001;
  };

  for (const candidate of scored) {
    if (allocations.length >= 4) break;
    const technique = TECHNIQUES.find((item) => item.id === candidate.techniqueId)!;
    const minimumArea = technique.minimumAreaM2;
    if (minimumArea > usableArea || !canAddNewBlock(candidate, minimumArea)) continue;

    const metrics = economics(input, candidate.cropId, candidate.techniqueId, minimumArea);
    allocations.push({
      cropId: candidate.cropId,
      techniqueId: candidate.techniqueId,
      areaM2: minimumArea,
      percentage: minimumArea / usableArea,
      siteFit: candidate.siteFit,
      ...metrics,
    });
  }

  if (!allocations.length) {
    return emptyResult(input, usableArea, "No minimum viable crop-system block fits inside the selected land, budget, water and energy limits.");
  }

  const concentrationCapArea = allocations.length > 1 ? usableArea * MODEL_ASSUMPTIONS.concentrationRiskThreshold : usableArea;

  for (const allocation of allocations) {
    const current = allocationTotals(allocations);
    const infrastructureQar = rawInfrastructureCost(allocations.map((item) => item.techniqueId)) * (1 - MODEL_ASSUMPTIONS.sharedInfrastructureDiscount);
    const perM2 = economics(input, allocation.cropId, allocation.techniqueId, 1);

    const remainingLand = Math.max(0, usableArea - current.areaM2);
    const concentrationRoom = Math.max(0, concentrationCapArea - allocation.areaM2);
    const remainingBudget = Math.max(0, input.budgetQar - current.areaCapexQar - infrastructureQar);
    const remainingWater = Math.max(0, input.waterLimitM3 - current.waterM3);
    const remainingEnergy = Math.max(0, input.energyLimitKwh - current.energyKwh);

    const maxByBudget = perM2.capexQar > 0 ? remainingBudget / perM2.capexQar : Infinity;
    const maxByWater = perM2.waterM3 > 0 ? remainingWater / perM2.waterM3 : Infinity;
    const maxByEnergy = perM2.energyKwh > 0 ? remainingEnergy / perM2.energyKwh : Infinity;
    const extraArea = Math.max(0, Math.min(remainingLand, concentrationRoom, maxByBudget, maxByWater, maxByEnergy));

    if (extraArea <= 0.01) continue;
    const extra = economics(input, allocation.cropId, allocation.techniqueId, extraArea);
    allocation.areaM2 += extraArea;
    allocation.percentage = allocation.areaM2 / usableArea;
    allocation.annualYieldKg += extra.annualYieldKg;
    allocation.annualRevenueQar += extra.annualRevenueQar;
    allocation.annualOpexQar += extra.annualOpexQar;
    allocation.capexQar += extra.capexQar;
    allocation.waterM3 += extra.waterM3;
    allocation.energyKwh += extra.energyKwh;
  }

  const totals = allocationTotals(allocations);
  const sharedInfrastructureQar = rawInfrastructureCost(allocations.map((item) => item.techniqueId));
  const discountedInfrastructureQar = sharedInfrastructureQar * (1 - MODEL_ASSUMPTIONS.sharedInfrastructureDiscount);
  const capexQar = totals.areaCapexQar + discountedInfrastructureQar;
  const utilityCostQar = totals.waterM3 * MODEL_ASSUMPTIONS.waterCostQarM3 + totals.energyKwh * MODEL_ASSUMPTIONS.electricityCostQarKwh;
  const annualProfitQar = totals.annualRevenueQar - totals.annualOpexQar - utilityCostQar;

  const constraintUtilization: ConstraintUtilization = {
    budgetPct: utilization(capexQar, input.budgetQar),
    waterPct: utilization(totals.waterM3, input.waterLimitM3),
    energyPct: utilization(totals.energyKwh, input.energyLimitKwh),
    landPct: utilization(totals.areaM2, usableArea),
  };

  const constraintEntries = [
    ["Budget", constraintUtilization.budgetPct],
    ["Water", constraintUtilization.waterPct],
    ["Energy", constraintUtilization.energyPct],
    ["Land", constraintUtilization.landPct],
  ] as const;
  const [bindingConstraint, bindingPct] = constraintEntries.reduce((best, item) => item[1] > best[1] ? item : best);

  const maxAllocatedShare = totals.areaM2 > 0 ? Math.max(...allocations.map((item) => item.areaM2 / totals.areaM2)) : 0;
  const riskPenalty = maxAllocatedShare > MODEL_ASSUMPTIONS.concentrationRiskThreshold ? MODEL_ASSUMPTIONS.concentrationRiskPenalty : 0;
  const roi5Year = (annualProfitQar * 5 - capexQar) / Math.max(capexQar, 1) - riskPenalty;

  const siteContextUsed = hasSiteContext(input.siteContext);
  const siteFitPct = siteContextUsed && totals.areaM2 > 0
    ? allocations.reduce((sum, item) => sum + item.siteFit * item.areaM2, 0) / totals.areaM2 * 100
    : null;

  const lead = allocations[0];
  const leadCrop = CROPS.find((crop) => crop.id === lead.cropId)?.name ?? lead.cropId;
  const leadTechnique = TECHNIQUES.find((technique) => technique.id === lead.techniqueId)?.name ?? lead.techniqueId;

  const explanations = [
    siteFitPct !== null
      ? `${leadCrop} with ${leadTechnique} ranks first after combining economic value with an explainable site-fit score (${Math.round(siteFitPct)}% weighted portfolio fit).`
      : `${leadCrop} with ${leadTechnique} ranks first under the current economic and resource assumptions.`,
    `${bindingConstraint} is the tightest constraint at ${Math.round(bindingPct)}% utilization.`,
    allocations.length > 1
      ? `${allocations.length} crop-system zones are retained to diversify the plan where the constraints allow it.`
      : "Only one crop-system block is feasible under the current selections and constraints.",
    `Shared water, energy and cooling infrastructure is counted once, with the documented ${Math.round(MODEL_ASSUMPTIONS.sharedInfrastructureDiscount * 100)}% prototype sharing discount.`,
  ];

  return {
    allocations,
    totalAreaM2: totals.areaM2,
    availableAreaM2: usableArea,
    capexQar,
    annualOpexQar: totals.annualOpexQar,
    annualRevenueQar: totals.annualRevenueQar,
    annualProfitQar,
    annualYieldKg: totals.annualYieldKg,
    waterM3: totals.waterM3,
    energyKwh: totals.energyKwh,
    paybackYears: annualProfitQar > 0 ? capexQar / annualProfitQar : Infinity,
    roi5Year,
    sharedInfrastructureQar,
    siteFitPct,
    siteContextUsed,
    bindingConstraint,
    constraintUtilization,
    explanations,
  };
}
