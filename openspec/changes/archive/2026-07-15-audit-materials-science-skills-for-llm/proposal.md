## Why

Materials-Science-Skills-For-LLM is a focused upstream collection whose twelve Skills may extend ResearchSpec's materials-science coverage, but its content, references, portability, licensing, operational authority, and overlap with existing vendors have not been reviewed under a reproducible contract. A complete pinned audit is required before any converter or production admission decision can be made.

## What Changes

- Pin the official upstream repository at commit `fafd3ab011e4c363658a39c4bb62fc739839d58c` as the maintainer-only snapshot `snapshot-fafd3ab`.
- Add a machine-readable, one-record-per-Skill audit and a concise evidence report covering all twelve top-level Skills.
- Extend the shared audit contract with a safe Skill-root path and reusable content-license review, then add a vendor-specific schema for materials-science scope, readiness, resources, relationships, risks, overlap, and findings.
- Record future converter and domain-placement constraints without creating a converter, generated Skill, Plugin, admission catalog, dependency catalog, resource catalog, or production membership.
- Keep the audit checkout and evidence outside the published npm package.

## Capabilities

### New Capabilities

- `materials-science-skills-for-llm-domain-skill-audit`: Defines the pinned, complete, evidence-backed audit and the boundary between audit recommendations and future production ingestion.

### Modified Capabilities

None.

## Impact

The change affects maintainer-only vendor metadata, shared and vendor-specific TypeScript audit schemas, audit evidence under `audits/`, focused audit tests, release-package verification, and project maintainer guidance. It adds no runtime dependency, public CLI surface, production Plugin, domain membership, or generated vendor Skill.
