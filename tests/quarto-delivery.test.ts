import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import {
  probeQuarto,
  QuartoDeliveryError,
  renderQuartoSingleFile,
  type QuartoCommandRunner,
} from "../src/arsu-converter/quarto/index.js";
import { cleanup, tempProject } from "./helpers/cli.js";

const CHECKED_AT = "2026-08-05T10:00:00+08:00";

void test("Quarto probe distinguishes available, unavailable, and unknown without writing", async () => {
  const available = await probeQuarto({ checkedAt: CHECKED_AT, runner: async () => { await Promise.resolve(); return { exitCode: 0, stdout: "1.7.32\n", stderr: "" }; } });
  assert.deepEqual(available, { status: "available", checked_at: CHECKED_AT, version: "1.7.32" });

  const missing = Object.assign(new Error("missing"), { code: "ENOENT" });
  assert.equal((await probeQuarto({ checkedAt: CHECKED_AT, runner: async () => { await Promise.resolve(); throw missing; } })).status, "unavailable");
  const timeout = Object.assign(new Error("timeout"), { code: "ETIMEDOUT" });
  assert.equal((await probeQuarto({ checkedAt: CHECKED_AT, runner: async () => { await Promise.resolve(); throw timeout; } })).status, "unknown");
});

void test("single-file render defaults to no-execute and atomically creates one target", async () => {
  const root = await tempProject();
  try {
    const source = path.join(root, "paper.qmd");
    const output = path.join(root, "delivery/paper.pdf");
    await writeFile(source, "---\ntitle: Test\n---\n\n# Paper\n", "utf8");
    const calls: string[][] = [];
    const runner: QuartoCommandRunner = async (_command, args) => {
      calls.push([...args]);
      if (args[0] === "--version") return { exitCode: 0, stdout: "1.7.32\n", stderr: "" };
      const outputIndex = args.indexOf("--output");
      assert.notEqual(outputIndex, -1);
      await writeFile(args[outputIndex + 1] ?? "", "rendered\n", "utf8");
      return { exitCode: 0, stdout: "", stderr: "" };
    };
    const result = await renderQuartoSingleFile({ sourcePath: source, destinationPath: output, format: "pdf", checkedAt: CHECKED_AT, runner });
    assert.equal(result.execution, "disabled");
    assert.equal(result.renderer, "quarto");
    assert.equal(await readFile(output, "utf8"), "rendered\n");
    assert.ok(calls[1]?.includes("--no-execute"));
    assert.equal(calls[1]?.includes("--execute"), false);
  } finally {
    await cleanup(root);
  }
});

void test("execution consent, existing targets, and render failures fail closed", async () => {
  const root = await tempProject();
  try {
    const source = path.join(root, "paper.qmd");
    const output = path.join(root, "paper.pdf");
    await writeFile(source, "# Paper\n", "utf8");
    const available: QuartoCommandRunner = async (_command, args) => { await Promise.resolve(); return args[0] === "--version"
      ? { exitCode: 0, stdout: "1.7.32\n", stderr: "" }
      : { exitCode: 1, stdout: "", stderr: "render failed" }; };

    await assert.rejects(
      renderQuartoSingleFile({ sourcePath: source, destinationPath: output, format: "pdf", execute: true, runner: available }),
      (error: unknown) => error instanceof QuartoDeliveryError && error.code === "quarto_render_consent_required",
    );
    await assert.rejects(
      renderQuartoSingleFile({
        sourcePath: source,
        destinationPath: output,
        format: "pdf",
        execute: true,
        renderConsent: { execute: true, confirmed_by: "researcher", confirmed_at: CHECKED_AT },
        runner: available,
      }),
      (error: unknown) => error instanceof QuartoDeliveryError && error.code === "quarto_render_failed",
    );
    await assert.rejects(readFile(output, "utf8"), /ENOENT/);

    await writeFile(output, "existing\n", "utf8");
    await assert.rejects(
      renderQuartoSingleFile({ sourcePath: source, destinationPath: output, format: "pdf", runner: available }),
      (error: unknown) => error instanceof QuartoDeliveryError && error.code === "quarto_destination_exists",
    );
    assert.equal(await readFile(output, "utf8"), "existing\n");
  } finally {
    await cleanup(root);
  }
});
