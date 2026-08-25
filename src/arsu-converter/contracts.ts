import { renderLiteratureSourcePolicyProjection } from "../literature-adapters/provider-policy.js";
import {
  PAPER_HUMANIZER_REFERENCE_MODE_SKILL_PATH,
} from "../core-skills/paper-humanizer/reference-mode.js";
import { GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import type {
  ContractInjectionResult,
  ContractIntegrationManifest,
  ContractProfile,
} from "./types.js";

export const RESEARCHSPEC_PREFLIGHT_PROFILE_ID = "researchspec-preflight-v11";
export const RESEARCHSPEC_PREFLIGHT_MARKER = "<!-- researchspec-contract-preflight:v11 -->";
export const RESEARCHSPEC_LITERATURE_ADAPTER_MARKER = "<!-- researchspec-literature-adapter:zotero-library:v2 -->";
export const PAPER_HUMANIZER_REFERENCE_MARKER = "<!-- researchspec-paper-humanizer-reference-mode:v2 -->";

export const RESEARCHSPEC_MUTATION_OWNERSHIP = {
  stable_specs: "human_or_agent_direct_edit_with_project_change_for_high_impact_updates",
  project_profile: "researchspec_static_projection_only",
  run_and_node_state: "researchspec_cli_only",
  run_handoff: "researchspec_handoff_command_or_advance_submission",
  project_change: "human_or_agent_direct_edit",
  boundary_deliverables: "producing_skill_outside_researchspec",
} as const;

export function mutationBoundaryBullets(targets: string[]): string[] {
  const bullets: string[] = [];
  const stableSpecs = targets.filter((target) => target.startsWith("researchspec/specs/"));
  if (stableSpecs.length > 0) {
    bullets.push(`Edit ${stableSpecs.map((target) => `\`${target}\``).join(", ")} directly when the current research facts change; use a project change for high-impact scope, claim, structure, or contribution changes.`);
  }
  if (targets.some((target) => target.includes("researchspec/runs/"))) {
    bullets.push("Request every run, node, Gate, Decision, override, or transition mutation through the ResearchSpec CLI; never edit run or node instance files directly.");
  }
  if (targets.some((target) => target.endsWith("/handoff.md"))) {
    bullets.push("Use `researchspec handoff run:<run-id>` or an `advance` submission to update the owning run handoff with safe project-relative boundary paths outside `researchspec/`.");
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
      "the selected researchspec/profiles/<profile-id>.yaml projection",
      "the owning researchspec/runs/<run-id>/run.yaml, graph.yaml, handoff.md and node instance after start",
    ],
    handoff_reads: ["resolved input roles and safe project-relative paths returned by the eligible Node Card"],
    writes_allowed: [
      "boundary deliverables at explicit project-relative paths outside researchspec/",
      "handoff updates submitted through the ResearchSpec CLI",
      "researchspec/changes/<change-id>/ documents for proposed high-impact semantic changes",
      ...(skillGroup === "academic-paper" ? ["the ARSU revision patch and optional stateless helper output"] : []),
    ],
    mutation_authorities: [
      "ResearchSpec CLI exclusively mutates run, node, handoff, Gate, Decision, override, and transition state",
      "the owning Agent or human authors boundary files and project change documents",
      "stable specs may be edited directly; high-impact changes should be proposed and reviewed first",
    ],
    notes: [
      `${skillGroup} uses the shared current ResearchSpec file-contract preflight.`,
      "Load only Node-Card-relevant stable specs, handoff roles, parameters, and boundary files into Agent context.",
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
For a new root run, request "researchspec instructions profile:<profile-id> --json"
and present the selected entry, prerequisites, boundary outputs, formal Gates,
Decisions, risk, cost, and confirmation scope. Start only after the user confirms
that exact entry summary. Nodes and bound child runs declared by the frozen graph
inherit that authorization; every formal Gate and Decision still requires its
own confirmation, and alternate-model review requires separate current consent.

Read only the route-relevant parts of specs/project.md, specs/sources.yaml,
specs/claims.yaml, and specs/manuscript.yaml. Pipeline work also reads the
managed profile projection. After start, treat the owning run.yaml, frozen
graph.yaml, node instance files, and run handoff.md as runtime authority. Do not
reconstruct the frontier from Skill prose; use selectors returned by status and
request directed instructions for the eligible node, Gate, Decision, or pending
child start.
${manuscriptDeliveryBlock(skillGroup)}
${paperHumanizerReferenceBlock(skillGroup)}
Produce semantic files at explicit project-relative paths outside
researchspec/, then submit their unique roles, types, purposes, paths, producers
or intended consumers, and relevant limits through the owning CLI action. Do not
register, copy, hash-bind, or assign framework IDs to boundary files.
Only the ResearchSpec CLI may mutate run or node lifecycle state, handoffs,
formal Gates, Decisions, overrides, and transitions.

For a formal Gate, use researchspec-verify to prepare evidence-linked findings,
show the proposed verdict and consequences, and obtain explicit human
confirmation. Record the verdict with "researchspec decide gate:<run>/<gate>".
Complete executable work only with "researchspec advance node:<run>/<node>"
after the eligible Node Card's output and validator requirements are satisfied.
A failed-Gate override requires its own human approval and reason on the owning
Gate; confirmations never complete an execution node.

Optional domain Skills are bounded advisory helpers. Suggest at most three
domains, keep plugin consent separate from graph entry confirmation, preview the exact
domain IDs and resolved Skills, and install only after explicit consent. Invoke a
projected Skill natively when loaded; otherwise use plugin instructions only
after selection, availability, projection, and manifest-hash checks. Decline or
failure leaves the graph selector, active producer, and workflow frontier unchanged.

${literatureProviderBlock(skillGroup)}

The packaged academic-pipeline/scripts/adapters/zotero.py path is separate: it
reads only a user-supplied Better BibTeX JSON export, requires a user-provided
Python 3.11+ environment with PyYAML, and is not a live Zotero fact source.

This generated block uses profile ${RESEARCHSPEC_PREFLIGHT_PROFILE_ID} for
${skillGroup} and the current file-based protocol:
status -> instructions <selector> -> start/decide/advance -> status.
`;
}

function paperHumanizerReferenceBlock(skillGroup: string): string {
  if (skillGroup === "academic-paper") {
    return `${PAPER_HUMANIZER_REFERENCE_MARKER}
When this route creates or edits manuscript prose (including outline, abstract,
literature-review, revision, or full drafting), silently load the packaged
${PAPER_HUMANIZER_REFERENCE_MODE_SKILL_PATH} entrypoint first and follow its
Reference mode. This advisory mode does not start a humanizer route, run
statistics, produce an audit, or request an additional confirmation. Do not
load it for read-only review, citation audit, rebuttal audit, or format
conversion.`;
  }
  if (skillGroup === "academic-pipeline") {
    return "Pass the paper-humanizer Reference mode entrypoint constraint to the active academic-paper producer; the pipeline does not execute humanization itself.";
  }
  return "";
}

function manuscriptDeliveryBlock(skillGroup: string): string {
  if (skillGroup === "deep-research") return "";
  const formatting = skillGroup === "academic-paper" || skillGroup === "academic-pipeline"
    ? `For QMD writing or resume, run the bounded read-only \`quarto --version\`
probe at the timing returned by node instructions and preserve its available,
unavailable, or unknown result in the start confirmation. QMD writing may start
when Quarto is unavailable, but \`academic-paper:format-convert\` requires an
available probe and must use \`node scripts/render-quarto.mjs\` for the single
confirmed target. The helper defaults to no-execute; code execution requires a
separate current-node consent. Never install Quarto, contact the network,
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
run or node state, Gates, Decisions, transitions, or handoffs. Private or
library-bound work pauses when readiness fails. Acquisition is candidate-only
without a current bounded authorization, and Curation requires a separate request.`;
}
