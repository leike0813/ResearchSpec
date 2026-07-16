import type {
  NonNativeSkillCapability,
  NonNativeVendorSkillDefinition,
} from "../shared/non-native-skill-standard/index.js";

export type FinRobotSkillTier = 1 | 3;

export interface FinRobotSkillDefinition extends NonNativeVendorSkillDefinition {
  title: string;
  tier: FinRobotSkillTier;
  capabilityId: string;
  domainIds: string[];
  hardDependencies: [];
}

const distribution = {
  licensePath: "LICENSE",
  noticePath: "NOTICE",
  provenancePath: "DERIVATION.json",
} as const;

const procedure = (
  id: string,
  procedureAnchor: string,
  outputAnchor = "Record each conclusion with evidence, assumptions, counterevidence, and limitations.",
  failureAnchor = "Stop when the available evidence cannot support the requested conclusion.",
): NonNativeSkillCapability => ({
  id,
  implementation: { kind: "agent-procedure", procedureAnchor, outputAnchor, failureAnchor },
});

const scripted = (id: string, scriptPath: string): NonNativeSkillCapability => ({
  id,
  implementation: { kind: "bundled-script", scriptPath },
});

const supportResource = (scriptPath: string) => ({
  path: "lib/financial_support.py",
  usageAnchor: "The entrypoint imports lib/financial_support.py before parsing a command.",
  failureAnchor: "If the support library is missing, stop because the copied tree is incomplete.",
  consumer: { kind: "bundled-script" as const, scriptPath },
});

const commonDomains = ["banking-finance-and-investment"];
const accountingDomains = ["accounting-auditing-and-accountability", ...commonDomains];

export const FINROBOT_SKILL_DEFINITIONS: Record<string, FinRobotSkillDefinition> = {
  "financial-research-company-fundamentals": {
    skillId: "financial-research-company-fundamentals",
    title: "Company Fundamentals Research",
    tier: 3,
    capabilityId: "company-fundamentals-analysis",
    domainIds: accountingDomains,
    hardDependencies: [],
    extensions: ["script-assisted", "resource-backed"],
    firstActionAnchor: "Define the company, reporting currency, as-of date, and decision question before collecting evidence.",
    capabilities: [
      procedure("analyzer-analyze-business-highlights", "Agent procedure: connect disclosed business highlights to measurable drivers and limits."),
      procedure("analyzer-analyze-company-description", "Agent procedure: describe the business model, segments, customers, geography, and revenue logic from cited evidence."),
      scripted("analyzer-get-key-data", "scripts/fundamentals.py"),
      procedure("enhanced-forecast-methodology", "Agent procedure: choose forecast assumptions and explain why each assumption fits the evidence."),
      procedure("equity-company-overview", "Agent procedure: synthesize the operating profile, financial trajectory, and investment thesis."),
      procedure("equity-major-takeaways", "Agent procedure: rank the decision-relevant takeaways and identify disconfirming evidence."),
      scripted("processor-growth-forecast", "scripts/fundamentals.py"),
    ],
    references: [],
    scripts: [{
      path: "scripts/fundamentals.py",
      invocation: "python scripts/fundamentals.py metrics --input INPUT.json --output OUTPUT.json",
      useWhenAnchor: "Use this entrypoint for every deterministic metrics or forecast command.",
      inputAnchor: "Inputs come from one purpose-specific JSON file containing normalized periods and explicit assumptions.",
      outputAnchor: "Success writes deterministic JSON to the requested output path and prints its path and SHA-256.",
      dependencyAnchor: "Python 3.11 and the standard library are the only runtime dependencies.",
      failureAnchor: "Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.",
    }],
    resources: [supportResource("scripts/fundamentals.py")],
    distribution,
  },
  "financial-research-competitive-position": {
    skillId: "financial-research-competitive-position",
    title: "Competitive Position Research",
    tier: 1,
    capabilityId: "competitive-position-analysis",
    domainIds: commonDomains,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Define the focal company, comparison question, as-of date, and candidate peer universe before collecting evidence.",
    capabilities: [
      procedure("analyzer-get-competitors-analysis", "Agent procedure: select comparable peers and compare operating, strategic, and financial evidence on aligned definitions."),
      procedure("equity-competitor-analysis", "Agent procedure: synthesize moat durability, peer advantages, relative valuation, and investment attractiveness."),
    ],
    references: [],
    scripts: [],
    resources: [],
    distribution,
  },
  "financial-research-corporate-risk": {
    skillId: "financial-research-corporate-risk",
    title: "Corporate Risk Research",
    tier: 1,
    capabilityId: "corporate-risk-analysis",
    domainIds: commonDomains,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Define the entity, decision horizon, as-of date, risk owner, and materiality frame before collecting evidence.",
    capabilities: [
      procedure("analyzer-get-risk-assessment", "Agent procedure: identify exposures, controls, transmission paths, and evidence-backed residual risk."),
      procedure("enhanced-risk-factors", "Agent procedure: connect each risk driver to affected metrics, timing, mitigants, and observable warning indicators."),
      procedure("equity-risks", "Agent procedure: prioritize risk factors using explicit likelihood, impact, confidence, and counterevidence judgments."),
    ],
    references: [],
    scripts: [],
    resources: [],
    distribution,
  },
  "financial-research-event-evidence": {
    skillId: "financial-research-event-evidence",
    title: "Financial Event And Catalyst Research",
    tier: 3,
    capabilityId: "financial-news-impact-analysis",
    domainIds: commonDomains,
    hardDependencies: [],
    extensions: ["script-assisted", "resource-backed"],
    firstActionAnchor: "Define the entity, event window, as-of time, timezone, and decision question before collecting event records.",
    capabilities: [
      scripted("catalyst-assess-impact", "scripts/event_evidence.py"),
      scripted("catalyst-classify-event", "scripts/event_evidence.py"),
      scripted("catalyst-estimate-probability", "scripts/event_evidence.py"),
      scripted("catalyst-identify", "scripts/event_evidence.py"),
      procedure("enhanced-catalyst-analysis", "Agent procedure: assess causal path, probability, sentiment, magnitude, timing, and counterevidence for each event."),
      procedure("equity-news-summary", "Agent procedure: synthesize verified events without converting repetition or recency into unsupported importance."),
    ],
    references: [],
    scripts: [{
      path: "scripts/event_evidence.py",
      invocation: "python scripts/event_evidence.py prepare --input INPUT.json --output OUTPUT.json",
      useWhenAnchor: "Use this entrypoint for every deterministic prepare or rank command.",
      inputAnchor: "Inputs come from one purpose-specific JSON file containing event records or Agent-supplied assessments.",
      outputAnchor: "Success writes deterministic JSON to the requested output path and prints its path and SHA-256.",
      dependencyAnchor: "Python 3.11 and the standard library are the only runtime dependencies.",
      failureAnchor: "Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.",
    }],
    resources: [supportResource("scripts/event_evidence.py")],
    distribution,
  },
  "financial-research-relative-valuation": {
    skillId: "financial-research-relative-valuation",
    title: "Relative Valuation Research",
    tier: 3,
    capabilityId: "relative-valuation-analysis",
    domainIds: commonDomains,
    hardDependencies: [],
    extensions: ["script-assisted", "resource-backed"],
    firstActionAnchor: "Define the valuation date, currency, share basis, decision question, and permitted methods before selecting assumptions.",
    capabilities: [
      procedure("enhanced-valuation-analysis", "Agent procedure: choose defensible methods, assumptions, weights, and limitations for the decision context."),
      procedure("equity-valuation-overview", "Agent procedure: interpret fair value, target price, margin of safety, and rating with explicit uncertainty."),
      scripted("sensitivity-margin", "scripts/valuation.py"),
      scripted("sensitivity-revenue", "scripts/valuation.py"),
      scripted("sensitivity-table", "scripts/valuation.py"),
      scripted("valuation-ev-ebitda", "scripts/valuation.py"),
      scripted("valuation-peer-comparison", "scripts/valuation.py"),
    ],
    references: [],
    scripts: [{
      path: "scripts/valuation.py",
      invocation: "python scripts/valuation.py value --input INPUT.json --output OUTPUT.json",
      useWhenAnchor: "Use this entrypoint for every deterministic value or sensitivity command.",
      inputAnchor: "Inputs come from one purpose-specific JSON file containing normalized financial values and explicit assumptions.",
      outputAnchor: "Success writes deterministic JSON to the requested output path and prints its path and SHA-256.",
      dependencyAnchor: "Python 3.11 and the standard library are the only runtime dependencies.",
      failureAnchor: "Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.",
    }],
    resources: [supportResource("scripts/valuation.py")],
    distribution,
  },
  "financial-research-statement-analysis": {
    skillId: "financial-research-statement-analysis",
    title: "Financial Statement Research",
    tier: 3,
    capabilityId: "financial-statement-analysis",
    domainIds: accountingDomains,
    hardDependencies: [],
    extensions: ["script-assisted", "resource-backed"],
    firstActionAnchor: "Define the entity, reporting periods, currency, units, consolidation scope, and accounting basis before normalizing statements.",
    capabilities: [
      scripted("analyzer-analyze-balance-sheet", "scripts/statements.py"),
      scripted("analyzer-analyze-cash-flow", "scripts/statements.py"),
      scripted("analyzer-analyze-income-stmt", "scripts/statements.py"),
      procedure("analyzer-analyze-segment-stmt", "Agent procedure: assess segment mix, segment definition changes, allocation limits, and concentration evidence."),
      procedure("analyzer-income-summarization", "Agent procedure: explain earnings quality and financial trajectory using normalized calculations and cited disclosures."),
      scripted("processor-extract-api", "scripts/statements.py"),
      scripted("processor-extract-pdf", "scripts/statements.py"),
    ],
    references: [],
    scripts: [{
      path: "scripts/statements.py",
      invocation: "python scripts/statements.py normalize --input INPUT.json --output OUTPUT.json",
      useWhenAnchor: "Use this entrypoint for every deterministic normalize, metrics, or forecast command.",
      inputAnchor: "Inputs come from one purpose-specific JSON file containing statement records or explicit forecast assumptions.",
      outputAnchor: "Success writes deterministic JSON to the requested output path and prints its path and SHA-256.",
      dependencyAnchor: "Python 3.11 and the standard library are the only runtime dependencies.",
      failureAnchor: "Failure exits nonzero, reports the invalid field on stderr, and leaves existing output unchanged.",
    }],
    resources: [supportResource("scripts/statements.py")],
    distribution,
  },
};

export const FINROBOT_SKILL_IDS = Object.keys(FINROBOT_SKILL_DEFINITIONS).sort(compareText);

export function finRobotSkillDefinition(skillId: string): FinRobotSkillDefinition {
  const definition = FINROBOT_SKILL_DEFINITIONS[skillId];
  if (!definition) throw new Error(`Unknown FinRobot Skill definition: ${skillId}`);
  return definition;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
