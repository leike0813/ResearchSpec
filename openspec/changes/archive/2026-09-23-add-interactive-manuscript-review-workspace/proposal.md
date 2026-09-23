# Proposal

## Why

ResearchSpec already has durable contracts for annotation intake, paper humanization, and review-response work, but users still review their artifacts through disconnected files and chat turns. A shared interactive review workspace can make those decisions easier without creating a second workflow engine or weakening the existing CLI, Gate, Decision, and file-authority boundaries.

## What Changes

- Add a versioned, workflow-neutral review-workspace document contract for manuscript context, review items, user dispositions, and handoff guidance.
- Add adapters for annotation candidates, paper-humanizer plans, and revision-master workboards so the three existing workflows can project into one bounded interaction model.
- Add a self-contained static browser workspace that imports a review-workspace JSON file, supports focused review and local decisions, and exports an updated JSON handoff without directly mutating manuscript or ResearchSpec state.
- Expose review-workspace metadata from relevant graph instruction packets and package the same static asset with the paper-humanizer and revision-master capability trees.
- Document the authority boundary, expected user flow, and safe handoff back to the owning Agent/CLI.

## Capabilities

### New Capabilities

- `interactive-manuscript-review-workspace`: Defines the shared review-workspace contract, workflow adapters, static interaction surface, and export behavior.

### Modified Capabilities

- `manuscript-annotation-intake-adapters`: Annotation candidates can be projected into the shared review workspace without changing candidate authority.
- `paper-humanization`: Humanization plans can be reviewed through the shared workspace while graph Gates and Decisions remain authoritative.
- `review-response`: Atomic comment workboards can be reviewed through the shared workspace while SQLite and graph state retain their existing authority.
- `cli-interface`: Relevant node instruction packets expose bounded review-workspace integration metadata without adding commands or mutations.

## Impact

The change affects a new public TypeScript export, graph instruction rendering, the repository-local static review asset, paper-humanizer and revision-master authoring sources, generated capability packages, focused tests, and user/developer documentation. It adds no dependency, public CLI command, database, network service, or new workflow-state authority.
