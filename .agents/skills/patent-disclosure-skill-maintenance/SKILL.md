---
name: patent-disclosure-skill-maintenance
description: Maintain the pinned patent upstream, fixed capability packages, tools and graph profiles. Use when adding or updating patent-disclosure-skill source, adaptations or generated artifacts.
---

# Patent upstream maintenance

Maintain the third-party patent source as fixed ResearchSpec capabilities. Read
`audits/patent-disclosure-skill/catalog.json` first. It owns the pin, authoring
paths, output locations, profile IDs and external-resource decisions. Typed
capability definitions own stage IDs, roles and resource membership. The vendor
checkout is input; maintain adaptations in the authoring tree.

## Required inputs and output

Input is an explicitly selected upstream revision or a requested change to
current authoring sources. Inspect Git status and preserve unrelated changes.
Read the current anchor manifest, semantic review, complete source audit and
applicable OpenSpec change before modifying production material.

Deliver a reviewed source inventory, verified extraction index, authored tools
and Procedures, generated fixed packages and profiles, and a frozen maintenance
anchor. Return validation results and unavailable external prerequisites. A
maintenance review never supplies a user's runtime Gate or Decision verdict.

## Procedure

1. Analyze source differences. Inspect all tracked files and nine businesses:
   disclosure, application, docket, search, reader, chart, map, OA and examination
   policy. Account for added, removed and changed files. Establish exact commit,
   tree, copyright and third-party notices. Update the catalog through the
   project change process if its pin or production scope changes.
2. Review admission. Keep reusable semantic tools, schemas, prompts and reference
   material that support the declared deliveries. Record every exclusion and
   external resource in the source audit. Review binary resources as bytes.
   IPC data and model weights are explicit configured inputs; provider tools,
   browser, CAD and document dependencies remain user managed.
3. Adapt tools in `authoring/patent-disclosure-skill/runtime/`. Maintain one
   source for identical shared tools, retain distinct business variants, and
   project independent copies. All normal paths and required constraints belong
   in the main Procedure. Use substantial references only when their stated
   read condition applies. Preserve relevant licenses and notices with copied
   resources. A source prompt converted into authored knowledge must be marked
   as derivation, with actual source paths, rather than verbatim extraction.
4. Run `pnpm patent-maintenance:artifacts`. This prepares reviewed resources,
   builds definitions, emits extraction/audit records, authors patent packages
   and projects the preset registry. It never executes vendor runtime tools.
   Review generated diff and verify existing unrelated packages remain intact.
5. Verify behavior through existing copied-tree runtime tests and graph tests.
   Exercise ordinary file indexes, Word/Excel/drawing paths, reader extraction,
   selected-vault projection and map inputs as applicable. Use local fixtures
   and mocks. Report missing configured prerequisites; do not install them.
   Run `pnpm patent:check`, `pnpm patent:idempotence`, `pnpm check`, appropriate
   lint/tests and release verification for a distribution change.
6. Review every business and both compositions semantically. Check substantive
   domain behavior, evidence limitations, output completeness, command accuracy,
   graph bindings and human confirmations. Inspect the full output tree and
   resource provenance. Record resolved findings and remaining execution limits
   in the anchor's `05-semantic-review.md`.
7. Create `review-decision.json` with `status: approved`, identified `reviewer`,
   nine business reviews, findings whose status is `resolved`, and the exact
   `reviewed_state` returned by `collectState` from the maintenance script.
   This is the maintainer's semantic assessment, not an automatic inference
   from lint or generation. Do not approve unreviewed content to make checks pass.
8. Run `pnpm patent-maintenance:baseline` only after that review is complete.
   Run `pnpm patent-maintenance:check`; the anchor binds source bytes, authoring,
   package/profile trees, registry subsets, maintenance definitions and review.
   Any subsequent production change requires review of the changed output and a
   new binding. Update docs and project AGENTS paths in the same change.

## Command contract

All commands run from the ResearchSpec root:

```text
pnpm patent-maintenance:artifacts [anchor]
pnpm patent-maintenance:records [anchor]
pnpm patent-maintenance:baseline [anchor]
pnpm patent-maintenance:check [anchor]
pnpm patent-maintenance:diff <old-anchor> <new-anchor>
```

`artifacts` regenerates deterministic production and analysis records.
`records` refreshes analysis/ingestion/conversion/review evidence without writing
semantic conclusions. `baseline` freezes reviewed bytes and rejects unfinished
or stale review. `check` is offline and read-only, detects source and output
drift, and never repairs it. `diff` compares two archived manifests.

For detailed source and business decisions read
`docs/maintainer/patent-disclosure-skill.md`. Read
`docs/user/patent-workflows.md` when reviewing delivery prerequisites or user
examples, and `docs/user/usage-model.md` for workflow authority.

## Authority and failure handling

Fixed patent Procedures produce ordinary files outside `researchspec/`.
ResearchSpec CLI alone owns run, node, handoff, Gate, Decision and transitions.
Docket tools perform one semantic round; graph profiles own iteration and
coordination. A three-round budget is guidance presented in the entry summary,
not an engine maximum. Layout and branch decisions require human confirmation.

Conversion and static inspection do not execute tools, install dependencies,
configure credentials, download models, start browsers or contact services.
Explicit runtime invocation follows target-Agent authorization and user-selected
paths. Missing tools produce recorded limitations and usable partial semantic
outputs; never claim that an unexecuted delivery or check succeeded. A map is
advisory presentation over a selected corpus; Obsidian is a selected projection.
Patent sources retain their type and cannot stand in for empirical validation.
