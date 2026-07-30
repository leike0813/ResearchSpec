import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  renderCliHandbook,
  renderMdxCliSidebar,
  renderMdxCommandPages,
} from "../dist/src/cli/handbook.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const FLAGS = new Set(process.argv.slice(2));
const checkMode = FLAGS.has("--check");
const handbookOnly = FLAGS.has("--handbook-only");
const siteOnly = FLAGS.has("--site-only");

const outputs = [];

if (!siteOnly) {
  outputs.push({
    label: "handbook",
    filePath: path.join(projectRoot, "docs/cli_handbook.md"),
    content: renderCliHandbook(),
  });
}

if (!handbookOnly) {
  const cliDir = path.join(projectRoot, "website/docs/cli");
  await mkdir(cliDir, { recursive: true });

  const indexContent = [
    "---",
    "sidebar_position: 0",
    "title: CLI Command Reference",
    "description: Complete reference for all ResearchSpec CLI commands",
    "---",
    "",
    "# CLI Command Reference",
    "",
    "> Generated from the typed public CLI catalog. Do not edit pages in this",
    "> directory by hand.",
    "",
    "Each command page lists syntax, options, workspace requirements, static",
    "effects, and related commands. For runtime-dynamic instructions (valid",
    "selectors, required semantic input, execution policy), run",
    "`researchspec instructions <selector> --json`.",
    "",
  ].join("\n") + "\n";
  outputs.push({
    label: "cli index",
    filePath: path.join(cliDir, "index.mdx"),
    content: indexContent,
  });

  for (const page of renderMdxCommandPages()) {
    outputs.push({
      label: `cli/${page.filename}`,
      filePath: path.join(cliDir, page.filename),
      content: page.content,
    });
  }

  const sidebarDir = path.join(projectRoot, "website");
  await mkdir(sidebarDir, { recursive: true });
  outputs.push({
    label: "sidebar",
    filePath: path.join(sidebarDir, "sidebars.cli.ts"),
    content: renderMdxCliSidebar(),
  });
}

let issues = 0;

for (const { label, filePath, content } of outputs) {
  if (checkMode) {
    const actual = await readFile(filePath, "utf8").catch(() => "");
    if (actual !== content) {
      process.stderr.write(`${label} does not match the typed CLI catalog renderer.\n`);
      issues += 1;
    }
  } else {
    const dir = path.dirname(filePath);
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, content, "utf8");
  }
}

if (checkMode && issues > 0) {
  process.stderr.write(`${issues} output(s) are out of date. Run "pnpm docs:generate" to sync.\n`);
  process.exitCode = 1;
}
