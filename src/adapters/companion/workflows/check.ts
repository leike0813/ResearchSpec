import type { CompanionWorkflowSource } from "../types.js";

export const checkWorkflow = {
  id: "check",
  name: "ResearchSpec Check",
  description: "Run and explain deterministic ResearchSpec validation for contracts, runtime, artifacts, or tool delivery; classify safe repair routes and recheck authorized fixes. Use for validation failures, not semantic readiness or manuscript review.",
  instructions: `## Mission

Use the CLI's deterministic validators to locate concrete contract, runtime, artifact, and generated-delivery failures. Explain what each diagnostic proves, distinguish repair authority, and verify any authorized repair with the same check.

## When to Use

- The user asks whether a ResearchSpec workspace is structurally valid or why a command is blocked.
- A diagnostic code, malformed contract, dangling reference, artifact hash, tool manifest, or generated drift needs explanation.
- Another workflow requires a deterministic precondition before semantic reasoning or a write.

## Do Not Use

- Do not decide whether claims are academically well supported or a manuscript is ready; use \`researchspec-verify\` or the ARSU reviewer.
- Do not silently change research questions, claim strength, constraints, or workflow semantics; route such fixes through \`researchspec-propose\`.
- Do not accept pending changes, fabricate lifecycle evidence, or use \`--force\` without explicit generated-file ownership authorization.

## Inputs

- Target: \`all\`, \`contracts\`, \`runtime\`, \`artifacts\`, or \`tools\`.
- Whether warnings must fail the completion rule.
- Optional diagnostic codes or paths to focus on and explicit repair authorization.

## CLI Examples

\`\`\`bash
researchspec check all --json
researchspec check contracts --json
researchspec check runtime --json
researchspec check artifacts --json
researchspec check tools --strict --json
\`\`\`

## Workflow

1. Translate the request to the narrowest check target; use \`all\` only for a complete health assessment or an unknown failure surface.
2. Run \`researchspec check <target> --json\`. Add \`--strict\` only when the user or downstream gate explicitly requires warnings to fail.
3. Read envelope status and group diagnostics by blocking state, then severity, code, and path. Do not summarize only by count.
4. For every blocker, explain the violated invariant and which downstream commands or views may be unreliable.
5. Classify the repair route:
   - mechanical: syntax, missing required file, invalid safe ID, stale hash, or deterministic reference repair with no change in research meaning;
   - semantic: research intent, claim wording/strength/limits, source policy, manuscript constraint, or workflow meaning;
   - human decision: pending change, gate override, accepted limitation, or ownership choice.
6. For mechanical repairs, inspect the current file and propose the minimum edit. Edit user-owned content only when the user authorized repair and the intended value is unambiguous.
7. Route semantic repairs to \`researchspec-propose\` with target path, current value, evidence IDs, and risk. Route pending human choices to \`researchspec-decide\`.
8. For generated drift, compare the manifest ownership evidence and user modification. Preserve by default; \`--force\` is valid only after explicit authorization for that manifest-owned file.
9. Rerun the exact same target and strictness after each authorized repair. Do not switch to a broader check and obscure whether the original diagnostic cleared.
10. Report resolved codes, remaining blockers, warning implications, and one next action.

## Decision Table

| Diagnostic meaning | Route |
| --- | --- |
| Parse, schema, required path, or safe-ID error | Mechanical repair after inspecting the authoritative schema. |
| Dangling artifact/claim/decision reference | Repair only from known authoritative IDs; otherwise stop as unknown. |
| Claim, scope, contribution, or constraint meaning is wrong | Propose a contract change. |
| Pending decision or blocking gate | Decide workflow; do not edit ledgers. |
| Manifest-owned file drift | Preserve unless the user authorizes force for the identified file. |
| Warning is acceptable to requested gate | Report it; do not use strict mode merely to create work. |

## Failure Recovery

- On workspace discovery failure, report cwd/workspace inputs and request the correct path.
- On invalid JSON envelope or internal error, retain stdout/stderr and command for diagnosis; do not infer a pass.
- If one invalid document prevents dependent checks, repair or isolate that root error before chasing derivative diagnostics.
- If a repair would require inventing missing semantic content, stop and request the owner or route to propose.

## Output Contract

Return the command and target, pass/fail status, diagnostic groups with code/path/blocking state, repair classification, actions actually authorized and performed, recheck result, remaining blockers, and one recommended owner/action.

## Guardrails

- The CLI defines deterministic validity; do not downgrade errors by prose.
- Upstream ARSU history/version text is not a failure unless a current ResearchSpec contract explicitly forbids it.
- Never weaken a contract or gate solely to make a check pass.

## Completion

Finish when the requested check has been run, every blocker has an evidence-based route, authorized repairs have been rechecked, and unresolved semantic or human choices are explicitly handed off.`,
} satisfies CompanionWorkflowSource;
