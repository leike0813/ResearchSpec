import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { readUtf8, sha256File } from "./fs-utils.js";
import { normalizeManifest } from "./manifest.js";
import type { ConversionManifest, IdempotenceResult } from "./types.js";
import { validateArsuOutput } from "./validate.js";

export async function checkExistingOutputClean(outputRoot: string): Promise<IdempotenceResult> {
  const manifestPath = path.join(outputRoot, "conversion-manifest.json");
  try {
    const manifest = JSON.parse(await readUtf8(manifestPath)) as ConversionManifest;
    const driftPaths: string[] = [];
    for (const item of manifest.output_files) {
      const filePath = path.join(outputRoot, item.output_path);
      try {
        if (await sha256File(filePath) !== item.sha256) driftPaths.push(item.output_path);
      } catch {
        driftPaths.push(item.output_path);
      }
    }
    if (driftPaths.length > 0) {
      return { ok: false, errors: ["Existing output differs from its manifest"], drift_paths: driftPaths.sort() };
    }
    return { ok: true, errors: [], drift_paths: [] };
  } catch (error) {
    const maybeError = error as NodeJS.ErrnoException;
    if (maybeError.code === "ENOENT") {
      return { ok: false, errors: ["Existing output is missing conversion-manifest.json"], drift_paths: ["conversion-manifest.json"] };
    }
    return {
      ok: false,
      errors: [`Invalid existing manifest: ${error instanceof Error ? error.message : String(error)}`],
      drift_paths: ["conversion-manifest.json"],
    };
  }
}

export async function checkIdempotence(
  repoRoot: string,
  outputRoot: string,
  regenerate: (temporaryOutputRoot: string) => Promise<void>,
): Promise<IdempotenceResult> {
  const validation = await validateArsuOutput(outputRoot);
  if (!validation.ok) return { ok: false, errors: validation.errors, drift_paths: [] };

  const current = JSON.parse(await readUtf8(path.join(outputRoot, "conversion-manifest.json"))) as ConversionManifest;
  const tempRoot = await mkdtemp(path.join(tmpdir(), "researchspec-arsu-idempotence-"));
  const tempOutput = path.join(tempRoot, "skills", "arsu");
  await regenerate(tempOutput);
  const regenerated = JSON.parse(await readUtf8(path.join(tempOutput, "conversion-manifest.json"))) as ConversionManifest;

  const left = normalizeManifest(current);
  const right = normalizeManifest(regenerated);
  if (JSON.stringify(left) === JSON.stringify(right)) {
    return { ok: true, errors: [], drift_paths: [] };
  }

  return {
    ok: false,
    errors: [`Regenerated output manifest differs from current output for ${repoRoot}`],
    drift_paths: compareOutputHashes(current, regenerated),
  };
}

function compareOutputHashes(left: ConversionManifest, right: ConversionManifest): string[] {
  const leftHashes = new Map(left.output_files.map((item) => [item.output_path, item.sha256]));
  const rightHashes = new Map(right.output_files.map((item) => [item.output_path, item.sha256]));
  const paths = [...new Set([...leftHashes.keys(), ...rightHashes.keys()])].sort();
  return paths.filter((item) => leftHashes.get(item) !== rightHashes.get(item));
}
