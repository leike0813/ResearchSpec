import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

import type { CapabilityManifest } from "../core/contracts/capability-manifest.js";
import { BoundaryPathError, resolveBoundaryPath } from "../core/runtime/boundary-path.js";
import type { Diagnostic } from "../core/validation/types.js";

const RoleSchema = z.string().trim().min(1);
const FileBindingSchema = z.strictObject({ role: RoleSchema, path: z.string().trim().min(1) });
const InlineBindingSchema = z.strictObject({ role: RoleSchema, value: z.json() });

export const ProcedureMaterialBindingsSchema = z.strictObject({
  inputs: z.array(z.union([FileBindingSchema, InlineBindingSchema])).optional(),
  outputs: z.array(FileBindingSchema).optional(),
});

export type ProcedureMaterialBindings = z.infer<typeof ProcedureMaterialBindingsSchema>;
export type ProcedureMaterialBinding = NonNullable<ProcedureMaterialBindings["inputs"]>[number];

export interface ProcedureMaterialObservation {
  role: string;
  declaration: "declared" | "undeclared" | "unknown";
  status: "inline" | "readable" | "planned" | "unavailable" | "missing";
  path?: string;
  code?: string;
}

export interface ProcedureMaterialInspection {
  declaration_scope: "manifest" | "unknown";
  output_mode: "planned" | "delivered";
  inputs?: ProcedureMaterialObservation[];
  outputs?: ProcedureMaterialObservation[];
  diagnostics: Diagnostic[];
}

export class ProcedureMaterialError extends Error {
  constructor(readonly code: string, message: string, readonly details?: unknown) {
    super(message);
    this.name = "ProcedureMaterialError";
  }
}

export async function readProcedureMaterialBindings(filePath: string): Promise<ProcedureMaterialBindings> {
  let value: unknown;
  try { value = parseYaml(await readFile(filePath, "utf8")); }
  catch (error) {
    throw new ProcedureMaterialError("procedure_material_input_unreadable", `Cannot read material payload: ${error instanceof Error ? error.message : String(error)}`);
  }
  const parsed = ProcedureMaterialBindingsSchema.safeParse(value);
  if (!parsed.success) {
    throw new ProcedureMaterialError("procedure_material_input_invalid", "Material payload requires optional inputs and outputs arrays of explicit role bindings.", parsed.error.issues);
  }
  return parsed.data;
}

export async function inspectProcedureMaterials(
  manifest: CapabilityManifest | undefined,
  projectRoot: string,
  bindings: ProcedureMaterialBindings,
  outputMode: ProcedureMaterialInspection["output_mode"],
): Promise<ProcedureMaterialInspection> {
  const diagnostics: Diagnostic[] = [];
  const inspect = async (
    direction: "input" | "output",
    supplied: readonly ProcedureMaterialBinding[],
    declared: readonly { role: string; required?: boolean }[] | undefined,
  ): Promise<ProcedureMaterialObservation[]> => {
    const observations: ProcedureMaterialObservation[] = [];
    const declarations = declared === undefined ? undefined : new Map(declared.map((entry) => [entry.role, entry]));
    const seen = new Set<string>();
    const warn = (code: string, message: string, role: string, materialPath?: string): void => {
      diagnostics.push({
        severity: "warning", blocking: false, code, message,
        ...(materialPath === undefined ? {} : { path: materialPath }),
        details: { direction, role },
      });
    };
    for (const binding of supplied) {
      const declaration = declarations === undefined ? "unknown" : declarations.has(binding.role) ? "declared" : "undeclared";
      if (seen.has(binding.role)) warn("procedure_material_role_duplicate", `Several ${direction} bindings use role ${binding.role}; resolve their intended use.`, binding.role);
      seen.add(binding.role);
      if (declaration === "undeclared") warn("procedure_material_role_undeclared", `Role ${binding.role} is supplemental ${direction} context without a manifest declaration.`, binding.role);
      if (!("path" in binding)) {
        observations.push({ role: binding.role, declaration, status: "inline" });
        continue;
      }
      try {
        const planned = direction === "output" && outputMode === "planned";
        const resolved = await resolveBoundaryPath(projectRoot, binding.path, planned ? "reference" : "consume-input");
        observations.push({ role: binding.role, declaration, path: resolved.relativePath, status: planned ? "planned" : "readable" });
      } catch (error) {
        const code = error instanceof BoundaryPathError ? error.code : "procedure_material_unreadable";
        const message = error instanceof Error ? error.message : String(error);
        warn(code, message, binding.role, binding.path);
        observations.push({ role: binding.role, declaration, path: binding.path, status: "unavailable", code });
      }
    }
    for (const required of declared ?? []) {
      if (required.required !== false && !seen.has(required.role)) {
        warn("procedure_material_role_missing", `Declared ${direction} role ${required.role} has no supplied material.`, required.role);
        observations.push({ role: required.role, declaration: "declared", status: "missing", code: "procedure_material_role_missing" });
      }
    }
    return observations;
  };
  const inputs = bindings.inputs === undefined ? undefined : await inspect("input", bindings.inputs, manifest?.inputs);
  const outputs = bindings.outputs === undefined ? undefined : await inspect("output", bindings.outputs, manifest?.outputs);
  if (!manifest) diagnostics.push({
    severity: "info", blocking: false, code: "procedure_material_declarations_unknown",
    message: "This Procedure has no material-role manifest; only explicit path facts were inspected.",
  });
  return {
    declaration_scope: manifest === undefined ? "unknown" : "manifest",
    output_mode: outputMode,
    ...(inputs === undefined ? {} : { inputs }),
    ...(outputs === undefined ? {} : { outputs }),
    diagnostics,
  };
}
