import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { parse as parseYaml } from "yaml";

const packageRoot = process.cwd();
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "researchspec-release-"));
const packageDirectory = path.join(temporaryRoot, "package");
const installDirectory = path.join(temporaryRoot, "install");
const projectDirectory = path.join(temporaryRoot, "project");
const allToolsProjectDirectory = path.join(temporaryRoot, "all-tools-project");
const strictProjectDirectory = path.join(temporaryRoot, "strict-project");
const codexHome = path.join(temporaryRoot, "codex-home");
const expectedSkills = [
  "academic-paper",
  "academic-paper-reviewer",
  "academic-pipeline",
  "deep-research",
  "researchspec-decide",
  "researchspec-navigate",
  "researchspec-propose",
  "researchspec-verify",
  "zotero-bridge-cli",
  "zotero-library-agent",
  "zotero-library-curation",
  "zotero-library-query",
  "zotero-literature-acquisition",
  "zotero-literature-analysis",
  "zotero-research-synthesis",
];
const expectedAdapterSkills = [
  "zotero-library-agent",
  "zotero-library-query",
  "zotero-literature-acquisition",
  "zotero-literature-analysis",
  "zotero-research-synthesis",
  "zotero-library-curation",
  "zotero-bridge-cli",
];
const expectedCommands = [
  "advance", "archive", "check", "decide", "doctor", "handoff", "init", "instructions", "list",
  "pack", "plugin", "propose", "show", "start", "status", "submit", "update",
];
const expectedDomains = [
  "accounting-auditing-and-accountability", "analytical-chemistry", "applied-mathematics", "artificial-intelligence", "astronomical-sciences",
  "biochemistry-and-cell-biology", "bioinformatics-and-computational-biology",
  "banking-finance-and-investment", "clinical-sciences", "computational-modeling-and-simulation", "computer-vision-and-multimedia-computation",
  "control-engineering-mechatronics-and-robotics",
  "curriculum-and-pedagogy", "data-management-and-data-science", "design", "distributed-computing-and-systems-software",
  "education-systems",
  "ecological-applications", "ecology", "epidemiology", "evolutionary-biology",
  "experimental-design-and-data-analysis", "fluid-mechanics-and-thermal-engineering", "genetics",
  "geoinformatics", "geomatic-engineering",
  "health-services-and-systems", "human-centred-computing", "immunology", "inorganic-chemistry",
  "heritage-archive-and-museum-studies", "historical-studies", "laboratory-automation-and-informatics", "library-and-information-studies", "machine-learning",
  "macromolecular-and-materials-chemistry", "materials-engineering", "medical-and-biological-physics",
  "medical-biochemistry-and-metabolomics", "medical-biotechnology", "medical-microbiology",
  "medicinal-and-biomolecular-chemistry", "microbiology", "neurosciences", "numerical-and-computational-mathematics",
  "oncology-and-carcinogenesis",
  "organic-chemistry", "pharmacology-and-pharmaceutical-sciences", "physical-chemistry", "plant-biology", "statistics",
  "quantum-physics", "research-computing-infrastructure", "scientific-visualization-and-communication", "specialist-studies-in-education", "theory-of-computation",
].sort();

try {
  await verifyRepositoryRuntimeGuidance(packageRoot);
  await Promise.all([
    mkdir(packageDirectory, { recursive: true }),
    mkdir(installDirectory, { recursive: true }),
    mkdir(projectDirectory, { recursive: true }),
    mkdir(allToolsProjectDirectory, { recursive: true }),
    mkdir(strictProjectDirectory, { recursive: true }),
    mkdir(codexHome, { recursive: true }),
  ]);

  const pack = run(npmCommand(), ["pack", "--json", "--pack-destination", packageDirectory], packageRoot);
  const metadata = parsePackMetadata(pack.stdout);
  verifyTarballFiles(metadata.files.map((file) => file.path));

  const tarball = path.join(packageDirectory, metadata.filename);
  await writeFile(path.join(installDirectory, "package.json"), "{\"private\":true}\n", "utf8");
  run(npmCommand(), ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], installDirectory);

  const installedPackageRoot = path.join(installDirectory, "node_modules", "researchspec");
  const handbookDigest = await verifyPackagedDocumentation(installedPackageRoot, metadata.files.map((file) => file.path));
  const bin = path.join(installDirectory, "node_modules", ".bin", process.platform === "win32" ? "researchspec.cmd" : "researchspec");
  const version = run(bin, ["--version"], installDirectory).stdout.trim();
  assert(version === "0.1.0", `Installed CLI version mismatch: ${version}`);
  const help = run(bin, ["--help"], installDirectory).stdout;
  const commandSection = help.split(/Commands:\r?\n/)[1] ?? "";
  const commands = [...commandSection.matchAll(/^  ([a-z][a-z-]*)(?:\s|$)/gm)]
    .map((match) => match[1])
    .filter((command) => command && command !== "help")
    .sort();
  assert(equal(commands, expectedCommands), `Installed command surface mismatch: ${commands.join(", ")}`);
  const pluginList = JSON.parse(run(bin, ["plugin", "list", "--json"], installDirectory).stdout);
  const domainIds = (pluginList.data?.domains ?? []).map((item) => item.domain_id).sort();
  assert(equal(domainIds, expectedDomains), `Installed domain catalog mismatch: ${domainIds.join(", ")}`);
  const packagedEducationRoot = path.join(installDirectory, "node_modules", "researchspec", "skills", "plugins", "vendors", "education-agent-skills");
  const teacherSkill = await readFile(path.join(packagedEducationRoot, "education-agent-skills-error-analysis-protocol", "SKILL.md"), "utf8");
  const studentSkill = await readFile(path.join(packagedEducationRoot, "education-agent-skills-stuck-and-error-diagnosis-coach", "SKILL.md"), "utf8");
  assert(teacherSkill.includes("⟦UNRESOLVED⟧") && teacherSkill.includes("ResearchSpec evidence boundary"), "Installed teacher-facing Education Skill lost unresolved evidence disclosure.");
  assert(studentSkill.includes("audience: student") && studentSkill.includes("ResearchSpec minors boundary"), "Installed student-facing Education Skill lost its audience or learner-safety boundary.");
  for (const skillId of ["education-agent-skills-error-analysis-protocol", "education-agent-skills-stuck-and-error-diagnosis-coach"]) {
    const license = await readFile(path.join(packagedEducationRoot, skillId, "LICENSE"), "utf8");
    const notice = await readFile(path.join(packagedEducationRoot, skillId, "NOTICE.md"), "utf8");
    assert(license.includes("Attribution-ShareAlike 4.0"), `Installed Education Skill license mismatch: ${skillId}`);
    assert(notice.includes("Gareth Manning") && notice.includes("ResearchSpec changed"), `Installed Education Skill notice mismatch: ${skillId}`);
  }

  const environment = { ...process.env, CODEX_HOME: codexHome };
  run(bin, ["init", projectDirectory, "--tools", "codex", "--json"], installDirectory, environment);
  const defaultWorkflow = parseYaml(await readFile(path.join(projectDirectory, "researchspec", "specs", "workflow.yaml"), "utf8"));
  const defaultState = parseYaml(await readFile(path.join(projectDirectory, "researchspec", "runs", "current", "state.yaml"), "utf8"));
  assert(defaultWorkflow?.mode === "adaptive", "Unqualified installed init did not select the adaptive profile.");
  assert(defaultState?.profile_mode === "adaptive", "Unqualified installed init did not create adaptive CaseState authority.");
  const installedSkills = (await directoryNames(path.join(projectDirectory, ".codex", "skills"))).sort();
  assert(equal(installedSkills, expectedSkills), `Installed Skill surface mismatch: ${installedSkills.join(", ")}`);
  for (const skill of expectedSkills) {
    const license = await readFile(path.join(projectDirectory, ".codex", "skills", skill, "LICENSE"), "utf8");
    assert(license.trim().length > 0, `Installed Skill license is empty: ${skill}`);
  }
  await verifyInstalledGuidance(installedPackageRoot, projectDirectory, handbookDigest);
  const adapterRoot = path.join(projectDirectory, ".zotero-bridge");
  await readFile(path.join(adapterRoot, "profile.template.json"), "utf8");
  const runtime = expectedRuntime(process.platform, process.arch);
  assert(runtime, `Release verification platform is unsupported: ${process.platform}-${process.arch}`);
  const runtimePath = path.join(adapterRoot, "bin", runtime);
  const runtimeInfo = await stat(runtimePath);
  assert(runtimeInfo.isFile(), `Installed Zotero runtime is not a file: ${runtimePath}`);
  if (process.platform !== "win32") assert((runtimeInfo.mode & 0o111) !== 0, `Installed Zotero runtime is not executable: ${runtimePath}`);
  if (process.platform === "win32") await readFile(path.join(adapterRoot, "bin", "zotero-bridge.cmd"), "utf8");
  const installationManifest = JSON.parse(await readFile(path.join(projectDirectory, "researchspec", "tool-installation-manifest.json"), "utf8"));
  assert(installationManifest.literature_adapter_resolutions?.length === 1, "Installed manifest has no fixed literature adapter resolution.");
  assert(installationManifest.literature_adapter_resolutions[0].projection_state === "complete", "Installed literature adapter Skill projection is incomplete.");
  const prompts = (await readdir(path.join(codexHome, "prompts"))).filter((file) => file.startsWith("researchspec-") && file.endsWith(".md")).sort();
  assert(prompts.length === 8, `Installed Codex prompt count mismatch: ${String(prompts.length)}`);
  run(bin, ["check", "all", "--strict", "--json"], projectDirectory, environment);

  run(bin, ["init", allToolsProjectDirectory, "--tools", "all", "--json"], installDirectory, environment);
  await verifyAllToolDelivery(allToolsProjectDirectory, handbookDigest);

  run(bin, ["init", strictProjectDirectory, "--tools", "none", "--profile", "strict", "--json"], installDirectory, environment);
  const strictWorkspace = path.join(strictProjectDirectory, "researchspec");
  const strictAuthorityPaths = ["config.yaml", "specs/workflow.yaml", "runs/current/state.yaml"];
  const strictAuthority = new Map(await Promise.all(strictAuthorityPaths.map(async (relativePath) => [
    relativePath,
    await readFile(path.join(strictWorkspace, relativePath), "utf8"),
  ])));
  const strictWorkflow = parseYaml(strictAuthority.get("specs/workflow.yaml"));
  const strictState = parseYaml(strictAuthority.get("runs/current/state.yaml"));
  assert(strictWorkflow?.schema_version === "0.2", "Explicit strict init did not create the Schema 0.2 workflow.");
  assert(strictState?.schema_version === "0.2", "Explicit strict init did not create Schema 0.2 state.");
  run(bin, ["update", strictWorkspace, "--tools", "none", "--json"], installDirectory, environment);
  assert(await readFile(path.join(strictWorkspace, "runs/current/state.yaml"), "utf8") === strictAuthority.get("runs/current/state.yaml"), "Ordinary update changed strict runtime authority.");

  const migrationPreview = JSON.parse(run(bin, ["update", strictWorkspace, "--migrate-runtime", "--dry-run", "--json"], installDirectory, environment).stdout);
  const migrationPlan = migrationPreview.data?.plan;
  assert(migrationPlan?.executable === true && /^[a-f0-9]{64}$/.test(migrationPlan.plan_sha256), "Installed migration preview is unavailable or non-deterministic.");
  const migration = JSON.parse(run(bin, ["update", strictWorkspace, "--migrate-runtime", "--yes", "--expected-plan-sha256", migrationPlan.plan_sha256, "--json"], installDirectory, environment).stdout);
  const migrationId = migration.data?.identity?.migration_id;
  assert(typeof migrationId === "string", "Installed migration did not return a migration identity.");
  const migratedState = parseYaml(await readFile(path.join(strictWorkspace, "runs/current/state.yaml"), "utf8"));
  assert(migratedState?.profile_mode === "adaptive", "Installed migration did not commit adaptive state.");

  const rollbackPreview = JSON.parse(run(bin, ["update", strictWorkspace, "--migrate-runtime", "--rollback", migrationId, "--dry-run", "--json"], installDirectory, environment).stdout);
  const rollbackPlan = rollbackPreview.data?.plan;
  assert(rollbackPlan?.executable === true && /^[a-f0-9]{64}$/.test(rollbackPlan.plan_sha256), "Installed migration rollback preview is unavailable.");
  run(bin, ["update", strictWorkspace, "--migrate-runtime", "--rollback", migrationId, "--yes", "--expected-plan-sha256", rollbackPlan.plan_sha256, "--json"], installDirectory, environment);
  for (const [relativePath, original] of strictAuthority) {
    assert(await readFile(path.join(strictWorkspace, relativePath), "utf8") === original, `Installed rollback did not restore ${relativePath}.`);
  }

  process.stdout.write(`Release package verified: ${metadata.filename} (${String(metadata.files.length)} files, ${String(metadata.unpackedSize)} bytes unpacked)\n`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

function verifyTarballFiles(files) {
  const required = [
    "package.json", "README.md", "CHANGELOG.md", "SECURITY.md", "LICENSE", "NOTICE",
    "LICENSES/MIT.txt", "LICENSES/CC-BY-NC-4.0.txt", "LICENSES/CC-BY-SA-4.0.txt", "LICENSES/Apache-2.0.txt", "LICENSES/AGPL-3.0.txt", "docs/release_process.md",
    "docs/arsu_user_usage_model.md", "docs/cli_handbook.md", "docs/cli_interface_design.md", "docs/domain_skill_plugins.md", "docs/domain_taxonomy.md", "docs/education_agent_skills_vendor_adapter.md", "docs/literature_system_adapters.md", "docs/finrobot_vendor_adapter.md", "docs/histagent_vendor_adapter.md", "docs/materials_science_skills_vendor_adapter.md", "docs/scientific_agent_skills_vendor_adapter.md", "docs/tooluniverse_vendor_adapter.md",
    "literature-adapters/zotero/profile.template.json",
    "literature-adapters/zotero/LICENSE",
    "literature-adapters/zotero/NOTICE.md",
    "literature-adapters/zotero/DERIVATION.json",
    "literature-adapters/zotero/conversion-manifest.json",
    "literature-adapters/zotero/bin/win32-x64/zotero-bridge.exe",
    "literature-adapters/zotero/bin/darwin-x64/zotero-bridge",
    "literature-adapters/zotero/bin/darwin-arm64/zotero-bridge",
    "literature-adapters/zotero/bin/linux-x86/zotero-bridge",
    "literature-adapters/zotero/bin/linux-x64/zotero-bridge",
    "literature-adapters/zotero/bin/linux-arm/zotero-bridge",
    "literature-adapters/zotero/bin/linux-arm64/zotero-bridge",
    "skills/plugins/registry.json", "skills/plugins/vendor-bundles/tooluniverse.json", "skills/plugins/vendor-manifests/tooluniverse.json",
    "skills/plugins/conversion-reports/tooluniverse.md",
    "skills/plugins/vendors/tooluniverse/tooluniverse-statistical-modeling/SKILL.md",
    "skills/plugins/vendor-bundles/scientific-agent-skills.json", "skills/plugins/vendor-manifests/scientific-agent-skills.json",
    "skills/plugins/conversion-reports/scientific-agent-skills.md",
    "skills/plugins/vendors/scientific-agent-skills/scientific-agent-skills-astropy/SKILL.md",
    "skills/plugins/vendor-bundles/materials-science-skills-for-llm.json", "skills/plugins/vendor-manifests/materials-science-skills-for-llm.json",
    "skills/plugins/conversion-reports/materials-science-skills-for-llm.md",
    "skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-apex-alloy-workflows/SKILL.md",
    "skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-apex-alloy-workflows/references/property-parameters.md",
    "skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-apex-alloy-workflows/LICENSE",
    "skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-apex-alloy-workflows/NOTICE.md",
    "skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-apex-alloy-workflows/DERIVATION.json",
    "skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-atomsk-cli/SKILL.md",
    "skills/plugins/vendors/materials-science-skills-for-llm/materials-science-skills-atomsk-cli/DERIVATION.json",
    "skills/plugins/vendor-bundles/finrobot.json", "skills/plugins/vendor-manifests/finrobot.json",
    "skills/plugins/conversion-reports/finrobot.md",
    "skills/plugins/vendors/finrobot/financial-research-relative-valuation/SKILL.md",
    "skills/plugins/vendors/finrobot/financial-research-relative-valuation/LICENSE",
    "skills/plugins/vendors/finrobot/financial-research-relative-valuation/NOTICE",
    "skills/plugins/vendors/finrobot/financial-research-relative-valuation/DERIVATION.json",
    "skills/plugins/vendors/finrobot/financial-research-relative-valuation/lib/financial_support.py",
    "skills/plugins/vendors/finrobot/financial-research-relative-valuation/scripts/valuation.py",
    "skills/plugins/vendors/finrobot/financial-research-competitive-position/SKILL.md",
    "skills/plugins/vendor-bundles/histagent.json", "skills/plugins/vendor-manifests/histagent.json",
    "skills/plugins/conversion-reports/histagent.md",
    "skills/plugins/vendors/histagent/histagent-historical-research/SKILL.md",
    "skills/plugins/vendors/histagent/histagent-historical-research/LICENSE",
    "skills/plugins/vendors/histagent/histagent-historical-research/NOTICE",
    "skills/plugins/vendors/histagent/histagent-historical-research/DERIVATION.json",
    "skills/plugins/vendors/histagent/histagent-historical-research/lib/historical_support.py",
    "skills/plugins/vendors/histagent/histagent-historical-research/scripts/research_runtime.py",
    "skills/plugins/vendor-bundles/education-agent-skills.json", "skills/plugins/vendor-manifests/education-agent-skills.json",
    "skills/plugins/conversion-reports/education-agent-skills.md",
    "skills/plugins/vendors/education-agent-skills/education-agent-skills-error-analysis-protocol/SKILL.md",
    "skills/plugins/vendors/education-agent-skills/education-agent-skills-error-analysis-protocol/LICENSE",
    "skills/plugins/vendors/education-agent-skills/education-agent-skills-error-analysis-protocol/NOTICE.md",
    "skills/plugins/vendors/education-agent-skills/education-agent-skills-stuck-and-error-diagnosis-coach/SKILL.md",
    "skills/plugins/vendors/education-agent-skills/education-agent-skills-stuck-and-error-diagnosis-coach/LICENSE",
    "skills/plugins/vendors/education-agent-skills/education-agent-skills-stuck-and-error-diagnosis-coach/NOTICE.md",
    "skills/arsu/researchspec-contracts.json", "artifacts/mvp_release_checklist.md", "dist/src/cli/bin.js",
  ];
  for (const skill of expectedSkills.slice(0, 4)) {
    required.push(`skills/arsu/${skill}/SKILL.md`, `skills/arsu/${skill}/LICENSE`, `skills/arsu/${skill}/NOTICE.md`);
  }
  for (const skill of expectedAdapterSkills) {
    const root = `literature-adapters/zotero/skills/${skill}`;
    required.push(
      `${root}/SKILL.md`,
      `${root}/LICENSE`,
      `${root}/NOTICE.md`,
      `${root}/DERIVATION.json`,
      `${root}/assets/runner.json`,
      `${root}/assets/output.schema.json`,
    );
  }
  for (const item of required) assert(files.includes(item), `Tarball is missing required file: ${item}`);
  const educationFiles = files.filter((file) => file.startsWith("skills/plugins/vendors/education-agent-skills/"));
  assert(educationFiles.length === 136 * 3, `Tarball Education Skill file count mismatch: ${String(educationFiles.length)}`);
  assert(
    educationFiles.every((file) => /\/(?:SKILL\.md|LICENSE|NOTICE\.md)$/.test(file)),
    "Tarball Education Skills contain an unexpected asset.",
  );
  const adapterRuntimeFiles = files.filter((file) => /^literature-adapters\/zotero\/bin\/[^/]+\/zotero-bridge(?:\.exe)?$/.test(file));
  assert(adapterRuntimeFiles.length === 7, `Tarball Zotero runtime count mismatch: ${String(adapterRuntimeFiles.length)}`);
  const adapterOpaqueFiles = files.filter((file) =>
    /^literature-adapters\/zotero\/skills\/[^/]+\/assets\/(?:runner|output\.schema)\.json$/.test(file)
  );
  assert(adapterOpaqueFiles.length === 14, `Tarball Zotero opaque runtime metadata count mismatch: ${String(adapterOpaqueFiles.length)}`);

  const allowed = /^(?:package\.json|README\.md|CHANGELOG\.md|SECURITY\.md|LICENSE|NOTICE|LICENSES\/[^/]+|docs\/(?:release_process|arsu_user_usage_model|cli_handbook|cli_interface_design|domain_skill_plugins|domain_taxonomy|education_agent_skills_vendor_adapter|literature_system_adapters|finrobot_vendor_adapter|histagent_vendor_adapter|materials_science_skills_vendor_adapter|scientific_agent_skills_vendor_adapter|tooluniverse_vendor_adapter)\.md|artifacts\/mvp_release_checklist\.md|dist\/src\/.*\.js|skills\/.*|literature-adapters\/.*)$/;
  const retired = /^dist\/src\/adapters\/companion\/workflows\/(?:archive|check|context|explore|next|submit)\.js$/;
  for (const file of files) {
    assert(allowed.test(file), `Tarball contains a path outside the release allowlist: ${file}`);
    assert(!file.startsWith("playbooks/"), `Tarball contains repository-only playbook material: ${file}`);
    assert(file !== "artifacts/researchspec_dogfooding_guide.md", `Tarball contains the retired dogfooding guide: ${file}`);
    assert(!file.startsWith("dist/tests/"), `Tarball contains compiled tests: ${file}`);
    assert(!file.startsWith("tests/fixtures/domain-skill-plugins/"), `Tarball contains plugin test fixtures: ${file}`);
    assert(!file.startsWith("vendor/tooluniverse/"), `Tarball contains the ToolUniverse source checkout: ${file}`);
    assert(!file.startsWith("vendor/scientific-agent-skills/"), `Tarball contains the Scientific Agent Skills source checkout: ${file}`);
    assert(!file.startsWith("vendor/materials-science-skills-for-llm/"), `Tarball contains the Materials-Science-Skills-For-LLM source checkout: ${file}`);
    assert(!file.startsWith("vendor/finrobot/"), `Tarball contains the FinRobot source checkout: ${file}`);
    assert(!file.startsWith("vendor/histagent/"), `Tarball contains the HistAgent source checkout: ${file}`);
    assert(!file.startsWith("vendor/education-agent-skills/"), `Tarball contains the Education Agent Skills source checkout: ${file}`);
    assert(!file.startsWith("vendor/zotero-library-agent-bundle/"), `Tarball contains the Zotero adapter maintenance checkout: ${file}`);
    assert(!file.startsWith("audits/"), `Tarball contains maintainer-only vendor audit evidence: ${file}`);
    assert(!file.startsWith("dist/src/vendor-audits/"), `Tarball contains maintainer-only vendor audit code: ${file}`);
    assert(!file.startsWith("dist/src/vendor-evidence/"), `Tarball contains maintainer-only vendor evidence code: ${file}`);
    assert(!file.startsWith("dist/src/vendor-converters/education-agent-skills/"), `Tarball contains maintainer-only Education conversion code: ${file}`);
    assert(!file.startsWith("dist/src/vendor-converters/zotero-library-agent-bundle/"), `Tarball contains maintainer-only Zotero conversion code: ${file}`);
    assert(!file.includes("/curation/"), `Tarball contains maintainer-only curation inputs: ${file}`);
    assert(!/^skills\/plugins\/vendors\/finrobot\/[^/]+\/(?:dependencies\.json|references\/|resources\/|agents\/)/.test(file), `Tarball contains an obsolete or unjustified FinRobot asset: ${file}`);
    assert(!/(?:admission|relationship|file|external-resource)-decisions\.json$/.test(file), `Tarball contains maintainer-only production decisions: ${file}`);
    assert(!file.endsWith(".d.ts"), `Tarball contains TypeScript declarations: ${file}`);
    assert(!file.endsWith(".js.map"), `Tarball contains source maps: ${file}`);
    assert(!retired.test(file), `Tarball contains a retired Companion workflow: ${file}`);
  }
}

async function verifyRepositoryRuntimeGuidance(root) {
  const read = async (relativePath) => readFile(path.join(root, relativePath), "utf8");
  await assertTokens(read, "docs/researchspec_arsu_runtime/README.md", [
    "新 workspace 默认使用 adaptive runtime",
    "17 个顶层 CLI 命令",
    "15 个固定 Skills：4 个 ARSU、4 个 Companion、7 个 Zotero Adapter",
  ]);
  await assertTokens(read, "docs/researchspec_arsu_runtime/runtime_protocols.md", [
    "status → instructions <selector> → start / submit / advance / decide → next_selectors → 定向读取",
    "adaptive protocol",
    "strict compatibility protocol",
  ]);
  await assertFacts(read, "docs/researchspec_arsu_runtime/runtime_protocols.md", [
    {
      name: "Doctor recovery remains diagnostic and plan-bound",
      tokens: ["`doctor` 不自行选择修复：默认只读", "唯一可推导的控制面事实", "repair plan", "repair 是 `plan_bound`", "repair receipt", "authority"],
    },
    {
      name: "contract changes and draft patches remain separate lifecycles",
      tokens: ["高影响 contract change 通过 `propose`", "`revision_patch` 是 draft-patch lifecycle", "base artifact/hash", "ARSU producer 不直接覆盖原稿"],
    },
  ]);
  await assertTokens(read, "docs/researchspec_arsu_runtime/adaptive_runtime_protocol.md", [
    "新 workspace 由 `researchspec init` 创建为 adaptive runtime",
    "Action v2 risk policy",
    "case-action:",
  ]);
  await assertFacts(read, "docs/researchspec_arsu_runtime/adaptive_runtime_protocol.md", [
    {
      name: "adaptive pipeline is an obligation route rather than a strict graph",
      tokens: ["`academic-pipeline` 在 adaptive 中是一个 route", "obligations/evidence/completion", "不承诺 strict 的 parent/child stage graph", "动态 revision-round template"],
    },
  ]);
  await assertTokens(read, "docs/researchspec_arsu_runtime/strict_runtime_protocol.md", [
    "它不是新 workspace 的默认模型",
    "update --migrate-runtime",
    "Schema `0.2`",
  ]);
  await assertFacts(read, "docs/researchspec_arsu_runtime/academic_paper_workflow.md", [
    {
      name: "revision_patch is a patch case action rather than an obligation or work item",
      tokens: ["`revision_patch` 不作为 adaptive obligation output", "draft-patch lifecycle", "base artifact/hash", "submit patch:", "decide patch:", "advance patch:"],
    },
  ]);

  await assertFacts(read, "docs/researchspec_arsu_runtime/diagrams/src/adaptive-pipeline-route.puml", [
    {
      name: "adaptive pipeline begins from a canonical route selector",
      tokens: ["instructions subflow:tpl-academic-pipeline-end-to-end", "instructions obligation:<instance>/<id>"],
      forbidden: ["instructions subflow:academic-pipeline\n"],
    },
  ]);
  await assertFacts(read, "docs/researchspec_arsu_runtime/diagrams/src/adaptive-obligation-lifecycle.puml", [
    {
      name: "adaptive obligation writes retain the attempt ledger and evidence registry split",
      tokens: ["candidate / attempt material", "operation: record_attempt", "append attempt ledger only", "operation: accept_evidence", "registry + accepted evidence in state"],
    },
  ]);
  await assertFacts(read, "docs/researchspec_arsu_runtime/diagrams/src/transaction-write-sets.dot", [
    {
      name: "strict transitions write their receipt before authority state",
      tokens: ["advance -> transition_receipt -> state [label=\"authority last\"]"],
    },
    {
      name: "decisions append only after applying receipt-backed targets",
      tokens: ["decide -> apply_receipt -> targets -> registry -> decision_ledger [label=\"append last\"]"],
    },
  ]);
  await assertFacts(read, "docs/researchspec_arsu_runtime/diagrams/src/system-architecture.puml", [
    { name: "agents do not hand-edit authority files", tokens: ["never hand-edit authority files."] },
  ]);
  await assertFacts(read, "docs/researchspec_arsu_runtime/diagrams/src/runtime-control-loop.puml", [
    {
      name: "descriptor policies bind direct, confirmed, and plan-bound execution differently",
      tokens: [
        "descriptor policy, producer, inputs, output and validation",
        "alt policy = direct", "Submit once with current action basis",
        "else policy = human_confirmed", "request named confirmation for exact action", "Submit once with confirmer identity",
        "else policy = plan_bound", "preview Submit", "plan_sha256", "execute with expected plan hash",
      ],
      forbidden: ["dry-run then expected-plan execution", "Submit dry-run then expected-hash execution"],
    },
    {
      name: "writes continue through directed next selectors instead of blanket full-status reads",
      tokens: ["identities, effects and next_selectors", "directed instructions / show / list read", "reroute, conflict, or no selector", "full status --json"],
    },
  ]);
  await assertNoPatterns(
    read,
    "docs/researchspec_arsu_runtime/diagrams/src/runtime-control-loop.puml",
    "workflow writes must not use blanket dry-run or expected-plan execution",
    [/\b(?:Start|Submit|Decide|Advance)\s+dry-run\b/i, /\b(?:Start|Submit|Decide|Advance)\b[^\n]*\bexpected-(?:plan|hash)\b/i],
  );
  await assertRuntimeControlStatusReads(read, "docs/researchspec_arsu_runtime/diagrams/src/runtime-control-loop.puml");
  await assertOrderedTokens(
    read,
    "docs/researchspec_arsu_runtime/diagrams/src/academic-paper-workflow.puml",
    "draft patches submit, resolve, then only apply after acceptance",
    [
      "submit patch:<patch-id>", "patch submit receipt + pending patch", "decide patch:<patch-id> resolve",
      "alt accepted", "advance patch:<patch-id> apply", "revised draft + apply report + apply receipts",
    ],
  );
  await assertFacts(read, "docs/researchspec_arsu_runtime/diagrams/src/academic-paper-workflow.puml", [
    {
      name: "deciding a patch does not itself apply it",
      tokens: ["else rejected or postponed", "no apply; retain resolution or pending state"],
      forbidden: ["decide patch:<patch-id>\n    CLI -> Files : accepted patch apply"],
    },
  ]);
  await assertVisibleSvgTokens(read, "docs/researchspec_arsu_runtime/diagrams/rendered/runtime-control-loop.svg", [
    "policy = direct", "policy = human_confirmed", "policy = plan_bound",
    "next_selectors", "directed instructions / show / list read", "full status --json",
  ]);
  await assertVisibleSvgTokens(read, "docs/researchspec_arsu_runtime/diagrams/rendered/academic-paper-workflow.svg", [
    "submit patch", "pending patch", "decide patch", "advance patch", "no apply", "revised draft + apply report",
  ]);

  const diagrams = [
    ["academic-paper-reviewer-workflow", "puml"], ["academic-paper-workflow", "puml"],
    ["academic-pipeline-mid-entry", "puml"], ["academic-pipeline-workflow", "puml"],
    ["adaptive-obligation-lifecycle", "puml"], ["adaptive-pipeline-route", "puml"],
    ["contract-change-lifecycle", "puml"], ["deep-research-workflow", "puml"],
    ["frontier-evaluation", "dot"], ["revision-round", "puml"], ["runtime-control-loop", "puml"],
    ["system-architecture", "puml"], ["transaction-write-sets", "dot"], ["two-level-openspec-model", "puml"],
  ];
  assert(diagrams.length === 14, "Runtime diagram contract must define fourteen source/SVG pairs.");
  for (const [name, extension] of diagrams) {
    const source = await read(`docs/researchspec_arsu_runtime/diagrams/src/${name}.${extension}`);
    const rendered = await read(`docs/researchspec_arsu_runtime/diagrams/rendered/${name}.svg`);
    const title = source.match(/^title\s+(.+)$/m)?.[1] ?? source.match(/label="([^"]+)"/)?.[1];
    assert(title, `Runtime diagram source has no stable title: ${name}`);
    assert(rendered.includes(title), `Rendered runtime diagram does not match its source title: ${name}`);
  }
}

async function verifyInstalledGuidance(installedPackageRoot, projectRoot, handbookDigest) {
  const contracts = JSON.parse(await readFile(path.join(installedPackageRoot, "skills", "arsu", "researchspec-contracts.json"), "utf8"));
  assert(contracts.integration_profile === "researchspec-preflight-v9", "Installed ARSU contracts do not use preflight v9.");
  for (const skill of expectedSkills.slice(0, 4)) {
    assert(contracts.skill_groups?.[skill]?.profile_id === "researchspec-preflight-v9", `Installed ARSU profile is not v9: ${skill}`);
    await assertTokens(
      (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8"),
      path.join(".codex", "skills", skill, "SKILL.md"),
      [
        "<!-- researchspec-contract-preflight:v9 -->", "profile.mode", "action descriptor",
        "`direct`", "`human_confirmed`", "`plan_bound`", "`next_selectors`",
      ],
    );
    await assertFacts(
      (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8"),
      path.join(".codex", "skills", skill, "SKILL.md"),
      [
        {
          name: "adaptive selectors are distinct from strict graph selectors",
          tokens: ["`obligation:<instance>/<id>`", "`completion:<instance>/<id>`", "`case-action:<id>`", "`patch:<id>`", "`change:<id>`", "`work:<instance>/<node>`", "`transition:<instance>/<node>`"],
        },
        {
          name: "adaptive patch handling does not create an obligation or work item",
          tokens: ["Adaptive work has no `work:` or `transition:` graph", "draft patches only through their returned", "`change:` or `patch:` case actions"],
        },
      ],
    );
  }
  for (const companion of ["researchspec-navigate", "researchspec-propose", "researchspec-decide", "researchspec-verify"]) {
    await assertTokens(
      (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8"),
      path.join(".codex", "skills", companion, "SKILL.md"),
      [
        "## Shared CLI Discipline", "researchspec status --json", "researchspec instructions <selector> --json",
        "`direct`", "`human_confirmed`", "`plan_bound`", "`next_selectors`",
      ],
    );
    await assertFacts(
      (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8"),
      path.join(".codex", "skills", companion, "SKILL.md"),
      [
        {
          name: "execution policies retain different binding rules",
          tokens: [
            "`direct`: the CLI plans and revalidates during the single invocation", "do not manufacture or replay a plan hash",
            "`human_confirmed`: explain the exact semantic consequence", "named human confirmation",
            "`plan_bound`: preview the exact semantic payload with `--dry-run --json`", "`plan_sha256`", "unchanged payload with the matching expected plan hash",
          ],
        },
        {
          name: "post-transaction navigation follows directed selectors instead of blanket reads",
          tokens: ["Follow the result's `next_selectors` first", "Read only the named next selector", "refresh full status only when route selection, a conflict, or missing next selector requires it"],
        },
        {
          name: "global governance selectors remain distinct",
          tokens: ["`change:<id>`", "`patch:<id>`", "`case-action:<id>`", "`gate:<id>`", "`claim:<id>`"],
        },
      ],
    );
  }
  await assertTokens(
    (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8"),
    path.join(".codex", "skills", "researchspec-navigate", "SKILL.md"),
    ["obligation:", "work:", "gate:"],
  );
  const navigateHandbook = await readFile(path.join(projectRoot, ".codex", "skills", "researchspec-navigate", "references", "cli-handbook.md"));
  assert(sha256(navigateHandbook) === handbookDigest, "Installed Codex Navigate handbook differs from the packaged handbook.");
  await assertTokens(
    (relativePath) => readFile(path.join(installedPackageRoot, relativePath), "utf8"),
    path.join("docs", "arsu_user_usage_model.md"),
    [
      "新 workspace 默认 adaptive", "Schema `0.2` strict compatibility",
      "31 个 registered tools × 15 个固定 Skills", "固定 4 ARSU + 4 Companion + 7 Zotero Adapter、可选 domain plugin Skills、17 CLI",
    ],
  );
  await assertFacts(
    (relativePath) => readFile(path.join(installedPackageRoot, relativePath), "utf8"),
    path.join("docs", "arsu_user_usage_model.md"),
    [
      {
        name: "Doctor recovery remains an explicit deterministic repair boundary",
        tokens: ["Recovery | `doctor`", "只执行已预览的确定性修复", "doctor` 诊断与 plan-bound deterministic repair"],
      },
    ],
  );
}

async function verifyPackagedDocumentation(installedPackageRoot, packagedFiles) {
  const sourceHandbook = await readFile(path.join(packageRoot, "docs", "cli_handbook.md"), "utf8");
  const packagedHandbook = await readFile(path.join(installedPackageRoot, "docs", "cli_handbook.md"), "utf8");
  assert(packagedHandbook === sourceHandbook, "Packaged CLI handbook differs from the source-controlled handbook.");
  const handbookModule = await import(pathToFileURL(path.join(installedPackageRoot, "dist", "src", "cli", "handbook.js")).href);
  assert(typeof handbookModule.renderCliHandbook === "function", "Installed package does not export renderCliHandbook.");
  assert(handbookModule.renderCliHandbook() === sourceHandbook, "Source-controlled CLI handbook differs from its renderer.");

  const packagedReadme = await readFile(path.join(installedPackageRoot, "README.md"), "utf8");
  const relativeLinks = markdownRepositoryLinks(packagedReadme);
  assert(relativeLinks.length > 0, "Packaged README contains no repository-relative documentation links.");
  for (const target of relativeLinks) {
    const included = target.endsWith("/")
      ? packagedFiles.some((file) => file.startsWith(target))
      : packagedFiles.includes(target);
    assert(included, `Packaged README links to a file outside the tarball: ${target}`);
  }
  return sha256(Buffer.from(sourceHandbook, "utf8"));
}

async function verifyAllToolDelivery(projectRoot, handbookDigest) {
  const manifest = JSON.parse(await readFile(path.join(projectRoot, "researchspec", "tool-installation-manifest.json"), "utf8"));
  const installations = Array.isArray(manifest.installations) ? manifest.installations : [];
  const handbookReferences = installations.filter((item) =>
    item?.source?.kind === "companion-skill"
    && item.source.skill_id === "researchspec-navigate"
    && typeof item?.target?.path === "string"
    && item.target.path.replaceAll("\\", "/").endsWith("/researchspec-navigate/references/cli-handbook.md"));
  assert(handbookReferences.length === 31, `Expected 31 Navigate handbook references, found ${String(handbookReferences.length)}.`);
  assert(new Set(handbookReferences.map((item) => item.tool_id)).size === 31, "Navigate handbook references do not cover all registered tools.");
  for (const reference of handbookReferences) {
    assert(reference.target.scope === "project", `Navigate handbook reference is not project-local: ${String(reference.tool_id)}`);
    assert(reference.sha256 === handbookDigest, `Navigate handbook manifest digest differs for ${String(reference.tool_id)}.`);
    const bytes = await readFile(path.join(projectRoot, reference.target.path));
    assert(sha256(bytes) === handbookDigest, `Navigate handbook bytes differ for ${String(reference.tool_id)}.`);
  }

  const commandInstallations = installations.filter((item) => item?.source?.kind === "command");
  assert(commandInstallations.length === 28 * 8, `Expected 224 command-wrapper installations, found ${String(commandInstallations.length)}.`);
  const commandTools = new Map();
  for (const installation of commandInstallations) {
    const commands = commandTools.get(installation.tool_id) ?? new Set();
    commands.add(installation.source.command_id);
    commandTools.set(installation.tool_id, commands);
  }
  assert(commandTools.size === 28, `Expected 28 command-capable tools, found ${String(commandTools.size)}.`);
  for (const [toolId, commands] of commandTools) assert(commands.size === 8, `Command wrapper count differs for ${String(toolId)}.`);

  const fixedSkillsByTool = new Map();
  for (const installation of installations) {
    const source = installation?.source;
    const skillId = source?.kind === "arsu-skill" || source?.kind === "companion-skill"
      ? source.skill_id
      : source?.kind === "literature-adapter" && source.component === "skill"
        ? source.skill_id
        : undefined;
    if (!skillId || !installation.tool_id) continue;
    const skills = fixedSkillsByTool.get(installation.tool_id) ?? new Set();
    skills.add(skillId);
    fixedSkillsByTool.set(installation.tool_id, skills);
  }
  assert(fixedSkillsByTool.size === 31, `Expected fixed Skills for 31 tools, found ${String(fixedSkillsByTool.size)}.`);
  for (const [toolId, skills] of fixedSkillsByTool) assert(skills.size === 15, `Fixed Skill count differs for ${String(toolId)}.`);
}

function markdownRepositoryLinks(markdown) {
  return [...markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1]?.trim() ?? "")
    .filter((target) => target && !/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target))
    .map((target) => target.split("#", 1)[0]?.split("?", 1)[0] ?? "")
    .filter(Boolean)
    .map((target) => path.posix.normalize(target.replaceAll("\\", "/")).replace(/^\.\//, ""));
}

async function assertTokens(read, relativePath, tokens) {
  const content = await read(relativePath);
  for (const token of tokens) {
    assert(content.includes(token), `Guidance fact is missing from ${relativePath}: ${token}`);
  }
}

async function assertFacts(read, relativePath, facts) {
  const content = await read(relativePath);
  for (const fact of facts) {
    for (const token of fact.tokens) {
      assert(content.includes(token), `Guidance relationship is missing from ${relativePath} (${fact.name}): ${token}`);
    }
    for (const token of fact.forbidden ?? []) {
      assert(!content.includes(token), `Guidance relationship is stale in ${relativePath} (${fact.name}): ${token}`);
    }
  }
}

async function assertOrderedTokens(read, relativePath, name, tokens) {
  const content = await read(relativePath);
  let offset = -1;
  for (const token of tokens) {
    const index = content.indexOf(token, offset + 1);
    assert(index >= 0, `Guidance relationship is missing from ${relativePath} (${name}): ${token}`);
    assert(index > offset, `Guidance relationship is out of order in ${relativePath} (${name}): ${token}`);
    offset = index;
  }
}

async function assertNoPatterns(read, relativePath, name, patterns) {
  const content = await read(relativePath);
  for (const pattern of patterns) {
    assert(!pattern.test(content), `Guidance relationship is stale in ${relativePath} (${name}): ${String(pattern)}`);
  }
}

async function assertRuntimeControlStatusReads(read, relativePath) {
  const lines = (await read(relativePath)).split(/\r?\n/);
  const bootstrapReads = lines.filter((line) => line.trim() === "Agent -> CLI : status --json");
  assert(bootstrapReads.length === 1, `Runtime control loop must have exactly one bootstrap status read: ${relativePath}`);
  const fallbackIndexes = lines
    .map((line, index) => line.includes("Agent -> CLI : full status --json") ? index : -1)
    .filter((index) => index >= 0);
  assert(fallbackIndexes.length === 1, `Runtime control loop must have exactly one full-status fallback read: ${relativePath}`);
  const fallbackIndex = fallbackIndexes[0];
  assert(fallbackIndex !== undefined, `Runtime control loop has no explicit full-status fallback: ${relativePath}`);
  assert(
    lines.slice(0, fallbackIndex).some((line) => line.includes("else reroute, conflict, or no selector")),
    `Runtime control loop full-status read is not guarded by its fallback branch: ${relativePath}`,
  );
}

async function assertVisibleSvgTokens(read, relativePath, tokens) {
  const visible = normalizeVisibleSvgText(await read(relativePath));
  for (const token of tokens) {
    assert(visible.includes(normalizeVisibleSvgText(token)), `Rendered SVG is missing visible semantic label: ${relativePath}: ${token}`);
  }
}

function normalizeVisibleSvgText(value) {
  const textElements = [...value.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map((match) => match[1])
    .join(" ");
  return textElements
    .replace(/<[^>]*>/g, " ")
    .replace(/&(amp|lt|gt|quot|apos|nbsp);|&#(x[0-9a-fA-F]+|\d+);/g, (_, named, numeric) => {
      if (named) return ({ amp: "&", lt: "<", gt: ">", quot: "\"", apos: "'", nbsp: " " })[named] ?? " ";
      const codePoint = numeric.startsWith("x") ? Number.parseInt(numeric.slice(1), 16) : Number.parseInt(numeric, 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : " ";
    })
    .replace(/\s+/g, " ")
    .trim();
}

function expectedRuntime(platform, architecture) {
  const key = `${platform}:${architecture}`;
  return {
    "win32:x64": "zotero-bridge.exe",
    "darwin:x64": "zotero-bridge",
    "darwin:arm64": "zotero-bridge",
    "linux:ia32": "zotero-bridge",
    "linux:x64": "zotero-bridge",
    "linux:arm": "zotero-bridge",
    "linux:arm64": "zotero-bridge",
  }[key];
}

function parsePackMetadata(stdout) {
  const start = stdout.indexOf("[");
  if (start < 0) throw new Error(`npm pack did not return JSON: ${stdout}`);
  const parsed = JSON.parse(stdout.slice(start));
  const metadata = parsed[0];
  if (!metadata || typeof metadata.filename !== "string" || !Array.isArray(metadata.files)) {
    throw new Error("npm pack returned an unexpected metadata envelope.");
  }
  return metadata;
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    shell: process.platform === "win32" && command.toLowerCase().endsWith(".cmd"),
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit ${String(result.status)}\n${result.stdout}\n${result.stderr}`);
  }
  return result;
}

async function directoryNames(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
