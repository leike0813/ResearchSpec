## Context

Scientific Agent Skills production trees contain 410 non-standard reviewed resources across 49 Skills, including Python scripts, references, examples, templates, and four binary TimesFM assets (png/gif). The existing knowledge-ref verifier decoded files as UTF-8, which corrupted binary hashes, so this change moves verification to byte-level SHA-256.

## Goals / Non-Goals

**Goals:**

- Convert all 49 reviewed production Skills into one-to-one extension capability packages with one-node graph profiles.
- Preserve every reviewed resource at its original relative path and bind it as a byte-level SHA-256 knowledge ref under MIT.
- Keep each extension `SKILL.md` complete by preserving the reviewed body and adding only the ResearchSpec node contract.
- Give every package a deterministic evidence validator without executing any upstream script or resource.
- Establish the Scientific Agent Skills maintenance suite with reproducible records, baseline manifest, checks, and Agent semantic review.

**Non-Goals:**

- Re-auditing upstream Scientific Agent Skills or changing the immutable v2.53.0 audit.
- Replacing or removing the raw vendor-bundle Skills from domain resolution.
- Executing bundled scripts, installing dependencies, configuring credentials, or contacting services during conversion, checking, installation, status, or maintenance.
- Adding new capability manifest schema fields or public CLI commands.

## Decisions

### Generated one-to-one conversion

The generator reads the reviewed `skills/plugins/vendors/scientific-agent-skills/<skill-id>` trees and the domain catalog. It creates `plugin-scientific-agent-skills-<suffix>` packages, profiles, registry entries, and the maintenance catalog. The generator is idempotent and only writes its own extension projection.

### Byte-level knowledge hashes

`src/capabilities/registry.ts` and `src/plugins/extensions.ts` read knowledge files as byte buffers and hash the bytes. UTF-8 text files produce identical hashes to the previous implementation; binary assets now project and verify correctly.

### Generic evidence contract

All 49 packages use the same six required `research_brief` fields and the same validator source bytes. Later schema work can specialize fields per domain.

### Runtime coverage is shape-based

All packages pass registry load, hash, profile-reference, and maintenance checks. End-to-end graph tests cover representative packages from each resource shape rather than 49 separate CLI journeys; the same graph engine path executes for every registered profile.

### Maintenance anchor is the existing audit snapshot

The suite anchors at `audits/scientific-agent-skills/v2.53.0` and binds the immutable skill audit, vendor-bundle tree, extension registry subset, package/profile trees, maintenance Skill, catalog, and records. `scripts/scientific-agent-skills-maintenance.mjs` implements `artifacts / records / baseline / check / diff`.

## Risks

- The generic evidence contract is intentionally coarse. Domain-specific schema specialization is deferred until plugin schemas are formalized.
- Byte-level hashing is backward-compatible for text files; full regression tests cover the base capability registry and extension registry.
