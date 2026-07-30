import type { CompanionWorkflowSource } from "../types.js";

export const verifyWorkflow = {
  id: "verify",
  name: "ResearchSpec Verify",
  description: "Assess semantic coherence and readiness across ResearchSpec questions, sources, claims, evidence, manuscript constraints, workflow artifacts, Gates, and decisions after deterministic checks pass.",
  instructions: `## Mission

Produce an evidence-linked readiness scorecard and, for a formal Gate, submit only the action descriptor's evidence-bound verdict. Deterministic validity is necessary but not proof of semantic readiness; a Gate is always plan-bound and requires human confirmation.

## When to Use

- The user asks whether a stage, claim set, research plan, or handoff is ready to advance.
- Contracts validate mechanically but may conflict in meaning, support, limits, or workflow expectations.
- A Gate review needs traceable semantic findings without bypassing CLI-owned state.

## Do Not Use

- Do not use semantic review as a substitute for malformed schema/hash repair; use direct targeted \`researchspec check\`.
- Do not propose or apply semantic fixes while verifying. Route changes to Propose and choices/overrides to Decide.
- Do not perform manuscript peer review, copy-editing, or new literature synthesis; use the relevant ARSU Skill.

## Inputs

- Verification scope, readiness criterion or destination, and optional claim, source, artifact, Gate, or decision selectors.

## CLI Examples

\`\`\`bash
researchspec check all --json
researchspec check artifacts --json
researchspec status --json
researchspec instructions gate:sf-<instance>/<node> --json
researchspec submit gate:sf-<instance>/<node> --input verdict.json --actor-kind validator --actor-name researchspec-verify --confirmed-by "<human>" --dry-run --json
researchspec show gate:sf-<instance>/<node> --json
\`\`\`

## Workflow

1. Define the readiness question and run the relevant deterministic check. Blocking diagnostics stop semantic scoring and are reported through their direct repair boundary.
2. Inspect the minimum project, source, claim, manuscript, artifact, lifecycle, and prior Gate/decision evidence needed for the scope. Rate each dimension pass, concern, blocker, or unknown with stable IDs or workspace-relative paths.
3. For \`revision_completeness\`, first run the artifact check and inspect the accepted Draft Patch v3, apply report, Annotation Sets, and Annotation Resolution Report. Mechanical coverage must validate hashes, complete dispositions, and operation mappings with zero unresolved entries. Treat answered, deferred, rejected, and superseded items according to their recorded evidence; this check does not prove the response is academically sufficient.
4. For a formal Gate, begin with bounded \`status --json\`, select the \`gate:\` selector, and fetch its instructions/action descriptor. Use only its declared validator/evidence contract; do not construct a strict payload from general prose.
5. Explain the verdict, evidence, limitations, conditions, and advancement consequence. After mechanical annotation coverage passes, independently assess whether each response actually addresses the review intent. If challenged, reverify and bind the new verdict to the challenged basis before any override discussion.
6. Gate submission is \`plan_bound\`: preview the exact descriptor-declared verdict, show writes and \`plan_sha256\`, obtain the named human confirmation, then execute the unchanged plan with the matching expected hash. A failed confirmed reverification may route its exact event to Decide; it never passes itself.
7. Follow returned \`next_selectors\` for targeted Gate visibility or the next frontier. Route remaining mechanical defects to Check, semantic contract changes to Propose, human choices to Decide, and scholarly/manuscript work to ARSU.

## Readiness Scorecard

| Dimension | Questions |
| --- | --- |
| Research intent | Are RQ, scope, target output, language, and constraints mutually consistent? |
| Sources and claims | Are coverage, support, strength, limits, and wording traceable and aligned? |
| Manuscript contract | Do sections and constraints permit the intended argument? |
| Workflow/lifecycle | Are required artifacts, state, pending items, Gates, and decisions coherent? |

## Decision Table

| Finding | Route |
| --- | --- |
| Deterministic check fails | Stop and use Check. |
| Evidence is weaker than a claim | Block readiness and route to Propose or ARSU research. |
| Semantic criterion is undefined | Ask for a destination or use the formal Gate descriptor. |
| Formal Gate verdict is confirmed | Use the exact plan-bound Gate transaction and returned next selector. |
| User challenges a Gate verdict | Reverify; do not submit the challenged proposal or jump to override. |

## Failure Recovery

- If an item cannot resolve uniquely, present canonical candidates and stop that dimension.
- If evidence files are unavailable or hashes fail, mark the conclusion unknown/blocker and route to Check.
- If contracts contradict, cite both and route a proposal; do not choose by preference.

## Output Contract

Return scope, deterministic precheck, evidence-linked ratings, overall readiness, routed next actions, and for a submitted Gate the confirmer, event/receipt/plan evidence, and \`next_selectors\`. Otherwise state that no runtime file changed.

## Guardrails

- Semantic findings must be falsifiable from cited workspace evidence.
- Do not award readiness merely because files exist or a schema passes.
- Only the confirmed plan-bound CLI Gate transaction may write a Gate event or receipt.

## Completion

Finish when every in-scope dimension has an evidence-linked rating, blockers and unknowns are explicit, and the next owner is clear.`,
} satisfies CompanionWorkflowSource;
