---
name: check-citation-existence-verification
description: "Deterministic resolver-based citation existence report."
metadata:
  capability_id: check-citation-existence-verification
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Citation Existence Verification

Execute exactly one ResearchSpec capability node.

## Inputs

- `annotated_bibliography` (annotated-bibliography.v1)

## Outputs

- `citation_verification_report` (citation-existence.v1)

## Knowledge

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.
- Load knowledge ID `validators-citations.py` from `validators/citations.py`.

## Tools

- `validators/citations.py` implements the package's authored computation; invoke it only through the declared runner and arguments.

## Procedure

# Procedure

Generate the report with `validators/citation-verification-gate.py` using the executable report contract below.

Supply structured bibliography records with per-resolver observations gathered by user-authorized host tools. Computation is offline: missing observations remain unresolvable, never nonexistence evidence. No services or credentials are accessed.

Use JSON/YAML `{entries: [...]}` (or a root array). Each entry has citation_key
and resolver_outcomes, keyed by crossref/openalex/semantic_scholar/arxiv. Each
observation contains status (`matched`, `unmatched`, `unreachable`, `skipped`)
and queried_by (`id` or `title` for matched/unmatched, null otherwise). Preserve
the citation metadata and evidence accompanying those observations. Missing
outcomes are allowed and reported as not_checked.

1. Resolve each reference through the declared index/API matrix and preserve every
   resolver outcome, including skipped, unreachable, matched, and unmatched.
2. Use the degradation registry when services are unavailable; distinguish an
   outage from evidence that an identifier does not exist.
3. Return `lookup_verified: true | false | unresolvable`. `false` is reserved for
   an ID-keyed unmatched result with no matching resolver; title-only unmatched,
   all-skipped/manual input, and unavailable coverage remain `unresolvable`.
4. Preserve any supplied retraction-status finding as a separate bibliographic
   integrity fact. Do not infer it from a legacy field or decide terminal policy
   in this checker.
5. `unresolvable` must never be treated as pass, and no missing source or status
   may be filled from model memory.

## Output Format

Structured verifier findings from the script, including resolver outcomes and any
retraction advisory.

## Executable report contract

Use Python 3 with PyYAML for YAML inputs; PDF parsing additionally needs pypdf.
Use the host's already configured Python environment. Missing dependencies must
be reported; never install them without user authorization.

Create an external request JSON with `inputs: [{"role": "<input role>", "path": "<absolute material path>"}]`
from the paths returned by `researchspec instructions`. Run:

`python3 validators/citation-verification-gate.py existence /absolute/request.json --generate`

Save stdout unchanged as the declared external JSON report. The validator used by
`advance` recomputes the report from the graph's current resolved inputs and
rejects altered results. It does not write reports or mutate inputs. A valid
report can contain FAIL, UNAVAILABLE or not_checked findings: these remain
visible evidence for the owning human Gate, never a scientific clearance.


## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
