## Source Verification Report

### Overall Assessment

**Sources Reviewed:** 4
**Verified:** 0 (none of the four entries is a real publication with a DOI, an indexed venue, or an identifiable author)
**Flagged:** 4 (all four: synthesised as test fixtures, declared as such in `benchmark/README.md`)
**Rejected:** 0 (no entry is rejected on fabrication grounds; `benchmark/README.md` declares the four entries synthetic and forbids promoting any `SYN-*` ID to a real citation. FABRICATED classification is reserved for entries that try to impersonate real publications; the supplied corpus is the opposite of that.)

### Pre-Classification Note

The four entries in the annotated bibliography are explicitly declared
synthetic dogfooding material by the project
(`benchmark/README.md`: "All sources are synthetic test fixtures, do not
represent real research, real participants, real publications, or real
ethics review"). The Source Quality Grading rubric therefore applies in a
degraded form:

- Publication-venue assessment (Scopus / WoS / Beall's / Cabell's / COPE /
  DOAJ / impact factor / ISSN) is not applicable to any of the four.
- Author credibility checks (affiliation, ORCID, track record, declared
  COI, retraction watch) are not applicable to any of the four; no real
  human author is asserted.
- Factual-claim cross-verification cannot draw on real independent
  sources because no underlying real claims exist.
- Currency is not applicable in the standard sense: the four summaries
  describe observation windows inside their own narratives and are not
  indexed by publication date.

The grading below treats each entry as if it were a "single descriptive /
qualitative study" (Level VI on the evidence hierarchy) for the purpose
of claim-strength classification inside this synthetic exercise, while
flagging each entry as a fixture that must not enter any real-literature
argument, citation list, or downstream synthesis for a real research
product. Real-world downstream use of these entries is excluded by
construction.

### Source Quality Matrix

| Source | Level | Venue | Author | Method | Currency | COI | Overall |
|---|---|---|---|---|---|---|---|
| `SYN-CLASSROOM-01` | VI | n/a (fixture) | n/a (fixture) | warn | n/a (fixture) | n/a (fixture) | Level VI, Fixture |
| `SYN-INTERVIEW-02` | VI | n/a (fixture) | n/a (fixture) | warn | n/a (fixture) | n/a (fixture) | Level VI, Fixture |
| `SYN-SURVEY-03` | VI | n/a (fixture) | n/a (fixture) | warn | n/a (fixture) | n/a (fixture) | Level VI, Fixture |
| `SYN-POLICY-04` | VI | n/a (fixture) | n/a (fixture) | n/a (no empirical method) | n/a (fixture) | n/a (fixture) | Level VI, Fixture |

The "warn" marks reflect the inline limitations the supplied summaries
already disclose:

- `SYN-CLASSROOM-01`: no comparison group, no validated writing-improvement
  measure, instructor-supplied prompts.
- `SYN-INTERVIEW-02`: self-reported workload, small convenience sample,
  no time logs.
- `SYN-SURVEY-03`: voluntary response bias, attitudes rather than
  observed behaviour, policy change during data collection.
- `SYN-POLICY-04`: policy text only, does not show implementation
  quality; not generalizable across institutions.

### Flagged Sources (Detail)

#### `SYN-CLASSROOM-01`

- **Issue:** Synthetic test fixture; not a real classroom observation.
  Description of an instructional pattern, not a measured effect.
- **Severity:** Medium (High if treated as a real study).
- **Recommendation:** Include within the supplied-corpus mapping with the
  stated limitations; exclude from any real-literature argument or
  citation list.
- **Evidence:** `benchmark/README.md` and `benchmark/sources.yaml` declare
  the entry synthetic. The summary itself names the limits that already
  qualify any claim strength.

#### `SYN-INTERVIEW-02`

- **Issue:** Synthetic test fixture; self-reported workload only, no
  time-on-task measure. The earlier draft claim that "generative AI
  reduces instructor workload" cannot be sustained from this source
  because the verification overhead offsets the perceived feedback
  speed gain.
- **Severity:** Medium (High if the qualitative signal is treated as a
  measured effect).
- **Recommendation:** Include as a perception-level signal within the
  supplied corpus; surface the offsetting verification overhead as a
  qualifying annotation next to any claim derived from it.
- **Evidence:** Source-side limits and the partial-manuscript
  `CLM-02` rejection in `benchmark/partial-manuscript.md`.

#### `SYN-SURVEY-03`

- **Issue:** Synthetic test fixture; attitudes, not observed behaviour;
  voluntary response bias; policy change during data collection.
- **Severity:** Medium (High for downstream designers who would otherwise
  treat the attitude pattern as a behavioural one).
- **Recommendation:** Include as evidence about how students perceive the
  disclosure framework, not as evidence about what they actually do.
  Mark the policy-during-data-collection limit when claims are drawn.
- **Evidence:** Source-side limits and the partial-manuscript's gap
  between student-reported uncertainty and observed behaviour.

#### `SYN-POLICY-04`

- **Issue:** Synthetic test fixture; policy text only, no implementation
  evidence; one synthetic institution.
- **Severity:** Medium (Low for descriptive structural claim; High for
  any implementation claim).
- **Recommendation:** Include as a structural description of one
  institution's policy framing. Do not generalise to other institutions
  or claim sector behaviour.
- **Evidence:** Source-side limits and the project's out-of-scope list
  in `researchspec/specs/project.md`.

### Predatory Journal Alerts

None. None of the four entries references a real journal. The
predatory-journal screen has nothing to act on because no real venue is
implicated.

### Conflict of Interest Disclosures

None. No real author, funder, institution, or political sponsor is
identified for any of the four entries. Each fixture is an
internally-attributed observation summary without external sponsorship.

### Verification Limitations

- The Tier-0 Semantic Scholar / Tier-1 DOI / Tier-2 WebSearch verification
  chain cannot be applied, because none of the four entries carries a
  real DOI or a searchable real title. All four are therefore recorded as
  `UNVERIFIABLE` against external indexers — this is the expected
  outcome of the synthetic-fixture design, not an indication of real
  reference corruption.
- Evidence-hierarchy grades are reported above to document the *claim
  strength the source can carry*; they do not license citation in a real
  publication.
- The `citation_key`, `title`, `authors`, `year`, and `source_pointer`
  fields the bibliography procedure expects are mirrored by the
  fixture-shaped fields the project actually carries: `source_id`,
  `kind`, `scope`, `finding`, and `limits` in `benchmark/sources.yaml`.
  This shape mismatch is acceptable inside the closed synthetic
  exercise; it would be a hard blocker for any real literature
  acquisition run.
- No real literature, real database result, or real DOI is introduced
  here or downstream; the procedure cannot increase the evidence base
  beyond the four supplied fixtures.

### Carry-Forward Decision

Each entry:

- **May** enter the synthesis node, with the qualifications above.
- **Must not** be cited as a real publication in any subsequent research
  product.
- **Must** be flagged as synthetic whenever it is referenced in any
  deliverable outside this exercise.
