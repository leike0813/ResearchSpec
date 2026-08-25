import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderCliHandbook } from "../dist/src/cli/handbook.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const handbookPath = path.join(projectRoot, "docs/user/cli-handbook.md");
const expected = renderCliHandbook();

if (process.argv.includes("--check")) {
  const actual = await readFile(handbookPath, "utf8").catch(() => "");
  if (actual !== expected) {
    process.stderr.write("docs/user/cli-handbook.md does not match the typed CLI catalog renderer.\n");
    process.exitCode = 1;
  }
} else {
  await writeFile(handbookPath, expected, "utf8");
}
