import { describe, it, expect } from "vitest";
import { likelihoodFor, expectedValueFor } from "./opportunity-value";
import type { Stage } from "../entity/Stage";
import type { Settings } from "./settings";

const settings: Settings = {
    wonStageLikelihood: 1,
    lostStageLikelihood: 0,
    minimumOpportunityValue: 1000,
    defaultStageConversionLikelihood: 0.5,
};

const stage = (
    status: "pending" | "won" | "lost",
    conversionLikelihood = 0.4,
): Stage =>
    ({
        id: 1,
        name: status,
        status,
        conversionLikelihood,
    }) as unknown as Stage;

describe("likelihoodFor", () => {
    it("returns settings.wonStageLikelihood for won stages", () => {
        expect(likelihoodFor(stage("won"), settings)).toBe(1);
    });
    it("returns settings.lostStageLikelihood for lost stages", () => {
        expect(likelihoodFor(stage("lost"), settings)).toBe(0);
    });
    it("returns the stage's own likelihood for pending stages", () => {
        expect(likelihoodFor(stage("pending", 0.4), settings)).toBe(0.4);
    });
    it("ignores stage.conversionLikelihood for won and lost", () => {
        expect(likelihoodFor(stage("won", 0.999), settings)).toBe(1);
        expect(likelihoodFor(stage("lost", 0.999), settings)).toBe(0);
    });
});

describe("expectedValueFor", () => {
    it("multiplies value by likelihood for pending", () => {
        expect(expectedValueFor(1000, stage("pending", 0.5), settings)).toBe(500);
    });
    it("returns full value for won", () => {
        expect(expectedValueFor(2500, stage("won"), settings)).toBe(2500);
    });
    it("returns 0 for lost", () => {
        expect(expectedValueFor(2500, stage("lost"), settings)).toBe(0);
    });
    it("handles zero value", () => {
        expect(expectedValueFor(0, stage("pending", 0.5), settings)).toBe(0);
    });
});
