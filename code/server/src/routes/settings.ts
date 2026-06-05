import * as express from "express";
import { AppDataSource } from "../data-source";
import { AppSetting } from "../entity/AppSetting";

export const settingsRouter = express.Router();

settingsRouter.get("/settings", async (_req, res) => {
    const settings = await AppDataSource.manager.getRepository(AppSetting).find();
    res.json(settings);
});

settingsRouter.put("/settings/:key", async (req, res) => {
    const repo = AppDataSource.manager.getRepository(AppSetting);
    let setting = await repo.findOne({ where: { key: req.params.key } });
    if (!setting) {
        setting = new AppSetting();
        setting.key = req.params.key;
    }
    setting.value = req.body.value;
    await repo.save(setting);
    res.json(setting);
});
