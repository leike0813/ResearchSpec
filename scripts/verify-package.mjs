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
const expectedBaseSkills = [
  "academic-paper",
  "academic-paper-reviewer",
  "academic-pipeline",
  "deep-research",
  "paper-humanizer",
  "researchspec-decide",
  "researchspec-navigate",
  "researchspec-propose",
  "researchspec-verify",
  "review-response",
];
const expectedAdapterSkills = [
  "zotero-bridge-cli",
  "zotero-library-agent",
  "zotero-library-curation",
  "zotero-library-query",
  "zotero-literature-acquisition",
  "zotero-literature-analysis",
  "zotero-research-synthesis",
];
const expectedSkills = [...expectedBaseSkills, ...expectedAdapterSkills].sort();
const expectedCommands = [
  "advance", "archive", "check", "decide", "doctor", "handoff", "init", "instructions", "list",
  "pack", "plugin", "propose", "show", "start", "status", "update",
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
    mkdir(unsupportedProjectDirectory, { recursive: true }),
    mkdir(codexHome, { recursive: true }),
  ]);

  const pack = run(npmCommand(), ["pack", "--json", "--pack-destination", packageDirectory], packageRoot);
  const metadata = parsePackMetadata(pack.stdout);
  verifyTarballFiles(metadata.files.map((file) => file.path));

  const tarball = path.join(packageDirectory, metadata.filename);
  await writeFile(path.join(installDirectory, "package.json"), "{\"private\":true}\n", "utf8");
  run(npmCommand(), ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], installDirectory);

  const installedPackageRoot = path.join(installDirectory, "node_modules", "researchspec");
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
  const currentProfile = parseYaml(await readFile(path.join(currentWorkspace, "profiles", "academic-pipeline.yaml"), "utf8"));
  assert(currentConfig?.schema_version === "1", "Installed init did not create schema 1 config.");
  assert(equal(currentConfig?.literature_adapters?.selected, ["zotero-library"]), "Installed init did not persist the selected literature adapter.");
  assert(currentProfile?.schema_version === "1" && currentProfile?.profile_id === "academic-pipeline", "Installed init did not project the current academic-pipeline profile.");
  const humanizerProfile = parseYaml(await readFile(path.join(currentWorkspace, "profiles", "paper-humanizer.yaml"), "utf8"));
  assert(humanizerProfile?.schema_version === "1" && humanizerProfile?.profile_id === "paper-humanizer", "Installed init did not project the current paper-humanizer profile.");
  assert(equal((await directoryNames(currentWorkspace)).sort(), ["changes", "profiles", "specs", "subflows"]), "Installed current workspace directory set is invalid.");
  for (const spec of ["project.md", "sources.yaml", "claims.yaml", "manuscript.yaml"]) {
    await readFile(path.join(currentWorkspace, "specs", spec), "utf8");
  }
  for (const retiredPath of ["runs", "playbooks", "draft-patches", "artifact-registry.json"]) {
    assert(!await pathExists(path.join(currentWorkspace, retiredPath)), `Installed init created retired path: ${retiredPath}`);
  }
  const installedSkills = (await directoryNames(path.join(projectDirectory, ".agents", "skills"))).sort();
  assert(equal(installedSkills, expectedSkills), `Installed Skill surface mismatch: ${installedSkills.join(", ")}`);
  for (const skill of expectedSkills) {
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
  await verifyInstalledCurrentJourney(bin, projectDirectory, environment);

  run(bin, ["init", allToolsProjectDirectory, "--tools", "all", "--delivery", "both", "--json"], installDirectory, environment);
  await verifyAllToolDelivery(allToolsProjectDirectory, handbookDigest);

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
  const reviewResponseFiles = files.filter((file) => file.startsWith("skills/review-response/") && !file.endsWith("/"));
  assert(reviewResponseFiles.length >= 49, `Absorbed review-response Skill is incomplete: ${String(reviewResponseFiles.length)} files.`);
  const required = [
    "package.json", "README.md", "CHANGELOG.md", "SECURITY.md", "LICENSE", "NOTICE",
    "LICENSES/MIT.txt", "LICENSES/CC-BY-NC-4.0.txt", "LICENSES/CC-BY-SA-4.0.txt", "LICENSES/Apache-2.0.txt", "LICENSES/AGPL-3.0.txt", "docs/release_process.md",
    "docs/arsu_user_usage_model.md", "docs/cli_handbook.md", "docs/cli_interface_design.md", "docs/domain_skill_plugins.md", "docs/domain_taxonomy.md", "docs/education_agent_skills_vendor_adapter.md", "docs/literature_system_adapters.md", "docs/manuscript_annotation_adapters.md", "docs/finrobot_vendor_adapter.md", "docs/histagent_vendor_adapter.md", "docs/materials_science_skills_vendor_adapter.md", "docs/scientific_agent_skills_vendor_adapter.md", "docs/tooluniverse_vendor_adapter.md",
    "docs/researchspec_arsu_runtime/README.md", "docs/researchspec_arsu_runtime/core_runtime_model.md", "docs/researchspec_arsu_runtime/runtime_protocols.md",
    "docs/researchspec_arsu_runtime/deep_research_workflow.md", "docs/researchspec_arsu_runtime/academic_paper_workflow.md", "docs/researchspec_arsu_runtime/academic_paper_reviewer_workflow.md", "docs/researchspec_arsu_runtime/academic_pipeline_workflow.md",
    "docs/researchspec_user_usage_rehearsal.md", "docs/researchspec_user_usage_rehearsal/workspace_lifecycle.md", "docs/researchspec_user_usage_rehearsal/deep_research_journeys.md", "docs/researchspec_user_usage_rehearsal/academic_paper_journeys.md", "docs/researchspec_user_usage_rehearsal/academic_paper_reviewer_journeys.md", "docs/researchspec_user_usage_rehearsal/academic_pipeline_journeys.md", "docs/researchspec_user_usage_rehearsal/companion_journeys.md", "docs/researchspec_user_usage_rehearsal/zotero_and_plugin_journeys.md",
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
    "skills/arsu/researchspec-contracts.json", "artifacts/mvp_release_checklist.md", "dist/src/cli/bin.js", "dist/src/annotation-intake.js", "dist/src/annotation-intake.d.ts",
    "skills/review-response/SKILL.md",
    "skills/review-response/assets/schema/review-response-schema.yaml",
    "skills/review-response/assets/runtime/skill-runtime-digest.md",
    "skills/review-response/assets/templates/render-manifest.yaml",
    "skills/review-response/assets/localization/messages/en.json",
    "skills/review-response/assets/localization/messages/zh-CN.json",
    "skills/review-response/references/workflow-state-machine.md",
    "skills/review-response/references/stage-1-entry-and-bootstrap.md",
    "skills/review-response/references/stage-2-manuscript-analysis.md",
    "skills/review-response/references/stage-3-comment-atomization.md",
    "skills/review-response/references/stage-4-workboard-planning.md",
    "skills/review-response/references/stage-5-strategy-and-execution.md",
    "skills/review-response/references/stage-6-final-review-and-export.md",
    "skills/review-response/scripts/detect_main_tex.py",
    "skills/review-response/scripts/export_manuscript_variants.py",
    "skills/review-response/scripts/runtime_localization.py",
  ];
  for (const skill of expectedSkills.slice(0, 4)) {
    required.push(`skills/arsu/${skill}/SKILL.md`, `skills/arsu/${skill}/LICENSE`, `skills/arsu/${skill}/NOTICE.md`);
  }
  for (const [name, extension] of currentRuntimeDiagrams()) {
    required.push(
      `docs/researchspec_arsu_runtime/diagrams/src/${name}.${extension}`,
      `docs/researchspec_arsu_runtime/diagrams/rendered/${name}.svg`,
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

  const allowed = /^(?:package\.json|README\.md|CHANGELOG\.md|SECURITY\.md|LICENSE|NOTICE|LICENSES\/[^/]+|docs\/(?:release_process|arsu_user_usage_model|cli_handbook|cli_interface_design|domain_skill_plugins|domain_taxonomy|education_agent_skills_vendor_adapter|literature_system_adapters|manuscript_annotation_adapters|finrobot_vendor_adapter|histagent_vendor_adapter|materials_science_skills_vendor_adapter|scientific_agent_skills_vendor_adapter|tooluniverse_vendor_adapter)\.md|docs\/researchspec_arsu_runtime\/.*|docs\/researchspec_user_usage_rehearsal(?:\.md|\/.*)|artifacts\/mvp_release_checklist\.md|dist\/src\/.*\.(?:js|d\.ts)|skills\/.*|literature-adapters\/.*)$/;
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
    assert(!file.endsWith(".js.map"), `Tarball contains source maps: ${file}`);
    assert(!retired.test(file), `Tarball contains a retired Companion workflow: ${file}`);
    assert(!retiredRuntimeModule(file), `Tarball contains a retired runtime module: ${file}`);
  }
}

async function verifyRepositoryRuntimeGuidance(root) {
  for (const [name, extension] of currentRuntimeDiagrams()) {
    await access(path.join(root, "docs", "researchspec_arsu_runtime", "diagrams", "src", `${name}.${extension}`));
    await access(path.join(root, "docs", "researchspec_arsu_runtime", "diagrams", "rendered", `${name}.svg`));
  }
}

async function verifyInstalledGuidance(installedPackageRoot, projectRoot, handbookDigest) {
  const contracts = JSON.parse(await readFile(path.join(installedPackageRoot, "skills", "arsu", "researchspec-contracts.json"), "utf8"));
  assert(contracts.integration_profile === "researchspec-preflight-v10", "Installed ARSU contracts do not use preflight v10.");
  for (const skill of expectedSkills.slice(0, 4)) {
    assert(contracts.skill_groups?.[skill]?.profile_id === "researchspec-preflight-v10", `Installed ARSU profile is not v10: ${skill}`);
  }
  const navigateHandbook = await readFile(path.join(projectRoot, ".agents", "skills", "researchspec-navigate", "references", "cli-handbook.md"));
  assert(sha256(navigateHandbook) === handbookDigest, "Installed Codex Navigate handbook differs from the packaged handbook.");
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
  await verifyCurrentPublishedGuidance(installedPackageRoot);
  return sha256(Buffer.from(sourceHandbook, "utf8"));
}

async function verifyCurrentPublishedGuidance(installedPackageRoot) {
  const currentGuidance = [
    "README.md",
    "SECURITY.md",
    "docs/arsu_user_usage_model.md",
    "docs/cli_handbook.md",
    "docs/cli_interface_design.md",
    "docs/domain_skill_plugins.md",
    "docs/literature_system_adapters.md",
    "docs/manuscript_annotation_adapters.md",
    "docs/researchspec_arsu_runtime/README.md",
    "docs/researchspec_arsu_runtime/core_runtime_model.md",
    "docs/researchspec_arsu_runtime/runtime_protocols.md",
    "docs/researchspec_arsu_runtime/deep_research_workflow.md",
    "docs/researchspec_arsu_runtime/academic_paper_workflow.md",
    "docs/researchspec_arsu_runtime/academic_paper_reviewer_workflow.md",
    "docs/researchspec_arsu_runtime/academic_pipeline_workflow.md",
  ];
  const retiredBehavior = /researchspec submit|--migrate-runtime|--profile strict|--expected-plan-sha256|runs\/current|specs\/workflow\.yaml|artifact-registry|decision-ledger|gate-ledger|strict compatibility|adaptive runtime|Material Passport/i;
  for (const relativePath of currentGuidance) {
    const content = await readFile(path.join(installedPackageRoot, relativePath), "utf8");
    assert(!retiredBehavior.test(content), `Packaged current guidance contains retired behavior: ${relativePath}`);
  }
}

async function verifyAllToolDelivery(projectRoot, handbookDigest) {
  const manifest = JSON.parse(await readFile(path.join(projectRoot, "researchspec", "tool-installation-manifest.json"), "utf8"));
  const installations = Array.isArray(manifest.installations) ? manifest.installations : [];
  assert(equal(manifest.literature_adapter_resolutions, []), "Default all-tool init unexpectedly installed a literature adapter.");
  assert(!await pathExists(path.join(projectRoot, ".zotero-bridge")), "Default all-tool init unexpectedly created .zotero-bridge.");
  const handbookReferences = installations.filter((item) =>
    item?.source?.kind === "companion-skill"
    && item.source.skill_id === "researchspec-navigate"
    && typeof item?.target?.path === "string"
    && item.target.scope === "project"
    && item.target.path.replaceAll("\\", "/").endsWith("/researchspec-navigate/references/cli-handbook.md"));
  assert(handbookReferences.length === 35, `Expected 35 project Navigate handbook references, found ${String(handbookReferences.length)}.`);
  assert(new Set(handbookReferences.map((item) => item.tool_id)).size === 35, "Navigate handbook references do not cover all project Skill writers.");
  for (const reference of handbookReferences) {
    assert(reference.target.scope === "project", `Navigate handbook reference is not project-local: ${String(reference.tool_id)}`);
    assert(reference.sha256 === handbookDigest, `Navigate handbook manifest digest differs for ${String(reference.tool_id)}.`);
    const bytes = await readFile(path.join(projectRoot, reference.target.path));
    assert(sha256(bytes) === handbookDigest, `Navigate handbook bytes differ for ${String(reference.tool_id)}.`);
  }

  const commandInstallations = installations.filter((item) => item?.source?.kind === "command");
  assert(commandInstallations.length === 28 * 16, `Expected 448 command-wrapper installations, found ${String(commandInstallations.length)}.`);
  const commandTools = new Map();
  for (const installation of commandInstallations) {
    const commands = commandTools.get(installation.tool_id) ?? new Set();
    commands.add(installation.source.command_id);
    commandTools.set(installation.tool_id, commands);
  }
  assert(commandTools.size === 28, `Expected 28 command-capable tools, found ${String(commandTools.size)}.`);
  for (const [toolId, commands] of commandTools) assert(commands.size === 16, `Command wrapper count differs for ${String(toolId)}.`);

  const baseSkillsByTool = new Map();
  for (const installation of installations) {
    const source = installation?.source;
    const skillId = source?.kind === "arsu-skill" || source?.kind === "core-skill" || source?.kind === "companion-skill"
      ? source.skill_id
      : undefined;
    if (!skillId || !installation.tool_id) continue;
    const skills = baseSkillsByTool.get(installation.tool_id) ?? new Set();
    skills.add(skillId);
    baseSkillsByTool.set(installation.tool_id, skills);
  }
  assert(baseSkillsByTool.size === 36, `Expected base Skills for 36 physical Skill writers, found ${String(baseSkillsByTool.size)}.`);
  for (const [toolId, skills] of baseSkillsByTool) assert(skills.size === 10, `Base Skill count differs for ${String(toolId)}.`);
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

async function verifyInstalledCurrentJourney(bin, projectDirectory, environment) {
  const instructions = runJson(bin, ["instructions", "route:deep-research:full", "--json"], projectDirectory, environment).data;
  assert(instructions?.confirmation_required === true, "Installed route instructions do not require confirmation.");
  assert(Array.isArray(instructions.formal_gates) && instructions.formal_gates.length > 0, "Installed standalone route exposes no formal Gate.");
  const boundary = instructions.boundary_outputs?.[0];
  assert(boundary?.role && boundary?.type && boundary?.purpose, "Installed route exposes no usable boundary output.");

  const output = {
    role: boundary.role,
    type: boundary.type,
    path: `outputs/${boundary.role}.md`,
    purpose: boundary.purpose,
    intended_consumer: "user",
  };
  const startInputPath = path.join(projectDirectory, "packaged-start.json");
  await writeFile(startInputPath, `${JSON.stringify({
    schema_version: "1",
    confirmed_at: "2026-08-02T12:00:00+08:00",
    prerequisites: [],
    handoff_inputs: [],
    planned_outputs: [output],
    formal_gates: instructions.formal_gates,
    cost: instructions.cost,
  }, null, 2)}\n`, "utf8");
  const started = runJson(bin, [
    "start", "deep-research:full", "--input", startInputPath,
    "--confirmed-by", "Release Verifier", "--json",
  ], projectDirectory, environment).data;
  assert(started?.status === "started" && started.instance_id, "Installed CLI did not start the standalone subflow.");

  const outputPath = path.join(projectDirectory, output.path);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, "# Packaged research output\n\nEvidence prepared for the release Gate.\n", "utf8");
  const handoffInputPath = path.join(projectDirectory, "packaged-handoff.json");
  await writeFile(handoffInputPath, `${JSON.stringify({
    inputs: [],
    outputs: [output],
    body: "# Packaged handoff\n\nThe external output is ready for human Gate review.\n",
  }, null, 2)}\n`, "utf8");
  runJson(bin, ["handoff", `subflow:${started.instance_id}`, "--input", handoffInputPath, "--json"], projectDirectory, environment);

  for (const gateId of instructions.formal_gates) {
    runJson(bin, [
      "decide", `gate:${started.instance_id}/${gateId}`,
      "--verdict", "pass",
      "--actor-name", "Release Verifier",
      "--reason", "The packaged boundary output was reviewed.",
      "--evidence-role", output.role,
      "--json",
    ], projectDirectory, environment);
  }
  runJson(bin, [
    "advance", `subflow:${started.instance_id}`, "--transition", "complete",
    "--actor-name", "release-verifier", "--json",
  ], projectDirectory, environment);
  const status = runJson(bin, ["status", "--json"], projectDirectory, environment).data;
  assert(status?.subflows?.complete === 1, "Installed standalone journey did not reach completion.");
  assert(!status?.active_instances?.some((item) => item.instance_id === started.instance_id), "Installed completed subflow remains active.");
  runJson(bin, ["show", `handoff:${started.instance_id}`, "--json"], projectDirectory, environment);
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
