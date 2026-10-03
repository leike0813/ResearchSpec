# Design

## Context

See proposal.md for motivation. The runtime Procedure catalog has optional capability manifests; standalone packets currently expose declarations without concrete bindings. Graph input resolution, path guards, validators and frontier evaluation already exist. Patent maintenance privately calls the ARSU profile emitter, bypassing its manifest. The user selected on-demand inspection and native bridging for ordinary tasks.

## Goals / Non-Goals

**Goals:** Put material facts behind one stateless inspection interface, share eligibility and recovery derivation, and restore coherent generated output.

**Non-Goals:** A standalone execution state machine, mandatory check sequence, semantic proof from file existence, new public commands, automatic validator/service execution, or live-model acceptance.

## Decisions

1. Add typed optional `inputs`/`outputs` material DTOs and an inspector under `src/procedures/`. Input bindings carry role and either path or JSON value; output bindings carry role/path. Omitted arrays mean uninspected; empty arrays mean inspect declared omissions. Input and delivered-output files use existing safe ordinary project path checks. Planned output paths use reference checks only. No new source lineage is invented for graph-only `source_policy` values. Undeclared roles are advisory supplemental context, not an execution whitelist.
2. `instructions procedure:... --input file` adds `material_bindings` and `material_inspection` to packet 1 without replacing declarations. `check procedure:... --input file` uses the same inspector in delivered-output mode. Findings are non-blocking diagnostics; explicit strict checking can fail its own command. Invalid payloads/selectors remain usage failures. No payload is required to activate.
3. Reuse the validated runtime manifests, role policy and path guard rather than create a material registry. No-manifest Procedures report unknown declaration scope. Static readability does not inspect content or run script/schema validators; package-local execution remains separately authorized Agent work.
4. Add one static eligibility resolver from current schema-2 selection and the existing domain catalog. Its states are `workspace_required`, `eligible`, `domain_selection_required`, `selected_domain_unavailable`, and `unknown`. Enrich cards after ranking; bind selection context in existing pagination. Actual activation retains package/workspace validation and consent requirements.
5. Derive `run_summaries` for unfinished runs and `summary` for run instructions from the same frontier evaluation. Preserve all eligible/pending candidates and add round-aware blockers and safe next-inspection suggestions. Do not persist summaries or infer new goals. Existing run entry and handoff output descriptions are the available delivery context.
6. Remove patent maintenance's private profile emitter. ARSU conversion remains the single writer. Repair current known generated drift with an explicit owning conversion after checking unrelated/user changes, then perform the real patent maintenance review required by changed definitions before baseline. No upstream pin or capability business scope changes.
7. Stable installer keeps npm replacement semantics without pre-uninstall. Use pack metadata, platform-aware npm/pnpm invocation and actual installed package/bin verification. Tests use isolated prefixes or an injected process port, never a maintainer's global install; no rollback guarantee is added.
8. Update canonical usage, Navigate/native-worker renderers and existing dogfood scenarios to describe conditional checks and independent partial work. Generate installed Skills/handbooks only from canonical renderers after code integration. Leave real-host runs and formal release sign-off for live acceptance.

## Risks / Trade-offs

- File readability cannot prove scientific adequacy → report observations and leave semantic review to Agent/user.
- Static eligibility can change before activation → rerun current activation validation; cursor includes selection context.
- Ordinary missing inputs can be mistaken for a global stop → return role-specific non-blocking findings and teach independent continuation.
- Editing audited maintenance definitions invalidates review → substantively review nine patent businesses and both compositions and rebind the actual current state.
- npm replacement can still fail during installation → preserve errors and state only the actual outcome; test before publication in isolation.

## Delivery

Update current usage guidance through this explicit change before implementation. Workspace 2 and packet/envelope 1 stay current; no migration is needed. Run local deterministic acceptance and record genuine limits in verification.md. Keep the change active for review; no commit, publication, live model campaign or server launch is part of this request.
