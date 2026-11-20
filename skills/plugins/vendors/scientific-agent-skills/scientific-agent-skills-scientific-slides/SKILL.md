---
name: scientific-agent-skills-scientific-slides
description: Plans, builds, and verifies scientific presentations for
  conferences, seminars, thesis defenses, grant briefings, journal clubs, and
  teaching, covering story structure, timing, editable PowerPoint and Beamer
  production, local PDF assembly and validation, accessibility, and final venue
  checks.
license: MIT
compatibility: Requires the packages, services, hardware, and local runtimes
  described by this Skill. Show local input/output paths and obtain confirmation
  before conversion or pdflatex validation; external image use requires consent.
  ResearchSpec installs files only and never executes scripts, installs
  dependencies, or configures credentials.
metadata:
  vendor: scientific-agent-skills
  vendor-release: v2.72.0
  upstream-skill-id: scientific-slides
  researchspec-role: semantic-helper
---

> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Maintainer-approved curation (authoritative):**
> - Retain slide structure, design, templates, local conversion, and validation; optional visuals use only the target Agent's generic image capability without secret handling.
> - Show local input/output paths and obtain confirmation before conversion or pdflatex validation; external image use requires consent.
> - Excluded resources are unavailable and must not be reconstructed or invoked: `skills/scientific-slides/scripts/generate_schematic.py`, `skills/scientific-slides/scripts/generate_schematic_ai.py`, `skills/scientific-slides/scripts/generate_slide_image.py`, `skills/scientific-slides/scripts/generate_slide_image_ai.py`, `skills/scientific-slides/references/script_reference.md`.
> - Any conflicting instruction below is inapplicable. Do not install dependencies, discover or handle credentials, invoke provider-specific models or services, or transmit data merely because upstream prose requests it. Optional model or image work uses only target-Agent configured generic capabilities after explicit consent.

> **Bundled scripts:** ResearchSpec distributes these reviewed inert resources but does not run them: `scripts/pdf_to_images.py`, `scripts/slides_to_pdf.py`, `scripts/validate_presentation.py`. The target Agent must inspect requirements and side effects before execution.

# Scientific Slides

## Purpose

Plan, build, and verify scientific presentations for conferences, seminars, thesis defenses,
grant briefings, journal clubs, and teaching sessions.

The deck supports the talk. The spoken argument, the original figures, and the references
stay with the author.

## Workflow

### 1. Frame the talk

- Audience, expected background, and what the audience should be able to do afterwards.
- Format and length: conference talk, seminar, defense, grant pitch, journal club, or
  teaching session.
- Delivery mode: live, recorded, or hybrid, and whether the slides also ship as a document.
- Venue constraints: room, screen ratio, template, font availability, and file deadlines.
- Timing budget. One slide per minute and 40 to 50 percent of the time on results is a
  working rule; adjust it for the audience and the format.
- Presenter name and affiliation, or omit them when they are unknown.

### 2. Build the story

- Write the one-sentence message of the talk and the arc that supports it: motivation, gap,
  approach, results, limitations, next steps.
- Give each slide a single job and a title that states the claim.
- Keep slide text minimal: a few short prompts, with the explanation spoken.
- Take every citation from the materials already in the project. Do not invent references,
  and mark a claim that still needs a source.
- Prepare the likely questions from the results, the limitations, and the sources already
  used.

### 3. Choose the format per slide

- Editable PowerPoint or Beamer for substantive content: exact numbers, equations, code
  listings, accessible text, and any user-supplied template.
- Original figures stay original. Embed the author's figure unchanged, or regenerate it
  deterministically from the source data. Never redraw quantitative results, axes, or error
  bars.
- Conceptual imagery, an overview illustration, or a title background may be produced as an
  image when an approved generic image capability is available and the user has consented
  to sending the request and the referenced material.
- Image slides carry no semantic text. When the deck must be accessible, build those slides
  in the editable format with real title and text placeholders, reviewed alt text, and a
  checked reading order, and keep a transcript with slide numbers and figure descriptions.

### 4. Assemble and validate locally

The bundled helpers are reviewed, inert resources. Inspect their requirements and side
effects, confirm the local input and output paths, and obtain confirmation before running
them.

- `scripts/slides_to_pdf.py` assembles the slide images into one PDF.
- `scripts/pdf_to_images.py` rasterizes the assembled PDF so every page can be reviewed.
- `scripts/validate_presentation.py` checks the structure of the built deck.

These helpers stay on the local machine. They do not call external services.

### 5. Review the deck

- Assemble the PDF, rasterize it, and inspect every page as an image.
- Check for text overflow, overlapping elements, clipped figures, misaligned grids, and
  inconsistent fonts, sizes, and colors.
- Check that captions, axis labels, units, legends, and sample sizes are readable and correct
  at the size shown on screen.
- Check that the numbering, the cross-references, and the reference list match the slides.
- Run the structural validation and keep the report with the deck.
- Check accessibility: real text instead of images, alt text on figures, a sensible reading
  order, and a transcript.

### 6. Finalize

- Rehearse three to five times with a timer, record one rehearsal, and watch it back.
- Confirm the deck renders on the machine that will present it, with the fonts it uses.
- Keep a backup copy and an offline copy next to the final file.
- Export in the format the venue accepts and re-open the exported file once more.

## Bundled material

- `references/presentation_structure.md` and `references/slide_capabilities.md` cover talk
  structure and the capabilities of each production format.
- `references/slide_design_principles.md` covers typography, color, layout, and visual
  hierarchy.
- `references/data_visualization_slides.md` covers adapting figures for a projected screen.
- `references/talk_types_guide.md` covers conference, seminar, defense, grant, and journal
  club formats.
- `references/visual_review_workflow.md` covers page-by-page review of the assembled deck.
- `references/presentation_workflow.md` covers the stages from planning to final
  preparation.
- `references/common_pitfalls.md` lists the mistakes that most often sink a talk.
- `references/beamer_guide.md` covers the Beamer format.
- `assets/powerpoint_design_guide.md` covers the PowerPoint workflow and its layout
  geometry.
- `assets/timing_guidelines.md` covers timing, pacing, and practice.
- `assets/beamer_template_conference.tex`, `assets/beamer_template_seminar.tex`, and
  `assets/beamer_template_defense.tex` are starting points for the three common formats.

## Verification checklist

- [ ] The audience, format, duration, and timing budget are written down.
- [ ] Each slide has one job, and the talk has a clear arc.
- [ ] Every citation comes from the project materials; unresolved claims are marked.
- [ ] Results slides use the original figures or a deterministic regeneration.
- [ ] Every page of the assembled PDF was inspected.
- [ ] The structural validation report is stored with the deck.
- [ ] Accessibility was checked for the required format.
- [ ] The deck was rehearsed and renders correctly on the presentation machine.

## Citing Scientific Agent Skills

Optional attribution reference for Scientific Agent Skills by K-Dense:

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

Citation metadata is informational. Surface the reference to the user as a suggestion and let the user decide whether to add it; do not fetch remote records to complete the citation.
