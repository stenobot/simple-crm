import * as express from "express";
import { AppDataSource } from "../data-source";
import { Lead } from "../entity/Lead";
import { Opportunity } from "../entity/Opportunity";

export const leadsRouter = express.Router();

leadsRouter.get("/leads", async (_req, res) => {
    const leads = await AppDataSource.manager.getRepository(Lead).find();
    res.json(leads);
});

leadsRouter.post("/leads", async (req, res) => {
    const lead = new Lead();
    lead.firstName = req.body.firstName;
    lead.lastName = req.body.lastName;
    lead.age = req.body.age;
    lead.phoneNumber = req.body.phoneNumber;
    lead.customFields = req.body.customFields || {};
    await AppDataSource.manager.getRepository(Lead).save(lead);
    res.json(lead);
});

leadsRouter.put("/leads/:id", async (req, res) => {
    const repo = AppDataSource.manager.getRepository(Lead);
    const lead = await repo.findOne({ where: { id: parseInt(req.params.id) } });
    lead.firstName = req.body.firstName;
    lead.lastName = req.body.lastName;
    lead.age = req.body.age;
    lead.phoneNumber = req.body.phoneNumber;
    lead.customFields = req.body.customFields || {};
    await repo.save(lead);
    res.json(lead);
});

leadsRouter.delete("/leads/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    // Remove the lead's opportunities first so none are left orphaned.
    await AppDataSource.manager
        .getRepository(Opportunity)
        .createQueryBuilder()
        .delete()
        .where("leadId = :id", { id })
        .execute();
    await AppDataSource.manager.getRepository(Lead).delete(id);
    res.json({ success: true });
});
