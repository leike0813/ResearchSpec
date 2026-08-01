import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("fresh init creates only the current workspace authority tree", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const workspace = path.join(root, "researchspec");
    assert.deepEqual((await readdir(workspace)).sort(), ["changes", "config.yaml", "profiles", "specs", "subflows", "tool-installation-manifest.json"]);
    for (const relativePath of ["runs", "playbooks", "draft-patches", "artifact-registry.json"]) assert.equal(existsSync(path.join(workspace, relativePath)), false);
    const config = await readFile(path.join(workspace, "config.yaml"), "utf8");
    assert.match(config, /^schema_version: "1"$/m);
    assert.doesNotMatch(config, /^profile:/m);
    const manifest = JSON.parse(await readFile(path.join(workspace, "tool-installation-manifest.json"), "utf8")) as { installations: Array<{ owner: string; source: { kind: string } }> };
    assert.equal(manifest.installations.filter((item) => item.owner === "framework" && item.source.kind === "framework-profile").length, 1);
    assert.equal(parseEnvelope(runCli(["status", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["check", "profiles", "--json"], root)).ok, true);
    assert.equal(parseEnvelope(runCli(["doctor", "--json"], root)).ok, true);
    assert.deepEqual(parseEnvelope<{ domains: unknown[] }>(runCli(["plugin", "list", "--installed", "--json"], root)).data?.domains, []);
    assert.equal(parseEnvelope(runCli(["init", root, "--tools", "none", "--json"])).error?.code, "workspace_exists");
  } finally {
    await cleanup(root);
  }
});

void test("unsupported workspace is rejected without mutation", async () => {
  const root = await tempProject();
  const workspace = path.join(root, "researchspec");
  try {
    await mkdir(path.join(workspace, "runs/current"), { recursive: true });
    const configPath = path.join(workspace, "config.yaml");
    const statePath = path.join(workspace, "runs/current/state.yaml");
    await writeFile(configPath, "schema_version: \"0.1\"\nprofile: adaptive\n", "utf8");
    await writeFile(statePath, "semantic: user-data\n", "utf8");
    for (const command of [["status", "--json"], ["check", "--json"], ["doctor", "--json"], ["update", "--tools", "none", "--json"]]) {
      const result = runCli(command, root);
      assert.equal(result.status, 1, command.join(" "));
      assert.equal(parseEnvelope(result).error?.code, "workspace_unsupported");
    }
    assert.equal(await readFile(configPath, "utf8"), "schema_version: \"0.1\"\nprofile: adaptive\n");
    assert.equal(await readFile(statePath, "utf8"), "semantic: user-data\n");
  } finally {
    await cleanup(root);
  }
});

void test("profile drift is reported, preserved, and force-refreshable", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const profile = path.join(root, "researchspec/profiles/academic-pipeline.yaml");
    await writeFile(profile, "schema_version: \"1\"\nprofile_id: drifted\n", "utf8");
    assert.equal(parseEnvelope(runCli(["check", "profiles", "--json"], root)).ok, false);
    assert.equal(runCli(["update", "--tools", "none"], root).status, 0);
    assert.equal(await readFile(profile, "utf8"), "schema_version: \"1\"\nprofile_id: drifted\n");
    assert.equal(runCli(["update", "--tools", "none", "--force"], root).status, 0);
    assert.match(await readFile(profile, "utf8"), /^profile_id: academic-pipeline$/m);
  } finally {
    await cleanup(root);
  }
});

void test("an unowned existing profile blocks update without claiming ownership", async () => {
  const root = await tempProject();
  try {
    assert.equal(runCli(["init", root, "--tools", "none"]).status, 0);
    const manifestPath = path.join(root, "researchspec/tool-installation-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { installations: Array<{ owner: string }> };
    manifest.installations = manifest.installations.filter((item) => item.owner !== "framework");
    const changed = `${JSON.stringify(manifest, null, 2)}\n`;
    await writeFile(manifestPath, changed, "utf8");
    const update = runCli(["update", "--tools", "none", "--json"], root);
    assert.equal(update.status, 1);
    assert.equal(parseEnvelope(update).error?.code, "static_projection_conflict");
    assert.equal(await readFile(manifestPath, "utf8"), changed);
  } finally {
    await cleanup(root);
  }
});
