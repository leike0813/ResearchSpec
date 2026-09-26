import type { ToolDefinition } from "./tools.js";
import { CLI_TOP_LEVEL_COMMANDS } from "../cli/command-catalog.js";
import { navigateWorkflow, renderNavigateExecutionGuidance } from "./companion/workflows/navigate.js";
import { SHARED_CLI_GUIDANCE } from "./companion/shared-guidance.js";

export interface CommandContent {
  id: "navigate";
  family: "cli";
  name: string;
  description: string;
  category: string;
  tags: readonly string[];
  body: string;
}

export const LEGACY_COMMAND_IDS = CLI_TOP_LEVEL_COMMANDS.map((command) => command.id);

export const COMMAND_WRAPPER_CONTENTS: readonly CommandContent[] = [{
  id: "navigate",
  family: "cli",
  name: navigateWorkflow.name,
  description: navigateWorkflow.description,
  category: "researchspec",
  tags: ["researchspec", "navigate", "procedures"],
  body: `Route the user's request: {{arguments}}.

${renderNavigateExecutionGuidance("command")}

${SHARED_CLI_GUIDANCE}`,
}];

export function renderCommand(tool: ToolDefinition, content: CommandContent): string {
  if (!tool.command) throw new Error(`${tool.id} does not support commands.`);
  const argumentToken = tool.command.injectArguments ? "$@" : "$ARGUMENTS";
  let body = content.body.replaceAll("{{arguments}}", argumentToken);
  if (tool.command.replaceColon) body = body.replaceAll("/researchspec:", "/researchspec-");
  const description = yamlScalar(content.description);
  const name = `researchspec-${content.id}`;
  const category = yamlScalar(content.category);
  const tags = content.tags.map(yamlScalar).join(", ");
  const safeTomlBody = body.replaceAll('"""', String.raw`\"""`);
  switch (tool.command.format) {
    case "plain": return `${body.trim()}\n`;
    case "plain-heading": return `# ${content.name}\n\n${content.description}\n\n${body.trim()}\n`;
    case "toml": return `description = ${tomlString(content.description)}\nprompt = """\n${safeTomlBody.trim()}\n"""\n`;
    case "description": return `---\ndescription: ${description}\n---\n\n${body.trim()}\n`;
    case "description-arguments": return `---\ndescription: ${description}\nargument-hint: "[command arguments]"\n---\n\n${body.trim()}\n`;
    case "continue": return `---\nname: ${name}\ndescription: ${description}\ninvokable: true\n---\n\n${body.trim()}\n`;
    case "claude": return `---\nname: ${name}\ndescription: ${description}\nallowed-tools: Bash(researchspec:*)\ncategory: ${category}\ntags: [${tags}]\n---\n\n${body.trim()}\n`;
    case "cursor": return `---\nname: /${name}\nid: ${name}\ncategory: researchspec\ndescription: ${description}\n---\n\n${body.trim()}\n`;
    case "codebuddy": return `---\nname: ${name}\ndescription: ${JSON.stringify(content.description)}\nargument-hint: "[command arguments]"\n---\n\n${body.trim()}\n`;
    case "costrict": return `---\ndescription: ${JSON.stringify(content.description)}\nargument-hint: "[command arguments]"\n---\n\n${body.trim()}\n`;
    case "trae": return `---\nname: ${yamlScalar(name)}\ndescription: ${description}\n---\n\n${body.trim()}\n`;
    case "named": return `---\nname: ${name}\ndescription: ${description}\ncategory: ${category}\ntags: [${tags}]\n---\n\n${body.trim()}\n`;
  }
}

function yamlScalar(value: string): string {
  return /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
}

function tomlString(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n")}"`;
}
