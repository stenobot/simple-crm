import { Stage } from "../entity/Stage";
import { Settings } from "./settings";

export function likelihoodFor(stage: Stage, settings: Settings): number {
    if (stage.status === "won") return settings.wonStageLikelihood;
    if (stage.status === "lost") return settings.lostStageLikelihood;
    return stage.conversionLikelihood;
}

export function expectedValueFor(
    value: number,
    stage: Stage,
    settings: Settings,
): number {
    return value * likelihoodFor(stage, settings);
}
