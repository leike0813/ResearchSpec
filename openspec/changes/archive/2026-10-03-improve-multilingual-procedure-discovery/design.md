# Design

## Context

See proposal.md for the discovery failure. The catalog currently has 411 derived entries and no search-specific metadata owner. CLI list owns bounded paging; bootstrap owns schema-2 configuration and ownership-aware projection. Local semantic retrieval is an explicitly selected framework feature, separate from research model calls and vendor tools.

## Goals / Non-Goals

**Goals:** original-request bilingual discovery, a useful dependency-free baseline, optional CPU embeddings, explicit preparation consent and read-only query fallback.

**Non-Goals:** external model services, persistent research indexes, general document search, another Procedure registry, additional host hooks or workflow authority.

## Decisions

- Add shared search DTOs and a canonical metadata document builder. Fields are identity/title, intents, description and context (domains, profiles and declared roles). ARSU intents come from its existing routing source. Cards expose role declarations without reading materials.
- Use Unicode NFKC normalization, accent folding, Intl.Segmenter, shared bilingual concept aliases and bounded stopwords. Weighted BM25 uses k1=1.2/b=0.75, identity/title=4, intents=3, description=2, context=1. Alias data is concept vocabulary, never a mapping to Procedure IDs. Exact IDs/selectors outrank retrieval scores.
- Score rarity across the catalog while retaining per-field length normalization. Group alias contributions by query concept with diminishing returns and favor coverage of the request's concepts; a generic action repeated across fields must not overwhelm its subject. Fold Latin plurals only into known vocabulary and retain bounded phrase expansion. This addresses observed long-sentence failures without assigning intent to particular Procedure IDs.
- Hybrid rank fusion uses equal-weight RRF with k=60 over each branch's top 50. Results include match evidence and requested/effective mode; they are advisory candidates. Browse remains stable ID order. Explicit empty queries fail and lexical misses return an empty list.
- Pin Transformers.js 3.8.1 and Xenova/multilingual-e5-small revision 761b726dd34fb83930e26aab4e9ac3899aa1fa78, CPU q8/384-dimensional mean-pooled normalized embeddings. Query and document inputs use the model's required query:/passage: prefixes. Dependencies live under an independent package lock, installed with npm ci --ignore-scripts --omit=dev --no-audit --no-fund in a user cache, never the project or framework dependency tree.
- User cache root follows OS conventions and supports RESEARCHSPEC_SEARCH_CACHE for relocation and isolated testing. Preparation stages and atomically publishes each complete runtime/model resource, then publishes the catalog index only after embedding validation and self-test. Readiness requires all three. Catalog identity includes canonical metadata and document version; index identity also binds runtime/model. Address each index by that identity so different catalogs coexist. Queries only read local resources and use a terminable child process with a ten-second budget. Preparation has a ten-minute deadline.
- Add optional config procedure_search.mode (offline/hybrid, omission means offline). Fresh interactive init recommends installation using a confirmation port. Existing init/update preserve omission; explicit hybrid retries preparation. Workspace projection succeeds independently of optional preparation. Dry-run never prepares resources. Static inspections never import inference dependencies.
- Extend existing list response with retrieval metadata and per-candidate match evidence; bind paging to query, catalog identity, actual backend and ordered IDs rather than volatile floating scores. Candidate card inputs/outputs use declared roles. Original-request query instructions replace required Agent translation; current run priority and activation consent remain intact.

## Risks / Trade-offs

- Local CPU performance varies: enforce the query deadline and return the already computed lexical results.
- Native dependencies may fail to load with lifecycle scripts disabled: self-test before publication and retain offline initialization on failure.
- Directory content changes invalidate prepared vectors: report stale resources and rebuild only on explicit bootstrap selection.
- Semantic neighbors may be unsuitable: label them as candidates with evidence and require Navigate to inspect current inputs/instructions.
- Native host entry agreements cannot compel an Agent ignoring its context: validate live trigger behavior separately from projection correctness.

## Migration Plan

Add an optional field to current schema 2; no format migration or old-workspace reader. Refresh owned Navigate and native entry content through existing delivery machinery. Run deterministic tests, real local CPU smoke and the existing packaged acceptance; extend the hosted Node 22/24 matrix with explicit semantic smoke rather than treating this machine as evidence for other platforms.
