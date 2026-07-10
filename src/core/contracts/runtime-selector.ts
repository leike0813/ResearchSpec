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
export const ScopedGateSelectorSchema = z.string().regex(new RegExp(`^gate:sf-${SafeId}/${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const LegacyGateSelectorSchema = z.string().regex(new RegExp(`^gate:${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const GateSelectorSchema = z.union([ScopedGateSelectorSchema, LegacyGateSelectorSchema]);
export const TransitionSelectorSchema = z.string().regex(new RegExp(`^transition:sf-${SafeId}/${SafeId}$`))
  .refine((value) => !value.includes(".."));
export const ReservedRuntimeSelectorSchema = z.union([GateSelectorSchema, TransitionSelectorSchema])
  .refine((value) => !value.includes(".."));
export const RuntimeSelectorSchema = z.union([WorkItemSelectorSchema, SubflowSelectorSchema, ReservedRuntimeSelectorSchema]);

export type RuntimeSelector =
  | { kind: "legacy_work"; selector: string; workItemId: string }
  | { kind: "scoped_work"; selector: string; instanceId: string; workItemId: string }
  | { kind: "subflow_template"; selector: string; templateId: string }
  | { kind: "subflow_instance"; selector: string; instanceId: string }
  | { kind: "gate"; selector: string; instanceId?: string; id: string }
  | { kind: "transition"; selector: string; instanceId: string; id: string };

export function parseRuntimeSelector(value: string): RuntimeSelector | undefined {
  if (!RuntimeSelectorSchema.safeParse(value).success) return undefined;
  if (value.startsWith("work:sf-") && value.includes("/")) {
    const [instanceId, workItemId] = value.slice("work:".length).split("/", 2);
    if (instanceId && workItemId) return { kind: "scoped_work", selector: value, instanceId, workItemId };
  }
  if (value.startsWith("work:")) return { kind: "legacy_work", selector: value, workItemId: value.slice("work:".length) };
  if (value.startsWith("subflow:tpl-")) return { kind: "subflow_template", selector: value, templateId: value.slice("subflow:".length) };
  if (value.startsWith("subflow:sf-")) return { kind: "subflow_instance", selector: value, instanceId: value.slice("subflow:".length) };
  if (value.startsWith("gate:")) {
    const body = value.slice("gate:".length);
    const [instanceId, id] = body.split("/", 2);
    return id ? { kind: "gate", selector: value, instanceId, id } : { kind: "gate", selector: value, id: body };
  }
  const body = value.slice("transition:".length);
  const [instanceId, id] = body.split("/", 2);
  return { kind: "transition", selector: value, instanceId: instanceId ?? "", id: id ?? "" };
}
