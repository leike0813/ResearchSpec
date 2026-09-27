# Revised Discussion (Draft)

> TEST FIXTURE — NOT A REAL MANUSCRIPT
> Revises the `Preliminary findings` portion of the partial manuscript against the supplied synthetic sources (`sources.yaml`) and claim registry (`claims.yaml`). No external evidence, no fabricated effects, no scope expansion. Where a claim is not supported by the supplied evidence it is retained as an explicit gap, not softened into a finding.

## Working title (unchanged)

Generative AI in University Writing Instruction: Opportunities, Friction, and Evidence Limits

## What the supplied evidence actually shows

The synthetic corpus contains four single-scope items (`SYN-CLASSROOM-01`, `SYN-INTERVIEW-02`, `SYN-SURVEY-03`, `SYN-POLICY-04`) and three pre-registered claims (`CLM-01` tentative, `CLM-02` unsupported as written, `CLM-03` hypothesis only). Each item carries its own scope limit; nothing in the corpus aggregates across institutions, courses, or time.

- `CLM-01` — Structured prompting coincided with more visible outline revisions in one first-year writing course over six weeks. The source itself flags: no comparison group, no validated measure of writing improvement, and the same instructor designed every prompt. **Tentative** is the right strength: revision activity is observable, writing quality is not.
- `CLM-02` — "Generative AI reduces instructor workload" is **not** what `SYN-INTERVIEW-02` reports. The interview summary reports faster formative feedback *and* added time spent checking unsupported claims, based on five self-reported instructors at one institution with no time logs. Both effects are in tension; a net workload reduction is an interpretation, not a measurement, and is therefore unsupported as written.
- `CLM-03` — Linking "clear disclosure guidance" to "fewer student uncertainties" is a **hypothesis**, not an observation. `SYN-SURVEY-03` records attitudes from 84 voluntary respondents under a changing local policy; `SYN-POLICY-04` records that disclosure is required but acceptable assistance is delegated to instructors. The two sources do not jointly demonstrate the association — they describe a policy structure and a self-reported attitude snapshot, taken at different layers.

## What this means for the discussion section

1. **Frame findings as observations of single settings, not effects.** The classroom, interview, and survey each sit in one institution. A discussion that opens with "across higher education…" over-reads the corpus and should instead name the scope at the start of each subsection.
2. **Keep the revision-activity result separate from the quality claim.** `CLM-01` supports observable process change; it does not support a quality claim. The discussion should explicitly say "process, not quality" so reviewers do not have to enforce the distinction themselves.
3. **Split the workload story into a tradeoff.** The honest summary of `SYN-INTERVIEW-02` is two-sided: time saved on drafting formative feedback, time added on verification. A one-line "reduces workload" sentence is not faithful to the source and would only appear if a comparison-group study is added.
4. **Treat the policy/uncertainty link as a design question, not a finding.** `CLM-03` is retained as a hypothesis worth designing a study around — e.g., comparing uncertainty rates before and after a disclosure change — not as evidence that current policy is already working.
5. **Surface alternative explanations that the supplied evidence cannot rule out.** Even within the reported scopes, plausible alternatives are not eliminated by the corpus, including:
   - The visible outline revisions in `SYN-CLASSROOM-01` may reflect instructor prompting style rather than AI use per se (all prompts were instructor-supplied).
   - The instructor interviews are self-reported and convenience-sampled; "verification time" is a felt workload, not a logged one.
   - Voluntary response bias in `SYN-SURVEY-03` may over-represent students who already feel confident about AI use.

## Calibration relative to the partial manuscript

The partial manuscript already downgrades `CLM-02` ("not supported by the supplied evidence") and keeps `CLM-01` tentative. This revision keeps both moves and extends them in three ways that the original draft left implicit:

- It separates the *evidence-supported* observation (`CLM-01`) from the *evidence-supported* tradeoff (`SYN-INTERVIEW-02`) and shows that the two are different claims at different strengths.
- It makes `CLM-03`'s status as a hypothesis explicit in prose, not only in the registry.
- It lists alternative explanations that a downstream Methods section will need to address, without inventing effect sizes or comparison groups.

Nothing in this revision introduces a new claim, a new source, or a scope change. Items the original draft marks as missing (methods, policy variation, alternative explanations, conclusion) remain missing; this revision only restates what the discussion can already defend from the supplied evidence.

## Open items preserved for the next iteration

- The "faster feedback" wording in `SYN-INTERVIEW-02` is qualitatively supported but not quantified; any quantitative restatement would require a new source.
- The interaction between `SYN-POLICY-04` (course-level disclosure required) and `SYN-SURVEY-03` (uncertainty about acceptable use) is observational at best; reporting it as an association would over-claim.
- The manuscript's stated working title already signals "Evidence Limits"; the conclusion section should operationalise that phrase by listing exactly which limits apply to which claim, not by gesturing at "more research is needed".
