import type { NonNativeVendorSkillDefinition } from "../shared/non-native-skill-standard/index.js";

const distribution = {
  licensePath: "LICENSE",
  noticePath: "NOTICE",
  provenancePath: "DERIVATION.json",
} as const;

function scriptCapabilities(ids: string[], scriptPath: string) {
  return ids.map((id) => ({ id, implementation: { kind: "bundled-script" as const, scriptPath } }));
}

export const HISTAGENT_SKILL_DEFINITIONS: Record<string, NonNativeVendorSkillDefinition> = {
  "histagent-historical-source-analysis": {
    skillId: "histagent-historical-source-analysis",
    extensions: ["script-assisted", "resource-backed"],
    firstActionAnchor: "Choose the command from the mode table before preparing inputs.",
    capabilities: scriptCapabilities(
      ["inspect", "convert", "ocr", "translate", "transcribe", "frames", "vision", "collate", "validate"],
      "scripts/analyze_source.py",
    ),
    references: [
      { path: "references/adapters-and-formats.md", readWhen: "Read this reference when selecting a format or local/remote adapter" },
      { path: "references/layer-and-collation-cases.md", readWhen: "Read this reference when preparing a layer file, collation, variant, or emendation" },
    ],
    scripts: [{
      path: "scripts/analyze_source.py",
      invocation: "python scripts/analyze_source.py inspect --source SOURCE --output RECEIPT.json",
      useWhenAnchor: "Use this entrypoint for every deterministic analysis command.",
      inputAnchor: "Inputs come from ordinary CLI options or the named layer, variants, and emendations files.",
      outputAnchor: "Success writes the requested artifact and prints a command-specific receipt as one JSON object.",
      dependencyAnchor: "Python 3.11 and the standard library are sufficient for offline inspection, collation, and validation.",
      failureAnchor: "Failure exits nonzero and writes an error object to stderr without a success object on stdout.",
    }],
    resources: [{
      path: "lib/historical_support.py",
      usageAnchor: "The entrypoint imports lib/historical_support.py before parsing a command.",
      failureAnchor: "If the support library is missing, stop because the copied tree is incomplete.",
      consumer: { kind: "bundled-script", scriptPath: "scripts/analyze_source.py" },
    }],
    distribution,
  },
  "histagent-historical-source-identification": {
    skillId: "histagent-historical-source-identification",
    extensions: ["script-assisted", "resource-backed"],
    firstActionAnchor: "Choose the command from the mode table before preparing inputs.",
    capabilities: scriptCapabilities(
      ["search", "exact-text", "literature", "archive", "fetch", "reverse-image", "verify", "validate"],
      "scripts/identify_sources.py",
    ),
    references: [
      { path: "references/provider-adapters.md", readWhen: "Read this reference when selecting or configuring a provider adapter" },
      { path: "references/candidate-verification-cases.md", readWhen: "Read this reference when creating, validating, or changing a candidate status" },
    ],
    scripts: [{
      path: "scripts/identify_sources.py",
      invocation: "python scripts/identify_sources.py search --query QUERY --adapter local-index --index INDEX.json --output CANDIDATES.json",
      useWhenAnchor: "Use this entrypoint for every deterministic identification command.",
      inputAnchor: "Inputs come from ordinary CLI options or a named candidate file.",
      outputAnchor: "Success writes the requested artifact when applicable and prints a command-specific receipt as one JSON object.",
      dependencyAnchor: "Python 3.11 and the standard library are sufficient for local indexes, HTTP, and the reviewed provider adapters.",
      failureAnchor: "Failure exits nonzero and writes an error object to stderr without a success object on stdout.",
    }],
    resources: [{
      path: "lib/historical_support.py",
      usageAnchor: "The entrypoint imports lib/historical_support.py before parsing a command.",
      failureAnchor: "If the support library is missing, stop because the copied tree is incomplete.",
      consumer: { kind: "bundled-script", scriptPath: "scripts/identify_sources.py" },
    }],
    distribution,
  },
  "histagent-historical-research": {
    skillId: "histagent-historical-research",
    extensions: ["script-assisted", "resource-backed", "stateful"],
    firstActionAnchor: "Run status before doing semantic work in an existing run.",
    capabilities: scriptCapabilities(
      ["init", "status", "submit-source", "submit-layer", "submit-evidence", "check", "render"],
      "scripts/research_runtime.py",
    ),
    references: [
      { path: "references/stage-records.md", readWhen: "Read this reference when preparing a scope, source, layer, or evidence record file" },
      { path: "references/evidence-and-conflict-cases.md", readWhen: "Read this reference when evidence conflicts, limitations, review, or synthesis affect the Gate" },
    ],
    scripts: [{
      path: "scripts/research_runtime.py",
      invocation: "python scripts/research_runtime.py status --run-dir RUN",
      useWhenAnchor: "Use this entrypoint for every state transition, Gate check, and deterministic render.",
      inputAnchor: "Inputs come from ordinary CLI options and purpose-specific scope, source, layer, and evidence record files.",
      outputAnchor: "Status prints the direct Gate view; mutations print command-specific receipts; render writes the three fixed final artifacts.",
      dependencyAnchor: "Python 3.11 and the standard library are the only runtime dependencies.",
      failureAnchor: "Failure exits nonzero and writes an error object to stderr without a success object on stdout.",
    }],
    resources: [{
      path: "lib/historical_support.py",
      usageAnchor: "The entrypoint imports lib/historical_support.py before parsing a command.",
      failureAnchor: "If the support library is missing, stop because the copied tree is incomplete.",
      consumer: { kind: "bundled-script", scriptPath: "scripts/research_runtime.py" },
    }],
    state: {
      authorityAnchor: "state.json is the Skill-local source of truth and has no ResearchSpec workflow authority.",
      transitionAnchor: "After every mutation, run status again and execute only its unique next_action.",
      resumeAnchor: "After context loss, run status and reconstruct the run from state instead of chat memory.",
      completionAnchor: "Completion requires status phase complete after deterministic rendering.",
    },
    distribution,
  },
};

export function histAgentSkillDefinition(skillId: string): NonNativeVendorSkillDefinition {
  const definition = HISTAGENT_SKILL_DEFINITIONS[skillId];
  if (!definition) throw new Error(`Unknown HistAgent Skill definition: ${skillId}`);
  return definition;
}
