import { describe, expect, it } from "vitest";
import { optimizePortfolio } from "./optimizer";
import { buildLayout } from "./geometry";
import { TECHNIQUES } from "./assumptions";
import { polygon } from "@turf/helpers";

describe("farm portfolio model", () => {
  const input = { areaM2: 10000, budgetQar: 500000, waterLimitM3: 22000, energyLimitKwh: 130000, crops: ["tomato", "lettuce", "cucumber"] as const, techniques: ["greenhouse", "hydroponic", "open-field"] as const };

  it("calculates positive scenario economics", () => {
    const result = optimizePortfolio(input);
    expect(result.annualRevenueQar).toBeGreaterThan(0);
    expect(result.annualProfitQar).toBeGreaterThan(0);
    expect(result.paybackYears).toBeGreaterThan(0);
  });

  it("keeps allocation inside usable land", () => {
    const result = optimizePortfolio(input);
    expect(result.availableAreaM2).toBeCloseTo(9400);
    expect(result.totalAreaM2).toBeLessThanOrEqual(result.availableAreaM2 + 0.001);
    expect(result.allocations.reduce((sum, item) => sum + item.percentage, 0)).toBeLessThanOrEqual(1.000001);
  });

  it("respects hard budget, water, and energy limits without post-scaling below minimum areas", () => {
    const result = optimizePortfolio({ ...input, budgetQar: 180000, waterLimitM3: 3500, energyLimitKwh: 25000 });
    expect(result.capexQar).toBeLessThanOrEqual(180000.01);
    expect(result.waterM3).toBeLessThanOrEqual(3500.01);
    expect(result.energyKwh).toBeLessThanOrEqual(25000.01);
    result.allocations.forEach((item) => {
      const minimum = TECHNIQUES.find((technique) => technique.id === item.techniqueId)!.minimumAreaM2;
      expect(item.areaM2).toBeGreaterThanOrEqual(minimum - 0.01);
    });
  });

  it("returns a clear infeasible result under an impossible budget", () => {
    const result = optimizePortfolio({ ...input, budgetQar: 10000 });
    expect(result.allocations).toHaveLength(0);
    expect(result.bindingConstraint).toBe("Feasibility");
    expect(result.explanations[0]).toContain("No minimum viable");
  });

  it("uses live site context in the explainable ranking path", () => {
    const result = optimizePortfolio({
      areaM2: 10000,
      budgetQar: 5000000,
      waterLimitM3: 100000,
      energyLimitKwh: 1000000,
      crops: ["lettuce"] as const,
      techniques: ["open-field", "hydroponic"] as const,
      siteContext: { temperatureC: 34, soilPh: 8.2, windMps: 7 },
    });
    const openField = result.allocations.find((item) => item.techniqueId === "open-field");
    const hydroponic = result.allocations.find((item) => item.techniqueId === "hydroponic");
    expect(result.siteContextUsed).toBe(true);
    expect(result.siteFitPct).not.toBeNull();
    expect(openField).toBeDefined();
    expect(hydroponic).toBeDefined();
    expect(hydroponic!.siteFit).toBeGreaterThan(openField!.siteFit);
  });

  it("reports a real binding constraint and bounded utilization", () => {
    const result = optimizePortfolio(input);
    expect(["Budget", "Water", "Energy", "Land"]).toContain(result.bindingConstraint);
    Object.values(result.constraintUtilization).forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    });
  });

  it("creates contiguous, non-overlapping rectangular blocks", () => {
    const plot = polygon([[[51.5, 25.7], [51.51, 25.7], [51.51, 25.71], [51.5, 25.71], [51.5, 25.7]]]);
    const blocks = buildLayout(plot, [{ cropId: "tomato", techniqueId: "greenhouse", percentage: .6, areaM2: 564 }, { cropId: "lettuce", techniqueId: "hydroponic", percentage: .4, areaM2: 376 }]);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].geometry.geometry.coordinates[0][2][0]).toBeCloseTo(blocks[1].geometry.geometry.coordinates[0][0][0]);
  });

  it("uses the documented 94% usable-area factor for map labels", () => {
    const plot = polygon(
      [[[51.5, 25.7], [51.51, 25.7], [51.51, 25.71], [51.5, 25.71], [51.5, 25.7]]],
      { areaM2: 1000 },
    );
    const blocks = buildLayout(plot, [
      { cropId: "tomato", techniqueId: "greenhouse", percentage: .6, areaM2: 564 },
      { cropId: "lettuce", techniqueId: "hydroponic", percentage: .4, areaM2: 376 },
    ]);
    expect(blocks[0].areaM2).toBeCloseTo(564);
    expect(blocks[1].areaM2).toBeCloseTo(376);
  });
});
