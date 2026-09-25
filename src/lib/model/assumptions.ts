export type CropId = "tomato" | "cucumber" | "lettuce" | "pepper" | "strawberry";
export type TechniqueId = "open-field" | "greenhouse" | "hydroponic" | "vertical";

export type Crop = {
  id: CropId;
  name: string;
  color: string;
  baselineYieldKgM2: number;
  waterLPerKg: number;
  season: string;
  temperature: string;
  salinityTolerance: "low" | "medium" | "high";
  priceQarPerKg: number;
  harvestCycleDays: number;
  source: string;
};

export type Technique = {
  id: TechniqueId;
  name: string;
  capexPerM2: number;
  opexPerM2: number;
  waterMultiplier: number;
  energyKwhM2: number;
  yieldMultiplier: number;
  compatibleCrops: CropId[];
  minimumAreaM2: number;
  infrastructure: "none" | "water" | "water-energy" | "water-energy-cooling";
};

export const CROPS: Crop[] = [
  { id: "tomato", name: "Tomato", color: "#d45c43", baselineYieldKgM2: 18, waterLPerKg: 90, season: "Sep–May", temperature: "18–30°C", salinityTolerance: "medium", priceQarPerKg: 5.5, harvestCycleDays: 90, source: "Qatar baseline + prototype assumption" },
  { id: "cucumber", name: "Cucumber", color: "#5e9b62", baselineYieldKgM2: 22, waterLPerKg: 55, season: "Oct–Apr", temperature: "18–32°C", salinityTolerance: "medium", priceQarPerKg: 4.2, harvestCycleDays: 70, source: "Qatar baseline + prototype assumption" },
  { id: "lettuce", name: "Lettuce", color: "#8bbd71", baselineYieldKgM2: 12, waterLPerKg: 25, season: "Oct–Apr", temperature: "12–26°C", salinityTolerance: "low", priceQarPerKg: 6.8, harvestCycleDays: 45, source: "Prototype assumption" },
  { id: "pepper", name: "Bell pepper", color: "#e0a447", baselineYieldKgM2: 16, waterLPerKg: 75, season: "Sep–May", temperature: "20–30°C", salinityTolerance: "medium", priceQarPerKg: 7.2, harvestCycleDays: 100, source: "Prototype assumption" },
  { id: "strawberry", name: "Strawberry", color: "#b94d69", baselineYieldKgM2: 9, waterLPerKg: 35, season: "Nov–Mar", temperature: "12–24°C", salinityTolerance: "low", priceQarPerKg: 18, harvestCycleDays: 80, source: "Prototype assumption" },
];

export const TECHNIQUES: Technique[] = [
  { id: "open-field", name: "Open field", capexPerM2: 55, opexPerM2: 18, waterMultiplier: 1, energyKwhM2: 1.2, yieldMultiplier: 0.82, compatibleCrops: ["tomato", "cucumber", "lettuce", "pepper"], minimumAreaM2: 500, infrastructure: "water" },
  { id: "greenhouse", name: "Conventional greenhouse", capexPerM2: 380, opexPerM2: 62, waterMultiplier: 0.68, energyKwhM2: 12, yieldMultiplier: 1.45, compatibleCrops: ["tomato", "cucumber", "pepper", "strawberry"], minimumAreaM2: 350, infrastructure: "water-energy" },
  { id: "hydroponic", name: "Hydroponic greenhouse", capexPerM2: 620, opexPerM2: 78, waterMultiplier: 0.32, energyKwhM2: 18, yieldMultiplier: 1.85, compatibleCrops: ["tomato", "cucumber", "lettuce", "pepper", "strawberry"], minimumAreaM2: 220, infrastructure: "water-energy-cooling" },
  { id: "vertical", name: "Vertical hydroponics", capexPerM2: 980, opexPerM2: 115, waterMultiplier: 0.2, energyKwhM2: 42, yieldMultiplier: 2.8, compatibleCrops: ["lettuce", "strawberry"], minimumAreaM2: 120, infrastructure: "water-energy-cooling" },
];

export const MODEL_ASSUMPTIONS = {
  usableAreaFactor: 0.94,
  usableSetbackM: 3,
  sharedWaterInfrastructureQar: 24000,
  sharedEnergyInfrastructureQar: 42000,
  sharedCoolingInfrastructureQar: 35000,
  sharedInfrastructureDiscount: 0.18,
  concentrationRiskThreshold: 0.55,
  concentrationRiskPenalty: 0.06,
  economicScoreWeight: 0.6,
  siteScoreWeight: 0.4,
  defaultBudgetQar: 500000,
  defaultWaterLimitM3: 22000,
  defaultEnergyLimitKwh: 130000,
  waterCostQarM3: 2.5,
  electricityCostQarKwh: 0.22,
};
