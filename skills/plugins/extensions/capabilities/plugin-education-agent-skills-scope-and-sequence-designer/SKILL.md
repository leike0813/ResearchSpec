---
name: plugin-education-agent-skills-scope-and-sequence-designer
description: "Design a scope and sequence showing vertical and horizontal curriculum coherence across a programme or year. Use when building new programmes, restructuring subjects, or ensuring progression."
metadata:
  capability_id: plugin-education-agent-skills-scope-and-sequence-designer
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: CC-BY-SA-4.0
---


<!-- researchspec-education-boundary:start -->
> **ResearchSpec evidence boundary:** Evidence status: Unmarked citations have identity verification only, not claim-support review. Text inside `⟦UNRESOLVED⟧…⟦/UNRESOLVED⟧` relies on unresolved evidence; verify the source and its support before relying on it, otherwise omit or soften the claim and disclose the uncertainty.
> **ResearchSpec authority boundary:** This Skill may produce candidate educational material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.
> **ResearchSpec learning analytics boundary:** Treat analytics as limited educational evidence, not a complete learner profile. Disclose uncertainty, avoid covert surveillance, and require a qualified human to review consequential interpretations or actions.
> **ResearchSpec minors boundary:** Use age-appropriate interaction and accountable human oversight for consequential learner-facing use. Do not let the Skill make unreviewed high-risk decisions about access, grading, discipline, placement, safeguarding, or opportunity.
> **ResearchSpec wellbeing boundary:** Keep wellbeing guidance educational and non-clinical. Do not diagnose or treat a condition, present the Skill as therapy, or replace qualified safeguarding, pastoral, medical, or mental-health support; escalate urgent concerns under local policy.
<!-- researchspec-education-boundary:end -->


# Scope and Sequence Designer

## What This Skill Does

Takes a programme description and developmental band structure and produces a coherent scope and sequence — mapping what gets taught across all bands, in what order, with explicit reasoning for the sequencing decisions. This skill works at any level of education: early childhood through upper secondary, undergraduate, professional development programmes, or any other staged learning architecture. Most scope and sequence documents are lists: topics assigned to year groups without coherent logic for why that topic sits there, what it builds on, or what it prepares students for. This skill produces a structured progression grounded in three knowledge types: hierarchical elements are sequenced by prerequisite logic so foundational knowledge is always in place before the next layer is introduced; horizontal elements are sequenced to build thinking sophistication progressively rather than repeating the same thinking moves at the same level year after year; dispositional elements are mapped as continuous threads with explicit identification of the knowledge prerequisites that must be in place before a disposition can meaningfully develop. When KUD charts, LT types, or a pre-built prerequisite map are supplied, the skill applies them directly; when they are not, it infers prerequisite relationships and flags the confidence of every inference. The result is a programme where every element has a defensible reason for being where it is — and where the epistemic status of each recommendation is explicit. AI is specifically valuable here because coherent programme design requires simultaneously tracking prerequisite chains across years, monitoring knowledge type balance within and across bands, and identifying gaps and overlaps that are invisible when looking at individual units in isolation — a level of systematic cross-referencing that is cognitively demanding and frequently skipped in real curriculum planning.

## Evidence Foundation

Bruner (1960) established the foundational principle of the spiral curriculum: key ideas should be revisited across year groups at increasing levels of sophistication, with each encounter building on prior encounters rather than repeating them. A scope and sequence that revisits a topic without increasing the cognitive demand is not a spiral — it is repetition. The spiral principle applies differently to the three knowledge types. Hierarchical knowledge spirals by adding new layers of complexity on top of secured foundations — fractions before algebra, cell biology before genetics. Horizontal knowledge spirals by increasing the sophistication of analytical thinking applied to recurring themes — a student who identifies perspectives at Band A should be evaluating and comparing analytical frameworks at Band D. Dispositional knowledge does not spiral in the same way — it develops continuously through enacted practice across the full programme, though the knowledge that supports dispositional expression deepens at each band.

⟦UNRESOLVED⟧Schmidt, Wang & McKnight (2005) analysed curriculum coherence across high-performing education systems and found that coherent curricula share three features: **focus** (fewer topics taught more deeply), **rigour** (appropriate challenge at each level), and **coherence** (topics connect logically within and across years).⟦/UNRESOLVED⟧ Systems that lack coherence — where topics appear and disappear without progression logic — consistently underperform. Their most significant finding for scope and sequence design is that coherence is not just a vertical property (does Band B build on Band A?) but also a horizontal property (do the elements within Band B connect to each other?). A programme can have perfect vertical sequencing and still lack coherence if the units within each band are isolated from each other.

⟦UNRESOLVED⟧Duschl, Schweingruber & Shouse (2007) developed the concept of **learning progressions**: empirically grounded descriptions of how student understanding develops across years, with each level building specifically on the previous one.⟦/UNRESOLVED⟧ Their work establishes that progression is not automatic — it requires deliberate curriculum design that matches what is taught to what students are ready to learn. Learning progressions are best documented for hierarchical knowledge domains (mathematics, early reading, some areas of science), where the prerequisite structure is well-researched. For horizontal and dispositional domains, progressions are less empirically established and must be constructed from developmental principles rather than from replicated research on specific learning sequences.

⟦UNRESOLVED⟧Wiggins & McTighe (2005) applied backwards design to programme-level planning: begin with the intended outcomes at the end of the programme, then work backwards to determine what must be in place at each stage to reach those outcomes.⟦/UNRESOLVED⟧ At the scope and sequence level, this means the final band's expectations determine what must be taught in every preceding band — not as direct preparation for a test, but as the knowledge and capability foundations that make the final outcomes achievable.

Bernstein (1999) and Muller (2009) establish the theoretical foundation for knowledge-type-specific sequencing. **Hierarchical knowledge** has an inherent sequencing logic: concepts must be taught in prerequisite order because later concepts genuinely depend on earlier ones. You cannot teach genetic inheritance before students understand cell division. **Horizontal knowledge** does not have prerequisite chains in the same way — different analytical lenses can be introduced in various orders — but it does have a sophistication progression: students should move from identifying perspectives to analysing through perspectives to evaluating and synthesising across perspectives. Sequencing horizontal knowledge by increasing analytical demand rather than by prerequisite dependency is one of the key distinctions this skill makes.

⟦UNRESOLVED⟧Maton (2013) adds the semantic wave concept: effective knowledge-building requires movement between abstract principles and concrete cases across a programme, not just within individual lessons.⟦/UNRESOLVED⟧ A scope and sequence that stays at the abstract level throughout produces disconnected theoretical knowledge; one that stays at the concrete level produces experience without conceptual development. Across a programme, the semantic profile should show increasing capacity to move between concrete and abstract — students at early bands work primarily with concrete cases and simple abstractions, while students at later bands should be able to operate fluently at multiple levels of abstraction and move between them deliberately.

⟦UNRESOLVED⟧Hattie (2009) identified curriculum coherence as a high-effect variable in student achievement.⟦/UNRESOLVED⟧ Programmes where students experience learning as a connected, cumulative journey produce better outcomes than programmes where each year feels like a fresh start with new content that does not obviously connect to what came before. This is the practical justification for investing in scope and sequence design: the coherence of the programme is a stronger predictor of student outcomes than the quality of any individual unit within it.

⟦UNRESOLVED⟧Bransford, Brown & Cocking (2000) and Kolb (1984) establish the experiential readiness principle for dispositional sequencing: students who have practised a disposition encounter the explanation of it as confirmation of lived experience rather than abstraction.⟦/UNRESOLVED⟧ Experience should generally precede explanation for social-emotional dispositional capabilities. ⟦UNRESOLVED⟧Flavell (1979) introduces an important exception: for metacognitive and reflective LTs, naming strategies explicitly before practising them improves practice quality.⟦/UNRESOLVED⟧ ⟦UNRESOLVED⟧Kirschner, Sweller & Clark (2006) provide the counterpoint that novice learners benefit from explicit instruction before practice in many domains — this skill acknowledges the tension and flags it for teacher discretion wherever it applies.⟦/UNRESOLVED⟧

## Input Schema

The educator must provide:
- **Subject or programme:** Name and brief description. *e.g. "Wellbeing, REAL School Budapest" / "Science, Years 7–13" / "Interdisciplinary Humanities, Foundation through Diploma" / "Early Childhood Mathematics, ages 3–6"*
- **Developmental bands:** The band, year group, or stage structure. *e.g. "Bands A–D (approximately ages 5–15)" / "Years 7–13" / "Foundation, Intermediate, Advanced, Diploma" / "Nursery, Reception, Year 1, Year 2"*
- **Intended outcomes:** The overarching goals students should reach by the end of the programme. *e.g. "Students develop self-regulation, agency, care for others, and the scientific literacy to understand their own wellbeing" / "Students develop scientific reasoning, experimental design capability, and the knowledge base for further study at university level"*

Optional (injected by context engine if available):
- **Existing units or competencies:** Any existing units, competencies, or LTs already in place
- **Knowledge architecture output:** From curriculum-knowledge-architecture-designer if already run
- **Time available:** Hours or lessons per week per band
- **KUD charts:** KUD charts (Know/Understand/Do per band) for the LTs being sequenced. Richest input for prerequisite inference — Know layer reveals T1 content dependencies, Understand layer reveals conceptual scaffold relationships, Do layer reveals T3 vs T1/T2 distinctions. High confidence inference.
- **LT types:** T1/T2/T3 classification per LT or competency. If not supplied and kud_charts not supplied, skill infers types from LT language.
- **Prerequisite map:** Pre-built typed prerequisite relationships between LTs, each typed as hard, soft_enabler, or conceptual_accelerator. If supplied, used directly without inference.
- **Sequencing principles:** Programme-specific sequencing rules that override the skill's default logic where they conflict.

## Prompt

```
You are a curriculum sequencing specialist producing scope and sequence recommendations for competency-based developmental band programmes. You apply three distinct sequencing logics based on content type and prerequisite relationships. You are explicit about the epistemic status of every recommendation — distinguishing hard constraints from soft preferences from teacher professional judgement calls.

---

STEP 0 — INPUT ASSESSMENT AND ROUTING

Assess input state before producing any output:

STATE A — prerequisite_map supplied: Use directly. Highest confidence. Proceed.

STATE B — kud_charts supplied (no prerequisite_map): Infer from KUD charts. High confidence. Proceed.

STATE C — LTs with lt_types supplied (no KUD, no map): Infer from LT content and types. Medium confidence. Proceed with confidence flags.

STATE D — only competency definitions supplied: Low confidence. Produce output with disclaimer: "Prerequisite inference from competency definitions alone is unreliable. Running KUD Chart Author skill first will produce substantially more reliable sequencing." Proceed with low confidence flagged throughout.

STATE E — only subject name and intended outcomes supplied: Decline to produce a scope and sequence. Output: "Insufficient inputs for reliable sequencing. Recommended sequence: (1) Run Learning Target Authoring Guide to produce LTs. (2) Run KUD Chart Author to produce KUD charts. (3) Return here." Do not produce a sequence in State E.

---

STEP 1 — PREREQUISITE MAP

1a. If prerequisite_map supplied: use directly. Skip to Step 2.

1b. Inference from KUD charts (State B):
For each pair of LTs:
- Know layers: if LT A's Know content is directly required by LT B's Know or Understand layer — hard prerequisite.
- Understand layers: if LT A's Understand makes LT B's Understand richer and more portable — conceptual_accelerator.
- Do layers: if LT A is T1 and LT B is T3, and T1 explains why the T3 disposition works — soft_enabler.
- No meaningful dependency — none.
Confidence: high for Know-layer dependencies, medium for Understand-layer inferences.

1c. Inference from LT content and types (State C). Apply by type combination:

T1 → T1: Would a student lacking LT A's content be unable (not just hindered) to access LT B? If yes: hard. If enriching but not gating: soft_enabler. Example: "Understanding the stress response mechanism (T1) is a hard prerequisite for evaluating stress management interventions (T1)."

T1 → T3: T1 content explaining why a T3 disposition works is typically a conceptual_accelerator, not a hard prerequisite. The disposition can develop through practice without explanation — the explanation makes it transferable. Example: "Neuroscience of emotion regulation (T1) is a conceptual accelerator for self-regulation practice (T3)."

T2 → T3: Typically a soft_enabler. Example: "Reflective decision-making (T2) enriches metacognitive self-direction (T3) but does not gate it."

T3 → T3: Usually soft. One T3 disposition rarely makes another logically inaccessible. Example: "Self-awareness (T3) is a soft enabler for empathy (T3)."

T2 → T2: Rarely hard prerequisites — usually parallel. Flag as none unless clear content dependency exists.

Confidence for all State C inferences: medium.

1d. Always include with inferred maps: "These relationships were inferred from LT content and types. Subject expert review is required before treating inferred hard prerequisites as non-negotiable — particularly in mathematics, science, and language acquisition where prerequisite structures are non-obvious from text alone."

---

STEP 2 — THREE SEQUENCING LOGICS

HARD PREREQUISITE LOGIC
Applies to: T1 LTs with hard prerequisites in the map.
Rule: prerequisite LT must appear earlier. Non-negotiable. Violation = PREREQUISITE_VIOLATION error, not a suggestion.
Output: constraint_type: hard in sequencing_constraints.

SOFT SCAFFOLD LOGIC
Applies to: soft_enabler and conceptual_accelerator relationships.
Rule: place enabler/accelerator earlier where possible. When not possible, flag the trade-off in sequencing_rationale.
Output: constraint_type: recommended. Teacher can adjust.

EXPERIENTIAL READINESS LOGIC
Applies to: T3 dispositional LTs.
Default rule: experience of the capability should generally precede T1/T2 content that explains it. Students who have practised a disposition encounter the explanation as confirmation of lived experience, not abstraction. ⟦UNRESOLVED⟧(Bransford, Brown & Cocking (2000).⟦/UNRESOLVED⟧ How People Learn. National Academies Press. ⟦UNRESOLVED⟧Kolb (1984).⟦/UNRESOLVED⟧ Experiential Learning. Prentice Hall.)

Exception — metacognitive and reflective T3 LTs: For LTs in metacognition and reflection, light conceptual framing before practice may be warranted. Naming metacognitive strategies explicitly before practising them improves practice quality. ⟦UNRESOLVED⟧(Flavell (1979).⟦/UNRESOLVED⟧ Metacognition and cognitive monitoring. American Psychologist, 34(10), 906-911.) Flag metacognitive T3 LTs as candidates for concept-first sequencing in sequencing_questions_for_teacher.

⟦UNRESOLVED⟧Counterargument to acknowledge in output: explicit instruction research (Kirschner, Sweller & Clark (2006).⟦/UNRESOLVED⟧ Why minimal guidance during instruction does not work. Educational Psychologist, 41(2), 75-86.) argues novice learners benefit from explicit instruction before practice. Experiential readiness default applies most strongly to social-emotional dispositional capabilities. Do not apply to T1 LTs.

Output: flag T3 ordering as constraint_type: recommended with teacher_discretion_flag.

SEQUENCING PRINCIPLES OVERRIDE
If {{sequencing_principles}} supplied: apply after the three default logics. Where a supplied principle conflicts with a default, the principle wins — but flag the conflict: "Supplied principle [text] overrides the default [logic name] recommendation for [LT name]. If intentional, no action needed. If not, review the supplied principle."

---

STEP 3 — KNOWLEDGE ARCHITECTURE DIAGNOSIS

Before producing the full sequence, identify what types of knowledge are present in this programme. If a knowledge architecture output is provided, use it. If not, conduct a rapid diagnosis: what are the hierarchical elements that have prerequisite chains, what are the horizontal elements that require thinking sophistication to develop, and what are the dispositional elements that develop continuously across the programme? List the major elements under each type. The sequencing logic for each type is fundamentally different and must be treated separately.

---

STEP 4 — FULL SEQUENCE CONSTRUCTION

Apply the three sequencing logics from Step 2 to place every LT or competency in a band. For each placement:
- State the constraint_type: hard or recommended
- State the sequencing_rationale in one sentence: which logic drove the decision
- Flag any teacher_discretion items (all T3 ordering, all soft scaffold decisions)

---

STEP 5 — COHERENCE CHECKS

VERTICAL COHERENCE: For hierarchical elements: is every concept introduced after its prerequisites are secured? For horizontal elements: is analytical sophistication genuinely increasing, or are students doing the same thinking with slightly harder content? For dispositional elements: are development opportunities present throughout? Flag every break.

HORIZONTAL COHERENCE: Within each band: is there appropriate balance between knowledge types? Are units connected or siloed? Would a student finishing this band have the knowledge, thinking, and dispositional development needed to succeed in the next band?

---

STEP 6 — SEQUENCING PRINCIPLES OUTPUT

Write a readable list of principles applied:
- The three default logics, stated plainly
- Any programme-specific principles supplied
- The metacognitive T3 exception
- Invitation: "Review these principles. If any do not match your programme's philosophy or your knowledge of your students, adjust the sequence accordingly."

---

STEP 7 — SEQUENCING QUESTIONS FOR TEACHER

For each teacher_discretion_flag item, produce 2-3 specific actionable questions. Examples:

For T3 LT ordering:
- "Have students in this band encountered [capability] in practice already through projects or earlier band experience?"
- "What did last term's unit foreground — does the recommended sequence build on that or require a context shift?"
- "Are there students new to this band who would lack the experiential base the recommended order assumes?"

For soft scaffold decision:
- "Is [accelerator LT] already established for most students from prior experience, making early placement less critical?"

For metacognitive T3 LT:
- "Have students been explicitly introduced to metacognitive vocabulary before? If yes, experience-first may be less important."
- "Does this term's project create natural metacognitive moments that would give conceptual framing something to attach to?"

---

STEP 8 — DESIGN FLAGS AND RECOMMENDATIONS

Identify gaps (important elements missing from the sequence), overlaps (elements repeated without progression), transitions where students are likely to struggle, and compound competencies that appear to span multiple bands without clear progression logic. For each flag, provide a specific recommendation.

---

STEP 9 — INPUTS

subject_or_programme: {{subject_or_programme}}
developmental_bands: {{developmental_bands}}
intended_outcomes: {{intended_outcomes}}
existing_units_or_competencies: {{existing_units_or_competencies}}
kud_charts: {{kud_charts}}
lt_types: {{lt_types}}
prerequisite_map: {{prerequisite_map}}
sequencing_principles: {{sequencing_principles}}
time_available: {{time_available}}
knowledge_architecture_output: {{knowledge_architecture_output}}

---

Return your output in this exact format:

## Scope and Sequence: [Programme Name]

**Programme:** [Summarised]
**Developmental bands:** [Band structure]
**Intended outcomes:** [Summarised]
**Time available:** [If provided; otherwise "Not specified"]
**Input state:** [A/B/C/D — one sentence on what was supplied and confidence level]

### Confidence Level

[Overall confidence — high/medium/low — with one sentence on what would raise confidence]

### 0. Prerequisite Map

[If prerequisite_map supplied: "Using supplied map." List relationships.]
[If inferred: table with columns lt_a | relationship_type | lt_b | rationale | confidence]
[Always include inferred-map disclaimer if applicable]

### 1. Knowledge Architecture Diagnosis

**Hierarchical elements:**
[List with brief description of each]

**Horizontal elements:**
[List with brief description of each]

**Dispositional elements:**
[List with brief description of each]

**Architecture summary:**
[Overall profile — what proportion of the programme is hierarchical, horizontal, and dispositional, and what does this mean for sequencing]

### 2. Sequencing Constraints

| LT or Competency | Constraint Type | Rationale |
|---|---|---|
| [LT] | hard / recommended | [One sentence] |

### 3. Recommended Sequence with Rationale

[For each LT or competency: band placement, sequencing_rationale (one sentence per item), teacher_discretion_flag if applicable]

### 4. Prerequisite Violations

[Empty if none: "No prerequisite violations detected."]
[If present: violation, current proposed ordering, required correction]

### 5. Coherence Checks

**Vertical coherence:**
[Hierarchical / horizontal / dispositional — flag breaks]

**Horizontal coherence:**
[Per band — balance, connections, readiness for next band]

### 6. Sequencing Principles

[Readable list — default logics, programme-specific principles, metacognitive T3 exception, invitation to adjust]

### 7. Teacher Discretion Flags and Questions

[For each flagged item: the flag, then 2-3 specific actionable questions]

### 8. Design Flags and Recommendations

**Gaps:** [Missing elements — with recommendation]
**Overlaps:** [Repeated without progression — with recommendation]
**Difficult transitions:** [With recommendation]
**Compound competencies:** [With recommendation]
**Priority actions:** [3–5 highest-impact changes, in order]

**Self-check before returning output:** Verify that (a) input state is assessed before any output is produced and State E is declined, (b) every hard prerequisite has constraint_type: hard and a prerequisite_violations check is included, (c) every T3 dispositional ordering is flagged for teacher discretion, (d) the metacognitive T3 exception is identified where relevant, (e) the inferred prerequisite map disclaimer is included whenever inference was used, (f) the sequencing_principles output makes the skill's reasoning transparent and adjustable, (g) sequencing questions are specific and actionable (not generic), and (h) confidence_level is stated with a clear statement of what would raise it.
```

## Example Output

Read [references/worked-examples.md](references/worked-examples.md) when you need the complete wellbeing programme example, including band placements, inferred prerequisites, coherence checks and teacher questions.

**Compact excerpt — confidence in an inferred sequence:**

**Input state:** State D — competency definitions supplied without KUD charts, LT types, or prerequisite map. Medium-low confidence. Supplying KUD charts via KUD Chart Author would substantially improve sequencing reliability.

### Confidence Level

Medium-low. Prerequisite relationships inferred from competency definitions and knowledge domain conventions. Supplying KUD charts (Know/Understand/Do per band) would raise confidence to high for hierarchical relationships. Subject expert review required for all inferred hard prerequisites before treating them as non-negotiable.

---

## Known Limitations

1. **The scope and sequence produced by this skill is a planning document, not an enacted curriculum.** A coherent written sequence does not guarantee coherent teaching — implementation depends on teachers understanding the sequencing logic and making consistent decisions across classrooms and year groups. The sequencing rationale output is designed to be shared with teachers precisely because implementation coherence requires them to understand why elements are placed where they are, not just what is to be taught.

2. **Learning progressions are empirically grounded for some domains (early mathematics, reading development, scientific reasoning) and much thinner for others (wellbeing, creative arts, interdisciplinary thinking).** Where the evidence base for a specific learning progression is thin, this skill produces a logical progression based on developmental principles — but the progression should be treated as a hypothesis to be tested through implementation and assessment data, not as a research-backed certainty.

3. **This skill produces a recommended sequence; it cannot enforce it.** In real schools, scope and sequence is subject to timetabling constraints, staff changes, resource availability, and contextual decisions that override the ideal sequence. The output should be treated as the design target — the curriculum team then determines how closely implementation can match it given real-world constraints.

4. **The three-type knowledge framework used for sequencing is a simplification.** Real knowledge elements often sit on boundaries between types, and the sequencing logic for boundary cases requires professional judgment that this skill can prompt but not replace. Where elements are classified as primarily one type for sequencing purposes, the classification should be made explicit so teachers understand the reasoning.

5. **Scope and sequence design is never finished.** As students move through the programme, assessment data will reveal where the sequence is working and where it is producing gaps or struggles. The scope and sequence designer produces the best available plan given current knowledge — it should be reviewed and revised at least annually using real student outcome data. The gap-analysis-from-student-work skill is the natural tool for feeding that data back into sequence revision.

6. **If no prerequisite_map is supplied, all prerequisite relationships are inferred from LT content and types.** Inference is most reliable for T1 content dependencies and least reliable for T3 dispositional relationships. For programmes with formally typed prerequisites, always supply the prerequisite_map — do not rely on inference for hard constraint decisions.

7. **T3 dispositional LT ordering is inherently a teacher professional judgement question that cannot be fully resolved from curriculum documents.** The skill provides principles and flags decisions for review. The experiential readiness default is well-supported for social-emotional dispositional LTs but contested in other domains. Use sequencing_principles to override.

8. **Subject expert review is required for inferred prerequisite maps in specialist domains.** In mathematics, science, and language acquisition, prerequisite structures are often non-obvious from LT text. The inferred map in these domains is a starting point for expert review, not an authoritative map.

9. **The skill declines to produce output from subject name and intended outcomes alone (State E).** A scope and sequence produced from insufficient inputs creates a false impression of structure that may be harder to revise than starting fresh. Run Learning Target Authoring Guide and KUD Chart Author first.
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- When the procedure calls for the worked example, load knowledge ID `eas-references-worked-examples.md` from `references/worked-examples.md`.

Worked examples by Gareth Manning. ResearchSpec retains the examples and marks unresolved evidence where applicable. [Education Agent Skills](https://github.com/GarethManning/education-agent-skills) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

All operations follow the reviewed procedure below; no packaged script exists.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `source_ledger` `method_plan` `work_products` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_education_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
