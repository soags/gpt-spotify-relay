// src/controllers/context/contextController.ts

import { Request, Response } from "express";
import {
  ListContextsResponse,
  GetContextResponse,
  SaveContextResponse,
  SaveContextBatchResponse,
  DeleteContextResponse,
} from "../../types/context/response";
import { ContextRecord, ContextRecordSimplified } from "../../types/context";
import { CONTEXT_COLLECTIONS, db } from "../../lib/firestore";
import { NotFoundError, ValidationError } from "../../types/error";
import slugify from "slugify";
import {
  ListContextsQuery,
  GetContextParams,
  SaveContextBody,
  SaveContextBatchBody,
  DeleteContextParams,
} from "../../types/context/request";

const userId = "defaultUser";

export async function listContexts(
  req: Request<object, ListContextsResponse, object, ListContextsQuery>,
  res: Response<ListContextsResponse>
): Promise<void> {
  const keywordFilter = req.query.keywords as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const cursorId = req.query.cursorId as string | undefined;

  let query = db
    .collection(CONTEXT_COLLECTIONS.CONTEXT)
    .doc(userId)
    .collection(CONTEXT_COLLECTIONS.CONTEXT__RECORDS)
    .orderBy("updatedAt", "desc")
    .limit(limit);

  if (keywordFilter) {
    query = query.where("keywords", "array-contains", keywordFilter);
  }
  if (cursorId) {
    query = query.startAfter(cursorId);
  }

  const snapshot = await query.get();
  const contexts = snapshot.docs.map((doc) => {
    const data = doc.data() as ContextRecord;
    return {
      contextId: doc.id,
      summary: data.summary,
      keywords: data.keywords,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as ContextRecordSimplified;
  });

  const last = contexts[contexts.length - 1];
  const nextCursor = last ? { id: last.contextId } : undefined;

  res.json({
    contexts,
    cursor: nextCursor,
  });
}

export async function getContext(
  req: Request<GetContextParams, GetContextResponse, object, object>,
  res: Response<GetContextResponse>
): Promise<void> {
  const contextId = req.params.id;

  if (!contextId) {
    throw new ValidationError("contextId is required.");
  }

  const ref = db
    .collection(CONTEXT_COLLECTIONS.CONTEXT)
    .doc(userId)
    .collection(CONTEXT_COLLECTIONS.CONTEXT__RECORDS)
    .doc(contextId);

  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new NotFoundError(`Context with id ${contextId} not found.`);
  }

  const context = snapshot.data() as ContextRecord;
  res.json(context);
}

export async function saveContext(
  req: Request<object, SaveContextResponse, SaveContextBody, object>,
  res: Response<SaveContextResponse>
): Promise<void> {
  const payload = req.body as ContextRecord;
  if (!payload) {
    throw new ValidationError("Payload is required.");
  }
  if (Array.isArray(payload)) {
    throw new ValidationError("Payload must be a single context record.");
  }

  const context: ContextRecord = payload;

  const result = await saveContextBatchCore([context]);

  res.json({
    contextId: result.contextIds[0],
  });
}

export async function saveContextBatch(
  req: Request<object, SaveContextBatchResponse, SaveContextBatchBody, object>,
  res: Response<SaveContextBatchResponse>
): Promise<void> {
  const payload = req.body;

  if (!payload) {
    throw new ValidationError("Payload is required.");
  }
  if (!Array.isArray(payload)) {
    throw new ValidationError("Payload must be an array.");
  }

  const contexts: ContextRecord[] = payload;

  res.json(await saveContextBatchCore(contexts));
}

export async function saveContextBatchCore(
  contexts: ContextRecord[]
): Promise<SaveContextBatchResponse> {
  const batch = db.batch();
  const now = new Date();

  const contextIds: string[] = [];

  for (const raw of contexts) {
    const contextId =
      raw.contextId || (await generateContextId(raw.summary || "untitled"));
    contextIds.push(contextId);

    const { summary, keywords, sections, createdAt = now } = raw;

    // 最低限のバリデーション
    if (
      !summary ||
      !Array.isArray(keywords) ||
      !Array.isArray(sections) ||
      sections.some(
        (s) => !s.role || !s.text || typeof s.tokenCount !== "number"
      )
    ) {
      throw new ValidationError(`Invalid context: ${contextId}`);
    }

    const ref = db
      .collection(CONTEXT_COLLECTIONS.CONTEXT)
      .doc(userId)
      .collection(CONTEXT_COLLECTIONS.CONTEXT__RECORDS)
      .doc(contextId);
    batch.set(ref, {
      contextId,
      summary,
      keywords,
      sections,
      createdAt: createdAt instanceof Date ? createdAt : now,
      updatedAt: now,
    });
  }

  await batch.commit();

  return { count: contexts.length, contextIds };
}

export async function deleteContext(
  req: Request<DeleteContextParams, DeleteContextResponse, object, object>,
  res: Response<DeleteContextResponse>
): Promise<void> {
  const contextId = req.params.id;
  if (!contextId) throw new ValidationError("Missing contextId");

  const ref = db
    .collection(CONTEXT_COLLECTIONS.CONTEXT)
    .doc(userId)
    .collection(CONTEXT_COLLECTIONS.CONTEXT__RECORDS)
    .doc(contextId);

  const snapshot = await ref.get();

  if (!snapshot.exists) {
    throw new NotFoundError(`Context with id ${contextId} not found.`);
  }

  await ref.delete();
  res.json({ ok: true });
}

async function generateContextId(summary: string): Promise<string> {
  const base = `${slugify(summary, {
    lower: true,
    strict: true,
  })}-${getTimestampString()}`;
  let id = base;
  let suffix = 1;
  const ref = db.collection("contexts").doc(userId).collection("records");

  while ((await ref.doc(id).get()).exists) {
    id = `${base}-${suffix++}`;
  }
  return id;
}

function getTimestampString(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}
