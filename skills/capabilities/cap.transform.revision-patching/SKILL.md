---
name: cap.transform.revision-patching
description: "Deterministically anchors and applies revision patches fail-closed."
metadata:
  capability_id: cap.transform.revision-patching
  node_kind: checker
  execution_type: mixed
  gate_policy: required
  license: CC BY-NC 4.0
---

# Revision Patching

Execute exactly one ResearchSpec capability node.

## Inputs

- `revision_patch` (revision-patch.v1)

## Outputs

- `patched_manuscript` (patched-manuscript.v1)

## Knowledge

- Load knowledge ID `revision-patch-protocol` from `knowledge/revision-patch-protocol.md`.

## Procedure

# Procedure

Work from a structured `revision_patch`. Produce `patched_manuscript`.

1. Validate patch schema and target manuscript hash.
2. Apply changes using the deterministic anchor/apply tooling:
   - anchorize the target into stable blocks
   - apply only declared changes
   - fail closed on any unmatched block
3. Verify untouched block bytes are preserved.
4. If changes are structural, escalate for human confirmation rather than silently proceeding.
5. Return the patched manuscript and an apply report.

## Output Format

```markdown
## Patch Apply Report
- applied_actions: [...]
- untouched_blocks: N
- escalations: [...]
- output_hash: [...]
```

## Completion

When finished, submit the declared outputs through `researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal action. Do not choose, start, or advance another node, phase, mode, or run.
