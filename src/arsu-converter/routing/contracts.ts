import { z } from "zod";

export const ARSU_SKILL_IDS = [
  "deep-research",
  "academic-paper",
  "academic-paper-reviewer",
  "academic-pipeline",
] as const;

export const ArsuSkillIdSchema = z.enum(ARSU_SKILL_IDS);
export type ArsuSkillId = z.infer<typeof ArsuSkillIdSchema>;

const SafeIdSchema = z.string().regex(/^[a-z0-9][a-z0-9_-]*$/);
const ContractPathSchema = z.string().regex(/^specs\/[A-Za-z0-9._/-]+$/)
  .refine((value) => !value.split("/").includes(".."));
export const RouteRefSchema = z.string().regex(
  /^(?:deep-research|academic-paper|academic-paper-reviewer|academic-pipeline):[a-z0-9][a-z0-9_-]*$/,
);
export type RouteRef = `${ArsuSkillId}:${string}`;

export const PrerequisiteRequirementSchema = z.discriminatedUnion("kind", [
  z.strictObject({ kind: z.literal("contract"), id: ContractPathSchema }),
  z.strictObject({ kind: z.literal("artifact"), id: SafeIdSchema }),
  z.strictObject({ kind: z.literal("user_input"), id: SafeIdSchema }),
]);

export const PrerequisiteGroupSchema = z.strictObject({
  operator: z.enum(["all_of", "any_of"]),
  requirements: z.array(PrerequisiteRequirementSchema).min(1),
  fallback_route_refs: z.array(RouteRefSchema),
});

export const GatePolicySchema = z.strictObject({
  level: z.enum(["none", "conditional", "required", "profile_defined"]),
  gate_kinds: z.array(SafeIdSchema),
});

export const RouteCostSchema = z.strictObject({
  effort: z.enum(["low", "medium", "high", "variable"]),
  interaction: z.enum(["single_pass", "iterative", "long_horizon"]),
});

const RouteBaseShape = {
  route_ref: RouteRefSchema,
  title: z.string().min(1),
  intents: z.array(z.string().min(1)).min(1),
  primary_artifact_types: z.array(SafeIdSchema).min(1),
  prerequisite_groups: z.array(PrerequisiteGroupSchema),
  risk_level: z.enum(["low", "medium", "high"]),
  gate_policy: GatePolicySchema,
  cost: RouteCostSchema,
};

export const ArsuRouteDefinitionSchema = z.discriminatedUnion("route_kind", [
  z.strictObject({
    ...RouteBaseShape,
    route_kind: z.literal("mode"),
    mode_id: SafeIdSchema,
  }),
  z.strictObject({
    ...RouteBaseShape,
    route_kind: z.literal("entry"),
    mode_id: z.null(),
  }),
]);

export const NearMissRouteSchema = z.strictObject({
  intent: z.string().min(1),
  route_ref: RouteRefSchema,
  reason: z.string().min(1),
});

export const ArsuSkillRouteDefinitionSchema = z.strictObject({
  skill_id: ArsuSkillIdSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  intents: z.array(z.string().min(1)).min(1),
  default_route_ref: RouteRefSchema,
  routes: z.array(ArsuRouteDefinitionSchema).min(1),
  near_misses: z.array(NearMissRouteSchema),
});

export const ArsuRoutingCatalogSchema = z.strictObject({
  schema_version: z.literal("1"),
  catalog_id: z.literal("arsu-routing-v0.1"),
  skills: z.array(ArsuSkillRouteDefinitionSchema).length(ARSU_SKILL_IDS.length),
});

export type PrerequisiteRequirement = z.infer<typeof PrerequisiteRequirementSchema>;
export type PrerequisiteGroup = z.infer<typeof PrerequisiteGroupSchema>;
export type ArsuRouteDefinition = z.infer<typeof ArsuRouteDefinitionSchema>;
export type NearMissRoute = z.infer<typeof NearMissRouteSchema>;
export type ArsuSkillRouteDefinition = z.infer<typeof ArsuSkillRouteDefinitionSchema>;
export type ArsuRoutingCatalog = z.infer<typeof ArsuRoutingCatalogSchema>;

export interface RoutingCatalogIssue {
  code: string;
  message: string;
}

export function validateRoutingCatalogReferences(catalog: ArsuRoutingCatalog): RoutingCatalogIssue[] {
  const issues: RoutingCatalogIssue[] = [];
  const skillIds = new Set<ArsuSkillId>();
  const routes = new Map<string, ArsuRouteDefinition>();

  for (const skill of catalog.skills) {
    if (skillIds.has(skill.skill_id)) {
      issues.push({ code: "duplicate_skill_id", message: `Duplicate ARSU Skill: ${skill.skill_id}` });
    }
    skillIds.add(skill.skill_id);
    for (const route of skill.routes) {
      if (routes.has(route.route_ref)) {
        issues.push({ code: "duplicate_route_ref", message: `Duplicate route: ${route.route_ref}` });
      }
      routes.set(route.route_ref, route);
      const [owner, routeId] = route.route_ref.split(":", 2);
      if (owner !== skill.skill_id) {
        issues.push({ code: "route_skill_mismatch", message: `Route ${route.route_ref} is owned by ${skill.skill_id}.` });
      }
      if (route.route_kind === "mode" && route.mode_id !== routeId) {
        issues.push({ code: "route_mode_mismatch", message: `Route ${route.route_ref} does not match mode ${route.mode_id}.` });
      }
      if (route.route_kind === "entry" && skill.skill_id !== "academic-pipeline") {
        issues.push({ code: "entry_route_owner_invalid", message: `Entry route ${route.route_ref} must belong to academic-pipeline.` });
      }
      if (route.gate_policy.level === "none" && route.gate_policy.gate_kinds.length > 0) {
        issues.push({ code: "gate_policy_inconsistent", message: `Route ${route.route_ref} declares Gate kinds with level none.` });
      }
      if (route.gate_policy.level !== "none" && route.gate_policy.gate_kinds.length === 0) {
        issues.push({ code: "gate_policy_inconsistent", message: `Route ${route.route_ref} has ${route.gate_policy.level} Gate policy without Gate kinds.` });
      }
      for (const group of route.prerequisite_groups) {
        if (new Set(group.requirements.map((item) => `${item.kind}:${item.id}`)).size !== group.requirements.length) {
          issues.push({ code: "duplicate_prerequisite", message: `Route ${route.route_ref} repeats a prerequisite in one group.` });
        }
      }
    }
  }

  for (const expected of ARSU_SKILL_IDS) {
    if (!skillIds.has(expected)) issues.push({ code: "missing_skill_id", message: `Missing ARSU Skill: ${expected}` });
  }
  const modeCount = [...routes.values()].filter((route) => route.route_kind === "mode").length;
  const entryCount = [...routes.values()].filter((route) => route.route_kind === "entry").length;
  if (modeCount !== 25) issues.push({ code: "mode_route_count_invalid", message: `Expected 25 mode routes, found ${String(modeCount)}.` });
  if (entryCount !== 2) issues.push({ code: "entry_route_count_invalid", message: `Expected 2 entry routes, found ${String(entryCount)}.` });

  for (const skill of catalog.skills) {
    if (!skill.routes.some((route) => route.route_ref === skill.default_route_ref)) {
      issues.push({ code: "default_route_invalid", message: `Default route ${skill.default_route_ref} does not belong to ${skill.skill_id}.` });
    }
    for (const nearMiss of skill.near_misses) {
      if (!routes.has(nearMiss.route_ref)) {
        issues.push({ code: "near_miss_route_missing", message: `Near-miss target does not exist: ${nearMiss.route_ref}` });
      }
      if (skill.routes.some((route) => route.route_ref === nearMiss.route_ref)) {
        issues.push({ code: "near_miss_route_self", message: `Near-miss target ${nearMiss.route_ref} remains inside ${skill.skill_id}.` });
      }
    }
    for (const route of skill.routes) {
      for (const group of route.prerequisite_groups) {
        for (const fallback of group.fallback_route_refs) {
          if (!routes.has(fallback)) {
            issues.push({ code: "fallback_route_missing", message: `Fallback route does not exist: ${fallback}` });
          }
          if (fallback === route.route_ref) {
            issues.push({ code: "fallback_route_self", message: `Route ${route.route_ref} cannot fall back to itself.` });
          }
        }
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (routeRef: string): void => {
    if (visiting.has(routeRef)) {
      issues.push({ code: "fallback_route_cycle", message: `Fallback route graph contains a cycle at ${routeRef}.` });
      return;
    }
    if (visited.has(routeRef)) return;
    visiting.add(routeRef);
    const route = routes.get(routeRef);
    for (const fallback of route?.prerequisite_groups.flatMap((group) => group.fallback_route_refs) ?? []) {
      if (routes.has(fallback)) visit(fallback);
    }
    visiting.delete(routeRef);
    visited.add(routeRef);
  };
  for (const routeRef of routes.keys()) visit(routeRef);

  return [...new Map(issues.map((issue) => [`${issue.code}:${issue.message}`, issue])).values()];
}
