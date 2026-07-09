import path from "node:path";

import { writeJson } from "../fs-utils.js";
import { generateUpstreamManifest, UPSTREAM_MANIFEST_PATH } from "./manifest.js";

export async function writeUpstreamManifest(repoRoot = process.cwd()): Promise<void> {
  const manifest = await generateUpstreamManifest(repoRoot);
  await writeJson(path.join(repoRoot, UPSTREAM_MANIFEST_PATH), manifest);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await writeUpstreamManifest();
}
