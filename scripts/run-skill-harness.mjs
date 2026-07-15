import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(repoRoot, ".harness-dist");
const require = createRequire(import.meta.url);
const compiler = require.resolve("typescript/bin/tsc");

await rm(outputRoot, { recursive: true, force: true });

const compiled = spawnSync(process.execPath, [compiler, "-p", path.join(repoRoot, "tsconfig.harness.json")], {
  cwd: repoRoot,
  stdio: "inherit",
});
if (compiled.error) throw compiled.error;
if (compiled.status !== 0) process.exit(compiled.status ?? 1);

const server = spawnSync(process.execPath, [path.join(outputRoot, "harness/server.js"), ...process.argv.slice(2)], {
  cwd: repoRoot,
  env: { ...process.env, RESEARCHSPEC_REPO_ROOT: repoRoot },
  stdio: "inherit",
});
if (server.error) throw server.error;
process.exitCode = server.status ?? 1;
