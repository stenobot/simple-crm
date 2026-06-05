import { AppDataSource } from "../data-source";
import { AppSetting } from "../entity/AppSetting";

export interface Settings {
    wonStageLikelihood: number;
    lostStageLikelihood: number;
    minimumOpportunityValue: number;
    defaultStageConversionLikelihood: number;
}

const defaults: Settings = {
    wonStageLikelihood: 1,
    lostStageLikelihood: 0,
    minimumOpportunityValue: 0,
    defaultStageConversionLikelihood: 0.5,
};

export async function getSettings(): Promise<Settings> {
    const rows = await AppDataSource.manager.getRepository(AppSetting).find();
    const byKey = new Map(rows.map(r => [r.key, r.value]));
    const num = (key: keyof Settings) => {
        const raw = byKey.get(key);
        if (raw === undefined) return defaults[key];
        const parsed = parseFloat(raw);
        return Number.isFinite(parsed) ? parsed : defaults[key];
    };
    return {
        wonStageLikelihood: num("wonStageLikelihood"),
        lostStageLikelihood: num("lostStageLikelihood"),
        minimumOpportunityValue: num("minimumOpportunityValue"),
        defaultStageConversionLikelihood: num("defaultStageConversionLikelihood"),
    };
}
