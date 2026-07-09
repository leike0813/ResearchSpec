import { GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import type {
  ContractCompatibilityManifest,
  ContractInjectionResult,
  ContractProfile,
} from "./types.js";

const PROFILE_ID = "researchspec-preflight-v1";
const CONTRACT_MARKER = "<!-- researchspec-contract-preflight:v1 -->";

export function buildContractCompatibilityManifest(skillGroups: string[]): ContractCompatibilityManifest {
  return {
    schema_version: "0.1",
    compatibility_kind: PROFILE_ID,
    source: VENDOR_SOURCE_PATH,
    output: GENERATED_OUTPUT_PATH,
    material_passport_policy: "compatibility_artifact_only_not_runtime_ssot",
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
      "researchspec/runs/current/decision-ledger.jsonl for human-confirmed decisions",
      "researchspec/runs/current/gate-ledger.jsonl for validation and gate outcomes",
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
or wrapper protocol. Record human-confirmed decisions in
\`runs/current/decision-ledger.jsonl\` and validation or gate outcomes in
\`runs/current/gate-ledger.jsonl\`.

Do not treat ARS Material Passport as ResearchSpec runtime truth. It may be
imported or rendered as a compatibility artifact, while runtime provenance,
decisions, gates, and resume state live in ResearchSpec registries and ledgers.

This generated compatibility block uses profile \`${PROFILE_ID}\` for
\`${skillGroup}\`. Full per-stage and per-mode matrix injection is deferred to a
later ResearchSpec converter change.
`;
}
