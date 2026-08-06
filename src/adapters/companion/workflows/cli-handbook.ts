import { renderCliHandbook } from "../../../cli/handbook.js";
import type { CompanionWorkflowSource } from "../types.js";

export const cliHandbookWorkflow = {
  id: "cli-handbook",
  name: "ResearchSpec CLI Handbook",
  description: "Reference the ResearchSpec CLI and workspace contracts; use whenever using, invoking, explaining, inspecting, troubleshooting, or modifying ResearchSpec commands, payloads, selectors, status, checks, or generated projections.",
  instructions: renderCliHandbook(),
} satisfies CompanionWorkflowSource;
