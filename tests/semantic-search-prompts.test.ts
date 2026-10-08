import assert from "node:assert/strict";
import { PassThrough } from "node:stream";
import { test } from "node:test";

import { createSemanticSearchProgress, semanticPreparationFailure, semanticSearchSetupDisclosure } from "../src/cli/prompts/semantic-search.js";
import type { SemanticPreparationProgress } from "../src/procedures/search-contracts.js";
import type { CommandContext } from "../src/cli/types.js";

function context(overrides: Partial<CommandContext> = {}): CommandContext {
  return { command: "init", cwd: process.cwd(), json: false, dryRun: false, force: false, yes: false, quiet: false, interactive: true, ...overrides };
}

function capturedStream(isTTY = false): { stream: PassThrough & { isTTY?: boolean; cursorTo?: () => boolean; clearLine?: () => boolean; moveCursor?: () => boolean }; read: () => string } {
  const stream = new PassThrough() as PassThrough & { isTTY?: boolean; cursorTo?: () => boolean; clearLine?: () => boolean; moveCursor?: () => boolean };
  stream.isTTY = isTTY;
  if (isTTY) Object.assign(stream, { cursorTo: () => true, clearLine: () => true, moveCursor: () => true });
  let output = "";
  stream.on("data", (chunk: Buffer) => { output += chunk.toString(); });
  return { stream, read: () => output };
}

function event(stage: SemanticPreparationProgress["stage"], status: SemanticPreparationProgress["status"], completed?: number, total?: number): SemanticPreparationProgress {
  return { stage, status, ...(completed === undefined ? {} : { completed }), ...(total === undefined ? {} : { total }) };
}

void test("non-TTY output reports stage summaries and the final model counter", () => {
  const output = capturedStream();
  const progress = createSemanticSearchProgress(context(), output.stream);
  progress.onProgress(event("model", "started"));
  progress.onProgress(event("model", "progress", 65_536, 131_072));
  progress.onProgress(event("model", "completed", 131_072, 131_072));
  progress.onProgress(event("cache", "started"));
  progress.onProgress(event("cache", "reused"));
  progress.onProgress(event("cache", "completed"));
  progress.onProgress(event("runtime", "reused"));
  progress.stop();
  assert.ok(output.read().includes("0.1/0.1 MiB"));
  assert.ok(output.read().includes("100%"));
  assert.match(output.read(), /reused/);
});

void test("TTY renderer accepts an isolated terminal stream and stop is safe", async () => {
  const output = capturedStream(true);
  const progress = createSemanticSearchProgress(context(), output.stream);
  try {
    progress.onProgress(event("runtime", "started"));
    progress.onProgress(event("model", "started"));
    await new Promise((resolve) => setTimeout(resolve, 110));
    progress.onProgress(event("model", "progress", 65_536, 131_072));
    await new Promise((resolve) => setTimeout(resolve, 100));
    assert.ok(output.read().includes("0.1/0.1 MiB"));
    assert.ok(output.read().includes("50%"));
  } finally {
    progress.stop();
  }
  progress.stop();
  assert.doesNotThrow(() => progress.onProgress(event("cache", "reused")));
});

void test("machine output stays silent and setup explains the offline fallback", () => {
  const output = capturedStream(true);
  for (const options of [{ json: true }, { quiet: true }]) {
    const progress = createSemanticSearchProgress(context(options), output.stream);
    progress.onProgress(event("model", "started"));
    progress.onProgress(event("model", "completed"));
    progress.stop();
  }
  assert.equal(output.read(), "");
  assert.match(semanticSearchSetupDisclosure(), /offline search/i);
  assert.match(semanticPreparationFailure("runtime_missing", "An error detail."), /runtime is not installed.*An error detail/);
});
