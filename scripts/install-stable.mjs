import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
const { name, version } = pkg;

if (typeof name !== "string" || typeof version !== "string") {
  throw new Error("package.json must define string name and version");
}

const tmp = await mkdtemp(path.join(tmpdir(), "researchspec-stable-"));
const tarball = path.join(tmp, `${name}-${version}.tgz`);

function run(cmd, args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", cwd: repoRoot });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${label} exited with code ${code}`));
    });
  });
}

function runBestEffort(cmd, args, label) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: "inherit", cwd: repoRoot });
    child.on("error", (err) => {
      process.stderr.write(`${label} could not be invoked: ${err.message}\n`);
      resolve();
    });
    child.on("exit", (code) => {
      if (code !== 0) process.stderr.write(`${label} exited with code ${code} (ignored)\n`);
      resolve();
    });
  });
}

try {
  await run("pnpm", ["build"], "pnpm build");
  await run("npm", ["pack", "--pack-destination", tmp], "npm pack");

  await runBestEffort("npm", ["rm", "-g", name, "--force"], "npm rm -g");

  await run("npm", ["install", "-g", tarball], "npm install -g");

  await runBestEffort("which", ["researchspec"], "which researchspec");
  console.log("Stable global install is in place. Subsequent `pnpm build` in the repo will not affect it.");
} finally {
  await rm(tmp, { recursive: true, force: true });
}