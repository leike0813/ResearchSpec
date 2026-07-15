# Layer and collation cases

Read this file only when preparing layer, variants, or emendations files, or when a source has ambiguous transformations. The five-layer separation and prohibition on unmarked completion remain mandatory from `SKILL.md`.

## Layer meanings

- `raw-observation-or-ocr`: directly extracted, observed, OCR-produced, or transcribed material before editorial correction.
- `normalized-transcription`: a normalized representation whose spelling, punctuation, whitespace, or encoding changes are stated.
- `emendation`: an explicit proposed correction or completion, with the evidence and uncertainty that justify it.
- `translation`: content expressed in another language while retaining its source-layer parent.
- `interpretation`: an Agent's historical or visual meaning claim, not source text.

Every layer record contains `layer`, `content`, `parent_id`, `locator`, `operations`, `tool_or_provider`, `reason`, `uncertainty`, `review_state`, and `content_sha256`.

## Valid translation input

```json
{
  "layer": "normalized-transcription",
  "content": "Die Eintragung nennt drei Lieferungen.",
  "parent_id": "source-17",
  "locator": "folio-4r",
  "operations": [{"type": "expanded-abbreviation", "detail": "Lfg. → Lieferung"}],
  "tool_or_provider": "invoking-agent",
  "reason": "readable diplomatic normalization",
  "uncertainty": "low",
  "review_state": "reviewed",
  "content_sha256": "<sha256>"
}
```

The translation command recalculates lineage and does not modify this record.

## Collation input

```json
{
  "variants": [
    {"id": "witness-a", "text": "colour"},
    {"id": "witness-b", "text": "color"}
  ]
}
```

An optional emendations file is explicit:

```json
{
  "emendations": [
    {"from": "witness-a", "reading": "colour", "proposed": "color", "reason": "modernized quotation for a separately labeled edition", "uncertainty": "low"}
  ]
}
```

An empty emendations array means no reading has been preferred. Sequence differences are evidence for Agent review, not automatic proof that one witness is erroneous.

## Near misses

- A translation inserted into `normalized-transcription` is invalid because language conversion is hidden.
- Square brackets added to raw OCR without an emendation record are unmarked completion.
- A vision description copied into raw observation is invalid when it includes inferred identity, intent, date, or causal meaning.
- Two witnesses normalized before comparison may erase the very variation under study; collate the most source-faithful available layers first.
