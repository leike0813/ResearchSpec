import { GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import type {
  ContractCompatibilityManifest,
  ContractInjectionResult,
  ContractProfile,
} from "./types.js";

const PROFILE_ID = "researchspec-preflight-v4";
const CONTRACT_MARKER = "<!-- researchspec-contract-preflight:v4 -->";

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
    bullets.push("Write only the candidate path declared by dynamic instructions. For trusted automatic instance work, run hash-bound `researchspec submit` directly; hand manual or legacy registration to `researchspec-submit`. Never edit registry or receipts directly.");
  }
  if (targets.includes("researchspec/runs/current/decision-ledger.jsonl")) {
    bullets.push("After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.");
  }
  if (targets.includes("researchspec/runs/current/gate-ledger.jsonl")) {
    bullets.push("Return validation findings through `researchspec-verify`; after explicit human confirmation, use `researchspec submit gate:<instance>/<node>`. Never edit the Gate ledger or receipts directly.");
  }
  return bullets;
}

export function buildContractCompatibilityManifest(skillGroups: string[]): ContractCompatibilityManifest {
  return {
    schema_version: "0.1",
    compatibility_kind: PROFILE_ID,
    source: VENDOR_SOURCE_PATH,
    output: GENERATED_OUTPUT_PATH,
    material_passport_policy: "compatibility_artifact_only_not_runtime_ssot",
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
  if (text.includes(CONTRACT_MARKER)) {
    return {
      text,
      result: { injected: false, profile_id: PROFILE_ID, marker: CONTRACT_MARKER },
    };
  }

  const block = contractPreflightBlock(skillGroup);
  const frontmatter = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (frontmatter?.[0]) {
    return {
      text: `${frontmatter[0]}\n${block}\n${text.slice(frontmatter[0].length).replace(/^\r?\n/, "")}`,
      result: { injected: true, profile_id: PROFILE_ID, marker: CONTRACT_MARKER },
    };
  }
  return {
    text: `${block}\n${text}`,
    result: { injected: true, profile_id: PROFILE_ID, marker: CONTRACT_MARKER },
  };
}

function buildProfile(skillGroup: string): ContractProfile {
  return {
    profile_id: PROFILE_ID,
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
      "Treat ARS Material Passport as an imported compatibility artifact, not runtime truth.",
      "Per-stage and per-mode graphs are supplied by the workflow profile layer.",
    ],
    full_matrix_injection: false,
  };
}

function contractPreflightBlock(skillGroup: string): string {
  return `${CONTRACT_MARKER}
## ResearchSpec Contract Preflight

Before running this ARSU-derived skill, locate the project \`researchspec/\`
workspace. Read \`specs/workflow.yaml\` and \`runs/current/state.yaml\` first,
then load only the contracts and artifact references needed for the current
skill, stage, phase, or mode.

Use \`runs/current/artifact-registry.json\` to read prior artifacts. Call
\`researchspec status --json\` and consume its canonical frontier. Request
instructions for the selected external \`subflow:<template>\`, delegated
\`subflow:<parent>/<node>\`, scoped \`work:<instance>/<node>\`,
\`gate:<instance>/<node>\`, or \`transition:<instance>/<node>\` selector. Never
reconstruct stage, Gate, or transition order from this Skill text.

After producing the candidate, inspect \`submission\` and \`completion.submit\`.
When policy is \`automatic\`, the start authorization is valid, and Submit is
available, build the strict dependency payload in a temporary file, run Submit
with \`--dry-run --json\`, then execute the identical selector/payload/actor with
the returned SHA-256, \`--expected-sha256\`, and \`--yes --json\`. Re-query status
and artifact checks. This registration is mechanical and is not Gate pass or
academic approval. For \`manual\`, \`legacy\`, missing authorization, or unavailable
Submit, hand the candidate to \`researchspec-submit\` or report the boundary.
Never invent path, type, provenance, or runtime writes, and never hand-edit
state, registries, receipts, or JSONL ledgers.

For a formal Gate, use \`researchspec-verify\` to produce evidence-linked findings,
show the proposed verdict and consequences, and obtain explicit human confirmation.
On challenge, reverify before offering an override. Submit the strict confirmed
payload with \`researchspec submit gate:<instance>/<node>\`; Start confirmation and
\`--yes\` are not Gate confirmation. A failed reverification may advance only after
\`researchspec-decide\` records an override bound to that Gate event and receipt.

When exactly one transition is authorized, request its instructions and run
receipt-bound Advance dry-run followed by identical expected-plan execution. When
multiple candidates remain, route the branch through \`researchspec-decide\`.
Start a child subflow only when its parent-scoped selector is present in the
current frontier. Parent confirmation authorizes that exact mechanical Start;
it never confirms a Gate or branch. Revision rounds have no inferred maximum:
after re-review, follow only the next round selector returned by status.

Do not treat ARS Material Passport as ResearchSpec runtime truth. It may be
imported or rendered as a compatibility artifact, while runtime provenance,
decisions, gates, and resume state live in ResearchSpec registries and ledgers.

This generated compatibility block uses profile \`${PROFILE_ID}\` for
\`${skillGroup}\`. Per-stage and per-mode graphs remain workflow-profile data.
`;
}
