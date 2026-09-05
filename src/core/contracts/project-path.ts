import path from "node:path";
import { z } from "zod";

/**
 * Check only the lexical rules shared by project-owned and managed targets.
 * Callers that reserve a top-level namespace can add that rule separately.
 */
export function isSafeRelativePath(value: string): boolean {
  if (!value || value !== value.trim() || value.includes("\\") || value.includes("\0") || path.posix.isAbsolute(value) || /^[A-Za-z]:/.test(value)) return false;
  const segments = value.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return false;
  return true;
}

export function isSafePathComponent(value: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value) && !value.includes("..");
}

export function isCanonicalAbsolutePath(value: string): boolean {
  return value === value.trim() && !value.includes("\0") && path.isAbsolute(value) && value === path.normalize(value);
}

export function isSafeProjectRelativePath(value: string): boolean {
  if (!isSafeRelativePath(value)) return false;
  const segments = value.split("/");
  return segments[0] !== "researchspec";
}

export const SafeProjectRelativePathSchema = z.string().refine(
  isSafeProjectRelativePath,
  "must be a safe project-relative POSIX path outside researchspec/",
);

export type SafeProjectRelativePath = z.infer<typeof SafeProjectRelativePathSchema>;
