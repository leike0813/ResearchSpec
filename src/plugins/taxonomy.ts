import { readFile } from "node:fs/promises";

import { z } from "zod";

const DivisionSchema = z.strictObject({
  code: z.string().regex(/^\d{2}$/),
  title: z.string().trim().min(1),
});

const GroupSchema = z.strictObject({
  code: z.string().regex(/^\d{4}$/),
  division_code: z.string().regex(/^\d{2}$/),
  title: z.string().trim().min(1),
});

const FieldSchema = z.strictObject({
  code: z.string().regex(/^\d{6}$/),
  group_code: z.string().regex(/^\d{4}$/),
  title: z.string().trim().min(1),
});

export const AnzsrcSnapshotSchema = z.strictObject({
  schema_version: z.literal("1"),
  classification: z.literal("ANZSRC Fields of Research"),
  edition: z.literal("2020"),
  source_release: z.literal("2025-10-24"),
  source_url: z.url(),
  source_sha256: z.literal("92b94664eb1e43db1cbcaeb54e60575e3f8573cd10e5e4bb3a9c806cbe462e35"),
  license: z.literal("CC-BY-4.0"),
  attribution: z.string().trim().min(1),
  divisions: z.array(DivisionSchema).length(23),
  groups: z.array(GroupSchema).length(213),
  fields: z.array(FieldSchema).length(1967),
});

export type AnzsrcSnapshot = z.infer<typeof AnzsrcSnapshotSchema>;

export async function loadAnzsrcSnapshot(filePath: string): Promise<AnzsrcSnapshot> {
  const parsed = AnzsrcSnapshotSchema.parse(JSON.parse(await readFile(filePath, "utf8")) as unknown);
  const divisionCodes = uniqueCodes(parsed.divisions.map((item) => item.code), "division");
  const groupCodes = uniqueCodes(parsed.groups.map((item) => item.code), "group");
  uniqueCodes(parsed.fields.map((item) => item.code), "field");
  for (const group of parsed.groups) {
    if (!divisionCodes.has(group.division_code) || !group.code.startsWith(group.division_code)) {
      throw new Error(`ANZSRC Group ${group.code} has invalid Division parent ${group.division_code}.`);
    }
  }
  for (const field of parsed.fields) {
    if (!groupCodes.has(field.group_code) || !field.code.startsWith(field.group_code)) {
      throw new Error(`ANZSRC Field ${field.code} has invalid Group parent ${field.group_code}.`);
    }
  }
  return parsed;
}

export function anzsrcGroupDomainId(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueCodes(codes: readonly string[], level: string): Set<string> {
  const result = new Set(codes);
  if (result.size !== codes.length) throw new Error(`ANZSRC ${level} codes must be unique.`);
  return result;
}
