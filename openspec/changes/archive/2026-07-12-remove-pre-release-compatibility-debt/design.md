## Context

The current runtime parses both a static top-level work graph and the Schema 0.2 subflow-instance graph. The old model leaks into selectors, submission confirmation, validation profiles, initialization profiles, status rendering, Agent projection reconciliation and current specifications. The unfinished Material Passport change is built on the current instance model but uses compatibility terminology for an external ARS import.

## Goals / Non-Goals

**Goals:**

- Make the subflow-instance model the only executable workflow and state contract.
- Remove pre-release aliases and migration branches instead of deprecating them.
- Preserve one-way ARS Material Passport evidence import with explicit provenance and no runtime authority.
- Keep generic ownership, drift, hash, receipt and audit protections.

**Non-Goals:**

- Rewriting vendored ARS history or generated audit Before text.
- Renumbering unrelated current `0.1` research contracts.
- Removing routing fallbacks, stale-hash checks or historical artifact/Decision records.

## Decisions

1. `WorkflowDefinitionSchema` and `RunStateSchema` become strict single-model schemas. Static workflow/run-state types, type guards and singleton stage fields are deleted rather than retained as aliases.
2. The only profile is `arsu-v0-1`; init no longer accepts `--profile`. Existing incompatible workspaces fail validation and receive no migration path.
3. Work and Gate selectors are always instance-scoped. Submission policy is `automatic|manual`, confirmation basis is `subflow_start|per_artifact`, and validation profile is `text-artifact|binary-file-artifact`.
4. Artifact, Gate and Decision ledgers use explicit current native and imported-evidence variants. Imported ARS evidence retains `authority: imported_evidence` and is excluded from all current authority calculations.
5. Material Passport fields and types use `material_passport_import` terminology. Converter-owned metadata uses contract integration terminology; generated instructions describe one-way import only.
6. Agent delivery retains generic manifest ownership reconciliation. Never-released Companion IDs receive no product-specific retirement behavior.
7. Current main specs and docs are edited in the same implementation so no active SSOT continues to prescribe removed behavior.

## Risks / Trade-offs

- Old development workspaces stop loading. This is intentional and covered by rejection tests.
- Strict registry variants may reveal previously implicit artifact shapes. All current writers will emit and validate one explicit variant before the loose catch-all is removed.
- Converter terminology changes touch generated output broadly. Regeneration, check and idempotence gates prevent partial drift.
- The worktree already contains related uncommitted work. Changes will be incremental and no existing edits will be reset or overwritten wholesale.
