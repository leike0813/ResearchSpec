# Annotated Bibliography (annotated-bibliography.v1)

**Node**: literature (research-main subgraph)
**Inputs**: `work/research/rq_brief.md`; `work/research/methodology_blueprint.md`; `benchmark/sources.yaml`; `benchmark/partial-manuscript.md`
**Outputs**: this `annotated_bibliography`
**Run**: run-2288fd2a43bd79f271923277

> **Fixture note.** All source IDs prefixed `SYN-` are synthetic test material supplied by the benchmark and have no real DOI, author, or publication venue. APA 7.0 citation fields that depend on those values are recorded as "synthetic fixture" so reviewers can recognize the constraint at a glance.

## Search Strategy Report

### Parameters

- **DATABASES:** None (corpus-only flow).
- **KEYWORDS:** N/A (no external search).
- **BOOLEAN STRATEGY:** N/A.
- **DATE RANGE:** N/A (synthetic corpus).
- **LANGUAGE:** N/A.
- **DOCUMENT TYPES:** Synthetic evidence summaries (classroom observation, instructor interview, student survey, institutional policy excerpt).

### Per-database hit counts

- External databases: not queried (corpus-only flow; per fixture goal, only synthetic material may be used).

### Inclusion/exclusion criteria

- **INCLUDE:** Any source present in `benchmark/sources.yaml` whose `kind` aligns with the bounded RQ (writing-instruction process, feedback, workload, integrity).
- **EXCLUDE:** None — the supplied corpus is the entire admissible evidence base.
- **SKIP:** None.

### Required claim/concept coverage and named gaps

- Required by the RQ: classroom writing process observation; instructor workload and feedback quality; student perception of permitted use and attribution; institutional policy framing.
- Named gaps relative to real-world generalizability: no comparison institution, no longitudinal data, no validated writing-improvement measure, no time logs, no implementation evidence for the policy, no cross-institutional transfer.

### Screening totals

- Total entries scanned: 4
- Included: 4 (`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`)
- Excluded by criteria: 0
- Skipped (criteria cannot be applied): 0
- Duplicate removals: 0

### Distributional skew advisories

- All four sources are from a single synthetic institution; distributional skew over geography is 100% by design. **DISTRIBUTIONAL_SKEW_ADVISORY** — disclosed, non-blocking.
- Three of four sources are summary forms (observation, interview, survey); one is a policy excerpt. Method-kind skew is acknowledged; cross-source triangulation can only be done at the kind-aligned level.

### Uncovered topics and gap-filling searches

- No external gap-filling searches were run (corpus-only flow).
- Gaps recorded: validated writing-improvement measure; time logs for instructor workload; longitudinal outcomes; institutional implementation evidence for the policy.

### PRE-SCREENED FROM USER CORPUS

- Adapter: unspecified (corpus passed in via `benchmark/sources.yaml` snapshot at fixture creation)
- Snapshot date: 2026-09-27 (fixture creation); the file itself is the snapshot
- Total entries scanned: 4
- Included: 4 entries; citation_keys: [SYN-CLASSROOM-01, SYN-INTERVIEW-02, SYN-SURVEY-03, SYN-POLICY-04]
- Excluded by inclusion/exclusion criteria: 0
- Skipped (criteria cannot be applied): 0
- Zero-hit note: not applicable (non-empty corpus with included entries)
- Note: corpus presence does not imply inclusion; the same criteria apply to external results (none available in this flow).

## Annotated Bibliography

**SYN-CLASSROOM-01** — Synthetic fixture (2026). *Classroom observation summary: structured AI prompts in a first-year writing course.* [synthetic fixture; no real DOI or venue]
- **Relevance:** Directly addresses the writing-process facet of the RQ (visible outline revisions under structured prompting).
- **Key Findings:** Students using structured AI prompts produced more outline revisions; final rubric scores varied widely.
- **Methodology:** Six-week classroom observation summary in one first-year writing course; no comparison group.
- **Quality:** Low external validity; instructor supplied all prompts; no validated writing-improvement measure.
- **Contribution:** A single-classroom signal that prompt structure may change process behavior without guaranteeing score gains; supports the bounded hypothesis that process visibility ≠ quality improvement.
- **Claim-source alignment:** Establishes a process-level pattern; does not establish a workload or integrity claim; cannot support generalization beyond the observed class.

**SYN-INTERVIEW-02** — Synthetic fixture (2026). *Instructor interview summary: faster feedback, additional verification work.* [synthetic fixture]
- **Relevance:** Directly addresses the feedback-quality and instructor-workload facets of the RQ.
- **Key Findings:** Five instructors at one institution reported faster formative feedback but additional time spent checking unsupported claims.
- **Methodology:** Convenience-sample interviews at one institution; self-reported workload; no time logs.
- **Quality:** Self-report bias; small N; not generalizable.
- **Contribution:** Indicates a workload *trade-off* (faster feedback partly offset by verification effort) rather than a workload *reduction*; aligns with the partial-manuscript caution that the strong workload-reduction claim is unsupported.
- **Claim-source alignment:** Establishes a directional pattern in self-reported workload; does not quantify magnitude; does not establish policy implementation.

**SYN-SURVEY-03** — Synthetic fixture (2026). *Student survey summary: rapid feedback valued; uncertainty about permitted use and attribution.* [synthetic fixture]
- **Relevance:** Addresses student perception, including academic-integrity attitudes and disclosure/attribution uncertainty.
- **Key Findings:** 84 voluntary responses valued rapid feedback; some reported uncertainty about permitted use and attribution.
- **Methodology:** Voluntary-response survey; attitudes not behavior; local policy changed during data collection.
- **Quality:** Voluntary-response bias; attitudinal only; policy context shifted mid-collection.
- **Contribution:** Establishes student-side appreciation of rapid feedback and a need for clearer disclosure/attribution guidance; does not establish observed behavior or policy compliance.
- **Claim-source alignment:** Anchors the academic-integrity facet of the RQ at the perception level; cannot anchor behavioral compliance claims.

**SYN-POLICY-04** — Synthetic fixture (2026). *Institutional policy excerpt: course-level disclosure required; acceptable assistance left to instructors.* [synthetic fixture]
- **Relevance:** Provides the institutional policy framing that bounds acceptable AI use.
- **Key Findings:** Course-level disclosure is required; acceptable assistance is delegated to instructors.
- **Methodology:** Single synthetic policy text; not accompanied by implementation evidence.
- **Quality:** Policy text does not show implementation quality; not generalizable across institutions.
- **Contribution:** Establishes the policy floor (disclosure) and the discretionary zone (acceptable assistance) that downstream course designs operate within.
- **Claim-source alignment:** Establishes what one institution's policy text says; does not establish whether or how it is enforced.

## Coverage matrix (RQ ↔ source)

| RQ facet | SYN-CLASSROOM-01 | SYN-INTERVIEW-02 | SYN-SURVEY-03 | SYN-POLICY-04 |
|---|---|---|---|---|
| Writing process | yes (process signal) | indirect (mentions claims) | no | no |
| Feedback quality | indirect | yes (direction) | yes (appreciation) | indirect |
| Instructor workload | indirect (process claim) | yes (trade-off) | no | no |
| Academic integrity / attribution | no | indirect | yes (uncertainty) | yes (policy floor) |

## Rules followed

- No evidence grading or synthesis findings emitted in this bibliography.
- No fabricated authors, DOIs, or venues.
- No external search conducted.
- All sources recorded with their `source_id` as `citation_key`; APA-style fields that depend on real publication data are marked synthetic.
