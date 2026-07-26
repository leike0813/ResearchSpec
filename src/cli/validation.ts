import type { z } from "zod";

import { ACTION_SCHEMA_REGISTRY } from "../core/contracts/case-control.js";
import {
  ValidationViolationSchema,
  type ValidationViolation,
} from "../core/contracts/runtime-protocol.js";
import type { RuntimeActionKey } from "../core/runtime/action-availability.js";

export function validationViolations(
  key: RuntimeActionKey,
  issues: readonly z.core.$ZodIssue[],
  input?: unknown,
): ValidationViolation[] {
  const schemaRef = ACTION_SCHEMA_REGISTRY[key].schema_ref;
  return issues.map((issue) => ValidationViolationSchema.parse({
    code: violationCode(issue, input),
    field_path: jsonPointer(issue.path),
    expectation: expectation(issue),
    schema_ref: schemaRef,
  }));
}

export function zodIssues(value: unknown): z.core.$ZodIssue[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const issues = value.filter((item): item is z.core.$ZodIssue => Boolean(item) && typeof item === "object" && typeof (item as { code?: unknown }).code === "string" && Array.isArray((item as { path?: unknown }).path));
  return issues.length === value.length ? issues : undefined;
}

function violationCode(issue: z.core.$ZodIssue, input: unknown): ValidationViolation["code"] {
  if (issue.path.length > 0 && !pathExists(input, issue.path)) return "required";
  switch (issue.code) {
    case "invalid_type": return "invalid_type";
    case "invalid_value": return "invalid_value";
    case "invalid_format": return "invalid_format";
    case "too_small": return "too_small";
    case "too_big": return "too_big";
    case "unrecognized_keys": return "unrecognized_key";
    default: return "constraint_failed";
  }
}

function pathExists(input: unknown, path: readonly PropertyKey[]): boolean {
  let current = input;
  for (const segment of path) {
    if (typeof segment === "number") {
      if (!Array.isArray(current) || segment < 0 || segment >= current.length) return false;
      current = current[segment];
      continue;
    }
    if (!current || typeof current !== "object" || Array.isArray(current) || !Object.prototype.hasOwnProperty.call(current, segment)) return false;
    current = (current as Record<PropertyKey, unknown>)[segment];
  }
  return true;
}

function expectation(issue: z.core.$ZodIssue): string {
  const value = issue as unknown as Record<string, unknown>;
  if (issue.code === "invalid_type" && typeof value.expected === "string") return value.expected;
  if (issue.code === "invalid_value" && Array.isArray(value.values)) return `one of: ${value.values.map(String).join(", ")}`;
  if (issue.code === "invalid_format" && typeof value.format === "string") return value.format;
  if (issue.code === "too_small") return `minimum ${boundary(value.minimum)}`;
  if (issue.code === "too_big") return `maximum ${boundary(value.maximum)}`;
  if (issue.code === "unrecognized_keys") return "only declared object fields";
  return "value satisfying the declared action constraint";
}

function boundary(value: unknown): string {
  return typeof value === "string" || typeof value === "number" || typeof value === "bigint"
    ? String(value)
    : "declared by schema";
}

function jsonPointer(path: readonly PropertyKey[]): string {
  if (!path.length) return "";
  return `/${path.map((item) => String(item).replace(/~/g, "~0").replace(/\//g, "~1")).join("/")}`;
}
