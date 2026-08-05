import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { inspectCurrentWorkspaceFormat } from "../src/core/runtime/workspace-index.js";
import { cleanup, tempProject } from "./helpers/cli.js";

void test("workspace format recognizes only strict current config", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  await mkdir(workspace);
  try {
    assert.deepEqual(await inspectCurrentWorkspaceFormat(workspace), { current: false, reason: "config.yaml is missing" });
    await writeFile(path.join(workspace, "config.yaml"), "schema_version: \"0.1\"\nprofile: adaptive\n", "utf8");
    assert.equal((await inspectCurrentWorkspaceFormat(workspace)).current, false);
    await writeFile(path.join(workspace, "config.yaml"), "schema_version: \"1\"\nagent_tools:\n  selected: []\n  delivery: both\nliterature_adapters:\n  selected: []\nplugins:\n  selected: []\n", "utf8");
    assert.deepEqual(await inspectCurrentWorkspaceFormat(workspace), { current: true });
  } finally {
    await cleanup(root);
  }
});
