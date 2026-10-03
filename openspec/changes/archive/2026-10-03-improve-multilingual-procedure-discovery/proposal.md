# Proposal

## Why

Procedure discovery currently removes non-ASCII query characters and treats the resulting empty query as catalog browsing. Natural research requests also depend on the host Agent translating them correctly, leaving Chinese and paraphrased requests vulnerable to irrelevant candidates or skipped discovery.

## What Changes

- Accept original natural-language requests with Unicode-aware, bilingual offline retrieval over the existing catalog and declared roles.
- Add optional CPU-only local multilingual embeddings, fused with lexical candidates, with a ten-second query deadline and explicit offline fallback.
- Offer explicit runtime installation in init and update, keeping locked dependencies, model files and derived vectors in a shared user cache; queries and static diagnostics do not install or download anything.
- Return retrieval mode, fallback reasons and candidate evidence while preserving progressive disclosure, pagination and activation authority.
- Strengthen Navigate and native project-entry guidance to discover using the original request before optional query reformulation.

## Capabilities

### New Capabilities

- `local-semantic-search`: Explicit installation and bounded local inference for optional Procedure discovery, including shared cache preparation and read-only fallback.

### Modified Capabilities

- `procedure-routing`: Unicode-aware bilingual retrieval, weighted lexical ranking, optional rank fusion, query diagnostics and candidate metadata.
- `research-capability-collaboration`: Original-request discovery and bounded reformulation independent of Agent translation.

## Impact

Changes Procedure retrieval, CLI bootstrap/configuration and discovery responses, native entry renderers, generated Navigate/handbook/site artifacts, packaging and focused behavior tests. Init/update gain `--procedure-search offline|hybrid`; no top-level command or workspace schema version changes. The optional runtime has its own dependency lock and requires explicit installation consent. Vendor packages and research workflow mutation authority are unchanged.
