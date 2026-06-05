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
    it("uses settings.wonStageLikelihood for won stages, ignoring the stage's own value", () => {
        expect(likelihoodFor(stage("won", 0.999), settings)).toBe(1);
    });
    it("uses settings.lostStageLikelihood for lost stages, ignoring the stage's own value", () => {
        expect(likelihoodFor(stage("lost", 0.999), settings)).toBe(0);
    });
    it("uses the stage's own likelihood for pending stages", () => {
        expect(likelihoodFor(stage("pending", 0.4), settings)).toBe(0.4);
    });
});

describe("expectedValueFor", () => {
    it("multiplies value by likelihoodFor()", () => {
        expect(expectedValueFor(1000, stage("pending", 0.5), settings)).toBe(500);
    });
});
