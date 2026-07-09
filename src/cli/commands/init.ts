import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { fileExists } from "../../utils/fs.js";
import { getWorkspaceEntries, resolveInitTarget } from "../../core/workspace/layout.js";

export async function runInitCommand(
  positionals: string[],
  options: Map<string, string | boolean>,
): Promise<{ exitCode: number }> {
  const tools = String(options.get("tools") ?? "none");
  const dryRun = options.has("dry-run");

  if (tools !== "none") {
    process.stderr.write(
      `Adapter delivery is out of scope for this ResearchSpec slice. Use --tools none.\n`,
    );
    return { exitCode: 1 };
  }

  const target = resolveInitTarget(positionals[0], process.cwd());
  const entries = getWorkspaceEntries(target);
  const existingWorkspace = await fileExists(target);

  if (dryRun) {
    const planned = entries.map((entry) => path.relative(process.cwd(), entry.path) || ".");
    process.stdout.write(`ResearchSpec init dry run\n`);
    process.stdout.write(`Workspace: ${target}\n`);
    for (const item of planned) {
      process.stdout.write(`Would create: ${item}\n`);
    }
    return { exitCode: 0 };
  }

  if (existingWorkspace) {
    process.stderr.write(`ResearchSpec workspace already exists: ${target}\n`);
    process.stderr.write(`Existing contract files were not overwritten.\n`);
    return { exitCode: 1 };
  }

  for (const entry of entries) {
    if (entry.kind === "dir") {
      await mkdir(entry.path, { recursive: true });
    } else {
      await mkdir(path.dirname(entry.path), { recursive: true });
      await writeFile(entry.path, entry.content, { encoding: "utf8", flag: "wx" });
    }
  }

  process.stdout.write(`ResearchSpec workspace initialized: ${target}\n`);
  process.stdout.write(`Next: researchspec status\n`);
  return { exitCode: 0 };
}
