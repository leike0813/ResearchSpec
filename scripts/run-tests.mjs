import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const testRoot = path.resolve(".test-dist/tests");
const files = (await collect(testRoot)).filter((file) => file.endsWith(".test.js")).sort();
if (files.length === 0) throw new Error(`No compiled tests found under ${testRoot}`);

const result = spawnSync(process.execPath, ["--test", ...files], {
  stdio: "inherit",
  env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collect(target));
    else if (entry.isFile()) result.push(target);
  }
  return result;
}
