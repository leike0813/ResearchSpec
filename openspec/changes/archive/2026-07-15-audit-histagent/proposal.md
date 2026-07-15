## Why

ResearchSpec has no reviewed historical-research vendor capability even though HistAgent contains potentially valuable archival retrieval, OCR, multilingual, multimodal, and source-analysis methods. HistAgent is an application and benchmark repository rather than a Skill package, so its complete source, licensing, provenance, runtime authority, external-resource, and safety boundaries must be frozen before any production absorption.

## What Changes

- Pin the official HistAgent repository at commit `47bbe21dc81618489f5d5929358032883a3fe448` as maintainer-only snapshot `snapshot-47bbe21`.
- Add a complete 120-entry source inventory with a reproducible set hash, source-origin and license conclusions, runtime-authority and external-resource decisions, security findings, knowledge surfaces, and three prospective Skill capabilities.
- Record `scripts/cookies.py` only by safe metadata and mark it `confirmed-failure`; exclude tracked bytecode, telemetry defaults, unresolved `browser_use` code, unverified figures, fixed credentials, and benchmark/evaluation content.
- Freeze a capability-preserving, provider-neutral future `ingest-histagent` design using complete authored Skills, conventional CLI commands, purpose-specific domain files, and baseline plus script-assisted/resource-backed/stateful extensions without creating a private runner protocol.
- Require a validated audit and hash-bound human review of the complete generated tree before any later production publication.

## Capabilities

### New Capabilities

- `histagent-domain-skill-audit`: Defines the complete pinned HistAgent repository audit and the evidence, safety, provenance, capability, and future-ingestion boundary for three prospective historical-research Skills.

### Modified Capabilities

None.

## Impact

The change affects maintainer-only submodule metadata, a HistAgent-specific Zod audit contract, evidence under `audits/histagent/`, focused audit tests, and maintainer guidance. It adds no dependency, public CLI surface, production vendor, generated Skill, registry or domain publication, provider configuration, credential handling, browser execution, benchmark execution, or upstream-code execution.
