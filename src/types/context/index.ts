// src/types/context/index.ts

export type ContextRecord = {
  contextId: string; // 一意なURL-safe ID（例: "gpt-promotion-20250612"）
  summary: string; // 人間にもGPTにもわかりやすい一文要約
  keywords: string[]; // トピック・分類タグ（例: ["GPT", "Zenn", "プロモーション"]）
  sections: Section[]; // 文脈を構成するチャットセクション（順序保持）
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
};

export type ContextRecordSimplified = Omit<ContextRecord, "sections">;

export type Section = {
  role: "user" | "assistant";
  text: string;
  tokenCount: number; // トークン制限・圧縮などに利用
};
