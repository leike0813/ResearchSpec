## Context

After the graph-engine refactor, capability packages were operational but uneven: several Skills
described only inputs, outputs and knowledge refs. The host Agent executing a node therefore had
less node-local guidance than the pre-refactor ARSU agent prompts. The goal of this change is to
restore and then enforce "same semantic guidance thickness" for every graph node.

## Decisions

### Curated procedure files are converter input, not generated-output patches

Each authoring source in `src/arsu-converter/authoring/*-sources.ts` now binds a procedure markdown
file. The converter inlines that file into `SKILL.md`, so generated output remains deterministic and
idempotent and cannot drift from hand-edited package files. A source without a procedure stays
`skeleton`; a source with one is `operational`.

### Upstream extraction artifacts are the parity baseline

`docs/ars_extraction/extraction-index.json` is the verified, converter-owned link between capability
manifests and upstream source. The audit reads only non-knowledge markdown capability artifacts as
semantic source and separately checks that every knowledge-pack artifact in provenance is covered by
a manifest knowledge ref.

### Parity is a measurable floor, not semantic equivalence

The audit uses normalized token overlap to estimate section and rule coverage. Thresholds are a
regression lower bound: section coverage >= 0.7, rule coverage >= 0.6, output-format section
preserved, knowledge coverage and reference coverage equal 1, and no flow headings retained. The
report keeps per-package uncovered sections and rules so future deepening remains directed.

### Flow text is excluded from both sides of the audit

Upstream phase-boundary, mode-selection, trigger, quick-mode, pattern-protection, cross-model and
related flow sections are filtered from coverage expectations, and the same heading families must
not appear in generated Skills. This preserves the graph-engine invariant that Skills never carry
workflow authority while allowing semantic procedure content to be as thick as upstream.

### Knowledge packs stay single-sourced

Procedures may summarize when to apply a knowledge pack, but mandatory rubrics and protocols remain
in `knowledge/` and are referenced from `SKILL.md`. The audit's knowledge-reference check makes a
missing `SKILL.md` reference a hard failure.

## Risks

- Lexical overlap can overstate semantic coverage. Mitigation: the report retains uncovered sections
  and rules, and the test asserts only the floor, not equivalence.
- Long procedures could reintroduce mode/team orchestration while paraphrased. Mitigation: the flow
  heading check plus the existing `No Embedded Flow Authority` scenario and authoring tests.
- Generated content must remain CC BY-NC compatible. Procedures are authored adaptations of
  already-extracted upstream capability artifacts; no new upstream file or runtime dependency is
  introduced.

## Non-Goals

- No formal semantic equivalence checker or LLM judge in this change.
- No changes to graph profiles, node lifecycle, CLI commands, workspace schema or runtime protocol.
- No hand-editing of generated `skills/capabilities/**` output.
