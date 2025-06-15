// src/controllers/vault/vaultController.ts

import { Request, Response } from "express";
import {
  CreateVaultEntryResponse,
  IdeaData,
  IdeaEntry,
  TaskData,
  TaskEntry,
} from "../../types/vault/vault";
import { NotFoundError } from "../../types/error";
import * as vaultStore from "../../services/vaultStore";

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
  req: Request<never, CreateVaultEntryResponse, TaskData>,
  res: Response<CreateVaultEntryResponse>
): Promise<void> {
  const payload = req.body;

  const id = await vaultStore.addTask(payload);

  res.status(201).json({ id });
}

export async function updateTask(
  req: Request<{ id: string }, void, Partial<TaskData>>,
  res: Response<void>
): Promise<void> {
  const id = req.params.id;
  const partialData = req.body;

  await vaultStore.updateTask(id, partialData);

  res.sendStatus(204);
}

export async function deleteTask(
  req: Request<{ id: string }>,
  res: Response<void>
): Promise<void> {
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
  req: Request<never, CreateVaultEntryResponse, IdeaData>,
  res: Response<CreateVaultEntryResponse>
): Promise<void> {
  const payload = req.body;

  const id = await vaultStore.addIdea(payload);

  res.status(201).json({ id });
}

export async function updateIdea(
  req: Request<{ id: string }, void, Partial<IdeaData>>,
  res: Response<void>
): Promise<void> {
  const id = req.params.id;
  const partialData = req.body;

  await vaultStore.updateIdea(id, partialData);

  res.sendStatus(204);
}

export async function deleteIdea(
  req: Request<{ id: string }>,
  res: Response<void>
): Promise<void> {
  const id = req.params.id;

  await vaultStore.deleteIdea(id);

  res.sendStatus(204);
}
