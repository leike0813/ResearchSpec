import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { z } from "zod";

import type { ReviewWorkspaceAdapter } from "./contracts.js";
import { RevisionMasterStageSchema } from "./revision-master.js";

const ADAPTERS = new Map<string, ReviewWorkspaceAdapter>([
  ["paper-humanizer", "paper-humanizer"],
  ["review-response", "review-response"],
]);

const HUMANIZER_CAPABILITIES = new Set([
  "check-paper-humanization-review",
  "transform-paper-humanization-revision",
]);

type RevisionMasterReviewStage = z.infer<typeof RevisionMasterStageSchema>;

const REVISION_MASTER_STAGES = new Map<string, readonly RevisionMasterReviewStage[]>([
  ["transform-review-response-comment-atomization", ["coverage"]],
  ["design-review-response-workboard-planning", ["board"]],
  ["generation-review-response-round", ["strategy", "round"]],
]);

const CAPABILITY_ADAPTERS = new Map<string, ReviewWorkspaceAdapter>([
  ...[...HUMANIZER_CAPABILITIES].map((id) => [id, "paper-humanizer"] as const),
  ...[...REVISION_MASTER_STAGES.keys()].map((id) => [id, "review-response"] as const),
]);

const SESSION_INSTRUCTION = "Retain the trusted candidate as workspace.json in its review directory outside researchspec/. Start the packaged Node session tool with --project-root ROOT --workspace WORKSPACE_JSON --asset HTML, optionally --wait for saved-result notifications. Deliver its URL and exact result_path; exports save complete result.json and immutable results/ history without browser downloads. Read a received history_path and validate it independently before applying feedback. Reuse the retained port for draft recovery; report conflicts. Offline HTML offers a separate explicit download. The service writes advisory review files only.";

const PAPER_HUMANIZER_INSTRUCTION = "Prepare one frozen source set and static selectable review document before opening the browser. Ask separately before each render that executes project scripts, filters or computation, and render approved projects in a temporary copy. Keep unreliable conversion as visible raw source. Validate the exported result against the retained workspace; compare current source with the frozen source set. If changed, show differences and affected feedback and ask before mutation. For unchanged source, locate comments by quote/context and ask when ambiguous. Re-read current instructions before formal action. v1 results stay on the v1 contract. " + SESSION_INSTRUCTION;

const REVISION_MASTER_INSTRUCTION = "Prepare one frozen revision-master business snapshot inside its task workspace outside researchspec/ from the task-local SQLite truth and captured sources. Use this package's review-workspace/revision-master.html as the session template. Review one of the four stages: coverage mapping, whole workboard, current strategy, or round revision/response. The page keeps only browser-local drafts and exports a complete revision-master-review-result.v1. Internal confirmation is explicit and scoped to coverage, the whole board, or the current strategy; a round seen marker is separate and never implies confirmation. Validate the exported result against the retained snapshot and each scope's semantic dependencies before applying accepted feedback through the package-local runtime, committing the processing receipt with the semantic write. Never treat page state as semantic or workflow truth. Formal Gate verdicts and Decision choices stay in Agent dialogue with separate human confirmation. " + SESSION_INSTRUCTION;

const REVISION_MASTER_CONTEXT_INSTRUCTION = "Prepare the independent revision-master review handoffs in the owning review-response node: coverage mapping, whole workboard, current strategy, and round revision/response. The owning node names the actual package resource, so this context advertises no package path. Snapshot preparation, result validation, and accepted semantic writes stay with the Agent; formal Gate verdicts and Decision choices remain separate human confirmations in dialogue.";

function packageAsset(packageRoot: string | undefined, ...relative: string[]): string | null {
  if (!packageRoot) return null;
  const candidate = path.join(packageRoot, ...relative);
  return existsSync(candidate) ? candidate : null;
}

export function reviewWorkspaceInstruction(input: {
  profileId: string;
  selector: string;
  capabilityId?: string;
  packageRoot?: string;
}) {
  const adapter = ADAPTERS.get(input.profileId)
    ?? (input.capabilityId === undefined ? undefined : CAPABILITY_ADAPTERS.get(input.capabilityId));
  if (!adapter) return undefined;
  const sessionTool = fileURLToPath(new URL("./session-cli.js", import.meta.url));
  const sessionToolPath = existsSync(sessionTool) ? sessionTool : null;

  if (adapter === "review-response") {
    const stages = input.capabilityId === undefined ? undefined : REVISION_MASTER_STAGES.get(input.capabilityId);
    if (input.capabilityId !== undefined && stages === undefined) return undefined;
    const handoff = stages !== undefined;
    return {
      schema_version: "1" as const,
      adapter,
      selector: input.selector,
      surface: "local-session" as const,
      session_tool_path: sessionToolPath,
      asset_path: handoff ? packageAsset(input.packageRoot, "review-workspace", "revision-master.html") : null,
      tool_path: handoff ? packageAsset(input.packageRoot, "workbench", "review_workbench.py") : null,
      guide_path: handoff ? packageAsset(input.packageRoot, "workbench", "README.md") : null,
      descriptor_schema: "revision-master-review-workspace.v1" as const,
      result_schema: "revision-master-review-result.v1" as const,
      review_stages: stages ?? null,
      mutation_authority: "researchspec-cli-only" as const,
      instruction: handoff ? REVISION_MASTER_INSTRUCTION : REVISION_MASTER_CONTEXT_INSTRUCTION,
    };
  }

  const assetPath = input.capabilityId && input.packageRoot && HUMANIZER_CAPABILITIES.has(input.capabilityId)
    ? path.join(input.packageRoot, "review-workspace", "index.html")
    : null;
  return {
    schema_version: "1" as const,
    adapter,
    selector: input.selector,
    surface: "local-session" as const,
    session_tool_path: sessionToolPath,
    asset_path: assetPath,
    descriptor_schema: "review-workspace.v2" as const,
    result_schema: "review-workspace-result.v2" as const,
    mutation_authority: "researchspec-cli-only" as const,
    instruction: PAPER_HUMANIZER_INSTRUCTION,
  };
}
