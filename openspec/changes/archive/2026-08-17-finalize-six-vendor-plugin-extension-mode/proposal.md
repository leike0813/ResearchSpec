## Why

The six-vendor plugin extension program is now complete: FinRobot, HistAgent, Materials-Science-Skills-For-LLM, ToolUniverse, Scientific Agent Skills, and Education Agent Skills each have one-to-one extension capability packages, graph profiles, maintenance suites, and anchor audits. This change records the cross-cutting finalization that the six per-vendor changes intentionally left to the end: the `0.7.0` extension registry closure, shared generator version alignment, and the formal capability-manifest specification for byte-level knowledge hashes.

## What Changes

- Consolidate the final extension registry state at schema `"1"` / registry version `0.7.0` with 332 capabilities, 332 profiles, and 56 domain assignments.
- Align the ToolUniverse, Scientific Agent Skills, and Education Agent Skills generators on the same registry version so any vendor `baseline` cannot regress another vendor's manifest.
- Update `capability-manifest` specification: knowledge-file `content_hash` SHALL be SHA-256 over the file bytes; UTF-8 text and binary resources verify through the same byte-level rule.
- Bind the six vendor maintenance anchors and their package/profile tree hashes through their existing manifests.
- Keep every extension package static during install, update, status, and check; only declared `python3` validators execute during `advance`.

## Impact

- No public CLI command changes and no new manifest schema fields.
- Registry loads now validate 332 capability packages and 332 profiles; extension checks remain static and offline.
- Text knowledge-ref hashes are unchanged by the byte-level rule; binary assets now project and verify correctly.

## Capabilities

### Modified Capabilities

- `capability-manifest`: knowledge packs now explicitly verify byte-level SHA-256 content hashes.

### New Capabilities

None.
