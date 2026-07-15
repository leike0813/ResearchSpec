## Why

The completed `snapshot-fafd3ab` audit identifies useful materials-science
workflows but deliberately stops before production admission. ResearchSpec now
needs a reviewed, non-executing converter that resolves every audited item and
publishes the approved static content through the existing multi-vendor domain
Plugin architecture.

## What Changes

- Resolve all twelve audited Skills into seven admitted and five excluded
  production decisions.
- Add vendor-specific admission, relationship, file, and external-resource
  catalogs plus source-bound replacement assets for every curated file.
- Add a third isolated converter and maintainer commands that stage against all
  vendors but commit only Materials-Science-Skills-For-LLM outputs.
- Generate seven `materials-science-skills-*` Skills with MIT `LICENSE` and
  source-bound `NOTICE.md` files, a vendor bundle, manifest, conversion report,
  and the three-vendor combined registry.
- Add reviewed memberships for materials engineering, materials chemistry, and
  computational modelling without treating HPC or GPU use as domain evidence.
- Add the vendor adapter documentation to the published package while keeping
  the checkout, audit, decision inputs, curation assets, and test fixtures out
  of the tarball.

## Capabilities

### New Capabilities

- `materials-science-skills-for-llm-vendor-conversion`: Defines the complete
  production decisions, non-executing converter, curation, provenance, generated
  outputs, and isolated maintenance behavior for the third vendor.

### Modified Capabilities

- `materials-science-skills-for-llm-domain-skill-audit`: Records that all twelve
  audit recommendations are resolved by seven admissions and five exclusions.
- `domain-skill-plugin-registry`: Requires the combined registry to publish the
  third vendor, reviewed memberships, stable vendor ordering, and no hard
  dependency created from advisory upstream relationships.
- `domain-taxonomy`: Makes `materials-engineering` discoverable through reviewed
  content and increases the public domain count from 48 to 49.
- `mvp-release-readiness`: Requires the third vendor's generated bundle,
  provenance files, report, and adapter documentation in the tarball while
  excluding maintainer-only ingestion inputs.

## Impact

This change affects OpenSpec contracts, vendor converter and policy TypeScript,
version-controlled decision and curation inputs, generated vendor Skills,
domain registry assembly, package scripts and allowlist, maintainer adapter
documentation, and focused/full release tests. It adds no runtime LLM
dependency, public CLI command, workspace contract, registry schema revision,
automatic dependency installation, credential handling, download, service
access, or scientific/HPC execution.
