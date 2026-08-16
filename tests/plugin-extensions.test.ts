import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";

import {
  loadPluginExtensionRegistry,
  PLUGIN_EXTENSION_ROOT,
  resolveDomainExtensions,
} from "../src/plugins/extensions.js";
import { loadPluginRegistry } from "../src/plugins/registry.js";
import { cleanup, parseEnvelope, runCli, tempProject } from "./helpers/cli.js";

void test("plugin extension registry loads the ecology pilot package", async () => {
  const extensions = await loadPluginExtensionRegistry();
  assert.equal(extensions.registry.schema_version, "1");
  assert.equal(extensions.capabilities.size, 1);
  assert.equal(extensions.profiles.size, 1);

  const capability = extensions.capabilities.get("plugin-ecology-biodiversity");
  assert.ok(capability);
  assert.equal(capability.manifest.node_kind, "producer");
  assert.equal(capability.manifest.provenance.origin, "vendor-derived");
  assert.equal(capability.files.includes(path.join(PLUGIN_EXTENSION_ROOT, "capabilities/plugin-ecology-biodiversity/SKILL.md")), true);

  const profile = extensions.profiles.get("plugin-ecology-biodiversity");
  assert.ok(profile);
  assert.equal(profile.profile.profile_version, "0.1.0");
  assert.deepEqual(resolveDomainExtensions(extensions, ["ecology"]), {
    capabilityIds: ["plugin-ecology-biodiversity"],
    profileIds: ["plugin-ecology-biodiversity"],
  });

  const plugins = await loadPluginRegistry(undefined, false);
  assert.equal(plugins.domains.get("ecology") !== undefined, true);
  assert.equal(plugins.skills.has("plugin-ecology-biodiversity"), false);
});

void test("plugin show exposes graph extension counts", async () => {
  const root = await tempProject();
  try {
    const shown = parseEnvelope<{ domain: { capabilities: number; profiles: number } }>(runCli(["plugin", "show", "ecology", "--summary", "--json"], root));
    assert.equal(shown.ok, true, JSON.stringify(shown.error));
    assert.equal(shown.data?.domain.capabilities, 1);
    assert.equal(shown.data?.domain.profiles, 1);
  } finally {
    await cleanup(root);
  }
});
