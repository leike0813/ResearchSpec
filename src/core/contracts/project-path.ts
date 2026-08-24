import path from "node:path";
import { z } from "zod";

export function isSafeProjectRelativePath(value: string): boolean {
  if (!value || value !== value.trim() || value.includes("\\") || value.includes("\0") || path.posix.isAbsolute(value) || /^[A-Za-z]:/.test(value)) return false;
  const segments = value.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) return false;
  return segments[0] !== "researchspec";
}

export const SafeProjectRelativePathSchema = z.string().refine(
  isSafeProjectRelativePath,
  "must be a safe project-relative POSIX path outside researchspec/",
);

export type SafeProjectRelativePath = z.infer<typeof SafeProjectRelativePathSchema>;
