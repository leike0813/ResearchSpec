---
name: plugin-education-agent-skills-restorative-practice-protocol-designer
description: "Design a restorative practice protocol for addressing harm, rebuilding trust, and restoring relationships. Use when managing conflict, behavioural incidents, or relationship breakdown between students."
metadata:
  capability_id: plugin-education-agent-skills-restorative-practice-protocol-designer
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


# Restorative Practice Protocol Designer

## What This Skill Does

Designs a specific restorative practice protocol for a classroom or school incident — selecting the right restorative approach (restorative chat, conference, or circle), providing the exact question sequence adapted for the situation and age group, guiding preparation of participants, and establishing an agreement framework for moving forward. The critical principle is that restorative practice is not the absence of consequences — it is a different KIND of consequence, one that requires the person who caused harm to understand the impact of their actions, take responsibility, and actively repair the damage. This aims to address harm and accountability; it is not universally more effective than another response. The generated adaptation needs local suitability and policy review. The output is a practical draft protocol that a teacher or pastoral leader can follow step by step. AI is specifically valuable here because selecting the right restorative approach and calibrating the questions for the specific situation and age group requires both restorative justice expertise and practical school knowledge.

## Evidence Foundation

Zehr (2002) established the foundational framework: restorative justice asks three questions: What happened? Who was harmed and how? What needs to happen to make it right? This contrasts with punitive justice, which asks: What rule was broken? Who broke it? What punishment do they deserve? ⟦UNRESOLVED⟧Hopkins (2004) applied restorative principles to schools through the "Just Schools" model, describing whole-school approaches intended to reduce exclusions and improve relationships and safety; those aims are not guaranteed by a generated protocol.⟦/UNRESOLVED⟧ Morrison (2007) demonstrated that restorative practice operates on three levels: primary (prevention — building relationships and community), secondary (intervention — addressing harm when it occurs), and tertiary (intensive — rebuilding relationships after serious harm). Thorsborne & Blood (2013) provided practical implementation guidance, emphasising that restorative practice is a continuum from informal conversations (restorative chat — 5 minutes) through facilitated conferences (30–60 minutes) to formal circles (for serious harm or whole-class issues). ⟦UNRESOLVED⟧González (2015) reviewed evidence on restorative practices in schools and found reductions in exclusions, suspensions, and racial disparities in discipline — though implementation quality was the key predictor of success.⟦/UNRESOLVED⟧

## Input Schema

The teacher must provide:
- **Incident description:** What happened. *e.g. "Two Year 9 students had a verbal argument in the corridor that escalated to pushing. Both are upset and blaming each other." / "A Year 7 student has been persistently making fun of another student's accent during group work." / "A Year 10 student swore at a teacher during a lesson after being asked to put their phone away."*
- **People involved:** Who and what roles. *e.g. "Student A (pushed first), Student B (pushed back), three witnesses" / "Student X (making comments), Student Y (target), several group members who laughed"*
- **Student level:** Year group. *e.g. "Year 9"*

Optional (injected by context engine if available):
- **Relationship context:** The relationship between those involved
- **Previous incidents:** Pattern or first occurrence
- **Severity:** Low/moderate/serious
- **Available time:** How much time
- **School policy:** Behaviour policy context

## Prompt

```
⟦UNRESOLVED⟧You are an expert in restorative practice in education, with deep knowledge of Zehr's (2002) restorative justice framework, Hopkins' (2004) whole-school approach, Morrison's (2007) three-level model, and Thorsborne & Blood's (2013) implementation continuum.⟦/UNRESOLVED⟧ You understand that restorative practice is not "being soft on behaviour" — it is a structured, demanding process that requires the person who caused harm to face the impact of their actions, take genuine responsibility, and commit to specific actions to repair the harm. It can coexist with school-policy consequences and requires suitability, preparation and genuine willingness.

IMPORTANT: Restorative practice does NOT mean there are no consequences. It means the consequences are RESTORATIVE (repairing the harm) rather than PUNITIVE (inflicting suffering). Aim for understanding impact and specific repair commitments. Never compel an apology, forgiveness or a face-to-face meeting; completion of a script does not prove genuine remorse. If the school's behaviour policy requires additional sanctions alongside the restorative process, these can coexist — the restorative process addresses the relationship; the sanction addresses the rule breach.

IMPORTANT: Restorative practice requires PREPARATION. Throwing two angry students into a room and asking "How do you both feel?" without preparation will fail. Each participant must be individually prepared before the restorative process.

Before selecting a meeting, screen current safety, safeguarding concerns, repeated bullying/harassment, power imbalance, retaliation risk, facilitator competence and each participant's freely given willingness. Apply the school's existing protective/safeguarding procedures where indicated; protection and appropriate policy consequences do not depend on restorative participation. If information is missing, leave the meeting choice provisional. A harmed learner can decline, pass, use a supporter or stop without pressure or loss of support. Offer separate supported conversations or another protective response; indirect communication also requires consent and suitability. Consequential protocol drafts require authorised human review against local policy before use.

Select the appropriate restorative approach only after that screen; times below are planning estimates:
- **Restorative chat (5–10 minutes):** For low-level incidents — a quick, structured conversation between the teacher and the student, or between two students. Uses the 5 restorative questions.
- **Restorative conference (20–45 minutes):** For moderate incidents — a facilitated meeting between the person who caused harm, the person affected, and possibly supporters or witnesses. Structured with clear phases.
- **Restorative circle (30–60 minutes):** For suitable community or group issues — a facilitated circle with willing participants. Serious harm alone never justifies a circle or bringing everyone together. Uses a talking piece and structured rounds.

Your task is to design a restorative protocol for:

**Incident description:** {{incident_description}}
**People involved:** {{people_involved}}
**Student level:** {{student_level}}

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Relationship context:** {{relationship_context}} — if not provided, design for the relationships as described.
**Previous incidents:** {{previous_incidents}} — if not provided, treat as a standalone incident but note that pattern-checking is important.
**Severity:** {{severity}} — if not provided, infer from the description.
**Available time:** {{available_time}} — if not provided, estimate preparation and facilitation time after checking suitability; lack of time does not justify skipping protection or consent.
**School policy:** {{school_policy}} — if not provided, mark the draft for authorised local-policy review; do not invent local rules.

Apply these principles:

1. ⟦UNRESOLVED⟧**The core restorative questions (Zehr, 2002; Hopkins, 2004):**⟦/UNRESOLVED⟧
   - What happened? (Understanding the event from each perspective)
   - What were you thinking/feeling at the time?
   - What have you thought/felt since?
   - Who has been affected and how?
   - What needs to happen to make things right?

2. **Prepare before the process (Thorsborne & Blood, 2013):**
   - Meet individually with each participant before bringing them together.
   - Assess emotional readiness — the process won't work if participants are still in fight/flight.
   - Explain the process: what will happen, what's expected, what the outcome should be.
   - Check willingness privately and without pressure; participation in a restorative meeting must be voluntary. Separate any required school-policy process from that choice, and do not require meeting the person who caused harm.

3. ⟦UNRESOLVED⟧**Facilitate, don't interrogate (Hopkins, 2004):**⟦/UNRESOLVED⟧
   - The facilitator asks questions fairly and listens without lecturing; they still name harmful conduct and act on bullying, discrimination or safety concerns.
   - Allow silence. Allow emotion. Allow manageable discomfort, but check consent and stop for distress, intimidation or unsafe dynamics; discomfort is not evidence the process is working.
   - The facilitator ensures both parties are heard — not equally in volume, but equally in respect.

4. **Reach a genuine agreement (Morrison, 2007):**
   - The agreement must be specific: "I will..." not "I'll try to..."
   - The agreement must be owned by the participants, not imposed by the facilitator.
   - The agreement must be checked: set a follow-up date to review whether the agreement has been kept.

5. **Address the relationship, not just the incident:**
   - The goal is to repair the relationship so that both parties can coexist safely in the school community.
   - A restored relationship is one where both parties feel respected, heard, and safe — not necessarily friends, but able to learn together.

Return your output in this exact format:

## Restorative Protocol: [Incident Type]

**Incident:** [Summary]
**People involved:** [Roles]
**Approach:** [Chat / Conference / Circle, provisional if not yet screened; or no joint process — protected alternative and reason]
**Estimated time:** [Duration]

### Preparation Phase

**Meeting with [Person A]:**
[What to say and ask — specific script]

**Meeting with [Person B]:**
[What to say and ask — specific script]

### The Restorative Process

[Step-by-step facilitation guide with specific questions adapted for this situation]

### Agreement Framework

[How to reach and record the agreement]

### Follow-Up

[When and how to check that the agreement is being kept]

### If It Doesn't Work

[Stop without pressuring participation; maintain protection and policy response, offer a suitable alternative, and review recurrence/retaliation. Keep minimal agreement records under school confidentiality rules.]

**Self-check before returning output:** Verify that (a) safety, power imbalance, readiness and voluntary consent precede approach selection, (b) preparation is included, (c) questions are adapted for the specific situation, (d) the agreement is specific and achievable, (e) follow-up is planned, and (f) the process holds the person who caused harm accountable while giving voice to the person affected.
```

## Example Output

**Scenario:** *Incident description: "A Year 7 student (Student A) has been persistently making fun of another student's (Student B's) accent during group work. This has happened at least 4 times over the past two weeks. Student B has become increasingly withdrawn — they now refuse to speak during group work and have asked to work alone. Other group members sometimes laughed, which encouraged Student A." / People involved: "Student A (making comments), Student B (target), 3 other group members who witnessed/laughed" / Student level: "Year 7" / Severity: "Moderate — persistent pattern causing visible emotional harm"*

---

## Restorative Protocol: Persistent Mockery of Accent

**Incident:** Repeated accent mockery; Student B has become withdrawn and asked to work alone.
**People involved:** Student A, Student B and three witnesses/participants.
**Approach:** No face-to-face conference assumed. First use the school's bullying/discrimination and safeguarding procedures as applicable, assess power imbalance and retaliation risk, and protect Student B's participation in learning. Separate supported conversations are the provisional route.
**Estimated time:** Plan individual preparation/check-ins first; joint-process time is not booked until suitability and consent are established.

### Preparation Phase

**Meeting with Student B, privately:** "The comments need to stop. You do not have to meet Student A or describe this in front of others. What would help you feel safe in group work? You may choose a supporter, a private account, or no restorative participation. We will still act to protect you." Check preferred group arrangements and an accessible reporting route without making B responsible for monitoring A.

**Meeting with Student A, separately:** "Comments about another person's accent are harmful and must stop. Tell me what happened. What were you thinking or feeling? What have you thought since? Who has been affected and how? What specific steps will you take to prevent recurrence and repair harm?" Do not promise a meeting with B or require B to teach A about the harm.

### The Restorative Process

Continue individual accountability and protection through school procedures. A trained facilitator may later offer a joint process only if assessment shows it is suitable and everyone freely agrees. Explain participants, format, support and the right to stop first. If it proceeds, use the core question sequence above, allow B's chosen way of being heard and focus on impact and repair without requiring apology or forgiveness. Otherwise retain the protected separate route; a joint meeting is not the success criterion.

### Agreement Framework

Invite specific voluntary repair commitments, such as A stopping accent comments and practising a respectful response. Protective school boundaries apply regardless of agreement. Agree what information can be shared; keep only necessary actions, responsibilities and review arrangements under school confidentiality policy. B need not sign or agree to renewed contact. Address bystanders separately without exposing B's private account.

### Follow-Up

Set an early private check-in with B and a separate review with A; one week is an example, sooner if concern arises. Check recurrence, retaliation, access to group work and B's own view of safety. Do not close merely because an agreement was signed. Continued mockery or retaliation triggers the appropriate protective/policy response, not automatic reconvening.

### If It Doesn't Work

Refusal ends the restorative invitation without penalty for declining it; the harmful behaviour still requires a school response. Distress or intimidation stops the meeting. No forced breathing, immediate restart or promised benefit. Review unresolved needs with authorised pastoral/safeguarding staff and continue protection.


---

## Known Limitations

1. **Restorative practice requires facilitator skill.** The protocol above provides the structure, but the facilitation — reading body language, holding silence, managing emotion, redirecting minimisation — requires practice. Teachers new to restorative approaches should start with restorative chats (simpler) before attempting conferences (more complex).

2. **Restorative practice is not appropriate for all situations.** Situations involving significant power imbalances (persistent bullying, abuse, harassment) may not be suitable for a face-to-face restorative conference, as the affected person may feel unsafe speaking directly to the person who harmed them. In these cases, the facilitator can shuttle between the parties rather than bringing them together, or an alternative approach may be needed.

3. **Restorative practice takes more time than punishment.** A detention takes zero preparation and zero facilitator skill. A restorative conference takes 30–40 minutes plus preparation. Reduced recurrence and improved relationships are possible aims, not assured returns. Account for preparation, facilitation and follow-up time and check actual outcomes with leadership support.
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
