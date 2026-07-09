import { discoverWorkspace } from "../../core/workspace/discover.js";
import { runWorkspaceChecks } from "../../core/validation/check.js";

export async function runCheckCommand(
  _positionals: string[],
  options: Map<string, string | boolean>,
): Promise<{ exitCode: number }> {
  const json = options.has("json");
  const explicitWorkspace = stringOption(options, "workspace");
  const workspace = await discoverWorkspace(process.cwd(), explicitWorkspace);

  if (!workspace) {
    const result = {
      ok: false,
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

  const result = await runWorkspaceChecks(workspace);

  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.ok) {
    process.stdout.write(`ResearchSpec check passed: ${workspace}\n`);
  } else {
    process.stderr.write(`ResearchSpec check failed: ${workspace}\n`);
    for (const diagnostic of result.diagnostics) {
      process.stderr.write(`- [${diagnostic.code}] ${diagnostic.path ?? ""} ${diagnostic.message}\n`);
    }
  }

  return { exitCode: result.ok ? 0 : 1 };
}

function stringOption(options: Map<string, string | boolean>, key: string): string | undefined {
  const value = options.get(key);
  return typeof value === "string" ? value : undefined;
}
