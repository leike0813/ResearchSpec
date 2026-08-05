## Context

The current workspace contract parses manuscript metadata, handoff roles, and start confirmations independently. The academic pipeline is projected from a typed profile, while ARSU Skill trees are generated from pinned upstream sources. Manuscript files remain ordinary project files outside `researchspec/`, so format delivery must be represented as metadata and handoff roles without making the CLI an artifact registry.

Quarto is an optional host tool. ResearchSpec must observe its availability without installing it, contacting the network, or making status/check/doctor/init dependent on the local executable. Formatting is therefore a producer-owned operation that receives one external `.qmd`, renders to a temporary staging directory, validates the expected target, and atomically publishes only after all checks pass.

## Goals / Non-Goals

**Goals:**

- Make Markdown and QMD explicit, validated manuscript source choices.
- Preserve a confirmed format snapshot through each subflow start and reject stale snapshots.
- Provide typed Quarto probe states and a converter-owned no-execute single-file renderer.
- Route every accepted review/re-review branch through a formatting child before final integrity.
- Keep external manuscript and rendering files outside `researchspec/` and out of `pack`.
- Regenerate ARSU projections from converter rules with QMD-compatible revision and annotation behavior.

**Non-Goals:**

- No Quarto installation, dependency management, network access, or runtime service.
- No multi-file Quarto project contract, `_quarto.yml`, extension installation, remote resources, or Pandoc fallback.
- No new public command or Companion Skill, and no compatibility reader for older workspace schemas.
- No direct hand editing of generated `skills/arsu/**` files.

## Decisions

1. **Format metadata is a core contract.** Add `working_format` (`markdown | qmd | null`) and nullable `final_output_format` to `ManuscriptSpec`. Keep `format_requirements` as venue/layout constraints. Add optional format metadata to handoff items and a required format snapshot in start confirmation only when supplied by the route. This lets early intake remain unresolved while making an accepted choice immutable for a running subflow.

2. **Use a structured format descriptor.** Handoff format metadata identifies `format`, optional target `format_id`, and optional `renderer`; QMD inputs must end in `.qmd`, and Quarto outputs require `renderer: quarto` plus a safe format ID. Zod refinements are the single validation source.

3. **Probe through a small host adapter.** `quarto --version` runs only from explicit writing/formatting instruction or start preparation paths. The adapter returns `available`, `unavailable`, or `unknown` with version/error/timeout metadata and never writes files. Callers decide when a probe is warranted; status/check/doctor/init do not call it.

4. **Render with staging and atomic delivery.** The helper accepts one QMD path, one target format ID, one confirmed destination, and an optional independent `render_consent`. It defaults to `--no-execute`, stages Quarto output in a sibling temporary directory, rejects an existing destination unless force is explicitly represented by the caller, and leaves handoffs unchanged on any failure.

5. **Model the pipeline as profile data.** Add `format` as a one-shot child owned by no new authority, route it to `academic-paper:format-convert`, and add transitions from accepted review/re-review to `format` and from `format` to `final-integrity`. The final gate's evidence roles name both the source and rendered deliverable. Existing workflow-control algorithms remain generic.

6. **Converter owns ARSU edits.** Extend source rewrite/anchor replacement rules for QMD-compatible Markdown parsing, regenerate the four ARSU trees, and let existing revision/annotation block/hash logic operate on frontmatter and fenced code without interpreting Quarto directives.

## Risks / Trade-offs

- [Quarto output naming differs by format] -> Require a single target per formatting child and verify the expected staged file before publishing.
- [A user selects QMD on a host without Quarto] -> Permit start and writing, but block formatting child start with a structured unavailable/unknown diagnostic.
- [Format changes after a subflow is confirmed] -> Store a snapshot and compare it against the current manuscript contract before start; require a project change for later choices.
- [Generated Skill drift] -> Keep source rules and anchor replacements in the converter, then run conversion, check, and idempotence tests.

## Migration Plan

The current schema remains version `1`; new fields are optional/null for newly initialized workspaces. Existing Markdown flows continue with `working_format: markdown` when selected and otherwise remain unresolved until writing intake. Regenerate checked-in projections and update current templates/specs. There is no migration or silent conversion of an existing manuscript.

## Open Questions

None for v1. Future work may add a validated multi-target output list while retaining the single-target renderer contract.
