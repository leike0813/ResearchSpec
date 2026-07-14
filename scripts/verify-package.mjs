import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
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
];
const expectedCommands = [
  "advance", "archive", "check", "decide", "handoff", "init", "instructions", "list",
  "pack", "plugin", "propose", "show", "start", "status", "submit", "update",
];
const expectedDomains = [
  "analytical-chemistry", "applied-mathematics", "artificial-intelligence", "astronomical-sciences",
  "biochemistry-and-cell-biology", "bioinformatics-and-computational-biology",
  "clinical-sciences", "computational-modeling-and-simulation", "computer-vision-and-multimedia-computation",
  "control-engineering-mechatronics-and-robotics",
  "data-management-and-data-science", "ecological-applications", "ecology", "epidemiology",
  "evolutionary-biology", "experimental-design-and-data-analysis", "genetics", "geomatic-engineering",
  "health-services-and-systems", "human-centred-computing", "immunology", "inorganic-chemistry",
  "laboratory-automation-and-informatics", "library-and-information-studies", "machine-learning",
  "macromolecular-and-materials-chemistry", "medical-and-biological-physics",
  "medical-biochemistry-and-metabolomics", "medical-biotechnology", "medical-microbiology",
  "medicinal-and-biomolecular-chemistry", "microbiology", "neurosciences", "numerical-and-computational-mathematics",
  "oncology-and-carcinogenesis",
  "organic-chemistry", "pharmacology-and-pharmaceutical-sciences", "physical-chemistry", "plant-biology", "statistics",
  "quantum-physics", "research-computing-infrastructure", "scientific-visualization-and-communication", "theory-of-computation",
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

  const environment = { ...process.env, CODEX_HOME: codexHome };
  run(bin, ["init", projectDirectory, "--tools", "codex", "--json"], installDirectory, environment);
  const installedSkills = (await directoryNames(path.join(projectDirectory, ".codex", "skills"))).sort();
  assert(equal(installedSkills, expectedSkills), `Installed Skill surface mismatch: ${installedSkills.join(", ")}`);
  for (const skill of expectedSkills) {
    const license = await readFile(path.join(projectDirectory, ".codex", "skills", skill, "LICENSE"), "utf8");
    assert(license.trim().length > 0, `Installed Skill license is empty: ${skill}`);
  }
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
    "LICENSES/MIT.txt", "LICENSES/CC-BY-NC-4.0.txt", "docs/release_process.md",
    "docs/arsu_user_usage_model.md", "docs/cli_interface_design.md", "docs/domain_skill_plugins.md", "docs/domain_taxonomy.md", "docs/scientific_agent_skills_vendor_adapter.md", "docs/tooluniverse_vendor_adapter.md",
    "skills/plugins/registry.json", "skills/plugins/vendor-bundles/tooluniverse.json", "skills/plugins/vendor-manifests/tooluniverse.json",
    "skills/plugins/conversion-reports/tooluniverse.md",
    "skills/plugins/vendors/tooluniverse/tooluniverse-statistical-modeling/SKILL.md",
    "skills/plugins/vendor-bundles/scientific-agent-skills.json", "skills/plugins/vendor-manifests/scientific-agent-skills.json",
    "skills/plugins/conversion-reports/scientific-agent-skills.md",
    "skills/plugins/vendors/scientific-agent-skills/scientific-agent-skills-astropy/SKILL.md",
    "artifacts/mvp_release_checklist.md", "dist/src/cli/bin.js",
  ];
  for (const skill of expectedSkills.slice(0, 4)) {
    required.push(`skills/arsu/${skill}/SKILL.md`, `skills/arsu/${skill}/LICENSE`, `skills/arsu/${skill}/NOTICE.md`);
  }
  for (const item of required) assert(files.includes(item), `Tarball is missing required file: ${item}`);

  const allowed = /^(?:package\.json|README\.md|CHANGELOG\.md|SECURITY\.md|LICENSE|NOTICE|LICENSES\/[^/]+|docs\/(?:release_process|arsu_user_usage_model|cli_interface_design|domain_skill_plugins|domain_taxonomy|scientific_agent_skills_vendor_adapter|tooluniverse_vendor_adapter)\.md|artifacts\/mvp_release_checklist\.md|dist\/src\/.*\.js|skills\/.*)$/;
  const retired = /^dist\/src\/adapters\/companion\/workflows\/(?:archive|check|context|explore|next|submit)\.js$/;
  for (const file of files) {
    assert(allowed.test(file), `Tarball contains a path outside the release allowlist: ${file}`);
    assert(!file.startsWith("playbooks/"), `Tarball contains repository-only playbook material: ${file}`);
    assert(file !== "artifacts/researchspec_dogfooding_guide.md", `Tarball contains the retired dogfooding guide: ${file}`);
    assert(!file.startsWith("dist/tests/"), `Tarball contains compiled tests: ${file}`);
    assert(!file.startsWith("tests/fixtures/domain-skill-plugins/"), `Tarball contains plugin test fixtures: ${file}`);
    assert(!file.startsWith("vendor/tooluniverse/"), `Tarball contains the ToolUniverse source checkout: ${file}`);
    assert(!file.startsWith("vendor/scientific-agent-skills/"), `Tarball contains the Scientific Agent Skills source checkout: ${file}`);
    assert(!file.startsWith("audits/"), `Tarball contains maintainer-only vendor audit evidence: ${file}`);
    assert(!file.endsWith(".d.ts"), `Tarball contains TypeScript declarations: ${file}`);
    assert(!file.endsWith(".js.map"), `Tarball contains source maps: ${file}`);
    assert(!retired.test(file), `Tarball contains a retired Companion workflow: ${file}`);
  }
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
