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
