## Context

The pinned Scientific Agent Skills v2.53.0 audit preserves the upstream `SECURITY.md` summary and production policy currently excludes 40 Skills with `static-security-review-failed`. The upstream report is useful evidence but not a reliable verdict: for example, it reports 23 hidden Python files for `bgpt-paper-search` although that Skill tree contains only `SKILL.md`, and it repeats the same 23-file claim for `bids`, whose tree contains one Python script. Other findings elevate normal use of service-specific credentials to exfiltration without resolving the endpoint, data flow, or disclosure contract.

The 40 records split into 16 candidates whose only recorded exclusion reason is the failed security review and 24 candidates with independent ToolUniverse overlap, ARSU overlap, or domain-fit blockers. Security truth must therefore be reviewed independently from production eligibility. The original machine audit remains immutable; a new reviewed policy layer records ResearchSpec's finding-level conclusions and maintainer decisions.

## Goals / Non-Goals

**Goals:**

- Account for all 40 `static-security-review-failed` Skills exactly once against the pinned source tree.
- Review the complete local attack surface without executing content, and distinguish confirmed risk from partial findings, false positives, and inapplicable scanner claims.
- Present five self-contained decision cards per round and preserve the maintainer's four-state decision for every Skill.
- Reconcile security conclusions with admission, resource curation, existing domain membership, generated assets, and reports only after the full decision set is complete.
- Keep review evidence machine-checkable while retaining a readable audit report.

**Non-Goals:**

- Dynamic malware analysis, dependency installation, credential use, service calls, vulnerability certification, or review of a newer upstream revision.
- Reopening the ToolUniverse-first overlap policy, ARSU authority boundary, ANZSRC taxonomy, or five tool domains.
- Maintaining ResearchSpec-authored rewrites of upstream Python, shell, or other business scripts.
- Treating a cleared static finding as an override for license, content, dependency, authority, overlap, or domain requirements.

## Decisions

### Add one finding-level review catalog beside converter policies

`security-review-decisions.json` is the detailed SSOT for the 40 manual reviews. It records vendor release and revision, stable Skill ID, batch number, upstream severity and finding count, actual resource inventory, every reviewed path, finding records, recommendation, approved action, allowed adaptations, independent blockers, and proposed existing domains. Finding IDs are deterministic within the pinned report (`<skill-id>:<one-based-ordinal>`); each finding records its upstream code and severity, verdict (`confirmed`, `partially-confirmed`, `false-positive`, or `not-applicable`), source evidence, analysis, and residual risk.

The catalog schema requires exact target coverage, stable order, safe paths under the pinned Skill or the upstream security report, and no duplicate finding IDs. Inventory is recomputed from the submodule rather than copied from scanner prose. The original audit and `SECURITY.md` are not edited. Admission decisions retain only the production summary and are validated against the detailed catalog, avoiding an independent second manual verdict.

Alternative considered: rewrite the immutable audit records. Rejected because it would erase the upstream observation and make the original v2.53.0 audit irreproducible.

### Review the full local attack surface, not only scanner citations

For every target, review enumerates `SKILL.md`, all executable resources, configuration and environment templates, and instruction-bearing resources reachable from the entry. Large schemas, datasets, and static templates receive format, origin, reference-chain, executable-content, and prompt-injection boundary checks rather than line-by-line semantic review. No upstream script is run and no dependency or service is contacted.

Each scanner finding is resolved against files that actually belong to the Skill. Claims that cite absent or cross-Skill files are false positives, not residual blockers. Legitimate network and credential flows are evaluated by endpoint control, transmitted data, user disclosure, configurability, and least-privilege behavior rather than keyword co-occurrence alone.

Alternative considered: review only paths named by `SECURITY.md`. Rejected because polluted scanner context can omit the real local attack surface as well as invent files.

### Separate technical recommendation, maintainer decision, and production effect

The reviewer supplies one recommendation: `clear`, `clear-with-adaptation`, `fail`, or `defer`. The maintainer selects the same four-state action or provides an explicit replacement; no production policy changes are made before that decision is recorded. Each decision card also shows independent blockers and the exact production effect.

- `clear` removes `static-security-review-failed` after all other admission gates are revalidated.
- `clear-with-adaptation` does the same only after the approved generated documentation, compatibility, fixed configuration, or resource exclusions are represented in converter policy.
- `fail` retains `static-security-review-failed` with the confirmed evidence.
- `defer` records `manual-security-review-deferred` and remains excluded without presenting the upstream scanner severity as a confirmed ResearchSpec verdict.

A cleared Skill with another blocker remains excluded. A candidate becomes admitted only when its license, content, overlap, dependency, resources, domain membership, and manual security decision are all passing. Proposed domain membership is limited to existing catalog domains and is included in the decision card so a clear/curate choice approves the described production projection unless the maintainer states otherwise.

### Limit curation to adapter-owned presentation and removable resources

Approved curation may normalize the generated `SKILL.md`, compatibility guidance, endpoint or environment disclosure, fixed non-secret configuration, and removal of a resource that is not required for the coherent capability. Generated files remain converter-owned and every omission remains manifest-visible. If risk resolution requires changing executable business logic, the only valid results are `fail` or `defer` until upstream supplies a reviewable revision.

Alternative considered: keep local script patches. Rejected because it would make ResearchSpec the long-term maintainer of security-sensitive third-party runtime code and obscure provenance.

### Use eight deterministic five-Skill review rounds

The first 16 Skills are the candidates for which security is the only recorded exclusion reason; the remaining 24 retain independent blockers. Stable review order is:

1. `fluidsim`, `geomaster`, `infographics`, `latex-posters`, `markitdown`
2. `modal`, `pacsomatic`, `parallel-web`, `pptx-posters`, `qutip`
3. `scientific-schematics`, `scientific-slides`, `seaborn`, `transformers`, `umap-learn`
4. `venue-templates`, `bgpt-paper-search`, `bids`, `cellxgene-census`, `citation-management`
5. `clinical-decision-support`, `clinical-reports`, `consciousness-council`, `database-lookup`, `dhdna-profiler`
6. `flowio`, `histolab`, `hypothesis-generation`, `literature-review`, `paperzilla`
7. `pathml`, `peer-review`, `primekg`, `research-lookup`, `scholar-evaluation`
8. `scientific-writing`, `tiledbvcf`, `treatment-plans`, `usfiscaldata`, `zarr-python`

After each round, the five records and human report are updated with the maintainer decisions. Production admission and generated bundles remain unchanged until all 40 records have a non-pending decision, preventing a partially reviewed registry release.

### Reconcile production atomically after review completion

Once the review catalog is complete, policy validation computes the final blocker set for every candidate. Admission and resource decisions, existing domain memberships, converter output, manifest, bundle, central registry, conversion report, adapter documentation, and both human review/ingest reports are updated together. Newly admitted counts are outcomes, not plan targets. ToolUniverse assets are staged unchanged and the public CLI, registry schema, domain IDs, base Skills, and wrapper count remain fixed.

Rollback restores the prior admission, resource, and domain policy inputs and regenerates the Scientific Agent Skills projection; no workspace schema migration is required.

## Risks / Trade-offs

- **Static review cannot certify runtime safety** → State residual risks explicitly, keep scripts inert, and avoid claims of certification.
- **Large instruction/resource trees can hide relevant behavior** → Validate complete inventories and review every executable/configuration path plus every reachable instruction resource.
- **Human decisions can drift from technical evidence** → Bind each decision to finding records, independent blockers, proposed adaptations, and pinned revision evidence.
- **Partial review could leak into production** → Reject production reconciliation while any of the 40 records is pending or structurally incomplete.
- **Cleared candidates may still fail license review** → Preserve the independent blocker and do not infer a content license from repository-level expectations.
- **Exact production counts are unknown before decisions** → Derive counts from validated policies and update count-sensitive tests only after all eight rounds are complete.
