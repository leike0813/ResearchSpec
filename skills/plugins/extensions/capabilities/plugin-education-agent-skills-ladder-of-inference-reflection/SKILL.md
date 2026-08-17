---
name: plugin-education-agent-skills-ladder-of-inference-reflection
description: "Slow down interpretation from observation to action. Use when students or adults need to examine assumptions in conflict, dialogue, or inquiry."
metadata:
  capability_id: plugin-education-agent-skills-ladder-of-inference-reflection
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: CC-BY-SA-4.0
---


<!-- researchspec-education-boundary:start -->
> **ResearchSpec evidence boundary:** Evidence status: Unmarked citations have identity verification only, not claim-support review. Text inside `⟦UNRESOLVED⟧…⟦/UNRESOLVED⟧` relies on unresolved evidence; verify the source and its support before relying on it, otherwise omit or soften the claim and disclose the uncertainty.
> **ResearchSpec authority boundary:** This Skill may produce candidate educational material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.
> **ResearchSpec minors boundary:** Use age-appropriate interaction and accountable human oversight for consequential learner-facing use. Do not let the Skill make unreviewed high-risk decisions about access, grading, discipline, placement, safeguarding, or opportunity.
> **ResearchSpec wellbeing boundary:** Keep wellbeing guidance educational and non-clinical. Do not diagnose or treat a condition, present the Skill as therapy, or replace qualified safeguarding, pastoral, medical, or mental-health support; escalate urgent concerns under local policy.
<!-- researchspec-education-boundary:end -->


# Ladder of Inference Reflection

## What This Skill Does

Helps students and adults slow down the movement from observation to interpretation to action. The Ladder of Inference is useful when a person has leapt from limited data to a strong conclusion: "She ignored me because she dislikes me," "Students are lazy," "The school doesn't care," or "The community will never change."

This skill does not tell people their feelings are wrong. It separates what was observed from what was selected, interpreted, assumed, concluded, believed, and done. It then opens alternative ladders and evidence-seeking questions.

## Evidence Foundation

The Ladder of Inference is associated with Argyris' work on reasoning, defensive routines, and organisational learning, and was popularised for systems learning through Senge and colleagues. It is especially useful in compassionate systems work because mental models often become visible through the meanings people make from selected data.

## Input Schema

Required:
- **Situation:** The moment, conflict, decision, or interpretation.
- **Context:** Where it happened and who is involved.

Optional:
- **Student level:** Age/year group.
- **Current interpretation:** What someone currently believes the situation means.
- **Desired use:** Reflection, restorative dialogue, bias check, inquiry, staff discussion.

## Prompt

```text
You are guiding a Ladder of Inference reflection. Help the user move carefully from observed data to selected data, meanings, assumptions, conclusions, beliefs, and actions.

Inputs:
Situation: {{situation}}
Context: {{context}}
Student level: {{student_level}}
Current interpretation: {{current_interpretation}}
Desired use: {{desired_use}}

Rules:
1. Validate that interpretations can feel real while still being incomplete.
2. Distinguish observable data from selected data and meaning-making.
3. Include at least two alternative ladders that could also fit the observable data.
4. Do not force forgiveness, positivity, or reconciliation.
5. In conflict contexts, protect dignity and safety.
6. End with questions that gather evidence or open dialogue.

Return exactly:

## Ladder of Inference: [Situation]

**Context:** [brief]
**Purpose:** [reflection/dialogue/inquiry]

### Step 1: Observable Data
What someone could have seen/heard/read without interpretation:
- [observable fact]
- [observable fact]

### Step 2: Selected Data
What the person may have noticed most:
- [selected clue]
- [selected clue]

### Step 3: Meanings Added
Possible meanings attached to the selected data:
- [meaning]

### Step 4: Assumptions
Possible assumptions underneath the meaning:
- [assumption]

### Step 5: Conclusions
What the person may conclude:
- [conclusion]

### Step 6: Beliefs Reinforced
Wider beliefs or mental models this conclusion may strengthen:
- [belief/model]

### Step 7: Actions
What actions this ladder may lead to:
- [action/avoidance/response]

### Alternative Ladders
**Alternative ladder 1:** [same data, different possible meaning]
**Alternative ladder 2:** [same data, different possible meaning]

### Evidence-Seeking Questions
- What did I actually observe?
- What did I not observe?
- What else could this mean?
- What could I ask safely and respectfully?
- What evidence would change my interpretation?

### Dialogue Language
- "The story I'm telling myself is..."
- "What I noticed was..."
- "I may be missing something. Can you help me understand...?"
- "Another possibility is..."

Self-check: Do not invalidate emotion. Do not present alternatives as truth. Keep safety and dignity central.
```

## Common Pitfalls

1. **Using the ladder to dismiss emotion.** Feelings are data about experience, but not always proof of the whole story.
2. **Over-intellectualising harm.** If harm occurred, do not use alternative ladders to excuse it.
3. **Skipping observable data.** Start with what can be seen/heard/read.
4. **Assuming one correct interpretation.** The goal is better inquiry, not forced consensus.

## Known Limitations

1. **Does not determine what actually happened.** The ladder is a reflective tool, not an investigative one. It cannot resolve factual disputes, adjudicate harm, or substitute for restorative or disciplinary processes.
2. **Not appropriate immediately after significant harm.** Generating alternative interpretations of a recent serious incident can feel invalidating to those harmed. The skill needs time, trust, and often a restorative framing to be used safely.
3. **Power asymmetry risk.** When the people involved hold significantly different power (e.g. teacher and student, or adult and child), alternative ladders may feel dismissive of the less-powerful person's experience if not carefully facilitated.
4. **Culturally bounded.** The skill may not work well when the interpretation in question involves cultural knowledge, community history, or lived experience that the facilitator does not share. External cultural expertise may be required.

## Verification Checklist

- [ ] Observable data is separated from interpretation.
- [ ] Assumptions are named tentatively.
- [ ] At least two alternative ladders are included.
- [ ] Dialogue language is safe and age-appropriate.
- [ ] The output does not excuse harm or force reconciliation.
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

When the brief is written, submit the declared outputs through
`researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal
action. Do not choose, start, or advance another node, phase, mode, or run.
