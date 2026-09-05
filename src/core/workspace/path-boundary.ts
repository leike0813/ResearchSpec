import { lstat } from "node:fs/promises";
import path from "node:path";

export async function assertPathWithinRoot(root: string, target: string): Promise<void> {
  if (!path.isAbsolute(root) || !path.isAbsolute(target)) {
    throw boundaryConflict(`Trusted paths must be absolute: ${root} -> ${target}`);
  }
  const normalizedRoot = path.resolve(root);
  const normalizedTarget = path.resolve(target);
  const relative = path.relative(normalizedRoot, normalizedTarget);
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw boundaryConflict(`Path escapes trusted root: ${target}`);
  }

  const rootInfo = await readLstat(normalizedRoot);
  if (rootInfo && !rootInfo.isDirectory() && !rootInfo.isSymbolicLink()) {
    throw boundaryConflict(`Trusted root is not a directory: ${root}`);
  }
  if (!relative) return;

  let current = normalizedRoot;
  for (const component of relative.split(path.sep)) {
    current = path.join(current, component);
    const info = await readLstat(current);
    if (!info) return;
    if (info.isSymbolicLink()) throw boundaryConflict(`Path contains a symbolic link: ${current}`);
    if (!info.isDirectory() && current !== normalizedTarget) {
      throw boundaryConflict(`Path contains a non-directory ancestor: ${current}`);
    }
  }
}

async function readLstat(filePath: string) {
  try {
    return await lstat(filePath);
  }
  catch (error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (nodeError.code === "ENOENT") return undefined;
    throw error;
  }
}

function boundaryConflict(message: string): NodeJS.ErrnoException {
  const error = new Error(message) as NodeJS.ErrnoException;
  error.code = "EWRITE_CONFLICT";
  return error;
}
