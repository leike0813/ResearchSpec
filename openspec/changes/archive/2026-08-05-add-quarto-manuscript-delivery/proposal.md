## Why

ResearchSpec currently treats a manuscript as an opaque Markdown-adjacent boundary file and has no contract for choosing a source format or producing a final rendered submission. That leaves Quarto Markdown (`.qmd`) outside the formal writing workflow and allows a pipeline to reach final integrity without proving that the selected source has been rendered by the required tool.

## What Changes

- Add a structured manuscript delivery contract with nullable `working_format` and validated Quarto `final_output_format`.
- Carry manuscript format metadata through handoffs and start confirmations, including a format snapshot and Quarto probe summary.
- Add read-only, bounded Quarto availability probing and a converter-owned single-file renderer with no-execute defaults, explicit execution consent, staging, and atomic delivery.
- Add a `format` child to the academic-pipeline profile and require it before `final-integrity`; final integrity consumes both the QMD source and rendered output.
- Update the ARSU converter source rules and generated projections so writing, review, revision, annotation, and format-convert preserve QMD frontmatter, code fences, and Quarto metadata boundaries.
- Update the canonical user model, workflow rehearsal, profile/contract specs, and tests. `pack` continues to exclude external manuscript and rendering files.

## Capabilities

### New Capabilities

- `quarto-manuscript-delivery`: Format selection, Quarto probing, single-file rendering, and atomic external deliverable handoff.

### Modified Capabilities

- `framework-core`: Manuscript specs accept a delivery contract and validate format-dependent fields.
- `subflow-instance-control-plane`: Handoffs and start confirmations carry format snapshots and renderer metadata.
- `arsu-workflow-profiles`: Academic pipeline routes accepted review outcomes through formatting before final integrity.
- `arsu-converter`: ARSU source rules preserve QMD-compatible manuscript content and project updated Skills.
- `manuscript-annotation-system`: Review copies and revision patches remain valid for QMD with frontmatter and fenced code.
- `arsu-user-model-acceptance`: User-visible journeys include format intake, Quarto availability states, and final delivery ordering.

## Impact

Affected TypeScript contracts and runtime modules under `src/core`, CLI instructions and start handling, ARSU workflow/routing converter modules, generated `skills/arsu/**`, OpenSpec specs and user-model documentation, plus focused contract, journey, pipeline, converter, and idempotence tests. No new public CLI command, runtime model dependency, Quarto installation flow, or workspace-managed manuscript artifact is introduced.
