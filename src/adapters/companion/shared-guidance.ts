export const SHARED_CLI_GUIDANCE = `## Shared CLI Discipline

### Authority boundary

- Discover the nearest \`researchspec/\` workspace unless the user explicitly supplies \`--workspace\` or \`--cwd\`.
- Use \`--json\` for inspection and preview. Read the envelope's \`ok\`, \`data\`, \`diagnostics\`, and \`error\` fields; do not scrape human prose when structured data exists.
- Treat stable specs, runtime records, registries, ledgers, receipts, CLI validation, and CLI write plans as authoritative. Chat context is not a substitute for workspace evidence.
- The agent may interpret evidence, explain trade-offs, identify unknowns, and request human choices. It must not hand-assemble CLI-owned ledgers, receipts, manifests, or lifecycle state.

### Selectors and evidence

- Prefer canonical selectors such as \`change:<id>\`, \`patch:<id>\`, \`gate:<id>\`, and \`claim:<id>\` after confirming them through \`list\`, \`status\`, or \`show\`.
- Never resolve ambiguity by recency, filename resemblance, or conversational proximity. Present candidates and stop for selection.
- A decision-ledger event is evidence, not usually the object to decide. Follow its \`change_id\`, \`draft_patch_id\`, or \`gate_id\` back to the originating item.
- Cite workspace-relative paths and stable IDs in conclusions. Mark missing or contradictory evidence as unknown rather than filling gaps from expectation.

### Writes and confirmation

- Collect the complete semantic payload before dry-run. Preview the exact command that would execute, including actor, reason, selector, output path, and artifact-inclusion flags.
- For any semantic or externally shareable write, run the complete command with \`--dry-run --json\`, explain affected paths and risks, and obtain explicit confirmation before execution.
- \`--yes\` skips only a low-risk CLI creation prompt. It never supplies a research decision, authorizes a different payload, bypasses lifecycle evidence, or grants ownership of drifted generated files.
- After execution, reload authoritative state with \`show\`, \`status\`, or the relevant \`check\`; do not declare success from process exit alone.

### Failure classes

| Failure | Response |
| --- | --- |
| Exit 2 / usage or schema error | Correct arguments or payload; do not retry unchanged. |
| Exit 1 / domain blocker | Explain the target, evidence, gate, or current-value conflict and route to the owning workflow. |
| Exit 3 / write conflict | Preserve existing content; inspect ownership or choose a new create-only target. |
| Exit 4 / internal failure | Stop, retain the command and envelope, and report a reproducible failure. |
| Warning-only diagnostics | Explain impact; use strict mode only when the requested completion rule requires zero warnings. |

ARSU owns literature research, synthesis, academic drafting, manuscript review, revision planning, and manuscript draft-patch authoring. ResearchSpec companions own navigation and safe use of ResearchSpec's deterministic contract lifecycle.`;
