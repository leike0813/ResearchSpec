import type { CompanionWorkflowSource } from "../types.js";

export const verifyWorkflow = {
  id: "verify",
  name: "ResearchSpec Verify",
  description: "Run deterministic checks and prepare evidence-linked semantic findings or a formal Gate recommendation without recording the human verdict.",
  instructions: `## Mission

Assess whether a defined scope is structurally valid and semantically ready. Verify produces findings and, when relevant, a Gate recommendation. It never creates the formal human confirmation.

## Use this Skill when

- The user asks whether stable specs, a handoff, a subflow checkpoint, or a project change is coherent and ready.
- A formal Gate needs an evidence-linked recommendation before the user decides.
- Deterministic checks pass but source support, claim limits, manuscript constraints, or boundary outputs may still conflict.

Peer review, copy-editing, literature synthesis, and manuscript revision belong to the relevant ARSU Skill.

## Inputs

- The verification scope and readiness criterion.
- Relevant stable IDs, subflow/Gate selector, handoff roles, and destination or next action.
- Available boundary evidence at the explicit project-relative paths recorded in the handoff.

## Workflow

1. Run the narrowest deterministic check first:

\`\`\`bash
researchspec check <specs|profiles|subflows|changes|handoffs|tools|plugins|literature-adapters> --json
researchspec instructions gate:<instance>/<gate> --json
researchspec show gate:<instance>/<gate> --json
\`\`\`

2. If blocking diagnostics exist, stop semantic scoring and report the owning file and structured diagnostic.
3. Read only the stable specs, control summary, handoff roles, and external evidence needed for the stated criterion. Check an external path only when the current review consumes that role.
4. Separate observation, interpretation, concern, blocker, and unknown. Cite stable IDs and project-relative paths.
5. For a formal Gate, assess the declared criterion and prepare one recommendation: pass, pass with conditions, or fail. Include evidence, limitations, unresolved conditions, and the consequence of advancing.
6. Present the recommendation to the human. If the human confirms a verdict, route the exact selector, verdict, actor, summary, and evidence role to Decide.
7. After Decide records the attempt, a targeted show/check may confirm visibility. Verify still does not run Advance.

## Readiness dimensions

| Dimension | Review question |
| --- | --- |
| Research intent | Are scope, questions, target output, and constraints consistent? |
| Sources and claims | Are support, strength, limits, and wording traceable through stable IDs? |
| Manuscript contract | Does the structure permit the intended argument without hidden commitments? |
| Handoff | Are required roles explicit, safe, and suitable for the intended consumer? |
| Workflow | Are the owning control's Gate, Decision, child, and transition prerequisites satisfied? |

## Output

Return the scope, deterministic result, evidence-linked findings, blockers and unknowns, overall readiness, and any Gate recommendation. State explicitly that no formal Gate attempt was recorded unless a separate human-confirmed Decide action completed.

## Guardrails

- File existence or schema validity alone does not prove academic readiness.
- Do not modify stable specs, handoffs, external deliverables, project changes, or controls while verifying.
- Do not strengthen claims, invent missing evidence, confirm a Gate, approve an override, or advance a subflow.

## Completion

Finish when every in-scope criterion has a traceable finding and the next owner is clear.`,
} satisfies CompanionWorkflowSource;
