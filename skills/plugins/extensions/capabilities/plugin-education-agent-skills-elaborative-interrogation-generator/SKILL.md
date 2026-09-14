---
name: plugin-education-agent-skills-elaborative-interrogation-generator
description: "Generate elaborative interrogation prompts that deepen encoding through targeted why and how questions. Use when students memorise without understanding or need deeper processing of content."
metadata:
  capability_id: plugin-education-agent-skills-elaborative-interrogation-generator
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


# Elaborative Interrogation Prompt Generator

## What This Skill Does

Generates a set of "why?" and "how does this connect?" prompts designed to deepen encoding by forcing students to generate explanations that link new information to existing knowledge. Unlike comprehension questions (which check understanding), elaborative interrogation prompts require students to explain *why* a fact is true or *how* it relates to something they already know — the act of generating the explanation strengthens the memory trace. AI is specifically valuable here because effective elaborative prompts must be pitched at the precise intersection of what students are learning and what they already know — too disconnected from prior knowledge and students can't generate explanations; too obvious and there's no elaboration needed.

## Evidence Foundation

Pressley et al. (1992) demonstrated that answering "why?" questions about factual information produced significantly better retention than reading the same facts, with effect sizes around 0.59. The mechanism is elaborative encoding — generating an explanation creates additional retrieval pathways to the information. Woloshyn et al. (1994) showed that elaborative interrogation is most effective when students have sufficient prior knowledge to generate plausible explanations — the strategy requires existing schemas to connect to. ⟦UNRESOLVED⟧Dunlosky et al. (2013) rated elaborative interrogation as a "moderate utility" strategy, noting strong evidence for factual learning but less clarity on its effectiveness for complex conceptual learning.⟦/UNRESOLVED⟧ McDaniel & Donnelly (1996) demonstrated that elaborative interrogation combined with analogical reasoning produces stronger encoding than either strategy alone. Ozgungor & Guthrie (2004) found that the effectiveness of elaborative interrogation interacts with prior knowledge and interest — students with some relevant knowledge benefit most, while those with very low knowledge may struggle to generate explanations.

## Input Schema

The teacher must provide:
- **Topic:** The concept or content students are learning. *e.g. "Properties of metals and non-metals" / "Causes of the French Revolution" / "The structure of a sonnet"*
- **Student level:** Year group and prior knowledge. *e.g. "Year 9 Chemistry, mid-ability, have covered atomic structure"*
- **Prompt count:** Number of prompts needed. *e.g. 6*

Optional (injected by context engine if available):
- **Content text:** The specific text, passage, or resource students are working with
- **Prior knowledge:** What relevant prior knowledge students have (improves prompt calibration)
- **Student profiles:** Language levels and individual prior knowledge data
- **Learning objectives:** Specific objectives the prompts should support

## Prompt

```
You are an expert in the cognitive psychology of encoding and memory, specialising in elaborative processing. You have deep knowledge of Pressley et al.'s (1992) research on elaborative interrogation, Woloshyn et al.'s (1994) work on elaboration and prior knowledge, and McDaniel & Donnelly's (1996) research on elaboration and analogy.

Your task is to generate {{prompt_count}} elaborative interrogation prompts for students learning about "{{topic}}" at the {{student_level}} level.

The following optional context may or may not be provided. Use whatever is available; ignore any fields marked "not provided."

**Specific content:** {{content_text}} — if provided, generate prompts that target the key claims and relationships in this text. If not provided, generate prompts based on general subject knowledge of the topic.
**Student prior knowledge:** {{prior_knowledge}} — if provided, calibrate prompts to connect new learning to this existing knowledge. If not provided, assume standard prior knowledge for the stated year group and subject.
**Learning objectives:** {{learning_objectives}} — if provided, focus prompts on the most important learning targets. If not provided, target the core causal relationships and mechanisms within the topic.
**Student profiles:** {{student_profiles}} — if provided, adjust language complexity and provide differentiated versions where appropriate. If not provided, design for a typical mixed-ability class.

Apply these evidence-based principles:

1. **"Why?" is the core prompt type.** The primary mechanism of elaborative interrogation is generating explanations for why facts or relationships are true. Every prompt should begin with or be reducible to a "why?" question. "What?" and "how?" are useful secondary types but only when they force explanation, not recall.

2. **Target causal relationships, not isolated facts.** Elaborative prompts should target the relationships between concepts, causes and effects, and mechanisms — not definitions or labels. "Why do metals conduct electricity?" forces elaboration. "What is a metal?" forces recall. Both are useful but only the first is elaborative interrogation.

3. **Calibrate to prior knowledge (Woloshyn et al., 1994).** Prompts only work if students have enough prior knowledge to generate a plausible explanation. If students know nothing about a topic, they can't elaborate — they need direct instruction first. Calibrate each prompt to connect to something students already know.

4. **Include connection prompts (McDaniel & Donnelly, 1996).** Some prompts should explicitly ask students to connect new information to analogous concepts they've already learned. "How is this similar to...?" or "Why might this work in the same way as...?"

5. **Vary the prompt type.** Include a mix of:
   - **Causal why:** "Why does X happen?"
   - **Contrastive why:** "Why does X happen but not Y?"
   - **Mechanism how:** "How does X lead to Y?"
   - **Connection:** "How is X similar to Y, which you learned about in [previous topic]?"
   - **Predictive:** "Based on what you know about X, what would you predict about Z? Why?"

6. **Avoid disguised recall questions.** A prompt that has a single correct factual answer is a recall question, not an elaborative prompt. Elaborative prompts should have multiple plausible explanations that students can generate from their existing knowledge.

Return your output in this exact format:

## Elaborative Interrogation Prompts: [Topic]

**For:** [Student level]
**Prior knowledge assumed:** [What students need to know for these prompts to work]

### Prompts

For each prompt:
- The prompt text
- **Type:** [Causal why / Contrastive why / Mechanism how / Connection / Predictive]
- **Targets:** [What knowledge or relationship this prompt deepens]
- **Prior knowledge activated:** [What existing knowledge students draw on to answer]

### Connection Prompts

2–3 prompts specifically connecting this topic to previously learned material.

### Implementation Guide

- When to use (during reading, after instruction, as homework)
- How to structure (individual written → pair discussion → class share)
- Time needed
- What to do if students can't generate explanations (prior knowledge is insufficient)

**Self-check before returning output:** Verify that (a) every prompt requires explanation, not just recall, (b) prompts are calibrated to the stated prior knowledge level — students can plausibly generate answers, (c) no prompt has a single-word or single-fact answer, and (d) the prompts target relationships and mechanisms, not definitions.
```

## Example Output

**Scenario:** *Topic: "Adaptations of desert animals" / Student level: "Year 8 Biology, have covered basic cell structure and habitats/ecosystems" / Prompt count: 6*

---

## Elaborative Interrogation Prompts: Adaptations of Desert Animals

**For:** Year 8 Biology
**Prior knowledge assumed:** Students understand that cells need water to function, know what a habitat is, understand that organisms are affected by their environment, have encountered the idea of food chains. They have NOT yet studied evolution or natural selection in detail.

### Prompts

**1.** The fennec fox has enormous ears compared to its body size, while the Arctic fox has very small ears. Why might ear size be connected to surviving in a hot desert versus a cold tundra?

- **Type:** Contrastive why
- **Targets:** Surface area to volume ratio as a mechanism for heat regulation; connection between body features and environmental pressures
- **Prior knowledge activated:** Students know hot and cold environments exist; they can reason that big ears = more skin surface = more heat loss, even if they haven't formally studied SA:V ratio

**2.** Many desert animals are nocturnal — they're active at night and sleep during the day. Why would being active at night help an animal survive in the desert, even though it's harder to find food in the dark?

- **Type:** Causal why
- **Targets:** Behavioural adaptation as energy/water conservation strategy; trade-off reasoning (accepting one disadvantage to gain a bigger advantage)
- **Prior knowledge activated:** Students know deserts are hot during the day and cooler at night; they understand that animals need water and energy

**3.** Camels can survive for weeks without drinking water, but they can't survive without food for nearly as long. Why do you think water is a bigger survival challenge than food in the desert? Think about what you know about cells.

- **Type:** Mechanism how (why water > food for survival)
- **Targets:** Connecting cellular biology (cells need water for chemical reactions, transport, structure) to organism-level adaptation; building understanding that adaptations solve specific environmental problems
- **Prior knowledge activated:** Cell structure — students learned that cells are mostly water, that chemical reactions in cells require water

**4.** The thorny devil lizard has spiny skin covered in tiny grooves that channel rainwater toward its mouth. If you were designing a solution to collect water in a dry environment, what principles would you use? Why does the thorny devil's solution work so well?

- **Type:** Predictive + Mechanism how
- **Targets:** Structure-function relationship; the idea that physical features can solve environmental problems through passive mechanisms (capillary action, surface tension)
- **Prior knowledge activated:** Students' general knowledge of water behaviour; connecting to any prior work on materials/surfaces in science or DT

**5.** Desert plants like cacti store water in their thick stems, but most plants you see in the UK don't have thick stems at all. Why don't UK plants need to store water? Why would it actually be a disadvantage for a UK plant to have a thick, fleshy stem like a cactus?

- **Type:** Contrastive why
- **Targets:** Adaptation as environment-specific — features that are advantageous in one environment may be disadvantageous in another; understanding that adaptations have costs (thick stems use energy, are heavy, attract herbivores)
- **Prior knowledge activated:** Students' knowledge of UK climate (frequent rain) and everyday experience of local plants

**6.** Kangaroo rats in the Sonoran Desert never drink water — they get all their water from the dry seeds they eat. How is it possible to get water from a dry seed? Think about what happens during digestion and chemical reactions.

- **Type:** Mechanism how
- **Targets:** Metabolic water production; connecting chemistry (chemical reactions produce water as a by-product) to biology (digestion as a chemical process); deep processing of adaptation as a metabolic, not just behavioural or structural, phenomenon
- **Prior knowledge activated:** Students have covered basic chemical reactions and know that digestion breaks food down; they may know that respiration produces water

### Connection Prompts

**C1.** In the ecosystems topic last term, you learned that food chains show energy flow through a habitat. Desert food chains tend to be shorter than rainforest food chains. Why might there be fewer "links" in a desert food chain? How does this connect to what you know about energy and the scarcity of resources?

**C2.** When we studied cells, we learned that water moves across cell membranes through osmosis. A desert animal that loses too much water faces a serious problem at the cellular level. Using what you know about osmosis, explain what would happen to an animal's cells if it became severely dehydrated. Why does this make water conservation literally a life-or-death issue?

### Implementation Guide

- **When to use:** After initial instruction on desert adaptations (not before — students need the new content to elaborate on). Ideal as a 15-minute activity in the second half of a lesson, or as structured homework.
- **Structure:** Individual written response first (5 minutes per prompt — assign 3 prompts per student, not all 6). Then pair discussion: compare answers with a partner. Finish with class share on one prompt, focusing on the range of plausible explanations generated.
- **Time needed:** 15–20 minutes for 3 prompts (individual + pair discussion). Do not rush — the learning happens in the generation of explanations, which takes time.
- **If students can't generate explanations:** This signals insufficient prior knowledge. For Prompt 3 (cells and water), students may need a brief reminder of cell structure. For Prompt 6 (metabolic water), this is a stretch — if students can't answer, use it as a teacher-led discussion rather than individual writing. Do not provide the answer immediately — the struggle to generate an explanation is where the learning happens, as long as the struggle is productive rather than impossible.
- **Important:** Accept multiple plausible explanations. These are elaborative prompts, not quiz questions with a single correct answer. A student who explains nocturnal behaviour as "avoiding predators that hunt by day" is generating a valid elaboration even if the "textbook answer" is about heat and water conservation.

---

## Known Limitations

1. **Elaborative interrogation requires sufficient prior knowledge to generate explanations.** If students have no relevant prior knowledge (e.g., Year 7 students with no science background attempting Prompt 6 about metabolic water), they cannot elaborate and the prompts become frustrating rather than productive. Ozgungor & Guthrie (2004) found this interaction between elaboration and prior knowledge is significant. Teachers must verify that the "prior knowledge assumed" section matches their students' actual knowledge.

2. **The evidence base is strongest for factual/conceptual learning, not procedural skills.** Pressley et al. (1992) and most elaborative interrogation studies used factual materials. The strategy transfers less clearly to mathematical procedures, physical skills, or creative tasks where "why?" questions may not deepen encoding in the same way.

3. ⟦UNRESOLVED⟧**Elaborative interrogation is more effective than re-reading but less effective than retrieval practice.** Dunlosky et al. (2013) rated it as "moderate utility" rather than "high utility." It is best used as a complement to retrieval practice and spaced practice, not as a replacement. Use elaborative prompts during initial encoding, then switch to retrieval practice for consolidation.⟦/UNRESOLVED⟧
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
