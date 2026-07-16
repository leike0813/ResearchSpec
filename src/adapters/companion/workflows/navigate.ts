import { renderNavigateRoutingProjection } from "../../../arsu-converter/routing/navigation-projection.js";
import type { CompanionWorkflowSource } from "../types.js";

export const navigateWorkflow = {
  id: "navigate",
  name: "ResearchSpec Navigate",
  description: "Route vague or cross-Skill ARSU goals, resume from the CLI frontier, explain workspace evidence, and safely export derived context. Uses catalog route facts and CLI-owned state without performing academic semantic work or human decisions.",
  instructions: `## Mission

Choose exactly one of Route, Resume, Explain, or Export, then use ResearchSpec's catalog facts and CLI-owned workspace state to guide the user without inventing workflow authority.

## When to Use

- The academic goal is vague, spans Skills, names no supported mode, or needs a route summary before starting.
- The user wants to resume existing work, understand blockers or evidence, or export/handoff context.
- A direct ARSU request needs prerequisite and current-availability confirmation before execution.

## Do Not Use

- Do not perform literature research, drafting, revision, peer review, or other ARSU semantic production.
- Do not confirm a formal Gate, choose a branch, authorize an override, or treat \`--yes\` as human intent.
- Do not reconstruct route availability or graph order from this Skill; current authority comes only from CLI status and instructions.
- Do not wrap deterministic \`check\`, \`submit\`, or \`archive\` transactions in a separate Companion.

## Inputs

- User goal or one of the four branch intents: Route, Resume, Explain, Export.
- Nearest ResearchSpec workspace or an explicit workspace path.
- For Route: desired deliverable, available inputs, acceptable cost, and any named Skill/mode.
- For Export: audience, persistence need, artifact inclusion, privacy limits, and output path.

## CLI Examples

\`\`\`bash
researchspec status --json
researchspec plugin list --summary --json
researchspec plugin show <domain-id> --summary --json
researchspec plugin install <domain-ids...> --dry-run --summary --json
researchspec plugin install <domain-ids...> --expected-plan-sha256 <sha256> --yes --summary --json
researchspec plugin instructions <skill-id> --json
researchspec instructions subflow:tpl-<route> --json
researchspec start subflow:tpl-<route> --input start.json --actor-kind agent --actor-name researchspec-navigate --confirmed-by "<human>" --dry-run --json
researchspec instructions work:<instance>/<node> --json
researchspec instructions transition:<instance>/<node> --json
researchspec advance transition:<instance>/<node> --actor-kind agent --actor-name researchspec-navigate --expected-plan-sha256 <sha256> --yes --json
researchspec list artifacts --json
researchspec show claim:<id> --json
researchspec check runtime --json
researchspec handoff --stdout
researchspec handoff --out researchspec/runs/current/handoff.md --dry-run --json
researchspec pack --out context.zip --dry-run --json
\`\`\`

## Workflow

1. Identify one branch. Use Route for a new or changed academic goal, Resume for existing work, Explain for evidence questions, and Export for context sharing. If two are requested, complete the read-only branch first and clearly separate any later write.
2. Resolve the workspace and run \`researchspec status --json\`. Treat diagnostics and \`workflow_control\` as current authority.
3. **Route:** match the goal against the catalog reference below, including near misses. Intersect semantic matches with status subflows by \`route_ref\`; never claim that a catalog route is currently startable merely because it exists.
4. At a new or materially changed Route, an explicit specialist request, or a newly ready work item, evaluate optional plugin assistance. Query \`researchspec plugin list --summary --json\`, then inspect only plausible domains with \`plugin show <domain-id> --summary --json\`. Semantic matching is this Agent's judgment, not CLI authority. Recommend nothing unless one or more specific Skills materially help the current task.
5. For each viable Route candidate, show Skill, mode/entry, prerequisite expansion and missing inputs, primary artifacts, formal Gate policy, risk, cost, and current selector. Keep augmentation separate and optional. If useful uninstalled Skills exist, propose at most three domains in one batch, naming the matching Skills, their purpose, and each domain's direct/resolved Skill counts. State that installation does not authorize network, scripts, dependencies, credentials, or sensitive-data use, and that the canonical ARSU route remains complete without them.
6. Fetch \`instructions subflow:<selector> --json\` for the chosen candidate. Present the full route/child graph summary and obtain exact route confirmation. Dry-run Start with the real payload, show plan hash and writes, then execute the identical plan. A changed route, graph, inputs, decision basis, or plan requires a fresh preview and confirmation.
7. If the user separately confirms a proposed plugin batch, first complete the confirmed core Start, then dry-run \`plugin install <domains...> --summary --json\`. Show the returned domain versions, resolved Skills, projected tools, write summary, and \`plan_sha256\`; execute the identical batch with \`--expected-plan-sha256 <sha256> --yes --summary --json\`. Reload status and installed plugin metadata. Never treat route confirmation as plugin-install consent or reuse consent after plan drift.
8. **Resume:** read only the current CLI frontier. Dispatch ready semantic work to the exact \`producer_skill\` returned by work instructions. Route formal Gates to \`researchspec-verify\`; route multiple transitions, mid-entry choices, review branches, and overrides to \`researchspec-decide\`.
9. When an installed, available, projected Skill materially assists the active producer, invoke it natively if the host has loaded it; otherwise call \`plugin instructions <skill-id> --json\` and follow that exact hash-bound entry in the current session. Give the helper only a bounded brief: current task, necessary inputs, expected response, and forbidden ResearchSpec authority writes. Mention the helper use briefly to the user. Return its result to the original ARSU producer for review and integration; the plugin never becomes the candidate producer.
10. If plugin discovery, installation, activation, or invocation fails, explain the unavailable augmentation and continue the same canonical selector with the base ARSU producer. An unavailable installed entry is recovery state only. A declined suggestion is not a Decision; do not repeat the same suggestion in the current conversation unless the research need materially changes.
11. If Resume exposes exactly one authorized non-semantic transition, fetch its instructions, dry-run Advance, and execute the exact plan with expected plan hash. Do not advance when confirmation, Decision, Gate, receipt, or basis is missing. Existing work does not require route reconfirmation unless its route or plan drifted.
12. If a candidate is already produced, follow its dynamic submission policy: trusted automatic work may use direct hash-bound \`researchspec submit\`; manual work requires an explicit dry-run/confirmation boundary.
13. **Explain:** combine status, list, show, and targeted check. Separate evidence (stable IDs/paths), inference, unknown, and conflict. Write nothing and route semantic changes to Propose.
14. **Export:** choose handoff stdout for ephemeral resumption, handoff write for a workspace-derived view, or pack for transport. Default to excluding artifacts. Explain derivation, staleness, privacy exposure, artifact inclusion, size, and overwrite risk; dry-run every write and obtain explicit confirmation.
15. Reload status/check after any authorized mechanical write. Report the exact selector, receipt/plan evidence, and next frontier rather than inferring success from process exit.

## Decision Table

| Situation | Action |
| --- | --- |
| Vague or cross-Skill new goal | Route from catalog facts plus current CLI availability. |
| Relevant uninstalled plugin exists | Propose up to three domains; require separate batch confirmation and exact plan-hash installation. |
| Installed, available, projected plugin matches active work | Invoke it as a bounded advisory helper; keep the ARSU producer and frontier unchanged. |
| Installed plugin is unavailable | Explain recovery state only; do not recommend its saved Skill snapshot. |
| Plugin is declined or fails | Continue the same core route and suppress repeated prompting for the current conversation. |
| Explicit supported route not yet started | Show the same prerequisite/route summary and require confirmation. |
| Ready work selector | Call instructions and dispatch its returned ARSU producer. |
| Formal Gate | Route to Verify; Navigate cannot confirm it. |
| Multiple transitions or semantic choice | Route to Decide; reject/postpone does not choose another option. |
| One authorized mechanical transition | Dry-run and execute exact plan-hash-bound Advance. |
| Deterministic defect | Use direct targeted check and report the repair owner. |
| Artifact awaiting manual registration | Use direct Submit preview/confirmation, not a Companion. |
| Resolved item awaiting archive | Use direct Archive preview/confirmation, not a Companion. |
| Explanation only | Stay read-only and distinguish evidence from inference. |
| Sharing request | Choose handoff or pack and preview exposure before writing. |

## Failure Recovery

- No matching route: show near misses and missing intent/input facts; do not default silently.
- Catalog match absent from frontier: report it as unavailable in the current workspace and cite status blockers.
- Plan or receipt drift: discard the old confirmation, reload instructions, and preview again.
- Ambiguous frontier: present canonical selectors and stop for the required user choice.
- CLI failure: preserve authoritative files and follow the structured exit class; never repair ledgers, receipts, manifests, or state by hand.

## Output Contract

Return the selected branch, workspace evidence used, canonical selectors, catalog route facts where applicable, current availability/blockers, confirmation status, exact command or dispatched Skill, and the next authoritative frontier. Mark every conclusion as evidence, inference, unknown, or conflict when explaining state.

## Guardrails

- CLI status and instructions own current availability, scoped selectors, graph order, and transition authorization.
- The routing catalog owns route meaning; this Skill owns no parallel route table.
- Parent route confirmation authorizes only the exact displayed plan. It never passes a Gate, selects a branch, or authorizes changed inputs.
- Navigate may execute only confirmed Start/export writes and exact unique mechanical Advance. All semantic work and human decisions remain with their owners.
- Plugin Skills may assist semantic production or be invoked explicitly, but they cannot directly modify ResearchSpec state, artifact registry, Gates, Decisions, or receipts.
- A plugin recommendation never creates a route, subflow, work item, Gate, Decision, receipt, frontier, or second state machine.
- Plugin installation consent authorizes only static projection. It does not authorize bundled script execution, dependency installation, network access, credentials, external services, or sensitive-data transfer.
- A plugin helper result is working material owned and reviewed by the current ARSU producer; high-impact changes still route through Propose, Decide, or Verify.

## Completion

Finish when the user has one evidence-backed route/action, any permitted write is confirmed and rechecked, and the next owner is explicit.

${renderNavigateRoutingProjection()}`,
} satisfies CompanionWorkflowSource;
