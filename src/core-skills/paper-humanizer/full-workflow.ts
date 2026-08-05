import { analyzeDocument, computePlanHash, validateCandidate, type DocumentAnalysis } from "./document-pipeline.js";

export interface HumanizationReview {
  source_hash: string;
  plan_hash: string;
  format: DocumentAnalysis["format"];
  sentence_count: number;
  long_sentences: number[];
  diagnostics: DocumentAnalysis["diagnostics"];
  suggestions: string[];
}

export interface HumanizationPlan {
  plan_hash: string;
  source_hash: string;
  operations: Array<{ sentence: number; action: "shorten" | "vary" | "clarify"; rationale: string }>;
}

export function reviewDocument(text: string, fileName = "manuscript.md"): { analysis: DocumentAnalysis; review: HumanizationReview; plan: HumanizationPlan } {
  const analysis = analyzeDocument(text, fileName);
  const operations = analysis.sentences.filter((sentence) => sentence.words > 30).map((sentence) => ({ sentence: sentence.index, action: sentence.words > 45 ? "shorten" as const : "vary" as const, rationale: sentence.words > 45 ? "Reduce sentence load and improve readability." : "Vary sentence rhythm where the prose is dense." }));
  const planData = { operations };
  const plan_hash = computePlanHash(analysis, planData);
  return {
    analysis,
    review: {
      source_hash: analysis.sourceHash,
      plan_hash,
      format: analysis.format,
      sentence_count: analysis.sentences.length,
      long_sentences: analysis.sentences.filter((sentence) => sentence.words > 45).map((sentence) => sentence.index),
      diagnostics: analysis.diagnostics,
      suggestions: operations.map((item) => `${item.action} sentence ${String(item.sentence + 1)}`),
    },
    plan: { plan_hash, source_hash: analysis.sourceHash, operations },
  };
}

export function acceptCandidate(original: DocumentAnalysis, candidate: string, plan: HumanizationPlan, fileName = "manuscript.md") {
  return validateCandidate(original, candidate, plan.plan_hash, { operations: plan.operations }, fileName);
}

