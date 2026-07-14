## Context

Registry Schema 1 currently combines vendor definitions and three ToolUniverse-owned domains. The ToolUniverse converter writes the whole registry, `domains.has(id)` is used as both internal existence and public availability, and the two vendor audits use incompatible ad hoc domain evidence. This blocks a stable multi-vendor catalog and makes pre-created empty domains indistinguishable from installable products.

ANZSRC 2020 Fields of Research provides the locked discipline hierarchy: 23 Divisions, 213 Groups, and 1,967 Fields. ResearchSpec needs Group-level install units with Field-level audit evidence, plus a small source-neutral tool taxonomy for cross-disciplinary work that is not itself a discipline.

## Goals / Non-Goals

**Goals:**

- Make one static, reviewable taxonomy snapshot and one source-neutral domain catalog the only sources of domain identity and membership.
- Keep all 218 domains internally valid while exposing only reviewed non-empty domains to ordinary users.
- Preserve safe uninstall and recovery when a selected domain is absent or becomes empty.
- Isolate vendor converter output from central registry assembly.
- Migrate ToolUniverse without changing generated Skill bytes, dependency closure, or workflow authority.
- Give every record in both audits complete, validated ANZSRC Field metadata.

**Non-Goals:**

- Ingest Scientific Agent Skills, resolve its licensing/security blockers, or execute any vendor resource.
- Add another classification system, remote taxonomy lookup, runtime converter ABI, new dependency, top-level command, wrapper, workflow profile, or schema-version bump.
- Derive domain membership automatically from Field metadata.
- Preserve aliases for the three unpublished domain IDs.

## Decisions

### Use a checked-in ANZSRC 2020 snapshot

`src/plugins/taxonomy/anzsrc-for-2020.json` records the official hierarchy, source URL, source release date `2025-10-24`, source workbook SHA-256 `92b94664eb1e43db1cbcaeb54e60575e3f8573cd10e5e4bb3a9c806cbe462e35`, and CC BY 4.0 attribution. Validation locks the official counts and parent relationships. The release date describes the published workbook, not a new ANZSRC edition.

The alternative—reading ABS data remotely at build or runtime—would make conversion non-reproducible and violate offline package behavior.

### Keep discipline identity at Group and audit evidence at Field

Discipline `domain_id` is the kebab-case official English Group title; `anzsrc_group_code` stores the stable four-digit official code. Audit records store one nullable `primary_anzsrc_field`, zero or more `additional_anzsrc_fields`, and a required `anzsrc_unclassified_reason` exactly when no primary applies. Field evidence never assigns domain membership.

The alternative `anzsrc-for-<code>` ID was rejected because human-readable stable install IDs were explicitly preferred; the code remains structured metadata.

### Define five coarse ResearchSpec tool domains

The internal catalog contains:

- `experimental-design-and-data-analysis`
- `computational-modeling-and-simulation`
- `scientific-visualization-and-communication`
- `laboratory-automation-and-informatics`
- `research-computing-infrastructure`

ANZSRC Group membership takes precedence where a Skill's primary meaning is a discipline such as Machine learning, Statistics, or Clinical sciences. Reference management remains outside this tool taxonomy. Tool domains are deliberately broader than upstream product categories and may be empty.

### Separate internal existence from public availability

Registry validation accepts an empty `skills` list, but a single helper defines public availability as `domain.skills.length > 0`. Normal list/show/install JSON, status availability, checks, and Navigate use that helper. The registry still contains all 218 domains so catalog identity can be fixed before content arrives.

Selected empty or missing domains are recovery state: `plugin list --installed` and status show unavailable; update and normal install reject them; the last manifest resolution snapshot is retained for drift-safe uninstall. A later non-empty catalog version restores normal availability without migration.

### Assemble the registry centrally

Each source-specific converter emits a validated vendor bundle containing vendor metadata, Skill definitions, provenance, dependencies, and generated asset roots. `src/plugins/domain-catalog.json` owns all direct membership. `src/plugins/assembler.ts` validates referenced bundle Skills and atomically produces `skills/plugins/registry.json`. No converter may overwrite another vendor or own the global catalog.

ToolUniverse maintainer commands retain their public package-script names. Conversion refreshes the ToolUniverse bundle and generated Skill tree, then invokes central assembly; check and idempotence validate both isolated output and assembled output.

### Make the initial public catalog a derived result

The ToolUniverse membership review populates 28 ANZSRC Group domains. Two tool domains are initially non-empty: experimental design/data analysis contains the eight reviewed method Skills, and computational modeling/simulation contains computational biophysics. The other three tool domains remain empty and hidden. Thus the initial internal catalog is 218 domains and the initial public catalog is 30 domains.

### Keep audit metadata independent from admission

All 150 ToolUniverse and 147 Scientific Agent Skills records receive Field metadata, including excluded and blocked records. ToolUniverse's 130 admitted records are separately listed by the domain catalog. Scientific Agent Skills gains no vendor bundle, registry Skill, or public domain membership in this change.

## Risks / Trade-offs

- **Official titles change in a future ANZSRC edition** → treat the checked-in 2020 taxonomy and IDs as versioned product data; adopt a new edition only through an explicit change.
- **An empty selected domain loses ownership evidence** → retain its manifest resolution snapshot until successful uninstall or repopulation.
- **Field mappings are mistaken for automatic membership** → validate them only against the taxonomy and keep catalog membership as an explicit reviewed SSOT.
- **Converter and assembler form a write cycle** → vendor bundle generation never reads the generated registry; the assembler is the sole registry writer.
- **All-domain precreation creates noisy UX** → public helpers filter empty domains consistently and checks ignore unselected empty domains.
- **Human-readable IDs can be long** → accept length for clarity; keep official code available for exact classification and future migration analysis.

## Migration Plan

1. Add and validate the taxonomy snapshot, typed catalog, registry DTO, and availability helper.
2. Refactor ToolUniverse conversion into isolated vendor output plus central assembly.
3. Populate the 218-domain catalog and regenerate the production registry.
4. Update plugin lifecycle, status, check, manifest, and Navigate consumers to use derived availability.
5. Add Field metadata to all 297 audit records and update audit reports/tests.
6. Synchronize canonical docs and release packaging, then run converter, OpenSpec, focused, full, lint, build, and release verification.

Rollback restores the previous catalog/converter/registry together. No released workspace migration or alias cleanup is required because the old domain IDs have not shipped.

## Open Questions

None. New vendor admission and later ANZSRC edition adoption require separate changes.
