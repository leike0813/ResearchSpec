---
name: cap.check.temporal-integrity-verification
description: "Runs five-pass temporal lint against manuscript claims."
metadata:
  capability_id: cap.check.temporal-integrity-verification
  node_kind: checker
  execution_type: script
  gate_policy: required
  license: CC BY-NC 4.0
---

# Temporal Integrity Verification

Execute exactly one ResearchSpec capability node.

## Inputs

- `manuscript_draft` (manuscript-draft.v1)

## Outputs

- `temporal_audit_report` (temporal-audit.v1)

## Knowledge

- Load knowledge ID `degradation-registry` from `knowledge/degradation-registry.json`.

## Procedure

# Procedure

Work from `manuscript_draft` and available timeline/citation provenance. Produce `temporal_audit_report`.

1. Run the five deterministic passes:
   - P1 future-as-past arithmetic
   - P2 version-as-evidence anachronism
   - P3 unmaterialized comparators
   - P4 causal inversion
   - P5 deictic time bombs
2. When dates are unavailable, emit `TEMPORAL-METADATA-MISSING` rather than passing silently.
3. Classify findings as advisory or blocking according to the current degradation registry.
4. Return machine-readable findings and a human-readable summary.

## Output Format

```markdown
## Temporal Audit Report
| pass | finding | claim | severity |
|---|---|---|---|
```

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
