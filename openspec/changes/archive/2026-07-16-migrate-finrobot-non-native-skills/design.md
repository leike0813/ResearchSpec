## Context

FinRobot has no upstream `SKILL.md`. Its current converter builds six production
trees from shared prose, per-Skill fragments, adapted provider contracts,
AgentSpec JSON, copied Python modules, and `dependencies.json`. Those trees are
approved and hash-bound, but they do not satisfy the current non-native vendor
standard: the ordinary runtime path is distributed across assets, several
resources have no direct consumer, and deterministic financial operations are
not exposed as small portable commands.

The immutable audit, source/license decisions, six neutral Skill IDs, domain
memberships, empty hard dependencies, advisory relationships, and Apache-2.0
distribution boundary remain authoritative. The migration changes authored and
generated form, not admitted business scope or workflow authority.

## Goals / Non-Goals

**Goals:**

- Make every FinRobot Skill executable from its copied tree and complete
  `SKILL.md`, using the lowest sufficient non-native Skill thickness.
- Give each advertised capability one primary implementation mechanism and an
  auditable source-to-output derivation.
- Centralize deterministic file/JSON/number/date/unit/hash/write/error handling
  while leaving financial formulas in domain entrypoints.
- Preserve a valid published tree until a complete replacement candidate has a
  separately approved aggregate hash, then switch renderer and production bytes
  atomically.
- Keep conversion, packaging, installation, checking, and update inert and keep
  runtime execution offline unless the Agent explicitly uses a configured
  external data tool.

**Non-Goals:**

- Changing the FinRobot audit, fixed Skill IDs, domain taxonomy or membership,
  public CLI, base/Companion surface, licensing, or hard Skill dependencies.
- Adding a generic runner, cross-Skill schema, fixed stdout envelope, state
  machine, provider client, credential discovery, dependency installation, or
  runtime LLM integration.
- Running formal with-Skill/baseline evaluation or making financial semantic
  judgments in scripts.

## Decisions

### Use four Tier 3 trees and two Tier 1 trees

Company fundamentals, event evidence, relative valuation, and statement
analysis contain repeated deterministic calculations or normalization and use
one documented Python 3.11 standard-library CLI each. Competitive position and
corporate risk remain baseline Agent procedures because their core work is
source evaluation and business judgment. No candidate tree contains a
`references/` directory: the reviewed supporting material is short and needed
on ordinary invocations, so its governing rules belong directly in `SKILL.md`.
A future reference is justified only when detailed, conditionally read material
meaningfully saves main-context capacity. Stateful or automation-runner layers
are rejected because there is no cross-session state authority, Gate, or
downstream runner contract.

### Author complete source trees

`skill-definitions.ts` is the typed SSOT for IDs, thickness, capabilities,
memberships, entrypoints, optional reference routes, and implementation mappings.
Vendor-owned `skills/<id>/` directories contain complete current-state
`SKILL.md` files and, for Tier 3 trees, scripts. The renderer copies reviewed
authored bytes and adds only
deterministic `LICENSE`, `NOTICE`, `DERIVATION.json`, and the shared support
library for Tier 3 trees. Fragment composition, AgentSpec generation,
dependency-manifest generation, prompt factories, and provider adapters are
removed.

### Separate semantic judgment from deterministic computation

The Agent owns source quality, peer selection, risk transmission, sentiment,
probability, business interpretation, method and assumption choice, conflict
resolution, and final conclusions. Scripts own validation, normalization,
stable calculation, deduplication, ranking from Agent-supplied assessments,
forecasting, DCF/multiples/sensitivity, hashing, and deterministic JSON writes.
Scripts do not fetch data, infer semantic scores, read credentials, install
packages, or access repository-local paths.

### Use one copied support module

`lib/financial_support.py` is the single source for JSON loading, finite-number,
date and unit validation, canonical hashing, atomic non-overwriting writes, and
consistent CLI errors. It is copied into each Tier 3 tree so a tree remains
self-contained outside the repository. Financial formulas stay in the relevant
entrypoint to avoid a generic utility layer that obscures domain ownership.

### Bind candidate review independently from published approval

`review-decision.json` records a required published tree hash and an optional
candidate `{ treeSetSha256, decision }`. Preview always renders the current
authored candidate. Production uses the published renderer/hash while the
candidate is `pending-human-review`; only an explicit approval of the exact
candidate hash promotes it and selects converter version 2. A stale published
approval never authorizes different bytes. This design permits a reviewable
two-phase migration and an atomic production switch.

### Keep converter isolation and generated ownership

FinRobot stages against all published vendor projections but commits only its
own generated tree, bundle, manifest, report, and the source-neutral assembled
registry. Fixed IDs, membership and empty dependency arrays are asserted before
commit. The other four vendor projections must remain byte-identical.

## Risks / Trade-offs

- **[Authored procedures omit an admitted surface]** → Validate the complete
  32-surface mapping and require every mechanism to resolve to a procedure,
  bundled script, or documented external tool in the tree.
- **[Shared code creates repository coupling]** → Copy the module into each
  complete tree and execute fixtures from a repository-external temporary copy.
- **[A script makes semantic financial decisions]** → Require event scores and
  valuation assumptions as explicit Agent-provided input and inspect each CLI's
  accepted fields in tests.
- **[A candidate accidentally replaces approved production]** → Keep published
  and candidate hashes distinct and fail conversion if renderer selection and
  approval state disagree.
- **[Duplicate copied support bytes increase tree size]** → Accept four small
  copies to preserve self-contained distribution; keep one converter-owned SSOT.
- **[Generated drift affects another vendor]** → Snapshot every unrelated
  vendor projection across convert/check/idempotence tests.

## Migration Plan

1. Add typed definitions, complete authored trees, shared support code, candidate
   renderer, implementation mappings, validation, and review artifact while the
   existing published hash remains authoritative.
2. Render the candidate, execute copied-tree tests, record all file and aggregate
   hashes, and keep production/release verification on the approved tree until
   explicit human review is recorded.
3. Promote the exact candidate hash, select converter version 2, remove obsolete
   curation/resources and generation paths, regenerate FinRobot outputs, and
   atomically update bundle, manifest, report, registry, docs, notices, and
   release verification.
4. Run strict specs, focused/full tests, checks, build, all vendor isolation and
   idempotence checks, release verification, and whitespace validation.

Before promotion, rollback removes candidate-only authored sources and review
metadata. After promotion, rollback requires restoring the previously approved
renderer and exact published hash together; other vendor projections and public
runtime contracts remain untouched.

## Open Questions

None. Skill thickness, implementation boundaries, approval sequencing, source
scope, runtime dependencies, and unchanged public surfaces are fixed by the
approved plan.
