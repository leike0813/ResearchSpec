import type {
  NonNativeSkillCapability,
  NonNativeVendorSkillDefinition,
} from "../shared/non-native-skill-standard/index.js";

export type MaterialsSkillTier = 1 | 2;

export interface MaterialsSkillDefinition extends NonNativeVendorSkillDefinition {
  title: string;
  tier: MaterialsSkillTier;
  upstreamSkillId: string;
  domainIds: string[];
  hardDependencies: [];
}

const distribution = {
  licensePath: "LICENSE",
  noticePath: "NOTICE.md",
  provenancePath: "DERIVATION.json",
} as const;

const procedure = (
  id: string,
  procedureAnchor: string,
  outputAnchor: string,
  failureAnchor: string,
): NonNativeSkillCapability => ({
  id,
  implementation: { kind: "agent-procedure", procedureAnchor, outputAnchor, failureAnchor },
});

const externalTool = (
  id: string,
  toolName: string,
  usageAnchor: string,
  authorityAnchor: string,
  failureAnchor: string,
): NonNativeSkillCapability => ({
  id,
  implementation: { kind: "external-tool", toolName, usageAnchor, authorityAnchor, failureAnchor },
});

const computational = ["computational-modeling-and-simulation"];
const materials = ["materials-engineering", ...computational];
const materialsChemistry = ["macromolecular-and-materials-chemistry", ...computational];
const phonopyDomains = ["materials-engineering", "macromolecular-and-materials-chemistry", ...computational];

export const MATERIALS_SKILL_DEFINITIONS: Record<string, MaterialsSkillDefinition> = {
  "materials-science-skills-apex-alloy-workflows": {
    skillId: "materials-science-skills-apex-alloy-workflows",
    title: "APEX Alloy Property Workflows",
    tier: 2,
    upstreamSkillId: "apex-alloy-workflows",
    domainIds: materials,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Define the property question, material structure, accuracy target, execution boundary, and completion evidence before preparing APEX inputs.",
    capabilities: [
      procedure("apex-plan-property-workflow", "Agent procedure: design and validate the alloy property workflow before execution.", "Return a reviewed property plan, input inventory, validation criteria, and interpretation record.", "Stop when the structure, potential, property definition, or completion evidence is insufficient."),
      externalTool("apex-operate-workflow", "apex", "Use the user-configured apex CLI only for the reviewed submit, inspect, retrieve, report, or control action.", "The user owns the APEX runtime, backend, account, credentials, machine profile, compute budget, and every remote state change.", "If apex or its backend is unavailable, preserve the plan and report the missing configuration without installing, retrying, or switching providers."),
      procedure("apex-interpret-results", "Agent procedure: assess convergence, provenance, property definitions, uncertainty, and scientific meaning.", "Return evidence-linked property results with limitations and failed or incomplete tasks marked.", "Do not conclude when required tasks failed, units conflict, or convergence is unverified."),
    ],
    references: [{
      path: "references/property-parameters.md",
      readWhen: "Read this reference when selecting or reviewing a concrete APEX property parameter block",
    }],
    scripts: [],
    resources: [],
    distribution,
  },
  "materials-science-skills-atomsk-cli": {
    skillId: "materials-science-skills-atomsk-cli",
    title: "Atomsk Structure Operations",
    tier: 1,
    upstreamSkillId: "atomsk-cli",
    domainIds: materials,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Define the input structure, coordinate convention, units, target structure, transformation order, and output path before constructing a command.",
    capabilities: [
      procedure("atomsk-design-operation", "Agent procedure: translate the requested structure change into an ordered, reviewable Atomsk operation.", "Return the exact command, read/write paths, assumptions, and structural validation checklist.", "Stop when crystallographic conventions, species mapping, units, or transformation order are ambiguous."),
      externalTool("atomsk-execute-operation", "atomsk", "Use the user-preinstalled atomsk executable only after the exact command and file effects have been reviewed.", "The user owns the Atomsk installation and local files; an existing path may be replaced only after explicit confirmation.", "If atomsk is unavailable or rejects an option, inspect local version help and revise the command without installing software or guessing syntax."),
      procedure("atomsk-validate-structure", "Agent procedure: validate atom count, species, cell vectors, orientation, periodicity, coordinates, and target format after execution.", "Return the validation evidence and identify every intentional structural change.", "Treat unexplained atom loss, cell change, overlap, or format mismatch as failure."),
    ],
    references: [],
    scripts: [],
    resources: [],
    distribution,
  },
  "materials-science-skills-deeptb-helper": {
    skillId: "materials-science-skills-deeptb-helper",
    title: "DeePTB Dataset And Model Workflows",
    tier: 2,
    upstreamSkillId: "deeptb-helper",
    domainIds: materials,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Define the target property, model family, dataset provenance, split policy, species coverage, units, compute boundary, and acceptance metrics before preparing DeePTB configuration.",
    capabilities: [
      procedure("deeptb-prepare-workflow", "Agent procedure: review dataset suitability and construct a version-matched DeePTB configuration and evaluation plan.", "Return a dataset/configuration review, command plan, metric definitions, and acceptance criteria.", "Stop when labels, units, splits, species coverage, model target, or provenance cannot be established."),
      externalTool("deeptb-run-workflow", "dptb", "Use the user-configured dptb CLI only for reviewed config, bond, train, and run operations.", "The user owns the DeePTB environment, datasets, checkpoints, devices, compute budget, and output directories.", "If dptb, a dataset, or a compatible checkpoint is unavailable, report the missing prerequisite and do not install, download, or start training."),
      procedure("deeptb-evaluate-results", "Agent procedure: evaluate training behavior, held-out metrics, physical plausibility, applicability, and uncertainty.", "Return a model assessment that separates observed metrics from scientific interpretation.", "Do not accept a model from training loss alone or when evaluation leakage, unit mismatch, or applicability gaps remain."),
    ],
    references: [{
      path: "references/dataset-and-configuration.md",
      readWhen: "Read this reference when mapping a dataset into a DeePTB configuration or checking labels, splits, units, and species coverage",
    }],
    scripts: [],
    resources: [],
    distribution,
  },
  "materials-science-skills-dpgen-workflow": {
    skillId: "materials-science-skills-dpgen-workflow",
    title: "DP-GEN Concurrent Learning Workflows",
    tier: 2,
    upstreamSkillId: "dpgen-workflow",
    domainIds: materials,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Define the material system, thermodynamic region, initial data, model ensemble, labeling method, uncertainty policy, and stopping criteria before preparing a DP-GEN iteration.",
    capabilities: [
      procedure("dpgen-design-loop", "Agent procedure: design the concurrent-learning loop and decide the evidence required to advance each stage.", "Return iteration scope, parameter and machine plans, uncertainty thresholds, labeling criteria, and stopping rules.", "Stop when data provenance, exploration domain, labeling fidelity, or convergence criteria are undefined."),
      externalTool("dpgen-run-loop", "dpgen", "Use the user-configured dpgen CLI only for an explicitly reviewed init, run, autotest, simplify, or collect operation.", "The user owns DP-GEN, training and labeling runtimes, scheduler configuration, credentials, compute budget, and every submitted job.", "If a stage or backend fails, preserve its artifacts and logs and ask whether to repair or rerun; never resubmit automatically."),
      procedure("dpgen-review-iteration", "Agent procedure: review model deviation, selected configurations, label quality, coverage, and convergence before proposing another iteration.", "Return a stage ledger, accepted/rejected structures, evidence gaps, and advance/stop recommendation.", "Do not advance when uncertainty, labeling errors, data leakage, or unexplored regions invalidate the iteration."),
    ],
    references: [{
      path: "references/parameter-and-machine-files.md",
      readWhen: "Read this reference when authoring or reviewing DP-GEN parameter and machine files for a concrete stage",
    }],
    scripts: [],
    resources: [],
    distribution,
  },
  "materials-science-skills-gpumd-workflow": {
    skillId: "materials-science-skills-gpumd-workflow",
    title: "GPUMD And NEP Workflows",
    tier: 2,
    upstreamSkillId: "gpumd-workflow",
    domainIds: materials,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Choose MD simulation, NEP training, or result analysis and define the scientific objective, structures, units, potential or dataset, GPU boundary, and acceptance criteria before preparing files.",
    capabilities: [
      procedure("gpumd-prepare-workflow", "Agent procedure: validate structures, run settings, potential applicability, datasets, sampling, and validation criteria.", "Return a reviewed input plan, command, output inventory, and scientific checks.", "Stop when units, atom types, potential scope, dataset splits, ensemble, or stability criteria are unresolved."),
      externalTool("gpumd-run-md", "gpumd", "Use the user-compiled gpumd executable only for a reviewed directory containing model.xyz and run.in.", "The user owns the executable, CUDA environment, GPU allocation, input data, compute cost, and output directory.", "If gpumd is unavailable or unstable, retain logs and inputs and diagnose the first error without compiling, changing drivers, or automatically retrying."),
      externalTool("gpumd-run-nep", "nep", "Use the user-compiled nep executable only for a reviewed directory containing nep.in and train.xyz with an optional test.xyz.", "The user owns the executable, datasets, GPU allocation, checkpoints, compute budget, and every training run.", "If nep training fails or diverges, preserve loss and checkpoint evidence and ask before changing data, hyperparameters, or restarting."),
      procedure("gpumd-interpret-results", "Agent procedure: assess conservation, equilibration, sampling, stability, loss behavior, test performance, and output completeness.", "Return evidence-linked results, uncertainty, applicability limits, and follow-up checks.", "Do not report converged dynamics or a valid potential from incomplete, unstable, or unvalidated output."),
    ],
    references: [{
      path: "references/md-nep-and-output-playbook.md",
      readWhen: "Read this reference after selecting MD, NEP training, or output analysis and needing mode-specific file and command detail",
    }],
    scripts: [],
    resources: [],
    distribution,
  },
  "materials-science-skills-phonopy-workflows": {
    skillId: "materials-science-skills-phonopy-workflows",
    title: "Phonopy Finite-Displacement Workflows",
    tier: 2,
    upstreamSkillId: "phonopy-workflows",
    domainIds: phonopyDomains,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Define the relaxed structure, force calculator, target observables, units, symmetry tolerance, supercell convergence plan, and non-analytical-correction need before generating displacements.",
    capabilities: [
      procedure("phonopy-design-calculation", "Agent procedure: choose and justify displacement, supercell, symmetry, path, mesh, and convergence settings.", "Return the calculation design, force-job inventory, validation plan, and expected Phonopy artifacts.", "Stop when the structure, calculator consistency, units, convergence plan, or observable definition is insufficient."),
      externalTool("phonopy-process-workflow", "phonopy", "Use the user-preinstalled phonopy CLI only for reviewed displacement generation, force assembly, force constants, bands, DOS, or thermal-property processing.", "The user owns the Phonopy installation and local files; generated or replaced files require disclosed paths and overwrite confirmation.", "If phonopy or an interface command is unavailable, inspect local version help and preserve existing artifacts without installing or guessing flags."),
      externalTool("phonopy-calculate-forces", "user-configured DFT or ALM force calculator", "Use the selected user-configured DFT or ALM force calculator only for the reviewed displaced-structure job set.", "The user owns the calculator, licenses, credentials, remote or scheduler environment, compute budget, and submitted jobs.", "If any force job fails or atom ordering differs, stop assembly and repair the incomplete force set without automatic resubmission."),
      procedure("phonopy-interpret-results", "Agent procedure: assess imaginary modes, acoustic sum rules, convergence, path conventions, NAC, and physical limitations.", "Return provenance-linked phonon, DOS, thermal, and stability conclusions with uncertainty.", "Do not interpret imaginary modes or thermal results before checking numerical, structural, and convergence causes."),
    ],
    references: [{
      path: "references/configuration-and-force-files.md",
      readWhen: "Read this reference when composing Phonopy configuration tags or checking displaced-force file handoff",
    }],
    scripts: [],
    resources: [],
    distribution,
  },
  "materials-science-skills-unimol-ops": {
    skillId: "materials-science-skills-unimol-ops",
    title: "Local Uni-Mol Workflows",
    tier: 2,
    upstreamSkillId: "unimol-ops",
    domainIds: materialsChemistry,
    hardDependencies: [],
    extensions: [],
    firstActionAnchor: "Choose representation extraction, property inference, or user-managed training and define the model, task, molecular inputs, units, provenance, device, output path, and acceptance criteria before execution.",
    capabilities: [
      procedure("unimol-prepare-workflow", "Agent procedure: verify model-task compatibility, data schema, conformers, units, preprocessing, applicability, and evaluation design.", "Return a reviewed mode, resource inventory, command plan, output contract, and scientific checks.", "Stop when model provenance, license, task metadata, input schema, units, or applicability cannot be established."),
      externalTool("unimol-run-local", "user-configured Uni-Mol, unicore-train, or torchrun entrypoint", "Use the user-configured Uni-Mol, unicore-train, or torchrun entrypoint only for the selected reviewed local mode.", "The user owns the runtime, model files, molecular data, GPU allocation, checkpoints, compute budget, and output directory.", "If the entrypoint, model, or data is unavailable or incompatible, report the missing prerequisite without installing, downloading, pulling images, or contacting a remote endpoint."),
      procedure("unimol-interpret-results", "Agent procedure: assess prediction meaning, uncertainty, applicability domain, representation use, evaluation leakage, and downstream limitations.", "Return raw-output provenance and a separate scientific interpretation with limitations.", "Do not treat an embedding or prediction as validated when task compatibility, units, uncertainty, or held-out evaluation is missing."),
    ],
    references: [{
      path: "references/local-workflow-modes.md",
      readWhen: "Read this reference after selecting representation, inference, or training mode and needing mode-specific local command and data detail",
    }],
    scripts: [],
    resources: [],
    distribution,
  },
};

export const MATERIALS_SKILL_IDS = Object.keys(MATERIALS_SKILL_DEFINITIONS).sort(compareText);

export function materialsSkillDefinition(skillId: string): MaterialsSkillDefinition {
  const definition = MATERIALS_SKILL_DEFINITIONS[skillId];
  if (!definition) throw new Error(`Unknown Materials Skill definition: ${skillId}`);
  return definition;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}
