import { rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const allowed = new Set(["dist", ".test-dist"]);
const targets = process.argv.slice(2);

if (targets.length === 0) {
  process.stderr.write("Usage: node scripts/clean-output.mjs <dist|.test-dist> [...]\n");
  process.exitCode = 2;
} else {
  for (const target of targets) {
    if (!allowed.has(target) || path.dirname(target) !== ".") {
      throw new Error(`Refusing to clean non-build output: ${target}`);
    }
    await rm(path.resolve(process.cwd(), target), { recursive: true, force: true });
  }
}
