## 1. Contracts And Generic Runtime

- [x] 1.1 Extend Schema 0.2 workflow, run-state, and selector contracts with external/internal templates, child nodes and joins, producer route refs, instance-scoped outputs, parent node identity, and scoped child selectors while preserving legacy parsing.
- [x] 1.2 Implement parent-aware workflow frontier evaluation, child completion/join derivation, deterministic next-round selection, and mid-entry branch readiness.
- [x] 1.3 Extend subflow start planning and transactions with scoped child resolution, delegated parent confirmation, receipt binding, idempotence, orphan recovery, and drift conflicts.
- [x] 1.4 Extend snapshot and workspace validation for parent/child/round/start-receipt linkage without migrating old workspaces.

## 2. Artifact Contracts And Submission

- [x] 2.1 Add controlled ARSU artifact contracts and typed `arsu-artifact:` instruction resolution while retaining existing ARS handoff references.
- [x] 2.2 Add deterministic `text-artifact` and `binary-file-artifact` submission profiles, preserve `research-artifact`, and resolve new outputs inside their owning subflow instance.

## 3. ARSU Workflow Profiles

- [x] 3.1 Add converter-owned workflow sources, artifact-contract registry, exact routing/profile cross-validator, and deterministic generated runtime projection.
- [x] 3.2 Define complete executable templates for all 8 deep-research, 11 academic-paper, and 6 academic-paper-reviewer modes.
- [x] 3.3 Define end-to-end and mid-entry pipeline parents, mandatory integrity stages, branch Decisions, and the unbounded internal revision-round composition.
- [x] 3.4 Register `arsu-v0-1` as the new-workspace default while retaining explicit legacy profiles and avoiding automatic route start.

## 4. CLI, Skills, And Documentation

- [x] 4.1 Extend status, instructions, and start rendering for child selectors, delegated basis, mid-entry choices, and revision rounds while retaining exactly fifteen top-level commands.
- [x] 4.2 Update converter-owned ARSU and Companion guidance, then regenerate generated Skills, manifest, and reports without hand-editing outputs.
- [x] 4.3 Update the canonical usage model and CLI, schema, Skill, architecture, and ARSU workflow design documents to reflect the implemented profile control plane.

## 5. Tests And Tracking

- [x] 5.1 Add profile/catalog coverage, graph, pipeline, scoped-child, mid-entry, multi-round, receipt, compatibility, native artifact, CLI-default, and converter-idempotence tests.
- [x] 5.2 Run the full test, lint, ARSU, idempotence, and strict OpenSpec validation suite and resolve all failures.
- [x] 5.3 Mark umbrella task 5.1 complete only after this change is fully implemented and verified.
