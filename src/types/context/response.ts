// Context API response types
import { ContextRecord, ContextRecordSimplified } from "./index";

export type ListContextsResponse = {
  contexts: ContextRecordSimplified[];
  cursor?: { id: string };
};

export type GetContextResponse = ContextRecord;

export type SaveContextResponse = {
  contextId: string;
};

export type SaveContextBatchResponse = {
  count: number;
  contextIds: string[];
};

export type DeleteContextResponse = {
  ok: boolean;
};
