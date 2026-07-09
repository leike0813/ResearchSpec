# Technical Design

## Goals

Create the audit baseline needed for a later converter stage that can replace
ARS-native contract instructions with ResearchSpec-compatible instructions at
the actual execution points, not only in `SKILL.md` entrypoints.

The baseline must be explicit, reviewable, and deterministic:

- a human audit document explaining what was found and why it matters;
- a curated anchor table describing future replacement targets;
- an upstream manifest that detects file-structure and content drift;
- a lightweight check that validates those assets against `vendor/ars`.

## Scope

Audit runtime sources under:

- `vendor/ars/deep-research`;
- `vendor/ars/academic-paper`;
- `vendor/ars/academic-paper-reviewer`;
- `vendor/ars/academic-pipeline`;
- `vendor/ars/shared`.

The audit targets contract surfaces that can confuse ResearchSpec runtime
ownership:

- Material Passport / Schema 9 as runtime SSOT;
- Schema 5, 7, 8, 11, and 12 handoff artifacts;
- phase directory read/write boundaries;
- sprint contract and generator-evaluator contracts;
- revision patch and commitment ledger instructions;
- integrity and review gates;
- handoff protocol and artifact provenance;
- executable references to ARS-native runtime scripts or hooks.

## Anchor Table

`src/arsu-converter/anchors/contract-anchors.json` is a curated source artifact,
not generated output. Each anchor records:

- `id`: stable ResearchSpec anchor id;
- `source_path`: path under `vendor/ars`;
- `owner_skill`: upstream skill group or `shared`;
- `contract_category`: semantic contract category;
- `severity`: `required`, `recommended`, or `diagnostic`;
- `match_hints`: robust text and structural hints for future matching;
- `replacement_intent`: intended ResearchSpec compatibility rewrite;
- `future_template_id`: id of the future replacement template.

Required anchors are future blocking targets: once matcher/replacement exists,
a missing required anchor should fail conversion unless deliberately waived.

Anchors must not rely on line numbers as their only locator. Line numbers may be
used as diagnostics in generated reports later, but the table should use stable
phrases, headings, schema names, and nearby text patterns.

## Upstream Manifest

`src/arsu-converter/anchors/upstream-manifest.json` is generated from the fixed
`vendor/ars` checkout and committed as an audit baseline. It records:

- upstream commit;
- audited roots;
- runtime file entries;
- frontmatter keys and selected frontmatter values;
- heading tree for Markdown files;
- normalized SHA-256 content hash;
- contract-risk keyword hits.

The manifest is intentionally about upstream shape and drift detection. It does
not define replacement semantics and does not rewrite upstream content.

## Validation Script

Add a developer-only checker under `src/arsu-converter/anchors/` and expose it
with `pnpm arsu:anchors:check`.

The checker validates:

- `vendor/ars` exists and resolves to the manifest commit;
- manifest files match the current audited runtime tree;
- normalized file hashes match current upstream content;
- anchor source files exist;
- every anchor has non-empty robust match hints;
- no anchor relies only on line-number matching;
- every required anchor has replacement intent and future template id.

The checker does not:

- match anchors against content beyond lightweight hint presence checks;
- replace text;
- modify generated ARSU skills;
- call LLM APIs.

## Documentation

`docs/arsu_contract_anchor_audit.md` explains:

- why entrypoint-only injection is insufficient;
- which upstream runtime surfaces were audited;
- the major contract replacement categories;
- how to interpret anchor severity;
- what the follow-up matcher/replacement change should implement.

The document is design/audit guidance, not a formal schema.

## Boundaries

This change does not alter the public `researchspec` CLI. The anchor checker is
developer maintenance tooling, consistent with the ARSU converter surface.

This change also does not enforce current-only cleanup. Upstream history,
version, changelog, issue, or schema-version language remains acceptable unless
it is specifically anchored as a contract surface for future replacement.
