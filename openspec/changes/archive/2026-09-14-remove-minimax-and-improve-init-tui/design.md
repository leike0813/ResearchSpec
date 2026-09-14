## Context

See [proposal.md](proposal.md) for motivation. Agent-tool metadata currently permits either project-local or tool-defined global Skill roots solely for MiniMax Code. The interactive selector is built on Inquirer's prompt primitives, which already provide a persistent bottom-content region and a typed cancellation error.

## Goals / Non-Goals

**Goals:**

- Make every current Agent-tool Skill destination project-local.
- Keep interactive controls visible without duplicating terminal input handling.
- Convert prompt cancellation into a stable CLI error before initialization writes begin.

**Non-Goals:**

- Migrating or deleting files previously written to `~/.minimax/skills`.
- Removing the generic manifest scope needed to validate historical shared-global ownership records.
- Replacing Inquirer or adding a custom terminal event loop.

## Decisions

### Remove the global destination variant from current tool definitions

Delete MiniMax Code from the registry and make `skillsDir` the only current Skill destination. Delivery and detection then follow one project-local path. Retaining an unused global destination branch would preserve complexity without a supported producer.

The managed-installation schema continues to recognize `shared-global` records so malformed or historical manifests fail safely. Legacy Codex prompt cleanup also remains independently bounded and does not constitute current Skill delivery.

### Use the prompt library's bottom-content contract

Render the control guide as prompt bottom content so filtering and rerendering keep it below the choices. A custom renderer or terminal overlay would duplicate behavior already supplied by the installed prompt library.

### Normalize native cancellation at the init boundary

Allow Inquirer to handle `Ctrl+C`, catch its `ExitPromptError` where init requests selections, and translate it to the CLI's stable `cancelled` error. Selection occurs before the bootstrap write plan is committed, so cancellation naturally remains zero-write.

## Risks / Trade-offs

- Existing schema-2 configs naming `minimax-code` become invalid under the current-contract policy → Report the unsupported tool without reading or deleting its former global files.
- Terminal implementations may display the native interrupt differently → Assert the stable CLI cancellation code and verify the rendered controls in a PTY smoke test.
- Historical `shared-global` support may look unused → Keep it only at the ownership-validation boundary until those records are explicitly retired by a separate change.

## Migration Plan

Release the reduced catalog and prompt behavior together. Users who previously selected MiniMax Code must remove that ID from configuration; any files under `~/.minimax/skills` remain user-managed and untouched. Rollback restores the registry entry and global destination branch without requiring workspace data conversion.
