import { randomUUID, createHash } from "node:crypto";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import type { ReviewBlock, ReviewWorkspaceV2 } from "./v2.js";
import { ReviewWorkspaceV2Schema } from "./v2.js";

const hash = (bytes: Buffer | string): string => createHash("sha256").update(bytes).digest("hex");
const within = (root: string, relative: string): string => {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes("..")) throw new Error(`Source path escapes project: ${relative}`);
  const absolute = path.resolve(root, relative);
  if (absolute === root || !absolute.startsWith(root + path.sep)) throw new Error(`Source path escapes project: ${relative}`);
  return absolute;
};

export interface FrozenSourceSet {
  workspace_id: string;
  entry_path: string;
  files: Array<{ path: string; sha256: string }>;
  capture_limitations: string[];
}

export async function captureReviewSources(input: {
  projectRoot: string;
  workRoot: string;
  entryPath: string;
  sourcePaths: string[];
  workspaceId?: string;
  captureLimitations?: string[];
}): Promise<FrozenSourceSet> {
  const projectRoot = path.resolve(input.projectRoot);
  const workRoot = path.resolve(input.workRoot);
  if (workRoot === projectRoot || workRoot.startsWith(path.join(projectRoot, "researchspec") + path.sep)) throw new Error("Frozen sources must be outside researchspec/.");
  const workspaceId = input.workspaceId ?? randomUUID();
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(workspaceId)) throw new Error("Invalid workspace ID.");
  const sourcePaths = [...new Set([input.entryPath, ...input.sourcePaths])].sort();
  const files: FrozenSourceSet["files"] = [];
  for (const relative of sourcePaths) {
    const absolute = within(projectRoot, relative);
    const actual = await realpath(absolute);
    if (!actual.startsWith(projectRoot + path.sep)) throw new Error(`Source symlink escapes project: ${relative}`);
    const bytes = await readFile(absolute);
    const destination = within(workRoot, path.join(workspaceId, "sources", relative));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes, { flag: "wx" });
    files.push({ path: relative.split(path.sep).join("/"), sha256: hash(bytes) });
  }
  const frozen: FrozenSourceSet = {
    workspace_id: workspaceId,
    entry_path: input.entryPath.split(path.sep).join("/"),
    files,
    capture_limitations: input.captureLimitations ?? [],
  };
  await writeFile(within(workRoot, path.join(workspaceId, "source-manifest.json")), JSON.stringify(frozen, null, 2) + "\n", { flag: "wx" });
  return frozen;
}

export async function compareReviewSources(projectRoot: string, frozen: FrozenSourceSet): Promise<Array<{ path: string; status: "changed" | "missing" }>> {
  const changes: Array<{ path: string; status: "changed" | "missing" }> = [];
  for (const file of frozen.files) {
    try {
      const root = path.resolve(projectRoot);
      const absolute = within(root, file.path);
      const actual = await realpath(absolute);
      if (!actual.startsWith(root + path.sep)) throw new Error(`Source symlink escapes project: ${file.path}`);
      const bytes = await readFile(actual);
      if (hash(bytes) !== file.sha256) changes.push({ path: file.path, status: "changed" });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      changes.push({ path: file.path, status: "missing" });
    }
  }
  return changes;
}

export async function readFrozenSource(workRoot: string, workspaceId: string, relative: string): Promise<Buffer> {
  return readFile(within(path.resolve(workRoot), path.join(workspaceId, "sources", relative)));
}

const IMAGE_MIME: Record<string, ReviewWorkspaceV2["assets"][number]["mime"] | undefined> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp",
};

export async function prepareReviewImages(workRoot: string, frozen: FrozenSourceSet, imagePaths: string[]): Promise<{
  assets: ReviewWorkspaceV2["assets"];
  imageIds: Record<string, string>;
}> {
  const assets: ReviewWorkspaceV2["assets"] = [];
  const imageIds: Record<string, string> = {};
  for (const sourcePath of [...new Set(imagePaths)]) {
    if (!frozen.files.some((file) => file.path === sourcePath)) throw new Error(`Image is not in the frozen source set: ${sourcePath}`);
    const mime = IMAGE_MIME[path.extname(sourcePath).toLowerCase()];
    if (!mime) throw new Error(`Unsupported review image type: ${sourcePath}`);
    const bytes = await readFrozenSource(workRoot, frozen.workspace_id, sourcePath);
    if (bytes.length > 10 * 1024 * 1024) throw new Error(`Review image exceeds 10 MiB: ${sourcePath}`);
    const id = `img-${hash(sourcePath).slice(0, 16)}`;
    assets.push({ id, mime, base64: bytes.toString("base64"), source_path: sourcePath });
    imageIds[sourcePath] = id;
    imageIds[path.relative(path.dirname(frozen.entry_path), sourcePath).split(path.sep).join("/")] = id;
  }
  return { assets, imageIds };
}

/** Embed images emitted by an approved host render; these are output assets, not source files. */
export async function prepareRenderedImages(renderRoot: string, imagePaths: string[]): Promise<{
  assets: ReviewWorkspaceV2["assets"];
  imageIds: Record<string, string>;
}> {
  const root = path.resolve(renderRoot);
  const assets: ReviewWorkspaceV2["assets"] = [];
  const imageIds: Record<string, string> = {};
  for (const relative of [...new Set(imagePaths)]) {
    const mime = IMAGE_MIME[path.extname(relative).toLowerCase()];
    if (!mime) throw new Error(`Unsupported rendered image type: ${relative}`);
    const absolute = within(root, relative);
    const actual = await realpath(absolute);
    if (!actual.startsWith(root + path.sep)) throw new Error(`Rendered image escapes output directory: ${relative}`);
    const bytes = await readFile(actual);
    if (bytes.length > 10 * 1024 * 1024) throw new Error(`Rendered image exceeds 10 MiB: ${relative}`);
    const id = `img-${hash(relative).slice(0, 16)}`;
    assets.push({ id, mime, base64: bytes.toString("base64"), source_path: null });
    imageIds[relative] = id;
  }
  return { assets, imageIds };
}

export function assembleReviewWorkspace(input: {
  frozen: FrozenSourceSet;
  format: ReviewWorkspaceV2["source"]["format"];
  adapter: ReviewWorkspaceV2["adapter"];
  title: string;
  blocks: ReviewBlock[];
  assets?: ReviewWorkspaceV2["assets"];
  items?: ReviewWorkspaceV2["items"];
  itemLocations?: NonNullable<ReviewWorkspaceV2["document"]["item_locations"]>;
  comparison?: ReviewWorkspaceV2["document"]["comparison"];
  workflow?: Partial<ReviewWorkspaceV2["workflow"]>;
}): ReviewWorkspaceV2 {
  const source = { format: input.format, entry_path: input.frozen.entry_path, files: input.frozen.files, capture_limitations: input.frozen.capture_limitations };
  const document = {
    blocks: input.blocks,
    ...(input.itemLocations ? { item_locations: input.itemLocations } : {}),
    ...(input.comparison ? { comparison: input.comparison } : {}),
  };
  const assets = input.assets ?? [];
  const snapshotId = hash(JSON.stringify({ source, document, assets })).slice(0, 32);
  return ReviewWorkspaceV2Schema.parse({
    schema_version: "2", workspace_id: input.frozen.workspace_id, snapshot_id: snapshotId,
    adapter: input.adapter, title: input.title, source, document, assets, items: input.items ?? [],
    workflow: {
      selector: input.workflow?.selector ?? null,
      formal_action: input.workflow?.formal_action ?? "none",
      mutation_authority: "researchspec-cli-only",
      handoff_instruction: input.workflow?.handoff_instruction ?? "Return the exported result to the owning Agent. Compare current source with the retained frozen source set before applying feedback.",
    },
  });
}
