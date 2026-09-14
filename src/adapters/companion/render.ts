import { renderNavigateRoutingProjection } from "../../arsu-converter/routing/navigation-projection.js";
import { renderCliHandbook } from "../../cli/handbook.js";
import { MIT_LICENSE_TEXT } from "../../licensing.js";
import { SHARED_CLI_GUIDANCE } from "./shared-guidance.js";
import type { CompanionIntent } from "./types.js";

export interface CompanionSkillFile {
  path: string;
  content: string;
}

export function renderCompanionSkill(intent: CompanionIntent): string {
  return [
    "---",
    `name: ${intent.skillId}`,
    `description: ${JSON.stringify(intent.description)}`,
    "---",
    "",
    `# ${intent.name}`,
    "",
    intent.instructions.trim(),
    "",
    SHARED_CLI_GUIDANCE.trim(),
    "",
  ].join("\n");
}

export function renderCompanionSkillFiles(intent: CompanionIntent): readonly CompanionSkillFile[] {
  return [
    { path: "LICENSE", content: MIT_LICENSE_TEXT },
    { path: "SKILL.md", content: renderCompanionSkill(intent) },
    ...(intent.id === "navigate" ? [
      { path: "references/arsu-routes.md", content: renderNavigateRoutingProjection() },
      { path: "references/cli-handbook.md", content: renderCliHandbook() },
    ] : []),
  ];
}
