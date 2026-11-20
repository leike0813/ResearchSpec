# Design

## Context

Navigate discovers ARSU work from the converter-owned routing catalog. Capability packages define the material a Procedure consumes and produces. Graph profiles bind those roles to nodes and human Gates. The screening change crosses all three boundaries. Its upstream input is ARS v3.24.4 at `23807f9`.

## Goals / Non-Goals

A coordinator must be able to trace a final study count back through retrieval, screening decisions and the confirmed protocol. Individual reviewers need only their assigned evidence. Model selection, bibliographic database access and retrieval of the actual full texts remain with the research team and its authorized tools.

## Decisions

- **Discover eight modes through Navigate.** The catalog owns protocol, quick, pilot, ta-screen, ft-screen, adjudicate, audit and report. Each maps to a hidden Procedure. One additional ballot Procedure serves both seats across pilot, title/abstract and full-text review. This keeps the same eligibility rules in use across stages and preserves the single host-visible entry point.
- **Use the graph for independent decisions.** Quick triage produces an explicitly single-reviewer result. The full profile has three A/B pairs with an all-seat join. Each reviewer receives the confirmed criteria, a seat-specific header and the assigned records. The coordinator retains both ballots, sends disputed labels for adjudication and supplies a blind exclusion sample for QC. Human Gates cover protocol, pilot, TA quality, FT quality and final verification. The full-run entry discloses its own cost and boundary outputs before the user commits.
- **Keep screening evidence in task-local files.** The coordinator imports and deduplicates records once. Ballot headers bind the stage, seat, batch, dataset, configuration and protocol. A retry addresses pending IDs while retaining completed decisions. Full-text preparation partitions advances into retrieved and not-retrieved reports. FT decisions carry the TA and retrieval snapshots so stale work can be detected at export. ResearchSpec CLI owns graph state throughout.
- **Generate packages from reviewed sources.** Extraction artifacts and authoring procedures own the adaptation. Local tools implement import, merge, QC and export using Python's standard library. This preserves deterministic behavior without requiring upstream host templates or a screening service. The existing four Skills use the same incremental extraction and regeneration path for their changed material.

## Risks / Trade-offs

- Reviewer contamination can invalidate agreement estimates. Only the coordinator sees the combined record. Pilot calibration uses team labels and records missed advances before the pilot Gate.
- A missing ballot or unavailable full text can otherwise appear as an exclusion. Pending decisions and retrieval failures have separate representations. Reporting distinguishes records, reports and studies, discloses provisional counts, and withholds final methods while required work is incomplete.
- Byte-identical regeneration can still preserve a semantic omission. The maintenance audit compares changed modes and packages to upstream text, and the screening checks exercise the generated tools on synthetic records. Real-world screening accuracy requires separate empirical evaluation.

## Migration Plan

Advance the vendor pin from `v3.22.2-7de1c9d`, index the changed extracts, regenerate the packages and profiles, and verify repeat generation. Retain the old audit anchor for comparison. Existing runs continue from their frozen graph. New screening runs use the profile delivered through the normal workspace init or update path. The comparison and acceptance evidence are recorded under `audits/arsu/v3.24.4-23807f9/`.
