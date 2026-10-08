import type { Writable } from "node:stream";

import ora, { type Ora } from "ora";

import { SEMANTIC_DOWNLOAD_BYTES, SEMANTIC_ERROR_MESSAGES, semanticCacheRoot } from "../../procedures/runtime.js";
import type { SemanticPreparationProgress } from "../../procedures/search-contracts.js";
import type { CommandContext } from "../types.js";

const stageLabels: Record<SemanticPreparationProgress["stage"], string> = {
  cache: "Checking shared cache",
  runtime: "Preparing CPU runtime",
  model: "Downloading local model",
  index: "Building Procedure index",
  "self-test": "Checking local search",
};

export function semanticSearchSetupDisclosure(): string {
  const modelSize = `${(SEMANTIC_DOWNLOAD_BYTES / 1024 / 1024).toFixed(0)} MiB`;
  return [
    "Local semantic search improves multilingual Procedure discovery.",
    `Setup downloads about ${modelSize} of public model files.`,
    "It also needs space for the CPU runtime and local index.",
    "Resources are shared through this cache:",
    semanticCacheRoot(),
    "Queries stay on this machine.",
    "If setup fails, discovery continues with offline search.",
    "",
  ].join("\n");
}

export function createSemanticSearchProgress(context: CommandContext, stream: Writable & { isTTY?: boolean } = process.stderr): {
  onProgress: (progress: SemanticPreparationProgress) => void;
  stop: () => void;
} {
  const visible = !context.json && !context.quiet;
  const tty = visible && stream.isTTY;
  let spinner: Ora | undefined;
  let lastUpdate = 0;
  const reportedStages = new Set<SemanticPreparationProgress["stage"]>();
  const reusedStages = new Set<SemanticPreparationProgress["stage"]>();

  return {
    onProgress(progress) {
      if (!visible) return;
      const label = stageLabels[progress.stage];
      const suffix = progress.file ? ` (${progress.file})` : "";
      if (!tty) {
        if (progress.status === "started" && !reportedStages.has(progress.stage)) {
          stream.write(`${label}...\n`);
          reportedStages.add(progress.stage);
        } else if (progress.status === "reused") {
          stream.write(`${label}: reused${suffix}\n`);
          reportedStages.add(progress.stage);
          reusedStages.add(progress.stage);
        } else if (progress.status === "completed" && !reusedStages.delete(progress.stage)) {
          const summary = progress.completed === undefined ? "" : ` ${formatProgress(progress)}`;
          stream.write(`${label}: complete${summary}${suffix}\n`);
          reportedStages.add(progress.stage);
        }
        return;
      }
      if (progress.status === "started") {
        if (spinner) spinner.text = `${label}${suffix}`;
        else spinner = ora({ stream, text: `${label}${suffix}` }).start();
        lastUpdate = Date.now();
      } else if (progress.status === "progress" && spinner && Date.now() - lastUpdate >= 100) {
        const count = progress.completed === undefined ? "" : ` ${formatProgress(progress)}`;
        spinner.text = `${label}${suffix}${count}`;
        lastUpdate = Date.now();
      } else if (progress.status === "reused" || progress.status === "completed") {
        if (progress.status === "completed" && reusedStages.delete(progress.stage)) return;
        if (progress.status === "reused") reusedStages.add(progress.stage);
        if (spinner) spinner.succeed(`${label}: ${progress.status === "reused" ? "reused" : "complete"}${suffix}`);
        else stream.write(`${label}: ${progress.status === "reused" ? "reused" : "complete"}${suffix}\n`);
        spinner = undefined;
      }
    },
    stop() {
      spinner?.stop();
      spinner = undefined;
    },
  };
}

function formatProgress(progress: SemanticPreparationProgress): string {
  if (progress.stage === "model" && progress.completed !== undefined && progress.total !== undefined && progress.total > 0) {
    const mib = (progress.completed / 1024 / 1024).toFixed(1);
    const totalMib = (progress.total / 1024 / 1024).toFixed(1);
    const percent = Math.min(100, Math.round(progress.completed / progress.total * 100)).toFixed(0);
    return `${mib}/${totalMib} MiB (${percent}%)`;
  }
  const completed = progress.completed?.toLocaleString() ?? "";
  const total = progress.total === undefined ? "" : `/${progress.total.toLocaleString()}`;
  return `${completed}${total}`;
}

export function semanticPreparationFailure(reason: string | undefined, detail?: string): string {
  const readable = reason && Object.hasOwn(SEMANTIC_ERROR_MESSAGES, reason)
    ? SEMANTIC_ERROR_MESSAGES[reason as keyof typeof SEMANTIC_ERROR_MESSAGES]
    : "Local semantic preparation failed for an unknown reason.";
  return `${readable}${detail ? ` ${detail}` : ""}`;
}
