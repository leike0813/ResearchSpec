import { z } from "zod";

import {
  RuntimeSelectorSchema,
  parseRuntimeSelector,
  type RuntimeSelector,
} from "./runtime-selector.js";

const SafeId = "[A-Za-z0-9][A-Za-z0-9._-]*";

export const ChangeSelectorSchema = z.string().regex(new RegExp(`^change:${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const PatchSelectorSchema = z.string().regex(new RegExp(`^patch:${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const LedgerGateSelectorSchema = z.string().regex(new RegExp(`^gate:${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const ObligationSelectorSchema = z.string().regex(new RegExp(`^obligation:sf-${SafeId}/${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const CompletionSelectorSchema = z.string().regex(new RegExp(`^completion:sf-${SafeId}/${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const CaseActionSelectorSchema = z.string().regex(new RegExp(`^case-action:${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const WorkflowDetailSelectorSchema = z.literal("workflow:current");

export interface ActionSelectorFamilyDisplay {
  id: "subflow" | "obligation" | "gate" | "completion" | "case-action" | "patch" | "change" | "work" | "transition";
  patterns: readonly string[];
  examples: readonly string[];
}

export const ACTION_SELECTOR_FAMILY_DISPLAYS = [
  {
    id: "subflow",
    patterns: ["subflow:tpl-<id>", "subflow:sf-<id>", "subflow:sf-<instance>/<node>"],
    examples: ["subflow:tpl-deep-research-quick"],
  },
  {
    id: "obligation",
    patterns: ["obligation:sf-<instance>/<id>"],
    examples: ["obligation:sf-example/rq-brief"],
  },
  {
    id: "gate",
    patterns: ["gate:<id>", "gate:sf-<instance>/<id>"],
    examples: ["gate:sf-example/evidence-quality"],
  },
  {
    id: "completion",
    patterns: ["completion:sf-<instance>/<id>"],
    examples: ["completion:sf-example/route-complete"],
  },
  {
    id: "case-action",
    patterns: ["case-action:<id>"],
    examples: ["case-action:scope-resolution"],
  },
  {
    id: "patch",
    patterns: ["patch:<id>"],
    examples: ["patch:revision-001"],
  },
  {
    id: "change",
    patterns: ["change:<id>"],
    examples: ["change:weaken-c001"],
  },
  {
    id: "work",
    patterns: ["work:sf-<instance>/<node>"],
    examples: ["work:sf-example/rq-brief"],
  },
  {
    id: "transition",
    patterns: ["transition:sf-<instance>/<node>"],
    examples: ["transition:sf-example/complete"],
  },
] as const satisfies readonly ActionSelectorFamilyDisplay[];

export function formatActionTargetSelectorHint(): string {
  const families = ACTION_SELECTOR_FAMILY_DISPLAYS
    .map((family) => family.patterns.join(" | "))
    .join("; ");
  return `Run researchspec instructions --help. Accepted selector forms: ${families}. Syntax does not imply current workspace availability; use status and current instructions.`;
}

export const ActionTargetSelectorSchema = z.union([
  RuntimeSelectorSchema,
  ChangeSelectorSchema,
  PatchSelectorSchema,
  LedgerGateSelectorSchema,
  ObligationSelectorSchema,
  CompletionSelectorSchema,
  CaseActionSelectorSchema,
]);
export const DetailSelectorSchema = z.union([
  ActionTargetSelectorSchema,
  WorkflowDetailSelectorSchema,
  z.string().regex(new RegExp(`^(?:artifact|decision|contract|source|claim|tool|attempt):${SafeId}$`))
    .refine((value) => !value.includes("..")),
]);

export type ActionTargetSelector =
  | RuntimeSelector
  | { kind: "change"; selector: string; id: string }
  | { kind: "patch"; selector: string; id: string }
  | { kind: "ledger_gate"; selector: string; id: string }
  | { kind: "obligation"; selector: string; instanceId: string; id: string }
  | { kind: "completion"; selector: string; instanceId: string; id: string }
  | { kind: "case_action"; selector: string; id: string };

export function parseActionTargetSelector(value: string): ActionTargetSelector | undefined {
  const runtime = parseRuntimeSelector(value);
  if (runtime) return runtime;
  if (ChangeSelectorSchema.safeParse(value).success) return { kind: "change", selector: value, id: value.slice("change:".length) };
  if (PatchSelectorSchema.safeParse(value).success) return { kind: "patch", selector: value, id: value.slice("patch:".length) };
  if (LedgerGateSelectorSchema.safeParse(value).success) return { kind: "ledger_gate", selector: value, id: value.slice("gate:".length) };
  if (ObligationSelectorSchema.safeParse(value).success) {
    const [instanceId, id] = value.slice("obligation:".length).split("/", 2);
    return { kind: "obligation", selector: value, instanceId: instanceId ?? "", id: id ?? "" };
  }
  if (CompletionSelectorSchema.safeParse(value).success) {
    const [instanceId, id] = value.slice("completion:".length).split("/", 2);
    return { kind: "completion", selector: value, instanceId: instanceId ?? "", id: id ?? "" };
  }
  if (CaseActionSelectorSchema.safeParse(value).success) return { kind: "case_action", selector: value, id: value.slice("case-action:".length) };
  return undefined;
}

export function directedInstructionsSelector(selector: string): string {
  return `instructions:${selector}`;
}

export function directedShowSelector(selector: string): string {
  return `show:${selector}`;
}

export function directedListSelector(collection: string): string {
  return `list:${collection}`;
}
