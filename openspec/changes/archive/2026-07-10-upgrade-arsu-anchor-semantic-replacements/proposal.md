# Harden ARSU Anchor Semantic Replacements

## Why

The semantic replacement pass has the right contract direction, but review found
that it can report success while replacing only one evidence line, retaining
contradictory ARS runtime instructions, corrupting Markdown boundaries, and
leaving high-impact contract surfaces unaudited. Its semantic checks are also
self-consistency checks rather than independent verification of the generated
replacement block.

This change hardens anchor replacement into an auditable contract migration:
every high-risk runtime surface receives an explicit coverage decision, every
replacement owns a complete deterministic span, and generated instructions obey
ResearchSpec mutation ownership.

## What Changes

- Separate match evidence from explicit replacement start/end boundaries.
- Cover newly identified state, claim, compliance, review, source, and gate
  runtime surfaces, with explicit retained/diagnostic decisions where replacement
  is not appropriate.
- Make the template registry the semantic metadata source of truth.
- Preserve line endings and Markdown structure while replacing complete spans.
- Keep generated HTML markers minimal: only the anchor id required to pair start
  and end markers remains in runtime Markdown; maintenance metadata stays in the
  manifest and human report.
- Validate the exact marker block, unresolved coverage, mutation ownership, and
  contradictory legacy runtime instructions.
- Canonicalize manifest comparison so idempotence reflects semantic drift rather
  than JSON key or unordered-array ordering.
- Regenerate the human-readable before/after report and all ARSU-derived output.

## Non-Goals

- Do not replace diagnostic-only or explicitly retained surfaces.
- Do not expose converter maintenance as public user CLI.
- Do not perform broad current-only cleanup of upstream ARS content.
- Do not remove ARS workflow semantics that remain valid as artifact payload or
  compatibility behavior.
