import type { CompanionWorkflowSource } from "../types.js";

export const submitWorkflow = {
  id: "submit",
  name: "ResearchSpec Submit",
  description: "Preview, confirm, and atomically register one workflow-owned candidate artifact with its submission receipt. Use after a producer Skill has written the declared candidate path; this workflow does not edit candidate content, state, Gates, Decisions, or stable contracts.",
  instructions: `## Mission

Submit exactly one workflow-owned candidate through the deterministic ResearchSpec runtime. Bind confirmation to the candidate hash, preserve the producer's bytes, and verify the resulting receipt and workflow frontier.

## When to Use

- Status shows a ready work item with a \`candidate_unregistered\` warning.
- A producer Skill has finished the candidate at the path returned by dynamic instructions.
- The user wants to preview or perform artifact registration.

## Do Not Use

- Do not create, revise, review, or semantically approve candidate content.
- Do not append Gates or Decisions, edit state, transition stages, or change stable specs.
- Do not hand-edit the artifact registry or submission receipt.
- Do not use Submit to replace an already submitted work item with different content.

## Inputs

- Canonical \`work:<id>\` selector.
- Producer actor kind and name.
- Strict JSON input containing \`schema_version\`, \`dependency_artifact_ids\`, and optional \`producer_mode\`.
- Explicit user confirmation after dry-run.

## CLI Examples

\`\`\`bash
researchspec status --json
researchspec instructions work:rq-brief --json
researchspec submit work:rq-brief --input submission.json --actor-kind agent --actor-name deep-research --dry-run --json
researchspec submit work:rq-brief --input submission.json --actor-kind agent --actor-name deep-research --expected-sha256 <hash> --yes --json
researchspec check artifacts --json
\`\`\`

## Workflow

1. Run \`status --json\`; select exactly one ready item whose warnings include \`candidate_unregistered\`.
2. Run \`instructions work:<id> --json\`; require \`submit_available: true\` and use its candidate path, dependencies, validation profile, and Submit contract.
3. Confirm that the producer has finished writing the candidate. Never edit it in this workflow.
4. Build the strict input using only trusted dependency artifact IDs actually used by the producer.
5. Run the complete Submit command with \`--dry-run --json\` and no expected hash.
6. Present candidate SHA-256, validation result, artifact/receipt IDs, write plan, projected completion, and the explicit facts that state, Gates, and Decisions will not be written.
7. Obtain explicit confirmation for that exact hash. Confirmation authorizes registration only.
8. Execute the identical selector, input, and actor with the dry-run hash as \`--expected-sha256\` plus \`--yes --json\`.
9. Run \`status --json\` and \`check artifacts --json\`; report whether the item is done, blocked on completion Gates, or has unlocked its successor.

## Decision Table

| State | Action |
| --- | --- |
| No candidate | Return to the declared producer Skill. |
| Candidate validation failure | Report diagnostics and return content repair to the producer. |
| Dry-run succeeds | Show hash and exact runtime writes, then request confirmation. |
| Exact prior submission | Report idempotent success and recheck status. |
| Submission conflict | Stop; do not overwrite or synthesize a receipt. |
| Completion Gate missing | Report registered artifact plus the independent Gate blocker. |

## Failure Recovery

- If the candidate changes after preview, rerun dry-run and obtain confirmation for the new hash.
- If dependencies are missing or untrusted, inspect registry entries and return to the producer; do not guess IDs.
- If an orphan receipt conflicts, stop and report its path and submission ID.
- If status and receipt disagree, run artifact checks and route deterministic defects to \`researchspec-check\`.

## Output Contract

Report selector, candidate hash, artifact ID, receipt artifact ID/path, validation profile, submission status, post-submit work-item state, and remaining completion Gates. Explicitly state that candidate, state, Gate ledger, and Decision ledger were not modified.

## Guardrails

- Always dry-run before first execution.
- Use the exact dry-run hash and identical input/actor for execution.
- Never reinterpret deterministic \`verified\` as academic approval.
- Never bypass a conflict with \`--force\` or direct file edits.

## Completion

Finish only after exact idempotent success or a committed submission is confirmed by status and artifact checks, or after a structured blocker is returned to its owner.`,
} satisfies CompanionWorkflowSource;
