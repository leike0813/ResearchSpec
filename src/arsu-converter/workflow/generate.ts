import { createHash } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import {
  GRAPH_PROFILE_REGISTRY_SCHEMA_VERSION,
  GraphProfileRegistrySchema,
  type GraphProfileRegistry,
} from "../../graph-profiles/registry.js";
import { writeJson, writeUtf8 } from "../fs-utils.js";
import { AUTHORED_GRAPH_PROFILES } from "./graph-profiles/index.js";

export const PRESET_GRAPH_PROFILE_REGISTRY_VERSION = "0.1.0";

export function buildPresetGraphProfileRegistry(): GraphProfileRegistry {
  return GraphProfileRegistrySchema.parse({
    schema_version: GRAPH_PROFILE_REGISTRY_SCHEMA_VERSION,
    registry_version: PRESET_GRAPH_PROFILE_REGISTRY_VERSION,
    profiles: AUTHORED_GRAPH_PROFILES.map(({ profile, projection }) => ({
      profile_id: profile.profile_id,
      profile_version: profile.profile_version,
      source_path: `${profile.profile_id}.yaml`,
      profile_sha256: sha256(projection),
    })),
  });
}

export async function emitPresetGraphProfiles(outputRoot: string): Promise<GraphProfileRegistry> {
  const profileRoot = path.join(outputRoot, "profiles");
  await mkdir(profileRoot, { recursive: true });
  for (const { profile, projection } of AUTHORED_GRAPH_PROFILES) {
    await writeUtf8(path.join(profileRoot, `${profile.profile_id}.yaml`), projection);
  }
  const registry = buildPresetGraphProfileRegistry();
  await writeJson(path.join(profileRoot, "registry.json"), registry);
  return registry;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}
