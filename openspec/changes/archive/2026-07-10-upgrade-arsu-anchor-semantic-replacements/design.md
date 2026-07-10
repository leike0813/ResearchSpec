# Design: Hardened ARSU Anchor Semantic Replacements

## Overview

Anchor replacement v2 remains the generated-output profile, but its implementation
is hardened before archive. The pipeline is:

```text
coverage audit -> anchor resolution -> explicit span match -> semantic render
  -> local block validation -> generated output -> canonical idempotence check
```

Upstream content outside an explicitly selected span remains unchanged.

## Anchor Model

Match evidence and replacement boundaries are different concepts:

- `match_hints` proves that the expected semantic context is present.
- `replacement_scope.start_snippet` and `replacement_scope.end_snippet` select
  the complete inclusive line span to replace.
- both boundaries must resolve uniquely and in order inside the selected heading
  window;
- diagnostic anchors do not declare a replacement scope.

The registry uses `template_id` as the current stable key. Semantic role,
ResearchSpec targets, replacement shape, and rendered content live only in the
template registry. The manifest and report record the resolved values, but the
anchor JSON does not duplicate them.

## Coverage Decisions

The anchor asset records replacement and diagnostic anchors plus explicit retain
decisions for high-risk occurrences that must remain upstream-compatible. A
deterministic coverage checker scans strong runtime-contract patterns such as
active Material Passport reads/writes, source-of-truth declarations, Schema
9/11/12 outputs, claim intent, generator/evaluator protocols, revision patches,
and gate/ledger behavior.

Every strong occurrence must be covered by an anchor span or an explicit retain
decision. Generic history, examples, and ordinary uses of words such as `phase`
are not blocking candidates.

## Replacement Rendering

Replacement content is concise and local. ResearchSpec mutation ownership is
shared with the entrypoint preflight:

- agents may produce semantic artifact or patch payloads;
- stable specs change only through accepted contract patches or direct human
  edits;
- artifact registry and runtime state are written by runtime helpers;
- decision ledger entries require a human-confirmed decision;
- gate ledger entries are written by validators or gate helpers.

The renderer emits minimal runtime markers:

```text
<!--rs:a:<12-hex-marker-id>-->
...replacement...
<!--/rs:a:<12-hex-marker-id>-->
```

The marker id is a deterministic 12-hex digest alias of the full anchor id.
Anchor id, template id, source path, severity, semantic role, targets, and hashes remain in
`conversion-manifest.json` and `anchor-replacement-report.md`. They are omitted
from runtime Markdown to reduce visual and token overhead.

If the replaced span ends with LF or CRLF, the replacement preserves that line
ending. Markers always occupy standalone lines.

## Semantic Corrections

- Reviewer sprint phase models remain generator/evaluator contracts, including
  blind pre-commitment and phase separation.
- Standalone rebuttal audit remains an advisory artifact boundary, not a reviewer
  commitment ledger.
- Claim-intent outputs are registered artifacts; changes to accepted claims are
  proposed through contract patches rather than written directly to stable specs.
- Compliance reports are registered artifacts whose verdicts are projected by a
  gate helper.
- Material Passport resume/state content is compatibility evidence, never active
  ResearchSpec runtime ownership.

## Validation

Generated-output validation extracts each exact marker block and checks:

- one ordered start/end pair exists in every recorded output path;
- the marker block, not merely its file, mentions a declared ResearchSpec target;
- markers are standalone and preserve the following Markdown boundary;
- resolved template metadata matches the manifest;
- the human report covers every replacement;
- obsolete generic headings and contradictory active-runtime phrases do not
  survive inside covered contract regions.

Manifest idempotence recursively canonicalizes object keys and only those arrays
whose order is semantically irrelevant. Ordered template sections and patch-like
operations retain their original order.

## Human Report

`anchor-replacement-report.md` remains the audit artifact containing complete
before/after blocks and maintenance metadata. It is excluded from legacy-term
risk scanning but included in hashes, validation, and idempotence.
