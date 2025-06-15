import { db } from "../lib/firestore";
import { IdeaData, IdeaEntry, TaskData, TaskEntry } from "../types/vault/vault";

const VAULT_COLLECTION = "vault";

export async function listTasks(): Promise<TaskEntry[]> {
  const snapshot = await db
    .collection(VAULT_COLLECTION)
    .where("type", "==", "task")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as TaskEntry);
}

export async function getTask(id: string): Promise<TaskEntry | null> {
  const docRef = db.collection(VAULT_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return null;
  }
  const entry = docSnap.data() as TaskEntry;
  if (entry.type !== "task") {
    return null;
  }
  return entry;
}

export async function addTask(data: TaskData): Promise<string> {
  const docRef = db.collection(VAULT_COLLECTION).doc(); // 自動ID
  const entry: TaskEntry = {
    id: docRef.id,
    type: "task",
    createdAt: new Date().toISOString(),
    data,
  };

  await docRef.set(entry);
  return docRef.id;
}

export async function updateTask(
  id: string,
  partialData: Partial<TaskData>
): Promise<void> {
  const docRef = db.collection(VAULT_COLLECTION).doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error(`Task entry not found: ${id}`);
  }

  const existing = docSnap.data() as TaskEntry;
  if (existing.type !== "task") {
    throw new Error(`Entry is not a task: ${id}`);
  }

  const updatedData: TaskData = {
    ...existing.data,
    ...partialData,
  };

  await docRef.update({ data: updatedData });
}

export async function deleteTask(id: string): Promise<void> {
  const docRef = db.collection(VAULT_COLLECTION).doc(id);
  await docRef.delete();
}

export async function getIdeas(): Promise<IdeaEntry[]> {
  const snapshot = await db
    .collection(VAULT_COLLECTION)
    .where("type", "==", "idea")
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => doc.data() as IdeaEntry);
}

export async function getIdea(id: string): Promise<IdeaEntry | null> {
  const docRef = db.collection(VAULT_COLLECTION).doc(id);
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return null;
  }
  const entry = docSnap.data() as IdeaEntry;
  if (entry.type !== "idea") {
    return null;
  }
  return entry;
}

export async function addIdea(data: IdeaData): Promise<string> {
  const docRef = db.collection(VAULT_COLLECTION).doc(); // 自動ID
  const entry: IdeaEntry = {
    id: docRef.id,
    type: "idea",
    createdAt: new Date().toISOString(),
    data,
  };

  await docRef.set(entry);
  return docRef.id;
}

export async function updateIdea(
  id: string,
  partialData: Partial<IdeaData>
): Promise<void> {
  const docRef = db.collection(VAULT_COLLECTION).doc(id);
  const docSnap = await docRef.get();

  if (!docSnap.exists) {
    throw new Error(`Idea entry not found: ${id}`);
  }

  const existing = docSnap.data() as IdeaEntry;
  if (existing.type !== "idea") {
    throw new Error(`Entry is not an idea: ${id}`);
  }

  const updatedData: IdeaData = {
    ...existing.data,
    ...partialData,
  };

  await docRef.update({ data: updatedData });
}

export async function deleteIdea(id: string): Promise<void> {
  const docRef = db.collection(VAULT_COLLECTION).doc(id);
  await docRef.delete();
}
