---
name: plugin-education-agent-skills-agency-circles-for-systems-action
description: "Map control, influence, and concern after systems analysis. Use when students need wise agency without being made responsible for everything."
metadata:
  capability_id: plugin-education-agent-skills-agency-circles-for-systems-action
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


# Agency Circles for Systems Action

## What This Skill Does

Helps students and educators sort possible responses into what they can control, what they can influence, what requires collective or institutional action, and what remains a concern to name without carrying as personal responsibility. It adapts the Circle of Control / Influence / Concern tradition for compassionate systems work.

The key design move is to avoid over-individualising systemic problems. Students should not be told that a structural issue is simply their mindset problem. At the same time, systems thinking should not leave them overwhelmed. This skill turns analysis into wise agency: small actions, relationship-building, evidence-sharing, partnership, advocacy, and careful naming of constraints.

## Evidence Foundation

Covey popularised the circle of concern and circle of influence as a practical agency framework. Education research on learner agency cautions that agency is relational and structured, not just personal will. Meadows' leverage-point framework helps connect agency to system structures rather than isolated effort. The result is a tool for agency with humility: act where possible, influence with others, and name larger responsibilities truthfully.

## Input Schema

Required:
- **System issue or aspiration:** The issue students want to respond to, or the aspiration they want to grow.
- **Context:** Where this action might happen.

Optional:
- **Iceberg or system map:** Prior analysis.
- **Student level:** Age/year group.
- **Stakeholders:** Who has formal or informal power.
- **Constraints:** Authority, safety, policy, time, resources.

## Prompt

```text
You are helping students and/or educators translate systems analysis into wise agency using agency circles.

Inputs:
System issue or aspiration: {{system_issue_or_aspiration}}
Context: {{context}}
Iceberg/system map: {{iceberg_or_system_map}}
Student level: {{student_level}}
Stakeholders: {{stakeholders}}
Constraints: {{constraints}}

Rules:
1. Use four zones, not three:
   - Control: what students/teacher can directly do or choose.
   - Direct influence: what they can affect through relationship, evidence, modelling, invitation, or dialogue.
   - Collective/institutional influence: what requires adults, leaders, community partners, policy, money, or coordinated action.
   - Concern: what matters but is outside current influence; name it without pretending students must fix it.
2. Never place systemic responsibility only on students.
3. Connect each action to prior systems analysis: which pattern, structure, or mental model does it touch?
4. Prefer small safe experiments over heroic action.
5. Include wellbeing: acting should not require students to sacrifice safety, dignity, or belonging.
6. Include partnership: who needs to be invited, informed, or asked?

Return exactly:

## Agency Circles for Systems Action: [Issue/Aspiration]

**Context:** [brief]
**Important stance:** Agency is real, but responsibility is shared across the system.

### Circle 1: Direct Control
Things we can directly do or choose:
- **Action:** [specific]
  - **Touches:** [pattern/structure/mental model]
  - **Evidence of effect:** [what to notice]
  - **Safety check:** [risk]

### Circle 2: Direct Influence
Things we may influence through relationships, evidence, modelling, or dialogue:
- **Influence move:** [specific]
  - **Who is involved:** [stakeholder]
  - **How to approach:** [language/process]
  - **Evidence of effect:** [what to notice]

### Circle 3: Collective or Institutional Influence
Things that require partnership, adult authority, policy, resources, or coordination:
- **Collective move:** [specific]
  - **Who holds authority/resources:** [stakeholder]
  - **Student role:** [evidence, voice, proposal, participation]
  - **Adult/institutional responsibility:** [what adults must own]

### Circle 4: Concern to Name Without Carrying Alone
Things that matter but are not currently controllable:
- [Concern]
  - **Why it matters:** [reason]
  - **How to hold it:** [learn, name, witness, seek allies, avoid self-blame]

### Recommended First Step
[One low-risk action or experiment that fits the current sphere of control/influence]

### Reflection Prompts
- What are we taking responsibility for that is truly ours?
- What belongs to adults, leaders, institutions, or wider systems?
- What can we influence together that none of us can influence alone?
- What evidence would show that our action is helping rather than only making us feel busy?

Self-check: Do not tell students to fix structural harm alone. Include collective/institutional responsibility. Every action should be specific, safe, and connected to the system map.
```

## Common Pitfalls

1. **Making control too large.** Students cannot control other people's beliefs, policies, or resource allocation.
2. **Making influence too small.** Students can often influence through evidence, modelling, invitation, design, and collective voice.
3. **Confusing concern with apathy.** Naming concern can be honest and compassionate.
4. **Heroic individualism.** Systems action is usually collective and relational.
5. **Ignoring adult responsibility.** Some issues require adults to act.

## Known Limitations

1. **Cannot determine actual authority or access.** The skill provides general categories of control, influence, and concern, but the real sphere of action for a specific student, class, or teacher must be assessed locally. The output is a map, not a permission structure.
2. **Metacognitive demand.** With younger students, the distinction between collective influence and institutional responsibility may be difficult to communicate without significant adult scaffolding. The tool assumes some capacity for abstract self-reflection.
3. **Does not plan the action.** Agency circles identify zones and options; designing the actual action or project requires a subsequent step using project-brief-designer or agency-scaffold-generator.
4. **Risk of making structural harm feel manageable.** Sorting actions into circles can inadvertently imply that systemic problems are addressable through personal and small collective action. Teachers must explicitly name when structural change beyond student agency is required.

## Verification Checklist

- [ ] Four zones are used.
- [ ] Actions are specific and safe.
- [ ] Institutional responsibility is visible where appropriate.
- [ ] Student agency is real but bounded.
- [ ] The first step is small enough to try soon.
- [ ] The map reduces overwhelm rather than minimising the issue.
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
