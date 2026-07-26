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
export const WorkflowDetailSelectorSchema = z.literal("workflow:current");
export const ActionTargetSelectorSchema = z.union([
  RuntimeSelectorSchema,
  ChangeSelectorSchema,
  PatchSelectorSchema,
  LedgerGateSelectorSchema,
]);
export const DetailSelectorSchema = z.union([
  ActionTargetSelectorSchema,
  WorkflowDetailSelectorSchema,
  z.string().regex(new RegExp(`^(?:artifact|decision|contract|source|claim|tool):${SafeId}$`))
    .refine((value) => !value.includes("..")),
]);

export type ActionTargetSelector =
  | RuntimeSelector
  | { kind: "change"; selector: string; id: string }
  | { kind: "patch"; selector: string; id: string }
  | { kind: "ledger_gate"; selector: string; id: string };

export function parseActionTargetSelector(value: string): ActionTargetSelector | undefined {
  const runtime = parseRuntimeSelector(value);
  if (runtime) return runtime;
  if (ChangeSelectorSchema.safeParse(value).success) return { kind: "change", selector: value, id: value.slice("change:".length) };
  if (PatchSelectorSchema.safeParse(value).success) return { kind: "patch", selector: value, id: value.slice("patch:".length) };
  if (LedgerGateSelectorSchema.safeParse(value).success) return { kind: "ledger_gate", selector: value, id: value.slice("gate:".length) };
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
