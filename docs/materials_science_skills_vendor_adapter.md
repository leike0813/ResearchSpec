# Materials-Science-Skills-For-LLM Vendor Adapter

The Materials adapter is the maintainer-only deterministic converter for the
pinned `vendor/materials-science-skills-for-llm` submodule at
`snapshot-fafd3ab`, revision
`fafd3ab011e4c363658a39c4bb62fc739839d58c`. It converts reviewed static Open
Agent Skills; it is not a runtime bridge and is never invoked by user-facing
`researchspec plugin` commands.

## Production decisions

The immutable audit covers all twelve upstream Skills. Production catalogs under
`src/vendor-converters/materials-science-skills-for-llm/` admit seven and exclude
five. Admission requires a complete license, content, permission, overlap, file,
external-resource, and domain conclusion. Audit readiness alone cannot grant
admission.

The admitted Skills are APEX alloy workflows, Atomsk CLI, DeePTB helper, DP-GEN
workflow, GPUMD workflow, Phonopy workflows, and Uni-Mol operations. ASE,
CMS scripts, DeePMD-kit, pymatgen usage, and Slurm workload manager are excluded
for development-maintenance scope, unavailable private tooling, overlap, or
privileged platform authority.

All seven audited relationships are advisory or source-excluded. The generated
vendor bundle has no hard Skill dependency edges.

## Curation and provenance

The file catalog covers all 24 files under admitted source roots: seven files are
copied, fifteen use complete replacement assets, and two are excluded. Each
source file has a pinned SHA-256. Every replacement asset has its own SHA-256 and
is bound to the source hash it reviews. The converter performs only the declared
copy, replacement, and exclusion operations; it contains no hidden semantic
rewrite branch.

Every generated Skill contains:

- supported Open Agent Skills frontmatter and compatibility guidance;
- the reviewed MIT `LICENSE` text;
- `NOTICE.md` with repository, snapshot, full revision, source path, and
  adaptation details;
- explicit confirmation boundaries for expensive, remote, GPU, DFT, training,
  scheduler, or stateful work.

External software, models, data, services, documentation, and compute
environments are preconfigured prerequisites, references, or removed resources.
ResearchSpec does not copy or relicense them.

## Maintainer commands

```bash
pnpm materials-science-skills-for-llm:convert
pnpm materials-science-skills-for-llm:check
pnpm materials-science-skills-for-llm:idempotence
```

Conversion stages all published vendors, assembles the complete source-neutral
registry, and commits only the Materials tree, bundle, manifest, report, and
combined registry. The generated vendor order is FinRobot, HistAgent,
Materials, Scientific Agent Skills, then ToolUniverse.

The converter never executes upstream commands, installs dependencies,
configures credentials, retrieves resources, accesses services, compiles
software, or submits scientific/HPC work.
