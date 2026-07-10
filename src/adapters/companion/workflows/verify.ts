import type { CompanionWorkflowSource } from "../types.js";

export const verifyWorkflow = {
  id: "verify",
  name: "ResearchSpec Verify",
  description: "Assess semantic coherence and readiness across ResearchSpec questions, sources, claims, evidence, manuscript constraints, workflow artifacts, gates, and decisions after deterministic checks pass. Use for evidence-linked readiness, not schema validation or manuscript peer review.",
  instructions: `## Mission

Produce an evidence-linked readiness scorecard and, for a formal workflow Gate, prepare the strict CLI-owned Gate payload. Deterministic validity is a prerequisite, not proof of semantic readiness; no Gate is submitted until the user confirms the displayed verdict and evidence.

## When to Use

- The user asks whether a stage, claim set, research plan, or handoff is ready to advance.
- Contracts validate mechanically but may conflict in meaning, support, limits, or workflow expectations.
- A gate review needs traceable semantic findings without modifying workspace state.

## Do Not Use

- Do not diagnose malformed YAML, schemas, hashes, or generated ownership as the primary job; route to check.
- Do not propose or apply fixes while verifying. Route semantic changes to propose and human choices to decide.
- Do not perform manuscript peer review, copy-editing, or new literature synthesis; use ARSU reviewer or deep research.

## Inputs

- Verification scope: whole workspace, active stage, selected claim(s), manuscript readiness, or a pending lifecycle item.
- Readiness criterion or destination stage/audience.
- Optional claim, source, artifact, gate, or decision selectors and known constraints.

## CLI Examples

\`\`\`bash
researchspec check all --json
researchspec status --json
researchspec show contract:project --json
researchspec show claim:C001 --json
researchspec list artifacts --json
researchspec list gates --json
researchspec list decisions --json
researchspec instructions gate:sf-<instance>/<node> --json
researchspec submit gate:sf-<instance>/<node> --input verdict.json --actor-kind validator --actor-name researchspec-verify --confirmed-by "<human>" --dry-run --json
\`\`\`

## Workflow

1. Define the readiness question and scope. “Valid workspace” and “ready to draft/advance/share” are different claims.
2. Run the relevant deterministic check first. If any blocking diagnostic exists, stop semantic scoring and route to check; record semantic assessment as not evaluated.
3. Read project research question, scope, target output, language, and constraints. Extract the criteria that claims, sources, manuscript, and workflow must satisfy.
4. Inspect source contracts and registered evidence artifacts. Assess coverage, relevance, provenance visibility, and explicit gaps without conducting new research.
5. Inspect each in-scope claim: statement, support links, strength, limits, wording constraints, and relation to the research question. Flag support that is missing, indirect, contradictory, or weaker than the declared strength.
6. Inspect manuscript constraints and sections. Determine whether allowed claims, required sections, target output, and language align; do not judge prose quality unless routing to ARSU review.
7. Inspect active workflow stage, required artifacts, current artifact registry entries, hashes/verification state, and producer/stage metadata. Distinguish an artifact's existence from evidence that it meets semantic expectations.
8. Inspect latest gate events and linked human decisions. A passed gate does not erase contradictory evidence; an unresolved blocking gate prevents readiness.
9. Cross-check lifecycle state: pending changes may make current specs intentionally provisional; applied items need receipts and ledger linkage; postponed items remain unresolved choices.
10. Rate each dimension as pass, concern, blocker, or unknown. Cite at least one stable ID or workspace-relative path for every nontrivial rating.
11. Produce an overall readiness conclusion based on blockers and unknowns, not a numeric average. If useful, include counts but do not imply false precision.
12. For a formal Gate, fetch its dynamic instructions and construct a strict payload using only the declared validator/evidence contract. Show verdict, evidence, limitations, conditions, and advancement consequences to the user.
13. If the user challenges the verdict, re-run verification and mark the payload as reverification, binding challenged basis and any superseded confirmed event. Never offer override before this step.
14. If the user confirms, dry-run and execute the identical submit-gate plan with their real confirmed_by; --yes only binds the mechanical plan. If the confirmed reverification still fails and the user requests an override, route that exact event to Decide.
15. Route remaining findings: mechanical validity to check, semantic contract change to propose, human pending choice to decide, manuscript quality to ARSU reviewer, missing scholarly evidence to ARSU research.

## Readiness Scorecard

| Dimension | Questions |
| --- | --- |
| Research intent | Are RQ, scope, target output, language, and constraints mutually consistent? |
| Sources | Is required coverage represented and traceable to registered evidence? |
| Claims | Do support, strength, limits, and permitted wording align? |
| Manuscript contract | Do sections and constraints permit only the intended argument? |
| Workflow/runtime | Are stage, required artifacts, state, and pending items coherent? |
| Gates/decisions | Are blocking judgments resolved and linked to authoritative records? |
| Lifecycle evidence | Do applied/rejected/archive candidates have matching ledger and receipt evidence? |

## Decision Table

| Finding | Route |
| --- | --- |
| Deterministic check fails | Stop and use check. |
| Evidence exists but claim strength exceeds it | Block readiness and propose a claim change or obtain stronger evidence via ARSU. |
| Manuscript prose quality is uncertain | Mark outside scope and route to ARSU reviewer. |
| Contract is coherent but evidence coverage is unknown | Mark unknown; do not pass. |
| Pending high-impact change affects scope | Treat readiness as conditional and route to decide. |
| All dimensions pass outside a formal Gate | Report ready for the named destination, without advancing state. |
| Formal Gate verdict is confirmed | Submit the exact evidence-bound Gate transaction, then re-query status. |
| User challenges a Gate verdict | Reverify; do not submit the challenged proposal or jump to override. |

## Failure Recovery

- If an item cannot resolve uniquely, present canonical candidates and stop that dimension.
- If evidence files are unavailable or hashes fail, mark the affected conclusions unknown/blocker and route to check.
- If contracts contradict each other, cite both and recommend a proposal; do not choose which is authoritative by preference.
- If the requested readiness criterion is undefined, ask for the destination or use the current workflow stage's explicit gate criteria only.

## Output Contract

Return scope and destination, deterministic precheck, a table of dimensions with pass/concern/blocker/unknown, evidence IDs/paths, contradictions and missing evidence, overall readiness, and routed next actions. For a submitted Gate also return confirmer, event/receipt/plan IDs and post-status; otherwise state that no runtime file changed.

## Guardrails

- Semantic findings must be falsifiable from cited workspace evidence.
- Do not award readiness merely because files exist or a schema passes.
- Do not hand-edit a Gate event or receipt. Only the confirmed CLI Gate transaction may write them.

## Completion

Finish when every in-scope readiness dimension has an evidence-linked rating, blockers and unknowns are explicit, adjacent work is routed correctly, and the workspace remains unchanged.`,
} satisfies CompanionWorkflowSource;
