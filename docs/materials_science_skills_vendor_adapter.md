# Materials-Science-Skills-For-LLM Vendor Adapter

The Materials adapter is the maintainer-only deterministic converter for the
pinned `vendor/materials-science-skills-for-llm` submodule at
`snapshot-fafd3ab`, revision
`fafd3ab011e4c363658a39c4bb62fc739839d58c`. Converter version 2 publishes
ResearchSpec-authored complete non-native Skill trees; it is not a runtime
bridge and is never invoked by user-facing `researchspec plugin` commands.

## Production decisions

The immutable audit covers all twelve upstream Skills. Production policy admits
APEX alloy workflows, Atomsk CLI, DeePTB helper, DP-GEN workflow, GPUMD workflow,
Phonopy workflows, and Uni-Mol operations. ASE, CMS scripts, DeePMD-kit, pymatgen
usage, and Slurm workload manager remain excluded for maintenance scope,
unavailable private tooling, overlap, or privileged authority.

The seven fixed `materials-science-skills-*` IDs retain MIT licensing, empty hard
Skill dependencies, all fourteen external-resource decisions, and all seven
advisory or source-excluded relationships. Membership remains source-neutral:
all seven contribute to computational modeling and simulation; six contribute
to materials engineering; Phonopy and Uni-Mol contribute to macromolecular and
materials chemistry; none contributes to research computing infrastructure.

## Complete authored trees

Atomsk is a Tier 1 baseline external-tool Skill with no reference. APEX,
DeePTB, DP-GEN, GPUMD, Phonopy, and Uni-Mol are Tier 2 trees with one substantial
conditionally read reference each. Their complete `SKILL.md` files contain the
ordinary path, permissions, confirmations, responsibilities, outputs, failure
handling, and examples.

Short quickstarts, prerequisite lists, safety paragraphs, and troubleshooting
notes belong in the main file. Each retained reference contains a property
table, configuration/file contract, mode playbook, or recovery catalog that is
not needed on every invocation. The main file links it directly with a concrete
read condition and retains every governing constraint and ordinary decision
rule.

Every advertised capability maps to an Agent procedure or a concrete
user-configured external tool. The published trees contain no bundled scripts,
state, runner, generic schema, dependency manifest, installer, provider client,
or product UI metadata. APEX, Atomsk, DeePTB, DP-GEN, GPUMD/NEP, Phonopy,
DFT/ALM, and Uni-Mol runtimes remain user managed.

## Source and review binding

The 24-item source catalog records 22 adapted files and two excluded
installation/development files. Adapted records name the complete authored
output paths they inform. Each generated tree contains `DERIVATION.json`, MIT
`LICENSE`, and `NOTICE.md`; derivation binds capabilities, files, immutable
source hashes, implementation mechanisms, and ResearchSpec authorship.

Production conversion is authorized only for aggregate complete-tree hash
`c45bafc4be7e4fa540cc119cbaa81cec8f0e453d60fc9f2efd0124d8ec717e3e`.
Any authored or generated input drift changes the hash and fails before output
is staged.

## Maintainer commands

```bash
pnpm materials-science-skills-for-llm:convert
pnpm materials-science-skills-for-llm:check
pnpm materials-science-skills-for-llm:idempotence
```

Conversion stages all six published vendors, assembles the complete
source-neutral registry, and commits only the Materials tree, bundle, manifest,
report, and registry. Conversion, checking, idempotence, packaging,
installation, discovery, and update never execute scientific software, install
dependencies, retrieve resources, read credentials, compile code, access a
service, use GPU capacity, or submit local, remote, scheduler, DFT, ALM, or HPC
work.

## Extension mode packages

The seven reviewed raw Skills are also projected one-to-one into the
graph-native extension registry under `skills/plugins/extensions/`:

| raw Skill | extension capability |
| --- | --- |
| `materials-science-skills-apex-alloy-workflows` | `plugin-materials-apex-alloy-workflows` |
| `materials-science-skills-atomsk-cli` | `plugin-materials-atomsk-cli` |
| `materials-science-skills-deeptb-helper` | `plugin-materials-deeptb-helper` |
| `materials-science-skills-dpgen-workflow` | `plugin-materials-dpgen-workflow` |
| `materials-science-skills-gpumd-workflow` | `plugin-materials-gpumd-workflow` |
| `materials-science-skills-phonopy-workflows` | `plugin-materials-phonopy-workflows` |
| `materials-science-skills-unimol-ops` | `plugin-materials-unimol-ops` |

All seven are `execution_type: llm` instruction-led packages with deterministic
`validate_materials_brief.py` evidence validators. Six package their reviewed
reference as a hash-bound knowledge ref; Atomsk remains a Tier 1 tree with no
reference. `materials-engineering` projects six, `macromolecular-and-materials-chemistry`
projects two, and `computational-modeling-and-simulation` projects all seven.

Install, update, status, and check read manifests and hashes only. Only
`advance` executes the declared `python3` validator. ResearchSpec never invokes
or configures APEX, Atomsk, DeePTB, DP-GEN, GPUMD, Phonopy, Uni-Mol, schedulers,
GPU, or HPC resources.

## Maintenance suite

```bash
pnpm materials-science-skills-for-llm-maintenance:artifacts
pnpm materials-science-skills-for-llm-maintenance:records
pnpm materials-science-skills-for-llm-maintenance:baseline
pnpm materials-science-skills-for-llm-maintenance:check
```

The suite anchors at `audits/materials-science-skills-for-llm/snapshot-fafd3ab`,
binds the immutable skill audit, the vendor bundle, the extension registry
subset, package/profile trees, the maintenance Skill, the maintenance catalog,
and records 01–05 in `manifest.json`. The Agent semantic review is mandatory and
`baseline` refuses an anchor whose `05-semantic-review.md` is not completed.
