## ADDED Requirements

### Requirement: HistAgent Admission SHALL Require Complete Authored Trees
ResearchSpec SHALL admit a HistAgent-derived Skill only when its generated tree satisfies the common non-native Skill validator and complete-tree human review. Every advertised capability SHALL map to a concrete bundled script, copied resource, or configured external adapter. Complete `SKILL.md` instructions SHALL own the runtime path, constraints, authority, outputs, completion, and recovery.

#### Scenario: Thin wrapper is reviewed
- **WHEN** the host must invent an implementation or discover a mandatory rule outside `SKILL.md`
- **THEN** validation or human approval fails

### Requirement: Generated Trees SHALL Have A Fixed Portable Closure
Each generated tree SHALL contain `SKILL.md`, one formal Python entrypoint, `lib/historical_support.py`, two directly routed substantial references, `LICENSE`, `NOTICE`, and `DERIVATION.json`. It SHALL execute after copying outside the repository and SHALL NOT import ResearchSpec, converter source, a sibling Skill, or an undistributed module.

#### Scenario: Copied tree is tested
- **WHEN** its offline commands run with repository import paths cleared
- **THEN** core behavior succeeds using only copied files and declared user-managed dependencies

### Requirement: Private Runner Conventions SHALL Be Absent
Generated trees SHALL NOT contain `runner.json`, `RUNTIME.json`, generic input/output schemas, `doctor.py`, `validate_result.py`, dependency manifests, unused requirements, or a fixed cross-Skill stdout envelope. Domain files and command receipts SHALL exist only where a concrete command consumes or produces them.

#### Scenario: Generated output is inspected
- **WHEN** file paths are enumerated
- **THEN** none of the unsupported wiring files is present

### Requirement: Production Decisions SHALL Bind Corrected Evidence
Production policy SHALL bind vendor, release, revision, current audit JSON hash, all audited collections, and all three candidates. Its 21-item capability map SHALL bind each admitted surface to Skill, command, implementation, implementation kind, optional dependency, derivation, and representative test without an output-schema field.

#### Scenario: Capability map is loaded
- **WHEN** policy validation runs
- **THEN** every admitted surface appears exactly once and its command belongs to the selected Skill

### Requirement: Lifecycle Operations SHALL Remain Inert
Conversion, checking, idempotence, packaging, installation, discovery, update, registry assembly, and release verification SHALL inspect static files only. They SHALL NOT import generated Python, install dependencies, read credentials, contact services, run local tools, upload materials, or execute benchmarks.

#### Scenario: Maintainer generates production output
- **WHEN** static complete-tree generation runs
- **THEN** no Skill command or upstream implementation executes

### Requirement: Complete Tree Approval SHALL Gate Production
Generation SHALL compute per-file, per-tree, and aggregate hashes. Review SHALL cover all three complete trees together. Production conversion SHALL proceed only when `review-decision.json` records approval bound to the current aggregate hash.

#### Scenario: Approval is missing or stale
- **WHEN** production work is considered without a matching approved aggregate hash
- **THEN** audit archival, converter integration, package commands, registry, domains, and generated production output remain blocked

### Requirement: Fifth-Vendor Conversion SHALL Remain Isolated
The HistAgent converter SHALL stage against every published vendor, replace only its own tree, bundle, manifest, and report, invoke the central assembler for the combined registry, and preserve every other vendor projection byte-for-byte.

#### Scenario: Any production vendor is regenerated
- **WHEN** a converter commits its staged projection
- **THEN** all four non-target vendor projections remain byte-identical
- **AND** the registry contains all five reviewed vendors in stable dictionary order
