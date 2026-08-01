import { constants } from "node:fs";
import { access, lstat } from "node:fs/promises";
import path from "node:path";

export type BoundaryPathUse = "reference" | "consume-input";

export interface BoundaryPath {
  relativePath: string;
  absolutePath: string;
}

export class BoundaryPathError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "BoundaryPathError";
  }
}

export async function resolveBoundaryPath(
  projectRoot: string,
  requestedPath: string,
  use: BoundaryPathUse = "reference",
): Promise<BoundaryPath> {
  const trimmed = requestedPath.trim();
  if (!trimmed) throw new BoundaryPathError("boundary_path_empty", "Boundary path must not be empty.");
  if (path.isAbsolute(trimmed)) throw new BoundaryPathError("boundary_path_absolute", "Boundary path must be project-relative.");

  const root = path.resolve(projectRoot);
  const absolutePath = path.resolve(root, trimmed);
  if (!isWithin(root, absolutePath)) {
    throw new BoundaryPathError("boundary_path_escape", "Boundary path must remain inside the project.");
  }
  const relativePath = path.relative(root, absolutePath).split(path.sep).join("/");
  if (relativePath === "researchspec" || relativePath.startsWith("researchspec/")) {
    throw new BoundaryPathError("boundary_path_managed", "Boundary deliverables must remain outside researchspec/.");
  }

  await rejectExistingSymlinkComponents(root, relativePath);
  if (use === "consume-input") {
    let info;
    try {
      info = await lstat(absolutePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new BoundaryPathError("boundary_input_missing", `Boundary input does not exist: ${relativePath}`);
      }
      throw error;
    }
    if (!info.isFile() || info.isSymbolicLink()) {
      throw new BoundaryPathError("boundary_input_unreadable", `Boundary input must be a regular readable file: ${relativePath}`);
    }
    try {
      await access(absolutePath, constants.R_OK);
    } catch {
      throw new BoundaryPathError("boundary_input_unreadable", `Boundary input must be a regular readable file: ${relativePath}`);
    }
  }
  return { relativePath, absolutePath };
}

async function rejectExistingSymlinkComponents(root: string, relativePath: string): Promise<void> {
  let current = root;
  for (const segment of relativePath.split("/")) {
    current = path.join(current, segment);
    try {
      const info = await lstat(current);
      if (info.isSymbolicLink()) {
        throw new BoundaryPathError("boundary_path_symlink", `Boundary path contains a symlink component: ${segment}`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
      throw error;
    }
  }
}

function isWithin(root: string, target: string): boolean {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
