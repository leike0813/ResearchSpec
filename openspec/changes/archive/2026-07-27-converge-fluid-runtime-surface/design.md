## Context

The adaptive case runtime, action schema v2, bounded status, Doctor recovery,
runtime migration, and expanded fixed Skill surface are already implemented and
covered by focused tests. The remaining problem is projection drift: main specs
retain requirements superseded by archived accepted deltas, the converter-owned
ARSU preflight and Companion guidance still prescribe strict-only selectors and
unconditional plan replay, and the canonical/runtime documents describe the
strict compatibility engine as the universal current runtime.

The shipped guidance is operational input to Agents, so this drift can produce
invalid actions even though the runtime itself is correct. Generated ARSU trees
must remain converter-owned, strict Schema `0.2` workspaces must remain valid,
and documentation tests must not lock prose.

## Goals / Non-Goals

**Goals:**

- Establish one action-v2 contract across main specs, ARSU producers,
  Companions, acceptance tests, and user-facing documentation.
- Present adaptive as the default runtime and strict graph execution as an
  explicit compatibility profile.
- Preserve formal human boundaries while removing unnecessary preview/replay
  requirements from direct and human-confirmed actions.
- Regenerate converter-owned ARSU outputs and update their identity evidence.
- Make runtime documentation navigable by shared, adaptive, and strict views.

**Non-Goals:**

- Change runtime state schemas, route catalogs, obligation graphs, Gates,
  completion policies, or command semantics.
- Add commands, Skills, dependencies, wrappers, or an adaptive Material
  Passport import.
- Reproduce the strict pipeline stage graph inside adaptive mode.
- Rewrite upstream ARSU semantic content or hand-edit generated Skill trees.
- Add tests that assert whole Markdown passages or cosmetic diagram bytes.

## Decisions

### Use runtime descriptors as the operational source of truth

Every Agent-facing instruction starts with bounded status, obtains targeted
instructions for a returned selector, and follows the descriptor's semantic
input schema, execution policy, basis, and next selectors. The three execution
policies remain distinct:

- `direct`: execute the descriptor-owned semantic action without an external
  plan replay;
- `human_confirmed`: obtain the required human confirmation and execute the
  semantic action without pretending the confirmation is a plan hash;
- `plan_bound`: preview and execute the exact hash-bound plan.

This replaces the old blanket preview/replay rule. Retaining that rule as a
conservative fallback was rejected because it contradicts the public v2
contract and keeps shipped guidance unusable for adaptive direct actions.

### Generate one dual-runtime ARSU preflight

`src/arsu-converter/contracts.ts` remains the only source for producer preflight
content. It will compose shared authority/routing/source/plugin rules with an
adaptive protocol and a strict protocol. Every generated producer carries both
because the installed Skill cannot know the workspace profile until runtime.
The integration marker/profile advances to version 9 so stale generated trees
fail converter checking.

Adaptive guidance covers obligation attempts and evidence, local retry/pause,
formal Gates, case-action resolution, patch/change actions, and completion.
Strict guidance retains work items, scoped child Start, parallel/join,
transitions, dynamic revision rounds, and strict-only mid-entry Passport import.

Separate per-Skill runtime templates were rejected because they would duplicate
the same authority protocol four times and reintroduce drift.

### Make all Companion workflows descriptor-driven

Shared Companion guidance no longer mandates dry-run for every write. Navigate
dispatches according to `profile.mode`, selector kind, and execution policy.
Propose, Decide, and Verify consume semantic inputs from their descriptors and
preserve the existing human and plan-bound boundaries. Companions remain
adapters and never gain workflow authority.

### Separate shared, adaptive, and strict documentation

`docs/arsu_user_usage_model.md` remains the canonical user journey and fixed
surface source. Existing runtime-document paths remain stable. The runtime
README and common model lead with shared invariants and the adaptive default;
dedicated adaptive and strict protocol documents hold mode-specific selectors
and transactions. Skill workflow documents distinguish internal ARSU semantics
from external runtime control.

Generic architecture/control/frontier/write-set diagrams show the current
dual-mode or adaptive-default model. Existing Skill and pipeline graph diagrams
remain useful but are titled and captioned as strict compatibility projections.
New adaptive diagrams cover obligation lifecycle and pipeline completion without
inventing a stage graph.

Moving or archiving the whole existing document set was rejected because it
would break stable links and hide still-valid strict behavior.

### Prevent drift through contracts and behavior, not prose snapshots

Main specs and the canonical model own product facts. Other runtime documents
link to them instead of repeating volatile totals. Existing structured tests are
extended for descriptor policy, generated marker/manifest consistency,
adaptive/strict journeys, and traceability. Natural-language wording and full
SVG bytes are not treated as product contracts.

Presence-only token checks are insufficient when a document can contain both
the current policy and a contradictory legacy instruction. Release verification
therefore checks stable semantic relationships: every execution policy maps to
its distinct confirmation/binding rule; directed continuation takes precedence
over a full status refresh; adaptive and strict selector families remain
separate from global patch/change governance; and diagram branches use canonical
selectors and distinct authority write sets. Negative assertions target obsolete
protocol claims rather than exact prose, punctuation, whitespace, or rendered
SVG bytes.

## Risks / Trade-offs

- [Dual-mode guidance becomes longer] → Keep shared rules once, use compact
  mode-specific tables, and route readers from status to the applicable section.
- [Main-spec synchronization can accidentally remove existing scenarios] →
  Modify complete requirement blocks or add narrowly scoped requirements, then
  run strict change and repository validation.
- [Generated files drift from converter source] → Regenerate through the ARSU
  converter and require both check and idempotence.
- [Companion wording diverges from CLI descriptors again] → Test execution
  policy and selector families through structured source data and black-box
  journeys rather than duplicated command prose.
- [Diagram tooling varies across environments] → Preserve source files, render
  with the repository's existing PlantUML/Graphviz workflow, and validate
  source/output pairing without adding a dependency.
- [A document contains required tokens but still contradicts them elsewhere] →
  Verify policy mappings, forbidden legacy relationships, and canonical diagram
  branches instead of checking token presence alone.
- [Strict users mistake compatibility labeling for removal] → Preserve all
  strict behavior and give it a dedicated protocol with explicit Schema `0.2`
  and `--profile strict` entry conditions.

## Migration Plan

1. Synchronize delta and main specs before changing shipped guidance.
2. Update converter and Companion sources and their focused tests.
3. Regenerate all converter-owned ARSU outputs and verify idempotence.
4. Rewrite canonical/runtime documentation and render affected diagrams.
5. Run adaptive and strict black-box journeys, recovery/migration tests, full
   project checks, and strict OpenSpec validation.

No workspace data migration is introduced. Existing adaptive and strict
workspaces continue to use their current profiles. Rollback is a source revert
plus converter regeneration; no runtime state requires reversal.

## Open Questions

None.
