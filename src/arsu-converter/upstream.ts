import path from "node:path";

import { DEFAULT_SKILL_GROUPS, VENDOR_SOURCE_PATH } from "./config.js";
import { pathExists } from "./fs-utils.js";
import { gitOutput, gitResult } from "./git.js";
import { ArsuConverterError, type SourceVersion } from "./types.js";

export interface UpstreamCheckout {
  sourceRoot: string;
  sourceVersion: SourceVersion;
}

export async function resolveRepositoryRoot(cwd: string): Promise<string> {
  const root = await gitOutput(cwd, ["rev-parse", "--show-toplevel"]);
  return root ? path.resolve(root) : path.resolve(cwd);
}

export function resolveVendorSource(repoRoot: string): string {
  return path.resolve(repoRoot, VENDOR_SOURCE_PATH);
}

export async function validateUpstreamCheckout(repoRoot: string): Promise<UpstreamCheckout> {
  const sourceRoot = resolveVendorSource(repoRoot);
  if (!(await pathExists(sourceRoot))) {
    throw new ArsuConverterError(
      "upstream_missing",
      `Missing upstream checkout: ${VENDOR_SOURCE_PATH}`,
      [sourceRoot],
    );
  }

  const sourceRootResolved = path.resolve(sourceRoot);
  const repoRootResolved = path.resolve(repoRoot);
  if (!sourceRootResolved.startsWith(`${repoRootResolved}${path.sep}`)) {
    throw new ArsuConverterError(
      "upstream_outside_repo",
      `Upstream checkout must be inside repository: ${VENDOR_SOURCE_PATH}`,
      [sourceRootResolved],
    );
  }

  const gitRoot = await gitResult(sourceRoot, ["rev-parse", "--show-toplevel"]);
  if (gitRoot.exitCode !== 0 || !gitRoot.stdout) {
    throw new ArsuConverterError(
      "upstream_not_git",
      `Upstream checkout is not an initialized git repository: ${VENDOR_SOURCE_PATH}`,
      [gitRoot.stderr],
    );
  }

  const commit = await gitOutput(sourceRoot, ["rev-parse", "HEAD"]);
  if (!commit) {
    throw new ArsuConverterError(
      "upstream_commit_missing",
      `Could not resolve upstream commit for ${VENDOR_SOURCE_PATH}`,
    );
  }

  const missingGroups: string[] = [];
  for (const group of DEFAULT_SKILL_GROUPS) {
    const entry = path.join(sourceRoot, group, "SKILL.md");
    if (!(await pathExists(entry))) missingGroups.push(group);
  }
  if (missingGroups.length > 0) {
    throw new ArsuConverterError(
      "upstream_required_group_missing",
      "Upstream checkout is missing required ARSU skill groups.",
      missingGroups,
    );
  }

  const dirtyStatus = await gitResult(sourceRoot, ["status", "--porcelain"]);
  if (dirtyStatus.exitCode !== 0) {
    throw new ArsuConverterError(
      "upstream_status_failed",
      `Could not inspect upstream checkout status: ${VENDOR_SOURCE_PATH}`,
      [dirtyStatus.stderr],
    );
  }
  if (dirtyStatus.stdout.trim()) {
    throw new ArsuConverterError(
      "upstream_dirty",
      "Upstream checkout has uncommitted changes; conversion requires a clean checkout.",
      dirtyStatus.stdout.split(/\r?\n/).filter(Boolean),
    );
  }

  return {
    sourceRoot,
    sourceVersion: {
      root: VENDOR_SOURCE_PATH,
      commit,
      branch: await gitOutput(sourceRoot, ["branch", "--show-current"]),
      remote_url: await gitOutput(sourceRoot, ["config", "--get", "remote.origin.url"]),
      dirty: false,
    },
  };
}
