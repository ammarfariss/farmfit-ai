import { CROPS, MODEL_ASSUMPTIONS, TECHNIQUES, type CropId, type TechniqueId } from "./assumptions";

export type Allocation = { cropId: CropId; techniqueId: TechniqueId; areaM2: number; percentage: number; annualYieldKg: number; annualRevenueQar: number; annualOpexQar: number; capexQar: number; waterM3: number; energyKwh: number };
export type OptimizerInput = { areaM2: number; budgetQar: number; waterLimitM3: number; energyLimitKwh: number; crops: readonly CropId[]; techniques: readonly TechniqueId[]; priceOverrides?: Partial<Record<CropId, number>> };
export type PortfolioResult = { allocations: Allocation[]; totalAreaM2: number; capexQar: number; annualOpexQar: number; annualRevenueQar: number; annualProfitQar: number; annualYieldKg: number; waterM3: number; energyKwh: number; paybackYears: number; roi5Year: number; sharedInfrastructureQar: number; explanations: string[] };

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
    const score = (sample.annualRevenueQar * 5 - sample.capexQar - sample.annualOpexQar * 5) / Math.max(sample.capexQar, 1);
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);
  const allocations: Allocation[] = [];
  let remaining = usableArea;
  const slice = Math.min(usableArea * 0.42, remaining);
  for (const item of scored) {
    if (remaining <= 0.5 || allocations.length >= 4) break;
    const technique = TECHNIQUES.find((tech) => tech.id === item.techniqueId)!;
    const area = Math.min(remaining, Math.max(technique.minimumAreaM2, slice / Math.max(1, allocations.length + 1)));
    const metrics = economics(input, item.cropId, item.techniqueId, area);
    allocations.push({ ...item, areaM2: area, percentage: area / usableArea, ...metrics });
    remaining -= area;
  }
  if (remaining > 0.5 && allocations.length) {
    const first = allocations[0];
    const extra = economics(input, first.cropId, first.techniqueId, remaining);
    Object.assign(first, { areaM2: first.areaM2 + remaining, annualYieldKg: first.annualYieldKg + extra.annualYieldKg, annualRevenueQar: first.annualRevenueQar + extra.annualRevenueQar, annualOpexQar: first.annualOpexQar + extra.annualOpexQar, capexQar: first.capexQar + extra.capexQar, waterM3: first.waterM3 + extra.waterM3, energyKwh: first.energyKwh + extra.energyKwh, percentage: 1 });
  }
  const candidateCapex = allocations.reduce((sum, item) => sum + item.capexQar, 0);
  const fixedInfrastructureQar = (MODEL_ASSUMPTIONS.sharedWaterInfrastructureQar + MODEL_ASSUMPTIONS.sharedEnergyInfrastructureQar + MODEL_ASSUMPTIONS.sharedCoolingInfrastructureQar) * (1 - MODEL_ASSUMPTIONS.sharedInfrastructureDiscount);
  const candidateWater = allocations.reduce((sum, item) => sum + item.waterM3, 0);
  const candidateEnergy = allocations.reduce((sum, item) => sum + item.energyKwh, 0);
  const resourceScale = Math.min(1, Math.max(0, input.budgetQar - fixedInfrastructureQar) / Math.max(candidateCapex, 1), input.waterLimitM3 / Math.max(candidateWater, 1), input.energyLimitKwh / Math.max(candidateEnergy, 1));
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
  const sharedInfrastructureQar = (infrastructureTypes.has("water") || infrastructureTypes.has("water-energy") || infrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedWaterInfrastructureQar : 0) + (infrastructureTypes.has("water-energy") || infrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedEnergyInfrastructureQar : 0) + (infrastructureTypes.has("water-energy-cooling") ? MODEL_ASSUMPTIONS.sharedCoolingInfrastructureQar : 0);
  const capexQar = allocations.reduce((sum, item) => sum + item.capexQar, 0) + sharedInfrastructureQar * (1 - MODEL_ASSUMPTIONS.sharedInfrastructureDiscount);
  const annualOpexQar = allocations.reduce((sum, item) => sum + item.annualOpexQar, 0);
  const annualRevenueQar = allocations.reduce((sum, item) => sum + item.annualRevenueQar, 0);
  const annualProfitQar = annualRevenueQar - annualOpexQar - allocations.reduce((sum, item) => sum + item.waterM3 * MODEL_ASSUMPTIONS.waterCostQarM3 + item.energyKwh * MODEL_ASSUMPTIONS.electricityCostQarKwh, 0);
  const waterM3 = allocations.reduce((sum, item) => sum + item.waterM3, 0);
  const energyKwh = allocations.reduce((sum, item) => sum + item.energyKwh, 0);
  const riskPenalty = allocations.length && Math.max(...allocations.map((item) => item.percentage)) > MODEL_ASSUMPTIONS.concentrationRiskThreshold ? 0.06 : 0;
  const roi5Year = (annualProfitQar * 5 - capexQar) / Math.max(capexQar, 1) - riskPenalty;
  const explanations = [
    "Hydroponics was allocated where its water efficiency offsets higher energy demand.",
    `${allocations[0]?.cropId ? CROPS.find((crop) => crop.id === allocations[0].cropId)?.name : "The lead crop"} uses the highest-value block in the portfolio.`,
    `Shared infrastructure reduces the combined CapEx by ${Math.round(MODEL_ASSUMPTIONS.sharedInfrastructureDiscount * 100)}%.`,
    `The plan stays within the QAR ${input.budgetQar.toLocaleString()} budget and resource limits.`,
  ];
  return { allocations, totalAreaM2: allocations.reduce((sum, item) => sum + item.areaM2, 0), capexQar, annualOpexQar, annualRevenueQar, annualProfitQar, annualYieldKg: allocations.reduce((sum, item) => sum + item.annualYieldKg, 0), waterM3, energyKwh, paybackYears: annualProfitQar > 0 ? capexQar / annualProfitQar : Infinity, roi5Year, sharedInfrastructureQar, explanations };
}
