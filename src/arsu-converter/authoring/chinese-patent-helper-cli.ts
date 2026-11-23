#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { authorCapabilityPackage } from "./author.js";
import {
  CHINESE_PATENT_FILING,
  CHINESE_PATENT_HELPER_INDEX,
  CHINESE_PATENT_HELPER_OPTIONS,
  CHINESE_PATENT_HELPER_SNAPSHOT,
} from "./chinese-patent-helper-sources.js";

const readJson = async (file: string): Promise<unknown> => JSON.parse(await readFile(file, "utf8")) as unknown;
const hash = async (file: string): Promise<string> => createHash("sha256").update(await readFile(file)).digest("hex");

async function main(): Promise<void> {
  const index = await readJson(CHINESE_PATENT_HELPER_INDEX) as {
    artifacts: Array<{ path: string; sha256: string; verification: { status: string } }>;
  };
  const inventory = await readJson("vendor/chinese-patent-helper/source-inventory.json") as {
    files: Record<string, { sha256?: string }>;
  };
  const retainedFiles = Object.entries(inventory.files).filter(([, file]) => file.sha256 !== undefined);
  await Promise.all(retainedFiles.map(async ([file, { sha256 }]) => {
    if (await hash(path.join(CHINESE_PATENT_HELPER_SNAPSHOT, file)) !== sha256) {
      throw new Error(`Snapshot file differs from its reviewed source: ${file}`);
    }
  }));
  for (const artifact of index.artifacts) {
    const file = path.relative(CHINESE_PATENT_HELPER_SNAPSHOT, artifact.path).split(path.sep).join("/");
    if (artifact.verification.status !== "pass" || artifact.sha256 !== inventory.files[file]?.sha256) {
      throw new Error(`Extraction differs from its reviewed source: ${artifact.path}`);
    }
  }

  const outputRoot = path.resolve(process.argv[2] ?? "skills/capabilities");
  const { capability_id, files } = await authorCapabilityPackage(outputRoot, CHINESE_PATENT_FILING, CHINESE_PATENT_HELPER_OPTIONS);
  process.stdout.write(`${capability_id}: ${String(files.length)} files\n`);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
