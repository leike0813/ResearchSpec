## Context

See `proposal.md` for motivation and the two delta specs for required behavior. Bootstrap currently combines three concerns in one handler module: resolving user selections, planning static delivery, and committing workspace configuration plus manifest ownership. Fresh init and update need different selection semantics, while re-init needs the interactive surface of fresh init and the safe reconciliation machinery of update.

`researchspec/config.yaml` remains the selection authority. `tool-installation-manifest.json` remains the generated-file ownership authority and is committed last. Project-local generated files may be removed only when they still match recorded ownership; drifted and shared-global files must remain. The CLI must also preserve its machine-mode no-prompt contract.

## Goals / Non-Goals

**Goals:**

- Give fresh init, existing-workspace re-init, and update explicit selection-resolution paths.
- Reuse one current-workspace reconciliation path after the desired selection has been resolved.
- Keep TUI behavior testable without terminal escape-sequence fixtures or prompt-text assertions.
- Preserve existing config and ownership contracts without a schema or migration.

**Non-Goals:**

- Adding a new public command, option, config field, or workspace schema.
- Moving delivery-mode or domain-plugin management into the re-init TUI.
- Changing `update` from its refresh/extension semantics.
- Deleting shared-global files or drifted project files when one workspace deselects a tool.

## Decisions

### 1. Resolve re-init before entering shared reconciliation

`handleCurrentInit` classifies the target before prompting. A missing target follows fresh initialization; an unsupported target fails immediately; a current target loads its index and enters a dedicated re-init selection path. Re-init does not call `handleCurrentUpdate` or carry an `initMode` flag through update options.

After resolution, re-init and update call one current-workspace reconciliation function with explicit inputs: operation identity, target tools to project, complete selected tools, tools whose prior ownership must be reconciled, delivery mode, and selected literature Adapters. This keeps planning, diagnostics, confirmation, atomic execution, result envelopes, and manifest-last behavior in one place.

**Alternative considered:** Extend `CurrentUpdateOptions` with replacement and prompt flags. This keeps less code initially but hides incompatible selection semantics behind booleans and allows future update changes to alter re-init accidentally.

### 2. Treat re-init selectors as complete desired state

For a current workspace, interactively confirmed Agent tools and literature Adapters are complete replacement selections. Explicit `init --tools` and `init --literature-adapters` expressions use the same rule. In non-interactive mode, an omitted field retains its current value; it never falls back to newly detected tools. Fresh non-interactive init retains the existing detected-tool fallback.

Current items are preselected. Detected-only tools remain visible but are preselected only during fresh initialization. When a prompt returns the same set as the stored configuration, the original list is retained so a no-op confirmation does not rewrite config only because display ordering differs.

**Alternative considered:** Preserve update-style additive tool selection for explicit re-init. That would make TUI and flag behavior disagree and leave no direct way for init to express an exact configuration.

### 3. Reconcile the union of previous and desired tools

Re-init projects every desired tool and passes the union of previous and desired tool IDs as the reconciliation boundary. Existing installations for deselected project-local tools are therefore examined and safely retired, while every desired tool receives a complete current projection. The existing reconciliation layer retains drifted ownership evidence and never removes shared-global targets.

`config.yaml` is updated only when tool selection, Adapter selection, or delivery actually changes. The installation manifest is still planned after all projections and committed last.

**Alternative considered:** Update config and leave obsolete projections for a later `update`. That would make config and installed state diverge immediately after a successful reconfiguration.

### 4. Preserve configuration owned by other surfaces

An omitted `--delivery` retains `agent_tools.delivery`. The complete existing config object is copied when writing changes, so `plugins.selected` remains untouched. Domain plugins continue to use the `plugin` command group and are projected to the newly selected tool set through the existing registry resolution.

**Alternative considered:** Add delivery and plugin selectors to the init TUI. This broadens init beyond the established two-step surface and duplicates the plugin consent and preview workflow.

### 5. Use a narrow semantic prompt port for tests

Bootstrap selection accepts a small multi-select port whose requests carry a stable semantic ID (`agent-tools` or `literature-adapters`) plus the existing UI configuration. Production binds it to the searchable Inquirer prompt. Tests inject deterministic answers and assert semantic IDs, configured/detected flags, and preselection state rather than terminal bytes or user-visible wording.

**Alternative considered:** Drive Inquirer through a pseudo-terminal. That would lock tests to escape sequences, timing, and prompt text instead of the stable configuration behavior.

## Risks / Trade-offs

- [Existing automation may have relied on additive `init --tools`] → Document replacement semantics in typed help and direct users to `update --tools` for refresh/extension behavior.
- [A deselected drifted file remains on disk] → Keep the selection authoritative, retain manifest evidence, and emit `generated_file_drift` so the residual file is visible and recoverable.
- [Shared-global files can outlive a project selection] → Keep the established cross-workspace safety boundary; deselection changes project intent without claiming global deletion authority.
- [Prompt ordering can cause a no-op config rewrite] → Preserve the stored list when the selected set is unchanged.
- [Refactoring update and re-init through one writer can couple their behavior] → Pass resolved operation inputs explicitly and keep selection parsing outside the shared reconciliation function.

## Migration Plan

No workspace migration or schema change is required. The behavior ships with the CLI implementation and applies the next time init targets a current workspace. Existing configs and manifests are consumed as-is.

Rollback consists of reverting the CLI, help, tests, and documentation together. Workspaces reconfigured by the new behavior remain valid schema `1` workspaces; no data rollback is needed.
