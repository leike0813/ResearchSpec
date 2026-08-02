export const SHARED_CLI_GUIDANCE = `## Shared CLI Discipline

### File ownership

- Stable specs under \`researchspec/specs/\` own current research intent, sources, claims, and manuscript structure.
- The project profile owns the pipeline graph. Each subflow's \`control.yaml\` is that instance's sole runtime authority.
- Stable specs, project changes, and handoffs are directly editable. Only the ResearchSpec CLI may modify \`control.yaml\`.
- Boundary deliverables remain outside \`researchspec/\`. Exchange them through explicit handoff roles and safe project-relative paths.
- Do not invent a registry, ledger, receipt, runtime index, plan hash, or second workflow state.

### Read before acting

1. Discover the nearest current workspace unless the user supplies \`--workspace\` or \`--cwd\`.
2. Begin workspace work with the smallest relevant \`status --json\`, \`list\`, or \`show\` read.
3. Before a route or control action, read \`instructions <selector> --json\`. Use its actual prerequisites, handoff roles, boundary outputs, formal Gates, cost, blockers, and allowed actions.
4. Use machine instance IDs in selectors. Directory names are for browsing and never resolve identity.

### Human authority

- Starting a standalone subflow, child, branch, or dynamic revision round requires its own route summary and human confirmation.
- Plugin consent is separate from route confirmation. A parent confirmation does not authorize a child.
- Alternate-model consent is also separate. Propose only a model the host already exposes through native subagent delegation, and obtain confirmation of the exact model, disclosed content category, and cost for this subflow. Never persist that consent in a stable spec, control, handoff, or model configuration; children, branches, and revision rounds ask again.
- Verify may recommend a Gate verdict. Only a human-confirmed Decide action records the formal attempt.
- Gate confirmation, a branch choice, and Advance are separate actions. None silently performs another.

### Command behavior

- Use \`--json\` when structured output is useful. Read \`ok\`, \`data\`, \`diagnostics\`, and \`error\` instead of scraping prose.
- Use \`--dry-run\` to preview file operations. A preview is informative and creates no reusable transaction identity.
- \`--force\` applies only to manifest-owned generated projections or an explicit derived pack output. It cannot overwrite specs, controls, handoffs, changes, or external deliverables.
- Direct edits to stable specs, changes, and handoffs are valid when their contracts remain valid. Recheck the narrowest affected target afterward.

### Failure handling

| Exit | Meaning | Response |
| --- | --- | --- |
| 1 | Current workspace or domain blocker | Explain the owning file and blocker; do not invent a repair. |
| 2 | Usage or semantic input error | Correct the selector, option, or input before retrying. |
| 3 | Write conflict | Preserve current bytes, reread the owner, and retry only with current intent. |
| 4 | Internal failure | Stop and report the reproducible command and structured error. |

ARSU Skills own research, synthesis, drafting, review, and revision work. ResearchSpec Companions help the user navigate, propose, decide, and verify the file contracts without taking scholarly or human authority.`;
