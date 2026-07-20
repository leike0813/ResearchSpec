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
    bundle_tag: "host-bridge/hbrs-3d834c0f075f3122ac566e9a",
    bundle_commit: "01f4c670881d510f6f29e4df7c75ec547257b300",
    bundle_tree: "6260c0da65a643569353337934e95738f530f3ad",
    source_repository: "leike0813/zotero-agents",
    source_commit: "033e97e04610e9f4390f646cd5598367a930427a",
  },
  versions: {
    bundle: "0.3.1",
    cli: "0.3.0",
    skills: { "zotero-library-agent": "0.3.1", "zotero-bridge-cli": "0.3.1" },
  },
  identity: {
    release_set_id: "hbrs-3d834c0f075f3122ac566e9a",
    protocol: "host-bridge.v1",
    cli_schema: "zotero-bridge.cli.v2",
    build_fingerprint: "7332a3f4c286d5d7c3d4571c5bcfec9cdfd7faee0abec14a98d91947d3944822",
    command_catalog_checksum: "9f3f82cc60299963ed2660e1c08a9de46db277ef57e199cbad04dd7e14227b40",
    binary_aggregate_sha256: "a0a762d9373b66d8a884e65ded2b46d09036d0677367a6981652b98ad44a6c70",
    content_digests: {
      cli_bundle: "8805279187aa23055aa5529408e77f62c12df0378d22920f07ff2804bd20026d",
      library_agent: "a0c81445ed2d78481463321d21bcaa3f5de789e352752faf2de6f6d7b5c50a02",
      librarian_profile: "483ccf5e8bd90fe7e322bdf3cdc5e226a7e0bcf3ac4a422b5d14eacc6ca44dbf",
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
