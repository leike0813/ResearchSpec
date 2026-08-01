import { ARSU_ROUTING_CATALOG } from "./catalog.js";
import type { ArsuRouteDefinition, PrerequisiteGroup } from "./contracts.js";

export function renderNavigateRoutingProjection(): string {
  const sections = ARSU_ROUTING_CATALOG.skills.map((skill) => [
    `### ${skill.title} (\`${skill.skill_id}\`)`,
    "",
    skill.summary,
    `Skill intents: ${skill.intents.join("; ")}.`,
    `Near misses: ${skill.near_misses.map((item) => `${item.intent} -> \`${item.route_ref}\` (${item.reason})`).join("; ")}.`,
    "",
    "| Route | Intent | Boundary outputs | Prerequisites | Risk | Formal Gate policy | Cost |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...skill.routes.map(renderRouteRow),
  ].join("\n"));

  return [
    "## Catalog-Derived Route Reference",
    "",
    "These route semantics are projected from the canonical ARSU routing catalog. They describe route meaning, not current workspace availability. Pair them with `researchspec status --json` and only offer routes whose `route_ref` is present in the CLI subflow frontier.",
    "",
    ...sections,
  ].join("\n\n");
}

function renderRouteRow(route: ArsuRouteDefinition): string {
  const gates = route.gate_policy.level === "none"
    ? "none"
    : `${route.gate_policy.level}: ${route.gate_policy.gate_kinds.join(", ")}`;
  return `| \`${route.route_ref}\` | ${route.intents.join("; ")} | ${route.primary_artifact_types.join(", ")} | ${route.prerequisite_groups.length ? route.prerequisite_groups.map(renderPrerequisiteGroup).join("; ") : "none"} | ${route.risk_level} | ${gates} | ${route.cost.effort}/${route.cost.interaction} |`;
}

function renderPrerequisiteGroup(group: PrerequisiteGroup): string {
  const requirements = group.requirements.map((item) => {
    if (item.kind === "artifact") return `handoff-role:${item.id}`;
    if (item.kind === "contract") return `stable-spec:${item.id}`;
    return `user-input:${item.id}`;
  }).join(group.operator === "all_of" ? " + " : " OR ");
  const fallback = group.fallback_route_refs.length ? `; fallback ${group.fallback_route_refs.join(", ")}` : "";
  return `${group.operator}(${requirements}${fallback})`;
}
