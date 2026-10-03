import type { GraphWorkspaceConfig } from "../core/contracts/graph-workspace.js";
import type { Diagnostic } from "../core/validation/types.js";
import { loadProcedureCatalog } from "./catalog.js";
import { buildSearchDocuments } from "./search.js";
import { inspectSemanticSearch, semanticCacheRoot, semanticErrorCode } from "./runtime.js";
import type { SemanticSearchStatus } from "./search-contracts.js";

/** Static inspection only: never load the embedding engine or repair its cache. */
export async function inspectWorkspaceSearch(config: GraphWorkspaceConfig): Promise<{ status: Record<string, unknown>; diagnostics: Diagnostic[] }> {
  const mode = config.procedure_search?.mode ?? "offline";
  if (mode === "offline") return { status: { mode, effective_mode: "offline" }, diagnostics: [] };
  let result: SemanticSearchStatus;
  try {
    result = await inspectSemanticSearch(buildSearchDocuments(await loadProcedureCatalog()));
  } catch (error) {
    result = { ready: false, cache_root: semanticCacheRoot(), reason: semanticErrorCode(error) };
  }
  return {
    status: { mode, effective_mode: result.ready ? "hybrid" : "offline", ...result },
    diagnostics: result.ready ? [] : [{ severity: "warning", blocking: false, code: "procedure_search_fallback", message: `Local semantic discovery is unavailable (${result.reason ?? "cache unavailable"}); offline discovery remains available. Run update --procedure-search hybrid to prepare it.`, path: result.cache_root }],
  };
}
