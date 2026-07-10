import type { ToolDefinition } from "./tools.js";

export interface CommandContent {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: readonly string[];
  body: string;
}

export const COMMAND_CONTENTS: readonly CommandContent[] = [
  command("deep-research", "Deep Research", "Run evidence-grounded research through ResearchSpec contracts."),
  command("academic-paper", "Academic Paper", "Draft or revise an academic paper from ResearchSpec contracts."),
  command("academic-paper-reviewer", "Academic Paper Reviewer", "Review a manuscript against ResearchSpec contracts."),
  command("academic-pipeline", "Academic Pipeline", "Coordinate the ARSU paper workflow through ResearchSpec files."),
];

export function renderCommand(tool: ToolDefinition, content: CommandContent): string {
  if (!tool.command) throw new Error(`${tool.id} does not support commands.`);
  let body = tool.command.replaceColon ? content.body.replaceAll("/researchspec:", "/researchspec-") : content.body;
  if (tool.command.injectArguments && !body.includes("$@") && !body.includes("$ARGUMENTS")) {
    body = `**Provided arguments**: $@\n\n${body}`;
  }
  const description = yamlScalar(content.description);
  const name = `researchspec-${content.id}`;
  const safeTomlBody = body.replaceAll('"""', String.raw`\"""`);
  switch (tool.command.format) {
    case "plain": return `${body.trim()}\n`;
    case "plain-heading": return `# ${content.name}\n\n${content.description}\n\n${body.trim()}\n`;
    case "toml": return `description = ${tomlString(content.description)}\nprompt = """\n${safeTomlBody.trim()}\n"""\n`;
    case "description": return `---\ndescription: ${description}\n---\n\n${body.trim()}\n`;
    case "description-arguments": return `---\ndescription: ${description}\nargument-hint: "[command arguments]"\n---\n\n${body.trim()}\n`;
    case "continue": return `---\nname: ${name}\ndescription: ${description}\ninvokable: true\n---\n\n${body.trim()}\n`;
    case "claude": return `---\nname: ${name}\ndescription: ${description}\nallowed-tools: Bash(researchspec:*)\ncategory: researchspec\ntags: [researchspec, arsu]\n---\n\n${body.trim()}\n`;
    case "cursor": return `---\nname: /${name}\nid: ${name}\ncategory: researchspec\ndescription: ${description}\n---\n\n${body.trim()}\n`;
    case "codebuddy": return `---\nname: ${name}\ndescription: ${JSON.stringify(content.description)}\nargument-hint: "[command arguments]"\n---\n\n${body.trim()}\n`;
    case "costrict": return `---\ndescription: ${JSON.stringify(content.description)}\nargument-hint: "[command arguments]"\n---\n\n${body.trim()}\n`;
    case "trae": return `---\nname: ${yamlScalar(name)}\ndescription: ${description}\n---\n\n${body.trim()}\n`;
    case "named": return `---\nname: ${name}\ndescription: ${description}\ncategory: researchspec\ntags: [researchspec, arsu]\n---\n\n${body.trim()}\n`;
  }
}

function command(id: string, name: string, description: string): CommandContent {
  return {
    id, name, description, category: "researchspec", tags: ["researchspec", "arsu"],
    body: `Use the installed \`${id}\` skill. Discover the nearest \`researchspec/\` workspace, run \`researchspec check\`, and follow the skill while treating contracts and ledgers as the source of truth. Do not call an LLM API or silently accept pending decisions.`,
  };
}

function yamlScalar(value: string): string {
  return /[:\n\r#{}[\],&*!|>'"%@`]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
}

function tomlString(value: string): string {
  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n")}"`;
}
