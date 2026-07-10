import type {
  AnchorReplacementShape,
  AnchorSemanticRole,
  ContractAnchor,
} from "./types.js";
import { mutationBoundaryBullets } from "../contracts.js";
import { markerEnd, markerStart } from "./markers.js";

export interface ReplacementTemplateDefinition {
  semantic_role: AnchorSemanticRole;
  researchspec_targets: string[];
  replacement_shape: AnchorReplacementShape;
  title: string;
  lead: string;
  sections: Array<{ heading: string; bullets: string[] }>;
}

export const REPLACEMENT_PROFILE_ID = "researchspec-anchor-replacement-v2" as const;

const TEMPLATE_DEFINITIONS = {
  "material-passport-resume-to-researchspec-runtime": {
    semantic_role: "runtime_state_boundary",
    researchspec_targets: [
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/gate-ledger.jsonl",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "protocol_block",
    title: "ResearchSpec Runtime Ownership",
    lead: "Resume handling is controlled by ResearchSpec runtime files. The ARS Material Passport can be imported as evidence, but it is not the active resume ledger.",
    sections: [
      {
        heading: "Before Resuming",
        bullets: [
          "Read `researchspec/runs/current/state.yaml` for current stage, mode, and resume status.",
          "Resolve prior artifacts through `researchspec/runs/current/artifact-registry.json`.",
          "Check `researchspec/runs/current/gate-ledger.jsonl` for unresolved blocking gates.",
        ],
      },
      {
        heading: "Decision Handling",
        bullets: [
          "If a branch or override is required, stop and request a human decision.",
          "After human confirmation, return the chosen branch to the runtime for decision-ledger recording before advancing.",
        ],
      },
    ],
  },
  "pipeline-state-tracking-researchspec-runtime": {
    semantic_role: "runtime_state_boundary",
    researchspec_targets: [
      "researchspec/specs/workflow.yaml",
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "protocol_block",
    title: "ResearchSpec Pipeline State",
    lead: "Keep the ARS stage graph semantics, but use ResearchSpec runtime files as the state carrier.",
    sections: [
      {
        heading: "State Reads",
        bullets: [
          "Use `researchspec/specs/workflow.yaml` for the configured stage graph.",
          "Use `researchspec/runs/current/state.yaml` for current stage, mode, checkpoint, and resume metadata.",
        ],
      },
      {
        heading: "State Writes",
        bullets: [
          "Emit stage outputs as artifacts for runtime registration.",
          "Represent integrity and transition outcomes in `researchspec/runs/current/gate-ledger.jsonl`.",
        ],
      },
    ],
  },
  "phase-boundary-to-contract-preflight": {
    semantic_role: "contract_io_boundary",
    researchspec_targets: [
      "researchspec/specs/workflow.yaml",
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "io_contract_block",
    title: "ResearchSpec Contract I/O",
    lead: "Treat phase boundaries as contract-scoped reads and writes instead of ARS directory fences.",
    sections: [
      {
        heading: "Contract Inputs",
        bullets: [
          "Load only the workflow, run state, and registered artifacts required by the current stage or mode.",
          "Do not infer permission from a `phase*_` directory name when ResearchSpec state disagrees.",
        ],
      },
      {
        heading: "Writes Allowed",
        bullets: [
          "Write new deliverables as artifact files, then return them to the runtime for registration.",
          "Treat script or hook checks as diagnostics; ResearchSpec contracts define the runtime boundary.",
        ],
      },
    ],
  },
  "reset-boundary-ledger-to-researchspec-state": {
    semantic_role: "runtime_state_boundary",
    researchspec_targets: [
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "protocol_block",
    title: "ResearchSpec Reset Boundary",
    lead: "Checkpoint resets and resumes are ResearchSpec runtime events, not Material Passport ledger mutations.",
    sections: [
      {
        heading: "Boundary Record",
        bullets: [
          "Store reset boundary state in `researchspec/runs/current/state.yaml`.",
          "After human confirmation, return branch choices, overrides, and pending decisions to the runtime for decision-ledger recording.",
        ],
      },
      {
        heading: "Gate Record",
        bullets: [
          "Use `researchspec/runs/current/gate-ledger.jsonl` to record whether the recovered state is verified, stale, or blocked.",
          "If an ARS reset tag exists, register it as compatibility evidence rather than consuming it as the runtime source of truth.",
        ],
      },
    ],
  },
  "ars-schema-handoff-to-researchspec-contracts": {
    semantic_role: "handoff_projection",
    researchspec_targets: [
      "researchspec/specs/project.md",
      "researchspec/specs/sources.yaml",
      "researchspec/specs/claims.yaml",
      "researchspec/specs/manuscript.yaml",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/gate-ledger.jsonl",
      "researchspec/draft-patches/<patch-id>.json",
    ],
    replacement_shape: "schema_projection_table",
    title: "ResearchSpec Handoff Projection",
    lead: "ARS handoff schemas remain payload guidance. ResearchSpec files own the stable runtime contract.",
    sections: [
      {
        heading: "Projection Rules",
        bullets: [
          "Project research intent into `researchspec/specs/project.md`.",
          "Project bibliography and corpus metadata into `researchspec/specs/sources.yaml`.",
          "Project claim intent and limits into `researchspec/specs/claims.yaml`.",
          "Project manuscript structure into `researchspec/specs/manuscript.yaml`.",
        ],
      },
      {
        heading: "Runtime Records",
        bullets: [
          "Emit every handoff payload as an artifact for runtime registration.",
          "Record decisions and gates in their ledgers; manuscript edits use `researchspec/draft-patches/<patch-id>.json`.",
        ],
      },
    ],
  },
  "revision-patch-toolchain-to-researchspec-draft-patches": {
    semantic_role: "draft_patch_protocol",
    researchspec_targets: [
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/gate-ledger.jsonl",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "patch_protocol_block",
    title: "ResearchSpec Draft Patch Protocol",
    lead: "Revision work emits ResearchSpec draft patches. Applying them is a separate deterministic step guarded by decisions and gates.",
    sections: [
      {
        heading: "Patch Inputs",
        bullets: [
          "Read the current draft artifact from `researchspec/runs/current/artifact-registry.json`.",
          "Read accepted revision intent from `researchspec/runs/current/decision-ledger.jsonl`.",
        ],
      },
      {
        heading: "Patch Output",
        bullets: [
          "Emit `researchspec/draft-patches/<patch-id>.json` with block ids, old hashes, operations, and roadmap traceability.",
          "Do not silently apply patch operations while generating the patch.",
        ],
      },
    ],
  },
  "submission-package-gate-to-researchspec-gate-ledger": {
    semantic_role: "gate_policy",
    researchspec_targets: [
      "researchspec/runs/current/gate-ledger.jsonl",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/decision-ledger.jsonl",
    ],
    replacement_shape: "gate_rule_block",
    title: "ResearchSpec Submission Gate",
    lead: "Submission package checks produce gate-ledger records tied to registered artifacts.",
    sections: [
      {
        heading: "Gate Inputs",
        bullets: [
          "Resolve formatted manuscript, figures, tables, and supplementary files from `researchspec/runs/current/artifact-registry.json`.",
          "Read package policy choices from `researchspec/runs/current/decision-ledger.jsonl` when human selection is required.",
        ],
      },
      {
        heading: "Ledger Writes",
        bullets: [
          "Return pass, fail, and blocking findings to the submission-package gate helper.",
          "Do not advance to delivery while a blocking gate entry remains unresolved.",
        ],
      },
    ],
  },
  "artifact-version-passport-to-registry": {
    semantic_role: "artifact_provenance",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Artifact Provenance",
    lead: "Version labels and verification state belong to the artifact registry and gate ledger.",
    sections: [
      {
        heading: "Registry Projection",
        bullets: [
          "Return artifact path, hash, producer, stage, mode, and version label to the runtime registration helper.",
          "Preserve ARS passport fields as artifact metadata when useful.",
        ],
      },
      {
        heading: "Verification Projection",
        bullets: [
          "Return freshness or verification status to the responsible gate helper.",
          "Do not treat a generated report title or version string as the registry source of truth.",
        ],
      },
    ],
  },
  "passport-reset-protocol-to-researchspec-ledgers": {
    semantic_role: "runtime_state_boundary",
    researchspec_targets: [
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/gate-ledger.jsonl",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "protocol_block",
    title: "ResearchSpec Resume Protocol",
    lead: "Reset and resume semantics are preserved, but their runtime state is split across ResearchSpec state, decisions, gates, and artifacts.",
    sections: [
      {
        heading: "Compatibility Import",
        bullets: [
          "Emit any imported ARS Material Passport reset payload as compatibility evidence for runtime registration.",
          "Project its active stage and pending branch information into `researchspec/runs/current/state.yaml`.",
        ],
      },
      {
        heading: "Runtime Ownership",
        bullets: [
          "Use `researchspec/runs/current/decision-ledger.jsonl` for branch selection.",
          "Use `researchspec/runs/current/gate-ledger.jsonl` for stale, unverified, or blocked recovery state.",
        ],
      },
    ],
  },
  "handoff-schema-convention-to-researchspec-contracts": {
    semantic_role: "handoff_projection",
    researchspec_targets: [
      "researchspec/specs/project.md",
      "researchspec/specs/sources.yaml",
      "researchspec/specs/claims.yaml",
      "researchspec/specs/manuscript.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "schema_projection_table",
    title: "ResearchSpec Schema Projection",
    lead: "ARS Markdown schemas describe payloads; ResearchSpec contracts provide stable machine-readable runtime state.",
    sections: [
      {
        heading: "Projection Targets",
        bullets: [
          "Research questions and target venue project to `researchspec/specs/project.md`.",
          "Sources and corpus records project to `researchspec/specs/sources.yaml`.",
          "Claims and support limits project to `researchspec/specs/claims.yaml`.",
          "Draft structure and manuscript constraints project to `researchspec/specs/manuscript.yaml`.",
        ],
      },
      {
        heading: "Artifact Rule",
        bullets: [
          "Keep the original ARS schema payload as a registered artifact in `researchspec/runs/current/artifact-registry.json`.",
        ],
      },
    ],
  },
  "material-passport-schema9-to-researchspec-runtime": {
    semantic_role: "runtime_state_boundary",
    researchspec_targets: [
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Material Passport Projection",
    lead: "Material Passport fields are projected into ResearchSpec runtime records instead of being updated as a monolithic ledger.",
    sections: [
      {
        heading: "Projection Targets",
        bullets: [
          "Stage, mode, and resume state go to `researchspec/runs/current/state.yaml`.",
          "Produced files and hashes go to `researchspec/runs/current/artifact-registry.json`.",
          "Human branch choices go to `researchspec/runs/current/decision-ledger.jsonl`.",
          "Verification outcomes go to `researchspec/runs/current/gate-ledger.jsonl`.",
        ],
      },
    ],
  },
  "schema11-commitments-to-researchspec-change-patches": {
    semantic_role: "review_commitment_tracking",
    researchspec_targets: [
      "researchspec/changes/<change-id>/contract-patch.yaml",
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/decision-ledger.jsonl",
    ],
    replacement_shape: "schema_projection_table",
    title: "ResearchSpec Reviewer Commitment Projection",
    lead: "Reviewer commitments become explicit changes, draft patches, artifacts, and decisions.",
    sections: [
      {
        heading: "Projection Rules",
        bullets: [
          "Scope or claim changes become `researchspec/changes/<change-id>/contract-patch.yaml`.",
          "Manuscript edits become `researchspec/draft-patches/<patch-id>.json`.",
          "Review reports and response matrices are registered in `researchspec/runs/current/artifact-registry.json`.",
          "Strategic choices are recorded in `researchspec/runs/current/decision-ledger.jsonl`.",
        ],
      },
    ],
  },
  "cross-schema-rules-to-researchspec-validator-gates": {
    semantic_role: "gate_policy",
    researchspec_targets: [
      "researchspec/runs/current/gate-ledger.jsonl",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "gate_rule_block",
    title: "ResearchSpec Cross-Contract Gate",
    lead: "Cross-schema freshness and compatibility checks become ResearchSpec validator diagnostics and gate entries.",
    sections: [
      {
        heading: "Gate Inputs",
        bullets: [
          "Read artifact identities and hashes from `researchspec/runs/current/artifact-registry.json`.",
          "Compare declared contract dependencies against the current ResearchSpec specs and state.",
        ],
      },
      {
        heading: "Blocking Conditions",
        bullets: [
          "Return stale, missing, or incompatible dependency findings to the cross-schema gate helper.",
        ],
      },
    ],
  },
  "academic-paper-state-to-researchspec-runtime": {
    semantic_role: "runtime_state_boundary",
    researchspec_targets: [
      "researchspec/specs/workflow.yaml",
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "protocol_block",
    title: "ResearchSpec Paper Runtime",
    lead: "The academic-paper skill reads its active phase and inputs from ResearchSpec runtime state.",
    sections: [
      {
        heading: "Runtime Reads",
        bullets: [
          "Read `researchspec/specs/workflow.yaml` for phase ordering and mode constraints.",
          "Read `researchspec/runs/current/state.yaml` for the active phase and invocation mode.",
          "Resolve upstream research, outline, and draft artifacts through `researchspec/runs/current/artifact-registry.json`.",
        ],
      },
    ],
  },
  "generator-evaluator-contract-to-researchspec-runtime": {
    semantic_role: "generator_evaluator_contract",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "checklist",
    title: "ResearchSpec Generator/Evaluator Contract",
    lead: "Generator/evaluator outputs remain phase artifacts; gate outcomes belong in ResearchSpec ledgers.",
    sections: [
      {
        heading: "Generator Output",
        bullets: [
          "Emit generated contract JSON or draft artifacts for runtime registration.",
          "Treat evaluator feedback as diagnostics tied to those artifacts.",
        ],
      },
      {
        heading: "Evaluator Gate",
        bullets: [
          "Return pass, fail, and blocking findings to the evaluator gate helper.",
        ],
      },
    ],
  },
  "rebuttal-audit-advisory-artifact": {
    semantic_role: "artifact_provenance",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/decision-ledger.jsonl",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Rebuttal Audit Artifact",
    lead: "Standalone rebuttal audits are advisory artifacts until a human accepts a change.",
    sections: [
      {
        heading: "Artifact Rule",
        bullets: [
          "Emit the audit report as an advisory artifact for runtime registration.",
          "Do not mutate claims, manuscript scope, or response strategy without a decision in `researchspec/runs/current/decision-ledger.jsonl`.",
        ],
      },
    ],
  },
  "academic-paper-revision-patch-to-researchspec-draft-patches": {
    semantic_role: "draft_patch_protocol",
    researchspec_targets: [
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/decision-ledger.jsonl",
    ],
    replacement_shape: "patch_protocol_block",
    title: "ResearchSpec Revision Patch Mode",
    lead: "Revision mode emits structured draft patches instead of rewriting the manuscript in place.",
    sections: [
      {
        heading: "Patch Format",
        bullets: [
          "Write manuscript edits to `researchspec/draft-patches/<patch-id>.json`.",
          "Include block ids, old hashes, operation type, replacement text, and reviewer-roadmap traceability.",
        ],
      },
      {
        heading: "Apply Boundary",
        bullets: [
          "Apply only after the required human decision exists in `researchspec/runs/current/decision-ledger.jsonl`.",
        ],
      },
    ],
  },
  "paper-agent-phase-boundary-to-contract-io": {
    semantic_role: "contract_io_boundary",
    researchspec_targets: [
      "researchspec/specs/manuscript.yaml",
      "researchspec/specs/claims.yaml",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/draft-patches/<patch-id>.json",
    ],
    replacement_shape: "io_contract_block",
    title: "ResearchSpec Drafting Contract I/O",
    lead: "Drafting and revision agents operate on explicit ResearchSpec inputs and declared write surfaces.",
    sections: [
      {
        heading: "Contract Inputs",
        bullets: [
          "Read manuscript structure from `researchspec/specs/manuscript.yaml`.",
          "Read allowed claims and evidence limits from `researchspec/specs/claims.yaml`.",
          "Resolve outlines, blueprints, and drafts through `researchspec/runs/current/artifact-registry.json`.",
        ],
      },
      {
        heading: "Writes Allowed",
        bullets: [
          "Initial drafting writes a registered draft artifact.",
          "Revision rounds write `researchspec/draft-patches/<patch-id>.json` unless explicitly escalated to full re-emission.",
        ],
      },
    ],
  },
  "claim-intent-manifest-to-researchspec-claims": {
    semantic_role: "claim_contract_projection",
    researchspec_targets: [
      "researchspec/specs/claims.yaml",
      "researchspec/changes/<change-id>/contract-patch.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Claim Projection",
    lead: "Claim intent is projected into ResearchSpec claim contracts or proposed contract patches.",
    sections: [
      {
        heading: "Claim Writes",
        bullets: [
          "Use `researchspec/specs/claims.yaml` for accepted claim ids, wording constraints, support, and limits.",
          "Use `researchspec/changes/<change-id>/contract-patch.yaml` for high-impact changes to claim scope or strength.",
          "Emit claim-intent manifests as artifacts for runtime registration.",
        ],
      },
    ],
  },
  "draft-writer-patch-emission-to-researchspec-draft-patch": {
    semantic_role: "draft_patch_protocol",
    researchspec_targets: [
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "patch_protocol_block",
    title: "ResearchSpec Patch Emission",
    lead: "When revising, the writer emits patch records and leaves application to deterministic helpers.",
    sections: [
      {
        heading: "Patch Output",
        bullets: [
          "Write `researchspec/draft-patches/<patch-id>.json` with stable patch id, target artifact id, block preconditions, operations, and traceability.",
          "Emit supporting reviewer-roadmap or response artifacts for runtime registration.",
        ],
      },
    ],
  },
  "revision-coach-commitments-to-researchspec-changes": {
    semantic_role: "review_commitment_tracking",
    researchspec_targets: [
      "researchspec/changes/<change-id>/contract-patch.yaml",
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/decision-ledger.jsonl",
    ],
    replacement_shape: "schema_projection_table",
    title: "ResearchSpec Revision Commitment Planning",
    lead: "Revision commitments are separated into contract changes, draft patches, and human decisions.",
    sections: [
      {
        heading: "Commitment Routing",
        bullets: [
          "Research-scope or claim commitments go to `researchspec/changes/<change-id>/contract-patch.yaml`.",
          "Manuscript-text commitments go to `researchspec/draft-patches/<patch-id>.json`.",
          "Tradeoffs and rejected reviewer requests go to `researchspec/runs/current/decision-ledger.jsonl`.",
        ],
      },
    ],
  },
  "literature-corpus-passport-to-researchspec-sources": {
    semantic_role: "source_contract_projection",
    researchspec_targets: [
      "researchspec/specs/sources.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Source Corpus",
    lead: "Literature corpus inputs are owned by ResearchSpec source contracts and registered artifacts.",
    sections: [
      {
        heading: "Source Reads",
        bullets: [
          "Read canonical source ids, citation keys, screening status, and trust metadata from `researchspec/specs/sources.yaml`.",
          "Resolve bibliography reports and literature matrices through `researchspec/runs/current/artifact-registry.json`.",
        ],
      },
    ],
  },
  "revision-patch-protocol-to-researchspec": {
    semantic_role: "draft_patch_protocol",
    researchspec_targets: [
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/gate-ledger.jsonl",
      "researchspec/runs/current/decision-ledger.jsonl",
    ],
    replacement_shape: "patch_protocol_block",
    title: "ResearchSpec Revision Patch Reference",
    lead: "The patch protocol is ResearchSpec-owned: generate patch JSON, verify preconditions, then apply after approval.",
    sections: [
      {
        heading: "Patch Contract",
        bullets: [
          "Store operations in `researchspec/draft-patches/<patch-id>.json`.",
          "Use `researchspec/runs/current/gate-ledger.jsonl` for hash/precondition failures.",
          "Use `researchspec/runs/current/decision-ledger.jsonl` for apply approval and unresolved tradeoffs.",
        ],
      },
    ],
  },
  "reviewer-rereview-schema11-to-researchspec": {
    semantic_role: "review_commitment_tracking",
    researchspec_targets: [
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "checklist",
    title: "ResearchSpec Re-review Traceability",
    lead: "Re-review checks compare commitments against ResearchSpec patch and artifact records.",
    sections: [
      {
        heading: "Verification Inputs",
        bullets: [
          "Read applied or pending patches from `researchspec/draft-patches/<patch-id>.json`.",
          "Resolve revised draft and response artifacts through `researchspec/runs/current/artifact-registry.json`.",
        ],
      },
      {
        heading: "Gate Result",
        bullets: [
          "Return missing, partially satisfied, or contradicted commitments to the re-review gate helper.",
        ],
      },
    ],
  },
  "reviewer-sprint-contract-to-researchspec-artifact": {
    semantic_role: "generator_evaluator_contract",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "checklist",
    title: "ResearchSpec Reviewer Sprint Artifact",
    lead: "Sprint contracts and panel outputs are registered artifacts with gate outcomes.",
    sections: [
      {
        heading: "Artifact Records",
        bullets: [
          "Emit sprint contract JSON, reviewer panel outputs, and lint diagnostics for runtime registration.",
          "Return accept, revise, reject, and blocking outcomes to the review gate helper.",
        ],
      },
    ],
  },
  "reviewer-agent-sprint-phases-to-contract-io": {
    semantic_role: "generator_evaluator_contract",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "io_contract_block",
    title: "ResearchSpec Reviewer Contract I/O",
    lead: "Preserve the paper-blind pre-commitment and paper-visible evaluation split while resolving its contracts and phase artifacts through ResearchSpec.",
    sections: [
      {
        heading: "Contract Inputs",
        bullets: [
          "Resolve manuscript, venue, and prior review context through `researchspec/runs/current/artifact-registry.json`.",
        ],
      },
      {
        heading: "Contract Outputs",
        bullets: [
          "Register review reports, matrices, and diagnostics as artifacts.",
          "Return blocking review findings to the review gate helper.",
        ],
      },
    ],
  },
  "rereview-commitment-verification-to-researchspec": {
    semantic_role: "review_commitment_tracking",
    researchspec_targets: [
      "researchspec/draft-patches/<patch-id>.json",
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "gate_rule_block",
    title: "ResearchSpec Commitment Verification",
    lead: "Commitment verification is a gate over revised draft, response, and patch artifacts.",
    sections: [
      {
        heading: "Gate Inputs",
        bullets: [
          "Read revision patches from `researchspec/draft-patches/<patch-id>.json`.",
          "Resolve response letters and revised drafts via `researchspec/runs/current/artifact-registry.json`.",
        ],
      },
      {
        heading: "Ledger Writes",
        bullets: [
          "Return fulfilled, partially fulfilled, and unresolved findings to the commitment gate helper.",
        ],
      },
    ],
  },
  "sprint-contract-protocol-to-researchspec-artifacts": {
    semantic_role: "generator_evaluator_contract",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Sprint Protocol Artifacts",
    lead: "Sprint baselines and phase outputs are ResearchSpec artifacts; their checks are ResearchSpec gates.",
    sections: [
      {
        heading: "Artifact Projection",
        bullets: [
          "Emit baseline, panel, and consolidated outputs for runtime registration.",
          "Represent failed checks or missing evidence in `researchspec/runs/current/gate-ledger.jsonl`.",
        ],
      },
    ],
  },
  "deep-research-state-to-researchspec-runtime": {
    semantic_role: "runtime_state_boundary",
    researchspec_targets: [
      "researchspec/specs/project.md",
      "researchspec/specs/workflow.yaml",
      "researchspec/runs/current/state.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "protocol_block",
    title: "ResearchSpec Deep Research Runtime",
    lead: "Deep-research consumes project/workflow/state contracts and registers research outputs as artifacts.",
    sections: [
      {
        heading: "Runtime Reads",
        bullets: [
          "Read research intent from `researchspec/specs/project.md`.",
          "Read stage and mode from `researchspec/specs/workflow.yaml` and `researchspec/runs/current/state.yaml`.",
        ],
      },
      {
        heading: "Runtime Writes",
        bullets: [
          "Emit RQ briefs, methodology blueprints, bibliographies, and synthesis outputs for runtime registration.",
        ],
      },
    ],
  },
  "deep-research-phase-boundary-to-contract-io": {
    semantic_role: "contract_io_boundary",
    researchspec_targets: [
      "researchspec/specs/project.md",
      "researchspec/specs/sources.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "io_contract_block",
    title: "ResearchSpec Deep Research Contract I/O",
    lead: "Deep-research phase boundaries become explicit contract input/output rules.",
    sections: [
      {
        heading: "Contract Inputs",
        bullets: [
          "Read project intent from `researchspec/specs/project.md`.",
          "Read existing source corpus from `researchspec/specs/sources.yaml` when present.",
        ],
      },
      {
        heading: "Contract Outputs",
        bullets: [
          "Write phase outputs as artifacts and return them to the runtime for registration.",
        ],
      },
    ],
  },
  "deep-bibliography-corpus-to-researchspec-sources": {
    semantic_role: "source_contract_projection",
    researchspec_targets: [
      "researchspec/specs/sources.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Bibliography Source Contract",
    lead: "Bibliography and corpus records are ResearchSpec source-contract material.",
    sections: [
      {
        heading: "Source Projection",
        bullets: [
          "Use `researchspec/specs/sources.yaml` for source ids, citation keys, inclusion status, and trust-chain metadata.",
          "Emit annotated bibliographies, PRISMA outputs, and literature matrices for runtime registration.",
        ],
      },
    ],
  },
  "deep-synthesis-claims-to-researchspec-claims": {
    semantic_role: "claim_contract_projection",
    researchspec_targets: [
      "researchspec/specs/claims.yaml",
      "researchspec/changes/<change-id>/contract-patch.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Synthesis Claim Contract",
    lead: "Synthesis claim intent is promoted into claim contracts or proposed contract patches.",
    sections: [
      {
        heading: "Claim Projection",
        bullets: [
          "Read accepted claim ids, support strength, evidence links, and limits from `researchspec/specs/claims.yaml`.",
          "Emit `researchspec/changes/<change-id>/contract-patch.yaml` when synthesis proposes a change in research meaning.",
          "Emit the synthesis report as an artifact for runtime registration.",
        ],
      },
    ],
  },
  "deep-timeline-sidecars-to-artifact-registry": {
    semantic_role: "artifact_provenance",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/specs/sources.yaml",
      "researchspec/specs/claims.yaml",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Timeline Artifact Projection",
    lead: "Timeline, citation provenance, and version sidecars are artifacts connected to sources and claims.",
    sections: [
      {
        heading: "Artifact Projection",
        bullets: [
          "Emit timeline and provenance sidecars for runtime registration.",
          "Link source evidence through `researchspec/specs/sources.yaml` and claim relevance through `researchspec/specs/claims.yaml`.",
        ],
      },
    ],
  },
  "compliance-override-to-decision-ledger": {
    semantic_role: "decision_ledger_entry",
    researchspec_targets: [
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "checklist",
    title: "ResearchSpec Compliance Decision",
    lead: "Human compliance overrides are explicit decision-ledger entries supported by registered reports.",
    sections: [
      {
        heading: "Decision Record",
        bullets: [
          "After human confirmation, return override choice and rationale to the runtime for decision-ledger recording.",
          "Emit Schema 12 or compliance reports for runtime registration.",
        ],
      },
    ],
  },
  "ground-truth-isolation-to-researchspec-gates": {
    semantic_role: "gate_policy",
    researchspec_targets: [
      "researchspec/specs/workflow.yaml",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "gate_rule_block",
    title: "ResearchSpec Ground Truth Gate",
    lead: "Data access level and verified-only constraints are workflow and gate policy.",
    sections: [
      {
        heading: "Gate Inputs",
        bullets: [
          "Read allowed data-access level and verified-only constraints from `researchspec/specs/workflow.yaml`.",
        ],
      },
      {
        heading: "Blocking Conditions",
        bullets: [
          "Return unavailable, unverified, or policy-conflicting ground truth to the integrity gate helper.",
        ],
      },
    ],
  },
  "ground-truth-traceability-to-researchspec-provenance": {
    semantic_role: "artifact_provenance",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/specs/sources.yaml",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Ground Truth Provenance",
    lead: "Ground-truth provenance is traceable through registered artifacts and canonical source records.",
    sections: [{
      heading: "Provenance Chain",
      bullets: [
        "Resolve evidence artifacts through `researchspec/runs/current/artifact-registry.json`.",
        "Link source identity and verification metadata through `researchspec/specs/sources.yaml`.",
      ],
    }],
  },
  "deep-report-claims-to-researchspec-claims": {
    semantic_role: "claim_contract_projection",
    researchspec_targets: [
      "researchspec/specs/claims.yaml",
      "researchspec/changes/<change-id>/contract-patch.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Report Claim Intent",
    lead: "The report compiler emits a one-shot claim-intent artifact before prose; accepted claims remain contract-owned.",
    sections: [{
      heading: "Claim Intent",
      bullets: [
        "Read accepted claim constraints from `researchspec/specs/claims.yaml`.",
        "Emit the claim-intent manifest as an artifact before the first report prose block.",
        "Propose new or strengthened claims through `researchspec/changes/<change-id>/contract-patch.yaml`.",
      ],
    }],
  },
  "compliance-report-to-researchspec-gate": {
    semantic_role: "gate_policy",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "gate_rule_block",
    title: "ResearchSpec Compliance Gate",
    lead: "Schema 12 remains a compliance payload; ResearchSpec owns artifact registration and the gate verdict.",
    sections: [{
      heading: "Compliance Output",
      bullets: [
        "Emit the compliance report as an artifact for runtime registration.",
        "Return its pass, warning, or blocking findings to the compliance gate helper.",
      ],
    }],
  },
  "writer-generator-contract-to-researchspec-runtime": {
    semantic_role: "generator_evaluator_contract",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "checklist",
    title: "ResearchSpec Writer Phase Contract",
    lead: "Keep the paper-blind Phase 4a commitment and paper-visible Phase 4b drafting split; resolve their contract and outputs as registered artifacts.",
    sections: [{
      heading: "Phase Records",
      bullets: [
        "Resolve writer contract JSON and prior phase artifacts through `researchspec/runs/current/artifact-registry.json`.",
        "Return lint and failure-condition outcomes to the gate helper for `researchspec/runs/current/gate-ledger.jsonl`.",
      ],
    }],
  },
  "peer-evaluator-contract-to-researchspec-runtime": {
    semantic_role: "generator_evaluator_contract",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "checklist",
    title: "ResearchSpec Evaluator Phase Contract",
    lead: "Keep the paper-blind Phase 6a commitment and paper-visible Phase 6b evaluation split; resolve their contract and outputs as registered artifacts.",
    sections: [{
      heading: "Phase Records",
      bullets: [
        "Resolve evaluator contract JSON and writer commitments through `researchspec/runs/current/artifact-registry.json`.",
        "Return evaluator decisions and blocking findings to the gate helper for `researchspec/runs/current/gate-ledger.jsonl`.",
      ],
    }],
  },
  "literature-consumer-to-researchspec-sources": {
    semantic_role: "source_contract_projection",
    researchspec_targets: [
      "researchspec/specs/sources.yaml",
      "researchspec/runs/current/artifact-registry.json",
    ],
    replacement_shape: "artifact_projection_block",
    title: "ResearchSpec Literature Consumer Contract",
    lead: "Literature consumers read the canonical corpus through ResearchSpec while preserving the upstream no-mutation and fallback rules.",
    sections: [{
      heading: "Corpus Inputs",
      bullets: [
        "Read source ids, citation keys, inclusion state, and trust metadata from `researchspec/specs/sources.yaml`.",
        "Resolve bibliography and screening artifacts through `researchspec/runs/current/artifact-registry.json`.",
      ],
    }],
  },
  "terminal-policy-to-researchspec-decision": {
    semantic_role: "decision_ledger_entry",
    researchspec_targets: [
      "researchspec/specs/workflow.yaml",
      "researchspec/runs/current/decision-ledger.jsonl",
    ],
    replacement_shape: "checklist",
    title: "ResearchSpec Citation Policy Decision",
    lead: "Citation terminal policy is a human-selected workflow decision, not a Material Passport mutation.",
    sections: [{
      heading: "Decision Handling",
      bullets: [
        "Read supported policy choices from `researchspec/specs/workflow.yaml`.",
        "After the scholar selects a policy, return the choice to the runtime for decision-ledger recording.",
      ],
    }],
  },
  "claim-audit-to-researchspec-gate": {
    semantic_role: "gate_policy",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "gate_rule_block",
    title: "ResearchSpec Claim Audit Output",
    lead: "Claim-audit aggregates form one registered audit artifact whose blocking findings are gate-helper inputs.",
    sections: [{
      heading: "Audit Output",
      bullets: [
        "Emit all audit aggregates together as one traceable artifact.",
        "Return HIGH-WARN and other blocking findings to the claim-integrity gate helper.",
      ],
    }],
  },
  "team-handoff-to-researchspec-registry": {
    semantic_role: "handoff_projection",
    researchspec_targets: [
      "researchspec/runs/current/artifact-registry.json",
      "researchspec/runs/current/decision-ledger.jsonl",
      "researchspec/runs/current/gate-ledger.jsonl",
    ],
    replacement_shape: "schema_projection_table",
    title: "ResearchSpec Team Handoff",
    lead: "Team handoffs resolve versioned artifacts and approvals through ResearchSpec records rather than attached Material Passports.",
    sections: [{
      heading: "Handoff Record",
      bullets: [
        "Resolve transferred artifacts through `researchspec/runs/current/artifact-registry.json`.",
        "Return human approvals and gate receipts to their responsible runtime helpers.",
      ],
    }],
  },
} satisfies Record<string, ReplacementTemplateDefinition>;

export function hasReplacementTemplate(templateId: string): boolean {
  return templateId in TEMPLATE_DEFINITIONS;
}

export function getReplacementTemplate(templateId: string): ReplacementTemplateDefinition | undefined {
  return TEMPLATE_DEFINITIONS[templateId as keyof typeof TEMPLATE_DEFINITIONS];
}

export function allReplacementTemplateIds(): string[] {
  return Object.keys(TEMPLATE_DEFINITIONS).sort();
}

export function renderReplacement(anchor: ContractAnchor): string {
  const definition = getReplacementTemplate(anchor.template_id);
  if (!definition) {
    throw new Error(`Missing replacement template: ${anchor.template_id}`);
  }
  return [
    markerStart(anchor.id),
    `### ${definition.title}`,
    "",
    definition.lead,
    "",
    ...[...definition.sections, {
      heading: "Mutation Boundary",
      bullets: mutationBoundaryBullets(definition.researchspec_targets),
    }].filter((section) => section.bullets.length > 0).flatMap((section) => [
      `#### ${section.heading}`,
      "",
      ...section.bullets.map((bullet) => `- ${bullet}`),
      "",
    ]),
    markerEnd(anchor.id),
  ].join("\n").replace(/\n{3,}/g, "\n\n");
}
