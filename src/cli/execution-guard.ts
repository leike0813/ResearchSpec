import { confirm } from "@inquirer/prompts";

import { Sha256Schema } from "../core/contracts/artifact.js";
import type { WorkspaceSnapshot } from "../core/workspace/snapshot.js";
import { evaluateActionAvailability } from "../core/runtime/action-availability.js";
import { CliError, type CommandContext } from "./types.js";

export interface PlanBoundExecution {
  snapshot: WorkspaceSnapshot;
  selector: string;
  planSha256: string;
  expectedActionBasisSha256?: string;
  expectedPlanSha256?: string;
  context: CommandContext;
  action: string;
  alreadyApplied?: boolean;
  confirmExecution?: (message: string) => Promise<boolean>;
}

export async function authorizePlanBoundExecution(input: PlanBoundExecution): Promise<void> {
  const availability = await currentAvailability(input);
  validateOptionalHash(input.expectedPlanSha256, "invalid_expected_plan_sha256", "--expected-plan-sha256");
  if (input.expectedPlanSha256 && input.expectedPlanSha256 !== input.planSha256) {
    throw new CliError("plan_stale", `${input.action} plan no longer matches the approved preview.`, 3, `Refresh instructions:${input.selector}.`, {
      expected: input.expectedPlanSha256,
      actual: input.planSha256,
      next_selector: `instructions:${input.selector}`,
    });
  }
  if (input.context.dryRun || input.alreadyApplied) return;
  if (!input.context.interactive) {
    if (!input.context.yes || !input.expectedActionBasisSha256 || !input.expectedPlanSha256) {
      throw new CliError(
        "confirmation_required",
        `Non-interactive ${input.action} requires --expected-action-basis-sha256, --expected-plan-sha256, and --yes.`,
        2,
        `Preview the identical plan for ${input.selector} with --dry-run --json after human review.`,
      );
    }
    return;
  }
  const ask = input.confirmExecution ?? (async (message: string) => confirm({ message, default: false }));
  const approved = await ask(
    `${input.action} ${input.selector} using action basis ${availability.basis_sha256} and plan ${input.planSha256}?`,
  );
  if (!approved) throw new CliError("cancelled", `${input.action} cancelled.`, 1);
}

export async function assertPlanBoundActionAvailable(
  snapshot: WorkspaceSnapshot,
  selector: string,
  expectedActionBasisSha256?: string,
): Promise<void> {
  await currentAvailability({
    snapshot,
    selector,
    planSha256: "0".repeat(64),
    expectedActionBasisSha256,
    context: {
      command: "",
      cwd: snapshot.workspace,
      json: false,
      dryRun: true,
      force: false,
      yes: false,
      quiet: true,
      interactive: false,
    },
    action: "Action",
  });
}

async function currentAvailability(input: PlanBoundExecution) {
  validateOptionalHash(
    input.expectedActionBasisSha256,
    "invalid_expected_action_basis_sha256",
    "--expected-action-basis-sha256",
  );
  const evaluated = await evaluateActionAvailability(input.snapshot, input.selector);
  if (!evaluated) {
    throw new CliError("action_descriptor_unavailable", `Action descriptor is unavailable: ${input.selector}`, 1);
  }
  if (evaluated.availability.disposition === "blocked") {
    throw new CliError(
      "action_blocked",
      `Action is blocked: ${input.selector}`,
      1,
      `Refresh instructions:${input.selector}.`,
      { availability: evaluated.availability },
    );
  }
  if (
    input.expectedActionBasisSha256
    && input.expectedActionBasisSha256 !== evaluated.availability.basis_sha256
  ) {
    throw new CliError(
      "action_basis_stale",
      `Action descriptor is stale: ${input.selector}`,
      3,
      `Refresh instructions:${input.selector}.`,
      {
        expected: input.expectedActionBasisSha256,
        actual: evaluated.availability.basis_sha256,
        next_selector: `instructions:${input.selector}`,
      },
    );
  }
  return evaluated.availability;
}

function validateOptionalHash(value: string | undefined, code: string, option: string): void {
  if (value !== undefined && !Sha256Schema.safeParse(value).success) {
    throw new CliError(code, `${option} must be 64 lowercase hexadecimal characters.`, 2);
  }
}
