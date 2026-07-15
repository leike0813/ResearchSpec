#!/usr/bin/env node

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderHistAgentCompleteTrees } from "./complete-tree.js";

export async function writeHistAgentPreview(repoRoot: string, outputRoot: string) {
  const result = await renderHistAgentCompleteTrees(repoRoot);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  for (const tree of result.trees) {
    for (const file of tree.files) {
      const target = path.join(outputRoot, tree.skillId, file.path);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, file.content);
    }
  }
  await writeFile(path.join(outputRoot, "preview-manifest.json"), `${JSON.stringify({ schema_version: 1, review_status: result.policies.review.review_status, tree_set_sha256: result.treeSetSha256, trees: result.trees.map((tree) => ({ skill_id: tree.skillId, entrypoint: tree.entrypoint, commands: tree.commands, tree_sha256: tree.sha256, files: tree.files.map((file) => ({ path: file.path, sha256: file.sha256 })) })) }, null, 2)}\n`);
  return result;
}

async function main(argv = process.argv.slice(2)): Promise<number> {
  const outputRoot = path.resolve(argv[0] ?? ".tmp/histagent-curation-preview");
  const result = await writeHistAgentPreview(process.cwd(), outputRoot);
  process.stdout.write(`${JSON.stringify({ ok: true, output_root: outputRoot, review_status: result.policies.review.review_status, tree_set_sha256: result.treeSetSha256, trees: result.trees.map((tree) => ({ skill_id: tree.skillId, tree_sha256: tree.sha256, file_count: tree.files.length })) }, null, 2)}\n`);
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main();
