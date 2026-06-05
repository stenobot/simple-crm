import * as express from "express";
import { AppDataSource } from "../data-source";
import { Opportunity } from "../entity/Opportunity";
import { Lead } from "../entity/Lead";
import { Stage } from "../entity/Stage";
import { getSettings } from "../services/settings";
import { expectedValueFor } from "../services/opportunity-value";

export const opportunitiesRouter = express.Router();

opportunitiesRouter.get("/opportunities", async (_req, res) => {
    const opportunities = await AppDataSource.manager
        .getRepository(Opportunity)
        .find();
    res.json(opportunities);
});

opportunitiesRouter.post("/opportunities", async (req, res) => {
    const settings = await getSettings();

    if (req.body.value < settings.minimumOpportunityValue) {
        res.status(400).json({
            error: `Value must be at least ${settings.minimumOpportunityValue}`,
        });
        return;
    }

    const opp = new Opportunity();
    opp.lead = await AppDataSource.manager
        .getRepository(Lead)
        .findOne({ where: { id: req.body.leadId } });
    opp.stage = await AppDataSource.manager
        .getRepository(Stage)
        .findOne({ where: { id: req.body.stageId } });
    opp.value = req.body.value;
    opp.name = req.body.name;
    opp.customFields = req.body.customFields || {};
    opp.expectedValue = expectedValueFor(opp.value, opp.stage, settings);
    await AppDataSource.manager.getRepository(Opportunity).save(opp);

    res.json(opp);
});

opportunitiesRouter.put("/opportunities/:id", async (req, res) => {
    const settings = await getSettings();
    const repo = AppDataSource.manager.getRepository(Opportunity);
    const opp = await repo.findOne({ where: { id: parseInt(req.params.id) } });

    if (req.body.stageId) {
        opp.stage = await AppDataSource.manager
            .getRepository(Stage)
            .findOne({ where: { id: req.body.stageId } });
    }
    if (req.body.value !== undefined) {
        if (req.body.value < settings.minimumOpportunityValue) {
            res.status(400).json({
                error: `Value must be at least ${settings.minimumOpportunityValue}`,
            });
            return;
        }
        opp.value = req.body.value;
    }
    if (req.body.name !== undefined) opp.name = req.body.name;
    if (req.body.customFields) opp.customFields = req.body.customFields;
    opp.expectedValue = expectedValueFor(opp.value, opp.stage, settings);
    await repo.save(opp);

    res.json(opp);
});

opportunitiesRouter.delete("/opportunities/:id", async (req, res) => {
    await AppDataSource.manager.getRepository(Opportunity).delete(req.params.id);
    res.json({ success: true });
});
