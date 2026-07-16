# Education Agent Skills Vendor Adapter

## Scope

ResearchSpec distributes 136 reviewed static Skills adapted from Education
Agent Skills. The maintainer input is pinned at:

- repository: `https://github.com/GarethManning/education-agent-skills`;
- release: `snapshot-32fce5c`;
- revision: `32fce5c0d097ec675cf81c750a65a379e4d87e3c`;
- Git tree: `3223d79299ae10391c22549debef7ffc9ef7a0e2`.

The immutable audit covers all 165 upstream Skills. Production admission accepts
136 Gareth Manning Skills and excludes 19 original-framework Skills plus ten
Sean Hu Skills whose redistribution authority is not established. The approved
complete-tree aggregate SHA-256 is
`c4fc2f93a7553a1c02538d15491ed108afd36ad4a4a291ca4db3bad39e74775d`.

## Production contracts

The converter validates these bound inputs before generating output:

- audit SHA-256:
  `e9326c43078db4c6bce4387c5a41a5bef775ad4d1691095c2020ef9cb9926857`;
- evidence-map SHA-256:
  `58e0768df288aad6d9e3c5222338879ef1703bc78f80e02739f6d4194cc6bd2b`;
- production-policy SHA-256:
  `fcb818163c79058ac084f944700c187c36b06b1698b1c9242454b973e259256f`;
- CC BY-SA 4.0 license-text SHA-256:
  `f8366f5391f49974ea29b26f167b40f9c673714680666651c6fa047dc2314e4f`.

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
