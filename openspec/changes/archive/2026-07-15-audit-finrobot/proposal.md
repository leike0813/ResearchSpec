## Why

FinRobot contains potentially valuable financial-analysis guidance, but it is an application repository with no upstream `SKILL.md` files and embeds domain knowledge across prompts, deterministic calculations, data adapters, and agent runtimes. Its current source, licensing claims, content origins, implementation limits, provider bindings, and financial-safety risks require a complete pinned audit before ResearchSpec can consider any static Plugin absorption.

## What Changes

- Pin the official FinRobot repository at commit `297a8d28d099be328c8a8eb658b4f782b93f3651` as the maintainer-only snapshot `snapshot-297a8d2`.
- Add a complete machine-readable repository inventory, knowledge-surface audit, candidate-capability map, and concise evidence report.
- Separate repository-level audit provenance from the existing Skill-root source contract without changing existing audit documents.
- Record licensing and origin conflicts, documentation drift, deterministic-calculation limits, provider dependencies, data-freshness risks, and financial authority boundaries.
- Freeze audit evidence and unresolved production questions for a future `ingest-finrobot` change without creating production admission decisions, a converter, generated Skills, Plugin membership, package commands, or runtime integrations.

## Capabilities

### New Capabilities

- `finrobot-domain-skill-audit`: Defines the complete pinned FinRobot capability audit and the boundary between evidence-backed candidate capabilities and any later production ingestion.

### Modified Capabilities

None.

## Impact

The change affects maintainer-only vendor metadata, shared and FinRobot-specific TypeScript audit schemas, audit evidence under `audits/`, focused audit and taxonomy tests, npm package verification, and project maintainer guidance. It adds no public CLI surface, runtime dependency, production vendor, domain membership, generated Skill, workflow authority, financial-service access, or transaction capability.

