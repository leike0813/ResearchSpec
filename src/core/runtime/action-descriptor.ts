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
import { parseRuntimeSelector } from "../contracts/runtime-selector.js";
import type { WorkspaceSnapshot } from "../workspace/snapshot.js";
import {
  evaluateActionAvailability,
  type RuntimeActionKey,
} from "./action-availability.js";
import type { WorkflowControlResult } from "./legacy-workflow-control.js";

export async function buildActionDescriptor(
  snapshot: WorkspaceSnapshot,
  selector: string,
  control?: WorkflowControlResult,
): Promise<ActionDescriptor | undefined> {
  const evaluated = await evaluateActionAvailability(snapshot, selector, control);
  if (!evaluated) return undefined;
  const registration = ACTION_SCHEMA_REGISTRY[evaluated.key];
  const semanticSchema = registration.kind === "input" ? jsonSchema(registration.semantic_validator) : undefined;
  const derivedSchema = registration.kind === "input" ? jsonSchema(registration.derived_validator) : undefined;
  const branches = schemaBranches(semanticSchema);
  const templateBranch = branches[0] ?? {};
  const required = new Set(Array.isArray(templateBranch.required) ? templateBranch.required.filter((item): item is string => typeof item === "string") : []);
  const properties: Record<string, unknown> = {};
  for (const branch of branches) Object.assign(properties, record(branch.properties));
  const templateProperties = record(templateBranch.properties);
  const semanticFields = schemaFieldNames(semanticSchema);
  const derivedFields = schemaFieldNames(derivedSchema);
  const semanticInputSlots = semanticFields.map((field) => ({
    field_path: `/${escapePointer(field)}`,
    expectation: expectation(properties[field]),
  }));
  const minimalInputTemplate = registration.kind === "no-input"
    ? null
    : Object.fromEntries(semanticFields
      .filter((field) => (required.has(field) && field in templateProperties) || conditionalSemanticField(evaluated.key, field))
      .map((field) => [field, templateSlot(field, templateProperties[field] ?? properties[field])]));

  const policy = executionPolicy(snapshot, selector, evaluated.key, registration.execution_policy);
  return ActionDescriptorSchema.parse({
    schema_version: "2",
    selector,
    command: registration.command,
    action_schema_ref: registration.schema_ref,
    availability: evaluated.availability,
    cli_derived_fields: derivedFields,
    semantic_input_slots: semanticInputSlots,
    constraints: [...registration.constraints],
    minimal_input_template: minimalInputTemplate,
    execution_policy: policy,
    execution_requirements: executionRequirements(policy),
    possible_next_selectors: nextSelectors(snapshot, selector),
  });
}

export function executionRequirements(policy: ActionDescriptor["execution_policy"]): ActionDescriptor["execution_requirements"] {
  if (policy === "plan_bound") {
    return {
      preview_required: true,
      action_basis_required: true,
      plan_sha256_required: true,
      confirmation_required: true,
    };
  }
  if (policy === "human_confirmed") {
    return {
      preview_required: false,
      action_basis_required: true,
      plan_sha256_required: false,
      confirmation_required: true,
    };
  }
  return {
    preview_required: false,
    action_basis_required: true,
    plan_sha256_required: false,
    confirmation_required: false,
  };
}

export function actionSchemaRegistration(key: RuntimeActionKey): ActionSchemaRegistration {
  return ACTION_SCHEMA_REGISTRY[key];
}

function jsonSchema(validator: z.ZodType): Record<string, unknown> {
  return record(z.toJSONSchema(validator, { target: "draft-2020-12" }));
}

function schemaFieldNames(schema: Record<string, unknown> | undefined): string[] {
  const names = new Set<string>();
  for (const branch of schemaBranches(schema)) {
    for (const field of Object.keys(record(branch.properties))) names.add(field);
  }
  return [...names].sort();
}

function executionPolicy(
  snapshot: WorkspaceSnapshot,
  selector: string,
  key: RuntimeActionKey,
  fallback: ActionDescriptor["execution_policy"],
): ActionDescriptor["execution_policy"] {
  const parsed = parseRuntimeSelector(selector);
  if (key === "start" && parsed?.kind === "scoped_subflow_node") return "direct";
  if (key === "submit_artifact" && parsed?.kind === "scoped_work") {
    const instance = snapshot.runState?.subflows.find((item) => item.instance_id === parsed.instanceId);
    const template = instance && snapshot.workflow?.subflow_templates.find((item) => item.template_id === instance.template_id);
    const workItem = template?.work_items.find((item) => item.id === parsed.workItemId);
    if (workItem?.submission.policy === "manual") return "human_confirmed";
  }
  return fallback;
}

function schemaBranches(schema: Record<string, unknown> | undefined): Record<string, unknown>[] {
  if (!schema) return [];
  const alternatives = Array.isArray(schema.oneOf) ? schema.oneOf : Array.isArray(schema.anyOf) ? schema.anyOf : [];
  return alternatives.length > 0 ? alternatives.map(record) : [schema];
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
