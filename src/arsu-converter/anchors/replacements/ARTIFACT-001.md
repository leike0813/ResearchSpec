Every pipeline material is a versioned artifact registered in
`researchspec/runs/current/artifact-registry.json`. Its registry record carries
the stable artifact id, path, content hash, producer, stage, mode, version label,
and supersession relationship. Verification status is not inferred from a
version string; it is supported by the responsible entry in
`researchspec/runs/current/gate-ledger.jsonl`.

| Material | Version-label convention | Example |
| --- | --- | --- |
| Research output | `research_v{N}` | `research_v1`, `research_v2` |
| Paper draft | `paper_draft_v{N}` | `paper_draft_v1`, `paper_draft_v2` |
| Integrity report | `integrity_{mid|final}_v{N}` | `integrity_mid_v1` |
| Review report | `review_v{N}` | `review_v1`, `review_v2` |
| Revision roadmap | `roadmap_v{N}` | `roadmap_v1`, `roadmap_v2` |
| Revision | `revision_v{N}` | `revision_v1` |

**Rules:**

- Version numbers increase monotonically within an artifact lineage and are
  never reused.
- A redo creates a new artifact and supersession edge; it never overwrites a
  prior version.
- The registry identifies the active version while preserving all prior hashes
  for rollback and audit.
- Cross-artifact references use stable artifact ids plus the expected version or
  hash, not a title alone.
- Imported Material Passport version fields may be preserved as compatibility
  metadata, but the registry and gate records remain authoritative.
