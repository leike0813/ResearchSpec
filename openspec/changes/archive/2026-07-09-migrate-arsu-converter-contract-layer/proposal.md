## Why

ResearchSpec is now positioned as the framework layer for ARSU-derived academic
research skills, but ARSU maintenance still lives in a separate converter
project and depends on an external checkout path. The next slice should bring
the converter into this repository, pin the upstream ARS source as a vendored
asset, and make generated skills directly compatible with the ResearchSpec
contract runtime.

## What Changes

- Add an internal TypeScript ARSU converter owned by ResearchSpec.
- Introduce `vendor/ars` as the fixed ARS upstream checkout, intended to be a
  git submodule.
- Make converter scripts read only from `vendor/ars`; do not expose a general
  source-directory input.
- Generate ARSU-derived skill artifacts under `skills/arsu`.
- Add developer package scripts for conversion and validation, without adding
  public user-facing `researchspec arsu ...` commands.
- Validate the upstream checkout before conversion:
  - `vendor/ars` exists;
  - it is a git checkout or initialized submodule;
  - its commit can be resolved;
  - it contains required ARSU skill groups;
  - dirty checkout state blocks conversion in the first implementation.
- Port the deterministic ARSU converter behavior:
  - source inventory and classification;
  - dependency discovery and path rewriting;
  - skill-group emission;
  - conversion manifest and report generation;
  - generated output validation;
  - drift and idempotence checks.
- Inject ResearchSpec contract compatibility during conversion:
  - each generated `SKILL.md` receives a `Contract Preflight` guidance block;
  - `skills/arsu/researchspec-contracts.json` records generated compatibility
    metadata;
  - `conversion-manifest.json` records upstream commit, hashes, diagnostics,
    and contract injection summary.
- Preserve the ARSU current-state policy: upstream version, history,
  changelog, issue, and schema-version text are diagnostics or risk findings,
  not blocking defects by themselves.

## Capabilities

### New Capabilities

- `arsu-converter`: Developer-owned conversion capability for vendored ARS
  upstream assets, deterministic ARSU-derived skill generation, ResearchSpec
  contract compatibility injection, and generated output validation.

### Modified Capabilities

- None.

## Impact

- Affected code: new TypeScript converter modules, developer script entrypoints,
  converter tests, and generated output validation.
- Affected repository layout:

```text
vendor/
  ars/                  # ARS upstream submodule checkout
skills/
  arsu/                 # converter-owned generated ARSU artifacts
```

- Affected package metadata: add developer scripts such as `arsu:convert` and
  `arsu:check`.
- Affected OpenSpec specs: add `arsu-converter`.
- Non-goals:
  - do not add public user CLI commands for ARSU maintenance;
  - do not copy the full external ARSU converter project as a runtime
    dependency;
  - do not implement full per-stage or per-mode contract matrix injection;
  - do not execute ARSU semantic workflows;
  - do not call any LLM API.
