---
name: plugin-scientific-agent-skills-scientific-schematics
description: "Designs scientific diagrams as verifiable specifications and reviewed figures for architectures, system and data-flow diagrams, study-design flowcharts, biological pathways, circuits, conceptual frameworks, and other complex scientific visualizations."
metadata:
  capability_id: plugin-scientific-agent-skills-scientific-schematics
  node_kind: producer
  execution_type: llm
  gate_policy: advisory
  license: MIT
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Maintainer-approved curation (authoritative):**
> - Retain reviewed schematic design practices and express optional generation through the target Agent's generic image capability without provider names, model claims, or secret handling.
> - Require consent before externally sending prompts, research content, or reference images; keep iteration and cost controls with the target Agent.
> - Excluded resources are unavailable and must not be reconstructed or invoked: `skills/scientific-schematics/scripts/example_usage.sh`, `skills/scientific-schematics/scripts/generate_schematic.py`, `skills/scientific-schematics/scripts/generate_schematic_ai.py`, `skills/scientific-schematics/references/iterative_refinement.md`.
> - Any conflicting instruction below is inapplicable. Do not install dependencies, discover or handle credentials, invoke provider-specific models or services, or transmit data merely because upstream prose requests it. Optional model or image work uses only target-Agent configured generic capabilities after explicit consent.

# Scientific Schematics and Diagrams

## Purpose

Turn a scientific concept into a diagram that a reader can check: system and data-flow
architectures, study-design flowcharts, biological pathways, circuit and instrumentation
schematics, network topologies, conceptual frameworks, and other complex visualizations.

The deliverable is a specification plus a figure the author has verified. Nothing in this
workflow certifies scientific validity, reporting-guideline compliance, or venue acceptance.

## Workflow

### 1. Write the diagram specification

The specification is the working document for the figure and the first place to look when the
drawing is wrong.

- Name the diagram type and the audience: method flowchart, architecture, pathway, circuit,
  or conceptual model.
- List every component, label, quantity, and unit taken from the user's materials. Counts,
  thresholds, and naming come from the source, not from the drawing.
- State the direction of flow and the connection between components, for example "arrow from
  A to B labelled phosphorylation".
- Mark what is uncertain or missing. Leave gaps visible instead of filling them with
  plausible content.
- Fix the intended size and format before drawing: column width, full page, poster, or slide.

### 2. Choose the production route

- Vector or drawing tools produce the final figure when the venue expects editable lines and
  text, exact labels, or a resolution the author controls.
- A raster draft from an approved generic image capability helps to explore layout and to
  illustrate a concept. Sending the request and the referenced material needs the user's
  explicit consent.
- Do not present a raster draft as the final figure when the venue requires vector output, a
  specific resolution, or editable text.

### 3. Draft and compare

- Draw from the specification rather than from memory.
- Compare the draft against the specification element by element and record the differences.
- Fix one class of defect at a time: layout and crowding first, then labels, then
  connections, then content.
- Keep at most two attempts per specification version unless the user asks for more, and
  record each attempt so the final figure stays traceable to its source.

### 4. Verify the figure

Scientific correctness:

- Every label is spelled correctly and uses the terminology of the source material.
- Every connection matches the source: right direction, right endpoints, right annotation.
- Counts, units, thresholds, and error bars match the underlying data.
- No component, arrow, or quantity appears that the source does not contain.

Legibility and accessibility:

- No overlapping or clipped text, and spacing stays even across the figure.
- Labels stay readable at the final printed size, not only on screen.
- The palette is color-blind safe and the encoding does not rely on color alone.
- Adjacent elements keep enough contrast, and the figure stays readable in grayscale.

### 5. Deliver the work products

- The diagram specification, kept as the authoritative source for the figure.
- The draft and the final figure files, named by content and versioned.
- The verification notes: what was checked, what was corrected, and what remains open.
- A caption that describes the elements, expands every abbreviation, and states the meaning
  of the encoding.
- The figure referenced from the manuscript text, with the cross-reference checked after
  compilation.

## Limits to plan around

- Raster drafts misspell text, drop components, and bend connections. Read every label.
- A raster draft has no guaranteed resolution, no vector outline, and no editable text.
  Renaming the extension or setting resolution metadata does not restore missing detail.
- Wrapping a raster draft in PDF or EPS keeps it raster. A venue that requires vector lines
  and text needs a redraw with vector tools followed by the same verification pass.
- Effective resolution is the pixel width divided by the final width in inches. Check it
  before converting to a print format.

## Bundled material

- `references/best_practices.md` holds the publication and accessibility standards to apply
  when writing the specification and judging the result.

## Verification checklist

- [ ] The specification lists every component, label, count, and connection from the source.
- [ ] Labels, connections, counts, and units were checked against the source material.
- [ ] The figure is legible at its final size and readable in grayscale.
- [ ] The encoding does not depend on color alone.
- [ ] The output format matches the venue's figure requirements.
- [ ] The caption, abbreviations, and manuscript cross-reference are in place.

## Citing Scientific Agent Skills

Optional attribution reference for Scientific Agent Skills by K-Dense:

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

Citation metadata is informational. Surface the reference to the user as a suggestion and let the user decide whether to add it; do not fetch remote records to complete the citation.
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- Load knowledge ID `sas-references-best-practices.md` from `references/best_practices.md`.

Follow the reviewed procedure and its resource guidance. ResearchSpec never executes packaged resources.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `source_ledger` `method_plan` `work_products` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_scientific_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
