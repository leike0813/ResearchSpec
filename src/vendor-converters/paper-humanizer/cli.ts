import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../../../../", import.meta.url)));
const skillRoot = path.join(root, "skills", "paper-humanizer");
const required = ["SKILL.md", "LICENSE", "metadata.json", "references/prose-guidance.md", "scripts/document-pipeline.mjs", "scripts/full-workflow.mjs"];

export async function main(argv = process.argv.slice(2)): Promise<{ exitCode: number }> {
  const command = argv[0] ?? "help";
  if (command === "help") {
    process.stdout.write("Paper Humanizer maintainer tooling\nUsage: paper-humanizer:{convert|check|idempotence}\n");
    return { exitCode: 0 };
  }
  if (!(["convert", "check", "idempotence"] as string[]).includes(command)) {
    process.stderr.write(`Unsupported Paper Humanizer command: ${command}\n`);
    return { exitCode: 1 };
  }
  const errors: string[] = [];
  for (const relative of required) {
    try { await access(path.join(skillRoot, relative)); }
    catch { errors.push(`missing:${relative}`); }
  }
  try {
    const skill = await readFile(path.join(skillRoot, "SKILL.md"), "utf8");
    if (!/^name:\s*paper-humanizer$/m.test(skill)) errors.push("frontmatter:name");
    if (!/work\/paper-humanizer/.test(skill)) errors.push("runtime:work-directory");
  } catch { /* missing file is already reported */ }
  const result = { ok: errors.length === 0, command, source_commit: "1a31f2d0ff6dab94c799f7ae1a3a469aea3e5394", errors };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  return { exitCode: result.ok ? 0 : 1 };
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = (await main()).exitCode;
