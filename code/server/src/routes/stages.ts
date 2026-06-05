import * as express from "express";
import { AppDataSource } from "../data-source";
import { Stage } from "../entity/Stage";

export const stagesRouter = express.Router();

stagesRouter.get("/stages", async (_req, res) => {
    const stages = await AppDataSource.manager
        .getRepository(Stage)
        .find({ order: { order: "ASC" } });
    res.json(stages);
});

stagesRouter.post("/stages", async (req, res) => {
    const repo = AppDataSource.manager.getRepository(Stage);
    const stage = new Stage();
    stage.name = req.body.name;
    stage.status = req.body.status;
    stage.conversionLikelihood = req.body.conversionLikelihood;
    const maxOrder = await repo
        .createQueryBuilder("stage")
        .select("MAX(stage.order)", "max")
        .getRawOne();
    stage.order = (maxOrder.max || 0) + 1;
    await repo.save(stage);
    res.json(stage);
});

stagesRouter.put("/stages/:id", async (req, res) => {
    const repo = AppDataSource.manager.getRepository(Stage);
    const stage = await repo.findOne({ where: { id: parseInt(req.params.id) } });
    stage.name = req.body.name;
    stage.status = req.body.status;
    stage.conversionLikelihood = req.body.conversionLikelihood;
    if (req.body.order !== undefined) stage.order = req.body.order;
    await repo.save(stage);
    res.json(stage);
});

stagesRouter.delete("/stages/:id", async (req, res) => {
    await AppDataSource.manager.getRepository(Stage).delete(req.params.id);
    res.json({ success: true });
});
