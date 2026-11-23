import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  INTELLECTUAL_PROPERTY_DOMAIN_ID,
  OPTIONAL_PATENT_CAPABILITY_IDS,
  OPTIONAL_PATENT_PROFILE_IDS,
} from "../dist/src/graph-profiles/intellectual-property.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => JSON.parse(readFileSync(path.join(root, file), "utf8"));
const registryPath = "skills/plugins/extensions/registry.json";

export function upsert(rows, key, row) {
  return [...rows.filter((item) => item[key] !== row[key]), row].sort((a, b) => a[key].localeCompare(b[key]));
}

export function projectBundledIntellectualProperty(registry) {
  const capabilities = read("skills/capabilities/registry.json").capabilities
    .filter((entry) => OPTIONAL_PATENT_CAPABILITY_IDS.has(entry.capability_id));
  const profiles = read("skills/arsu/profiles/registry.json").profiles
    .filter((entry) => OPTIONAL_PATENT_PROFILE_IDS.has(entry.profile_id));
  assert.equal(capabilities.length, OPTIONAL_PATENT_CAPABILITY_IDS.size);
  assert.equal(profiles.length, OPTIONAL_PATENT_PROFILE_IDS.size);

  for (const entry of capabilities) {
    registry.capabilities = upsert(registry.capabilities, "capability_id", { ...entry, source_root: "bundled" });
  }
  for (const { profile_id, source_path, profile_sha256 } of profiles) {
    registry.profiles = upsert(registry.profiles, "profile_id", { profile_id, source_path, profile_sha256, source_root: "bundled" });
  }
  const domains = registry.domains.map((domain) => ({
    ...domain,
    capabilities: domain.capabilities.filter((id) => !OPTIONAL_PATENT_CAPABILITY_IDS.has(id)),
    profiles: domain.profiles.filter((id) => !OPTIONAL_PATENT_PROFILE_IDS.has(id)),
  })).filter((domain) => domain.capabilities.length > 0 || domain.profiles.length > 0);
  const existing = domains.find((domain) => domain.domain_id === INTELLECTUAL_PROPERTY_DOMAIN_ID);
  registry.domains = upsert(domains, "domain_id", {
    domain_id: INTELLECTUAL_PROPERTY_DOMAIN_ID,
    capabilities: [...(existing?.capabilities ?? []), ...OPTIONAL_PATENT_CAPABILITY_IDS].sort(),
    profiles: [...(existing?.profiles ?? []), ...OPTIONAL_PATENT_PROFILE_IDS].sort(),
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const registry = read(registryPath);
  projectBundledIntellectualProperty(registry);
  writeFileSync(path.join(root, registryPath), JSON.stringify(registry, null, 2) + "\n");
}
