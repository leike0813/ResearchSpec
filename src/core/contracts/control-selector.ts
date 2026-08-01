import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";

export const RouteSelectorSchema = z.string().regex(/^route:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/);
export const SubflowControlSelectorSchema = z.templateLiteral(["subflow:", StableIdSchema]);
export const GateControlSelectorSchema = z.string().regex(/^gate:[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/);
export const DecisionControlSelectorSchema = z.string().regex(/^decision:[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/);
export const ChangeControlSelectorSchema = z.templateLiteral(["change:", StableIdSchema]);
export const HandoffControlSelectorSchema = z.templateLiteral(["handoff:", StableIdSchema]);
export const SpecInspectionSelectorSchema = z.enum(["spec:project", "spec:sources", "spec:claims", "spec:manuscript"]);
export const ProfileInspectionSelectorSchema = z.literal("profile:academic-pipeline");
export const ToolInspectionSelectorSchema = z.templateLiteral(["tool:", StableIdSchema]);

export const ControlSelectorSchema = z.union([
  RouteSelectorSchema,
  SubflowControlSelectorSchema,
  GateControlSelectorSchema,
  DecisionControlSelectorSchema,
  ChangeControlSelectorSchema,
  HandoffControlSelectorSchema,
]);

export const InspectionSelectorSchema = z.union([
  SubflowControlSelectorSchema,
  GateControlSelectorSchema,
  DecisionControlSelectorSchema,
  ChangeControlSelectorSchema,
  HandoffControlSelectorSchema,
  SpecInspectionSelectorSchema,
  ProfileInspectionSelectorSchema,
  ToolInspectionSelectorSchema,
]);

export type ControlSelector = z.infer<typeof ControlSelectorSchema>;
export type InspectionSelector = z.infer<typeof InspectionSelectorSchema>;

export const CONTROL_SELECTOR_FAMILY_DISPLAYS = [
  { id: "route", patterns: ["route:<skill-id>:<mode>"] },
  { id: "subflow", patterns: ["subflow:<instance-id>"] },
  { id: "gate", patterns: ["gate:<instance-id>/<gate-id>"] },
  { id: "decision", patterns: ["decision:<instance-id>/<decision-id>"] },
  { id: "change", patterns: ["change:<change-id>"] },
  { id: "handoff", patterns: ["handoff:<instance-id>"] },
] as const;

export const INSPECTION_SELECTOR_FAMILY_DISPLAYS = [
  ...CONTROL_SELECTOR_FAMILY_DISPLAYS.filter((item) => item.id !== "route"),
  { id: "spec", patterns: ["spec:project", "spec:sources", "spec:claims", "spec:manuscript"] },
  { id: "profile", patterns: ["profile:academic-pipeline"] },
  { id: "tool", patterns: ["tool:<tool-id>"] },
] as const;
