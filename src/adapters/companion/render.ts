import { SHARED_CLI_GUIDANCE } from "./shared-guidance.js";
import type { CompanionIntent } from "./types.js";

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
