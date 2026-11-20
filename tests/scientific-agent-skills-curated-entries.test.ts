import assert from "node:assert/strict";
import { test } from "node:test";

import { curatedScientificAgentSkillEntry } from "../src/vendor-converters/scientific-agent-skills/curated-entries.js";

const CURATED_RELEASE = "v2.72.0";
const CURATED_REVISION = "526ebce143bc326f44471554e33d66a19c840360";
const ACTIVE_RELEASE = "v2.70.0";
const ACTIVE_REVISION = "d0c48af8c7b7a71ccc81fcd04c9db53b48439f9b";
const CURATED_SKILL_IDS = [
  "generate-image",
  "ginkgo-cloud-lab",
  "parallel-web",
  "pacsomatic",
  "infographics",
  "latex-posters",
  "scientific-schematics",
  "scientific-slides",
];

function curated(skillId: string) {
  const entry = curatedScientificAgentSkillEntry(skillId, CURATED_RELEASE, CURATED_REVISION, "clear-with-adaptation");
  assert.ok(entry, skillId);
  return entry;
}

void test("curated Scientific Agent Skill entries activate only at the reviewed release, revision, and decision", () => {
  for (const skillId of CURATED_SKILL_IDS) {
    const entry = curated(skillId);
    assert.ok(entry.description.length > 0 && entry.description.length <= 1024, skillId);
    assert.ok(entry.body.startsWith("# "), skillId);
    assert.equal(curatedScientificAgentSkillEntry(skillId, ACTIVE_RELEASE, ACTIVE_REVISION, "clear-with-adaptation"), undefined, skillId);
    assert.equal(curatedScientificAgentSkillEntry(skillId, CURATED_RELEASE, "0".repeat(40), "clear-with-adaptation"), undefined, skillId);
    assert.equal(curatedScientificAgentSkillEntry(skillId, CURATED_RELEASE, CURATED_REVISION, "clear"), undefined, skillId);
    assert.equal(curatedScientificAgentSkillEntry(skillId, CURATED_RELEASE, CURATED_REVISION, undefined), undefined, skillId);
    assert.equal(curatedScientificAgentSkillEntry(skillId, "v2.71.0", CURATED_REVISION, "clear-with-adaptation"), undefined, skillId);
  }
  assert.equal(curatedScientificAgentSkillEntry("seaborn", CURATED_RELEASE, CURATED_REVISION, "clear-with-adaptation"), undefined);
});

void test("curated Scientific Agent Skill entries carry no provider, credential, excluded script, or cross-Skill instruction", () => {
  const forbidden = [
    "openrouter",
    "gemini",
    "nano banana",
    "api key",
    "api_key",
    "generate_schematic.py",
    "generate_schematic_ai.py",
    "generate_slide_image.py",
    "generate_slide_image_ai.py",
    "example_usage.sh",
    "research-lookup",
    "research lookup",
    "markitdown",
  ];
  for (const skillId of CURATED_SKILL_IDS) {
    const entry = curated(skillId);
    const text = `${entry.description}\n${entry.body}`.toLowerCase();
    for (const token of forbidden) assert.ok(!text.includes(token), `${skillId} must not mention ${token}`);
  }
});

void test("curated Scientific Agent Skill entries keep the reviewed local tools and verification material", () => {
  const slides = curated("scientific-slides");
  for (const tool of ["scripts/slides_to_pdf.py", "scripts/pdf_to_images.py", "scripts/validate_presentation.py"]) {
    assert.ok(slides.body.includes(tool), tool);
  }
  assert.ok(slides.body.includes("references/beamer_guide.md"));
  assert.ok(slides.body.includes("assets/powerpoint_design_guide.md"));
  assert.ok(!slides.body.includes("scientific-schematics"), "slides must not delegate to another Skill");

  const schematics = curated("scientific-schematics");
  assert.ok(schematics.body.includes("references/best_practices.md"));
  assert.ok(schematics.body.toLowerCase().includes("verification"));
  assert.ok(slides.body.toLowerCase().includes("verification"));
});
