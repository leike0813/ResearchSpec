#!/usr/bin/env node
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { createProcessRunner, installStable } from "./lib/stable-install.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { name, version } = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
if (typeof name !== "string" || typeof version !== "string") {
  throw new Error("package.json must define string name and version");
}

const packDestination = await mkdtemp(path.join(tmpdir(), "researchspec-stable-"));
try {
  const installed = await installStable({ run: createProcessRunner(), cwd: repoRoot, packDestination, name, version });
  process.stdout.write(`Installed ${name}@${installed.version} at ${installed.packageRoot}\n`);
  process.stdout.write(`CLI: ${installed.binPath}\n`);
  process.stdout.write("Subsequent `pnpm build` in the repo will not affect this install.\n");
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  await rm(packDestination, { recursive: true, force: true });
}
