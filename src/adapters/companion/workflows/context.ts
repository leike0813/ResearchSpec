import type { CompanionWorkflowSource } from "../types.js";

export const contextWorkflow = {
  id: "context",
  name: "ResearchSpec Context",
  description: "Choose and safely produce a ResearchSpec handoff view or deterministic context pack while controlling persistence, artifact inclusion, privacy, size, and overwrite risk. Use for resuming or sharing context, not workspace interpretation alone.",
  instructions: `## Mission

Create the smallest appropriate derived context output for a known audience without confusing that derived view with authoritative contracts or exposing unnecessary artifacts.

## When to Use

- The user wants to resume in another session, hand work to another agent, or inspect the current handoff.
- The user wants a deterministic ZIP for transport, audit, or offline review.
- The user needs help deciding whether registered artifacts should be included.

## Do Not Use

- Do not use context output as a substitute for changing stable specs or recording decisions.
- Do not interpret the whole workspace when no export or handoff is needed; use explore or next.
- Do not include unregistered files, paths outside allowed roots, or sensitive artifacts merely because they are available.

## Inputs

- Audience and purpose: current stdout, persistent local handoff, or transferable bundle.
- Desired output path if writing.
- Whether registered artifacts are required, their sensitivity, and acceptable bundle size.
- Explicit overwrite authorization when a derived output already exists.

## CLI Examples

\`\`\`bash
researchspec handoff --stdout
researchspec handoff --dry-run --json
researchspec handoff --out notes/handoff.md --dry-run --json
researchspec pack --out project-context.zip --dry-run --json
researchspec pack --out project-context.zip --include-artifacts --dry-run --json
\`\`\`

## Workflow

1. Clarify audience, transport, persistence, and whether the recipient can access the original workspace.
2. Choose the output:
   - handoff stdout for immediate inspection or copy/paste without a write;
   - handoff write for a local derived view that should persist;
   - pack for deterministic transport with hashes and manifest.
3. Explain that handoff and pack are derived snapshots. They do not become sources of truth and may become stale after contract or runtime changes.
4. For packs, default to excluding artifacts. Inspect registry entries and include artifacts only when the recipient needs their contents and privacy, licensing, path safety, and size are acceptable.
5. For stdout handoff, execute the read-only command and return the rendered content or a concise pointer to it.
6. For writing variants, construct the complete command including \`--out\` and \`--include-artifacts\`; run \`--dry-run --json\` first.
7. Inspect planned target, action, included entries, byte estimate when available, and overwrite/conflict behavior. Never add \`--force\` without explicit authorization for a derived output.
8. Summarize exposure: contracts and ledgers included, registered artifacts included or omitted, sensitive/large items, and destination.
9. Obtain explicit confirmation, then execute the identical command without \`--dry-run\`.
10. Verify the reported path, hash, entry manifest, and existence. State the snapshot time/context and remind the recipient to return decisions to authoritative ledgers through the proper workflow.

## Decision Table

| Need | Output |
| --- | --- |
| Inspect or paste current context, no file | \`handoff --stdout\` |
| Persist a readable local summary | \`handoff\` or \`handoff --out ...\` after preview |
| Transfer/audit deterministic workspace context | \`pack --out ...\` after preview |
| Recipient needs registered artifact bodies | Pack with \`--include-artifacts\` only after exposure review |
| Existing derived output conflicts | Choose a new path or obtain explicit force authorization |

## Failure Recovery

- If handoff rendering exposes invalid state, route to check; do not edit the derived handoff to hide it.
- If pack rejects an artifact path or hash, preserve the failure and repair registry/artifact integrity through the owning workflow.
- If output exists, do not delete it. Ask for a new path or explicit replacement authorization.
- If size or sensitivity cannot be assessed, omit artifacts and disclose that limitation.

## Output Contract

Return chosen mode, audience/purpose, source workspace, derived-view warning, artifact inclusion decision, privacy/size findings, dry-run plan for writes, confirmation status, final path/hash/entries when executed, and any omitted or blocked content.

## Guardrails

- Prefer the least revealing output that satisfies the use case.
- A context pack is not a backup of arbitrary project files and a handoff is not a stable contract.
- Do not modify source contracts or registries while producing context.

## Completion

Finish when the appropriate context mode is selected and, if authorized, produced and verified with its exposure and staleness boundaries clearly stated.`,
} satisfies CompanionWorkflowSource;
