# Stage records

Read this file only when preparing a scope, source, layer, or evidence record. The Gate discipline, state authority, and no-invented-layer rule remain in `SKILL.md`.

## Scope file

```json
{
  "question": "How did the institution describe its mandate in 1901?",
  "source_strategy": "Compare the charter, annual report, and contemporary press commentary."
}
```

Keep the question bounded enough to identify relevant evidence and limitations. Strategy is semantic guidance, not a list of provider commands.

## Source record

```json
{
  "source_id": "source-1",
  "title": "Annual report, 1901",
  "locator": "archive:shelfmark/17",
  "provenance": {"sha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"},
  "layer_plan": {
    "raw-observation-or-ocr": {"status": "required", "reason": "The scanned page is the primary observation."},
    "normalized-transcription": {"status": "required", "reason": "Typography must be normalized for comparison."},
    "emendation": {"status": "not-applicable", "reason": "No damaged or disputed reading is being completed."},
    "translation": {"status": "not-applicable", "reason": "The source and report use the same language."},
    "interpretation": {"status": "required", "reason": "The mandate wording must be related to the research question."}
  },
  "registration_complete": true
}
```

Set `registration_complete` false while additional planned sources still need registration. Setting it true closes registration and lets the Gate request required layers.

## Layer record

```json
{
  "source_id": "source-1",
  "layer": "raw-observation-or-ocr",
  "content": "The institution shall maintain...",
  "parent_id": "source-1",
  "locator": "page-4",
  "operations": [{"type": "manual-transcription"}],
  "tool_or_provider": "invoking-agent",
  "reason": "Direct reading of the scanned page.",
  "uncertainty": "low",
  "review_state": "reviewed"
}
```

Submit only the source and layer named by the current Gate blocker. A parent may be the source or an earlier layer; never point to an unrelated source.

## Evidence record

```json
{
  "record_type": "evidence",
  "evidence_id": "evidence-1",
  "claim": "The 1901 report frames the mandate as maintenance rather than expansion.",
  "source_ids": ["source-1"],
  "support": "supports",
  "note": "Compare wording on page 4."
}
```

Evidence IDs are stable and synthesis refers to them. The script checks references but the Agent judges whether the sources actually support the claim.

## Record order

The normal order is source registration, required layers, at least one evidence record, conflicts and limitations as needed, review, synthesis, and render. `status` may keep returning `submit-evidence` while the Agent records several evidence-domain types; the blocker and `next_record_example` identify what is missing.
