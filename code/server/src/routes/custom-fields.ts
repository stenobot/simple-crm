import * as express from "express";
import { AppDataSource } from "../data-source";
import { CustomField } from "../entity/CustomField";

export const customFieldsRouter = express.Router();

customFieldsRouter.get("/custom-fields", async (_req, res) => {
    const fields = await AppDataSource.manager.getRepository(CustomField).find();
    res.json(fields);
});

customFieldsRouter.post("/custom-fields", async (req, res) => {
    const field = new CustomField();
    field.name = req.body.name;
    field.label = req.body.label;
    if (req.body.entity) field.entity = req.body.entity;
    if (req.body.type) field.type = req.body.type;
    try {
        await AppDataSource.manager.getRepository(CustomField).save(field);
        res.json(field);
    } catch {
        res.status(400).json({ error: "Field name already exists" });
    }
});

customFieldsRouter.delete("/custom-fields/:id", async (req, res) => {
    await AppDataSource.manager.getRepository(CustomField).delete(req.params.id);
    res.json({ success: true });
});
