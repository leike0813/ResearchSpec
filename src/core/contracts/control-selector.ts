import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";

const RunIdSchema = z.string().regex(/^run-[a-f0-9]+$/);
export const RunControlSelectorSchema = z.templateLiteral(["run:", RunIdSchema]);
export const NodeControlSelectorSchema = z.string().regex(/^node:run-[a-f0-9]+\/[A-Za-z0-9][A-Za-z0-9._-]*(?:@[1-9][0-9]*)?$/);
export const GateControlSelectorSchema = z.string().regex(/^gate:run-[a-f0-9]+\/[A-Za-z0-9][A-Za-z0-9._-]*(?:@[1-9][0-9]*)?$/);
export const DecisionControlSelectorSchema = z.string().regex(/^decision:run-[a-f0-9]+\/[A-Za-z0-9][A-Za-z0-9._-]*(?:@[1-9][0-9]*)?$/);
export const ChangeControlSelectorSchema = z.templateLiteral(["change:", StableIdSchema]);
export const SpecInspectionSelectorSchema = z.enum(["spec:project", "spec:sources", "spec:claims", "spec:manuscript"]);
export const ProfileInspectionSelectorSchema = z.templateLiteral(["profile:", StableIdSchema]);
export const ToolInspectionSelectorSchema = z.templateLiteral(["tool:", StableIdSchema]);
export const ProcedureInspectionSelectorSchema = z.templateLiteral(["procedure:", StableIdSchema]);

export const ControlSelectorSchema = z.union([
  RunControlSelectorSchema,
  NodeControlSelectorSchema,
  GateControlSelectorSchema,
  DecisionControlSelectorSchema,
  ChangeControlSelectorSchema,
]);

export const InspectionSelectorSchema = z.union([
  RunControlSelectorSchema,
  NodeControlSelectorSchema,
  GateControlSelectorSchema,
  DecisionControlSelectorSchema,
  ChangeControlSelectorSchema,
  SpecInspectionSelectorSchema,
  ProfileInspectionSelectorSchema,
  ToolInspectionSelectorSchema,
  ProcedureInspectionSelectorSchema,
]);

export type ControlSelector = z.infer<typeof ControlSelectorSchema>;
export type InspectionSelector = z.infer<typeof InspectionSelectorSchema>;

export const CONTROL_SELECTOR_FAMILY_DISPLAYS = [
  { id: "run", patterns: ["run:<run-id>"] },
  { id: "node", patterns: ["node:<run-id>/<node-id>[@round]"] },
  { id: "gate", patterns: ["gate:<run-id>/<gate-id>[@round]"] },
  { id: "decision", patterns: ["decision:<run-id>/<decision-id>[@round]"] },
  { id: "change", patterns: ["change:<change-id>"] },
] as const;

export const INSPECTION_SELECTOR_FAMILY_DISPLAYS = [
  ...CONTROL_SELECTOR_FAMILY_DISPLAYS,
  { id: "spec", patterns: ["spec:project", "spec:sources", "spec:claims", "spec:manuscript"] },
  { id: "profile", patterns: ["profile:<profile-id>"] },
  { id: "tool", patterns: ["tool:<tool-id>"] },
  { id: "procedure", patterns: ["procedure:<procedure-id>"] },
] as const;
