import { z } from "zod";

import { StableIdSchema } from "./stable-specs.js";

export const RouteSelectorSchema = z.string().regex(/^route:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/);
export const SubflowControlSelectorSchema = z.templateLiteral(["subflow:", StableIdSchema]);
export const GateControlSelectorSchema = z.string().regex(/^gate:[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/);
export const DecisionControlSelectorSchema = z.string().regex(/^decision:[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*$/);
export const ChangeControlSelectorSchema = z.templateLiteral(["change:", StableIdSchema]);
export const HandoffControlSelectorSchema = z.templateLiteral(["handoff:", StableIdSchema]);

export const ControlSelectorSchema = z.union([
  RouteSelectorSchema,
  SubflowControlSelectorSchema,
  GateControlSelectorSchema,
  DecisionControlSelectorSchema,
  ChangeControlSelectorSchema,
  HandoffControlSelectorSchema,
]);

export type ControlSelector = z.infer<typeof ControlSelectorSchema>;

