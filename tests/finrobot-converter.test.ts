import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import { availableDomains, loadPluginRegistry, resolveDomainSelection } from "../src/plugins/registry.js";
import { checkFinRobotIdempotence, checkFinRobotOutput, type FinRobotConversionManifest } from "../src/vendor-converters/finrobot/converter.js";
import { assertNoSensitiveValues, loadFinRobotDraftPolicies } from "../src/vendor-converters/finrobot/policy.js";
import { renderFinRobotPreviewSet } from "../src/vendor-converters/finrobot/preview.js";

const REPO_ROOT = path.resolve(".");
const PLUGIN_ROOT = path.resolve("skills/plugins");
const VENDOR_ROOT = path.join(PLUGIN_ROOT, "vendors/finrobot");
const APPROVED_HASH = "83cc17371bd3e0b82434f67e74adc5ed8a12cf11979480e1eb1f83debe1a9bb3";

void test("FinRobot generated bundle is the approved six-Skill projection", async () => {
  const policies = await loadFinRobotDraftPolicies(REPO_ROOT);
  const preview = await renderFinRobotPreviewSet(REPO_ROOT);
  const loaded = await loadPluginRegistry(PLUGIN_ROOT);
  const manifest = JSON.parse(await readFile(path.join(PLUGIN_ROOT, "vendor-manifests/finrobot.json"), "utf8")) as FinRobotConversionManifest;

  assert.equal(policies.review.review_status, "approved");
  assert.equal(preview.draftSetSha256, APPROVED_HASH);
  assert.equal(manifest.approved_tree_set_sha256, APPROVED_HASH);
  assert.deepEqual([...loaded.vendors.keys()], ["finrobot", "materials-science-skills-for-llm", "scientific-agent-skills", "tooluniverse"]);
  assert.equal(loaded.vendors.get("finrobot")?.skills.length, 6);
  assert.ok(loaded.vendors.get("finrobot")?.skills.every((skill) => skill.dependencies.length === 0));
  assert.equal(loaded.domains.size, 218);
  assert.equal(availableDomains(loaded).length, 51);
  assert.deepEqual(loaded.domains.get("accounting-auditing-and-accountability")?.skills, [
    "financial-research-company-fundamentals",
    "financial-research-statement-analysis",
  ]);
  assert.equal(loaded.domains.get("banking-finance-and-investment")?.skills.length, 6);
  assert.equal(resolveDomainSelection(loaded, ["banking-finance-and-investment"]).resolvedSkillIds.length, 6);
  assert.ok(policies.relationships.decisions.every((item) => item.disposition === "advisory"));

  for (const skill of preview.previews) {
    assert.equal(manifest.tree_sha256[skill.skillId], skill.sha256);
    for (const file of skill.files) {
      assert.deepEqual(await readFile(path.join(VENDOR_ROOT, skill.skillId, file.path)), file.content, `${skill.skillId}/${file.path}`);
    }
  }
});

void test("FinRobot executable resources preserve capability while removing aggregate runtime coupling", async () => {
  const policies = await loadFinRobotDraftPolicies(REPO_ROOT);
  const distributed = policies.sourceEntries.decisions.filter((item) =>
    ["direct-resource", "adapted-resource", "prompt-resource"].includes(item.production_action),
  );
  assert.equal(distributed.filter((item) => item.production_action === "direct-resource").length, 4);
  assert.equal(distributed.filter((item) => item.production_action === "prompt-resource").length, 6);
  assert.equal(distributed.filter((item) => item.production_action === "adapted-resource").length, 6);
  assert.ok(distributed.every((item) => item.finrobot_coupling !== "hard"));
  assert.ok(distributed.every((item) => item.required_symbols.length > 0));

  const pythonRoot = path.resolve("src/vendor-converters/finrobot/curation/resources/python");
  const resources = {
    catalyst: await readFile(path.join(pythonRoot, "catalyst_analyzer.py"), "utf8"),
    processor: await readFile(path.join(pythonRoot, "financial_data_processor.py"), "utf8"),
    sensitivity: await readFile(path.join(pythonRoot, "sensitivity_analyzer.py"), "utf8"),
    valuation: await readFile(path.join(pythonRoot, "valuation_engine.py"), "utf8"),
    analyzer: await readFile(path.join(pythonRoot, "financial_analyzer.py"), "utf8"),
    generator: await readFile(path.join(pythonRoot, "enhanced_text_generator.py"), "utf8"),
    contracts: await readFile(path.join(pythonRoot, "provider_contracts.py"), "utf8"),
    adapters: await readFile(path.join(pythonRoot, "provider_adapters.py"), "utf8"),
  };
  assert.match(resources.catalyst, /def _estimate_probability/);
  assert.match(resources.catalyst, /def assess_catalyst_impact/);
  assert.match(resources.processor, /pe_annual_factor: float = 0\.95/);
  assert.match(resources.sensitivity, /std_ratio: float = 0\.15/);
  assert.match(resources.valuation, /def calculate_dcf_valuation|def calculate_peer_comparison_valuation/);
  assert.match(resources.analyzer, /class ReportAnalysisUtils|def get_key_data|Target Price/);
  assert.match(resources.generator, /def generate_investment_recommendation|target_price|rating/);
  assert.match(resources.contracts, /class MarketDataProvider|class TextGenerator|class DataRequest/);
  assert.match(resources.adapters, /class YFinanceAdapter|class SECSectionAdapter|class FMPAdapter/);
  for (const [name, content] of Object.entries(resources)) {
    assert.doesNotMatch(content, /(?:^|\n)\s*(?:from|import)\s+finrobot(?:\.|\s|$)/m, name);
    assert.doesNotMatch(content, /(?:^|\n)\s*(?:from|import)\s+(?:openai|yfinance|requests|sec_api)(?:\.|\s|$)/m, name);
  }

  const agentRoot = path.resolve("src/vendor-converters/finrobot/curation/resources/agent-specs");
  for (const name of ["company_overview", "competitor_analysis", "major_takeaways", "news_summary", "risks", "valuation_overview"]) {
    const spec = JSON.parse(await readFile(path.join(agentRoot, `${name}.json`), "utf8")) as { instructions: string; output_schema: { required: string[] }; execution: { converter_execution: string } };
    assert.ok(spec.instructions.length > 400, name);
    assert.equal(spec.output_schema.required.length, 1, name);
    assert.equal(spec.execution.converter_execution, "never", name);
  }
});

void test("FinRobot form-safety rejects sensitive values without censoring business capability", () => {
  for (const content of [
    "token = 'sk-exampleActualSecretValue123'",
    "-----BEGIN PRIVATE KEY-----",
    "api_key = 'real-looking-secret-value'",
    "source = '/home/alice/private/model.csv'",
    "endpoint = 'https://pricing.internal/v1'",
  ]) assert.throws(() => assertNoSensitiveValues(content, "fixture"));

  assert.doesNotThrow(() => assertNoSensitiveValues(
    "Provider: OpenAI or FMP; credential: ${USER_CONFIGURED_TOKEN}; install with pip; produce forecast, probability, sentiment, target price, rating, recommendation, and valuation conclusion.",
    "allowed-fixture",
  ));
});

void test("FinRobot Python resources pass offline syntax compilation", { skip: spawnSync("python3", ["--version"]).status !== 0 }, async () => {
  const cacheRoot = await mkdtemp(path.join(tmpdir(), "researchspec-finrobot-pycache-"));
  try {
    const files = [
      "catalyst_analyzer.py", "enhanced_text_generator.py", "financial_analyzer.py",
      "financial_data_processor.py", "provider_adapters.py", "provider_contracts.py",
      "sensitivity_analyzer.py", "valuation_engine.py",
    ].map((name) => path.resolve("src/vendor-converters/finrobot/curation/resources/python", name));
    execFileSync("python3", ["-m", "py_compile", ...files], {
      env: { ...process.env, PYTHONPYCACHEPREFIX: cacheRoot },
      stdio: "pipe",
    });
  } finally {
    await rm(cacheRoot, { recursive: true, force: true });
  }
});

void test("FinRobot output check and regeneration are idempotent", async () => {
  assert.deepEqual(await checkFinRobotOutput(REPO_ROOT), { ok: true, errors: [], warnings: [] });
  assert.deepEqual(await checkFinRobotIdempotence(REPO_ROOT), { ok: true, drift_paths: [] });
});
