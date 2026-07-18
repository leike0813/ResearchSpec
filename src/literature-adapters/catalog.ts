import { validateLiteratureAdapterCatalog } from "./contracts.js";

export const ZOTERO_LITERATURE_ADAPTER_ID = "zotero-library" as const;
export const LITERATURE_ADAPTER_SKILL_IDS = ["zotero-library-agent", "zotero-bridge-cli"] as const;

const catalog = [{
  adapter_id: ZOTERO_LITERATURE_ADAPTER_ID,
  install_policy: "fixed",
  primary_skill_id: LITERATURE_ADAPTER_SKILL_IDS[0],
  helper_skill_id: LITERATURE_ADAPTER_SKILL_IDS[1],
  skill_source_paths: {
    "zotero-library-agent": "literature-adapters/zotero/skills/zotero-library-agent",
    "zotero-bridge-cli": "literature-adapters/zotero/skills/zotero-bridge-cli",
  },
  profile_template_path: "literature-adapters/zotero/profile.template.json",
  source: {
    bundle_repository: "leike0813/zotero-library-agent-bundle",
    bundle_tag: "host-bridge/hbrs-48630ca514e3146c2c89a8d5",
    bundle_commit: "8eef49d72574084244514fb612b96e7f5e7967a8",
    bundle_tree: "d4cb943c0370e5104ec8c7074606c69980dec090",
    source_repository: "leike0813/zotero-agents",
    source_commit: "4436cf4a91f12ea555a54ddbba9278480ceaf56d",
  },
  versions: {
    bundle: "0.3.0",
    cli: "0.3.0",
    skills: { "zotero-library-agent": "0.3.0", "zotero-bridge-cli": "0.3.0" },
  },
  identity: {
    release_set_id: "hbrs-48630ca514e3146c2c89a8d5",
    protocol: "host-bridge.v1",
    cli_schema: "zotero-bridge.cli.v2",
    build_fingerprint: "7332a3f4c286d5d7c3d4571c5bcfec9cdfd7faee0abec14a98d91947d3944822",
    command_catalog_checksum: "9f3f82cc60299963ed2660e1c08a9de46db277ef57e199cbad04dd7e14227b40",
    binary_aggregate_sha256: "a0a762d9373b66d8a884e65ded2b46d09036d0677367a6981652b98ad44a6c70",
    content_digests: {
      cli_bundle: "2fe9f579e6948942964efb2bda4a67176219b345b40017d49549b66e11fe2dfd",
      library_agent: "a5d8dddf7b137e1cec4df6377cbb99a5a236d3be4b687a0cccdac88e5ad9516b",
      librarian_profile: "0c50e077ad6accf2bb6c364d3530c342c71698f1b63be5242a63bb9696914cb5",
    },
  },
  license: { expression: "AGPL-3.0-only", source_path: "LICENSES/AGPL-3.0.txt" },
  capabilities: ["bounded-library-query", "current-context-read", "evidence-export", "host-approved-mutation", "host-approved-workflow"],
  runtimes: [
    { platform: "win32-x64", source_path: "literature-adapters/zotero/bin/win32-x64/zotero-bridge.exe", binary: "zotero-bridge.exe", sha256: "eac1c41701d00db66dde6e73e953c693b06dfd8fae48e49268f567f40c283b7a", bytes: 2596352, executable: true },
    { platform: "darwin-x64", source_path: "literature-adapters/zotero/bin/darwin-x64/zotero-bridge", binary: "zotero-bridge", sha256: "26a2a5b69e2ce3b00f4c9138355a00db5d0d05824cec214f637af117986d19a5", bytes: 2613056, executable: true },
    { platform: "darwin-arm64", source_path: "literature-adapters/zotero/bin/darwin-arm64/zotero-bridge", binary: "zotero-bridge", sha256: "fce872a4af930ea3b7c113600c03fe56e0635443225926f88a1ee2a50960f5e0", bytes: 2424864, executable: true },
    { platform: "linux-x86", source_path: "literature-adapters/zotero/bin/linux-x86/zotero-bridge", binary: "zotero-bridge", sha256: "5754922ffaaf108fe285674e199a34e037dfff9649da14022aade87db129efa5", bytes: 2643136, executable: true },
    { platform: "linux-x64", source_path: "literature-adapters/zotero/bin/linux-x64/zotero-bridge", binary: "zotero-bridge", sha256: "18510ca1f85d1ffa1a5c9e5375078f1af5dbd7295fb5478f0a7d35b3e552b64a", bytes: 2484864, executable: true },
    { platform: "linux-arm", source_path: "literature-adapters/zotero/bin/linux-arm/zotero-bridge", binary: "zotero-bridge", sha256: "d45ab2ddb1f549bcbe77c214dac22c4ec99f6883ba57609e0a08f64b87389fa5", bytes: 2105196, executable: true },
    { platform: "linux-arm64", source_path: "literature-adapters/zotero/bin/linux-arm64/zotero-bridge", binary: "zotero-bridge", sha256: "00df6fff8bcc6641673115600d2efe489562ba6d9f49eea57aa90aa6e86b684e", bytes: 2169304, executable: true },
  ],
}] as const;

export const LITERATURE_ADAPTER_CATALOG = validateLiteratureAdapterCatalog(catalog);

export function getLiteratureAdapter(adapterId: string) {
  return LITERATURE_ADAPTER_CATALOG.find((adapter) => adapter.adapter_id === adapterId);
}
