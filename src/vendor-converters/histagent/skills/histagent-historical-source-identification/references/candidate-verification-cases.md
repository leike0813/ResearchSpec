# Candidate verification cases

Read this file only when creating, validating, or changing a candidate status. The Agent remains responsible for source identity and relevance judgments.

## Status meanings

- `discovered`: a query or index returned a locator; content identity is not yet confirmed.
- `retrieved`: bytes were obtained and hashed; identity or relevance may still need review.
- `verified`: the Agent checked the material or authoritative metadata and recorded why it matches the intended source.
- `inaccessible`: the locator and discovery evidence are retained, but content could not be obtained or checked.
- `rejected`: the Agent determined that the candidate is not the intended source or is not relevant.

`retrieval_status` mirrors the current candidate status in this Skill. A verification artifact also contains `verification_note`.

## Minimum candidate

```json
{
  "candidate_id": "5e4c12d43d8f1f7f9b62",
  "title": "Annual report, 1901",
  "locator": "https://archive.example/report-1901",
  "canonical_url": "https://archive.example/report-1901",
  "originating_query": "institution annual report 1901",
  "provider_or_repository": "local-index",
  "date": "1901",
  "status": "discovered",
  "retrieval_status": "discovered",
  "evidence": {"match_locator": "catalog-42"},
  "warnings": []
}
```

## Verification decisions

Use `verified` when identifying features such as title page, date, creator, shelfmark, edition, or repository record align with the research target. The note should state what was checked, not merely "looks correct."

Use `rejected` when evidence shows a different edition, namesake institution, derivative transcription, unrelated image, or misleading snippet. Preserve discovery provenance so the same false lead is not rediscovered without context.

Use `inaccessible` when access is denied, retrieval fails, the object is missing, or policy prevents opening it. Do not convert inaccessible to rejected unless evidence actually disproves identity.

## Near misses

- A high search rank is still `discovered`.
- A successful HTTP status and hash establish `retrieved`, not authentic or relevant.
- Matching filenames are not sufficient for reverse-image verification.
- A snippet may support query refinement but cannot support a quotation from unfetched content.
- A repository citation copied from another work should be independently located and checked before `verified`.
