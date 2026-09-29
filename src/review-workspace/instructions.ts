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
    descriptor_schema: "review-workspace.v2" as const,
    result_schema: "review-workspace-result.v2" as const,
    mutation_authority: "researchspec-cli-only" as const,
    instruction: "Prepare one frozen source set and static selectable review document before opening the browser. Ask separately before each render that executes project scripts, filters or computation, and render approved projects in a temporary copy. Keep unreliable conversion as visible raw source. Validate the exported result against the retained workspace; compare current source with the frozen source set. If changed, show differences and affected feedback and ask before mutation. For unchanged source, locate comments by quote/context and ask when ambiguous. Re-read current instructions before formal action. v1 results stay on the v1 contract.",
  };
}
