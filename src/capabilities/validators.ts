import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import type { CapabilityManifest } from "../core/contracts/capability-manifest.js";
import type { CapabilityGraphProfile } from "../core/contracts/capability-graph.js";

const execFileAsync = promisify(execFile);

export interface ValidatorSubmission {
  run_id: string;
  node_id: string;
  submitted_at: string;
  inputs: ValidatorInput[];
  outputs: Array<{ role: string; path: string }>;
  evidence?: Array<{ role: string; path: string }>;
}

export interface ValidatorInput {
  role: string;
  path?: string;
  value?: string | number | boolean | null;
}

export interface CapabilityValidatorResult {
  validator_id: string;
  status: "pass" | "fail" | "degraded";
  code?: string;
  detail?: string;
}

export interface CapabilityValidatorRun {
  ok: boolean;
  results: CapabilityValidatorResult[];
}

export async function runCapabilityValidators(
  manifest: CapabilityManifest,
  packageRoot: string,
  submission: ValidatorSubmission,
): Promise<CapabilityValidatorRun> {
  const results: CapabilityValidatorResult[] = [];
  for (const validator of manifest.validators) {
    if (validator.kind === "policy") {
      results.push(runPolicyValidator(manifest, validator.validator_id, submission));
      continue;
    }
    if (validator.kind === "schema") {
      results.push({ validator_id: validator.validator_id, status: "fail", code: "schema_validator_unresolved", detail: "No executable schema validator is registered for this manifest entry." });
      continue;
    }
    results.push(await runScriptValidator(manifest, packageRoot, validator.validator_id, submission));
  }
  return { ok: results.every((item) => item.status === "pass"), results };
}

function runPolicyValidator(manifest: CapabilityManifest, validatorId: string, submission: ValidatorSubmission): CapabilityValidatorResult {
  if (validatorId === "capability.policy.output_roles") {
    const expected = new Set(manifest.outputs.map((item) => item.role));
    const required = new Set(manifest.outputs.filter((item) => item.required !== false).map((item) => item.role));
    const actual = new Set(submission.outputs.map((item) => item.role));
    const missing = [...required].filter((role) => !actual.has(role));
    const unknown = [...actual].filter((role) => !expected.has(role));
    if (missing.length > 0 || unknown.length > 0) {
      return { validator_id: validatorId, status: "fail", code: "output_roles_invalid", detail: `missing=[${missing.join(",")}] unknown=[${unknown.join(",")}]` };
    }
    return { validator_id: validatorId, status: "pass" };
  }
  return { validator_id: validatorId, status: "fail", code: "policy_validator_unknown", detail: "The policy validator is not registered by the engine." };
}

async function runScriptValidator(
  manifest: CapabilityManifest,
  packageRoot: string,
  validatorId: string,
  submission: ValidatorSubmission,
): Promise<CapabilityValidatorResult> {
  const validator = manifest.validators.find((item) => item.validator_id === validatorId);
  if (!validator?.runner) return { validator_id: validatorId, status: "fail", code: "runner_missing" };
  const temporary = await mkdtemp(path.join(tmpdir(), "researchspec-validator-"));
  const outputsFile = path.join(temporary, "submission.json");
  await writeFile(outputsFile, `${JSON.stringify({
    schema_version: "1",
    run_id: submission.run_id,
    node_id: submission.node_id,
    submitted_at: submission.submitted_at,
    inputs: submission.inputs,
    outputs: submission.outputs,
    evidence: submission.evidence ?? [],
  }, null, 2)}\n`, "utf8");
  try {
    const args = validator.runner.args_template.map((token) => token
      .replaceAll("{package_root}", packageRoot)
      .replaceAll("{outputs_json}", outputsFile));
    await execFileAsync(validator.runner.argv0, args, { cwd: packageRoot, timeout: 30_000, encoding: "utf8" });
    return { validator_id: validatorId, status: "pass" };
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException & { stdout?: string; stderr?: string; code?: string | number };
    if (validator.network === true && validator.degraded_verdict) {
      return {
        validator_id: validatorId,
        status: "degraded",
        code: nodeError.code ?? "validator_failed",
        detail: validator.degraded_verdict,
      };
    }
    const detail = [nodeError.stderr, nodeError.stdout].filter((item): item is string => typeof item === "string" && item.trim().length > 0).join(" | ").slice(0, 500);
    return { validator_id: validatorId, status: "fail", code: nodeError.code ?? "validator_failed", detail };
  } finally {
    await rm(temporary, { recursive: true, force: true }).catch(() => undefined);
  }
}

export function declaredValidatorIds(manifest: CapabilityManifest, node: CapabilityGraphProfile["nodes"][number]): string[] {
  const expectedRoles = new Set(node.expected_outputs.map((item) => item.role));
  return manifest.validators
    .filter((validator) => validator.inputs.every((role) => role === "*" || expectedRoles.has(role)))
    .map((validator) => validator.validator_id);
}
