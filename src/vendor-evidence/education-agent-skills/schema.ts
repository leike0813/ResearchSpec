import { z } from "zod";

export const EvidenceWorkTypeSchema = z.enum([
  "paper",
  "book",
  "chapter",
  "report",
  "guide",
  "framework",
  "conference-paper",
  "thesis",
  "website",
  "practice-method",
  "other",
]);

export const EvidenceExistenceStatusSchema = z.enum([
  "verified",
  "unresolved",
  "conflicting",
  "not-applicable",
]);

export const EvidenceMappingTypeSchema = z.enum([
  "exact",
  "normalized",
  "title-variant",
  "composite",
  "ambiguous",
]);

export const ScholarDiscoveryOutcomeSchema = z.enum([
  "results-returned",
  "no-results",
  "blocked",
]);

export const EvidenceSourceKindSchema = z.enum([
  "publisher",
  "journal",
  "doi-registry",
  "isbn-registry",
  "library-catalog",
  "eric",
  "pubmed",
  "official-repository",
  "academic-index",
  "official-website",
]);

const FieldMatchSchema = z.enum([
  "exact",
  "normalized",
  "variant",
  "not-applicable",
  "conflicting",
]);

const ReturnedMetadataSchema = z.strictObject({
  authors: z.array(z.string().min(1)),
  year: z.string().regex(/^\d{4}$/).nullable(),
  title: z.string().min(1),
  container: z.string().min(1).nullable(),
  publisher: z.string().min(1).nullable(),
  identifiers: z.strictObject({
    doi: z.string().min(1).nullable(),
    isbn: z.array(z.string().min(1)),
    openalex: z.string().min(1).nullable(),
    eric: z.string().min(1).nullable(),
    pmid: z.string().min(1).nullable(),
    other: z.array(z.string().min(1)),
  }),
});

export const EvidenceVerificationSourceSchema = z.strictObject({
  source_kind: EvidenceSourceKindSchema,
  url: z.url(),
  accessed_at: z.iso.date(),
  outcome: z.enum(["matched", "no-match", "conflicting"]),
  returned_metadata: ReturnedMetadataSchema.nullable(),
  field_matches: z.strictObject({
    authors: FieldMatchSchema,
    year: FieldMatchSchema,
    title: FieldMatchSchema,
    conclusion: z.string().min(1),
  }),
});

export const EvidenceWorkSchema = z.strictObject({
  work_id: z.string().regex(/^work-\d{4}$/),
  type: EvidenceWorkTypeSchema,
  canonical: z.strictObject({
    authors: z.array(z.string().min(1)).min(1),
    year: z.string().regex(/^\d{4}$/).nullable(),
    title: z.string().min(1),
    container: z.string().min(1).nullable(),
    publisher: z.string().min(1).nullable(),
  }),
  existence_status: EvidenceExistenceStatusSchema,
  claim_support_reviewed: z.literal(false),
  review_reason: z.string().min(1),
  sources: z.array(EvidenceVerificationSourceSchema),
}).superRefine((work, context) => {
  if (work.existence_status === "verified") {
    if (!work.sources.some((source) => source.outcome === "matched" && source.returned_metadata)) {
      context.addIssue({
        code: "custom",
        path: ["sources"],
        message: "verified work requires a matched reliable source with returned metadata",
      });
    }
    for (const source of work.sources.filter((entry) => entry.outcome === "matched")) {
      if (source.field_matches.authors === "conflicting" || source.field_matches.year === "conflicting" || source.field_matches.title === "conflicting") {
        context.addIssue({
          code: "custom",
          path: ["sources"],
          message: "verified work cannot rely on a source with conflicting identity fields",
        });
      }
    }
  }
  if (work.existence_status === "unresolved" && work.sources.length === 0) {
    context.addIssue({
      code: "custom",
      path: ["sources"],
      message: "unresolved work requires at least one recorded reliable-source search",
    });
  }
  if (work.existence_status === "conflicting" && !work.sources.some((source) => source.outcome === "conflicting")) {
    context.addIssue({
      code: "custom",
      path: ["sources"],
      message: "conflicting work requires a conflicting source outcome",
    });
  }
  if (work.existence_status === "not-applicable") {
    if (!["framework", "practice-method", "other"].includes(work.type)) {
      context.addIssue({
        code: "custom",
        path: ["type"],
        message: "not-applicable is restricted to non-publication evidence types",
      });
    }
    if (work.sources.length !== 0) {
      context.addIssue({
        code: "custom",
        path: ["sources"],
        message: "not-applicable work must not pretend to have publication verification sources",
      });
    }
  }
});

export const EvidenceDeclarationMappingSchema = z.strictObject({
  evidence_id: z.string().regex(/^evidence-\d{4}$/),
  skill_id: z.string().min(1),
  source_path: z.string().min(1),
  source_sha256: z.string().regex(/^[a-f0-9]{64}$/),
  citation: z.string().min(1),
  work_ids: z.array(z.string().regex(/^work-\d{4}$/)).min(1),
  match_type: EvidenceMappingTypeSchema,
  rationale: z.string().min(1),
}).superRefine((mapping, context) => {
  if (mapping.match_type !== "composite" && mapping.work_ids.length !== 1) {
    context.addIssue({
      code: "custom",
      path: ["work_ids"],
      message: "only composite mappings may reference multiple works",
    });
  }
  if (new Set(mapping.work_ids).size !== mapping.work_ids.length) {
    context.addIssue({
      code: "custom",
      path: ["work_ids"],
      message: "mapping work IDs must be unique",
    });
  }
});

export const ScholarDiscoveryCandidateSchema = z.strictObject({
  title: z.string().min(1),
  citation_text: z.string(),
  year: z.string().regex(/^\d{4}$/).nullable(),
  result_url: z.url().nullable(),
});

export const ScholarDiscoveryResultSchema = z.strictObject({
  work_id: z.string().regex(/^work-\d{4}$/),
  candidates: z.array(ScholarDiscoveryCandidateSchema).min(1).max(3),
});

export const ScholarDiscoverySchema = z.strictObject({
  provider: z.literal("google-scholar"),
  endpoint: z.literal("https://scholar.google.com/scholar_lookup"),
  accessed_at: z.iso.date(),
  query_parameters: z.tuple([
    z.literal("title"),
    z.literal("author"),
    z.literal("publication_year"),
  ]),
  initial_unresolved_works: z.literal(428),
  results: z.array(ScholarDiscoveryResultSchema),
  no_result_work_ids: z.array(z.string().regex(/^work-\d{4}$/)),
  blocked_work_ids: z.array(z.string().regex(/^work-\d{4}$/)),
  blocked_reason: z.string().min(1).nullable(),
}).superRefine((discovery, context) => {
  checkUniqueAndSorted(discovery.results.map((result) => result.work_id), context, ["results"], "Scholar result work IDs");
  checkUniqueAndSorted(discovery.no_result_work_ids, context, ["no_result_work_ids"], "Scholar no-result work IDs");
  checkUniqueAndSorted(discovery.blocked_work_ids, context, ["blocked_work_ids"], "Scholar blocked work IDs");
  const covered = [
    ...discovery.results.map((result) => result.work_id),
    ...discovery.no_result_work_ids,
    ...discovery.blocked_work_ids,
  ];
  if (covered.length !== 428 || new Set(covered).size !== 428) {
    context.addIssue({
      code: "custom",
      path: [],
      message: "Scholar discovery outcome buckets must cover 428 unique initial unresolved works",
    });
  }
  if ((discovery.blocked_work_ids.length === 0) !== (discovery.blocked_reason === null)) {
    context.addIssue({
      code: "custom",
      path: ["blocked_reason"],
      message: "Scholar blocked outcomes require exactly one shared blocking reason",
    });
  }
});

const StatusCountsSchema = z.strictObject({
  verified: z.number().int().nonnegative(),
  unresolved: z.number().int().nonnegative(),
  conflicting: z.number().int().nonnegative(),
  "not-applicable": z.number().int().nonnegative(),
});

const MappingCountsSchema = z.strictObject({
  exact: z.number().int().nonnegative(),
  normalized: z.number().int().nonnegative(),
  "title-variant": z.number().int().nonnegative(),
  composite: z.number().int().nonnegative(),
  ambiguous: z.number().int().nonnegative(),
});

const ScholarDiscoveryCountsSchema = z.strictObject({
  "results-returned": z.number().int().nonnegative(),
  "no-results": z.number().int().nonnegative(),
  blocked: z.number().int().nonnegative(),
});

export const EducationAgentSkillsEvidenceMapSchema = z.strictObject({
  schema_version: z.literal("1"),
  vendor_id: z.literal("education-agent-skills"),
  audit_binding: z.strictObject({
    audit_path: z.literal("audits/education-agent-skills/snapshot-32fce5c/skill-audit.json"),
    audit_sha256: z.string().regex(/^[a-f0-9]{64}$/),
    snapshot_id: z.literal("snapshot-32fce5c"),
    revision: z.literal("32fce5c0d097ec675cf81c750a65a379e4d87e3c"),
    tree_hash: z.literal("3223d79299ae10391c22549debef7ffc9ef7a0e2"),
  }),
  review_scope: z.strictObject({
    existence_only: z.literal(true),
    claim_support_reviewed: z.literal(false),
    network_research_completed_on: z.iso.date(),
  }),
  works: z.array(EvidenceWorkSchema).min(1),
  declaration_mappings: z.array(EvidenceDeclarationMappingSchema).length(872),
  google_scholar_discovery: ScholarDiscoverySchema,
  summary: z.strictObject({
    declarations: z.literal(872),
    works: z.number().int().positive(),
    skills: z.literal(165),
    existence_status_counts: StatusCountsSchema,
    mapping_type_counts: MappingCountsSchema,
    google_scholar_discovery: z.strictObject({
      searches: z.literal(428),
      outcome_counts: ScholarDiscoveryCountsSchema,
    }),
    affected_skills_by_status: z.strictObject({
      verified: z.array(z.string().min(1)),
      unresolved: z.array(z.string().min(1)),
      conflicting: z.array(z.string().min(1)),
      "not-applicable": z.array(z.string().min(1)),
    }),
  }),
}).superRefine((value, context) => {
  checkUniqueAndSorted(value.works.map((work) => work.work_id), context, ["works"], "work IDs");
  checkUniqueAndSorted(value.declaration_mappings.map((mapping) => mapping.evidence_id), context, ["declaration_mappings"], "evidence IDs");
  const workIds = new Set(value.works.map((work) => work.work_id));
  const referencedWorkIds = new Set(value.declaration_mappings.flatMap((mapping) => mapping.work_ids));
  for (const mapping of value.declaration_mappings) {
    for (const workId of mapping.work_ids) {
      if (!workIds.has(workId)) {
        context.addIssue({
          code: "custom",
          path: ["declaration_mappings", mapping.evidence_id, "work_ids"],
          message: `mapping references missing work ${workId}`,
        });
      }
    }
  }
  for (const workId of workIds) {
    if (!referencedWorkIds.has(workId)) {
      context.addIssue({
        code: "custom",
        path: ["works", workId],
        message: "every work must be referenced by at least one declaration",
      });
    }
  }
  const discoveryWorkIds = [
    ...value.google_scholar_discovery.results.map((result) => result.work_id),
    ...value.google_scholar_discovery.no_result_work_ids,
    ...value.google_scholar_discovery.blocked_work_ids,
  ];
  for (const discoveryWorkId of discoveryWorkIds) {
    if (!workIds.has(discoveryWorkId)) {
      context.addIssue({
        code: "custom",
        path: ["google_scholar_discovery", discoveryWorkId],
        message: "Scholar discovery references a missing work",
      });
    }
  }
  for (const work of value.works) {
    for (const source of work.sources) {
      if (new URL(source.url).hostname.endsWith("scholar.google.com")) {
        context.addIssue({
          code: "custom",
          path: ["works", work.work_id, "sources"],
          message: "Google Scholar discovery pages cannot be verification sources",
        });
      }
    }
  }
  const expectedSummary = summarizeEvidenceMap(value.works, value.declaration_mappings, value.google_scholar_discovery);
  if (JSON.stringify(value.summary) !== JSON.stringify(expectedSummary)) {
    context.addIssue({
      code: "custom",
      path: ["summary"],
      message: "summary must be derived from works and declaration mappings",
    });
  }
});

export type EvidenceWork = z.infer<typeof EvidenceWorkSchema>;
export type EvidenceDeclarationMapping = z.infer<typeof EvidenceDeclarationMappingSchema>;
export type ScholarDiscovery = z.infer<typeof ScholarDiscoverySchema>;
export type EducationAgentSkillsEvidenceMap = z.infer<typeof EducationAgentSkillsEvidenceMapSchema>;

export function summarizeEvidenceMap(
  works: EvidenceWork[],
  mappings: EvidenceDeclarationMapping[],
  discovery: ScholarDiscovery,
): EducationAgentSkillsEvidenceMap["summary"] {
  const statusOptions = EvidenceExistenceStatusSchema.options;
  const mappingOptions = EvidenceMappingTypeSchema.options;
  const workById = new Map(works.map((work) => [work.work_id, work]));
  const skillsByStatus = Object.fromEntries(statusOptions.map((status) => [status, new Set<string>()])) as Record<
    z.infer<typeof EvidenceExistenceStatusSchema>,
    Set<string>
  >;
  for (const mapping of mappings) {
    for (const workId of mapping.work_ids) {
      const work = workById.get(workId);
      if (work) skillsByStatus[work.existence_status].add(mapping.skill_id);
    }
  }
  return {
    declarations: 872,
    works: works.length,
    skills: new Set(mappings.map((mapping) => mapping.skill_id)).size as 165,
    existence_status_counts: countValues(statusOptions, works.map((work) => work.existence_status)),
    mapping_type_counts: countValues(mappingOptions, mappings.map((mapping) => mapping.match_type)),
    google_scholar_discovery: {
      searches: 428,
      outcome_counts: {
        "results-returned": discovery.results.length,
        "no-results": discovery.no_result_work_ids.length,
        blocked: discovery.blocked_work_ids.length,
      },
    },
    affected_skills_by_status: Object.fromEntries(
      statusOptions.map((status) => [status, [...skillsByStatus[status]].sort(compareText)]),
    ) as EducationAgentSkillsEvidenceMap["summary"]["affected_skills_by_status"],
  };
}

function checkUniqueAndSorted(
  values: string[],
  context: z.RefinementCtx,
  path: Array<string | number>,
  label: string,
): void {
  if (new Set(values).size !== values.length) {
    context.addIssue({ code: "custom", path, message: `${label} must be unique` });
  }
  if (JSON.stringify(values) !== JSON.stringify([...values].sort(compareText))) {
    context.addIssue({ code: "custom", path, message: `${label} must be sorted by code point` });
  }
}

function countValues<const T extends readonly string[]>(
  options: T,
  values: string[],
): Record<T[number], number> {
  return Object.fromEntries(
    options.map((option) => [option, values.filter((value) => value === option).length]),
  ) as Record<T[number], number>;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
