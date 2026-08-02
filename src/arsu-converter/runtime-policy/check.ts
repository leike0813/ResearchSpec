#!/usr/bin/env node

import path from "node:path";

import { VENDOR_SOURCE_PATH } from "../config.js";
import { validateUpstreamCheckout, resolveRepositoryRoot } from "../upstream.js";
import { buildRuntimePolicyPlan } from "./planner.js";

export async function main(cwd = process.cwd()): Promise<number> {
  try {
    const repoRoot = await resolveRepositoryRoot(cwd);
    const { sourceRoot, sourceVersion } = await validateUpstreamCheckout(repoRoot);
    const plan = await buildRuntimePolicyPlan(repoRoot, sourceRoot, sourceVersion.commit);
    process.stdout.write(`${JSON.stringify({
      ok: true,
      source: path.relative(repoRoot, sourceRoot) || VENDOR_SOURCE_PATH,
      source_commit: plan.source_commit,
      catalog_id: plan.catalog_id,
      classified_source_count: plan.classified_source_count,
      adapted_source_count: plan.adapted_source_count,
      retained_source_count: plan.retained_source_count,
      checker_closure_count: plan.checker_closure.length,
    }, null, 2)}\n`);
    return 0;
  } catch (error) {
    const details = typeof error === "object" && error !== null && "details" in error
      ? (error as { details?: string[] }).details ?? []
      : [];
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    for (const detail of details) process.stderr.write(`- ${detail}\n`);
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = await main();
