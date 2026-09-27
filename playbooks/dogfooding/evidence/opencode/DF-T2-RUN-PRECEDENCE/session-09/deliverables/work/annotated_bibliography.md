## Search Strategy Report

### Parameters

- **Databases consulted:** none external. The methodology (`work/methodology_blueprint.md`) bounds the evidence universe to the supplied synthetic sources. External database search would have violated the in-scope/out-of-scope decision in `researchspec/specs/project.md`, which forbids promoting any `SYN-*` source to a real citation and forbids adding real literature, DOIs, or fabricated publications to the closed evidence base.
- **Keywords:** generative AI; university writing instruction; instructor workload; student survey; institutional policy; course-level disclosure (used as conceptual anchors against the supplied corpus, not as database queries).
- **Boolean strategy:** n/a — no external database was queried.
- **Date range:** n/a — no external database was queried. The four sources span observation windows described inside their own narratives and are not collapsed into a single period.
- **Language:** n/a — no external database was queried. The supplied corpus is English-language.
- **Document types:** n/a — no external database was queried. The supplied corpus contains observation summaries, interview summaries, a survey summary, and a policy excerpt.

### Per-Database Hit Counts

- None. The methodology bound the evidence base to `benchmark/sources.yaml`; no external database was queried to avoid introducing evidence outside the closed synthetic universe.

### Inclusion / Exclusion Criteria

Defined *a priori* before screening, in line with the methodology blueprint:

- **Inclusion:**
  1. Source is listed in `benchmark/sources.yaml` with a `source_id` matching `SYN-*`.
  2. Source is summarised by `kind` and `scope` and reports a `finding` plus `limits`.
  3. Source addresses at least one of the RQ themes: writing-process pattern, feedback verification overhead, self-reported instructor workload, or academic-integrity friction.

- **Exclusion:**
  1. Any external literature, real publication, DOI, preprint, dataset, or web page not in `benchmark/`.
  2. Any content fabricated beyond what the supplied summaries state (effect sizes, demographics, ethics approvals, transcript material).
  3. Any source whose `limits` make its observation unusable even for descriptive synthesis (none in the supplied corpus triggered this exclusion).

- **Skip:**
  1. None. The supplied corpus is small enough that all four entries survived shape check and could be classified.

### Required Claim / Concept Coverage and Named Gaps

The RQ (`work/rq_brief.md`) requires that the mapping distinguish supported,
qualified, contradicted, and unsupported claims across four themes. The
supplied corpus covers each of the four themes as follows:

| Theme | Coverage from supplied corpus | Named gap |
|---|---|---|
| Writing-process pattern | `SYN-CLASSROOM-01` directly describes outline-revision behaviour under structured AI prompting | No comparison-group classroom; no validated writing-improvement measure |
| Feedback verification overhead | `SYN-INTERVIEW-02` directly reports instructor verification work | No time logs; self-reported workload only |
| Self-reported instructor workload | `SYN-INTERVIEW-02` reports perceived faster feedback offset by verification | No time-on-task measurement; small convenience sample |
| Academic-integrity friction | `SYN-POLICY-04` describes disclosure requirement; `SYN-SURVEY-03` describes student-reported uncertainty about permitted use | Policy-text-only (no implementation quality); attitudes not observed behaviour |

Material gaps that cannot be closed inside this exercise and are surfaced
upstream rather than papered over:

- No effect-size or causal-inference evidence for any claim.
- No multisite evidence; the policy excerpt is one synthetic institution.
- No longitudinal evidence beyond the supply-internal observation windows.
- No demographic, ethics-approval, or participant-level data.

### Screening Totals

- Total entries scanned: 4
- Included: 4 (`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`)
- Excluded by criteria: 0
- Skipped (criteria cannot be applied): 0

### Duplicate Removals

- None. Each supplied entry has a unique `source_id` and a distinct `kind`/`scope` profile.

### Distributional Skew Advisories

The methodology already commits the mapping to a closed synthetic universe,
so a distributional skew across published venues does not apply. For
transparency inside the supply:

- **Methodology concentration:** 100% qualitative (no quantitative or
  mixed-methods designs appear in the corpus). This is consistent with the
  methodology's qualitative stance and is recorded as a known bound, not as
  a defect.
- **Setting concentration:** 100% of the corpus describes one synthetic
  institution (or a sub-unit of it). Cross-institutional evidence is named
  as a gap.

### Uncovered Topics and Gap-Filling Searches

Topics that the RQ sub-questions opened and that the supplied corpus does
not address:

- Validated writing-improvement measurement (vs. rubric-score variation):
  unfilled.
- Time-on-task / time-log evidence for instructor workload: unfilled.
- Observation of student behaviour around AI use (vs. self-reported
  attitudes): unfilled.
- Cross-institutional implementation of disclosure-style policies: unfilled.
- Quantitative comparison of AI-supported and non-AI-supported sections
  within the same course: unfilled by supply.

Gap-filling searches were not run: the methodology and project.md both
prohibit external sourcing for this exercise. Each unfilled topic is
recorded as a known gap for downstream decisions.

### Search Strategy Reporting Notes

- Obtained-via: not declared by the user-side adapter. The supplied
  source list lives at `benchmark/sources.yaml` (project-relative path)
  and is consumed as a fixture corpus rather than via an adapter.
- Obtained-at: not declared. The corpus carries no acquisition timestamp.
- The same inclusion/exclusion criteria apply to corpus and external
  results; no external results exist in this exercise.

## Annotated Bibliography

### PRE-SCREENED FROM USER CORPUS

- Adapter: project-supplied fixture corpus (`benchmark/sources.yaml`); not
  an installed ResearchSpec literature adapter.
- Snapshot date: unspecified (no declared `obtained_at`).
- Total entries scanned: 4
- Included: 4 entries; citation_keys: [`SYN-CLASSROOM-01`,
  `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`]
- Excluded by inclusion/exclusion criteria: 0
- Skipped (criteria cannot be applied): 0
- Zero-hit note: n/a (corpus is non-empty and yielded included entries).
- Note: corpus presence does not imply inclusion; the same criteria would
  apply to any external entries, but no external entries were retrieved
  because the methodology and project.md both bound the evidence universe
  to the supplied corpus.

### Entry 1 — `SYN-CLASSROOM-01`

> The entries below describe fixture sources. They are not real publications,
> have no DOI, and must not be cited as if they were. The `APA 7.0` slot is
> filled with a fixture-explicit placeholder citation so the structure of
> the bibliography remains auditable while the underlying fact stays
> labelled.

**SYNTHETIC FIXTURE CITATION (NOT A REAL PUBLICATION).** Synthetic
Classroom Observation 01 — *Structured AI prompting in a first-year
writing course: outline-revision signal over six weeks*. Synthetic
Dogfooding Benchmark, `benchmark/sources.yaml`,
`source_id: SYN-CLASSROOM-01`. Classifier: not peer-reviewed; not
indexed; no DOI; not citable in real research.

- **Relevance:** Direct. The only supplied source that observes a
  classroom-level writing-process pattern under a structured-prompting
  condition over a defined window.
- **Key Findings:** Students using structured AI prompts produced more
  visible outline revisions; final rubric scores varied widely.
- **Methodology:** Classroom observation summary across a six-week window
  in one first-year writing course. No comparison group, no validated
  writing-improvement measure, instructor-supplied prompts.
- **Quality:** Low for causal or comparative inference; usable for
  descriptive pattern observation within its narrow scope. Limitations are
  stated inline in the source.
- **Contribution:** Anchors the supported claim about outline revisions
  (mapped to `CLM-01` in the partial manuscript) and surfaces the limits
  that keep that claim bounded to one course without a comparison group.

### Entry 2 — `SYN-INTERVIEW-02`

**SYNTHETIC FIXTURE CITATION (NOT A REAL PUBLICATION).** Synthetic
Instructor Interview Summary 02 — *Reported feedback speed and
verification overhead: five instructors at one institution*. Synthetic
Dogfooding Benchmark, `benchmark/sources.yaml`,
`source_id: SYN-INTERVIEW-02`. Classifier: not peer-reviewed; not
indexed; no DOI; not citable in real research.

- **Relevance:** Direct. Sole source for instructor-perceived workload
  effects and for the verification overhead that offsets faster formative
  feedback.
- **Key Findings:** Instructors reported faster formative feedback but
  additional time spent checking unsupported claims.
- **Methodology:** Interview-summary synthesis across five instructors at
  one institution. Self-reported workload, small convenience sample, no
  time logs.
- **Quality:** Low for time-on-task measurement; usable for the
  perception-level pattern. Limitations are stated inline in the source.
- **Contribution:** Provides the evidence that the partial manuscript's
  `CLM-02` (unqualified "AI reduces workload") cannot be sustained: the
  speed gain is partly cancelled by verification work. Bounded signal,
  not a causal effect.

### Entry 3 — `SYN-SURVEY-03`

**SYNTHETIC FIXTURE CITATION (NOT A REAL PUBLICATION).** Synthetic
Student Survey Summary 03 — *Student-reported attitudes toward rapid
feedback and disclosure uncertainty (n = 84, voluntary)*. Synthetic
Dogfooding Benchmark, `benchmark/sources.yaml`,
`source_id: SYN-SURVEY-03`. Classifier: not peer-reviewed; not
indexed; no DOI; not citable in real research.

- **Relevance:** Direct. Source for student-perceived value of rapid
  feedback and for the perceived uncertainty about permitted use and
  attribution.
- **Key Findings:** Respondents valued rapid feedback; some reported
  uncertainty about permitted use and attribution.
- **Methodology:** 84 voluntary responses on attitudes. Voluntary
  response bias, attitudes rather than observed behaviour, local policy
  changed during data collection.
- **Quality:** Low for behavioural inference; usable for descriptive
  attitude and uncertainty mapping. Limitations are stated inline in the
  source.
- **Contribution:** Bridges the policy excerpt (`SYN-POLICY-04`) with the
  instructor-side workload signal by surfacing the student-perceived
  uncertainty that disclosure rules would need to address.

### Entry 4 — `SYN-POLICY-04`

**SYNTHETIC FIXTURE CITATION (NOT A REAL PUBLICATION).** Synthetic
Institutional Policy Excerpt 04 — *Course-level disclosure requirement
with instructor-level acceptable-assistance definitions*. Synthetic
Dogfooding Benchmark, `benchmark/sources.yaml`,
`source_id: SYN-POLICY-04`. Classifier: not peer-reviewed; not
indexed; no DOI; not citable in real research.

- **Relevance:** Direct. Source for the policy-level structure that
  shapes student and instructor behaviour across the other three
  sources.
- **Key Findings:** Course-level disclosure rules are required, but
  acceptable assistance is left to instructors.
- **Methodology:** Single synthetic university policy excerpt. Policy text
  only; does not show implementation quality; not generalizable across
  institutions.
- **Quality:** Low for implementation assessment; usable as a structural
  description of one institution's policy framing. Limitations are stated
  inline in the source.
- **Contribution:** Names a friction surface (disclosure required,
  acceptability delegated to instructors) that interacts with the
  survey's perceived-uncertainty signal and the interview's
  verification-overhead signal.

### Notes on the Bibliography

- No real publication, DOI, venue, or peer-review record is asserted for
  any entry above. The fixture status is part of each entry's
  bibliographic statement.
- No external database, web page, or pre-print service was queried to
  fill gaps. Each unfilled theme (effect size, validated writing measure,
  time logs, observed student behaviour, cross-institutional policy
  implementation) is recorded as a named gap in the Search Strategy
  Report and is left for a downstream, properly authorised literature
  exercise to address.
- The four entries form the entire evidence universe the synthesis and
  research-report nodes are allowed to draw on for this run.
