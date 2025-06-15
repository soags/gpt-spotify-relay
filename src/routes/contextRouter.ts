// src/routes/contextRouter.ts

import { Router } from "express";
import * as contextController from "../controllers/context/contextController";

export const contextRouter = Router();

contextRouter.get("/health", (req, res) => res.json({ status: "ok" }));

contextRouter.get("/", contextController.listContexts);
contextRouter.get("/:id", contextController.getContext);
contextRouter.post("/", contextController.saveContext);
contextRouter.delete("/:id", contextController.deleteContext);

contextRouter.post("/batch", contextController.saveContextBatch);
