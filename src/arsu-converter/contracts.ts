import { GENERATED_OUTPUT_PATH, VENDOR_SOURCE_PATH } from "./config.js";
import type {
  ContractIntegrationManifest,
  ContractInjectionResult,
  ContractProfile,
} from "./types.js";

export const RESEARCHSPEC_PREFLIGHT_PROFILE_ID = "researchspec-preflight-v7";
export const RESEARCHSPEC_PREFLIGHT_MARKER = "<!-- researchspec-contract-preflight:v7 -->";
export const RESEARCHSPEC_LITERATURE_ADAPTER_MARKER = "<!-- researchspec-literature-adapter:zotero-library:v1 -->";

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
      "Per-stage and per-mode graphs are supplied by the workflow profile layer.",
      "Use the fixed Zotero literature adapter only as bounded working-material input to the active producer.",
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
\`researchspec status --json\` and consume its canonical frontier. Request
instructions for the selected external \`subflow:<template>\`, delegated
\`subflow:<parent>/<node>\`, scoped \`work:<instance>/<node>\`,
\`gate:<instance>/<node>\`, or \`transition:<instance>/<node>\` selector. Never
reconstruct stage, Gate, or transition order from this Skill text.

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

For literature work, inspect the fixed \`zotero-library\` entry in
\`researchspec status --json\`; status is static and its
\`connection_state: unchecked\` does not prove that Zotero or Host Bridge is
reachable. When available, use the installed \`zotero-library-agent\` and
\`zotero-bridge-cli\` Skills for a bounded, read-only query of the user's library
before supplementing with external discovery when needed. An empty Zotero result
is not evidence that relevant literature does not exist. Treat every adapter
result only as working material for this same ARSU producer to review and
integrate into its candidate.

If the adapter is unavailable during ordinary literature work, disclose the
limitation and continue through this producer's existing external-search or
user-supplied-input path. If the request explicitly depends on the current
Zotero selection, a private collection, private metadata, or private
attachments, pause and request adapter configuration or alternative user input;
never substitute public search as though it represented private library state.
Adapter output must not directly modify ResearchSpec specs, state, artifact
registry, Gates, Decisions, transitions, or receipts. Zotero mutation, workflow
submit/apply, upload, deletion, and maintenance require separate user
authorization and remain subject to Host Bridge approval.

The packaged \`academic-pipeline/scripts/adapters/zotero.py\` path is separate: it
reads only a user-supplied Better BibTeX JSON export, requires a user-provided
Python 3.11+ environment with PyYAML, and is not a live Zotero fact source.

After producing the candidate, inspect \`submission\` and \`completion.submit\`.
When policy is \`automatic\`, the start authorization is valid, and Submit is
available, build the strict dependency payload in a temporary file, run Submit
with \`--dry-run --json\`, then execute the identical selector/payload/actor with
the returned SHA-256, \`--expected-sha256\`, and \`--yes --json\`. Re-query status
and artifact checks. This registration is mechanical and is not Gate pass or
academic approval. For \`manual\` or missing automatic authorization,
build the strict payload only from dynamic instructions, run direct
\`researchspec submit\` with \`--dry-run --json\`, present its candidate hash,
validation, and planned writes, then obtain explicit confirmation before the
identical expected-hash execution. If Submit or its required authority is
unavailable, report the boundary. Never invent path, type, provenance, or runtime writes, and never hand-edit
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
imported as external evidence, while runtime provenance,
decisions, gates, and resume state live in ResearchSpec registries and ledgers.

This generated contract integration block uses profile \`${RESEARCHSPEC_PREFLIGHT_PROFILE_ID}\` for
\`${skillGroup}\`. Per-stage and per-mode graphs remain workflow-profile data.
`;
}
