## Context

ResearchSpec already has a generic isolated vendor-bundle contract, a central
source-neutral domain catalog, and two vendor converters. The archived
Materials-Science-Skills-For-LLM audit binds twelve upstream Skills to immutable
revision `fafd3ab011e4c363658a39c4bb62fc739839d58c`, but explicitly leaves every
production decision unresolved. This change must turn that evidence into static,
reviewed package content without executing upstream commands or broadening the
public runtime contract.

The new vendor contains several distinct hazards: private paths, credentials,
fixed services and images, installation/download instructions, missing links,
development-maintenance content, schedulers, GPU workloads, and externally
licensed software, models, data, and documentation. Its small size makes a
complete per-item and per-file decision model preferable to implicit converter
heuristics.

## Goals / Non-Goals

**Goals:**

- Resolve all twelve audit records into seven admitted and five excluded
  production decisions.
- Keep admission, relationship, file, resource, license, and domain decisions
  explicit, typed, complete, and source-bound.
- Generate coherent Open Agent Skills with no broken local links and clear
  confirmation boundaries for expensive or stateful execution.
- Reuse the generic multi-vendor staging and central registry assembler while
  preserving byte-identical outputs owned by the other two vendors.
- Publish only generated, reviewed runtime content and adapter documentation.

**Non-Goals:**

- Changing Registry Schema 1, public CLI commands, workspace contracts, base
  Skills, Companion Skills, wrappers, or existing vendor policy.
- Installing software, downloading models or datasets, configuring credentials,
  accessing services, compiling code, or dispatching scientific/HPC work.
- Treating upstream relationships as hard runtime dependencies or GPU/HPC use as
  automatic membership in `research-computing-infrastructure`.
- Republishing external software, model, dataset, service, or documentation
  licenses as though they covered copied Skill content.

## Decisions

### Resolve the complete audit with one admission catalog

One typed catalog covers all twelve audit IDs exactly once and freezes generated
IDs, admission result, exclusion reasons, root MIT evidence, content and
permission review, overlap result, and curation profile. The seven admitted IDs
are `apex-alloy-workflows`, `atomsk-cli`, `deeptb-helper`, `dpgen-workflow`,
`gpumd-workflow`, `phonopy-workflows`, and `unimol-ops`; the remaining five are
excluded for maintenance scope, private tooling, overlap, or excessive platform
authority. Inferring admission from audit readiness was rejected because audit
labels are evidence, not production authorization.

### Make file decisions exhaustive and curation declarative

A file catalog covers all 24 source files belonging to admitted Skills, with one
`copy`, `curate`, or `exclude` decision per path. `copy` requires a matching
source hash; `exclude` requires a reason; `curate` requires a complete
version-controlled replacement asset and the hash of the source it replaces.
The converter performs mechanical validation and rendering only. Hidden regex or
prose rewrites were rejected because semantic adaptations must remain reviewable.

### Separate relationships from runtime dependencies

The relationship catalog resolves all seven audited relations. Three relations
from admitted source Skills are `advisory`; four originating in excluded
`cms-scripts` are `source-excluded`. None is emitted as a Registry Schema 1 hard
dependency. Automatically translating references into dependencies was rejected
because the evidence does not establish a mandatory installation prerequisite.

### Model external resources as prerequisites, references, or removals

The resource catalog classifies software, services, models, data, and compute
environments as `preconfigured`, `reference-only`, or `removed`. Generated Skills
may explain how to work with resources already provided and approved by the user,
but ResearchSpec neither bundles nor provisions them. This preserves useful
scientific guidance without turning a static Skill package into an installer or
credential broker.

### Generate a uniform license and notice boundary

Every admitted Skill receives the reviewed MIT text and a generated `NOTICE.md`
that binds the official repository, snapshot label, full revision, source path,
and adaptation summary. Admission fails if any copied or curated Skill content
cannot reach a supported license conclusion. External resources are identified
but neither copied nor relicensed.

### Reuse complete multi-vendor staging

The Materials converter implements `convert`, `check`, and `idempotence` through
the shared staging path. It stages the two published vendors unchanged, writes
only its own tree, bundle, manifest, report, and the assembled registry, and uses
the stable assembly order Materials, Scientific Agent Skills, ToolUniverse.
Forking the assembler or modifying prior vendor converters was rejected because
the existing generic contract already supports another isolated bundle.

### Assign only reviewed semantic domains

The seven admitted Skills receive explicit memberships in the three domains
listed in the proposal. `materials-engineering` becomes non-empty and public;
the public domain count becomes 49. Scheduler, GPU, and remote-service mechanics
are treated as operational prerequisites, not disciplinary meaning.

## Risks / Trade-offs

- **[Replacement assets drift from their reviewed sources]** → Bind every curated
  asset to a source hash and fail conversion on mismatch or missing coverage.
- **[Static guidance is mistaken for execution authority]** → Put confirmation,
  preconfiguration, and no-credential-persistence boundaries in generated Skills
  and validate prohibited content patterns.
- **[Third-vendor regeneration changes another vendor]** → Hash unrelated trees
  before and after every converter in focused isolation tests.
- **[Root licensing is overextended]** → Require an explicit per-Skill conclusion
  and keep external resources outside the distributed content-license claim.
- **[Full prose reports create brittle tests]** → Assert decision IDs, counts, and
  representative boundaries rather than exact report text.

## Migration Plan

1. Add and validate all decision catalogs and source-bound replacement assets.
2. Implement the isolated converter on the shared bundle and staging modules.
3. Generate the third vendor outputs and assemble the three-vendor registry.
4. Add reviewed domain memberships, adapter documentation, and package allowlist
   entries.
5. Run focused policy, curation, isolation, registry, and package tests followed
   by the full release gate.

Rollback removes only the Materials generated tree, bundle inputs/outputs,
memberships, adapter documentation, and converter source. The other vendor trees,
Schema 1 contract, public CLI, and user workspace state require no migration.

## Open Questions

None. The pinned revision, complete decisions, curation profiles, domain
memberships, package boundary, and non-execution policy are fixed by this change.
