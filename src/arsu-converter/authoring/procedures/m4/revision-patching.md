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

## Response-To-Reviewers Co-Emission

After a successful apply, co-emit `response_to_reviewers` at an ordinary project path outside `researchspec/`:

- One provisional response item per roadmap item addressed by the patch.
- Each item carries: response text, status (`addressed` / `declined` / `partial`), decline justification when applicable, and the `roadmap_item_ids` or stable correction IDs (`IL-SERIOUS-<n>`, `IL-MEDIUM-<n>`, `IL-MINOR-<n>`, or native experiment-alignment IDs) it claims.
- Integrity-correction rounds emit no response items because no review round occurred.
- Never fabricate a response for an item the patch did not address; mark it `not_addressed` and route it for human decision.

```markdown
## Response to Reviewers (provisional)

| item_id | response | status | justification |
|---|---|---|---|
```

## Output Format

```markdown
## Patch Apply Report
- applied_actions: [...]
- untouched_blocks: N
- escalations: [...]
- output_hash: [...]
```
