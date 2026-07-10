import type { CompanionWorkflowSource } from "../types.js";

export const exploreWorkflow = {
  id: "explore",
  name: "ResearchSpec Explore",
  description: "Orient within a ResearchSpec workspace and explain contracts, claims, artifacts, gates, decisions, and blockers using read-only authoritative views. Use for understanding and investigation, not external literature research or writes.",
  instructions: `## Mission

Build an evidence-grounded map of the current ResearchSpec workspace so the user can understand what exists, how records relate, what remains unknown, and which workflow should follow. Exploration is read-only and bounded by workspace evidence.

## When to Use

- The user asks what the workspace contains, where a claim or artifact is recorded, or how current state was reached.
- The user wants an explanation of a gate, decision, pending change, contract relationship, or apparent inconsistency.
- A later workflow needs orientation before choosing a unique selector or deciding whether a semantic proposal is necessary.

## Do Not Use

- Do not conduct web or literature research, synthesize sources, draft academic prose, or review manuscript quality; route those requests to the relevant ARSU skill.
- Do not use this workflow to validate readiness conclusively; use \`researchspec-check\` for deterministic validity and \`researchspec-verify\` for semantic readiness.
- Do not modify contracts, create proposals, decide items, archive work, render handoffs, or build packs.

## Inputs

- The user's question or suspected relationship.
- Optional workspace path, canonical selector, contract surface, claim ID, artifact ID, gate ID, or decision ID.
- Any scope limit such as “only explain claim C001 and its evidence.”

## CLI Examples

\`\`\`bash
researchspec status --json
researchspec list changes --json
researchspec list artifacts --json
researchspec show claim:C001 --json
researchspec show gate:G001 --json
researchspec check contracts --json
\`\`\`

## Workflow

1. State the exploration question in one sentence and identify which record types could answer it.
2. Run \`researchspec status --json\` to establish workspace, run, stage, pending-item, gate, tool, and validation context.
3. If status already reports a blocking diagnostic, inspect the matching check target before interpreting downstream state. Invalid parsing can make later lists incomplete.
4. Use the narrowest \`list\` surface needed. Do not enumerate every artifact, decision, and gate when the question concerns one claim.
5. Resolve the selected item through \`show <canonical-selector> --json\`. If a bare ID is ambiguous, present every returned canonical candidate and stop for user selection.
6. Follow explicit IDs and paths across contracts, artifact registry, gate ledger, and decision ledger. Do not infer links merely because timestamps or names look related.
7. Separate findings into observed evidence, interpretation, unknowns, and contradictions. A missing link remains unknown until an authoritative record supplies it.
8. If the user is considering a high-impact semantic change, identify the current target path, existing value, supporting evidence IDs, and expected impact; recommend \`researchspec-propose\` without creating anything.
9. If the question belongs to deterministic validation, semantic readiness, context export, decision, or archive, name the owning companion and its entry condition.
10. Return a concise workspace map and the next investigative or workflow transition, without executing it.

## Decision Table

| Observed state | Action |
| --- | --- |
| Blocking parse/schema diagnostic | Stop relational interpretation and route to \`researchspec-check\`. |
| One canonical item resolves | Inspect it and follow only explicit links. |
| Bare ID has multiple candidates | Present selectors and ask the user; do not choose. |
| Evidence contradicts a stable contract | Record the contradiction and suggest verify or propose. |
| User wants new scholarly evidence | Route to ARSU deep research. |
| User wants to change stable meaning | Gather target/evidence facts and route to propose. |

## Failure Recovery

- If no workspace is found, report the searched cwd and ask for the project path; do not initialize implicitly.
- If an item is absent, show the relevant list and verify spelling/type before concluding it never existed.
- If diagnostics make a view incomplete, report that limitation and stop until validation is repaired.
- If linked records disagree, cite both paths or IDs and label the inconsistency; do not reconcile ledgers by editing them.

## Output Contract

Return: (1) the question answered, (2) evidence bullets with canonical IDs or workspace-relative paths, (3) relationships established, (4) unknowns or contradictions, (5) viable options, and (6) whether the next owner is check, verify, propose, context, decide, archive, or an ARSU skill.

## Guardrails

- Every factual lifecycle claim needs a CLI view, stable path, or record ID.
- Never mutate files or run a writing command in this workflow.
- Do not treat generated ARSU history or version text as current contract state.

## Completion

Finish when the user's orientation question is answered from cited workspace evidence, remaining unknowns are explicit, and the next workflow boundary is clear.`,
} satisfies CompanionWorkflowSource;
