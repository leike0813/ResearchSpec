## Research Question Brief

### Topic Area

Generative AI in undergraduate writing instruction: the evidence tied to
claims about student writing process, AI-assisted feedback quality,
instructor workload, and academic-integrity friction, bounded to four
synthetic source summaries supplied for this dogfooding exercise.

### Primary Research Question

Across the supplied synthetic evidence set, which observable claims about
generative AI in university writing instruction are supported, qualified,
or contradicted, and what design constraints does the evidence impose on
any downstream generalisation?

### FINER Assessment

| Criterion | Score | Justification |
|---|---|---|
| Feasible | 4/5 | The four supplied synthetic summaries can be screened against the partial manuscript's claims inside one synthesis cycle; feasibility is bounded by the synthetic-evidence cap, not by external retrieval. |
| Interesting | 4/5 | The claim-level resolution exposes where the field risks over-claiming short-term classroom patterns as causal effects, a recurring tension in AI-and-writing commentary. |
| Novel | 3/5 | The structure (claim-by-claim screening with explicit limits) is standard; the novelty is in binding the conclusion to a deliberately small synthetic evidence base and refusing to paper over its gaps. |
| Ethical | 5/5 | No real participants are involved; the synthetic fixture discloses its limits and forbids fabrication of participants, effect sizes, ethics approvals, or citations. |
| Relevant | 4/5 | Useful to instructors and program designers who need to decide what the current evidence base can and cannot justify before revising policy or assessment design. |
| Average | 4.0/5 |  |

### Scope Boundaries

**In Scope:**

- The four `SYN-*` summaries in `benchmark/sources.yaml`: one classroom
  observation (`SYN-CLASSROOM-01`), one instructor interview summary
  (`SYN-INTERVIEW-02`), one student survey summary (`SYN-SURVEY-03`),
  one institutional policy excerpt (`SYN-POLICY-04`).
- Claim-level mapping between the working draft
  (`benchmark/partial-manuscript.md`) and the supplied sources, including
  the supported claim around outline revisions, the rejected workload
  claim, and any other claims introduced during synthesis.
- Explicit statements of what the supplied evidence does and does not
  support, with the limitation that drives the classification recorded
  alongside the claim.

**Out of Scope:**

- Any externally retrieved literature, real publication, or DOI.
- Effect sizes, statistical inferences, or causal generalisations the
  sources do not support.
- Fabricated participant counts, demographics, ethics approvals, or
  interview transcripts beyond what the summaries already state.
- Cross-institutional generalisation, or any claim that the policy
  excerpt represents sector practice.
- Any rewrite that recasts short-term classroom observations as general
  statements about generative AI in higher education.

**Key Assumptions:**

- The synthetic source summaries are read at face value for what they
  describe; their stated limits are part of the evidence, not a defect
  to argue away.
- The partial manuscript expresses the lead author's working claims, not
  facts the synthesizer must defend.
- The four-summary evidence base is treated as the entire evidence
  universe for this exercise; downstream nodes do not introduce external
  sources.

### Sub-questions

1. Which observable patterns in `SYN-CLASSROOM-01` are reproduced elsewhere
   in the synthetic set, and which are isolated to one introductory
   course?
2. Which components of instructor workload reported in
   `SYN-INTERVIEW-02` are directly tied to verification of
   student-produced AI text, and which can be separated from baseline
   feedback work?
3. Does `SYN-SURVEY-03` provide any observed-behaviour signal beyond the
   self-reported perception it discloses, and what policy or guidance
   change could close that gap?
4. How do the disclosure requirements in `SYN-POLICY-04` interact with
   the perceived uncertainty reported in `SYN-SURVEY-03` and the
   verification overhead in `SYN-INTERVIEW-02`?
5. Which unfilled gaps would have to be closed before the partial
   manuscript's draft claims could be restated with stronger strength?

### Sub-Question Bindings

- Sub-questions 1-4 inherit the parent scope (synthetic four-source
  evidence, no causal claims, no fabrication). No deviation requested.
- Sub-question 5 is a meta-question about claim strength rather than
  a new empirical question; it stays inside the parent's
  scope-boundary stance and produces only a gap inventory.

### Candidate Questions Considered

| # | Candidate | FINER Avg | Why not selected |
|---|---|---|---|
| 1 | "Does generative AI reduce instructor workload in university writing courses?" | 3.4 | Phrased as a causal claim that the supplied evidence cannot answer; the workload signal is self-reported and mixed with verification overhead. Promotes an unsupported generalisation. |
| 2 | "What observable changes appear in student writing when structured AI prompting is introduced?" | 3.6 | Asks a descriptive question that one source can partly answer but that the broader claim-level mapping question depends on; useful as a sub-question rather than the primary RQ. |
| 3 | "How do course-level disclosure rules and instructor-level acceptable-use definitions interact to shape student behaviour?" | 3.4 | Captures the policy-survey interaction but only spans two of the four sources and pulls the RQ toward policy analysis the partial manuscript does not centre. |
| 4 | "Across the supplied synthetic evidence set, which observable claims about generative AI in university writing instruction are supported, qualified, or contradicted, and what design constraints does the evidence impose on any downstream generalisation?" | 4.0 | Selected: it is answerable from the supplied evidence, maps cleanly to the partial manuscript's claims, refuses causal overreach, and surfaces design constraints as a deliverable. |

> Selection note: the chosen RQ is the one FINER score above any candidate
> that respects the synthetic-evidence boundary and aligns with the partial
> manuscript's claim-level structure. If the rq-gate prefers narrower or
> differently-centred wording, candidate 1-3 remain available without
> expanding the evidence base.
