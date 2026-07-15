# Evidence and conflict cases

Read this file only when conflicts, limitations, review, or synthesis affect the Gate. The Agent makes historical judgments; the script checks explicit records and references.

## Conflict record

Start unresolved:

```json
{
  "record_type": "conflict",
  "conflict_id": "conflict-1",
  "description": "The annual report and newspaper give different opening dates.",
  "status": "unresolved",
  "resolution": ""
}
```

After reviewing both sources, resubmit the same ID with `status: "resolved"` and a treatment such as reporting both dates, preferring one with reasons, or limiting the claim. Resolution means the conflict has an explicit treatment; it does not mean the evidence has become consistent.

## Limitation record

```json
{
  "record_type": "limitation",
  "limitation_id": "limitation-1",
  "description": "The 1902 report is missing, so continuity cannot be established."
}
```

Record access gaps, representativeness limits, uncertain attribution, edition problems, or dependence on machine transcription when they constrain conclusions.

## Review record

```json
{
  "record_type": "review",
  "conflicts_reviewed": true,
  "limitations_reviewed": true
}
```

This is an explicit Agent assertion after inspecting the complete collections, including the legitimate case where neither collection contains an item. Adding or changing a conflict or limitation makes the corresponding review stale.

## Synthesis record

```json
{
  "record_type": "synthesis",
  "text": "The available records consistently describe maintenance as the primary mandate, but the missing 1902 report limits claims about continuity.",
  "evidence_ids": ["evidence-1", "evidence-2"]
}
```

The synthesis must acknowledge recorded conflict treatment and limitations in its semantic content. The runtime verifies known evidence IDs but cannot judge adequacy of acknowledgment.

## Conflict patterns

- Independent sources disagree: retain both and explain weighting.
- A derivative source disagrees with a primary source: record dependence and do not count it as independent corroboration.
- OCR differs from visual inspection: preserve raw OCR, add the appropriate emendation or transcription layer, and identify the reading used.
- Translation alternatives change meaning: preserve alternative translations or an explicit uncertainty rather than selecting silently.
- Metadata and content disagree: keep discovery metadata separate from what the retrieved object actually shows.

## Gate recovery

If the Gate returns `unresolved-conflict`, submit a revised conflict record. If it returns conflict or limitation review, inspect the full state and submit one review record. If it returns `no-synthesis`, prepare synthesis from known evidence IDs. After each mutation, discard the old token and run `status` again.
