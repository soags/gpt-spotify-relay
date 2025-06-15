// src/routes/contextRouter.ts

import { Router } from "express";
import * as vaultController from "../controllers/vault/vaultController";

export const vaultRouter = Router();

vaultRouter.get("/health", (req, res) => res.json({ status: "ok" }));

vaultRouter.get("/tasks", vaultController.listTasks);
vaultRouter.get("/tasks/:id", vaultController.getTask);
vaultRouter.post("/tasks", vaultController.createTask);
vaultRouter.patch("/tasks/:id", vaultController.updateTask);
vaultRouter.delete("/tasks/:id", vaultController.deleteTask);

vaultRouter.get("/ideas", vaultController.listIdeas);
vaultRouter.get("/ideas/:id", vaultController.getIdea);
vaultRouter.post("/ideas", vaultController.createIdea);
vaultRouter.patch("/ideas/:id", vaultController.updateIdea);
vaultRouter.delete("/ideas/:id", vaultController.deleteIdea);
