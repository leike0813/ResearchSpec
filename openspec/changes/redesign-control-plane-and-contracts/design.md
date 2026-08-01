## Context

The current implementation persists workflow state, artifacts, attempts, receipts, global ledgers,
strict/adaptive profiles and migration metadata under `researchspec/runs/current`. The locked product
decisions instead make stable research specifications, per-subflow control, handoffs and project
changes the only ResearchSpec-owned semantic authorities. Boundary deliverables remain ordinary
project files outside `researchspec/`.

This is a cross-cutting hard cut. Existing Schema `0.2` workspaces are not migrated or interpreted.
The implementation is staged inside one active OpenSpec change, but only the final state is
releasable. Converter-generated ARSU files remain generated output and must not be hand-edited.

## Goals / Non-Goals

**Goals:**

- Define one current workspace format with explicit file ownership and strict schemas.
- Make every subflow `control.yaml` the sole runtime authority for that instance.
- Make the project `academic-pipeline` graph a converter-owned static projection.
- Replace artifact identity and global ledgers with explicit handoff roles and safe paths.
- Preserve formal human Gate, branch, scope, claim, structure and override decisions without receipts.
- Converge the public surface on sixteen commands and the fixed 4 + 4 + 7 Skill surface.

**Non-Goals:**

- Migrating, repairing or compatibly interpreting old workspaces.
- Registering, hashing or copying boundary deliverables into ResearchSpec authority.
- Adding a runtime LLM, database, service dependency or platform-specific core behavior.
- Broadly rewriting upstream ARSU history or vendor content.

## Decisions

### 1. Use a versioned current workspace and fail closed on every other format

`researchspec/config.yaml` uses `schema_version: "1"` and contains only Agent tool and plugin
selection. Discovery classifies a location as missing, current or unsupported before any planned
write. A non-empty unknown directory, an old runtime marker, an unsupported version or a symlinked
managed path is unsupported and receives no compatibility projection.

Automatic migration was rejected because the old files contain accepted semantic authority that
cannot be reconstructed mechanically under the new ownership model.

### 2. Give every durable concept exactly one owner

The four stable specs own research intent, sources, claims and manuscript structure. The project
profile owns the pipeline graph. Each `control.yaml` owns one instance's status, checkpoint, Gate
attempts, local Decisions and transitions. Each `handoff.md` owns boundary input/output references.
A project change owns proposed high-impact changes until they are accepted and manually applied.

Global registries, ledgers, receipts and event journals were rejected because they duplicate these
owners and require multi-file transaction recovery.

### 3. Keep deliverables outside `researchspec/`

Handoff entries contain a unique role, semantic type, safe project-relative path, purpose and source
or intended consumer. Paths must remain inside the project and outside `researchspec/`. Ordinary
status/check validates structure only; existence is checked when an action actually consumes the
role. No artifact ID or hash is assigned.

### 4. Project one converter-owned pipeline profile

The publication source for `academic-pipeline` is maintained with the ARSU workflow converter.
`init` and `update` project it to `researchspec/profiles/academic-pipeline.yaml`; the installation
manifest records `framework-profile` ownership. Missing projection is creatable. Drift is reported
and preserved unless the user explicitly passes `--force`.

A temporary hand-written profile was rejected because it would establish a second source of truth
before the converter migration is complete.

### 5. Isolate legacy code while stages are incomplete

Stage 1 introduces `CurrentWorkspaceIndex` rather than changing the legacy `WorkspaceSnapshot`
shape in place. Only `init`, `update`, `status`, `check`, read-only `doctor` and static installation
inspection move to the current loader in that stage. Legacy modules remain temporarily compilable
but are unreachable for current and unsupported workspaces; no fallback or union schema is added.
They are migrated or deleted in later tasks.

### 6. Use single-file atomic authority writes

Control mutation reads the current bytes, validates the expected state, writes a temporary sibling
and atomically renames it. Static generated projection continues to reuse the internal write-plan
facility for drift protection. Public runtime plan hashes, action-basis hashes and receipts are
removed.

### 7. Keep project changes semantic and patches ARSU-local

`change.md` plus optional `design.md`, `tasks.md` and `delta.yaml` represents a project change.
Accepted and applied remain distinct. Delta operations are validation aids for sources and claims,
not an executor. The ARSU revision patch schema remains the only manuscript patch contract and its
helper is explicit, stateless and fail-closed.

## Risks / Trade-offs

- **Intermediate branch does not have a green legacy runtime suite** → keep typecheck/build and
  stage-focused tests green, leave the change active, and do not publish until later stages converge.
- **Legacy code can be accidentally called** → current discovery returns a distinct type and current
  handlers accept only the narrow current index/static context.
- **Profile source can drift from generated output** → manifest ownership and converter idempotence
  are mandatory before release.
- **Manual control edits can create contradictions** → validation reports the owning file and never
  invents a repair or rewrites semantic authority.
- **Cross-subflow files can disappear** → verify paths only at the consuming action and block that
  action without rewriting producer history.

## Migration Plan

There is no workspace migration. Release switches directly to the current schema after all change
tasks and packaged user journeys pass. Users preserve old materials outside ResearchSpec, create a
fresh workspace and reintroduce selected files through stable specs or handoffs. Rollback is source
control rollback of the unreleased implementation, not a runtime transaction.

## Open Questions

None. Schema version, layout, selectors, authority boundaries, hard-cut policy and stage-specific
verification are fixed by the decision artifact and this design.
