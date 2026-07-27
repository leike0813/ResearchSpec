import { GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import { renderLiteratureSourcePolicyProjection } from "../literature-adapters/provider-policy.js";
import type {
  ContractIntegrationManifest,
  ContractInjectionResult,
  ContractProfile,
} from "./types.js";

export const RESEARCHSPEC_PREFLIGHT_PROFILE_ID = "researchspec-preflight-v9";
export const RESEARCHSPEC_PREFLIGHT_MARKER = "<!-- researchspec-contract-preflight:v9 -->";
export const RESEARCHSPEC_LITERATURE_ADAPTER_MARKER = "<!-- researchspec-literature-adapter:zotero-library:v2 -->";

export const RESEARCHSPEC_MUTATION_OWNERSHIP = {
  stable_specs: "human_or_accepted_contract_patch",
  runtime_state: "orchestrator_or_runtime_helper",
  artifact_registry: "researchspec_submit_or_deterministic_runtime",
  decision_ledger: "runtime_after_human_confirmation",
  gate_ledger: "researchspec_submit_gate_after_human_confirmation",
} as const;

export function mutationBoundaryBullets(targets: string[]): string[] {
  const bullets: string[] = [];
  const stableSpecs = targets.filter((target) => target.startsWith("researchspec/specs/"));
  if (stableSpecs.length > 0) {
    bullets.push(`Treat ${stableSpecs.map((target) => `\`${target}\``).join(", ")} as read-only; propose semantic changes through \`researchspec/changes/<change-id>/contract-patch.yaml\` for human acceptance.`);
  }
  if (targets.includes("researchspec/runs/current/state.yaml")) {
    bullets.push("Request changes to `researchspec/runs/current/state.yaml` through the ResearchSpec orchestrator or runtime helper; do not edit run state directly.");
  }
  if (targets.includes("researchspec/runs/current/artifact-registry.json")) {
    bullets.push("Write only the candidate path declared by dynamic instructions. For trusted automatic instance work, run hash-bound `researchspec submit` directly. For manual work, preview the same direct CLI transaction and obtain explicit confirmation. Never edit registry or receipts directly.");
  }
  if (targets.includes("researchspec/runs/current/decision-ledger.jsonl")) {
    bullets.push("After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.");
  }
  if (targets.includes("researchspec/runs/current/gate-ledger.jsonl")) {
    bullets.push("Return validation findings through `researchspec-verify`; after explicit human confirmation, use `researchspec submit gate:<instance>/<node>`. Never edit the Gate ledger or receipts directly.");
  }
  return bullets;
}

export function buildContractIntegrationManifest(skillGroups: string[]): ContractIntegrationManifest {
  return {
    schema_version: "0.1",
    integration_profile: RESEARCHSPEC_PREFLIGHT_PROFILE_ID,
    source: VENDOR_SOURCE_PATH,
    output: GENERATED_OUTPUT_PATH,
    material_passport_policy: "imported_evidence_only_not_runtime_ssot",
    anchor_replacement: {
      profile_id: "researchspec-anchor-replacement-v3",
      coverage_policy: "required_and_recommended",
      marker: "<!--rs:<anchor-id>-->",
      diagnostic_anchor_policy: "report_only",
    },
    skill_groups: Object.fromEntries(
      skillGroups.map((group) => [group, buildProfile(group)]),
    ),
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
      "researchspec/specs/workflow.yaml",
      "researchspec/runs/current/state.yaml",
      "researchspec/specs/project.md",
      "researchspec/specs/sources.yaml",
      "researchspec/specs/claims.yaml",
      "researchspec/specs/manuscript.yaml",
    ],
    artifact_reads: [
      "researchspec/runs/current/artifact-registry.json",
    ],
    writes_allowed: [
      "artifact files declared by the current ARSU stage or mode",
      "researchspec/changes/<change-id>/contract-patch.yaml for high-impact semantic proposals",
      "researchspec/draft-patches/<patch-id>.json for manuscript text revisions",
    ],
    ledgers: [
      "researchspec/runs/current/decision-ledger.jsonl written by runtime after human-confirmed decisions",
      "researchspec/runs/current/gate-ledger.jsonl written by submit gate after explicit human confirmation",
    ],
    notes: [
      `${skillGroup} uses the shared ResearchSpec runtime preflight profile.`,
      "Load only stage/mode-relevant contracts into agent context.",
      "Treat ARS Material Passport as imported external evidence, not runtime truth.",
      "The current runtime profile and CLI action descriptor select the adaptive or strict control protocol.",
      skillGroup === "deep-research"
        ? "Use the fixed Zotero task Skills through the provider-neutral handoff; Deep Research retains screening, coverage, and artifact ownership."
        : "Use fixed literature Adapter results only as bounded working material owned by the active ARSU producer.",
    ],
    full_matrix_injection: false,
  };
}

function contractPreflightBlock(skillGroup: string): string {
  return `${RESEARCHSPEC_PREFLIGHT_MARKER}
${RESEARCHSPEC_LITERATURE_ADAPTER_MARKER}
## ResearchSpec Contract Preflight

Before running this ARSU-derived skill, locate the project \`researchspec/\`
workspace. Read \`specs/workflow.yaml\` and \`runs/current/state.yaml\` first,
then load only the contracts and artifact references needed for the current
skill, stage, phase, or mode.

Use \`runs/current/artifact-registry.json\` to read prior artifacts. Call
\`researchspec status --json\` and treat its \`profile.mode\`, canonical action
frontier, and each selected action descriptor as authority. Request details only
for selectors returned by status or a transaction's \`next_selectors\`; do not
reconstruct work order, stages, Gates, or transitions from this Skill text.

At a new or materially changed route, a newly ready work item, or an explicit
specialist request, evaluate optional reviewed domain assistance with
\`researchspec plugin list --summary --json\`, then inspect only plausible domains
with \`researchspec plugin show <domain-id> --summary --json\`. Semantic matching
is the Agent's judgment, not CLI authority. If one or more specific uninstalled
Skills would materially help, propose at most three domains in one batch and
show the matching Skills, purpose, and direct/resolved Skill counts. Keep this
consent separate from route confirmation. After the confirmed core Start,
dry-run the exact plugin batch with \`--summary --json\`, show its domain
versions, resolved Skills, projected tools, write summary, and
\`plan_sha256\`, obtain explicit confirmation, then execute with
\`--expected-plan-sha256 <sha256> --yes --summary --json\`.

When an installed, available, projected plugin Skill materially assists the
current work, invoke it natively if the host has loaded it; otherwise request
\`researchspec plugin instructions <skill-id> --json\` and follow that exact
hash-bound entry. Give the helper only the current task, necessary inputs,
expected response, and forbidden ResearchSpec authority writes. Its result is
working material returned to this ARSU producer for review and integration; it
does not become the candidate producer, workflow dependency, subflow, work item,
Gate, Decision, transition, or receipt. Installation consent does not authorize
scripts, dependencies, network, credentials, services, or sensitive-data use.
If discovery, consent, installation, activation, or invocation is unavailable,
continue the same core work without the plugin. A declined suggestion is not a
Decision and should not be repeated in the current conversation unless the
research need materially changes.

${literatureProviderBlock(skillGroup)}

The packaged \`academic-pipeline/scripts/adapters/zotero.py\` path is separate: it
reads only a user-supplied Better BibTeX JSON export, requires a user-provided
Python 3.11+ environment with PyYAML, and is not a live Zotero fact source.

### Shared Runtime Boundaries

Use the selected action descriptor's command, execution policy, input schema,
and current basis. \`direct\` actions may use their returned hash-bound preview;
\`human_confirmed\` Start requires the displayed route confirmation; and
\`plan_bound\` Gate, Decision, and patch-Advance actions require their stated
human confirmation before the identical dry-run plan is executed. Never infer an
expected hash flag: use the descriptor and preview returned for that action.

After a durable transaction, use its \`next_selectors\` and targeted
\`instructions\` reads to continue. Refresh full status when route availability,
profile, or a material working context may have changed; it is not required after
every mechanical step. Never invent paths, artifact types, provenance, runtime
writes, or direct edits to state, registries, receipts, or JSONL ledgers.

For a formal Gate, use \`researchspec-verify\` to produce evidence-linked findings,
show the proposed verdict and consequences, and obtain explicit human confirmation.
On challenge, reverify before offering an override. Start confirmation and
\`--yes\` are not Gate confirmation. A failed reverification may advance only after
\`researchspec-decide\` records an override bound to that Gate event and receipt.

### Adaptive Runtime (\`profile.mode: adaptive\`)

After a confirmed external \`subflow:<template>\` Start, follow only ready
\`obligation:<instance>/<id>\`, \`gate:<instance>/<id>\`,
\`completion:<instance>/<id>\`, \`case-action:<id>\`, \`patch:<id>\`, or
\`change:<id>\` selectors. An obligation descriptor defines the hard evidence
boundary and output path. Within those hard dependencies, ARSU may reorder,
parallelize, retry, replace, or rework semantic tasks.

Use \`researchspec submit obligation:<instance>/<id>\` with the descriptor's
action schema: record a provisional attempt, pause it with a reason, request a
waiver or not-applicable resolution, or accept validated durable evidence. Only
\`accept_evidence\` satisfies the obligation and registers its evidence; ordinary
working material remains provisional. Resolve a requested waiver or
not-applicable case through its returned \`case-action:\` Decision. Submit a
ready formal Gate only after its evidence is accepted and the user confirms the
Verify verdict. When all required obligations and Gates are complete, use the
returned \`completion:\` selector with \`researchspec advance\`.

Adaptive work has no \`work:\` or \`transition:\` graph, parent-child stage
frontier, automatic submission policy, or Material Passport import. Handle
high-impact semantic changes and draft patches only through their returned
\`change:\` or \`patch:\` case actions and the corresponding Propose, Decide, or
Advance transaction.

### Strict Runtime (\`profile.mode: strict\`)

Follow the profile graph through external \`subflow:<template>\`, delegated
\`subflow:<parent>/<node>\`, scoped \`work:<instance>/<node>\`,
\`gate:<instance>/<node>\`, and \`transition:<instance>/<node>\` selectors.
Work instructions define the candidate, dependency, validation, and submission
policy. A trusted automatic work item may use direct hash-bound artifact Submit;
manual work requires the preview and explicit confirmation stated by its
descriptor. Registration is mechanical and is not academic approval.

Start a child only when its parent-scoped selector is in the frontier. Parent
confirmation authorizes that exact mechanical Start; it never confirms a Gate or
branch. Use Verify and a human-confirmed Gate submission for every formal Gate.
When one transition is authorized, request its instructions and execute its
receipt-bound Advance; route branch choices and overrides through
\`researchspec-decide\`. Revision rounds have no inferred maximum: after
re-review, follow only the next selector returned by the strict frontier.

An ARS Material Passport is never runtime truth. Strict
\`academic-pipeline:mid-entry\` Start may import it as external evidence only;
the current adaptive runtime does not support Passport import.

This generated contract integration block uses profile \`${RESEARCHSPEC_PREFLIGHT_PROFILE_ID}\` for
\`${skillGroup}\`. The active workspace profile and CLI action descriptors choose
the applicable runtime protocol.
`;
}

function literatureProviderBlock(skillGroup: string): string {
  if (skillGroup === "deep-research") {
    return renderLiteratureSourcePolicyProjection();
  }
  return `For literature work, the active ARSU producer may use an installed
Zotero task Skill as a bounded provider after a just-in-time readiness check.
Adapter results remain working evidence and cannot directly modify ResearchSpec
specs, state, artifact registry, Gates, Decisions, transitions, or receipts.
Private or library-bound work pauses when readiness fails. Acquisition is
candidate-only without a current bounded authorization, and Curation always
requires a separate request.`;
}
