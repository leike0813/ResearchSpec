import path from "node:path";

import type { ReviewWorkspaceAdapter } from "./contracts.js";

const ADAPTERS = new Map<string, ReviewWorkspaceAdapter>([
  ["paper-humanizer", "paper-humanizer"],
  ["review-response", "review-response"],
]);

const ASSET_CAPABILITIES = new Set([
  "check-paper-humanization-review",
  "transform-paper-humanization-revision",
  "design-review-response-workboard-planning",
  "generation-review-response-round",
]);

export function reviewWorkspaceInstruction(input: {
  profileId: string;
  selector: string;
  capabilityId?: string;
  packageRoot?: string;
}) {
  const adapter = ADAPTERS.get(input.profileId);
  if (!adapter) return undefined;
  const assetPath = input.capabilityId && input.packageRoot && ASSET_CAPABILITIES.has(input.capabilityId)
    ? path.join(input.packageRoot, "review-workspace", "index.html")
    : null;
  return {
    schema_version: "1" as const,
    adapter,
    selector: input.selector,
    surface: "local-static" as const,
    asset_path: assetPath,
    descriptor_schema: "review-workspace.v1" as const,
    result_schema: "review-workspace-result.v1" as const,
    mutation_authority: "researchspec-cli-only" as const,
    instruction: "The browser result is advisory working material. Validate its source hash and re-read current instructions before any CLI, handoff, SQLite, or manuscript mutation.",
  };
}

