# Technical Design

## Goals

Move ARSU conversion into ResearchSpec as a deterministic TypeScript developer
toolchain. The converter should read the vendored ARS upstream checkout from
`vendor/ars`, generate ResearchSpec-compatible skill artifacts into
`skills/arsu`, and keep generated output reproducible and auditable.

## Architecture

Use a focused module split under the existing TypeScript project:

```text
src/
  arsu-converter/
    cli.ts
    config.ts
    upstream.ts
    ingest.ts
    classify.ts
    transform.ts
    emit.ts
    contracts.ts
    validate.ts
    idempotence.ts
    manifest.ts
```

The converter is internal developer tooling. It is invoked through package
scripts and compiled TypeScript entrypoints, not through the public
`researchspec` user CLI.

## Fixed Source And Output Paths

The converter uses fixed repository-relative paths:

- source: `vendor/ars`;
- output: `skills/arsu`.

The developer scripts may accept operational flags such as `--force`,
`--json`, or `--dry-run`, but they must not accept a normal `--source` option.
That keeps the generated artifacts tied to the repository-owned upstream asset.

`skills/arsu` is converter-owned generated output. The converter may create it
when missing, but it must not overwrite an existing generated tree unless the
tree is clean according to its manifest or the maintainer explicitly passes
`--force`.

## Vendor Checkout Validation

Before any conversion writes output, the converter checks `vendor/ars`:

- directory exists;
- directory is inside the current repository root;
- git can resolve a commit for the checkout;
- required skill groups exist:
  - `deep-research`;
  - `academic-paper`;
  - `academic-paper-reviewer`;
  - `academic-pipeline`;
- each required group contains `SKILL.md`;
- checkout is clean.

Dirty checkout state is blocking in the first implementation. This avoids
generating artifacts whose provenance cannot be reproduced from a committed
submodule state.

## Conversion Pipeline

The TypeScript port follows the ARSU converter pipeline:

1. Validate upstream checkout.
2. Build an inventory of required skill groups, shared resources, excluded
   adapter/dev files, and unclassified files.
3. Discover dependencies from Markdown/text resources.
4. Copy runtime skill files into `skills/arsu/<skill-group>/`.
5. Rewrite local links and cross-skill/shared references so generated skill
   groups are self-contained.
6. Preserve binary or machine resources without semantic rewriting.
7. Inject ResearchSpec contract compatibility guidance.
8. Compute file hashes and write conversion metadata.
9. Validate generated files, links, hashes, required groups, and compatibility
   metadata.
10. Write `conversion-manifest.json` and `conversion-report.md`.

The converter must not perform broad semantic cleanup of upstream ARS history
or version prose. Such findings are recorded as non-blocking diagnostics unless
they indicate a real generated-output defect.

## Contract Compatibility Injection

The first compatibility layer is intentionally conservative. It adds enough
structure for generated skills to know how to interact with ResearchSpec
contracts, without rewriting every upstream workflow section.

Each generated skill group receives:

- a `Contract Preflight` block in `SKILL.md`;
- a generated metadata entry in `researchspec-contracts.json`;
- manifest records showing whether injection occurred.

The preflight guidance tells an agent or wrapper to:

- locate the project `researchspec/` workspace;
- read `specs/workflow.yaml` and `runs/current/state.yaml`;
- load only the contracts required for the current skill/stage/mode;
- read artifacts through `runs/current/artifact-registry.json`;
- write decisions and gates only through ResearchSpec ledger protocols;
- treat ARS Material Passport as a compatibility artifact, not runtime SSOT.

The first implementation uses a shared compatibility profile per skill group.
Full per-stage or per-mode matrix injection is deferred to a later change.

## Manifest And Report

`skills/arsu/conversion-manifest.json` records:

- converter version;
- source path and upstream commit;
- source cleanliness status;
- generated skill groups;
- output files and SHA-256 hashes;
- excluded adapter/dev files;
- unclassified source files;
- non-blocking risk findings;
- contract compatibility injection summary;
- validation summary.

`skills/arsu/conversion-report.md` is a human-readable summary rendered from the
manifest. It is not the source of truth.

`skills/arsu/researchspec-contracts.json` records the compatibility profile used
for each generated skill group. It is machine-readable support data for future
wrapper, validator, and adapter work.

## Developer Script Entrypoints

Add package scripts rather than public CLI commands:

- `pnpm arsu:convert`
- `pnpm arsu:check`

These scripts run compiled TypeScript entrypoints or a development runner chosen
by the implementation. They are maintainer tools and should not appear in
`researchspec --help`.

## Validation And Idempotence

Validation checks should cover:

- required generated skill groups and `SKILL.md` files;
- manifest parseability;
- output file hashes;
- broken rewritten Markdown links;
- required compatibility metadata;
- missing dependencies;
- adapter-only files leaking into generated output.

Idempotence checks regenerate output into a temporary location and compare
stable manifest content while ignoring expected volatile fields such as
generation timestamps. Drift blocks normal conversion unless `--force` is used.

## Boundaries

This change does not:

- add public user-facing ARSU maintenance commands;
- execute ARSU semantic research/writing/review workflows;
- call LLM APIs;
- implement adapter delivery;
- implement full per-stage/mode ResearchSpec matrix injection;
- make ARS Material Passport the ResearchSpec runtime source of truth.
