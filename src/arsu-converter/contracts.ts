import { GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import type {
  ContractCompatibilityManifest,
  ContractInjectionResult,
  ContractProfile,
} from "./types.js";

const PROFILE_ID = "researchspec-preflight-v1";
const CONTRACT_MARKER = "<!-- researchspec-contract-preflight:v1 -->";

export const RESEARCHSPEC_MUTATION_OWNERSHIP = {
  stable_specs: "human_or_accepted_contract_patch",
  runtime_state: "orchestrator_or_runtime_helper",
  artifact_registry: "runtime_helper",
  decision_ledger: "runtime_after_human_confirmation",
  gate_ledger: "validator_or_gate_helper",
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
    bullets.push("Emit artifact files and let the ResearchSpec runtime helper register their path, hash, producer, and verification state in `researchspec/runs/current/artifact-registry.json`.");
  }
  if (targets.includes("researchspec/runs/current/decision-ledger.jsonl")) {
    bullets.push("After an explicit human choice, let the ResearchSpec runtime append the structured event to `researchspec/runs/current/decision-ledger.jsonl`.");
  }
  if (targets.includes("researchspec/runs/current/gate-ledger.jsonl")) {
    bullets.push("Return validation findings to the responsible validator or gate helper for structured recording in `researchspec/runs/current/gate-ledger.jsonl`.");
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
      "researchspec/runs/current/gate-ledger.jsonl written by validators or gate helpers",
    ],
    notes: [
      `${skillGroup} uses the shared first-slice ResearchSpec preflight profile.`,
      "Load only stage/mode-relevant contracts into agent context.",
      "Treat ARS Material Passport as an imported compatibility artifact, not runtime truth.",
      "Full per-stage and per-mode matrix injection is intentionally deferred.",
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

Use \`runs/current/artifact-registry.json\` to read prior artifacts. Write new
artifacts as files, then register them through the ResearchSpec runtime helper
or wrapper protocol. Do not hand-edit state, registries, or JSONL ledgers.
After human confirmation, the runtime records decisions; validators and gate
helpers record validation or gate outcomes.

Do not treat ARS Material Passport as ResearchSpec runtime truth. It may be
imported or rendered as a compatibility artifact, while runtime provenance,
decisions, gates, and resume state live in ResearchSpec registries and ledgers.

This generated compatibility block uses profile \`${PROFILE_ID}\` for
\`${skillGroup}\`. Full per-stage and per-mode matrix injection is deferred to a
later ResearchSpec converter change.
`;
}
