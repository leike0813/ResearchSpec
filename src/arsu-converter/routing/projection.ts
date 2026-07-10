import { parseDocument } from "yaml";

import { getArsuSkillDefinition } from "./catalog.js";
import type { ArsuSkillId, ArsuSkillRouteDefinition } from "./contracts.js";

export interface SkillDescriptionProjection {
  skill_id: ArsuSkillId;
  description: string;
}

export function renderArsuSkillDescription(skill: ArsuSkillRouteDefinition): string {
  const routes = skill.routes.map((route) => route.route_ref).join(", ");
  const intents = skill.intents.join("; ");
  const nearMisses = skill.near_misses.map((item) => `${item.intent} -> ${item.route_ref}`).join("; ");
  return `${skill.summary} Routes: ${routes}. Use for: ${intents}. Near-miss routing: ${nearMisses}. Before starting, validate prerequisites and present expected artifacts, formal Gates, and cost for user confirmation.`;
}

export function renderArsuCommandDescription(skill: ArsuSkillRouteDefinition): string {
  return `${skill.summary} Routes: ${skill.routes.map((route) => route.route_ref).join(", ")}.`;
}

export function projectSkillFrontmatterDescription(text: string, skillId: ArsuSkillId): {
  text: string;
  projection: SkillDescriptionProjection;
} {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error(`ARSU Skill ${skillId} is missing YAML frontmatter.`);
  const document = parseDocument(match[1] ?? "");
  if (document.errors.length > 0) throw new Error(`ARSU Skill ${skillId} has invalid YAML frontmatter: ${document.errors[0]?.message ?? "unknown error"}`);
  const sourceName = document.get("name");
  if (sourceName !== skillId) throw new Error(`ARSU Skill frontmatter name ${String(sourceName)} does not match ${skillId}.`);

  const skill = getArsuSkillDefinition(skillId);
  const description = renderArsuSkillDescription(skill);
  document.set("description", description);
  const frontmatter = document.toString({ lineWidth: 0 }).trimEnd();
  return {
    text: `---\n${frontmatter}\n---\n${text.slice(match[0].length)}`,
    projection: { skill_id: skillId, description },
  };
}

export function readSkillFrontmatterDescription(text: string): string | null {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) return null;
  const document = parseDocument(match[1] ?? "");
  if (document.errors.length > 0) return null;
  const description = document.get("description");
  return typeof description === "string" ? description : null;
}
