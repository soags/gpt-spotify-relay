// src/controllers/context/contextController.ts

import { Request, Response } from "express";
import { ContextRecord } from "../../types/context";
import { CONTEXT_COLLECTIONS, db } from "../../lib/firestore";
import { NotFoundError, ValidationError } from "../../types/error";
import slugify from "slugify";

const userId = "defaultUser";

export const listContexts = async (req: Request, res: Response) => {
  const keywordFilter = req.query.keywords as string | undefined;
  const limit = Number(req.query.limit) || 20;

  let query = db
    .collection(CONTEXT_COLLECTIONS.CONTEXT)
    .doc(userId)
    .collection(CONTEXT_COLLECTIONS.CONTEXT__RECORDS)
    .orderBy("updatedAt", "desc");

  if (keywordFilter) {
    query = query.where("keywords", "array-contains", keywordFilter);
  }

  const snapshot = await query.limit(limit).get();
  const data = snapshot.docs.map((doc) => {
    const { contextId, summary, keywords, createdAt, updatedAt } = doc.data();
    return { contextId, summary, keywords, createdAt, updatedAt };
  });

  res.json({ contexts: data });
};

export const getContext = async (req: Request, res: Response) => {
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
};

export const saveContext = async (req: Request, res: Response) => {
  const payload = req.body;

  // 単数 or 複数に対応
  const contexts: ContextRecord[] = Array.isArray(payload)
    ? payload
    : [payload];

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
  res.json({ ok: true, count: contexts.length, contextIds });
};

export const deleteContext = async (req: Request, res: Response) => {
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
};

const generateContextId = async (summary: string): Promise<string> => {
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
};

const getTimestampString = () => {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};
