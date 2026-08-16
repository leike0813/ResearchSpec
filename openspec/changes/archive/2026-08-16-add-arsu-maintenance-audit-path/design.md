## Context

After the capability graph refactor and semantic deepening, the project had generated parity and
review evidence but no committed maintenance anchor. The HTML reports lived in the root `artifacts/`
directory, the audit notes were sparse, and the maintenance procedure existed mostly in agent
instructions. This change makes the maintenance loop a first-class, auditable project surface.

## Decisions

### One anchor directory owns all audit evidence

`audits/arsu/<version>-<short_commit>/` contains machine records, the Agent semantic review, the
three HTML review artifacts and the hash manifest. Co-locating the HTML files with the records that
hash them means an auditor can open a single directory and verify the complete claim.

### Machine records and Agent judgment are separate files

`records` regenerates 01–04 from repository data and never overwrites an existing
`05-semantic-review.md`. The Agent writes preserved / adapted / removed / gap judgments with source
evidence into 05; `baseline` treats an incomplete 05 as a blocking error. Scripts provide
reproducible evidence, but cannot satisfy the semantic gate by themselves.

### The manifest is the verification contract

`baseline` captures SHA-256 values for the upstream tree, extraction index, registry, package tree,
parity report, three HTML artifacts, the maintenance Skill and all five audit records. `check`
compares the current workspace against that manifest and reports the first differing path, so
drift is diagnosed without chat-history archaeology.

### Generator defaults are anchor-scoped, not argument-coupled

The three HTML generators still accept an explicit output path for ad-hoc use, but their default
target is `audits/arsu/<anchor>/artifacts/`, selected by `ARSU_ANCHOR`. The package scripts drop the
old hard-coded root `artifacts/` arguments and delegate to `scripts/arsu-maintenance.mjs artifacts`.

## Risks

- Record regeneration timestamps mean record hashes change whenever records are refreshed; the
  process therefore re-runs `baseline` after `records` so the manifest always freezes the refreshed
  records.
- The first anchor is a lexical and Agent-judgment audit, not a formal proof of semantic
  equivalence. The `05-semantic-review.md` notes and the gap review HTML record residual risks.
- Removing the old root `artifacts/arsu-mode-*.html` files breaks stale links. The new paths are
  recorded in `04-review.md` and `audits/arsu/README.md`.

## Non-Goals

- No automatic LLM judge for semantic equivalence.
- No changes to capability packages, graph profiles, runtime contracts or CLI behavior.
- No incremental second anchor in this change; `diff` support is implemented but the first anchor
  remains `v3.19.0-828ef3b`.
