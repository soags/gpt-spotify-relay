// src/types/vault/vault.ts

import { z } from "zod";
import { ErrorResponse, ValidationErrorResponse } from "../error";

export type VaultEntryBase = {
  id: string; // Firestoreでは doc.id で付与されることを想定
  type: string;
  title?: string;
  createdAt: string;
  tokenCount?: number;
};

export const TaskDataSchema = z.object({
  title: z.string().min(1),
  status: z.enum(["todo", "done", "waiting"]),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

export type TaskData = z.infer<typeof TaskDataSchema>;

export type TaskEntry = VaultEntryBase & {
  type: "task";
  data: TaskData;
};

export const IdeaDataSchema = z.record(z.any());

export type IdeaData = z.infer<typeof IdeaDataSchema>;

export type IdeaEntry = VaultEntryBase & {
  type: "idea";
  data: IdeaData;
};

export type VaultEntry = TaskEntry | IdeaEntry;

export type CreateVaultResponse =
  | Pick<VaultEntry, "id">
  | ValidationErrorResponse
  | ErrorResponse;

export type UpdateVaultResponse =
  | void
  | ValidationErrorResponse
  | ErrorResponse;

export type DeleteVaultResponse = void | ErrorResponse;
