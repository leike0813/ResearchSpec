# Verification

Verified on 2026-10-03, Linux x64, Node v24.12.0. The catalog contains 411
runtime-derived Procedures. No project dependencies were installed or changed.

## Completed checks

| Check | Result |
| --- | --- |
| `pnpm test` | 515 passed, zero failed |
| `pnpm lint` / `pnpm check` / `pnpm build` | Passed |
| `node scripts/generate-docs.mjs --check` | Canonical handbook and website pages match |
| `pnpm release:verify` | Installed tarball passed; 6,639 files, 128,075,259 bytes unpacked |
| `openspec validate improve-multilingual-procedure-discovery --strict --no-interactive` | Passed |
| `openspec validate --specs --strict --no-interactive` | 60 passed, zero failed |
| `git diff --check` / authored whitespace check | Passed |

The CLI checks cover original Chinese queries, role cards, empty/stopword queries,
lexical misses, cursor identity, non-interactive defaults, fresh confirmation,
selection preservation, optional preparation failure and dry-run. Missing-cache
queries and static status/check/doctor leave the cache absent. Runtime tests cover
reuse, independently addressable catalogs, interrupted preparation, damaged
resources, normalized vectors, deadlines and a read-only query environment.

## Real CPU retrieval

Executed `node scripts/semantic-search-smoke.mjs --yes` with
`RESEARCHSPEC_SEARCH_CACHE=/tmp/researchspec-semantic-acceptance`. First preparation
downloaded the pinned five model files, installed locked CPU dependencies with
lifecycle scripts disabled, generated vectors and passed self-test in 66.8 seconds.
Subsequent preparation reused the cache. All five original-query cases used the
hybrid backend and recalled a suitable candidate within the first five results;
the direct semantic probe also returned candidates.

Three subsequent real hybrid probes took 2,106 ms, 2,135 ms and 2,012 ms
respectively (literature evidence, reviewer replies and mixed-language screening),
including lexical retrieval and the inference subprocess. These are local
observations, not performance guarantees for the hosted matrix.

| Original request | Suitable offline candidate in top 5 | Suitable hybrid candidate in top 5 |
| --- | --- | --- |
| 帮我把这一章的文献综述整理出来 | `discovery-literature-search-screening`, `deep-research` | `deep-research` |
| I need to write a patent disclosure from my research results | `generation-patent-disclosure`, `design-patent-intake` | `generation-patent-disclosure` |
| 审稿人提了意见，帮我起草逐条回复 | `transform-review-response-comment-atomization`, `design-review-response-workboard-planning` | `generation-review-response-round` |
| check whether the citations in my bibliography are real | `check-reference-integrity-verification`, `check-citation-format-compliance` | `check-citation-existence-verification`, `check-citation-format-compliance` |
| screen 这批 papers for duplicate and 低质量 records | `discovery-literature-search-screening` (first) | `discovery-literature-search-screening` (first) |

The offline regression table additionally covers outlines, claim verification,
patent reading, historical archives, financial statements and curriculum design.
Assertions permit suitable alternatives and reject unrelated leading candidates
for the two observed long-sentence failures.

The initial long-sentence evaluation exposed generic action words dominating
salient subjects. Catalog-wide IDF, diminishing returns per query concept and
concept coverage corrected that behavior; vocabulary expansion alone was
insufficient. Alias changes leave semantic vectors reusable because their source
is public catalog metadata, not the lexicon.

Ranking remains advisory. ARSU coordinators can precede dedicated executors;
semantic neighbors still put patent evidence ahead of a literature task and patent
office-action replies ahead of reviewer replies. Candidate purpose and declared
roles must settle selection before activation. This is a recall smoke, not a claim
of perfect first-result precision or live Agent behavior.

## Remaining acceptance boundaries

The opt-in hosted matrix covers Linux/macOS/Windows with Node 22/24; it was added
but not executed here. Unified host-Agent dogfooding remains a separate human
acceptance campaign. No commit, release or publication was performed.

The additional ARSU generated-output check failed on existing manifest drift:
`profiles/registry.json` has a hash mismatch and seven patent-related profile
entries are missing (`patent-application`, `patent-disclosure`, `patent-docket`,
`patent-informed-paper`, `patent-intelligence`, `patent-oa`, `research-to-patent`).
`git diff -- skills/arsu` is empty; this change did not modify those assets.
Resolve that maintenance issue before treating all repository release gates as
passed. It does not invalidate the discovery, installed-package or local CPU
results above.
