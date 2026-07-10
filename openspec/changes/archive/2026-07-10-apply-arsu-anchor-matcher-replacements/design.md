# Technical Design

## Goals

Implement the first conversion-time replacement layer for audited ARSU contract
anchors. The matcher should be robust enough for upstream prose drift, but
simple enough to remain deterministic and reviewable.

The replacement layer must keep ARS workflow intent while making ResearchSpec
runtime ownership explicit: workflow/state contracts, artifact registry,
decision ledger, gate ledger, and draft patches are the runtime sources of
truth; ARS schemas and Material Passport text are compatibility artifacts or
payload projection sources.

## Matcher

Add an anchor matcher under `src/arsu-converter/anchors/` that loads
`contract-anchors.json` and scans the fixed `vendor/ars` checkout.

Matching rules:

- `source_path` selects the upstream file.
- `headings` limit the search window when present.
- `snippets` are matched with whitespace-tolerant regular expressions.
- `keywords` are checked case-insensitively inside the chosen window.
- line numbers are never used as the matching strategy.

For each anchor, emit a deterministic match record:

- anchor id;
- source path;
- owner skill;
- contract category;
- severity;
- future template id;
- matched boolean;
- replacement mode: `replace` for `required`/`recommended`, `diagnostic` for
  diagnostic anchors;
- optional diagnostics.

Conversion blocks before writing output if any `required` or `recommended`
anchor is unmatched. Diagnostic anchors only produce warnings.

## Replacement Templates

Add a replacement template registry keyed by existing `future_template_id`.
Templates are generated text blocks, not user-authored upstream edits.

Every replacement block uses stable markers:

```text
<!-- researchspec-anchor-replacement:start anchor_id="..." template_id="..." source_path="..." severity="..." -->
...
<!-- researchspec-anchor-replacement:end anchor_id="..." -->
```

Template text should be compact and current-state oriented. It should:

- identify the ARS contract concept being normalized;
- state the ResearchSpec runtime home;
- preserve ARS payload/semantic intent where appropriate;
- instruct agents to use ResearchSpec registries and ledgers for writes.

The first implementation can share category-level body text across multiple
template ids, but each id must be explicit and traceable.

## Converter Integration

Run the matcher immediately after upstream checkout validation and before
generated output overwrite/removal. This ensures missing required/recommended
anchors fail before `skills/arsu` is touched.

During text copy:

1. Read upstream text.
2. Apply anchor replacements for that source file.
3. Run unresolved-link neutralization and dependency link rewriting.
4. Inject the existing `SKILL.md` Contract Preflight block when applicable.
5. Write generated text.

Replacement state should be passed into `emitSkillGroup` so copied shared or
cross-skill dependency files receive the same source-path-specific
replacement behavior.

## Generated Metadata

Extend generated metadata with an `anchor_replacements` section containing:

- profile id;
- source commit;
- total anchors;
- replaceable anchors;
- diagnostic anchors;
- matched count;
- replaced count;
- diagnostic matched count;
- missing blocking anchors;
- per-anchor records.

Add equivalent summary to `conversion-report.md`.

Extend `researchspec-contracts.json` to declare:

- anchor replacement profile id;
- replacement coverage policy: `required_and_recommended`;
- diagnostic-only policy for diagnostic anchors.

## Validation

Generated output validation checks:

- every replaced anchor record has a matching start/end marker in the expected
  generated output file;
- marker anchor ids are listed in the manifest;
- all replaceable anchors are replaced;
- diagnostic anchors are not required to appear as replacement markers.

Validation remains deterministic and local-file only.

## Boundaries

This change does not modify public user CLI behavior and does not add
maintainer companion skills. It does not clean broad upstream history or version
language. It only rewrites audited contract anchors.
