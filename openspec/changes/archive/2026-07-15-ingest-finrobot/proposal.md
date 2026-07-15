## Why

The immutable `snapshot-297a8d2` audit identifies six useful financial-research
capabilities but deliberately authorizes no production content. ResearchSpec
needs a separately reviewed ingestion path that preserves the complete useful
business capability—including scripts, prompts, calculations, providers,
forecasts, scores, valuations, and conclusions—while keeping conversion,
packaging, and installation inert and preventing sensitive payloads from being
embedded in published files.

This change is prepared in parallel with `audit-finrobot`. Catalog design,
resource adaptation, and complete Skill-tree previews may proceed against the
immutable audit JSON, but production admission, generation, and final archival
are blocked until the audit has been verified and archived and the six complete
trees have received one explicit human content approval.

## What Changes

- Add exhaustive production-decision catalogs for all 146 source entries, all
  66 knowledge surfaces, five content origins, six license claims, reviewed
  resources, six admissions, and advisory-only Skill relationships.
- Classify executable sources independently by FinRobot coupling and production
  action: hard-coupled resources are excluded, light coupling is adapted, and
  independent resources are included. The twelve candidate source files contain
  zero hard-coupled files, eight adapted resources, and four direct resources.
- Add provider-neutral Protocols, DTOs, AgentSpec schemas, six source-bound
  curation fragments, four deterministic Python resources, eight adapted
  resources, and optional adapted provider clients without importing the
  FinRobot runtime aggregate.
- Add a preview renderer that produces complete Skill trees—including scripts,
  prompts, schemas, dependencies, derivation metadata, and `SKILL.md`—for one
  concentrated human review before production output is emitted.
- After the gates pass, add an isolated FinRobot converter and maintainer-only
  `finrobot:convert`, `finrobot:check`, and `finrobot:idempotence` commands.
- Generate six neutral `financial-research-*` Skills with Apache-2.0 license and
  notice files, a vendor bundle, manifest, report, and stable four-vendor
  combined registry.
- Add all six Skills to `banking-finance-and-investment`; also add statement
  analysis and company fundamentals to
  `accounting-auditing-and-accountability`, making 51 domains public.

## Capabilities

### New Capabilities

- `finrobot-vendor-conversion`: Defines audit binding, executable-resource
  classification, form-safe adaptation, complete capability preservation,
  human tree approval, isolated maintenance, attribution, and generated outputs
  for the fourth vendor.

### Modified Capabilities

- `domain-skill-plugin-registry`: Adds FinRobot as the fourth vendor with six
  neutral Skill IDs, empty hard-dependency arrays, advisory relationships, and
  source-neutral reviewed memberships.
- `domain-taxonomy`: Makes the accounting and banking domains newly
  discoverable and raises the public domain count from 49 to 51 without changing
  the 218-domain internal taxonomy.
- `mvp-release-readiness`: Publishes generated FinRobot Skill trees, executable
  resources, schemas, provenance, and adapter documentation while excluding all
  maintainer-only inputs.

## Impact

This change affects OpenSpec contracts, vendor-local policy and converter
TypeScript, version-controlled decision and curation inputs, generated Python,
JSON, Markdown, and Plugin assets, source-neutral domain membership, package
scripts and allowlist, attribution, adapter documentation, and focused/full
release tests. It adds no public CLI, Companion, wrapper, automatic dependency
installation, embedded credential value, private endpoint, private dataset,
unknown-origin content, converter-time execution, installation-time execution,
or hidden workflow-state authority. Generated Skills may use user-configured
tools, providers, credentials, and dependencies when invoked by the target
Agent.
