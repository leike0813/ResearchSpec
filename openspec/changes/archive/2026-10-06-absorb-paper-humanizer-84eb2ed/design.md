# Design

## Context

See proposal.md for motivation. The vendor is a static snapshot, not a submodule. Nine extraction artifacts feed four packages through existing authoring. The local upstream is clean at `84eb2ed`; remote HEAD still points to the prior snapshot. Only the packaged taxonomy changed; new academic diagnostics live outside the upstream Skill directory.

## Goals / Non-Goals

Keep exact upstream bodies in extraction artifacts and put execution requirements in the curated procedures. Preserve the existing graph, runtime, and IDs. Host Hook adapters and `.mcp.json` remain audit-only material.

## Decisions

- Use `snapshot-84eb2ed`, since `humanizer-2.9.1` names a baseline dependency rather than a tagged paper-humanizer release. Record the repository, commit, subtree, and supplemental root-reference mapping in SOURCE.json.
- Preserve the existing diagnostic guidance. Add root `references/diagnostic-guidance.md` as `academic-diagnostic-guidance.md` rather than replacing a different, unchanged packaged reference. Review and Verification load the new context only for academic prose.
- Put patterns 40–43, the academic negation refinement, false-positive protections, and qualitative pre-output checks in the Reference procedure. Review owns actionable academic scan rules. Supporting examples retain upstream text; source information-unit preservation governs every suggestion.
- Treat the Hook guard as authored writing guidance, not permission to inject instructions on every host turn. Preserve its source asset in the vendor snapshot and map its checks to the existing Reference instructions without adding a runtime or second host entry.
- Existing maintenance manifests hash the entire shared catalog and maintenance Skill. Refresh revision-master's current records after verifying its upstream, extraction, registry subset, and package tree remain unchanged. Preserve the old paper-humanizer anchor.
- ARSU maintenance also binds the aggregate core directory, including the four paper-humanizer packages. Refresh its existing anchor's aggregate records and review artifacts, preserving the ARS input, extraction, packages, and graph bytes. Use the existing verified whitespace-exemption catalog for exact upstream Markdown bytes; keep raw Git diff text escaped inside the source-inventory JSON.

## Risks / Trade-offs

- Upstream says both 39 and 44 patterns, while its headings number 1–43 → preserve verbatim provenance and use the actual numbered taxonomy in execution guidance.
- Upstream examples may suggest adding unsupported argument or limitation details → require bidirectional information-unit preservation and mark uncertainty unresolved.
- Root academic diagnostics mislabel taxonomy pattern 2 as paragraph templates and say new information exempts reintroduction → treat names and contextual evidence as authoritative, with required citation keys and newly supplied information preserved.

## Migration Plan

Update the static inputs and curated sources, regenerate the four packages twice, complete Agent semantic review, run parity and project checks, then freeze and check both current maintenance anchors. No workspace migration is involved.
