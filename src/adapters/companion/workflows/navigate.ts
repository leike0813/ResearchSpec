import { renderNavigateRoutingProjection } from "../../../arsu-converter/routing/navigation-projection.js";
import { renderLiteratureSourcePolicyProjection } from "../../../literature-adapters/provider-policy.js";
import type { CompanionWorkflowSource } from "../types.js";

export const navigateWorkflow = {
  id: "navigate",
  name: "ResearchSpec Navigate",
  description: "Route vague or cross-Skill ARSU goals, distinguish direct Zotero tasks from nested literature providers, resume from the CLI frontier, explain workspace evidence, and safely export derived context without taking semantic or human decisions.",
  instructions: `## Mission

Choose exactly one of Route, Resume, Explain, or Export, then use catalog facts and CLI-owned state to guide the user without inventing workflow authority.

## When to Use

- The academic goal is vague, spans Skills, names no supported mode, or needs a route summary before starting.
- The user wants to resume existing work, understand blockers/evidence, or export/handoff context.
- A direct ARSU request needs prerequisite and current-availability confirmation before execution.

## Do Not Use

- Do not perform literature research, drafting, revision, peer review, or other ARSU semantic production.
- Do not confirm a formal Gate, choose a semantic branch, authorize an override, or treat \`--yes\` as human intent.
- Do not reconstruct availability, graph order, or policy from this Skill; the current CLI status and action descriptor own them.

## Inputs

- User goal or one of Route, Resume, Explain, Export; workspace path if it is not discoverable.
- For Route: desired deliverable, available inputs, acceptable cost, and any named Skill/mode.
- For literature work: whether Zotero is the primary task or a nested provider, source-policy constraints, and whether managed acquisition is requested.
- For Export: audience, persistence need, artifact inclusion, privacy limits, and output path.

## CLI Examples

\`\`\`bash
researchspec status --json
researchspec instructions subflow:tpl-<route> --json
researchspec instructions obligation:<instance>/<node> --json
researchspec instructions completion:<instance>/<node> --json
researchspec instructions case-action:<id> --json
researchspec instructions annotation:<id> --json
researchspec instructions patch:<id> --json
researchspec instructions change:<id> --json
researchspec instructions work:<instance>/<node> --json
researchspec instructions gate:<instance>/<node> --json
researchspec instructions transition:<instance>/<node> --json
researchspec plugin list --summary --json
researchspec plugin show <domain-id> --summary --json
researchspec plugin install <domain-ids...> --dry-run --summary --json
researchspec plugin instructions <skill-id> --json
researchspec handoff --stdout
researchspec pack --out context.zip --dry-run --json
\`\`\`

## CLI Discovery

Keep static command discovery separate from workspace authorization:

1. Classify the request. A question about a command, option, command family, or invocation is static discovery; it does not start academic work or authorize a write.
2. For static discovery, begin with \`researchspec --help\`, then use \`researchspec <command> --help\` for the smallest relevant command. Only when a broader CLI explanation is needed, read \`references/cli-handbook.md\`; it is optional progressive disclosure, not runtime authority.
3. When the selected action depends on current workspace state, a selector, availability, confirmation, a plan, or accepted semantic input, return to \`researchspec status --json\` followed by \`researchspec instructions <runtime-selector> --json\`. Never infer those facts from static help or the handbook.

If the local handbook reference is missing, unreadable, or known to have drifted, fall back to the relevant root or command-scoped \`--help\`. Continue Route, Resume, Explain, Export, and the runtime protocol; handbook availability never blocks core work.

## Workflow

1. Identify one branch. Use Route for a new or materially changed academic goal, Resume for existing work, Explain for evidence questions, and Export for context sharing. Complete any requested read-only branch first.
2. Begin with bounded \`researchspec status --json\`. Read profile mode, current frontier, blockers, and action summaries. Do not infer state from older conversation context.
3. Before routing, classify literature intent. A broad or cross-task Zotero request routes to \`zotero-library-agent\`; a bounded current-library query, acquisition, source analysis, synthesis, or curation task may route directly to its matching Zotero Adapter Skill. Literature inside academic work remains a nested provider for the ARSU producer.
4. For literature-bearing ARSU work, show the source-policy/readiness boundary below. Keep library readiness, route confirmation, plugin consent, and managed-library authorization separate. A \`library-bound\` failure pauses rather than silently changing source policy.
5. **Route:** match the goal against the routing catalog and intersect that semantic match with status subflows by \`route_ref\`. For the selected \`subflow:\` selector, read instructions/action descriptor and show Skill/mode, prerequisites, artifacts, formal Gate policy, risk, cost, and current availability.
6. Use the descriptor policy for Start: \`direct\` starts with descriptor-declared input; \`human_confirmed\` requires the named route confirmation; \`plan_bound\` requires an exact preview and matching plan hash. A changed route, graph, input, decision basis, or plan requires a new descriptor read.
7. At a new/materially changed route or newly ready producer, discover optional domain help with \`plugin list --summary --json\` and inspect only plausible \`plugin show\` results. Suggest at most three domains, preview the exact batch after separate plugin consent, and install only through its plan-bound transaction. Installation never authorizes scripts, dependencies, credentials, network, or sensitive-data transfer.
8. **Resume:** use the current selector family and its descriptor, not a hard-coded pipeline graph:
   - A manuscript-annotation request first uses \`annotation:<id>\` instructions and its bounded intake paths. A review copy may contain any user-chosen prose, markup, direct rewrites, CriticMarkup, or optional generated slots; no marker syntax is required. Preserve complete raw snapshots and the mechanical Review Delta, then let the Host Agent produce the typed interpretation draft, surface ambiguity or high-impact changes, and materialize only ready entries at the returned candidate path. Do not scan the canonical manuscript for implicit feedback, infer semantics in the adapter, or write authority files.
   - After human-confirmed Annotation Set registration, keep the original \`academic-paper:revision\`, \`academic-paper:revision-coach\`, \`academic-paper-reviewer:re-review\`, or pipeline route; never invent an annotation Skill or stage.
   - Adaptive \`obligation:\` routes to the returned ARSU producer; \`completion:\` follows its descriptor, normally direct Advance; \`case-action:\`, \`patch:\`, and \`change:\` route to Propose or Decide according to their action descriptor.
   - Strict \`work:\` routes to its returned producer; \`gate:\` routes to Verify; \`transition:\` with a human choice routes to Decide, while an explicitly direct unique transition may Advance.
   - A candidate submission follows its descriptor policy. Do not create a parallel confirmation rule or require a hash when the descriptor is \`direct\`.
9. When an installed, available, projected plugin materially helps the active producer, invoke it natively if loaded; otherwise call \`plugin instructions <skill-id> --json\` after selection, availability, projection, and manifest-hash checks. Give it a bounded brief and return its result to the original ARSU producer. It never becomes the producer or workflow authority.
10. **Explain:** combine targeted status, list, show, and check reads. Separate evidence, inference, unknown, and conflict. Route a semantic change to Propose; write nothing.
11. **Export:** choose handoff stdout for ephemeral resumption, handoff write for a workspace-derived view, or pack for transport. Explain privacy, artifact inclusion, size, and overwrite risk. These writes remain previewed and explicitly confirmed.
12. After every write, follow \`next_selectors\` for the directed result. Refresh full status only if route selection, conflict recovery, or a missing next selector requires it.

## Decision Table

| Situation | Action |
| --- | --- |
| Vague/cross-Skill goal | Route from catalog facts plus current CLI availability. |
| Broad Zotero goal | Dispatch \`zotero-library-agent\`; do not create an ARSU subflow. |
| Bounded Zotero task | Dispatch its task Skill after scope/readiness confirmation. |
| ARSU work with literature | Keep the ARSU producer and use Zotero as its nested provider. |
| Adaptive obligation | Dispatch the returned producer Skill. |
| Adaptive completion | Follow its descriptor policy and returned next selector. |
| Adaptive case action, patch, or change | Read the action descriptor; route semantic proposal/choice to Propose or Decide. |
| Free-form manuscript feedback | Preserve it in the annotation intake session, have the Host Agent interpret and clarify it, then submit the ready candidate through \`annotation:<id>\` before continuing the existing revision/re-review route. |
| Strict work, Gate, or transition | Dispatch producer, Verify Gate, or apply the transition descriptor respectively. |
| Relevant plugin | Suggest at most three optional domains; keep consent and authority separate. |
| Explanation only | Stay read-only and distinguish evidence from inference. |
| Sharing request | Choose handoff or pack and preview exposure before writing. |

## Failure Recovery

- No matching route: show catalog near misses and missing facts; do not default silently.
- Catalog match absent from the frontier: report it unavailable and cite status blockers.
- Descriptor, plan, or receipt drift: discard stale confirmation, reread instructions, and apply the current policy.
- Ambiguous frontier: present canonical selectors and stop for the required choice.
- Plugin failure or decline: continue the same canonical selector with the base ARSU producer; do not repeat the same suggestion unless the research need changes.
- CLI failure: preserve authoritative files and follow the structured exit class; never repair state, manifests, or ledgers by hand.

## Output Contract

Return the selected branch, workspace evidence, canonical selector, route facts where applicable, descriptor policy, confirmation status, exact dispatch/command, \`next_selectors\`, and next authoritative owner. Mark explained conclusions as evidence, inference, unknown, or conflict.

## Guardrails

- CLI status and instructions own availability, selector scope, graph order, action policy, and transition authorization.
- Navigate may execute only descriptor-authorized non-semantic actions. ARSU owns semantic production; Propose, Decide, and Verify own their respective lifecycle work.
- Parent route confirmation, plugin consent, managed acquisition authorization, and Gate confirmation are distinct. None grants the others.
- A plugin recommendation or helper result never creates a route, work item, Gate, Decision, receipt, frontier, or second state machine.

## Completion

Finish when the user has one evidence-backed route/action, any authorized write has followed its descriptor and returned next selector, and the next owner is explicit.

${renderLiteratureSourcePolicyProjection()}

${renderNavigateRoutingProjection()}`,
} satisfies CompanionWorkflowSource;
