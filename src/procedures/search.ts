import {
  searchDocumentIdentity,
  type ProcedureSearchDocument,
  type ProcedureSearchMode,
  type SearchField,
  type SemanticHit,
} from "./search-contracts.js";
import type { ProcedureDefinition } from "./catalog.js";
import { CONCEPT_EXPANSION_LIMIT, CONCEPT_GROUPS, CONCEPT_TOTAL_LIMIT, STOPWORDS } from "./lexicon.js";
import { searchSemanticDocuments, semanticErrorCode } from "./runtime.js";

const FIELD_WEIGHTS: Readonly<Record<SearchField, number>> = {
  identity: 4,
  title: 4,
  intents: 3,
  description: 2,
  context: 1,
};

const FIELD_ORDER = (Object.keys(FIELD_WEIGHTS) as SearchField[])
  .sort((left, right) => FIELD_WEIGHTS[right] - FIELD_WEIGHTS[left] || compareText(left, right));

const BM25_K1 = 1.2;
const BM25_B = 0.75;
/** Sibling terms only widen recall; a specific compound or phrase also carries precision. */
const ALIAS_WEIGHT = 0.5;
const SPECIFIC_SIBLING_WEIGHT = 1.2;
/** A candidate must tie the request together, not win on one incidental term in a high-weight field. */
const COVERAGE_BASE = 0.35;
const FUSION_K = 60;
const FUSION_BRANCH_LIMIT = 50;

export const DEFAULT_SEMANTIC_TIMEOUT_MS = 10_000;

export type SemanticSearch = (
  documents: readonly ProcedureSearchDocument[],
  query: string,
  options?: { timeoutMs?: number },
) => Promise<readonly SemanticHit[]>;

export interface ProcedureSearchOptions {
  mode?: ProcedureSearchMode;
  semanticSearch?: SemanticSearch;
  timeoutMs?: number;
}

export interface ProcedureMatchEvidence {
  fields: string[];
  terms: string[];
  lexical_score?: number;
  semantic_similarity?: number;
}

export interface ProcedureSearchItem {
  procedure: ProcedureDefinition;
  match: ProcedureMatchEvidence;
}

export interface ProcedureRetrieval {
  requested_mode: ProcedureSearchMode;
  effective_mode: ProcedureSearchMode;
  fallback_reason?: string;
  catalog_id: string;
  query?: string;
}

export interface ProcedureSearchResult {
  items: ProcedureSearchItem[];
  retrieval: ProcedureRetrieval;
}

export class ProcedureQueryError extends Error {
  readonly code = "procedure_query_empty";
  constructor(message: string) {
    super(message);
    this.name = "ProcedureQueryError";
  }
}

/** Canonical retrieval documents derived from public catalog metadata only. */
export function buildSearchDocuments(catalog: ReadonlyMap<string, ProcedureDefinition>): ProcedureSearchDocument[] {
  return [...catalog.values()].map((procedure) => ({
    id: procedure.id,
    fields: {
      identity: [procedure.id, procedure.selector],
      title: [procedure.title],
      intents: procedure.intents ?? [],
      description: [procedure.description],
      context: [
        ...procedure.domains,
        ...procedure.profiles,
        ...procedure.manifest?.inputs.map((role) => role.role) ?? [],
        ...procedure.manifest?.outputs.map((role) => role.role) ?? [],
      ],
    },
  }));
}

export async function searchProcedures(
  catalog: ReadonlyMap<string, ProcedureDefinition>,
  query?: string,
  options: ProcedureSearchOptions = {},
): Promise<ProcedureSearchResult> {
  const requestedMode = options.mode ?? "offline";
  const documents = buildSearchDocuments(catalog);
  const retrieval: ProcedureRetrieval = {
    requested_mode: requestedMode,
    // Browsing ranks the catalog itself, so no retrieval backend runs for it.
    effective_mode: query === undefined ? "offline" : requestedMode,
    catalog_id: searchDocumentIdentity(documents),
    ...(query === undefined ? {} : { query }),
  };
  if (query === undefined) {
    return {
      retrieval,
      items: [...catalog.values()].map((procedure) => ({ procedure, match: { fields: [], terms: [] } })),
    };
  }

  const analysis = analyze(query, true);
  if (analysis.terms.size === 0) {
    throw new ProcedureQueryError("The supplied query has no meaningful search content.");
  }

  const lexical = rankLexical(documents, analysis);
  let items: ProcedureSearchItem[] = lexical.map((hit) => ({
    procedure: catalog.get(hit.id) as ProcedureDefinition,
    match: { fields: hit.fields, terms: hit.terms, lexical_score: hit.score },
  }));
  let effectiveMode: ProcedureSearchMode = "offline";
  let fallbackReason: string | undefined;

  if (requestedMode === "hybrid") {
    const bounded = await runBounded(
      options.semanticSearch ?? searchSemanticDocuments,
      documents,
      query,
      options.timeoutMs ?? DEFAULT_SEMANTIC_TIMEOUT_MS,
    );
    if (bounded.ok) {
      effectiveMode = "hybrid";
      items = fuse(catalog, lexical, bounded.hits);
    } else {
      fallbackReason = bounded.reason;
    }
  }

  const exactId = exactIdentity(catalog, query);
  if (exactId !== undefined) items = hoist(items, catalog.get(exactId) as ProcedureDefinition);
  return {
    retrieval: {
      ...retrieval,
      effective_mode: effectiveMode,
      ...(fallbackReason === undefined ? {} : { fallback_reason: fallbackReason }),
    },
    items,
  };
}

interface LexicalHit {
  id: string;
  score: number;
  fields: string[];
  terms: string[];
}

interface FieldStats {
  terms: Map<string, number>;
  length: number;
}

interface FieldCorpus {
  averageLength: number;
}

function rankLexical(documents: readonly ProcedureSearchDocument[], analysis: Analysis): LexicalHit[] {
  const indexed = documents.map((document) => ({ id: document.id, fields: indexFields(document) }));
  const concepts = analysis.concepts;
  const corpora = new Map<SearchField, FieldCorpus>();
  // Fields differ by weight, not by how large their vocabulary happens to be: a term that is
  // rare in the catalog stays rare in a small field such as routing intents.
  const globalFrequency = new Map<string, number>();
  for (const document of indexed) {
    const seen = new Set<string>();
    for (const stats of document.fields.values()) {
      for (const term of stats.terms.keys()) seen.add(term);
    }
    for (const term of seen) globalFrequency.set(term, (globalFrequency.get(term) ?? 0) + 1);
  }
  for (const field of FIELD_ORDER) {
    let documentsWithField = 0;
    let totalLength = 0;
    for (const document of indexed) {
      const stats = document.fields.get(field);
      if (stats === undefined) continue;
      documentsWithField += 1;
      totalLength += stats.length;
    }
    corpora.set(field, { averageLength: documentsWithField === 0 ? 0 : totalLength / documentsWithField });
  }

  const hits: LexicalHit[] = [];
  for (const document of indexed) {
    const perConcept = new Map<string, number>();
    const coveredConcepts = new Set<string>();
    const fields: string[] = [];
    const matched = new Map<string, number>();
    for (const field of FIELD_ORDER) {
      const stats = document.fields.get(field);
      const corpus = corpora.get(field);
      if (stats === undefined || corpus === undefined || stats.length === 0 || corpus.averageLength === 0) continue;
      let fieldScore = 0;
      for (const [term, weight] of analysis.terms) {
        const frequency = stats.terms.get(term);
        if (frequency === undefined) continue;
        const documentFrequency = globalFrequency.get(term) ?? 0;
        if (documentFrequency === 0) continue;
        const idf = Math.log(1 + (indexed.length - documentFrequency + 0.5) / (documentFrequency + 0.5));
        const denominator = frequency + BM25_K1 * (1 - BM25_B + BM25_B * (stats.length / corpus.averageLength));
        const contribution = FIELD_WEIGHTS[field] * weight * idf * ((frequency * (BM25_K1 + 1)) / denominator);
        fieldScore += contribution;
        const conceptKey = analysis.attribution.get(term) ?? `~${term}`;
        perConcept.set(conceptKey, (perConcept.get(conceptKey) ?? 0) + contribution);
        if (!matched.has(term)) matched.set(term, weight);
      }
      // Coverage is a concept property: a candidate covers a request when it expresses that
      // meaning in any of its declared wordings, not only in the wording the request used.
      for (const [conceptKey, members] of concepts) {
        if (members.some((member) => stats.terms.has(member))) coveredConcepts.add(conceptKey);
      }
      if (fieldScore > 0) fields.push(field);
    }
    if (perConcept.size === 0) continue;
    // Diminishing returns per concept: a candidate that ties several salient concepts of the
    // request outranks one that repeats a single incidental term across several fields.
    let score = 0;
    for (const value of perConcept.values()) score += Math.sqrt(value);
    const coverage = concepts.size === 0 ? 1 : coveredConcepts.size / concepts.size;
    hits.push({ id: document.id, score: round(score * (COVERAGE_BASE + (1 - COVERAGE_BASE) * coverage)), fields, terms: [...matched.keys()] });
  }
  return hits.sort((left, right) => right.score - left.score || compareText(left.id, right.id));
}

function fuse(
  catalog: ReadonlyMap<string, ProcedureDefinition>,
  lexical: readonly LexicalHit[],
  hits: readonly SemanticHit[],
): ProcedureSearchItem[] {
  const fused = new Map<string, { score: number; lexical?: LexicalHit; similarity?: number }>();
  const record = (id: string, weight: number) => {
    const entry = fused.get(id) ?? { score: 0 };
    entry.score += weight;
    fused.set(id, entry);
    return entry;
  };
  for (const [index, hit] of lexical.slice(0, FUSION_BRANCH_LIMIT).entries()) {
    record(hit.id, 1 / (FUSION_K + index + 1)).lexical = hit;
  }
  const semantic = [...new Map(hits.filter((hit) => catalog.has(hit.id)).map((hit) => [hit.id, hit])).values()]
    .sort((left, right) => right.score - left.score || compareText(left.id, right.id));
  for (const [index, hit] of semantic.slice(0, FUSION_BRANCH_LIMIT).entries()) {
    record(hit.id, 1 / (FUSION_K + index + 1)).similarity = round(hit.score);
  }
  return [...fused]
    .sort(([leftId, left], [rightId, right]) => right.score - left.score || compareText(leftId, rightId))
    .map(([id, entry]) => ({
      procedure: catalog.get(id) as ProcedureDefinition,
      match: {
        fields: entry.lexical?.fields ?? [],
        terms: entry.lexical?.terms ?? [],
        ...(entry.lexical === undefined ? {} : { lexical_score: entry.lexical.score }),
        ...(entry.similarity === undefined ? {} : { semantic_similarity: entry.similarity }),
      },
    }));
}

function hoist(items: readonly ProcedureSearchItem[], procedure: ProcedureDefinition): ProcedureSearchItem[] {
  return [
    { procedure, match: items.find((item) => item.procedure.id === procedure.id)?.match ?? { fields: [], terms: [] } },
    ...items.filter((item) => item.procedure.id !== procedure.id),
  ];
}

type BoundedSemantic = { ok: true; hits: readonly SemanticHit[] } | { ok: false; reason: string };

async function runBounded(
  runtime: SemanticSearch,
  documents: readonly ProcedureSearchDocument[],
  query: string,
  timeoutMs: number,
): Promise<BoundedSemantic> {
  let work: Promise<readonly SemanticHit[]>;
  try {
    work = Promise.resolve(runtime(documents, query, { timeoutMs }));
  } catch {
    return { ok: false, reason: "semantic_runtime_failed" };
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<{ ok: false; reason: string }>((resolve) => {
    timer = setTimeout(() => resolve({ ok: false, reason: "semantic_timeout" }), timeoutMs);
  });
  try {
    return await Promise.race([work.then((hits) => ({ ok: true, hits }) as const), deadline]);
  } catch (error) {
    // The runtime owns its diagnostic vocabulary; anything else stays a generic failure.
    const code = semanticErrorCode(error);
    return { ok: false, reason: code === "unknown" ? "semantic_runtime_failed" : code };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function exactIdentity(catalog: ReadonlyMap<string, ProcedureDefinition>, query: string): string | undefined {
  const trimmed = query.trim();
  const bare = trimmed.startsWith("procedure:") ? trimmed.slice("procedure:".length) : trimmed;
  if (catalog.has(bare)) return bare;
  const normalized = normalizeText(trimmed);
  if (normalized === "") return undefined;
  for (const procedure of catalog.values()) {
    if (normalizeText(procedure.id) === normalized) return procedure.id;
    if (normalizeText(procedure.selector) === normalized) return procedure.id;
    if (normalizeText(procedure.title) === normalized) return procedure.id;
  }
  return undefined;
}

interface Analysis {
  terms: Map<string, number>;
  /** Full member list of every salient concept, used to measure how much of a request a candidate covers. */
  concepts: Map<string, readonly string[]>;
  /** Each query term belongs to exactly one concept, so scores aggregate per concept instead of per token. */
  attribution: Map<string, string>;
}

function indexFields(document: ProcedureSearchDocument): Map<SearchField, FieldStats> {
  const fields = new Map<SearchField, FieldStats>();
  for (const field of FIELD_ORDER) {
    const terms = new Map<string, number>();
    let length = 0;
    for (const value of document.fields[field]) {
      for (const [term, weight] of analyze(value).terms) {
        terms.set(term, (terms.get(term) ?? 0) + 1);
        length += weight;
      }
    }
    if (terms.size > 0) fields.set(field, { terms, length });
  }
  return fields;
}

function analyze(value: string, collectConcepts = false): Analysis {
  const normalized = normalizeText(value);
  const terms = new Map<string, number>();
  const concepts = new Map<string, readonly string[]>();
  const attribution = new Map<string, string>();
  const segments = segmentWords(normalized);
  const words = new Set(segments);
  let expanded = 0;
  const key = (group: readonly string[]): string => group[0];
  const addConcept = (group: readonly string[]): void => {
    let added = 0;
    for (const term of group) {
      if (terms.has(term)) continue;
      if (added >= CONCEPT_EXPANSION_LIMIT || expanded >= CONCEPT_TOTAL_LIMIT) return;
      terms.set(term, siblingWeight(term));
      if (collectConcepts && !attribution.has(term)) attribution.set(term, key(group));
      added += 1;
      expanded += 1;
    }
  };
  const register = (token: string, group: readonly string[] | undefined, ambiguous?: readonly (readonly string[])[]): void => {
    if (!collectConcepts) return;
    if (group === undefined) {
      concepts.set(`~${token}`, [token]);
      attribution.set(token, `~${token}`);
      return;
    }
    const conceptKey = key(group);
    concepts.set(conceptKey, group);
    if (!attribution.has(token)) attribution.set(token, conceptKey);
    // A surface with two readings still contributes the other reading's members to the request.
    for (const other of ambiguous ?? []) {
      if (other === group) continue;
      concepts.set(key(other), other);
    }
  };
  for (const token of segments) {
    if (STOPWORDS.has(token) || !isContentToken(token)) continue;
    terms.set(token, termWeight(token));
    if (collectConcepts) register(token, CONCEPT_SURFACES.get(token));
    for (const variant of inflections(token)) {
      if (!terms.has(variant)) {
        terms.set(variant, termWeight(token));
        const variantGroup = CONCEPT_SURFACES.get(variant);
        if (collectConcepts && variantGroup !== undefined) {
          const conceptKey = key(variantGroup);
          concepts.set(conceptKey, variantGroup);
          attribution.set(variant, conceptKey);
        }
      }
    }
    const group = CONCEPT_SURFACES.get(token);
    if (group !== undefined) addConcept(group);
  }
  for (const phrase of CONCEPT_PHRASES) {
    const matched = phrase.cjk ? normalized.includes(phrase.surface) : phrase.words.every((word) => words.has(word));
    if (matched) addConcept(phrase.group);
  }
  return { terms, concepts, attribution };
}

/** Latin plurals fold only onto vocabulary the catalog already declares. */
function inflections(token: string): string[] {
  if (token.length < 4 || !LATIN_PATTERN.test(token) || CONCEPT_SURFACES.has(token)) return [];
  const stems = token.endsWith("es") ? [token.slice(0, -2)] : [];
  if (token.endsWith("s")) stems.push(token.slice(0, -1));
  return [...new Set(stems)].filter((stem) => stem.length >= 3 && CONCEPT_SURFACES.has(stem));
}

function siblingWeight(term: string): number {
  return term.includes(" ") || (CJK_PATTERN.test(term) && term.length >= 3) ? SPECIFIC_SIBLING_WEIGHT : ALIAS_WEIGHT;
}

const CJK_PATTERN = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
const LATIN_PATTERN = /\p{Script=Latin}/u;
const EN_SEGMENTER = new Intl.Segmenter("en", { granularity: "word" });
const ZH_SEGMENTER = new Intl.Segmenter("zh-Hans", { granularity: "word" });

const CONCEPT_SURFACES = new Map<string, readonly string[]>();
const CONCEPT_PHRASES: { surface: string; words: readonly string[]; cjk: boolean; group: readonly string[] }[] = [];
for (const group of CONCEPT_GROUPS) {
  const normalizedGroup = [...new Set(group.map((term) => normalizeText(term)))];
  for (const surface of normalizedGroup) {
    if (!CONCEPT_SURFACES.has(surface)) CONCEPT_SURFACES.set(surface, normalizedGroup);
    if (surface.length < 2) continue;
    CONCEPT_PHRASES.push({
      surface,
      words: surface.split(/\s+/).filter(Boolean),
      cjk: CJK_PATTERN.test(surface),
      group: normalizedGroup,
    });
  }
}

function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .normalize("NFD")
    .replace(/(?<=\p{Script=Latin})\p{M}+/gu, "")
    .normalize("NFC");
}

function segmentWords(text: string): string[] {
  if (text === "") return [];
  const segmenter = CJK_PATTERN.test(text) ? ZH_SEGMENTER : EN_SEGMENTER;
  const tokens: string[] = [];
  for (const { segment, isWordLike } of segmenter.segment(text)) {
    if (isWordLike) tokens.push(normalizeText(segment));
  }
  return tokens;
}

function isContentToken(token: string): boolean {
  if (CJK_PATTERN.test(token)) return token.length >= 2 || CONCEPT_SURFACES.has(token);
  return token.length >= 2;
}

function termWeight(token: string): number {
  if (CJK_PATTERN.test(token)) return token.length >= 2 ? 1.5 : 1;
  return token.length >= 5 ? 1.2 : 1;
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
