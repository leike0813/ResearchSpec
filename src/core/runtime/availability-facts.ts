import { ActionAvailabilitySchema, type ActionAvailability } from "../contracts/case-control.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import { sha256 } from "../workspace/write-plan.js";

export function actionReadPreconditions(snapshot: WorkspaceSnapshot) {
  return [
    "specs/project.md",
    "specs/sources.yaml",
    "specs/claims.yaml",
    "specs/manuscript.yaml",
    "specs/workflow.yaml",
    "runs/current/state.yaml",
    "runs/current/artifact-registry.json",
    "runs/current/gate-ledger.jsonl",
    "runs/current/decision-ledger.jsonl",
    "runs/current/attempt-ledger.jsonl",
    "playbooks/arsu-adaptive.yaml",
  ].flatMap((relativePath) => {
    const file = snapshot.files.get(relativePath);
    return file ? [{ path: relativePath, sha256: file.hash }] : [];
  });
}

export function createActionAvailability(
  snapshot: WorkspaceSnapshot,
  selector: string,
  disposition: ActionAvailability["disposition"],
  reasonCode: string,
  blockingRefs: string[],
  obligationScope: string[] = [],
): ActionAvailability {
  const expiresWhen = actionReadPreconditions(snapshot);
  return ActionAvailabilitySchema.parse({
    selector,
    disposition,
    reason_code: reasonCode,
    obligation_scope: obligationScope,
    blocking_refs: blockingRefs,
    basis_sha256: sha256(`${JSON.stringify({
      selector,
      disposition,
      reason_code: reasonCode,
      obligation_scope: obligationScope,
      blocking_refs: blockingRefs,
      expires_when: expiresWhen,
    })}\n`),
    expires_when: expiresWhen,
  });
}
