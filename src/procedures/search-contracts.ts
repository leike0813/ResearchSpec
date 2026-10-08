import { createHash } from "node:crypto";

export type ProcedureSearchMode = "offline" | "hybrid";
export type SearchField = "identity" | "title" | "intents" | "description" | "context";
export interface ProcedureSearchDocument {
  id: string;
  fields: Record<SearchField, readonly string[]>;
}
export interface SemanticHit { id: string; score: number }
export interface SemanticSearchStatus {
  ready: boolean;
  cache_root: string;
  reason?: string;
}
export interface SemanticPreparationProgress {
  stage: "cache" | "runtime" | "model" | "index" | "self-test";
  status: "started" | "progress" | "reused" | "completed";
  completed?: number;
  total?: number;
  file?: string;
}
export interface SemanticPreparation extends SemanticSearchStatus {
  prepared: boolean;
  detail?: string;
  stage?: SemanticPreparationProgress["stage"];
}
export const SEARCH_DOCUMENT_VERSION = "1";

export function searchDocumentIdentity(documents: readonly ProcedureSearchDocument[]): string {
  return createHash("sha256").update(JSON.stringify({ version: SEARCH_DOCUMENT_VERSION, documents: [...documents].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0) })).digest("hex");
}

export function searchDocumentText(document: ProcedureSearchDocument): string {
  return Object.entries(document.fields).map(([field, values]) => `${field}: ${values.join("; ")}`).join("\n");
}
