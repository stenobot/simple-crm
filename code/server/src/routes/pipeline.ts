import * as express from "express";
import { AppDataSource } from "../data-source";
import { Stage } from "../entity/Stage";
import { Opportunity } from "../entity/Opportunity";
import { compareOpportunities } from "../services/opportunity-order";

export const pipelineRouter = express.Router();

pipelineRouter.get("/pipeline", async (_req, res) => {
    const stages = await AppDataSource.manager
        .getRepository(Stage)
        .find({ order: { order: "ASC" } });
    const opportunities = await AppDataSource.manager
        .getRepository(Opportunity)
        .find();

    let totalValue = 0;
    let expectedValue = 0;

    const byStage = stages.map(stage => {
        const stageOpps = opportunities
            .filter(opp => opp.stage.id === stage.id)
            .sort(compareOpportunities);
        const stageTotal = stageOpps.reduce((sum, opp) => sum + opp.value, 0);
        const stageExpected = stageOpps.reduce(
            (sum, opp) => sum + (opp.expectedValue ?? 0),
            0,
        );

        totalValue += stageTotal;
        expectedValue += stageExpected;

        return {
            stage,
            count: stageOpps.length,
            totalValue: stageTotal,
            expectedValue: stageExpected,
            opportunities: stageOpps,
        };
    });

    res.json({ totalValue, expectedValue, byStage });
});
