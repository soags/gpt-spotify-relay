// src/controllers/vault/vaultController.ts

import { Request, Response } from "express";
import {
  CreateVaultResponse,
  DeleteVaultResponse,
  IdeaData,
  IdeaDataSchema,
  IdeaEntry,
  TaskData,
  TaskDataSchema,
  TaskEntry,
  UpdateVaultResponse,
} from "../../types/vault/vault";
import { NotFoundError } from "../../types/error";
import * as vaultStore from "../../services/vaultStore";
import z from "zod/v4";

export async function listTasks(
  req: Request<never, TaskEntry[]>,
  res: Response<TaskEntry[]>
): Promise<void> {
  const tasks = await vaultStore.listTasks();
  res.json(tasks);
}

export async function getTask(
  req: Request<{ id: string }, TaskEntry>,
  res: Response<TaskEntry>
): Promise<void> {
  const id = req.params.id;

  const task = await vaultStore.getTask(id);
  if (!task) {
    throw new NotFoundError(`Task with id ${id} not found.`);
  }

  res.json(task);
}

export async function createTask(
  req: Request<never, CreateVaultResponse, TaskData>,
  res: Response<CreateVaultResponse>
): Promise<void> {
  const payload = req.body;

  const result = TaskDataSchema.safeParse(payload);
  if (!result.success) {
    res.status(400).json({
      message: z.prettifyError(result.error),
    });
    return;
  }

  const id = await vaultStore.addTask(payload);

  res.status(201).json({ id });
}

export async function updateTask(
  req: Request<{ id: string }, UpdateVaultResponse, Partial<TaskData>>,
  res: Response<UpdateVaultResponse>
): Promise<void> {
  const id = req.params.id;
  const payload = req.body;

  const result = TaskDataSchema.partial().safeParse(payload);
  if (!result.success) {
    res.status(400).json({
      message: z.prettifyError(result.error),
    });
    return;
  }

  await vaultStore.updateTask(id, payload);

  res.sendStatus(204);
}

export async function deleteTask(
  req: Request<{ id: string }>,
  res: Response<void>
): Promise<DeleteVaultResponse> {
  const id = req.params.id;

  await vaultStore.deleteTask(id);

  res.sendStatus(204);
}

export async function listIdeas(
  req: Request<never, IdeaEntry[]>,
  res: Response<IdeaEntry[]>
): Promise<void> {
  const ideas = await vaultStore.getIdeas();
  res.json(ideas);
}

export async function getIdea(
  req: Request<{ id: string }, IdeaEntry>,
  res: Response<IdeaEntry>
): Promise<void> {
  const id = req.params.id;

  const idea = await vaultStore.getIdea(id);
  if (!idea) {
    throw new NotFoundError(`Idea with id ${id} not found.`);
  }

  res.json(idea);
}

export async function createIdea(
  req: Request<never, CreateVaultResponse, IdeaData>,
  res: Response<CreateVaultResponse>
): Promise<void> {
  const payload = req.body;

  const result = IdeaDataSchema.safeParse(payload);
  if (!result.success) {
    res.status(400).json({
      message: z.prettifyError(result.error),
    });
    return;
  }

  const id = await vaultStore.addIdea(payload);

  res.status(201).json({ id });
}

export async function updateIdea(
  req: Request<{ id: string }, UpdateVaultResponse, Partial<IdeaData>>,
  res: Response<UpdateVaultResponse>
): Promise<void> {
  const id = req.params.id;
  const payload = req.body;

  const result = IdeaDataSchema.safeParse(payload);
  if (!result.success) {
    res.status(400).json({
      message: z.prettifyError(result.error),
    });
    return;
  }

  await vaultStore.updateIdea(id, payload);

  res.sendStatus(204);
}

export async function deleteIdea(
  req: Request<{ id: string }>,
  res: Response<DeleteVaultResponse>
): Promise<void> {
  const id = req.params.id;

  await vaultStore.deleteIdea(id);

  res.sendStatus(204);
}
