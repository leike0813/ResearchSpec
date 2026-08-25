import { ARSU_ROUTING_CATALOG } from "./catalog.js";
import type { ArsuRouteDefinition } from "./contracts.js";
import { renderArsuRouteSummary } from "./projection.js";

export function renderNavigateRoutingProjection(): string {
  const sections = ARSU_ROUTING_CATALOG.skills.map((skill) => [
    `### ${skill.title} (\`${skill.skill_id}\`)`,
    "",
    skill.summary,
    `Skill intents: ${skill.intents.join("; ")}.`,
    `Near misses: ${skill.near_misses.map((item) => `${item.intent} -> \`${item.route_ref}\` (${item.reason})`).join("; ")}.`,
    "",
    "| Route | Intent | Boundary outputs | Prerequisites | Formal Gates | Risk / cost | Start confirmation |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...skill.routes.map(renderRouteRow),
  ].join("\n"));

  return [
    "## Catalog-Derived Route Reference",
    "",
    "These route semantics are projected from the canonical ARSU routing catalog. They describe capability meaning, not runtime selectors or current workspace availability. Pair them with `researchspec status --json` and only offer work represented by an eligible graph selector.",
    "",
    ...sections,
  ].join("\n\n");
}

function renderRouteRow(route: ArsuRouteDefinition): string {
  const summary = renderArsuRouteSummary(route);
  return `| \`${route.route_ref}\` | ${route.intents.join("; ")} | ${summary.boundary_outputs} | ${summary.prerequisites} | ${summary.formal_gates} | ${summary.risk_cost} | ${summary.confirmation} |`;
}
