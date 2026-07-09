import path from "node:path";

import { discoverWorkspace } from "../../core/workspace/discover.js";
import { readOptionalText } from "../../utils/fs.js";
import { parseSimpleYaml } from "../../core/validation/parse.js";

export async function runStatusCommand(options: Map<string, string | boolean>): Promise<{ exitCode: number }> {
  const json = options.has("json");
  const explicitWorkspace = stringOption(options, "workspace");
  const workspace = await discoverWorkspace(process.cwd(), explicitWorkspace);

  if (!workspace) {
    const result = {
      status: "missing",
      workspace: null,
      initialized: false,
      next: "researchspec init",
      diagnostics: [
        {
          severity: "error",
          code: "workspace_missing",
          message: "No researchspec workspace found.",
          blocking: true,
        },
      ],
    };
    if (json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      process.stderr.write("No researchspec workspace found.\nRun researchspec init to create one.\n");
    }
    return { exitCode: 1 };
  }

  const statePath = path.join(workspace, "runs/current/state.yaml");
  const stateText = await readOptionalText(statePath);
  const parsedState = stateText ? parseSimpleYaml(stateText, statePath) : undefined;
  const result = {
    status: "initialized",
    workspace,
    initialized: true,
    state: parsedState?.ok ? parsedState.value : null,
    diagnostics: parsedState && !parsedState.ok ? [parsedState.diagnostic] : [],
  };

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`ResearchSpec workspace: ${workspace}\n`);
    process.stdout.write(`Status: initialized\n`);
    if (parsedState?.ok && typeof parsedState.value.status === "string") {
      process.stdout.write(`Run status: ${parsedState.value.status}\n`);
    }
    if (parsedState && !parsedState.ok) {
      process.stdout.write(`Diagnostics: ${parsedState.diagnostic.message}\n`);
    }
  }

  return { exitCode: parsedState && !parsedState.ok ? 1 : 0 };
}

function stringOption(options: Map<string, string | boolean>, key: string): string | undefined {
  const value = options.get(key);
  return typeof value === "string" ? value : undefined;
}
