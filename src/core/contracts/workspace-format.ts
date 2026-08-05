import { z } from "zod";

export const CURRENT_WORKSPACE_SCHEMA_VERSION = "1" as const;

const IdentifierSchema = z.string().trim().min(1);

export const CurrentWorkspaceConfigSchema = z.strictObject({
  schema_version: z.literal(CURRENT_WORKSPACE_SCHEMA_VERSION),
  agent_tools: z.strictObject({
    selected: z.array(IdentifierSchema),
    delivery: z.enum(["skills", "commands", "both"]),
  }),
  literature_adapters: z.strictObject({ selected: z.array(IdentifierSchema) }),
  plugins: z.strictObject({ selected: z.array(IdentifierSchema) }),
});

export type CurrentWorkspaceConfig = z.infer<typeof CurrentWorkspaceConfigSchema>;

export type WorkspaceFormatKind = "missing" | "current" | "unsupported";
