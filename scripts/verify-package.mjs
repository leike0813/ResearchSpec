import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
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
const unsupportedProjectDirectory = path.join(temporaryRoot, "unsupported-project");
const codexHome = path.join(temporaryRoot, "codex-home");
let expectedArsuSkills = [];
let expectedCompanionSkills = [];
let expectedCapabilitySkills = [];
let expectedBaseSkills = [];
let expectedAdapterSkills = [];
let expectedSkills = [];
let expectedProfiles = [];
let expectedProjectToolIds = [];
let expectedProjectSkillWriterIds = [];
let expectedCommandToolIds = [];
const expectedCommands = [
  "advance", "archive", "check", "decide", "doctor", "handoff", "init", "instructions", "list",
  "pack", "plugin", "propose", "show", "start", "status", "update",
];
const expectedCommandWrappers = ["navigate"];
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
  run(process.execPath, ["scripts/check-authored-whitespace.mjs"], packageRoot);
  await verifyRepositoryRuntimeGuidance(packageRoot);
  await Promise.all([
    mkdir(packageDirectory, { recursive: true }),
    mkdir(installDirectory, { recursive: true }),
    mkdir(projectDirectory, { recursive: true }),
    mkdir(allToolsProjectDirectory, { recursive: true }),
    mkdir(unsupportedProjectDirectory, { recursive: true }),
    mkdir(codexHome, { recursive: true }),
  ]);

  const pack = run(npmCommand(), ["pack", "--json", "--pack-destination", packageDirectory], packageRoot);
  const metadata = parsePackMetadata(pack.stdout);
  const sourceSurface = await loadPackagedSurface(packageRoot);
  applyExpectedSurface(sourceSurface);
  verifyTarballFiles(metadata.files.map((file) => file.path));

  const tarball = path.join(packageDirectory, metadata.filename);
  await writeFile(path.join(installDirectory, "package.json"), "{\"private\":true}\n", "utf8");
  run(npmCommand(), ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], installDirectory);

  const installedPackageRoot = path.join(installDirectory, "node_modules", "researchspec");
  const installedSurface = await loadPackagedSurface(installedPackageRoot);
  assert(equal(installedSurface, sourceSurface), "Installed Agent/profile surface registries differ from the packed source surface.");
  applyExpectedSurface(installedSurface);
  const installedPackage = JSON.parse(await readFile(path.join(installedPackageRoot, "package.json"), "utf8"));
  assert(
    installedPackage.exports?.["./annotation-intake"]?.import === "./dist/src/annotation-intake.js"
      && installedPackage.exports?.["./annotation-intake"]?.types === "./dist/src/annotation-intake.d.ts",
    "Packaged annotation-intake subpath export is missing or invalid.",
  );
  await writeFile(path.join(installDirectory, "annotation-intake-consumer.mjs"), [
    "import { generateAnnotationReviewCopy } from 'researchspec/annotation-intake';",
    "if (typeof generateAnnotationReviewCopy !== 'function') throw new Error('annotation intake API missing');",
    "",
  ].join("\n"), "utf8");
  run(process.execPath, ["annotation-intake-consumer.mjs"], installDirectory);
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
  run(bin, ["init", projectDirectory, "--tools", "codex", "--delivery", "skills", "--literature-adapters", "zotero-library", "--json"], installDirectory, environment);
  const currentWorkspace = path.join(projectDirectory, "researchspec");
  const currentConfig = parseYaml(await readFile(path.join(currentWorkspace, "config.yaml"), "utf8"));
  assert(currentConfig?.schema_version === "2", "Installed init did not create schema 2 config.");
  assert(equal(currentConfig?.literature_adapters?.selected, ["zotero-library"]), "Installed init did not persist the selected literature adapter.");
  for (const profileId of expectedProfiles) {
    const profile = parseYaml(await readFile(path.join(currentWorkspace, "profiles", `${profileId}.yaml`), "utf8"));
    assert(profile?.schema_version === "2" && profile?.profile_id === profileId, `Installed init did not project current graph profile: ${profileId}`);
  }
  assert(equal((await directoryNames(currentWorkspace)).sort(), ["changes", "profiles", "runs", "specs"]), "Installed current workspace directory set is invalid.");
  for (const spec of ["project.md", "sources.yaml", "claims.yaml", "manuscript.yaml"]) {
    await readFile(path.join(currentWorkspace, "specs", spec), "utf8");
  }
  for (const retiredPath of ["subflows", "playbooks", "draft-patches", "artifact-registry.json"]) {
    assert(!await pathExists(path.join(currentWorkspace, retiredPath)), `Installed init created retired path: ${retiredPath}`);
  }
  const installedSkills = (await directoryNames(path.join(projectDirectory, ".agents", "skills"))).sort();
  assert(equal(installedSkills, expectedSkills), `Installed Skill surface mismatch: ${installedSkills.join(", ")}`);
  for (const skill of [...expectedBaseSkills, ...expectedAdapterSkills]) {
    const license = await readFile(path.join(projectDirectory, ".agents", "skills", skill, "LICENSE"), "utf8");
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
  assert(installationManifest.literature_adapter_resolutions?.length === 1, "Installed manifest has no selected literature adapter resolution.");
  assert(installationManifest.literature_adapter_resolutions[0].projection_state === "complete", "Installed literature adapter Skill projection is incomplete.");
  const promptRoot = path.join(codexHome, "prompts");
  const prompts = await pathExists(promptRoot)
    ? (await readdir(promptRoot)).filter((file) => file.startsWith("researchspec-") && file.endsWith(".md")).sort()
    : [];
  assert(prompts.length === 0, `Legacy Codex prompts were unexpectedly generated: ${prompts.join(", ")}`);
  run(bin, ["check", "all", "--strict", "--json"], projectDirectory, environment);
  await verifyInstalledMinimalJourney(bin, projectDirectory, environment);
  await verifyInstalledAcademicPipelineJourney(bin, projectDirectory, environment);

  run(bin, ["init", allToolsProjectDirectory, "--tools", expectedProjectToolIds.join(","), "--delivery", "both", "--json"], installDirectory, environment);
  await verifyAllProjectToolDelivery(allToolsProjectDirectory, handbookDigest);

  const installedConfigBeforeRemovedOptions = await readFile(path.join(currentWorkspace, "config.yaml"), "utf8");
  runExpectFailure(bin, ["init", projectDirectory, "--tools", "none", "--profile", "strict", "--json"], installDirectory, environment);
  runExpectFailure(bin, ["update", projectDirectory, "--migrate-runtime", "--json"], installDirectory, environment);
  assert(await readFile(path.join(currentWorkspace, "config.yaml"), "utf8") === installedConfigBeforeRemovedOptions, "Removed CLI options changed the current workspace.");

  const unsupportedWorkspace = path.join(unsupportedProjectDirectory, "researchspec");
  await mkdir(path.join(unsupportedWorkspace, "runs", "current"), { recursive: true });
  const unsupportedConfig = "schema_version: \"0.2\"\nprofile: strict\n";
  const unsupportedState = "semantic: preserve-me\n";
  await writeFile(path.join(unsupportedWorkspace, "config.yaml"), unsupportedConfig, "utf8");
  await writeFile(path.join(unsupportedWorkspace, "runs", "current", "state.yaml"), unsupportedState, "utf8");
  for (const args of [["status", "--json"], ["check", "all", "--json"], ["doctor", "--json"], ["update", "--tools", "none", "--json"]]) {
    const failure = runExpectFailure(bin, args, unsupportedProjectDirectory, environment);
    const envelope = JSON.parse(failure.stdout);
    assert(envelope.error?.code === "workspace_unsupported", `Unsupported workspace returned the wrong error for ${args.join(" ")}.`);
  }
  assert(await readFile(path.join(unsupportedWorkspace, "config.yaml"), "utf8") === unsupportedConfig, "Unsupported config was modified.");
  assert(await readFile(path.join(unsupportedWorkspace, "runs", "current", "state.yaml"), "utf8") === unsupportedState, "Unsupported state was modified.");

  process.stdout.write(`Release package verified: ${metadata.filename} (${String(metadata.files.length)} files, ${String(metadata.unpackedSize)} bytes unpacked)\n`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

function verifyTarballFiles(files) {
  const required = [
    "package.json", "README.md", "CHANGELOG.md", "SECURITY.md", "LICENSE", "NOTICE",
    "LICENSES/MIT.txt", "LICENSES/CC-BY-NC-4.0.txt", "LICENSES/CC-BY-SA-4.0.txt", "LICENSES/Apache-2.0.txt", "LICENSES/AGPL-3.0.txt",
    "docs/README.md", "docs/user/README.md", "docs/user/usage-model.md", "docs/user/cli-handbook.md", "docs/user/literature-adapters.md",
    "docs/developer/README.md", "docs/developer/architecture.md", "docs/developer/cli-interface.md", "docs/developer/domain-plugins.md", "docs/developer/domain-taxonomy.md", "docs/developer/manuscript-annotations.md",
    "docs/developer/runtime/README.md", "docs/developer/runtime/core_runtime_model.md", "docs/developer/runtime/runtime_protocols.md",
    "docs/developer/runtime/deep_research_workflow.md", "docs/developer/runtime/academic_paper_workflow.md", "docs/developer/runtime/academic_paper_reviewer_workflow.md", "docs/developer/runtime/academic_pipeline_workflow.md",
    "docs/maintainer/README.md", "docs/maintainer/release-process.md", "docs/maintainer/non-native-vendor-skill-standard.md", "docs/maintainer/vendors/README.md",
    "artifacts/README.md", "artifacts/release/mvp-release-checklist.md",
    "skills/arsu/conversion-manifest.json",
    "skills/arsu/profiles/registry.json",
    "skills/capabilities/registry.json",
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
    "skills/arsu/researchspec-contracts.json", "artifacts/release/mvp-release-checklist.md", "dist/src/cli/bin.js", "dist/src/annotation-intake.js", "dist/src/annotation-intake.d.ts",
  ];
  for (const skill of expectedArsuSkills) required.push(`skills/arsu/${skill}/SKILL.md`);
  for (const skill of expectedCapabilitySkills) {
    required.push(`skills/capabilities/${skill}/SKILL.md`, `skills/capabilities/${skill}/manifest.yaml`);
  }
  for (const profile of expectedProfiles) required.push(`skills/arsu/profiles/${profile}.yaml`);
  for (const skill of expectedArsuSkills) {
    required.push(`skills/arsu/${skill}/SKILL.md`, `skills/arsu/${skill}/LICENSE`, `skills/arsu/${skill}/NOTICE.md`);
  }
  for (const [name, extension] of currentRuntimeDiagrams()) {
    required.push(
      `docs/developer/runtime/diagrams/src/${name}.${extension}`,
      `docs/developer/runtime/diagrams/rendered/${name}.svg`,
    );
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

  const allowed = /^(?:package\.json|README\.md|CHANGELOG\.md|SECURITY\.md|LICENSE|NOTICE|LICENSES\/[^/]+|docs\/.*|artifacts\/(?:README\.md|release\/mvp-release-checklist\.md)|dist\/src\/.*\.(?:js|d\.ts)|skills\/.*|literature-adapters\/.*)$/;
  const retired = /^dist\/src\/adapters\/companion\/workflows\/(?:archive|check|context|explore|next|submit)\.js$/;
  for (const file of files) {
    assert(allowed.test(file), `Tarball contains a path outside the release allowlist: ${file}`);
    assert(!file.startsWith("playbooks/"), `Tarball contains repository-only playbook material: ${file}`);
    assert(!file.startsWith("skills/review-response/"), `Tarball contains the retired monolithic review-response Skill: ${file}`);
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
    assert(!file.startsWith("dist/src/vendor-converters/"), `Tarball contains maintainer-only vendor conversion code: ${file}`);
    assert(!file.includes("/curation/"), `Tarball contains maintainer-only curation inputs: ${file}`);
    assert(!/^skills\/plugins\/vendors\/finrobot\/[^/]+\/(?:dependencies\.json|references\/|resources\/|agents\/)/.test(file), `Tarball contains an obsolete or unjustified FinRobot asset: ${file}`);
    assert(!/(?:admission|relationship|file|external-resource)-decisions\.json$/.test(file), `Tarball contains maintainer-only production decisions: ${file}`);
    assert(!file.endsWith(".js.map"), `Tarball contains source maps: ${file}`);
    assert(!retired.test(file), `Tarball contains a retired Companion workflow: ${file}`);
    assert(!retiredRuntimeModule(file), `Tarball contains a retired runtime module: ${file}`);
  }
}

async function verifyRepositoryRuntimeGuidance(root) {
  for (const [name, extension] of currentRuntimeDiagrams()) {
    await access(path.join(root, "docs", "developer", "runtime", "diagrams", "src", `${name}.${extension}`));
    await access(path.join(root, "docs", "developer", "runtime", "diagrams", "rendered", `${name}.svg`));
  }
}

async function verifyInstalledGuidance(installedPackageRoot, projectRoot, handbookDigest) {
  const contracts = JSON.parse(await readFile(path.join(installedPackageRoot, "skills", "arsu", "researchspec-contracts.json"), "utf8"));
  assert(contracts.integration_profile === "researchspec-preflight-v11", "Installed ARSU contracts do not use preflight v11.");
  for (const skill of expectedArsuSkills) {
    assert(contracts.skill_groups?.[skill]?.profile_id === "researchspec-preflight-v11", `Installed ARSU profile is not v11: ${skill}`);
  }
  const packagedHandbook = await readFile(path.join(installedPackageRoot, "docs", "user", "cli-handbook.md"), "utf8");
  const companionManifest = await import(`${pathToFileURL(path.join(installedPackageRoot, "dist", "src", "adapters", "companion", "manifest.js")).href}?guidance=${Date.now().toString()}`);
  const companionRenderer = await import(`${pathToFileURL(path.join(installedPackageRoot, "dist", "src", "adapters", "companion", "render.js")).href}?guidance=${Date.now().toString()}`);
  const navigate = companionManifest.COMPANION_INTENTS.find((item) => item.id === "navigate");
  assert(navigate, "Installed Companion manifest lacks Navigate.");
  for (const expected of companionRenderer.renderCompanionSkillFiles(navigate)) {
    const actual = await readFile(path.join(projectRoot, ".agents", "skills", "researchspec-navigate", expected.path), "utf8");
    assert(actual === expected.content, `Installed Navigate file differs from its renderer: ${String(expected.path)}.`);
  }
  const navigateHandbook = await readFile(path.join(projectRoot, ".agents", "skills", "researchspec-navigate", "references", "cli-handbook.md"), "utf8");
  assert(navigateHandbook === packagedHandbook, "Installed Navigate CLI handbook differs from the packaged handbook.");
  assert(handbookDigest === sha256(Buffer.from(packagedHandbook, "utf8")), "Packaged handbook digest changed during delivery verification.");
}

async function verifyPackagedDocumentation(installedPackageRoot, packagedFiles) {
  const sourceHandbook = await readFile(path.join(packageRoot, "docs", "user", "cli-handbook.md"), "utf8");
  const packagedHandbook = await readFile(path.join(installedPackageRoot, "docs", "user", "cli-handbook.md"), "utf8");
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
  await verifyCurrentPublishedGuidance(installedPackageRoot);
  return sha256(Buffer.from(sourceHandbook, "utf8"));
}

async function verifyCurrentPublishedGuidance(installedPackageRoot) {
  const currentGuidance = [
    "README.md",
    "SECURITY.md",
    "docs/user/usage-model.md",
    "docs/user/cli-handbook.md",
    "docs/user/literature-adapters.md",
    "docs/developer/architecture.md",
    "docs/developer/cli-interface.md",
    "docs/developer/domain-plugins.md",
    "docs/developer/manuscript-annotations.md",
    "docs/developer/runtime/README.md",
    "docs/developer/runtime/core_runtime_model.md",
    "docs/developer/runtime/runtime_protocols.md",
    "docs/developer/runtime/deep_research_workflow.md",
    "docs/developer/runtime/academic_paper_workflow.md",
    "docs/developer/runtime/academic_paper_reviewer_workflow.md",
    "docs/developer/runtime/academic_pipeline_workflow.md",
  ];
  const retiredBehavior = /researchspec submit|--migrate-runtime|--profile strict|--expected-plan-sha256|runs\/current|specs\/workflow\.yaml|artifact-registry|decision-ledger|gate-ledger|strict compatibility|adaptive runtime|Material Passport/i;
  for (const relativePath of currentGuidance) {
    const content = await readFile(path.join(installedPackageRoot, relativePath), "utf8");
    assert(!retiredBehavior.test(content), `Packaged current guidance contains retired behavior: ${relativePath}`);
  }
}

async function verifyAllProjectToolDelivery(projectRoot, handbookDigest) {
  const manifest = JSON.parse(await readFile(path.join(projectRoot, "researchspec", "tool-installation-manifest.json"), "utf8"));
  const config = parseYaml(await readFile(path.join(projectRoot, "researchspec", "config.yaml"), "utf8"));
  assert(equal(config?.agent_tools?.selected, expectedProjectToolIds) && config?.agent_tools?.delivery === "both", "Project-scoped all-tool config differs from the packaged tool catalog.");
  const installations = Array.isArray(manifest.installations) ? manifest.installations : [];
  assert(equal(manifest.literature_adapter_resolutions, []), "Default all-tool init unexpectedly installed a literature adapter.");
  assert(!await pathExists(path.join(projectRoot, ".zotero-bridge")), "Default all-tool init unexpectedly created .zotero-bridge.");
  const navigateFiles = installations.filter((item) =>
    item?.source?.kind === "companion-skill"
    && item.source.skill_id === "researchspec-navigate"
    && typeof item?.target?.path === "string");
  const navigateSkills = navigateFiles.filter((item) => item.target.path.replaceAll("\\", "/").endsWith("/researchspec-navigate/SKILL.md"));
  assert(navigateSkills.length === expectedProjectSkillWriterIds.length, `Navigate Skill projection count mismatch: ${String(navigateSkills.length)}.`);
  assert(navigateFiles.length === expectedProjectSkillWriterIds.length * 4, `Navigate file projection count mismatch: ${String(navigateFiles.length)}.`);
  assert(equal([...new Set(navigateSkills.map((item) => item.tool_id))].sort(), expectedProjectSkillWriterIds), "Navigate Skill projections do not cover every project-scoped physical Skill writer.");
  for (const reference of navigateFiles) {
    const absolute = reference.target.scope === "project"
      ? path.join(projectRoot, reference.target.path)
      : reference.target.path;
    const bytes = await readFile(absolute);
    assert(sha256(bytes) === reference.sha256, `Navigate file bytes differ for ${String(reference.tool_id)}: ${String(reference.target.path)}.`);
    if (reference.target.path.replaceAll("\\", "/").endsWith("/references/cli-handbook.md")) {
      assert(reference.sha256 === handbookDigest, `Navigate handbook digest differs for ${String(reference.tool_id)}.`);
    }
  }
  assert(handbookDigest.length === 64, "CLI handbook digest is invalid.");

  const commandInstallations = installations.filter((item) => item?.source?.kind === "command");
  assert(commandInstallations.length === expectedCommandToolIds.length * expectedCommandWrappers.length, `Command-wrapper installation count mismatch: ${String(commandInstallations.length)}.`);
  const commandTools = new Map();
  for (const installation of commandInstallations) {
    const commands = commandTools.get(installation.tool_id) ?? new Set();
    commands.add(installation.source.command_id);
    commandTools.set(installation.tool_id, commands);
  }
  assert(equal([...commandTools.keys()].sort(), expectedCommandToolIds), "Command-wrapper installations do not cover the packaged command-capable tool catalog.");
  for (const [toolId, commands] of commandTools) {
    assert(equal([...commands].sort(), expectedCommandWrappers), `Command wrapper surface differs for ${String(toolId)}.`);
  }

  const baseSkillsByTool = new Map();
  for (const installation of installations) {
    const source = installation?.source;
    const skillId = source?.kind === "arsu-skill" || source?.kind === "core-skill" || source?.kind === "companion-skill"
      ? source.skill_id
      : source?.kind === "framework-capability"
        ? source.capability_id
        : undefined;
    if (!skillId || !installation.tool_id) continue;
    const skills = baseSkillsByTool.get(installation.tool_id) ?? new Set();
    skills.add(skillId);
    baseSkillsByTool.set(installation.tool_id, skills);
  }
  assert(equal([...baseSkillsByTool.keys()].sort(), expectedProjectSkillWriterIds), "Base Skills do not cover every project-scoped physical Skill writer.");
  for (const [toolId, skills] of baseSkillsByTool) {
    assert(equal([...skills].sort(), expectedBaseSkills), `Base Skill surface differs for ${String(toolId)}.`);
  }
}

async function loadPackagedSurface(root) {
  const arsuManifest = JSON.parse(await readFile(path.join(root, "skills", "arsu", "conversion-manifest.json"), "utf8"));
  const capabilityRegistry = JSON.parse(await readFile(path.join(root, "skills", "capabilities", "registry.json"), "utf8"));
  const profileRegistry = JSON.parse(await readFile(path.join(root, "skills", "arsu", "profiles", "registry.json"), "utf8"));
  const companionModule = await import(`${pathToFileURL(path.join(root, "dist", "src", "adapters", "companion", "manifest.js")).href}?surface=${Date.now().toString()}`);
  const adapterModule = await import(`${pathToFileURL(path.join(root, "dist", "src", "literature-adapters", "catalog.js")).href}?surface=${Date.now().toString()}`);
  const toolModule = await import(`${pathToFileURL(path.join(root, "dist", "src", "adapters", "tools.js")).href}?surface=${Date.now().toString()}`);
  const deliveryModule = await import(`${pathToFileURL(path.join(root, "dist", "src", "adapters", "delivery.js")).href}?surface=${Date.now().toString()}`);
  const arsu = uniqueSorted(arsuManifest.generated_groups, "ARSU conversion manifest generated_groups");
  const companions = uniqueSorted(companionModule.COMPANION_INTENTS?.filter((item) => item.id === "navigate").map((item) => item.skillId), "visible Companion Skills");
  const capabilities = uniqueSorted(capabilityRegistry.capabilities?.map((item) => item.capability_id), "capability registry entries");
  const profiles = uniqueSorted(profileRegistry.profiles?.map((item) => item.profile_id), "profile registry entries");
  const adapters = uniqueSorted(adapterModule.LITERATURE_ADAPTER_SKILL_IDS, "literature Adapter catalog Skills");
  const projectTools = uniqueSorted(toolModule.TOOLS?.map((tool) => tool.id), "project-scoped tool catalog");
  const projectSkillWriters = uniqueSorted(deliveryModule.selectSkillWriters?.(projectTools, "both"), "project-scoped Skill writers");
  const commandTools = uniqueSorted(toolModule.TOOLS?.filter((tool) => tool.command).map((tool) => tool.id), "project-scoped command-capable tools");
  return {
    arsu,
    companions,
    capabilities,
    profiles,
    adapters,
    projectTools,
    projectSkillWriters,
    commandTools,
    base: companions,
  };
}

function applyExpectedSurface(surface) {
  expectedArsuSkills = surface.arsu;
  expectedCompanionSkills = surface.companions;
  expectedCapabilitySkills = surface.capabilities;
  expectedBaseSkills = surface.base;
  expectedAdapterSkills = surface.adapters;
  expectedSkills = uniqueSorted([...surface.base, ...surface.adapters], "complete selected Skill surface");
  expectedProfiles = surface.profiles;
  expectedProjectToolIds = surface.projectTools;
  expectedProjectSkillWriterIds = surface.projectSkillWriters;
  expectedCommandToolIds = surface.commandTools;
}

function uniqueSorted(value, label) {
  assert(Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" && item.length > 0), `${label} are missing or invalid.`);
  const sorted = [...value].sort();
  assert(new Set(sorted).size === sorted.length, `${label} contain duplicates.`);
  return sorted;
}

function markdownRepositoryLinks(markdown) {
  return [...markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => match[1]?.trim() ?? "")
    .filter((target) => target && !/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target))
    .map((target) => target.split("#", 1)[0]?.split("?", 1)[0] ?? "")
    .filter(Boolean)
    .map((target) => path.posix.normalize(target.replaceAll("\\", "/")).replace(/^\.\//, ""));
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

function currentRuntimeDiagrams() {
  return [
    ["academic-paper-reviewer-workflow", "puml"],
    ["academic-paper-workflow", "puml"],
    ["academic-pipeline-mid-entry", "puml"],
    ["academic-pipeline-workflow", "puml"],
    ["contract-change-lifecycle", "puml"],
    ["deep-research-workflow", "puml"],
    ["frontier-evaluation", "dot"],
    ["revision-round", "puml"],
    ["runtime-control-loop", "puml"],
    ["system-architecture", "puml"],
    ["two-level-openspec-model", "puml"],
  ];
}

function retiredRuntimeModule(file) {
  return /^dist\/src\/core\/contracts\/(?:action-selector|adaptive-runtime|case-profile|case-state|decision|gate-transition|legacy-contract-change|material-passport|run-state|runtime-protocol|runtime-selector|workflow)\.(?:js|d\.ts)$/.test(file)
    || /^dist\/src\/core\/runtime\/(?:artifact-path|transaction-result)\.(?:js|d\.ts)$/.test(file);
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

function runExpectFailure(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    shell: process.platform === "win32" && command.toLowerCase().endsWith(".cmd"),
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status === 0) throw new Error(`${command} ${args.join(" ")} unexpectedly succeeded.`);
  return result;
}

async function verifyInstalledMinimalJourney(bin, projectDirectory, environment) {
  const instructions = runJson(bin, ["instructions", "profile:minimal", "--json"], projectDirectory, environment).data;
  const entry = instructions?.entries?.[0];
  assert(instructions?.kind === "profile" && entry?.entry_id && entry?.entry_node_id && entry?.route_ref, "Installed profile instructions expose no route-bound graph entry.");
  const startInputPath = path.join(projectDirectory, "packaged-start.json");
  await writeFile(startInputPath, `${JSON.stringify({
    schema_version: "2",
    confirmed_at: "2026-08-02T12:00:00+08:00",
    entry_id: entry.entry_id,
    entry_node_id: entry.entry_node_id,
    route_ref: entry.route_ref,
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: [],
    formal_gates: [],
    cost: { effort: "bounded release smoke test", interaction: "one root confirmation" },
  }, null, 2)}\n`, "utf8");
  const started = runJson(bin, [
    "start", "profile:minimal", "--input", startInputPath,
    "--confirmed-by", "Release Verifier", "--json",
  ], projectDirectory, environment).data;
  assert(started?.status === "started" && started.run_id, "Installed CLI did not start the schema 2 graph run.");

  const outputs = [];
  const advanceInputPath = path.join(projectDirectory, "packaged-advance.json");
  for (const nodeId of ["rq", "methodology", "literature", "grading", "synthesis", "report"]) {
    const nodeSelector = `node:${started.run_id}/${nodeId}`;
    const card = runJson(bin, ["instructions", nodeSelector, "--json"], projectDirectory, environment).data;
    assert(card?.kind === "node" && card.expected_output_roles?.length, "Installed node has no declared outputs.");
    if (nodeId === "report") {
      assert(["synthesis_report", "methodology_blueprint"].every((role) => card.resolved_inputs.some((input) => input.role === role && input.path)), "Installed report lacks required inputs.");
    }
    const submitted = card.expected_output_roles.map(({ role }) => ({ role, path: `outputs/${role}.md` }));
    for (const output of submitted) {
      const outputPath = path.join(projectDirectory, output.path);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `# ${output.role}\n\nBounded release verification material.\n`, "utf8");
    }
    await writeFile(advanceInputPath, `${JSON.stringify({ outputs: submitted }, null, 2)}\n`, "utf8");
    runJson(bin, ["advance", nodeSelector, "--input", advanceInputPath, "--actor-name", "release-verifier", "--json"], projectDirectory, environment);
    outputs.push(...submitted);
  }

  const handoffInputPath = path.join(projectDirectory, "packaged-handoff.json");
  await writeFile(handoffInputPath, `${JSON.stringify({
    inputs: [],
    outputs: outputs.map((output) => ({ ...output, type: output.role, purpose: "Release verification boundary output", intended_consumer: "user" })),
    body: "# Packaged handoff\n\nThe external graph-node output is ready.\n",
  }, null, 2)}\n`, "utf8");
  runJson(bin, ["handoff", `run:${started.run_id}`, "--input", handoffInputPath, "--json"], projectDirectory, environment);
  const status = runJson(bin, ["status", "--json"], projectDirectory, environment).data;
  assert(status?.runs?.total === 1 && status?.nodes?.[started.run_id]?.some((node) => node.node_id === entry.entry_node_id && node.state === "complete"), "Installed graph journey did not persist the completed node.");
  assert(status?.frontier?.length === 0 && status?.runs?.active === 0, "Installed graph journey did not finish the run.");
  const completed = runJson(bin, ["instructions", `run:${started.run_id}`, "--json"], projectDirectory, environment).data;
  assert(completed?.run?.status === "complete", "Installed graph journey did not persist run completion.");
  runJson(bin, ["show", `run:${started.run_id}`, "--json"], projectDirectory, environment);
  runJson(bin, ["handoff", `run:${started.run_id}`, "--json"], projectDirectory, environment);
  runJson(bin, ["check", "all", "--strict", "--json"], projectDirectory, environment);
}

async function verifyInstalledAcademicPipelineJourney(bin, projectDirectory, environment) {
  const profile = runJson(bin, ["instructions", "profile:academic-pipeline", "--json"], projectDirectory, environment).data;
  const entry = profile?.entries?.find((item) => item.route_ref === "academic-pipeline:end-to-end");
  assert(entry?.entry_id && entry.entry_node_id && entry.route_ref, "Installed academic-pipeline instructions expose no end-to-end entry.");

  const pipelineBoundaryOutputs = [
    ["research_report", "pipeline/research-report.md"],
    ["annotated_bibliography", "pipeline/bibliography.md"],
    ["synthesis_report", "pipeline/synthesis.md"],
    ["manuscript_draft", "pipeline/manuscript.md"],
    ["review_synthesis", "pipeline/review.md"],
    ["response_to_reviewers", "pipeline/response-to-reviewers.md"],
    ["formatted_manuscript", "pipeline/formatted-manuscript.md"],
    ["integrity_report", "pipeline/integrity.md"],
  ];
  const outputPaths = new Map(pipelineBoundaryOutputs);
  outputPaths.set("working_manuscript", outputPaths.get("manuscript_draft"));
  outputPaths.set("response_markdown", outputPaths.get("response_to_reviewers"));
  const startInputPath = path.join(projectDirectory, "packaged-pipeline-start.json");
  await writeFile(startInputPath, `${JSON.stringify({
    schema_version: "2",
    confirmed_at: "2026-09-05T12:00:00+08:00",
    entry_id: entry.entry_id,
    entry_node_id: entry.entry_node_id,
    route_ref: entry.route_ref,
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: pipelineBoundaryOutputs.map(([role, outputPath]) => ({ role, type: "markdown", path: outputPath, purpose: `Release verification ${role}.` })),
    formal_gates: ["research-gate", "write-gate", "review-gate", "final-integrity-gate"],
    cost: { effort: "high", interaction: "long_horizon" },
  }, null, 2)}\n`, "utf8");
  const rootRunId = runJson(bin, [
    "start", "academic-pipeline", "--input", startInputPath,
    "--confirmed-by", "Release Verifier", "--json",
  ], projectDirectory, environment).data.run_id;
  const advanceInputPath = path.join(projectDirectory, "packaged-pipeline-advance.json");
  let fallbackOutputIndex = 0;
  const childRunIds = [];

  async function submitNode(runId, nodeId, round) {
    const nodeSelector = `node:${runId}/${nodeId}${round === undefined ? "" : `@${String(round)}`}`;
    const card = runJson(bin, ["instructions", nodeSelector, "--json"], projectDirectory, environment).data;
    assert(card?.kind === "node" && card.expected_output_roles?.length, `Installed pipeline node has no declared outputs: ${nodeSelector}`);
    for (const input of card.resolved_inputs ?? []) {
      if (!input.path) continue;
      const inputPath = path.isAbsolute(input.path) ? input.path : path.join(projectDirectory, input.path);
      assert(await pathExists(inputPath), `Installed pipeline input from instructions is missing: ${input.role} at ${input.path}`);
    }
    const outputs = card.expected_output_roles.map(({ role }) => ({
      role,
      path: outputPaths.get(role) ?? `pipeline/internal-${String(fallbackOutputIndex += 1)}-${role}.md`,
    }));
    for (const output of outputs) {
      const outputPath = path.join(projectDirectory, output.path);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, `# ${output.role}\n\nExternal release verification producer material.\n`, "utf8");
    }
    await writeFile(advanceInputPath, `${JSON.stringify({ outputs }, null, 2)}\n`, "utf8");
    runJson(bin, ["advance", nodeSelector, "--input", advanceInputPath, "--actor-name", "release-verifier", "--json"], projectDirectory, environment);
  }

  function confirmGate(runId, gateId, round) {
    const selector = `gate:${runId}/${gateId}${round === undefined ? "" : `@${String(round)}`}`;
    runJson(bin, ["instructions", selector, "--json"], projectDirectory, environment);
    runJson(bin, ["decide", selector, "--verdict", "pass", "--actor-name", "release-verifier", "--reason", "Release journey confirmation.", "--json"], projectDirectory, environment);
  }

  function chooseDecision(runId, decisionId, round, choice) {
    const selector = `decision:${runId}/${decisionId}${round === undefined ? "" : `@${String(round)}`}`;
    runJson(bin, ["instructions", selector, "--json"], projectDirectory, environment);
    runJson(bin, ["decide", selector, "--choice", choice, "--actor-name", "release-verifier", "--reason", "Release journey branch confirmation.", "--json"], projectDirectory, environment);
  }

  async function completeChild(parentNodeId, steps, round) {
    const selector = `node:${rootRunId}/${parentNodeId}${round === undefined ? "" : `@${String(round)}`}`;
    const parentCard = runJson(bin, ["instructions", selector, "--json"], projectDirectory, environment).data;
    assert(parentCard?.kind === "node" && parentCard.node?.kind === "subgraph", `Installed pipeline parent child card is missing: ${selector}`);
    const recoveredStatus = runJson(bin, ["status", "--json"], projectDirectory, environment).data;
    assert(recoveredStatus?.runs?.active > 0 && Array.isArray(recoveredStatus?.nodes?.[rootRunId]), `Installed pipeline status did not recover the active parent before child start: ${selector}`);
    const recoveredRun = runJson(bin, ["instructions", `run:${rootRunId}`, "--json"], projectDirectory, environment).data;
    assert(recoveredRun?.pending_subgraph_starts?.some((item) => item.selector === selector), `Installed pipeline parent frontier lost child start: ${selector}`);
    const child = runJson(bin, ["start", selector, "--json"], projectDirectory, environment).data;
    assert(child?.run_id, `Installed pipeline child did not start: ${selector}`);
    assert(
      child.run?.parent_binding?.parent_run_id === rootRunId
        && child.run.parent_binding.parent_node_id === parentNodeId
        && child.run.parent_binding.subgraph_id === parentCard.node.subgraph_id
        && (round === undefined ? child.run.parent_binding.round === undefined : child.run.parent_binding.round === round),
      `Installed pipeline child binding is invalid: ${selector}`,
    );
    childRunIds.push(child.run_id);
    for (const step of steps) {
      if (step.kind === "node") await submitNode(child.run_id, step.node_id, step.round);
      else if (step.kind === "gate") confirmGate(child.run_id, step.gate_id, step.round);
      else chooseDecision(child.run_id, step.decision_id, step.round, step.choice);
    }
    const completed = runJson(bin, ["instructions", `run:${child.run_id}`, "--json"], projectDirectory, environment).data;
    assert(completed?.run?.status === "complete", `Installed pipeline child did not complete: ${child.run_id}`);
    return child.run_id;
  }

  const researchSteps = [
    { kind: "node", node_id: "research-question" },
    { kind: "gate", gate_id: "rq-gate" },
    { kind: "node", node_id: "methodology" },
    { kind: "node", node_id: "literature" },
    { kind: "node", node_id: "grading" },
    { kind: "node", node_id: "synthesis" },
    { kind: "node", node_id: "report" },
  ];
  await completeChild("research", researchSteps);
  confirmGate(rootRunId, "research-gate");

  await completeChild("write", [
    ...["intake", "structure", "argument", "draft", "cite-check"].map((node_id) => ({ kind: "node", node_id })),
    { kind: "gate", gate_id: "paper-gate" },
    { kind: "node", node_id: "abstract" },
  ]);
  confirmGate(rootRunId, "write-gate");

  await completeChild("review", [
    ...["panel", "specialist", "da", "editorial", "synthesis"].map((node_id) => ({ kind: "node", node_id })),
  ]);
  confirmGate(rootRunId, "review-gate");

  const revisionSteps = () => [
    ...["intake", "manuscript-analysis", "comment-atomization"].map((node_id) => ({ kind: "node", node_id })),
    { kind: "gate", gate_id: "review-response-comment-coverage" },
    { kind: "node", node_id: "workboard" },
    { kind: "gate", gate_id: "review-response-strategy" },
    { kind: "node", node_id: "round", round: 1 },
    { kind: "gate", gate_id: "review-response-evidence", round: 1 },
    { kind: "gate", gate_id: "review-response-response-coverage", round: 1 },
    { kind: "gate", gate_id: "review-response-final-assembly", round: 1 },
    { kind: "decision", decision_id: "review-response-outcome", round: 1, choice: "complete" },
  ];
  const reviewSteps = ["panel", "specialist", "da", "editorial", "synthesis"].map((node_id) => ({ kind: "node", node_id }));
  await completeChild("revision", revisionSteps(), 1);
  await completeChild("re-review", reviewSteps, 1);
  chooseDecision(rootRunId, "revision-outcome", 1, "continue");
  const resumed = runJson(bin, ["instructions", `run:${rootRunId}`, "--json"], projectDirectory, environment).data;
  assert(resumed?.pending_subgraph_starts?.some((item) => item.selector.endsWith("/revision@2")), "Installed pipeline did not recover the second revision frontier.");

  await completeChild("revision", revisionSteps(), 2);
  await completeChild("re-review", reviewSteps, 2);
  chooseDecision(rootRunId, "revision-outcome", 2, "complete");
  await completeChild("format", [{ kind: "node", node_id: "format" }]);
  await submitNode(rootRunId, "final-integrity");
  confirmGate(rootRunId, "final-integrity-gate");

  const handoffInputPath = path.join(projectDirectory, "packaged-pipeline-handoff.json");
  await writeFile(handoffInputPath, `${JSON.stringify({
    inputs: [],
    outputs: pipelineBoundaryOutputs.map(([role, outputPath]) => ({ role, type: "markdown", path: outputPath, purpose: "Release verification boundary output.", intended_consumer: "user" })),
    body: "# Packaged academic pipeline handoff\n\nExternal producer fixtures completed the installed graph journey.\n",
  }, null, 2)}\n`, "utf8");
  runJson(bin, ["handoff", `run:${rootRunId}`, "--input", handoffInputPath, "--json"], projectDirectory, environment);
  const status = runJson(bin, ["status", "--json"], projectDirectory, environment).data;
  assert(status?.runs?.active === 0 && status?.frontier?.length === 0, "Installed academic pipeline left active runs or frontier nodes.");
  assert(status?.runs?.total === childRunIds.length + 2, "Installed academic pipeline did not persist the minimal run, root run, and every child run.");
  assert(childRunIds.every((runId) => Array.isArray(status?.nodes?.[runId])), "Installed academic pipeline status did not recover every child run.");
  for (const childRunId of childRunIds) {
    const childInstructions = runJson(bin, ["instructions", `run:${childRunId}`, "--json"], projectDirectory, environment).data;
    assert(childInstructions?.run?.status === "complete", `Installed academic pipeline child lost persisted completion: ${childRunId}`);
  }
  const completed = runJson(bin, ["instructions", `run:${rootRunId}`, "--json"], projectDirectory, environment).data;
  assert(completed?.run?.status === "complete", "Installed academic pipeline root did not persist completion.");
  runJson(bin, ["show", `run:${rootRunId}`, "--json"], projectDirectory, environment);
  runJson(bin, ["handoff", `run:${rootRunId}`, "--json"], projectDirectory, environment);
  runJson(bin, ["check", "all", "--strict", "--json"], projectDirectory, environment);
}

function runJson(command, args, cwd, env = process.env) {
  const result = run(command, args, cwd, env);
  const envelope = JSON.parse(result.stdout);
  assert(envelope.ok === true, `${command} ${args.join(" ")} returned a failed JSON envelope.`);
  return envelope;
}

async function directoryNames(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

async function pathExists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
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
