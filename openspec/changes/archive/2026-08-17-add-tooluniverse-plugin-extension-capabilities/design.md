## Context

ToolUniverse production trees are large and heterogeneous: 55 Skills have only `SKILL.md`, `LICENSE`, and `NOTICE.md`; the remaining 75 carry up to 21 additional reviewed resources such as scripts, references, examples, templates, and data files. A hand-authored migration of 130 packages would be error-prone, so the conversion is generated from the reviewed vendor bundle and the source-neutral domain catalog.

## Goals / Non-Goals

**Goals:**

- Convert all 130 reviewed production Skills into one-to-one extension capability packages with one-node graph profiles.
- Preserve every reviewed resource at its original relative path and bind it as a knowledge ref with SHA-256 and Apache-2.0 licensing.
- Keep each extension `SKILL.md` complete by preserving the reviewed body and adding only the ResearchSpec node contract.
- Give every package a deterministic evidence validator without executing any upstream script or resource.
- Establish the ToolUniverse maintenance suite with reproducible records, baseline manifest, checks, and Agent semantic review.

**Non-Goals:**

- Re-auditing upstream ToolUniverse or changing the immutable v1.3.1 audit.
- Replacing or removing the raw vendor-bundle Skills from domain resolution.
- Executing bundled scripts, installing dependencies, contacting services, or running any upstream workflow during conversion, checking, installation, status, or maintenance.
- Adding new capability manifest schema fields or public CLI commands.

## Decisions

### Generated one-to-one conversion

The generator reads the reviewed `skills/plugins/vendors/tooluniverse/<skill-id>` trees and the domain catalog. It creates `plugin-tooluniverse-<suffix>` capability packages, profiles, registry entries, and the maintenance catalog. The generator is idempotent and only writes its own extension projection.

### Generic evidence contract

All 130 packages use the same six required `research_brief` fields and the same validator source bytes. ToolUniverse Skills are heterogeneous, but their evidence-bearing obligations are uniformly expressible as scope, source ledger, method plan, work products, validation results, and conclusions. Later schema work can specialize fields per domain.

### Resources stay at their reviewed paths

Each non-standard file is copied byte-for-byte under the same relative path (`scripts/...`, `references/...`, or root). The extension `SKILL.md` therefore preserves the reviewed body's resource references without rewriting them.

### Runtime coverage is shape-based

All packages pass registry load, hash, profile-reference, and maintenance checks. End-to-end graph tests cover representative packages from each resource shape (no extras, script-assisted, reference-assisted, and multi-resource) rather than 130 separate CLI journeys; the same graph engine path already executes for every registered profile.

### Maintenance anchor is the existing audit snapshot

The suite anchors at `audits/tooluniverse/v1.3.1` and binds the immutable skill audit, vendor-bundle tree, extension registry subset, extension package/profile trees, maintenance Skill, catalog, and records. `scripts/tooluniverse-maintenance.mjs` implements `artifacts / records / baseline / check / diff`.

## Risks

- The generic evidence contract is intentionally coarse. Domain-specific schema specialization is deferred until plugin schemas are formalized.
- Generated bulk content must not drift; the maintenance script checks every copied byte and every registry hash before `baseline`.
