# Education Agent Skills Vendor Adapter

## Scope

ResearchSpec distributes 136 reviewed static Skills adapted from Education
Agent Skills. The maintainer input is pinned at:

- repository: `https://github.com/GarethManning/education-agent-skills`;
- release: `snapshot-6bbbce4`;
- revision: `6bbbce418f82e11044009c9f3b7373a354de5bd0`;
- Git tree: `b90188569a783ba7d20dcffe2db7a55816db7c0b`.

The immutable audit covers all 165 upstream Skills. Production admission accepts
136 Gareth Manning Skills and excludes 19 original-framework Skills plus ten
Sean Hu Skills whose redistribution authority is not established.

The production snapshot is `snapshot-6bbbce4`. Its complete conversion preview
has user approval recorded in `review-decision.json`; production bytes must
match that exact aggregate. Audit, evidence-map, policy, license, and aggregate
hashes live in the binding files named below.

## Production contracts

The converter validates these inputs against the production policy and review
decision before generating output:

- the immutable audit `audits/education-agent-skills/<anchor>/skill-audit.json`;
- the evidence map `audits/education-agent-skills/<anchor>/evidence-map.json`;
- the production policy
  `src/vendor-converters/education-agent-skills/production-policy.json`;
- the CC BY-SA 4.0 license text `LICENSES/CC-BY-SA-4.0.txt`.

`skills/plugins/vendor-manifests/education-agent-skills.json` publishes the
bound hashes and the approved complete-tree aggregate; the human approval lives
in `src/vendor-converters/education-agent-skills/review-decision.json`.

The production catalogs resolve exactly 165 admission decisions, 872 evidence
declarations, 813 advisory relationships, and 136 safety/domain decisions.
Relationships never create hard Skill dependencies.

## Generated Skill form

Each admitted Skill is published as
`education-agent-skills-<upstream-name>` with exactly:

- `SKILL.md`;
- a complete CC BY-SA 4.0 `LICENSE`;
- `NOTICE.md` with author, source, revision, source hash, generated ID, and
  modification disclosure.

The adapter preserves the complete upstream educational body and the declared
input/output schemas. It normalizes the global identifier and frontmatter
envelope, then adds evidence-status and authority boundaries. It does not
distribute the upstream installer, MCP server, tests, scripts, project
documentation, registries, or generated caches.

The upstream root now carries a CC BY-SA 4.0 `LICENSE` notice naming Gareth
Manning and his education content. It supplies origin authorization for the
admitted Skills, does not establish rights for embedded frameworks or
third-party authors, and never replaces the complete legal text and per-Skill
notices ResearchSpec distributes. The 19 original-framework and ten Sean Hu
Skills stay excluded.

## Evidence boundary

Unmarked citations have bibliographic identity verification only and do not
carry claim-support review. A declaration whose normalized work set includes an
unresolved work is marked in `evidence_sources`. Where the declaration has a
stable author/year use in the body, the smallest complete sentence, list item,
table row, or indivisible paragraph is enclosed by
`⟦UNRESOLVED⟧…⟦/UNRESOLVED⟧`.

Markers are source-hash and evidence-ID bound, paired, and non-nested. A
composite declaration is treated as unresolved when any constituent work is
unresolved. Users and Agents must verify the source and its support before
relying on marked content; otherwise they should omit or soften the claim and
disclose the uncertainty.

## Learner and authority safety

The adapter preserves teacher-facing, mixed, and student-facing capabilities.
Reviewed boundaries prohibit:

- clinical diagnosis or treatment;
- hidden learner profiling or monitoring;
- high-risk learner decisions without accountable human oversight;
- unauthorized sensitive-data transfer or persistence;
- direct modification of ResearchSpec workflow state;
- publication of content whose source authority cannot be established.

Privacy, learning analytics, wellbeing, and educational error-analysis guidance
remain available within those boundaries. ResearchSpec installation and update
only copy static files; they do not execute Skill content, collect learner data,
configure credentials, contact services, or upload materials.

## Domains and installation

The source-neutral catalog assigns the generated Skills only to:

- `curriculum-and-pedagogy`: 54 Skills;
- `education-systems`: 9 Skills;
- `specialist-studies-in-education`: 73 Skills.

Users install these stable domains through `researchspec plugin`; the vendor is
not a public installation target. Education Skills add no wrappers and have no
authority over routes, work items, artifacts, Gates, Decisions, transitions, or
receipts.

## Maintainer commands

```bash
pnpm education-agent-skills:audit:check
pnpm education-agent-skills:evidence:check
pnpm education-agent-skills:preview
pnpm education-agent-skills:convert
pnpm education-agent-skills:check
pnpm education-agent-skills:idempotence
```

Conversion stages all six published vendors, assembles the complete 218-domain
registry, and commits only the Education vendor projection plus the central
registry. `check` validates the approved tree hash, exact domain membership,
empty hard dependencies, and six-vendor inventory. `idempotence` regenerates in
an isolated directory and compares only the Education-owned projection and
registry.

## Package boundary

The npm package contains the generated Skill trees, bundle, manifest, conversion
report, adapter documentation, and CC BY-SA 4.0 reference license. It excludes
the upstream checkout, audit and evidence SSOTs, production-policy sources,
preview output, and Education converter maintenance code.

## Extension mode packages

All 136 reviewed production Skills are also projected one-to-one into the
graph-native extension registry under `skills/plugins/extensions/` as
`plugin-education-agent-skills-*` capabilities with same-named one-node graph
profiles. The generator
`scripts/generate-education-agent-skills-extensions.mjs` produces the packages
from the reviewed vendor bundle and the source-neutral domain catalog.

- Every package is a static `execution_type: llm` tree with
  `knowledge_refs: []`; the reviewed tree contains no scripts or references.
- The reviewed `SKILL.md` body, including the
  `researchspec-education-boundary` block, is preserved byte-for-byte except
  frontmatter replacement and the appended node contract.
- Every package declares `validate_education_brief.py` with the same six
  evidence-bearing `research_brief` fields.
- Domain assignments mirror the three reviewed domains:
  `curriculum-and-pedagogy`, `education-systems`, and
  `specialist-studies-in-education`.
- Incremental regeneration rebuilds only the changed raw Skills and their
  packages; unchanged packages keep their reviewed source release and revision
  byte-for-byte.

Install, update, status, and check read manifests and hashes only. Only
`advance` executes the declared `python3` validator.

## Maintenance suite

```bash
pnpm education-agent-skills-maintenance:artifacts
pnpm education-agent-skills-maintenance:records
pnpm education-agent-skills-maintenance:baseline
pnpm education-agent-skills-maintenance:check
```

The suite anchors at `audits/education-agent-skills/<anchor>`, binds the
immutable skill audit, evidence map, vendor bundle, extension registry subset,
package/profile trees, the maintenance Skill, the maintenance catalog, and
records 01–05 in `manifest.json`. `artifacts` regenerates the 136 packages. The
Agent semantic review is mandatory and `baseline` refuses an anchor whose
`05-semantic-review.md` is not completed. The current production anchor is
`snapshot-6bbbce4`; `snapshot-32fce5c` remains immutable historical evidence.
The incremental update changes two raw Skills and their extension packages;
the other 134 trees, all 136 profiles and validators, and domain assignments
retain their reviewed bytes. `check` verifies the current production anchor.
