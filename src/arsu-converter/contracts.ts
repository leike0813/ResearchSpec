import { renderLiteratureSourcePolicyProjection } from "../literature-adapters/provider-policy.js";
import { GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import type {
  ContractInjectionResult,
  ContractIntegrationManifest,
  ContractProfile,
} from "./types.js";

export const RESEARCHSPEC_PREFLIGHT_PROFILE_ID = "researchspec-preflight-v10";
export const RESEARCHSPEC_PREFLIGHT_MARKER = "<!-- researchspec-contract-preflight:v10 -->";
export const RESEARCHSPEC_LITERATURE_ADAPTER_MARKER = "<!-- researchspec-literature-adapter:zotero-library:v2 -->";

export const RESEARCHSPEC_MUTATION_OWNERSHIP = {
  stable_specs: "human_or_agent_direct_edit_with_project_change_for_high_impact_updates",
  project_profile: "researchspec_static_projection_only",
  subflow_control: "researchspec_cli_only",
  handoff: "owning_agent_or_human_direct_edit",
  project_change: "human_or_agent_direct_edit",
  boundary_deliverables: "producing_skill_outside_researchspec",
} as const;

export function mutationBoundaryBullets(targets: string[]): string[] {
  const bullets: string[] = [];
  const stableSpecs = targets.filter((target) => target.startsWith("researchspec/specs/"));
  if (stableSpecs.length > 0) {
    bullets.push(`Edit ${stableSpecs.map((target) => `\`${target}\``).join(", ")} directly when the current research facts change; use a project change for high-impact scope, claim, structure, or contribution changes.`);
  }
  if (targets.some((target) => target.endsWith("/control.yaml"))) {
    bullets.push("Request every lifecycle, Gate, Decision, override, or transition mutation through the ResearchSpec CLI; never edit a subflow control directly.");
  }
  if (targets.some((target) => target.endsWith("/handoff.md"))) {
    bullets.push("The owning Agent or human may edit the subflow handoff directly, using safe project-relative boundary paths outside `researchspec/`.");
  }
  if (targets.some((target) => !target.startsWith("researchspec/"))) {
    bullets.push("Boundary deliverables remain ordinary project files outside `researchspec/`; the producing Skill owns their content and records only role/path references in its handoff.");
  }
  return bullets;
}

export function buildContractIntegrationManifest(skillGroups: string[]): ContractIntegrationManifest {
  return {
    schema_version: "1",
    integration_profile: RESEARCHSPEC_PREFLIGHT_PROFILE_ID,
    source: VENDOR_SOURCE_PATH,
    output: GENERATED_OUTPUT_PATH,
    anchor_replacement: {
      profile_id: "researchspec-anchor-replacement-v4",
      coverage_policy: "required_and_recommended",
      marker: "<!--rs:<anchor-id>-->",
      diagnostic_anchor_policy: "report_only",
    },
    skill_groups: Object.fromEntries(skillGroups.map((group) => [group, buildProfile(group)])),
  };
}

export function injectContractPreflight(text: string, skillGroup: string): {
  text: string;
  result: ContractInjectionResult;
} {
  if (text.includes(RESEARCHSPEC_PREFLIGHT_MARKER)) {
    return {
      text,
      result: { injected: false, profile_id: RESEARCHSPEC_PREFLIGHT_PROFILE_ID, marker: RESEARCHSPEC_PREFLIGHT_MARKER },
    };
  }

  const block = contractPreflightBlock(skillGroup);
  const frontmatter = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (frontmatter?.[0]) {
    return {
      text: `${frontmatter[0]}\n${block}\n${text.slice(frontmatter[0].length).replace(/^\r?\n/, "")}`,
      result: { injected: true, profile_id: RESEARCHSPEC_PREFLIGHT_PROFILE_ID, marker: RESEARCHSPEC_PREFLIGHT_MARKER },
    };
  }
  return {
    text: `${block}\n${text}`,
    result: { injected: true, profile_id: RESEARCHSPEC_PREFLIGHT_PROFILE_ID, marker: RESEARCHSPEC_PREFLIGHT_MARKER },
  };
}

function buildProfile(skillGroup: string): ContractProfile {
  return {
    profile_id: RESEARCHSPEC_PREFLIGHT_PROFILE_ID,
    required_contracts: [
      "researchspec/specs/project.md",
      "researchspec/specs/sources.yaml",
      "researchspec/specs/claims.yaml",
      "researchspec/specs/manuscript.yaml",
      "researchspec/profiles/academic-pipeline.yaml when the selected route is a pipeline entry or child",
      "the owning researchspec/subflows/<instance>/control.yaml and handoff.md after start",
    ],
    handoff_reads: ["explicit input roles and safe project-relative paths returned by route or subflow instructions"],
    writes_allowed: [
      "boundary deliverables at explicit project-relative paths outside researchspec/",
      "the owning subflow handoff.md",
      "researchspec/changes/<change-id>/ documents for proposed high-impact semantic changes",
      ...(skillGroup === "academic-paper" ? ["the ARSU revision patch and optional stateless helper output"] : []),
    ],
    mutation_authorities: [
      "ResearchSpec CLI exclusively mutates control.yaml lifecycle, Gate, Decision, override, and transition state",
      "the owning Agent or human directly edits handoff.md and project change documents",
      "stable specs may be edited directly; high-impact changes should be proposed and reviewed first",
    ],
    notes: [
      `${skillGroup} uses the shared current ResearchSpec file-contract preflight.`,
      "Load only route-relevant stable specs, handoff roles, and boundary files into Agent context.",
      skillGroup === "deep-research"
        ? "Use fixed Zotero task Skills through the provider-neutral handoff; Deep Research retains screening and evidence judgment."
        : "Use fixed literature Adapter results only as bounded working material owned by the active ARSU producer.",
    ],
    full_matrix_injection: false,
  };
}

function contractPreflightBlock(skillGroup: string): string {
  return `${RESEARCHSPEC_PREFLIGHT_MARKER}
${RESEARCHSPEC_LITERATURE_ADAPTER_MARKER}
## ResearchSpec Contract Preflight

Locate the project researchspec/ workspace and run "researchspec status --json".
For a new route, request "researchspec instructions route:<skill>:<mode> --json" and
present its Skill, mode, stable-spec and handoff-role prerequisites, boundary
outputs, formal Gates, risk, cost, and confirmation scope. Start only after the
user confirms that one instance. A pipeline parent confirmation never authorizes
a child, branch, specialist subflow, or later revision round.

Read only the route-relevant parts of specs/project.md, specs/sources.yaml,
specs/claims.yaml, and specs/manuscript.yaml. Pipeline work also reads the
managed profiles/academic-pipeline.yaml. After start, treat the selected
subflow's control.yaml as its sole runtime authority and its handoff.md as
the boundary input/output reference. Do not reconstruct the frontier from Skill
prose; use directed instructions selectors and the current status view.
${manuscriptDeliveryBlock(skillGroup)}
Produce semantic files at explicit project-relative paths outside
researchspec/, then update the owning handoff with unique roles, types,
purposes, paths, producers or intended consumers, and relevant limits. Do not
register, copy, hash-bind, or assign framework IDs to boundary files.
Only the ResearchSpec CLI may mutate lifecycle state, checkpoints, formal Gates,
Decisions, overrides, and transitions in control.yaml.

For a formal Gate, use researchspec-verify to prepare evidence-linked findings,
show the proposed verdict and consequences, and obtain explicit human
confirmation. Record the verdict with "researchspec decide gate:<instance>/<gate>";
use a separate "researchspec advance subflow:<instance>" only after the owning
control, profile, directly required child controls, and handoff prerequisites
permit the transition. A failed-Gate override requires its own human-approved
Decision and reason in the owning Gate.

Optional domain Skills are bounded advisory helpers. Suggest at most three
domains, keep plugin consent separate from route confirmation, preview the exact
domain IDs and resolved Skills, and install only after explicit consent. Invoke a
projected Skill natively when loaded; otherwise use plugin instructions only
after selection, availability, projection, and manifest-hash checks. Decline or
failure leaves the core route and workflow frontier unchanged.

${literatureProviderBlock(skillGroup)}

The packaged academic-pipeline/scripts/adapters/zotero.py path is separate: it
reads only a user-supplied Better BibTeX JSON export, requires a user-provided
Python 3.11+ environment with PyYAML, and is not a live Zotero fact source.

This generated block uses profile ${RESEARCHSPEC_PREFLIGHT_PROFILE_ID} for
${skillGroup} and the current file-based protocol:
status -> instructions <selector> -> start/decide/advance -> status.
`;
}

function manuscriptDeliveryBlock(skillGroup: string): string {
  if (skillGroup === "deep-research") return "";
  const formatting = skillGroup === "academic-paper" || skillGroup === "academic-pipeline"
    ? `For QMD writing or resume, run the bounded read-only \`quarto --version\`
probe at the timing returned by route instructions and preserve its available,
unavailable, or unknown result in the start confirmation. QMD writing may start
when Quarto is unavailable, but \`academic-paper:format-convert\` requires an
available probe and must use \`node scripts/render-quarto.mjs\` for the single
confirmed target. The helper defaults to no-execute; code execution requires a
separate current-subflow consent. Never install Quarto, contact the network,
fall back to Pandoc, overwrite an existing target, or report a successful
handoff after a partial or failed render.`
    : "";
  return `
Treat \`specs/manuscript.yaml.delivery\` as the source-format contract.
The first manuscript-writing intake resolves \`working_format\`; a later change
to a confirmed selection requires a project change. QMD is Markdown-compatible
source: require a \`.qmd\` boundary path and preserve YAML frontmatter, fenced
code, executable-cell options, citations, cross-references, and other Quarto
metadata as opaque manuscript content during review, annotation, and revision.
Record source and target format IDs on handoff entries; a rendered target also
records \`renderer: quarto\`.

${formatting}
`;
}

function literatureProviderBlock(skillGroup: string): string {
  if (skillGroup === "deep-research") return renderLiteratureSourcePolicyProjection();
  return `For literature work, the active ARSU producer may use an installed
Zotero task Skill as a bounded provider after a just-in-time readiness check.
Adapter results remain working evidence and cannot directly modify stable specs,
subflow controls, Gates, Decisions, transitions, or handoffs. Private or
library-bound work pauses when readiness fails. Acquisition is candidate-only
without a current bounded authorization, and Curation requires a separate request.`;
}
