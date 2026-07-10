import { z } from "zod";

const SafeId = "[A-Za-z0-9][A-Za-z0-9._-]*";

export const LegacyWorkSelectorSchema = z.string().regex(new RegExp(`^work:${SafeId}$`))
  .refine((value) => !value.slice("work:".length).includes(".."));
export const ScopedWorkSelectorSchema = z.string().regex(new RegExp(`^work:sf-${SafeId}/${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const WorkItemSelectorSchema = z.union([ScopedWorkSelectorSchema, LegacyWorkSelectorSchema]);
export const SubflowTemplateSelectorSchema = z.string().regex(new RegExp(`^subflow:tpl-${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const SubflowInstanceSelectorSchema = z.string().regex(new RegExp(`^subflow:sf-${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const SubflowSelectorSchema = z.union([SubflowTemplateSelectorSchema, SubflowInstanceSelectorSchema]);
export const ReservedRuntimeSelectorSchema = z.string().regex(new RegExp(`^(?:gate|transition):${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const RuntimeSelectorSchema = z.union([WorkItemSelectorSchema, SubflowSelectorSchema, ReservedRuntimeSelectorSchema]);

export type RuntimeSelector =
  | { kind: "legacy_work"; selector: string; workItemId: string }
  | { kind: "scoped_work"; selector: string; instanceId: string; workItemId: string }
  | { kind: "subflow_template"; selector: string; templateId: string }
  | { kind: "subflow_instance"; selector: string; instanceId: string }
  | { kind: "reserved"; selector: string; namespace: "gate" | "transition"; id: string };

export function parseRuntimeSelector(value: string): RuntimeSelector | undefined {
  if (!RuntimeSelectorSchema.safeParse(value).success) return undefined;
  if (value.startsWith("work:sf-") && value.includes("/")) {
    const [instanceId, workItemId] = value.slice("work:".length).split("/", 2);
    if (instanceId && workItemId) return { kind: "scoped_work", selector: value, instanceId, workItemId };
  }
  if (value.startsWith("work:")) return { kind: "legacy_work", selector: value, workItemId: value.slice("work:".length) };
  if (value.startsWith("subflow:tpl-")) return { kind: "subflow_template", selector: value, templateId: value.slice("subflow:".length) };
  if (value.startsWith("subflow:sf-")) return { kind: "subflow_instance", selector: value, instanceId: value.slice("subflow:".length) };
  const [namespace, id] = value.split(":", 2) as ["gate" | "transition", string];
  return { kind: "reserved", selector: value, namespace, id };
}

