---
name: plugin-education-agent-skills-formative-assessment-technique-selector
description: "Select the right formative assessment technique for a specific learning moment, purpose, and age group. Use when choosing how to check understanding during, between, or after lessons."
metadata:
  capability_id: plugin-education-agent-skills-formative-assessment-technique-selector
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: CC-BY-SA-4.0
---


<!-- researchspec-education-boundary:start -->
> **ResearchSpec evidence boundary:** Evidence status: Unmarked citations have identity verification only, not claim-support review. Text inside `⟦UNRESOLVED⟧…⟦/UNRESOLVED⟧` relies on unresolved evidence; verify the source and its support before relying on it, otherwise omit or soften the claim and disclose the uncertainty.
> **ResearchSpec authority boundary:** This Skill may produce candidate educational material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.
> **ResearchSpec minors boundary:** Use age-appropriate interaction and accountable human oversight for consequential learner-facing use. Do not let the Skill make unreviewed high-risk decisions about access, grading, discipline, placement, safeguarding, or opportunity.
<!-- researchspec-education-boundary:end -->


# Formative Assessment Technique Selector

## What This Skill Does

Selects the most appropriate formative assessment technique for a specific learning moment — during instruction, after guided practice, at the end of a lesson, or between lessons — and provides a complete implementation guide including how to interpret the responses and what to do next based on what the data shows. Unlike generic lists of formative assessment ideas, this skill matches the technique to the specific moment, purpose, and practical constraints. A technique that works brilliantly at the end of a lesson (exit ticket) is useless during a teacher explanation; a technique that works for checking factual recall (mini-whiteboards) is inappropriate for checking deep understanding (which requires explanation, not single answers). AI is specifically valuable here because selecting the right technique requires matching the assessment purpose (what am I checking?), the timing (when in the lesson?), the response format (do I need quick data from everyone, or deep data from a few?), and the practical constraints (class size, resources, time).

## Evidence Foundation

Black & Wiliam (1998) established formative assessment as one of the highest-leverage interventions in education (effect size 0.4–0.7), but crucially defined it by its function, not its form: assessment is formative only when the evidence is used to adapt teaching. Giving an exit ticket and not reading it until the next day is not formative assessment — it's delayed summative assessment. Wiliam (2011) operationalised formative assessment into five key strategies: clarifying intentions, engineering discussions, providing feedback, activating students as resources for each other, and activating students as owners of their learning. ⟦UNRESOLVED⟧Leahy et al. (2005) translated these strategies into practical classroom techniques, emphasising that formative assessment must be embedded in instruction — not bolted on.⟦/UNRESOLVED⟧ Heritage (2010) distinguished between planned formative assessment (designed into the lesson in advance) and interactive formative assessment (responsive, in-the-moment), arguing that both are necessary but serve different purposes. ⟦UNRESOLVED⟧Wiliam & Leahy (2015) provided comprehensive implementation guidance, emphasising that the best techniques collect evidence from ALL students, not just volunteers.⟦/UNRESOLVED⟧

## Input Schema

The teacher must provide:
- **Learning moment:** When in the sequence. *e.g. "During my explanation of how to add fractions with unlike denominators — I need to check before moving on" / "After students have completed 5 practice problems independently" / "End of the lesson — I need to know who's got it and who hasn't" / "Start of next lesson — checking retention from yesterday"*
- **What to assess:** The specific thing to check. *e.g. "Can students identify the common denominator?" / "Do students understand why the character made that decision?" / "Can students apply the formula to a new context?"*
- **Student level:** Year group. *e.g. "Year 7"*

Optional (injected by context engine if available):
- **Class size:** Number of students
- **Subject area:** The curriculum subject
- **Student profiles:** EAL, confidence levels, specific needs
- **Available resources:** Equipment available

## Prompt

```
⟦UNRESOLVED⟧You are an expert in formative assessment and responsive teaching, with deep knowledge of Black & Wiliam's (1998) research on assessment for learning, Wiliam's (2011) five key strategies, Leahy et al.'s (2005) practical techniques, and Heritage's (2010) distinction between planned and interactive formative assessment.⟦/UNRESOLVED⟧ You understand that formative assessment is defined by its FUNCTION (using evidence to adapt teaching), not its FORM (any particular technique) — and that the right technique depends on the specific learning moment, the type of understanding being assessed, and the practical constraints.

Your task is to select formative assessment techniques for:

**Learning moment:** {{learning_moment}}
**What to assess:** {{what_to_assess}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Class size:** {{class_size}} — if not provided, assume 25–30 students.
**Subject area:** {{subject_area}} — if not provided, infer from the assessment focus.
**Student profiles:** {{student_profiles}} — if not provided, assume a mixed-ability class with some EAL students and some reluctant participants.
**Available resources:** {{available_resources}} — if not provided, assume mini-whiteboards are available but no technology.

Apply these evidence-based principles:

1. **Every student, not just volunteers (Wiliam, 2011):**
   - The technique must collect evidence from ALL students, not just those who raise their hands.
   - "Hands up" is NOT formative assessment — it only tells you about the 5–6 students who volunteer. It tells you nothing about the other 20–25.
   - Techniques that collect data from every student: mini-whiteboards, exit tickets, finger voting, all-student response systems, think-pair-share with reporting.

2. **Match technique to purpose (Heritage, 2010):**
   - **Checking factual knowledge:** Quick-response techniques — mini-whiteboards, finger voting, true/false cards. Speed matters; depth doesn't.
   - **Checking understanding:** Explanation-based techniques — think-pair-share, exit tickets with reasoning, hinge questions with diagnostic distractors. Depth matters; speed is secondary.
   - **Checking application:** Task-based techniques — practice problems with monitoring, worked examples with a gap, mini-tasks. Observation of process matters.
   - **Checking misconceptions:** Diagnostic techniques — hinge questions with misconception-targeted distractors, deliberate error identification tasks.

3. ⟦UNRESOLVED⟧**Match technique to timing (Leahy et al., 2005):**⟦/UNRESOLVED⟧
   - **During instruction (real-time):** Must be fast (under 60 seconds), non-disruptive, and provide immediate data. Mini-whiteboards, finger voting, traffic lights.
   - **After guided practice:** Must reveal whether students can apply independently. Quick practice problem, show-me task, partner explanation.
   - **End of lesson:** Must capture what students are leaving with. Exit ticket (3–5 minutes), summary task, one-sentence explanation.
   - **Between lessons:** Must check retention and inform the next lesson. Retrieval quiz at start of next lesson, homework analysis.

4. **Interpret and act (Black & Wiliam, 1998):**
   - The technique is only formative if the teacher USES the data to adapt teaching.
   - For each technique, provide: what response patterns mean, and what to DO based on each pattern.
   - 80%+ correct → proceed. 50–80% → brief re-teach. Below 50% → significant reteach needed.

5. **Avoid pseudo-formative assessment:**
   - "Thumbs up if you understand" is NOT formative assessment — students cannot accurately self-assess understanding in the moment, and social pressure ensures most thumbs go up.
   - "Any questions?" is NOT formative assessment — students who don't understand often don't know what to ask.
   - The technique must require students to DEMONSTRATE understanding, not just claim it.

Return your output in this exact format:

## Formative Assessment: [What's being assessed]

**Moment:** [When in the lesson]
**Assessing:** [Specific understanding/skill]
**For:** [Student level]

### Recommended Techniques

For each technique (2–3, ranked):

**Technique [N]: [Name]**
**How it works:** [Step-by-step implementation]
**Time required:** [Minutes]
**Why this technique for this moment:** [Specific rationale]
**What to look for:** [Specific responses that indicate understanding vs. confusion]

### Response Interpretation Guide

**If 80%+ demonstrate understanding:** [What to do]
**If 50–80% demonstrate understanding:** [What to do]
**If below 50%:** [What to do]
**If you see [specific common error]:** [What it means and what to do]

### Common Mistakes with These Techniques

[2–3 ways the technique can fail and how to prevent it]

**Self-check before returning output:** Verify that (a) the recommended technique collects data from ALL students, (b) the technique is matched to the specific learning moment and purpose, (c) the implementation guide is specific enough for a teacher to use immediately, (d) the response interpretation includes specific actions, and (e) no recommended technique relies on volunteers or self-report.
```

## Example Output

**Scenario:** *Learning moment: "I've just finished explaining how to calculate the area of a triangle (base × height ÷ 2). I've shown two worked examples. Before I set practice problems, I need to check whether students understand the method well enough to try independently." / What to assess: "Can students correctly calculate the area of a triangle when given the base and height?" / Student level: "Year 7" / Subject area: "Mathematics" / Available resources: "Mini-whiteboards available"*

---

## Formative Assessment: Area of a Triangle Calculation

**Moment:** After teacher explanation and worked examples, before independent practice
**Assessing:** Can students correctly calculate the area of a triangle when given base and height?
**For:** Year 7 Mathematics

### Recommended Techniques

**Technique 1: Mini-Whiteboard Show-Me (Recommended)**
**How it works:**
1. Display a triangle with base = 8cm, height = 5cm on the board.
2. Say: "Calculate the area of this triangle. Show your working on your whiteboard. You have 60 seconds."
3. After 60 seconds: "3, 2, 1, show me." All students hold up whiteboards simultaneously.
4. Scan the room. Look for the correct answer (20cm²) and the working.
5. If time allows, repeat with a second triangle (different numbers) to confirm.

**Time required:** 2–3 minutes (including the follow-up problem)
**Why this technique for this moment:** This is a procedural check — can students apply a formula correctly? Mini-whiteboards are ideal because they collect data from every student simultaneously, they show WORKING (not just answers), and they provide instant feedback. The "3, 2, 1, show me" protocol prevents students from copying — everyone reveals at the same time.
**What to look for:**
- Correct answer with correct working (20cm²: 8 × 5 = 40, 40 ÷ 2 = 20) → student is ready for practice
- Answer of 40cm² → student multiplied but forgot to divide by 2
- Answer of 13cm² → student added instead of multiplied (8 + 5 = 13)
- Blank whiteboard or random number → student doesn't know where to start — didn't understand the worked examples

**Technique 2: Finger Voting on a Hinge Question**
**How it works:**
1. Display: "A triangle has a base of 6cm and a height of 4cm. What is the area?"
   A) 10cm²    B) 12cm²    C) 24cm²    D) 20cm²
2. Say: "Think about this. Do NOT call out. When I say go, hold up fingers: 1 for A, 2 for B, 3 for C, 4 for D."
3. "3, 2, 1, show me." Scan the room.

**Time required:** 1–2 minutes
**Why this technique for this moment:** Faster than whiteboards. The distractors are diagnostic: A (10) = added instead of multiplied; B (12) = correct; C (24) = multiplied but didn't divide by 2; D (20) = common plausible wrong answer. Each wrong answer reveals a specific error.
**What to look for:**
- Fingers showing 2 (B, correct: 12cm²) → student understands the method
- Fingers showing 3 (C, 24cm²) → student multiplied correctly but didn't halve — most common error
- Fingers showing 1 (A, 10cm²) → student added base and height instead of multiplying

**Technique 3: Partner Explain (for checking deeper understanding)**
**How it works:**
1. "Turn to your partner. Person A: explain to Person B how to calculate the area of a triangle. Don't just say the answer — explain the METHOD. Person B: listen and check — are they correct?"
2. After 60 seconds: "Person B — put your hand up if Person A explained it correctly."
3. Cold-call 2–3 Person B students: "What did your partner say?"

**Time required:** 3–4 minutes
**Why this technique for this moment:** Use this if you want to check whether students can EXPLAIN the method, not just apply it. Explaining to a peer reveals deeper understanding than calculating an answer. However, it's slower and provides less precise data than whiteboards.
**What to look for:** Can students articulate "multiply the base by the height, then divide by 2" — or do they say "I just did 8 times 5 divided by 2" without understanding why? Listen for whether they can explain the ÷ 2 step: "because a triangle is half of a rectangle."

### Response Interpretation Guide

**If 80%+ get the correct answer (Technique 1 or 2):** Proceed to independent practice. Students are ready. Set 6–8 problems with increasing difficulty (including triangles where the height is not a vertical line from the base — this is the next common difficulty).

**If 50–80% get the correct answer:** Identify the most common error. If most errors are "forgot to ÷ 2" (answer of 40 or 24): brief 2-minute re-teach. "I can see many of you multiplied correctly but forgot one step. Look — a triangle is HALF of a rectangle. So the area is HALF of base times height. Watch me do one more." Re-do one example emphasising the ÷ 2, then re-check with whiteboards.

**If below 50% get the correct answer:** Do NOT proceed to practice — students will practise the wrong method and embed errors. Return to the explanation. "I can see many of you are unsure. That's fine — this is tricky. Let me show you again from the start." Re-teach using a different representation (e.g., cut a rectangle in half diagonally to show that the triangle is half the rectangle). Then re-check.

**If you see "added instead of multiplied" (answer of 13 or 10):** This student has confused the area formula with the perimeter concept. They need clarification: "Area is the space INSIDE the shape — we multiply to find how many square centimetres fit inside. Perimeter is the distance AROUND the outside — that's when we add."

### Common Mistakes with These Techniques

1. **Allowing students to show whiteboards at different times.** If students reveal answers one by one, later students copy earlier ones. The "3, 2, 1, show me" simultaneous reveal is essential — it prevents copying and gives you an honest snapshot of the whole class.

2. **Only looking at the answer, not the working.** A student who writes "20cm²" has the right answer, but did they calculate 8 × 5 ÷ 2, or did they guess? Looking at the working distinguishes genuine understanding from lucky guesses. On whiteboards, require working to be shown.

3. **Asking "Does everyone understand?" after the check.** If the whiteboard data shows 85% correct, proceed. Don't undermine the data by then asking a question that will always get "yes." Trust the evidence over self-report.

---

## Known Limitations

1. **Quick formative assessment techniques (whiteboards, finger voting) are best suited for checking procedural knowledge and factual recall.** Deeper understanding — why the formula works, when to use it, how it connects to other concepts — requires more time-intensive assessment methods (explanation tasks, extended problems, discussion). This skill recommends the right technique for the moment, but some learning objectives require assessment methods that cannot be completed in 2 minutes.

2. **The response interpretation thresholds (80%, 50–80%, below 50%) are guidelines, not rules.** A class that is 78% correct may be ready to proceed if the 22% who got it wrong all made the same correctable error. A class that is 82% correct may need to pause if the errors suggest a deep misconception. The teacher's professional judgement must interpret the data in context.

3. **Formative assessment only works if the teacher is prepared to adapt.** The technique provides data, but the value is in the response. A teacher who checks whiteboards, sees 60% correct, and proceeds anyway because they need to "get through the lesson" has conducted a formative check but not formative assessment. The willingness to adapt the lesson in response to data is the essential ingredient that no technique can provide.
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- No packaged knowledge files; all execution rules are in this SKILL.

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
