import { AppDataSource } from "./data-source";
import { seedDatabase } from "./seed";
import * as express from "express";
import { settingsRouter } from "./routes/settings";
import { customFieldsRouter } from "./routes/custom-fields";
import { leadsRouter } from "./routes/leads";
import { stagesRouter } from "./routes/stages";
import { opportunitiesRouter } from "./routes/opportunities";
import { pipelineRouter } from "./routes/pipeline";

const run = async () => {
    await AppDataSource.initialize();
    await seedDatabase();

    const app = express();
    app.use(express.json());
    app.use(settingsRouter);
    app.use(customFieldsRouter);
    app.use(leadsRouter);
    app.use(stagesRouter);
    app.use(opportunitiesRouter);
    app.use(pipelineRouter);

    app.listen(3000, () => {
        console.log("Server is running on http://localhost:3000");
    });
};

run();
