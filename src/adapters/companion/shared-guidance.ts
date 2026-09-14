export const SHARED_CLI_GUIDANCE = `## Shared CLI Discipline

### File ownership

- Stable specs under \`researchspec/specs/\` own current research intent, sources, claims, and manuscript structure.
- Graph profiles own executable workflow structure. Each run's \`run.yaml\` plus its frozen \`graph.yaml\` is that run's sole runtime authority; every node instance owns its own state file.
- Stable specs, project changes, and run handoffs are directly editable. Only the ResearchSpec CLI may modify run/node state.
- Boundary deliverables remain outside \`researchspec/\`. Exchange them through explicit handoff roles and safe project-relative paths.
- Do not invent a registry, ledger, receipt, runtime index, plan hash, or second workflow state.

### Read before acting

1. Discover the nearest schema \`"2"\` workspace unless the user supplies \`--workspace\` or \`--cwd\`.
2. Begin workspace work with the smallest relevant \`status --json\`, \`list\`, or \`show\` read.
3. Before a run or node action, read \`instructions <selector> --json\`. Use its actual prerequisites, handoff roles, boundary outputs, formal Gates, cost, blockers, and allowed actions.
4. Use machine run and node IDs in selectors. Directory names are for browsing and never resolve identity.

### Human authority

- Starting a run requires a user-confirmed profile entry summary. Nodes authorized by the frozen graph do not require per-node starts; each formal Gate and Decision still requires its own human confirmation.
- Plugin consent is separate from run confirmation. A run confirmation does not authorize plugin installation or optional domain work.
- Alternate-model consent is also separate. Propose only a model the host already exposes through native subagent delegation, and obtain confirmation of the exact model, disclosed content category, and cost for this run or node. Never persist that consent in a stable spec, run state, handoff, or model configuration; child nodes, branches, and revision rounds ask again.
- Verify may recommend a Gate verdict. Only a human-confirmed Decide action records the formal attempt.
- Gate confirmation, a branch choice, and node Advance are separate actions. None silently performs another.

### Command behavior

- Use \`--json\` when structured output is useful. Read \`ok\`, \`data\`, \`diagnostics\`, and \`error\` instead of scraping prose.
- Use \`--dry-run\` to preview file operations. A preview is informative and creates no reusable transaction identity.
- \`--force\` applies only to manifest-owned generated projections or an explicit derived pack output. It cannot overwrite specs, run/node state, handoffs, changes, or external deliverables.
- Direct edits to stable specs, changes, and run handoffs are valid when their contracts remain valid. Recheck the narrowest affected target afterward.

### Failure handling

| Exit | Meaning | Response |
| --- | --- | --- |
| 1 | Current workspace or domain blocker | Explain the owning file and blocker; do not invent a repair. |
| 2 | Usage or semantic input error | Correct the selector, option, or input before retrying. |
| 3 | Write conflict | Preserve current bytes, reread the owner, and retry only with current intent. |
| 4 | Internal failure | Stop and report the reproducible command and structured error. |

Procedures execute only the standalone or graph packet that activated them and return control to ResearchSpec. Companions help the user navigate, propose, decide, and verify contracts without taking scholarly or human authority.`;
