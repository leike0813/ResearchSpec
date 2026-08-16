## Context

Paper Humanizer upstream exposes three modes from one `SKILL.md`: reference (instruction-only),
review (read-only diagnosis plus a revision plan), and full (interactive plan negotiation, bounded
prose edits, deterministic document analysis, verification, and user acceptance). The old absorption
kept those modes inside one `skills/paper-humanizer` tree and added a schema-1 one-shot profile.
The capability graph engine requires each Skill to be one atomic node with typed roles and no
next-step prose.

## Decisions

### Reference mode becomes a projected capability

The 39-pattern taxonomy, false-positive protections, and protected-content rules are extracted as
`PH-CAP-03` and packaged as `cap-generation-humanization-reference`. Other prose-producing or
prose-revising capabilities can load that entrypoint without starting a humanization run; review,
revision, and verification packages also carry the taxonomy as a knowledge pack.

### Review, revision, and verification are separate nodes

- `cap-check-paper-humanization-review` never edits source text.
- `cap-transform-paper-humanization-revision` edits only approved prose `text` fields in the
  `document_pipeline.py` artifact, then analyzes, validates, and renders the candidate.
- `cap-check-paper-humanization-verification` re-runs deterministic validation and the bidirectional
  information-unit comparison before human acceptance.

### Graph data owns the full-mode loop

The `paper-humanizer` preset graph declares:

```text
review -> plan-gate -> revision -> verification -> acceptance decision
                                   ^                              |
                                   +----------- revise -----------+
```

`plan-gate` is a required human Gate for the current plan. The acceptance Decision owns the
revision-round template with `revise` / `accept` options, so candidate rejection returns to the
revision node without inventing a loop in Skill prose.

### Extraction artifacts stay byte-faithful

The seven artifacts are copied from the pinned `vendor/paper-humanizer` files and verified by SHA-256
in `extraction-index.json`. Curated procedures adapt them for node execution; they are never shipped
verbatim as runtime flow.

### Python scripts are packaged tools, not lifecycle authority

`document_pipeline.py` remains the deterministic parser/analyzer/validator for document artifacts.
`full_workflow.py` is retained as provenance but is not invoked by the graph engine; its
plan/gate/state semantics are superseded by graph Gates and Decisions.

## Risks

- The full workflow loop is adapted to one review node and one acceptance Decision; plan revision
  after verification failure returns to revision with the existing plan rather than renegotiating a
  new plan. A future follow-up can add a repeatable review node if that path becomes necessary.
- Removing `paper-humanizer` breaks stale tool projections. Projection reconciles capability
  packages through the existing init/update path; no runtime migration is provided.
