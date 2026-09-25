import { describe, expect, it } from "vitest";
import { optimizePortfolio } from "./optimizer";
import { buildLayout } from "./geometry";
import { polygon } from "@turf/helpers";

describe("farm portfolio model", () => {
  const input = { areaM2: 10000, budgetQar: 500000, waterLimitM3: 22000, energyLimitKwh: 130000, crops: ["tomato", "lettuce", "cucumber"] as const, techniques: ["greenhouse", "hydroponic", "open-field"] as const };

  it("calculates positive revenue, profit, and five-year ROI", () => {
    const result = optimizePortfolio(input);
    expect(result.annualRevenueQar).toBeGreaterThan(0);
    expect(result.annualProfitQar).toBeGreaterThan(0);
    expect(result.roi5Year).toBeGreaterThan(0);
    expect(result.paybackYears).toBeGreaterThan(0);
  });

  it("keeps allocation inside usable area and percentages inside 100%", () => {
    const result = optimizePortfolio(input);
    expect(result.totalAreaM2).toBeLessThanOrEqual(9400);
    expect(result.allocations.reduce((sum, item) => sum + item.areaM2, 0)).toBeCloseTo(result.totalAreaM2);
    expect(result.allocations.reduce((sum, item) => sum + item.percentage, 0)).toBeLessThanOrEqual(1.000001);
    expect(result.waterM3).toBeGreaterThan(0);
  });

  it("respects hard budget and resource limits", () => {
    const result = optimizePortfolio({ ...input, budgetQar: 180000, waterLimitM3: 3500, energyLimitKwh: 25000 });
    expect(result.capexQar).toBeLessThanOrEqual(180000);
    expect(result.waterM3).toBeLessThanOrEqual(3500);
    expect(result.energyKwh).toBeLessThanOrEqual(25000);
  });

  it("creates contiguous, non-overlapping rectangular blocks", () => {
    const plot = polygon([[[51.5, 25.7], [51.51, 25.7], [51.51, 25.71], [51.5, 25.71], [51.5, 25.7]]]);
    const blocks = buildLayout(plot, [{ cropId: "tomato", techniqueId: "greenhouse", percentage: .6, areaM2: 600 }, { cropId: "lettuce", techniqueId: "hydroponic", percentage: .4, areaM2: 400 }]);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].geometry.geometry.coordinates[0][2][0]).toBeCloseTo(blocks[1].geometry.geometry.coordinates[0][0][0]);
  });

  it("uses declared demo plot area for layout labels", () => {
    const plot = polygon(
      [[[51.5, 25.7], [51.51, 25.7], [51.51, 25.71], [51.5, 25.71], [51.5, 25.7]]],
      { areaM2: 1000 },
    );
    const blocks = buildLayout(plot, [
      { cropId: "tomato", techniqueId: "greenhouse", percentage: .6, areaM2: 600 },
      { cropId: "lettuce", techniqueId: "hydroponic", percentage: .4, areaM2: 400 },
    ]);
    expect(blocks[0].areaM2).toBeCloseTo(600);
    expect(blocks[1].areaM2).toBeCloseTo(400);
  });
});
