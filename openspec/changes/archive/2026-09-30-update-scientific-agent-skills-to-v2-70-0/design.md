# Design

## Context

See proposal.md. The current converter duplicates source identity and fixed review counts. Upstream v2.70.0 has a separate machine security report and changes every admitted entry.

## Goals / Non-Goals

Maintain source-bound reviewed static projections and independent workflow authority. No upstream runtime or dependency installation is part of maintenance.

## Decisions

The maintenance catalog owns active release, revision and audit paths. Structural schema checks use current evidence completeness rather than historical list lengths. The immutable audit records all current source observations; admission and finding-level reviews remain separate policies. Historical v2.53.0 evidence is retained.

Resource decisions enumerate current paths and remove absent historical exceptions. New production membership requires explicit reviewed existing domain assignments. Generated resource bytes are reviewed without execution. Citation information stays available as optional attribution guidance.

The shared vendor checks derive internal and available domain counts from the source-neutral domain catalog. Reviewed additions can populate empty domains without duplicating a historical available-domain count in each converter.

## Risks / Trade-offs

The upstream scanner covers fewer entries than the actual inventory and records analyzer failures. Record those limitations and use actual source inspection before admission. Broad domain packages require per-capability semantic evidence in the new anchor.
