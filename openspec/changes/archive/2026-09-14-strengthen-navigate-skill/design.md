## Context

See `proposal.md` for motivation. Navigate is generated from the Companion manifest, but Agent delivery and the browser harness currently assemble its files separately. The CLI handbook and ARSU routing projection already have deterministic renderers and must remain single-source generated content. ResearchSpec CLI and graph files remain the only workflow-state authority.

## Goals / Non-Goals

**Goals:**

- Make Navigate a Tier 2 reference-backed Skill whose main file is independently executable.
- Reuse existing handbook, route, license, delivery, manifest, and harness machinery.
- Give every consumer the same deterministic Navigate file tree.

**Non-Goals:**

- Add a command, schema, dependency, runtime, or persisted registry.
- Copy detailed route or payload facts into handwritten Skill prose.
- Change graph, Gate, Decision, plugin, Adapter, or alternate-model authority.

## Decisions

### One renderer owns the complete Companion file tree

Extend the existing Companion renderer to return the files belonging to a Companion. Navigate adds two generated references; the other three Companions retain `SKILL.md` and `LICENSE`. Delivery and the harness consume this renderer instead of assembling Navigate independently.

This keeps file ownership and bytes identical without introducing a new service or registry. Duplicating reference assembly in both consumers was rejected because it would recreate the drift this change is meant to remove.

### Navigate is the controller; references are detailed projections

The main file contains trigger boundaries, inputs and outputs, mode choice, standalone flow, graph start/resume flows, human confirmations, failure recovery, responsibility split, and completion criteria. It links directly to:

- `references/cli-handbook.md` for complete command, selector, payload, option, and exit-code detail;
- `references/arsu-routes.md` for catalog-derived ARSU intent and route comparison.

Safety-critical source-policy and workflow-authority rules remain inline. Requiring both references at startup was rejected because most explicit requests can use compact CLI metadata and exact instruction packets.

### The handbook loses procedure identity but keeps its renderer and public document

Remove the handbook from the Companion manifest. Keep the typed handbook renderer and `docs/user/cli-handbook.md`; use the rendered bytes as Navigate's local reference. This removes a concept without removing guidance.

## Risks / Trade-offs

- [Navigate becomes longer] → Keep route tables and exhaustive CLI detail in generated references and avoid duplicating them in the main file.
- [A consumer omits new reference files] → Route delivery, harness loading, tests, and package verification through the complete-tree renderer.
- [Stale managed handbook projections remain] → Existing ownership-aware reconciliation removes unchanged generated files and preserves diagnosed user edits.
- [Reference guidance is mistaken for runtime authority] → Keep status and exact selector instructions mandatory before every graph mutation.

## Migration Plan

1. Publish the four-Companion manifest and complete Navigate tree.
2. Reconcile selected Agent roots through normal `init` or `update`; clean obsolete handbook projections only under existing ownership rules.
3. Validate generated docs, specs, tests, and an installed tarball.
