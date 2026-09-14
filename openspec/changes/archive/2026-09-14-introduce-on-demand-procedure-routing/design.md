## Context

Agent delivery currently copies four ARSU Skills, five Companions, 47 core capability packages, selected raw domain Skills, selected extension packages, and optionally sixteen wrappers into each host surface. The same package registries and renderers already exist inside the published npm package, graph nodes already identify `capability_id`, and managed-file reconciliation already knows how to retire unchanged projections safely. See `proposal.md` for motivation and the delta specs for observable behavior.

## Goals / Non-Goals

**Goals:**

- Make host catalog size independent of ResearchSpec's procedure count.
- Preserve direct, flexible Agent work without manufacturing graph state.
- Preserve the graph engine as the sole authority for governed lifecycle state.
- Reuse current package registries, content, hash validation, pagination, delivery modes, and safe reconciliation.

**Non-Goals:**

- No embeddings, model calls, network search, dependency additions, activation cache, receipt store, dynamic graph generation, or workspace schema bump.
- No change to Zotero's seven projected Skills or the sixteen public top-level CLI commands.
- No vendor runtime execution or direct use of raw vendor Skill trees at activation time.

## Decisions

### One discovery entry, not one execution path

`researchspec-navigate` is the only base projected Skill and the only command wrapper. It selects a mode and asks the CLI for bounded procedure data; it does not enumerate every route or prohibit the host Agent from ordinary native work. This keeps the catalog small without turning the router into a closed dispatcher.

### Derive procedures from existing owners

The Procedure catalog is an in-memory projection of the ARSU workflow catalog, Companion renderer, core capability registry, and plugin extension registry. A procedure record adds only normalized discovery metadata and a resolver back to its owning package. No checked-in procedure registry is introduced because that would duplicate identities, paths, hashes, domains, and profiles already owned elsewhere.

### Progressive disclosure is CLI-native

`list procedures` returns compact cards with deterministic lexical ranking and existing opaque pagination. `show procedure:<id>` returns metadata. `instructions procedure:<id>` returns one complete body and declared resource references. The Agent reads a referenced resource only when the selected procedure requires it. Search uses normalized tokens and stable ID ordering; semantic interpretation remains Navigate's job.

### One packet builder, two authority envelopes

Both direct and node instructions call one packet builder after package validation. Shared fields come from the same package bytes and hashes. Standalone resolves caller-supplied ordinary file paths and completes by returning outputs. Graph mode receives role bindings, authority, and exact completion selectors from the existing eligible node card. This prevents procedure content from drifting across modes.

### Standalone remains deliberately stateless

Standalone composition passes explicit ordinary file paths. It does not create an ephemeral run, receipt, cache, or second handoff protocol. Any need for persistence, resume, formal controls, parallel joins, or audit state crosses the mode boundary and uses an existing graph profile.

### Plugin packages are runtime SSOT

Raw vendor Skill trees remain converter and audit inputs. Both activation modes load the corresponding `plugin-*` extension capability package. Global discovery may show unselected packages, while activation checks existing domain resolution and returns an actionable structured error instead of installing anything.

### Delivery reconciliation retires old entries through existing ownership rules

Desired-file planning stops adding hidden procedures and fifteen obsolete wrappers. Existing reconciliation removes hash-clean project-local managed files, preserves drifted files, and retains current shared-global authorization. Legacy source variants stay recognized only long enough to identify and safely retire current-schema managed installations.

### Generated completion is mode-neutral at the source

Core authoring and each extension generator emit a short Completion section that tells the Agent to follow its activation packet. ARSU preflight likewise consults activation mode before any runtime action. Generated packages are regenerated through their owning maintenance workflows; generated output is never hand-edited as the source of truth.

## Risks / Trade-offs

- [Lexical search misses synonyms] → Navigate translates user intent into multiple query terms; native Agent fallback remains available. Add semantic indexing only after measured misses justify its token and maintenance cost.
- [One instruction packet can still be large] → return one procedure body and resource metadata only; resources remain third-stage reads.
- [Global plugin discovery suggests unavailable work] → return owning domains in cards and enforce domain selection only at activation.
- [Retiring many managed files encounters user edits] → preserve hash-mismatched files and report drift through the existing reconciliation contract.
- [Generated families drift differently] → change generator-owned shared footers, then run each required maintenance check and registry verification.

## Migration Plan

1. Add procedure catalog, packet rendering, and CLI selectors while retaining current package inputs.
2. Switch Agent delivery desired files to Navigate-only and use existing reconciliation to retire old managed entries.
3. Update generator sources and regenerate affected ARSU, core, and plugin extension packages through their maintenance paths.
4. Update Navigate, the browser harness, canonical usage documentation, and project constraints.
5. Run focused behavior tests, maintenance checks, type checking, build, and package verification.

Rollback is a package-version rollback. Drift-preserved user files are never deleted by either direction.
