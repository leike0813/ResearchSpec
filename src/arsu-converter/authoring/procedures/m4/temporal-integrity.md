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
