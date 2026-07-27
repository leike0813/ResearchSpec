export const SHARED_CLI_GUIDANCE = `## Shared CLI Discipline

### Authority boundary

- Discover the nearest \`researchspec/\` workspace unless the user explicitly supplies \`--workspace\` or \`--cwd\`.
- Use \`--json\` for inspection and preview. Read the envelope's \`ok\`, \`data\`, \`diagnostics\`, and \`error\` fields; do not scrape human prose when structured data exists.
- Treat stable specs, runtime records, registries, ledgers, receipts, CLI validation, action descriptors, and CLI write plans as authoritative. Chat context is not a substitute for workspace evidence.
- The agent may interpret evidence, explain trade-offs, identify unknowns, and request human choices. It must not hand-assemble CLI-owned ledgers, receipts, manifests, or lifecycle state.

### Static discovery

- Use \`researchspec --help\` to discover the public command surface, then the smallest relevant \`researchspec <command> --help\` or \`researchspec plugin <subcommand> --help\` surface for syntax and options. These reads require no workspace.
- Static help describes command shape only. If the question becomes workspace-bound, return to \`status --json\` and the selected action's \`instructions <selector> --json\`; never infer availability, semantic input, confirmation, policy, or authorization from help text.

### Selector and descriptor protocol

1. Start a workflow write with a bounded \`researchspec status --json\` read. Use its current profile mode, frontier, blockers, allowed/recommended actions, and selectors only to locate the next action.
2. Fetch \`researchspec instructions <selector> --json\` before choosing a write. Its action descriptor is the source of truth for accepted semantic input, prerequisites, execution policy, confirmation, and postconditions.
3. Supply semantic input only. Never derive mechanical fields such as hashes, receipts, transition state, or ledger records outside the CLI.
4. Follow the result's \`next_selectors\` first. Read only the named next selector or a directly relevant \`show\`/\`check\`; refresh full status only when route selection, a conflict, or missing next selector requires it.

### Execution policy

- \`direct\`: the CLI plans and revalidates during the single invocation. A dry-run is optional unless the descriptor requires it; do not manufacture or replay a plan hash.
- \`human_confirmed\`: explain the exact semantic consequence and obtain the named human confirmation required by the descriptor. A dry-run is optional unless the descriptor requires it.
- \`plan_bound\`: preview the exact semantic payload with \`--dry-run --json\`, show the resulting writes and \`plan_sha256\`, obtain the required human confirmation, then execute the unchanged payload with the matching expected plan hash and any descriptor-required \`--yes\`.
- \`--yes\` confirms only the CLI prompt or binds an already reviewed plan. It never supplies a research decision, Gate confirmation, changed payload, or consent for a drifted plan.

### Selectors and evidence

- Prefer canonical selectors such as \`change:<id>\`, \`patch:<id>\`, \`case-action:<id>\`, \`gate:<id>\`, and \`claim:<id>\` after confirming them through \`list\`, \`status\`, or \`show\`.
- Never resolve ambiguity by recency, filename resemblance, or conversational proximity. Present candidates and stop for selection.
- A decision-ledger event is evidence, not usually the object to decide. Follow it back to the originating change, patch, case action, or Gate.
- Cite workspace-relative paths and stable IDs in conclusions. Mark missing or contradictory evidence as unknown rather than filling gaps from expectation.

### Failure classes

| Failure | Response |
| --- | --- |
| Exit 2 / usage or schema error | Correct arguments or payload; do not retry unchanged. |
| Exit 1 / domain blocker | Explain the target, evidence, Gate, or current-value conflict and route to the owning workflow. |
| Exit 3 / write conflict | Preserve existing content; inspect ownership or choose a new create-only target. |
| Exit 4 / internal failure | Stop, retain the command and envelope, and report a reproducible failure. |
| Warning-only diagnostics | Explain impact; use strict mode only when the requested completion rule requires zero warnings. |

ARSU owns literature research, synthesis, academic drafting, manuscript review, revision planning, and manuscript draft-patch authoring. ResearchSpec companions own navigation and safe use of ResearchSpec's deterministic contract lifecycle.`;
