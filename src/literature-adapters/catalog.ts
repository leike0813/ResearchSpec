import { validateLiteratureAdapterCatalog } from "./contracts.js";

export const ZOTERO_LITERATURE_ADAPTER_ID = "zotero-library" as const;

const catalog = [{
  adapter_id: ZOTERO_LITERATURE_ADAPTER_ID,
  install_policy: "fixed",
  skills: [
    {
      skill_id: "zotero-library-agent",
      version: "0.5.2",
      source_path: "literature-adapters/zotero/skills/zotero-library-agent",
      role: "router",
      visibility: "broad-route",
      capabilities: ["bounded-task-routing", "provider-evidence-handoff", "live-readiness-inspection", "structured-recovery"],
      authority_boundary: "none",
      researchspec_workflow_authority: "none",
      hard_skill_dependencies: ["zotero-bridge-cli"],
    },
    {
      skill_id: "zotero-library-query",
      version: "0.5.2",
      source_path: "literature-adapters/zotero/skills/zotero-library-query",
      role: "task",
      visibility: "explicit-or-nested",
      capabilities: ["current-library-query", "provider-evidence-handoff", "live-readiness-inspection", "structured-recovery"],
      authority_boundary: "zotero-read",
      researchspec_workflow_authority: "none",
      hard_skill_dependencies: ["zotero-bridge-cli"],
    },
    {
      skill_id: "zotero-literature-acquisition",
      version: "0.5.2",
      source_path: "literature-adapters/zotero/skills/zotero-literature-acquisition",
      role: "task",
      visibility: "explicit-or-nested",
      capabilities: ["external-literature-acquisition", "duplicate-aware-selection", "provider-evidence-handoff", "live-readiness-inspection", "structured-recovery"],
      authority_boundary: "zotero-acquisition",
      researchspec_workflow_authority: "none",
      hard_skill_dependencies: ["zotero-bridge-cli"],
    },
    {
      skill_id: "zotero-literature-analysis",
      version: "0.5.2",
      source_path: "literature-adapters/zotero/skills/zotero-literature-analysis",
      role: "task",
      visibility: "explicit-or-nested",
      capabilities: ["source-evidence-analysis", "provider-evidence-handoff", "live-readiness-inspection", "structured-recovery"],
      authority_boundary: "zotero-read",
      researchspec_workflow_authority: "none",
      hard_skill_dependencies: ["zotero-bridge-cli"],
    },
    {
      skill_id: "zotero-research-synthesis",
      version: "0.5.2",
      source_path: "literature-adapters/zotero/skills/zotero-research-synthesis",
      role: "task",
      visibility: "explicit-or-nested",
      capabilities: ["cross-source-synthesis", "provider-evidence-handoff", "live-readiness-inspection", "structured-recovery"],
      authority_boundary: "zotero-read",
      researchspec_workflow_authority: "none",
      hard_skill_dependencies: ["zotero-bridge-cli"],
    },
    {
      skill_id: "zotero-library-curation",
      version: "0.5.2",
      source_path: "literature-adapters/zotero/skills/zotero-library-curation",
      role: "task",
      visibility: "explicit-only",
      capabilities: ["approved-library-curation", "duplicate-aware-selection", "live-readiness-inspection", "structured-recovery"],
      authority_boundary: "zotero-curation",
      researchspec_workflow_authority: "none",
      hard_skill_dependencies: ["zotero-bridge-cli"],
    },
    {
      skill_id: "zotero-bridge-cli",
      version: "0.5.2",
      source_path: "literature-adapters/zotero/skills/zotero-bridge-cli",
      role: "mechanism",
      visibility: "mechanism-direct",
      capabilities: ["exact-cli-operations", "live-readiness-inspection", "structured-recovery"],
      authority_boundary: "zotero-mechanism",
      researchspec_workflow_authority: "none",
      hard_skill_dependencies: [],
    },
  ],
  profile_template_path: "literature-adapters/zotero/profile.template.json",
  source: {
    bundle_repository: "leike0813/zotero-library-agent-bundle",
    bundle_tag: "host-bridge/hbrs-8c6de08010d459a0e87e74f2",
    bundle_commit: "ff1475eea7d3fb6cb07dbdd872e3c7603e7f1a19",
    bundle_tree: "a648caba463dbd30bae69315ae57c39e44ca5902",
    source_repository: "leike0813/zotero-agents",
    source_commit: "a0fe8e324834e2fcfd1b513552f9013e9be4b491",
  },
  versions: {
    bundle: "0.5.2",
    cli: "0.5.1",
  },
  identity: {
    release_set_id: "hbrs-8c6de08010d459a0e87e74f2",
    protocol: "host-bridge.v2",
    cli_schema: "zotero-bridge.cli.v5",
    build_fingerprint: "12edeb78c12a7f6c1434f91146d006544d9fbe10d26a32f6b9b6b30698308e77",
    command_catalog_checksum: "6be20b273b8441291dab98dac627bf75b306879a25cb497da23d7b68c0a7bc30",
    binary_aggregate_sha256: "0688a9ba4ad7ff821151c86dc1bd15e5295a6fa6dea0e901ee62920a1bc96f3c",
    content_digests: {
      cli_bundle: "014cb89a1493762094e5cc6d221ffe270d7a9df1c5ac269b612e19ad7db5f2b7",
      library_agent: "c94d8c084a3de308e970ba65fbfd78a7ffbf25858c5c2cc9a870bdb4a8a6881c",
      librarian_profile: "1e6817288b37011ed98cf1b6e26a7b39bb2aee993739daaf879b93e2fe04cbe5",
    },
  },
  license: { expression: "AGPL-3.0-only", source_path: "LICENSES/AGPL-3.0.txt" },
  runtimes: [
    { platform: "win32-x64", source_path: "literature-adapters/zotero/bin/win32-x64/zotero-bridge.exe", binary: "zotero-bridge.exe", sha256: "e66af2a811134175468a4fbb29218dd848f5002a66df8a2d13a74aa191cfff56", bytes: 8051200, executable: true },
    { platform: "darwin-x64", source_path: "literature-adapters/zotero/bin/darwin-x64/zotero-bridge", binary: "zotero-bridge", sha256: "231f18d2413208839e5f05f43273f891548bb2b09f3b7ae52ef7321688d84a25", bytes: 8232516, executable: true },
    { platform: "darwin-arm64", source_path: "literature-adapters/zotero/bin/darwin-arm64/zotero-bridge", binary: "zotero-bridge", sha256: "f3e5dee58a69db2765b6e632d9324b7645829dfd837a29b64babcf5ee752d1a0", bytes: 7682880, executable: true },
    { platform: "linux-x86", source_path: "literature-adapters/zotero/bin/linux-x86/zotero-bridge", binary: "zotero-bridge", sha256: "e7d862cb1076331bda89a12a9ca2ddbac7f015b281898179617d7cc022c043cc", bytes: 8063208, executable: true },
    { platform: "linux-x64", source_path: "literature-adapters/zotero/bin/linux-x64/zotero-bridge", binary: "zotero-bridge", sha256: "c0fbbd10ff6ee4333cf8c96711575d40a3435f008791c4a2d8eec252090563d3", bytes: 7762024, executable: true },
    { platform: "linux-arm", source_path: "literature-adapters/zotero/bin/linux-arm/zotero-bridge", binary: "zotero-bridge", sha256: "0a29fc1cfe49b92382f29dae3d06d12b812ddc2242bcb5c9bdf8fd89fc41891a", bytes: 6246012, executable: true },
    { platform: "linux-arm64", source_path: "literature-adapters/zotero/bin/linux-arm64/zotero-bridge", binary: "zotero-bridge", sha256: "223241c8c69e059331d7abb58bf689dea26edc5ec33c5111db17cd4f6f26ec18", bytes: 6788592, executable: true },
  ],
}] as const;

export const LITERATURE_ADAPTER_CATALOG = validateLiteratureAdapterCatalog(catalog);
export const LITERATURE_ADAPTER_SKILL_IDS = LITERATURE_ADAPTER_CATALOG.flatMap((adapter) =>
  adapter.skills.map((skill) => skill.skill_id)
);

export function getLiteratureAdapter(adapterId: string) {
  return LITERATURE_ADAPTER_CATALOG.find((adapter) => adapter.adapter_id === adapterId);
}
