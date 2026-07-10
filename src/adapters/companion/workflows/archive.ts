import type { CompanionWorkflowSource } from "../types.js";

export const archiveWorkflow = {
  id: "archive",
  name: "ResearchSpec Archive",
  description: "Archive one resolved ResearchSpec contract change or draft patch after validating decision, receipt, registry, hash, gate, and destination evidence. Use for lifecycle completion, not backup creation or OpenSpec archival.",
  instructions: `## Mission

Complete the ResearchSpec lifecycle by moving one resolved, evidence-complete change or draft patch into its dated archive location. Archive preserves history; it does not repair or invent the evidence required to qualify.

## When to Use

- A contract change or draft patch is applied, rejected, or superseded and the user wants to close it.
- Next/status identifies an archivable candidate and the user wants to preview and confirm the move.
- The user needs confirmation that resolution evidence is complete before archival.

## Do Not Use

- Do not archive pending/postponed work, the current run, stable specs, arbitrary backups, generated context packs, or an OpenSpec change.
- Do not fabricate a decision, receipt, registry entry, gate override, hash, or status to make an item archivable.
- Do not use archive to hide a failed check or conflicting lifecycle record.

## Inputs

- One canonical \`change:<id>\` or \`patch:<id>\` selector.
- Explicit confirmation after source, destination, status, decision, gate, and receipt evidence are reviewed.
- Optional user concern about retention or downstream references; archive does not delete ledger history.

## CLI Examples

\`\`\`bash
researchspec archive --json
researchspec show change:weaken-c001 --json
researchspec check runtime --json
researchspec archive change:weaken-c001 --dry-run --json
researchspec archive change:weaken-c001 --json
researchspec status --json
\`\`\`

## Workflow

1. If no selector is supplied, run the no-selector archive view. Present only CLI-reported candidates and ask the user to choose when more than one exists.
2. Resolve the canonical item and run \`show --json\`. Confirm type, lifecycle status, decision ID, receipt artifact ID for applied items, and source path.
3. Inspect the matching decision-ledger event. It must link to the same item and have a status compatible with applied/rejected/superseded state.
4. Inspect the latest linked blocking gate. If it is unresolved and lacks a valid accepted override, the item is not archivable.
5. For applied items, inspect the registered receipt artifact, file existence, hash, item selector, and decision ID. For accepted draft patches, also confirm the created artifact is registered.
6. Run \`researchspec check runtime --json\` when lifecycle evidence or current state is in question. Do not repair evidence inside archive.
7. Run the complete \`archive <selector> --dry-run --json\`. Inspect source, dated destination, destination collision, source hash, and any diagnostics.
8. Explain what moves and what remains: stable specs, artifact registry, decision/gate ledgers, receipts, and historical evidence remain unchanged.
9. Obtain explicit confirmation for this selector and destination. A prior decision to accept/reject is not archive confirmation.
10. Execute the same command without \`--dry-run\`.
11. Run \`status --json\`, \`check runtime --json\`, and list/show views needed to confirm the active item disappeared and the archive target exists.
12. Report archive path, retained evidence, and any next lifecycle candidate. Do not automatically archive a second item.

## Decision Table

| Evidence state | Archive action |
| --- | --- |
| Applied with matching decision and verified registered receipt | Eligible after dry-run and confirmation. |
| Rejected with matching rejected decision | Eligible after dry-run and confirmation. |
| Superseded with compatible decision evidence | Eligible after dry-run and confirmation. |
| Proposed or postponed | Not eligible; route to decide. |
| Applied but receipt missing/hash mismatch | Block; route to check/lifecycle diagnosis. |
| Linked blocking gate unresolved | Block; route to decide the gate if eligible. |
| Destination already exists | Block; inspect collision, never overwrite. |

## Failure Recovery

- \`archive_blocked\`: report the exact missing or inconsistent evidence and the workflow that owns it.
- Source changed after preview: rerun show/check/dry-run; never reuse the stale confirmation.
- Destination collision: preserve both paths and investigate identity/history. Do not rename canonical history ad hoc.
- Write failure: verify whether the source or target exists before retrying; the transactional mover is authoritative.
- Post-archive check failure: report archive success separately from the new diagnostic and route to check.

## Output Contract

Before execution return selector, status, decision/gate/receipt evidence, dry-run source and target, retained records, blockers, and confirmation request. After execution return final archive path, source absence, status/runtime recheck, retained evidence, and next candidate if relevant.

## Guardrails

- Archive is a move of a resolved lifecycle item, not deletion or semantic application.
- Missing evidence remains a blocker even when the user remembers approving the work in chat.
- Confirm and execute one item at a time.

## Completion

Finish when one confirmed item has moved to its dated archive, active status and runtime checks reflect the move, and all authoritative historical evidence remains intact.`,
} satisfies CompanionWorkflowSource;
