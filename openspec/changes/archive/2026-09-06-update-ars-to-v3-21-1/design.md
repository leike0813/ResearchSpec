## Context

See proposal.md. The existing converter owns current contract replacements and runtime-policy adaptations; capability authoring separately consumes 119 extracted artifacts. The upstream release changes both content and authority-bearing instructions.

## Goals / Non-Goals

Goals: coherent release admission, faithful changed semantic procedures, deterministic generation and an independently reviewable audit.

Non-goals: upstream model transports, opt-in ledger runtimes, legacy replay, dependency installation and new ResearchSpec workflow state.

## Decisions

1. Target the tagged v3.21.1 commit, not subsequent main-branch commits. This supplies a reproducible released maintenance boundary.
2. Keep the local patch contract as the sole generated schema authority. Map author choice and claim-strength protections to local revision rationale and accepted ResearchSpec decisions; do not copy upstream passport/roadmap lifecycle identities into core merely to match upstream fields. Extend local validation only where the semantic requirement is otherwise unrepresented.
3. Preserve reviewer v2 role-specific criteria and fatal/repairable distinctions in reviewed resources and procedures. Editorial recommendations remain producer material; formal ResearchSpec Gates retain explicit human confirmation.
4. Update only affected extraction artifacts, then regenerate both the four ARSU Skills and 38 capability packages through their existing owners. Refresh contract/runtime-policy source anchors rather than bypassing drift checks.
5. Retain prior audits. New source identities, changed-file mapping, semantic decisions and validation belong to `audits/arsu/v3.21.1-127ff85/`.

## Risks / Trade-offs

- New upstream runtime references can imply unshipped tools or authority → review reference closure and adapt instructions before declaring fit.
- Verbatim extraction preserves upstream version prose → retain it as source evidence; adapt execution semantics in converter-owned procedures.
- Upstream patch identities differ from ResearchSpec → review local authorization semantics and exercise current patch behavior with existing tests.

## Migration Plan

The authorized executable repair separates producer report generation from submission validation. Authored package-local Python modules compute deterministic reports; the declared validator recomputes using graph-resolved input paths and compares the submitted report. Findings and unavailable scientific checks are report data for the owning Gate, not automatic approval. No upstream runtime, cache, network client or model transport is executed. Missing optional dependencies must be explicit. Required output roles follow the manifest's required flag. Existing shared input resolution remains the sole authority for materials passed to validation.

Pin the source, refresh extraction and policies, generate packages, run relevant validation and full tests, then establish the new audit. Existing research workspaces are not migrated. Changes remain uncommitted for review.
