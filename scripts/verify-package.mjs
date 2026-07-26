import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const packageRoot = process.cwd();
const temporaryRoot = await mkdtemp(path.join(tmpdir(), "researchspec-release-"));
const packageDirectory = path.join(temporaryRoot, "package");
const installDirectory = path.join(temporaryRoot, "install");
const projectDirectory = path.join(temporaryRoot, "project");
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
  "advance", "archive", "check", "decide", "handoff", "init", "instructions", "list",
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
  await Promise.all([
    mkdir(packageDirectory, { recursive: true }),
    mkdir(installDirectory, { recursive: true }),
    mkdir(projectDirectory, { recursive: true }),
    mkdir(codexHome, { recursive: true }),
  ]);

  const pack = run(npmCommand(), ["pack", "--json", "--pack-destination", packageDirectory], packageRoot);
  const metadata = parsePackMetadata(pack.stdout);
  verifyTarballFiles(metadata.files.map((file) => file.path));

  const tarball = path.join(packageDirectory, metadata.filename);
  await writeFile(path.join(installDirectory, "package.json"), "{\"private\":true}\n", "utf8");
  run(npmCommand(), ["install", "--ignore-scripts", "--no-audit", "--no-fund", tarball], installDirectory);

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
  const installedSkills = (await directoryNames(path.join(projectDirectory, ".codex", "skills"))).sort();
  assert(equal(installedSkills, expectedSkills), `Installed Skill surface mismatch: ${installedSkills.join(", ")}`);
  for (const skill of expectedSkills) {
    const license = await readFile(path.join(projectDirectory, ".codex", "skills", skill, "LICENSE"), "utf8");
    assert(license.trim().length > 0, `Installed Skill license is empty: ${skill}`);
  }
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

  process.stdout.write(`Release package verified: ${metadata.filename} (${String(metadata.files.length)} files, ${String(metadata.unpackedSize)} bytes unpacked)\n`);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

function verifyTarballFiles(files) {
  const required = [
    "package.json", "README.md", "CHANGELOG.md", "SECURITY.md", "LICENSE", "NOTICE",
    "LICENSES/MIT.txt", "LICENSES/CC-BY-NC-4.0.txt", "LICENSES/CC-BY-SA-4.0.txt", "LICENSES/Apache-2.0.txt", "LICENSES/AGPL-3.0.txt", "docs/release_process.md",
    "docs/arsu_user_usage_model.md", "docs/cli_interface_design.md", "docs/domain_skill_plugins.md", "docs/domain_taxonomy.md", "docs/education_agent_skills_vendor_adapter.md", "docs/literature_system_adapters.md", "docs/finrobot_vendor_adapter.md", "docs/histagent_vendor_adapter.md", "docs/materials_science_skills_vendor_adapter.md", "docs/scientific_agent_skills_vendor_adapter.md", "docs/tooluniverse_vendor_adapter.md",
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
    "artifacts/mvp_release_checklist.md", "dist/src/cli/bin.js",
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

  const allowed = /^(?:package\.json|README\.md|CHANGELOG\.md|SECURITY\.md|LICENSE|NOTICE|LICENSES\/[^/]+|docs\/(?:release_process|arsu_user_usage_model|cli_interface_design|domain_skill_plugins|domain_taxonomy|education_agent_skills_vendor_adapter|literature_system_adapters|finrobot_vendor_adapter|histagent_vendor_adapter|materials_science_skills_vendor_adapter|scientific_agent_skills_vendor_adapter|tooluniverse_vendor_adapter)\.md|artifacts\/mvp_release_checklist\.md|dist\/src\/.*\.js|skills\/.*|literature-adapters\/.*)$/;
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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
