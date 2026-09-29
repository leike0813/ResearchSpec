import type { CompanionWorkflowSource } from "../types.js";
import { renderLiteratureSourcePolicyProjection } from "../../../literature-adapters/provider-policy.js";

const GRAPH_REASONS = "formal Gates or Decisions, parallel or joined execution, child profiles, revision rounds, or auditable workflow state";

export const navigateWorkflow = {
  id: "navigate",
  name: "ResearchSpec Navigate",
  description: "Use for literature synthesis, manuscript writing or revision, evidence checks, peer review, reviewer replies, and continuing research work in a ResearchSpec project, even when the request does not name ResearchSpec. Navigate discovers the relevant procedure or governed workflow and carries the work through its current instructions.",
  instructions: renderNavigateExecutionGuidance("skill"),
} satisfies CompanionWorkflowSource;

/**
 * Canonical execution guidance for the single Navigate entry. The Skill surface
 * reads its installed references; a commands-only surface reaches the same
 * detail through the CLI it is part of, so it never points at a file it does
 * not deliver. Both surfaces share this one body.
 */
export function renderNavigateExecutionGuidance(surface: "skill" | "command"): string {
  return `## Goal

Translate the user's academic request into a legal ResearchSpec action, carry it through the appropriate standalone procedure or graph workflow, and keep the user informed at every human decision boundary. Prefer the lightest mode that provides the lifecycle guarantees the work actually needs.

## When To Use

Use Navigate when the user:

- describes an ordinary literature, manuscript, evidence, or review task, including a bounded one that names no ResearchSpec term;
- describes a vague, broad, or cross-capability academic goal;
- asks which ResearchSpec procedure, profile, command, or selector to use;
- wants to start, resume, inspect, verify, explain, export, or finish governed work;
- needs plugin-domain, Zotero Adapter, or alternate-model routing within ResearchSpec.

An explicit bounded procedure can route directly after the same eligibility check. An explicit graph selector still requires current instructions before any action.

## Work Loop

For scholarly work in an initialized project:

1. Run \`researchspec status --json\`. If a related confirmed run is unfinished, follow its current exact selector instructions and pending controls. A completed historical run does not take over a new task.
2. Otherwise, if continuing ordinary work, compare the matching task note with current materials. If the work needs ${GRAPH_REASONS}, follow the Graph section below. For standalone work, search \`researchspec list procedures --query "<short domain terms>" --json\`; translate a Chinese request into useful catalog terms when needed. Inspect promising cards with \`show procedure:<id> --json\`. Retry with different terms only if the first search has no suitable candidate.
3. For standalone work, load \`researchspec instructions procedure:<id> --json\` for the selected eligible procedure. Check its required inputs against actual files before producing content. If a required material is missing, stop and ask one focused question about it.
4. Carry out the selected packet's scholarly work inline or through an eligible worker. Save its declared outputs as ordinary project files outside \`researchspec/\`; a chat-only answer does not replace a declared file. For a second standalone procedure, pass the first output's project-relative path only through a matching declared input role.
5. Report the produced paths, evidence and limits, unresolved items, and next step. For graph work, reread status after each CLI mutation. Stop for a fresh human verdict or choice at each pending Gate or Decision.

For an explanation-only request, use the narrowest current read command; it needs no research deliverable. An unrelated request or explicit opt-out uses host-native capabilities.

## Non-goals

- Do not make human Gate verdicts, branch choices, run confirmations, plugin selections, managed-library authorizations, or alternate-model consent.
- Do not treat catalog prose, this entry, or a reference file as runtime authority.
- Do not create a graph run for ordinary file work merely to continue it. Continuation alone stays standalone with a task note; use a graph only for ${GRAPH_REASONS}.

## Inputs And Outputs

Inputs may include the user's goal, project files, a procedure or profile name, an existing run, or a request for explanation. For workspace actions, discover the current schema \`"2"\` workspace and read structured CLI output. Ask the user only for a decision or missing material that changes the legal route or deliverable.

For a completed standalone capability, use the single result report defined below. For governed work, report the current CLI-confirmed state and next action. Name internal mode names, procedure IDs, and selectors only when the user needs them to act.

Never claim a run, node, Gate, Decision, handoff, plugin, or managed-library mutation unless the CLI completed it successfully.

## Reference Loading

${surface === "skill"
    ? `Use this main file by default. Read references only at these decision points:

- Read [CLI handbook](references/cli-handbook.md) before constructing a nontrivial or file-based payload, explaining the complete CLI, comparing command options, or troubleshooting selectors, syntax, payload fields, or exit classes.
- Read [ARSU route catalog](references/arsu-routes.md) when a goal is vague or crosses capabilities, when comparing ARSU routes or profile entries, or when prerequisites, boundary outputs, Gates, risk, and cost affect routing.

The references provide detail. The complete mode decision, authority boundaries, confirmation rules, and recovery flow remain here.`
    : `This commands-only entry installs no Skill-relative reference file. Reach the same detail through the CLI at these decision points:

- Run \`researchspec --help\` or \`researchspec <command> --help\` before constructing a nontrivial or file-based payload, explaining the complete CLI, comparing command options, or troubleshooting selectors, syntax, payload fields, or exit classes.
- Run \`researchspec list procedures --query "<terms>" --json\` and, in a workspace, \`researchspec list profiles --json\` when a goal is vague or crosses capabilities, or when comparing profiles, prerequisites, boundary outputs, Gates, risk, and cost before choosing an entry.

The complete mode decision, authority boundaries, confirmation rules, and recovery flow remain here.`}

## Current Facts

Read the CLI envelope's \`ok\`, \`data\`, \`diagnostics\`, and \`error\` fields. Static procedure discovery works outside a workspace without initializing one. Before activation or any graph action, read \`instructions <selector> --json\` and treat that packet as the executable contract. Use machine-returned IDs, not a directory name, title, route description, or earlier status snapshot.

## Choose The Execution Mode

Before selecting standalone work for a request, check whether a relevant unfinished confirmed run already owns that work. If so, read current \`status --json\` and its exact selector instructions and resume through its pending controls. A completed historical run stays closed and never takes precedence over a new independent task.

### Standalone

Choose standalone when the request can proceed through ordinary project files without ${GRAPH_REASONS}. Continuation alone stays standalone with a task note.

Use the work loop above; do not ask the user to name a procedure first. If two different searches find no suitable candidate, use host-native capabilities and say the work is outside a governed ResearchSpec run. Read package resources only when the selected packet requires them.

When the request needs several standalone procedures, connect them only where one packet's declared output satisfies the next packet's declared input. Pass the produced ordinary project-relative path outside \`researchspec/\` explicitly to the next activation. If no declared link exists, report the gap or ask one focused question; do not infer a link. Chaining creates no run, handoff, or hidden activation state.

On completion, give one user-facing standalone result report: outcome and every produced ordinary file path; evidence and its limits; unresolved items; and the next step. Show internal mode names, procedure IDs, or selectors only when the user must act on them. A standalone finding is working evidence, never a completed run, node, Gate, or Decision.

For sustained ordinary research work, only the main Agent maintains \`work/researchspec-notes/<task-id>.md\` outside \`researchspec/\`; delegated workers return outputs for the main Agent to validate before it updates the note. Record the user's goal and delivery expectations; inputs and produced files with their purpose; completed substantive work and evidence limits; open questions and the next step; and any related run selector. Update the note when a stage output is reached, the work is blocked, or a work session ends. A one-shot exchange with no continuing deliverable creates no note.

To resume ordinary work, read the related note and check its recorded materials and outputs against current project files. Never choose a task by note modification order:

| What current materials show | Response |
| --- | --- |
| Several plausible notes, with no way to identify the task | Ask one focused question naming the candidate tasks. |
| A difference changes task identity, required inputs, or the next step, and the materials cannot settle it | Name the affected material and ask one focused question; do not continue the dependent work. |
| A difference leaves task identity, required inputs, and the next step intact | Report the difference and continue without requesting confirmation. |

Apply unfinished-run precedence before continuing a related task; a completed historical run does not block a new standalone task.

A note never authorizes a run, node, Gate, Decision, handoff, or transition claim; report workflow state only from current CLI output. If ${GRAPH_REASONS} become necessary mid-task, follow the existing graph entry and confirmation rules. Passing declared ordinary file outputs to another standalone procedure does not itself require graph scheduling.

Use \`researchspec-propose\` for an adaptable contract change, \`researchspec-verify\` for evidence-backed checking, and \`researchspec-decide\` only to prepare or record an already authorized governance action through its exact packet.

### Graph

Choose a graph profile when the work needs ${GRAPH_REASONS}. Continuation alone stays standalone with a task note; ordinary declared file chaining alone does not require a graph.

For a new root run:

1. Read \`status --json\`, then identify candidate routes. For vague or cross-capability goals, compare candidate routes before choosing a profile.
2. Run \`instructions profile:<profile-id> --json\`. Use only entries returned as executable by that profile.
3. Present one exact entry summary: entry ID and node, stable-spec prerequisites, required handoff roles and material paths, boundary output roles, formal Gates, Decisions, source policy, risk, and cost.
4. Ask for fresh confirmation of that entry and its frozen graph. Confirmation authorizes one root run; it does not decide Gates, Decisions, plugins, managed-library effects, or alternate-model use.
5. After confirmation, construct the Start payload from the returned \`start_input\` fields and run \`researchspec start profile:<profile-id> --input <file> --json\`.
6. Reread status and continue from its current frontier.

For an active workspace, resume from exactly one status collection:

| Status collection | Next action |
| --- | --- |
| \`frontier\` | Read \`instructions node:<run>/<node> --json\`, activate its graph procedure packet, produce declared outputs, then submit with \`advance node:<run>/<node>\`. |
| \`pending_subgraph_starts\` | Start the exact returned child-profile node selector. Parent authorization covers the declared child start; do not ask for another root-run confirmation. |
| \`pending_gates\` | Read \`instructions gate:<run>/<node> --json\`, verify evidence, present a recommendation, obtain this Gate's human verdict, then call \`decide\`. |
| \`pending_decisions\` | Read \`instructions decision:<run>/<node> --json\`, present allowed choices and consequences, obtain this Decision's human choice, then call \`decide\`. |

After every mutation, rerun \`status --json\`. Never predict the successor from prose or silently combine Gate confirmation, Decision choice, and node Advance.

### Interactive Review Workspace

When current profile, node, Gate, or Decision instructions include \`review_workspace\`, offer its local static browser surface by default for paper-humanizer and review-response review. The user may always continue in chat instead.

1. Capture an exact frozen copy of the entry and relevant included source files and local images outside \`researchspec/\`. Prepare one \`review-workspace.v2\` JSON with a static selectable document, source manifest, and original Agent items. Use the bundled Markdown renderer or host Quarto/LaTeX tools. Ask separately before every render that can run project scripts, filters, or computation; run an approved render in a temporary copy. Show original source for unreliable conversion regions.
2. Open the returned \`asset_path\` when present, or the same packaged \`review-workspace/index.html\` asset. The page imports this frozen JSON, keeps only browser-local drafts, and exports complete revisioned \`review-workspace-result.v2\` files. It never rerenders or relocates comments. Existing v1 drafts use \`review-workspace/v1.html\` and v1 results stay under their old contract.
3. Validate the exported result against the retained frozen workspace and source set. Compare every captured file with current source before applying feedback. If changed, show differences and affected comments and ask how to proceed; if unchanged, locate comments by quote and context, asking if source placement is ambiguous. Translate accepted intent back into the owning annotation intake, paper-humanizer plan, or revision-master SQLite procedure. After processing, prepare a new workspace identity with no processed comments. Never treat browser state as semantic or workflow truth.
4. Before any formal action, reread the exact current selector instructions, present the recommendation, obtain the required human confirmation, and call the existing CLI command. A workspace export never approves a Gate, chooses a Decision, advances a node, edits a handoff, or commits manuscript/SQLite bytes.

If the page cannot be opened, a port is unavailable, or the user prefers conversation, render the same items in chat and preserve the same result fields and confirmation boundary. Do not make browser availability a workflow prerequisite.

### Native

If no eligible procedure or graph entry fits, use the host Agent's native capabilities and state that the work is outside a governed ResearchSpec run. Do not invent a procedure, profile, selector, or workflow record.

## Native Procedure Delegation

The activation packet's \`delegation\` field is advice, not workflow authority. Use only the exact recommended role:

- Delegate an eligible \`researchspec-reviewer\` packet by default when the host profile is available and its effective model is inherited or separately authorized. A Reviewer starts from a fresh context, may write only the declared review outputs, and must not modify the material it evaluates.
- Delegate an eligible \`researchspec-executor\` packet only when context isolation helps or when independent frontier nodes have disjoint outputs and can run in parallel. Keep simple work inline.
- Never delegate a packet whose recommendation is null. Keep \`mixed\`, \`script\`, reference-only, and coordinator work in the parent.

Dispatch at most one worker per independent packet. Give it the packet unchanged. Workers never call ResearchSpec mutation commands, ask the user, choose a model or cost, make a Gate or Decision, or delegate another agent. If input, authority, or an allowed tool is missing, the worker stops and returns the blocker to Navigate.

Require this brief from every worker:

\`\`\`text
status: completed | blocked
procedure: <id>@<content_sha256>
outputs: <role -> path>
checks: <checks performed>
blocker: <none or action required from Navigate>
\`\`\`

Validate the returned hash, paths, and declared outputs in the parent. Only then may Navigate run the owning CLI command, and it must serialize all workflow mutations even when semantic workers ran in parallel. The brief itself never completes a node, run, Gate, Decision, or consent action.

A profile with no documented inheritance, an unknown effective model, or an alternate model requires the existing current run/node disclosure of exact model, content category, and cost before dispatch. Without that consent, execute inline. Never persist consent or configure the model through ResearchSpec.

## Explain, Export, And Finish

- To explain current work, read status and the narrowest matching \`show\` or \`instructions\` selector. Separate known file facts from interpretation and unknowns.
- To inspect or export an owner, use the relevant read command or \`pack run:<id>\` / \`pack change:<id>\`; ordinary boundary deliverables remain project files outside \`researchspec/\`.
- To verify, activate the exact Verify procedure or run the narrowest static \`check\` target. Verification recommendations do not mutate controls.
- To finish governed work, satisfy the current packet, record every separately confirmed control, advance the owning node, and reread status until the selected run is complete. Archive only when the user requests the corresponding archive transaction.

## Human Consent Boundaries

Keep these confirmations separate and current:

- one root-run confirmation for the exact profile entry summary;
- one confirmation for each formal Gate verdict, Decision choice, or failed-Gate override;
- plugin installation consent for explicit domain IDs after an exact preview;
- managed-library authorization bound to the current run, route, collection, candidates, effects, and time window;
- alternate-model confirmation naming the host-available model, disclosed content category, and cost for the current run/node.

When the selected capability could benefit from optional plugin assistance, suggest no more than three relevant domains in one batch and preview the exact install before seeking consent separate from run confirmation. Declining, failing, or leaving that assistance unselected must leave the selected capability, selector, frontier, and workflow authority unchanged. Alternate-model work uses only a host-native subagent; never configure or call a model service, persist model consent, or carry consent into another node, branch, round, child, or run.

${renderLiteratureSourcePolicyProjection()}

## LLM And CLI Responsibilities

The Agent must interpret intent, compare semantic routes, summarize entry contracts, perform scholarly judgment through the selected producer, explain evidence, prepare recommendations, and ask the user for decisions.

The ResearchSpec CLI must validate payloads and selectors; render current instructions; create runs; validate outputs; mutate nodes, handoffs, Gates, Decisions, changes, plugins, and archives; calculate the frontier; and return structured diagnostics. Do not hand-edit CLI-owned workflow state or manually reproduce renderer-owned JSON/YAML/Markdown.

## Forbidden

**Never:**

- edit \`run.yaml\`, frozen \`graph.yaml\`, node instance state, or formal Gate/Decision records directly;
- start a run before the user confirms the exact profile entry summary;
- infer current availability, completion, or a successor from route prose or stale output;
- activate an unselected or hash-invalid plugin procedure;
- treat Adapter readiness, an empty library result, or a skipped Adapter as evidence that no relevant literature exists;
- upload private material, install dependencies, configure credentials, or contact an external service unless the selected procedure and host policy explicitly authorize it;
- silently change source policy, procedure, profile entry, execution mode, or deliverable scope.

## Failure Recovery

- Exit 1: report the current workspace or domain blocker and its owning file; do not invent a repair.
- Exit 2: reread help or ${surface === "skill" ? "the installed CLI handbook" : "the relevant CLI command help"}, correct the selector, option, or input, and retry only the corrected request.
- Exit 3: preserve current bytes, reread the owning file and status, then retry only if the user's intent still applies.
- Exit 4: stop and report the reproducible command and structured error.
- Ineligible node: report the returned unmet prerequisites; do not activate its procedure packet.
- Unavailable plugin or Adapter: keep the core route unchanged and disclose the lost assistance or coverage. Pause only when the selected source policy is library-bound.
- Invalid alternate-model result or unavailable dispatch: leave the frontier unchanged and disclose single-model execution.
- Ambiguous human choice: ask one focused question before any mutation.

## Example Flows

Broad request: read status if a workspace exists, compare candidate routes, inspect the selected profile, present its exact entry summary, obtain confirmation, start once, and continue from the returned frontier.

Bounded request: search procedures, inspect and activate one standalone packet, write the requested ordinary deliverable, and return its path without creating workflow state.

Near miss: if the user asks only how a command works, use compact help${surface === "skill" ? " and the installed CLI handbook" : ""}. Do not start a run. If the user later requests a mutation, return to status and exact selector instructions first.

## Success Criteria

Navigation is complete when the request has a justified mode and owner, every executed action came from current structured instructions, all required human decisions were separately confirmed, semantic outputs are named by path, and the final status or standalone result is reported without invented state.`;
}
