import { z } from "zod";

import {
  ACTION_SCHEMA_REGISTRY,
  ActionDescriptorSchema,
  type ActionDescriptor,
  type ActionSchemaRegistration,
} from "../contracts/case-control.js";
import {
  directedInstructionsSelector,
  directedListSelector,
  directedShowSelector,
} from "../contracts/action-selector.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import {
  evaluateActionAvailability,
  type RuntimeActionKey,
} from "./action-availability.js";
import type { WorkflowControlResult } from "./workflow-control.js";

export async function buildActionDescriptor(
  snapshot: WorkspaceSnapshot,
  selector: string,
  control?: WorkflowControlResult,
): Promise<ActionDescriptor | undefined> {
  const evaluated = await evaluateActionAvailability(snapshot, selector, control);
  if (!evaluated) return undefined;
  const registration = ACTION_SCHEMA_REGISTRY[evaluated.key];
  const schema = registration.kind === "input" ? jsonSchema(registration) : undefined;
  const required = new Set(Array.isArray(schema?.required) ? schema.required.filter((item): item is string => typeof item === "string") : []);
  const properties = record(schema?.properties);
  const semanticInputSlots = registration.semantic_input_fields.map((field) => ({
    field_path: `/${escapePointer(field)}`,
    expectation: expectation(properties[field]),
  }));
  const minimalInputTemplate = registration.kind === "no-input"
    ? null
    : Object.fromEntries(registration.semantic_input_fields
      .filter((field) => required.has(field) || conditionalSemanticField(evaluated.key, field))
      .map((field) => [field, templateSlot(field, properties[field])]));

  return ActionDescriptorSchema.parse({
    schema_version: "1",
    selector,
    command: registration.command,
    action_schema_ref: registration.schema_ref,
    availability: evaluated.availability,
    cli_derived_fields: [...registration.cli_derived_fields],
    semantic_input_slots: semanticInputSlots,
    constraints: [...registration.constraints],
    minimal_input_template: minimalInputTemplate,
    requires_dry_run: registration.requires_dry_run,
    requires_confirmation: registration.requires_confirmation,
    possible_next_selectors: nextSelectors(snapshot, selector),
  });
}

export function actionSchemaRegistration(key: RuntimeActionKey): ActionSchemaRegistration {
  return ACTION_SCHEMA_REGISTRY[key];
}

function jsonSchema(registration: Extract<ActionSchemaRegistration, { kind: "input" }>): Record<string, unknown> {
  return record(z.toJSONSchema(registration.validator, { target: "draft-2020-12" }));
}

function nextSelectors(snapshot: WorkspaceSnapshot, selector: string): string[] {
  const selectors = [
    "status",
    directedInstructionsSelector(selector),
    directedShowSelector("workflow:current"),
    directedListSelector("actions"),
    directedListSelector("history"),
    directedListSelector("case-actions"),
  ];
  if (snapshot.items.some((item) => item.selector === selector)) selectors.push(directedShowSelector(selector));
  return [...new Set(selectors)].slice(0, 20);
}

function conditionalSemanticField(key: RuntimeActionKey, field: string): boolean {
  return key === "decide" && field === "reason";
}

function templateSlot(field: string, schema: unknown): Record<string, unknown> {
  const definition = record(schema);
  return {
    $input: field,
    expectation: expectation(definition),
    ...(Array.isArray(definition.enum) ? { allowed: definition.enum } : {}),
  };
}

function expectation(schema: unknown): string {
  const definition = record(schema);
  if (Array.isArray(definition.enum)) return `one of: ${definition.enum.map(String).join(", ")}`;
  if (typeof definition.const === "string") return `literal ${definition.const}`;
  if (typeof definition.type === "string") return definition.type;
  if (Array.isArray(definition.type)) return definition.type.map(String).join(" or ");
  if (Array.isArray(definition.oneOf)) return "one of the declared schema alternatives";
  if (Array.isArray(definition.anyOf)) return "one of the declared schema alternatives";
  return "value matching the action schema";
}

function escapePointer(value: string): string {
  return value.replace(/~/g, "~0").replace(/\//g, "~1");
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
