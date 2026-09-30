# Design

## Context

The existing authoring path splits 38 ARS capabilities from 27 modes and already owns graph mutations and checker execution. See proposal.md for motivation.

## Goals / Non-Goals

Preserve the released semantic increment through existing procedures and knowledge. Upstream model services, run-ledger replay, locale loaders and new script distribution remain outside this increment.

## Decisions

Use v3.22.2 at 7de1c9dfb7af9c02a9b57750761323f35a743aa2 rather than unreleased main. Preserve unchanged extraction files byte-for-byte; refresh changed sources and relocate verbatim slices against the release.

Store the output-language registry once as extracted knowledge. Ordinary writing configuration carries the optional token; abstract cardinality and manuscript language remain independent. No core schema or frozen graph field is introduced.
The existing academic-paper profile binds its intake output to drafting and abstract nodes through an optional writing_configuration input. Standalone/custom graphs may supply that input through handoff or node output; omission keeps the default pair and bilingual cardinality. Conflicting supplied declarations fail visibly; single-language output performs only its corresponding writing and report steps.

Put the instruction/data rule in the ARS authoring renderer so all ARS nodes share it. Existing runtime policy records unavailable upstream helpers at package entrypoints. Advisory acronym prose review and externally supplied reports disclose execution scope and cannot control decisions.

## Risks / Trade-offs

- The upstream acronym algorithm is not distributed: deterministic execution remains not_checked unless supported by a supplied report.
- ARS ledger replay is not implemented: current CLI state, actual decisions and material evidence determine continuation.
- A static parity score cannot prove semantic or execution fitness: record Agent review and actual checker/CLI validation separately.
