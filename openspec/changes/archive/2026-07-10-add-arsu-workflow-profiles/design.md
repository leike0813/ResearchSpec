## Context

The routing catalog already owns the supported ARSU route vocabulary, prerequisites, primary artifacts, risk, Gate policy, and cost. Schema 0.2 owns executable work, Gate, Decision, and transition state for one subflow instance, but it has no declarative parent-to-child subflow graph. The current runtime profile is therefore unable to compose standalone modes into `academic-pipeline`, and repeated revision instances would collide on selector, output, and provenance identity.

The implementation must remain agent-neutral and file-based, preserve old Schema 0.1/0.2 workspaces, keep fifteen public CLI commands, and avoid hard-coding an ARSU pipeline graph into generic core evaluators.

## Goals / Non-Goals

**Goals:**

- Make every supported ARSU route executable through a complete workflow template.
- Model pipeline stages and revision work as nested subflow instances governed by the CLI frontier.
- Preserve human confirmation at formal Gates and Decisions while allowing a confirmed parent plan to authorize exact child starts.
- Keep route facts, workflow facts, generated runtime data, and generated Skill guidance synchronized by deterministic validation.
- Accept both text and binary authoritative candidates without weakening containment, hash, receipt, or plan binding.

**Non-Goals:**

- Migrating existing workspaces or deleting the legacy `arsu-paper` and `arsu-research-slice` profiles.
- Adding commands, runtime LLM dependencies, a global maximum revision count, or a second pipeline state machine.
- Reducing the Companion surface; that remains umbrella task 6.
- Treating converter-generated files as hand-maintained sources of truth.

## Decisions

### Keep Schema 0.2 additive and derive orchestration state

`SubflowTemplateDefinition` gains default-empty child nodes and child parallel groups. A child node names a template, parent stage, dependencies, completion rule, and `once` or `next_round` multiplicity. Instance state records only the selected parent node and existing transition/start receipt references; readiness and completion are derived from templates, trusted receipts, child instances, ledgers, and artifact registry state.

This avoids a second mutable graph state and keeps old 0.2 files valid. Bumping the schema or materializing node status was rejected because neither is required for the new semantics and both would create migration and drift risks.

### Use parent-scoped selectors and receipt-bound delegated starts

External templates remain selectable as `subflow:<template-id>`. When an active parent makes a child node ready, status exposes `subflow:<parent-instance>/<node-id>`. The child start plan resolves its template, next round, prerequisite artifacts and Decisions, and parent plan receipt. Execution binds all of those values into the start receipt and child instance.

The parent route confirmation authorizes only the exact graph and cost described by its plan. A matching child start does not repeat human confirmation; a changed parent receipt, graph, frontier, input, Decision, or round produces a conflict. Automatically starting children was rejected because `start` remains the public state transaction and its receipt is needed for recovery and audit.

### Keep ARSU workflow facts converter-owned

Canonical workflow and artifact-contract data live beside the converter routing catalog. The converter validates the two catalogs together and generates a marked TypeScript runtime projection. Generic core contracts and evaluators consume the projection but contain no ARSU route graph.

The validator requires exact complete external coverage for 25 operational routes and two pipeline entries, owner consistency for every producer route, primary-artifact coverage, resolvable artifact refs, and explicit handling of route Gate policies. Internal helper templates are excluded from external coverage counts.

### Compose pipeline and revision rounds from reusable templates

The end-to-end parent invokes the existing full research, full writing, full review, and format-convert templates around parent-owned integrity Gates and process summary work. The mid-entry parent begins at an entry stage whose eligible branch transitions are derived from registered artifacts; multiple eligible transitions require a `workflow_branch` Decision.

The parent revision node invokes an internal `round` template with `next_round` multiplicity. Each round invokes the standalone paper revision and reviewer re-review templates. An accepted branch advances to final integrity; a revision branch completes the current round and exposes the same parent node at round `n+1`. No core or profile maximum is applied.

### Resolve outputs inside their subflow instance

New work items declare an instance output scope. Runtime resolves the relative path below the instance artifact root and registers the concrete path and hash. Legacy literal workspace output paths keep their current behavior. This prevents sibling runs and revision rounds from overwriting each other without inventing path interpolation syntax.

### Use controlled artifact refs and two deterministic validators

`arsu-artifact:<artifact-type>` resolves through the converter-owned artifact contract registry. Text validation checks containment, regular-file status, non-empty UTF-8 content, expected extension/media metadata, and hash. Binary validation applies the same structural and hash checks without decoding content. Existing `research-artifact` behavior remains as a text-compatible alias and existing controlled ARS handoff refs remain resolvable.

Arbitrary file-backed template refs are rejected. Format-specific semantic validation is not claimed; formal quality remains a Gate concern.

### Preserve conditional Gate semantics explicitly

Required and profile-defined route Gates become blocking formal Gates with human confirmation. A conditional catalog policy creates a formal Gate only when the profile supplies a deterministic activation predicate supported by core. Otherwise the profile records it as advisory and the coverage validator forbids representing it as an executed blocking Gate.

## Risks / Trade-offs

- [Large profile catalog could drift from routing facts] → Generate the runtime projection and enforce exact cross-catalog coverage and idempotence.
- [Nested frontier evaluation could connect the wrong child or round] → Bind parent instance, node, round, Decisions, artifacts, plan hash, and receipt chain and reject ambiguous or stale candidates.
- [Binary validation cannot prove document semantics] → Limit it to deterministic file evidence and leave content quality to declared Gates.
- [A user could enter mid-pipeline with inconsistent artifacts] → Compute eligibility from registered type/hash evidence and require an explicit Decision when more than one entry is legal.
- [Changing the init default alters new-project behavior] → Apply only to new workspaces and keep both legacy profile IDs available.

## Migration Plan

No workspace migration is performed. New initialization selects `arsu-v0-1`; an existing config continues to select and parse its stored profile. Additive defaults preserve old 0.1/0.2 contracts. Rollback consists of selecting an explicit legacy profile for new initialization and removing the new registry entry; existing files remain readable.

## Open Questions

None. The universal profile ID, new-workspace default, delegated confirmation, native binary support, and unbounded revision policy are locked by the implementation plan.
