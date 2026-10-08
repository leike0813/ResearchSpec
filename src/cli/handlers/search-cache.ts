import { ExitPromptError } from "@inquirer/core";
import { confirm } from "@inquirer/prompts";

import { clearSemanticSearchCache, inspectSemanticSearchCache } from "../../procedures/runtime.js";
import { CliError, failure, success, type CommandContext, type CommandResult } from "../types.js";

export interface SearchCacheOptions { clear?: boolean }

type CacheInventory = Awaited<ReturnType<typeof inspectSemanticSearchCache>>;
type CacheConfirmation = (config: { message: string; default: boolean }) => Promise<boolean>;

export async function handleSearchCache(
  options: SearchCacheOptions,
  context: CommandContext,
  ask: CacheConfirmation = confirm,
): Promise<CommandResult> {
  try {
    const inventory = await inspectSemanticSearchCache();
    if (!options.clear) return success("doctor", { action: "inspect", ...inventory }, { stdout: cacheSummary(inventory) });
    if (!context.dryRun && !context.yes) {
      if (!context.interactive || context.json) {
        throw new CliError("confirmation_required", "Shared search cache cleanup requires confirmation.", 2,
          "Inspect with doctor search-cache first, then supply --clear --yes to confirm cleanup.", inventory);
      }
      process.stderr.write(`${cacheSummary(inventory)}Clearing affects every project sharing this cache. Hybrid discovery will use offline search until you run update --procedure-search hybrid.\n`);
      let confirmed: boolean;
      try {
        confirmed = await ask({ message: "Clear the shared search cache?", default: false });
      } catch (error) {
        if (!(error instanceof ExitPromptError)) throw error;
        confirmed = false;
      }
      if (!confirmed) return success("doctor", { action: "clear", cancelled: true, ...inventory }, { stdout: "Search cache cleanup cancelled.\n" });
    }
    const result = await clearSemanticSearchCache({ dryRun: context.dryRun });
    if (result.failed_paths.length > 0) {
      const incomplete = failure("doctor", new CliError("search_cache_clear_incomplete", "Some search cache entries could not be cleared.", 3,
        "Inspect the failed paths and retry cleanup when they are available.", result));
      incomplete.human = { stderr: [
        "Some search cache entries could not be cleared.",
        ...result.cleared_paths.map((entry) => `Cleared: ${entry}`),
        ...result.failed_paths.map((entry) => `Failed: ${entry.path}: ${entry.reason}`),
        "Retry cleanup when the failed paths are available.",
        "",
      ].join("\n") };
      return incomplete;
    }
    const summary = context.dryRun
      ? `Would clear ${String(result.entries.length)} managed search cache entries.\n`
      : `Cleared ${String(result.cleared_paths.length)} managed search cache entries.\n`;
    return success("doctor", { action: "clear", ...result }, { stdout: `${cacheSummary(result)}${summary}` });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error.code === "cache_busy" || error.code === "cache_unsafe")) {
      throw new CliError(error.code, error.message, 3,
        error.code === "cache_busy" ? "Wait for the other cache preparation or cleanup to finish, then retry." : "Inspect the cache path before retrying cleanup.");
    }
    throw error;
  }
}

function cacheSummary(inventory: CacheInventory): string {
  const lines = [
    `Shared search cache: ${inventory.cache_root}`,
    `Managed size: ${(inventory.total_bytes / 1024 / 1024).toFixed(1)} MiB`,
  ];
  for (const kind of ["runtime", "model", "index", "staging"] as const) {
    const entries = inventory.entries.filter((entry) => entry.kind === kind);
    const bytes = entries.reduce((total, entry) => total + entry.bytes, 0);
    lines.push(`  ${kind}: ${String(entries.length)} entries, ${(bytes / 1024 / 1024).toFixed(1)} MiB`);
  }
  if (inventory.skipped_paths.length > 0) lines.push("Retained unrecognized paths:", ...inventory.skipped_paths.map((entry) => `  ${entry}`));
  return `${lines.join("\n")}\n`;
}
