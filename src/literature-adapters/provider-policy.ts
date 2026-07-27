import {
  LITERATURE_ADAPTER_REVIEWED_CAPABILITIES,
  type LiteratureAdapterSkill,
} from "./contracts.js";
import { LITERATURE_ADAPTER_CATALOG } from "./catalog.js";
import {
  LiteratureSourcePolicySchema,
  ManagedLibraryAuthorizationRequestSchema,
  ManagedLibraryAuthorizationSchema,
  type LiteratureSourcePolicy,
  type ManagedLibraryAuthorization,
  type ManagedLibraryAuthorizationRequest,
} from "./provider-contracts.js";

interface LiteratureSourcePolicyDefinition {
  mode: LiteratureSourcePolicy;
  provider_priority: string;
  unavailable_behavior: string;
}

export const LITERATURE_SOURCE_POLICIES: readonly LiteratureSourcePolicyDefinition[] = [
  {
    mode: "adapter-native",
    provider_priority: "Query the current library first, then use Acquisition or bounded external search only for recorded gaps.",
    unavailable_behavior: "Continue with bounded external or user-supplied sources and disclose the coverage limit.",
  },
  {
    mode: "protocol-multi-source",
    provider_priority: "Follow the review protocol; use Zotero for seeds, duplicate checks, full text, and supplemental coverage.",
    unavailable_behavior: "Continue only where the protocol permits and record the missing provider coverage.",
  },
  {
    mode: "external-first",
    provider_priority: "Use current authoritative external sources first or in parallel; use Zotero for academic context.",
    unavailable_behavior: "Continue with the external evidence plan and disclose unavailable library context.",
  },
  {
    mode: "library-bound",
    provider_priority: "Use only the requested current selection, private collection, or offline library scope.",
    unavailable_behavior: "Pause; public search cannot substitute for private or library-only state.",
  },
] as const;

export interface ManagedLibraryAuthorizationEvaluation {
  disposition: "authorized" | "candidate-only";
  reason_code:
    | "authorized"
    | "authorization_missing"
    | "authorization_invalid"
    | "authorization_revoked"
    | "authorization_expired"
    | "authorization_not_yet_valid"
    | "run_mismatch"
    | "route_mismatch"
    | "adapter_mismatch"
    | "library_mismatch"
    | "collection_mismatch"
    | "candidate_not_accepted"
    | "effect_not_allowed";
}

export interface LiteratureProviderPlanInput {
  source_policy: LiteratureSourcePolicy;
  readiness: "ready" | "unavailable";
  coverage_gap: boolean;
  evidence_goal: "none" | "source-analysis" | "cross-source-synthesis";
}

export interface LiteratureProviderPlan {
  disposition: "proceed" | "pause";
  steps: string[];
  coverage_limitation_required: boolean;
}

export function planLiteratureProviderUse(input: LiteratureProviderPlanInput): LiteratureProviderPlan {
  LiteratureSourcePolicySchema.parse(input.source_policy);
  if (input.readiness === "unavailable") {
    return input.source_policy === "library-bound"
      ? { disposition: "pause", steps: [], coverage_limitation_required: true }
      : { disposition: "proceed", steps: ["external-or-user-supplied-sources"], coverage_limitation_required: true };
  }

  const skills = resolveProviderSkills();
  const steps = providerSteps(input, skills);
  if (input.evidence_goal === "source-analysis") steps.push(skills.analysis.skill_id);
  if (input.evidence_goal === "cross-source-synthesis") steps.push(skills.synthesis.skill_id);
  return { disposition: "proceed", steps, coverage_limitation_required: input.coverage_gap };
}

export function evaluateManagedLibraryAuthorization(
  authorizationValue: unknown,
  requestValue: unknown,
): ManagedLibraryAuthorizationEvaluation {
  if (authorizationValue === null || authorizationValue === undefined) {
    return candidateOnly("authorization_missing");
  }
  const authorization = ManagedLibraryAuthorizationSchema.safeParse(authorizationValue);
  const request = ManagedLibraryAuthorizationRequestSchema.safeParse(requestValue);
  if (!authorization.success || !request.success) return candidateOnly("authorization_invalid");
  return evaluateParsedAuthorization(authorization.data, request.data);
}

export function renderLiteratureSourcePolicyProjection(): string {
  const { router, query, acquisition, analysis, synthesis, curation } = resolveProviderSkills();
  const policyRows = LITERATURE_SOURCE_POLICIES.map((policy) =>
    `| \`${policy.mode}\` | ${policy.provider_priority} | ${policy.unavailable_behavior} |`
  );

  return [
    "## Literature Provider Policy",
    "",
    `Classify broad or cross-task Zotero requests to \`${router.skill_id}\`. Route an already bounded task directly: current-library reads to \`${query.skill_id}\`, gap-aware discovery or permitted import to \`${acquisition.skill_id}\`, source-level evidence work to \`${analysis.skill_id}\`, cross-source context to \`${synthesis.skill_id}\`, and separately approved maintenance to \`${curation.skill_id}\`. Zotero use nested inside ARSU research remains a provider operation owned by the active ARSU producer.`,
    "",
    "| Source policy | Provider priority | If live readiness fails |",
    "| --- | --- | --- |",
    ...policyRows,
    "",
    "The selected Adapter Skill checks profile, bridge, authentication, and required capability just in time. Static `connection_state: unchecked` is neither success nor failure, and live readiness is not persisted as ResearchSpec workflow authority.",
    "",
    "Adapter task output reaches the producer only through a provider-neutral `ProviderRetrievalHandoff` that references the upstream result path and SHA-256. It remains working evidence: the ARSU producer owns screening, deduplication, verification, coverage, and durable submission. An empty result is not proof that relevant literature does not exist.",
    "",
    `Without a current run-, route-, collection-, candidate-, effect-, and time-bound \`ManagedLibraryAuthorization\`, \`${acquisition.skill_id}\` is candidate-only. Route confirmation and plugin consent do not grant this authorization. It never authorizes \`${curation.skill_id}\`, metadata maintenance, tagging, notes, merging, deletion, or library-wide mutation.`,
  ].join("\n");
}

export function getLiteratureSourcePolicy(mode: LiteratureSourcePolicy): LiteratureSourcePolicyDefinition {
  LiteratureSourcePolicySchema.parse(mode);
  const policy = LITERATURE_SOURCE_POLICIES.find((item) => item.mode === mode);
  if (!policy) throw new Error(`Unknown literature source policy: ${mode}`);
  return policy;
}

function evaluateParsedAuthorization(
  authorization: ManagedLibraryAuthorization,
  request: ManagedLibraryAuthorizationRequest,
): ManagedLibraryAuthorizationEvaluation {
  if (Date.parse(request.evaluated_at) < Date.parse(authorization.granted_at)) return candidateOnly("authorization_not_yet_valid");
  if (authorization.revocation && Date.parse(request.evaluated_at) >= Date.parse(authorization.revocation.revoked_at)) {
    return candidateOnly("authorization_revoked");
  }
  if (Date.parse(request.evaluated_at) >= Date.parse(authorization.expires_at)) return candidateOnly("authorization_expired");
  if (request.run_id !== authorization.run_id) return candidateOnly("run_mismatch");
  if (request.route_ref !== authorization.route_ref) return candidateOnly("route_mismatch");
  if (request.adapter_id !== authorization.adapter_id) return candidateOnly("adapter_mismatch");
  if (request.target_library_ref !== authorization.target_library_ref) return candidateOnly("library_mismatch");
  if (request.target_collection_ref !== authorization.target_collection_ref) return candidateOnly("collection_mismatch");
  if (!authorization.accepted_candidate_ids.includes(request.candidate_id)) return candidateOnly("candidate_not_accepted");
  if (!authorization.allowed_effects.includes(request.effect)) return candidateOnly("effect_not_allowed");
  return { disposition: "authorized", reason_code: "authorized" };
}

function candidateOnly(
  reasonCode: Exclude<ManagedLibraryAuthorizationEvaluation["reason_code"], "authorized">,
): ManagedLibraryAuthorizationEvaluation {
  return { disposition: "candidate-only", reason_code: reasonCode };
}

function providerSteps(
  input: LiteratureProviderPlanInput,
  skills: ReturnType<typeof resolveProviderSkills>,
): string[] {
  switch (input.source_policy) {
    case "adapter-native":
      return [
        skills.query.skill_id,
        ...(input.coverage_gap ? [skills.acquisition.skill_id] : []),
      ];
    case "protocol-multi-source":
      return [
        "systematic-review-protocol",
        skills.query.skill_id,
        ...(input.coverage_gap ? [skills.acquisition.skill_id] : []),
      ];
    case "external-first":
      return [skills.acquisition.skill_id, skills.query.skill_id];
    case "library-bound":
      return [skills.query.skill_id];
  }
}

function resolveProviderSkills() {
  const skills = LITERATURE_ADAPTER_CATALOG.flatMap((adapter) => adapter.skills);
  return {
    router: requireSkill(skills, "bounded-task-routing"),
    query: requireSkill(skills, "current-library-query"),
    acquisition: requireSkill(skills, "external-literature-acquisition"),
    analysis: requireSkill(skills, "source-evidence-analysis"),
    synthesis: requireSkill(skills, "cross-source-synthesis"),
    curation: requireSkill(skills, "approved-library-curation"),
  };
}

function requireSkill(
  skills: LiteratureAdapterSkill[],
  capability: typeof LITERATURE_ADAPTER_REVIEWED_CAPABILITIES[number],
): LiteratureAdapterSkill {
  const matches = skills.filter((skill) => skill.capabilities.includes(capability));
  const [match] = matches;
  if (matches.length !== 1 || !match) {
    throw new Error(`Expected one literature Adapter Skill for capability ${capability}, found ${String(matches.length)}.`);
  }
  return match;
}
