// src/types/vault/vault.ts

export type VaultEntryBase = {
  id: string; // Firestoreでは doc.id で付与されることを想定
  type: string;
  title?: string;
  createdAt: string;
  tokenCount?: number;
};

export type TaskData = {
  title: string;
  status: "todo" | "done" | "waiting";
  dueDate?: string;
  tags?: string[];
};

export type TaskEntry = VaultEntryBase & {
  type: "task";
  data: TaskData;
};

export type IdeaData = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type IdeaEntry = VaultEntryBase & {
  type: "idea";
  data: IdeaData;
};

export type VaultEntry = TaskEntry | IdeaEntry;

export type CreateVaultEntryResponse = Pick<VaultEntry, "id">;
