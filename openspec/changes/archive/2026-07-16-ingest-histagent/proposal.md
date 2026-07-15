## Why

The immutable `snapshot-47bbe21` audit identifies three valuable historical-research capabilities, but HistAgent is an application and benchmark repository rather than a native Skill package. Ingestion must follow the checked-in non-native vendor Skill standard: each candidate needs a complete main file, concrete executable mechanisms, honest dependencies, selective detailed references, and copied-tree portability without inventing a private ResearchSpec runtime protocol.

This change prepares three complete, self-contained executable Skills whose deterministic behavior lives inside each tree and whose semantic decisions remain the responsibility of the invoking Agent. Production generation remains blocked until the corrected audit validates and the complete generated tree set receives hash-bound human approval.

## What Changes

- Replace uniform runtime assembly with three independently authored, complete Skill trees validated through the common non-native Skill standard.
- Give each tree `SKILL.md`, one formal Python entrypoint, `lib/historical_support.py`, two substantial directly routed references, derivation metadata, license, and notice.
- Use conventional command options for simple input and purpose-specific layer, variants, emendations, candidate, scope, source, and evidence files for complex input. Successful commands emit command-specific receipts or direct status; failures exit nonzero with a stderr error object.
- Implement `histagent-historical-source-analysis` as baseline + script-assisted + resource-backed for inspection, conversion, OCR, translation, transcription, video frames, vision, collation, and validation.
- Implement `histagent-historical-source-identification` as baseline + script-assisted + resource-backed with concrete archival, bibliographic, exact-text, HTTP, local-index, and reverse-image adapters.
- Implement `histagent-historical-research` as baseline + script-assisted + resource-backed + stateful with run-directory JSON state, applicable-layer evidence Gates, conflict tracking, and deterministic rendering. SQLite remains excluded without evidence of concurrent-writer or repair requirements.
- Preserve the five historical-source layers: raw observation or OCR, normalized transcription, emendation, translation, and interpretation.
- Keep the corrected source review boundary for all five AutoGen/Magentic-One-attributed files and independently reimplement capability behavior.
- Keep hard Skill dependencies empty and sibling relationships advisory; every complete tree must execute after copying outside the repository.
- Bind renewed review only to the redesigned tree set. No production converter, registry entry, domain publication, package command, or generated vendor tree is admitted before approval.

## Capabilities

### New Capabilities

- `histagent-vendor-conversion`: Defines evidence-bound complete-tree conversion, validation, deterministic generation, review Gates, isolated fifth-vendor publication, and source/license derivation.
- `histagent-historical-research-skill`: Defines the gate-driven historical research state, evidence, applicable-layer, rendering, and recovery contracts.
- `histagent-historical-source-identification-skill`: Defines executable historical-source discovery, retrieval, verification, and provenance contracts.
- `histagent-historical-source-analysis-skill`: Defines executable multimodal historical-source processing and five-layer provenance contracts.

### Modified Capabilities

- `domain-skill-plugin-registry`: Adds the three Skills only after complete-tree approval and audit archival.
- `domain-taxonomy`: Adds reviewed historical discipline memberships without tool-domain inference.
- `mvp-release-readiness`: Requires complete standalone Skill trees while excluding maintainer inputs.

## Impact

The eventual implementation affects OpenSpec contracts, HistAgent audit evidence, authored Skill source trees, deterministic converter logic, tests, generated vendor assets, source-neutral memberships, licensing, documentation, and package verification. This review preparation adds no public ResearchSpec CLI command, Companion Skill, automatic dependency installation, embedded credential, converter-time execution, installation-time execution, benchmark content, or workflow-state authority. Explicit Skill invocation may use only the target Agent's user-approved providers, task materials, dependencies, and execution environment under host policy.
