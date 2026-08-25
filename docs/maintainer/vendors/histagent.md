# HistAgent Vendor Adapter

The HistAgent adapter is the maintainer-only deterministic converter for the
pinned `vendor/histagent` submodule at `snapshot-47bbe21`, revision
`47bbe21dc81618489f5d5929358032883a3fe448`. HistAgent is an application and
benchmark repository rather than an upstream Skill package, so ResearchSpec
publishes only three independently authored, reviewed Skill trees.

## Production evidence

The immutable audit covers all 120 tracked files, 31 knowledge surfaces, five
content origins, four license claims, ten runtime authorities, sixteen external
resources, ten security findings, and three candidate Skills. The production
policy resolves every audited item and maps all 21 admitted capability surfaces
to a concrete command, implementation kind, optional dependency, and
representative test.

The approved aggregate tree hash is
`c44f136b6945868ddde7871b5f5ecd7bfb8ac09f84f080f46fbd37f9e173dbd3`.
Conversion recomputes that hash and refuses any byte drift. The archived audit
main specification, clean pinned checkout, approved review decision, production
policy hashes, per-tree hashes, file dispositions, five attributed-source
records, and six advisory relationships remain bound in generated evidence.

## Generated Skills

- `histagent-historical-research` provides stateful source, layer, evidence,
  Gate, conflict, limitation, and deterministic report handling.
- `histagent-historical-source-identification` provides local and configured
  search, archive, retrieval, reverse-image, candidate, and verification paths.
- `histagent-historical-source-analysis` provides inspection, conversion, OCR,
  transcription, translation, frame, vision, collation, and layer validation.

Every tree contains exactly `SKILL.md`, one Python entrypoint,
`lib/historical_support.py`, two directly routed references, `LICENSE`,
`NOTICE`, and `DERIVATION.json`. All hard Skill dependency arrays are empty;
sibling relationships remain advisory. `historical-studies` contains all three
Skills, while `heritage-archive-and-museum-studies` contains source
identification and source analysis. No HistAgent Skill belongs to a tool domain.

The trees keep raw observation or OCR, normalized transcription, emendation,
translation, and interpretation distinct. They contain no Cookie material,
telemetry defaults, tracked bytecode, unresolved browser implementation,
benchmark payload, unverified media, fixed provider credential, or copied
AutoGen/Magentic-One implementation.

## Authority and dependencies

Conversion, checking, idempotence, packaging, installation, discovery, update,
and registry assembly inspect static files only. They never import or execute
the generated Python, install dependencies, read credentials, contact services,
launch browsers, or upload material. A target Agent may invoke a Skill later
under host policy with user-approved task material, dependencies, endpoints,
providers, and credential environment variables. Skill-local research state
does not have ResearchSpec workflow authority.

## Maintainer commands

```bash
pnpm histagent:convert
pnpm histagent:check
pnpm histagent:idempotence
```

Conversion stages all six published vendors, invokes the source-neutral
central assembler, and commits only the HistAgent tree, bundle, manifest,
conversion report, and combined registry. Drift protection requires `--force`
after review.

## Extension mode packages

The three reviewed raw Skills are also projected one-to-one into the
graph-native extension registry under `skills/plugins/extensions/`:

| raw Skill | extension capability |
| --- | --- |
| `histagent-historical-research` | `plugin-historical-research` |
| `histagent-historical-source-analysis` | `plugin-historical-source-analysis` |
| `histagent-historical-source-identification` | `plugin-historical-source-identification` |

All three packages are mixed execution. Each copies the reviewed entrypoint and
`lib/historical_support.py` into `tools/` plus both reviewed references into
`references/` as hash-bound knowledge refs. Each declares
`validators/validate_historical_brief.py` with its own evidence-bearing
`--required` field list. `historical-studies` projects all three capability and
profile pairs; `heritage-archive-and-museum-studies` projects source analysis
and source identification.

Install, update, status, and check read manifests and hashes only. Only
`advance` executes the declared `python3` validator. The Skill-local
`state.json` Gate remains a package tool and never owns ResearchSpec workflow
state.

## Maintenance suite

```bash
pnpm histagent-maintenance:artifacts
pnpm histagent-maintenance:records
pnpm histagent-maintenance:baseline
pnpm histagent-maintenance:check
```

The suite anchors at `audits/histagent/snapshot-47bbe21`, binds the immutable
audit, the vendor bundle, the extension registry subset, package/profile trees,
the maintenance Skill, the maintenance catalog, and records 01–05 in
`manifest.json`. The Agent semantic review is mandatory and `baseline` refuses
an anchor whose `05-semantic-review.md` is not completed.
