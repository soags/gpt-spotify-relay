// Context API request types
import { ContextRecord } from "./index";

export type ListContextsQuery = {
  keywords?: string;
  limit?: string;
  cursorId?: string;
};

export type GetContextParams = {
  id: string;
};

export type SaveContextBody = ContextRecord;

export type SaveContextBatchBody = {
  contexts: ContextRecord[];
};

export type DeleteContextParams = {
  id: string;
};
