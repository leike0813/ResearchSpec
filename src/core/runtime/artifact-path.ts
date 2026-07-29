import path from "node:path";

export interface ArtifactPathContext {
  workspace: string;
  runtimeMode: "adaptive" | "strict";
}

export interface ResolvedArtifactPath {
  root: string;
  absolutePath: string;
  contained: boolean;
}

export function artifactPathRoot(context: ArtifactPathContext): string {
  const workspace = path.resolve(context.workspace);
  return context.runtimeMode === "adaptive" ? workspace : path.dirname(workspace);
}

export function resolveRegisteredArtifactPath(
  context: ArtifactPathContext,
  registeredPath: string,
): ResolvedArtifactPath {
  const root = artifactPathRoot(context);
  const absolutePath = path.resolve(root, registeredPath);
  const relative = path.relative(root, absolutePath);
  const contained = registeredPath.length > 0
    && !path.isAbsolute(registeredPath)
    && !registeredPath.includes("\\")
    && relative.length > 0
    && !relative.startsWith(`..${path.sep}`)
    && relative !== ".."
    && !path.isAbsolute(relative);
  return { root, absolutePath, contained };
}

export function serializeRegisteredArtifactPath(
  context: ArtifactPathContext,
  absolutePath: string,
): string {
  const root = artifactPathRoot(context);
  const resolved = path.resolve(absolutePath);
  const relative = path.relative(root, resolved);
  if (
    !path.isAbsolute(absolutePath)
    || relative.length === 0
    || relative === ".."
    || relative.startsWith(`..${path.sep}`)
    || path.isAbsolute(relative)
  ) {
    throw new RangeError(`Artifact path is outside its runtime root: ${absolutePath}`);
  }
  return toPosixPath(relative);
}

export function isPathContained(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate));
  return relative === ""
    || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

export function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}
