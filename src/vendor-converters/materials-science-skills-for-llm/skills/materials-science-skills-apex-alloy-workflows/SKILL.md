---
name: materials-science-skills-apex-alloy-workflows
description: Plan, operate, and interpret reviewed APEX alloy relaxation and property workflows through a user-configured local or remote runtime. Use for APEX input review, submission, monitoring, retrieval, reporting, and evidence-backed property analysis.
license: MIT
compatibility: Requires a user-configured APEX runtime and any selected simulation, remote, or scheduler backend.
metadata:
  vendor: materials-science-skills-for-llm
  vendor-release: snapshot-fafd3ab
---

# APEX Alloy Property Workflows

## Purpose and scope

Prepare and review relaxation and alloy-property workflows, operate an explicitly
configured APEX environment, and interpret complete results. The Skill does not
install APEX, choose credentials, configure a site, retrieve potentials, or
grant authority to submit, stop, retry, delete, archive, or replace remote work.

## Inputs and prerequisites

Require the scientific property question, structure and provenance, units,
accuracy target, potential or calculator, relaxation/property parameter files,
configured `apex` version, backend and machine profile, work directory, compute
budget, and completion evidence. Ask the user when a property definition,
calculator, backend, cost, database write, or remote state choice is unresolved.

## Workflow

1. Define the property question, material structure, accuracy target, execution boundary, and completion evidence before preparing APEX inputs.
2. Inventory the structure, potential/calculator, parameter and global files,
   backend, machine profile, paths, expected tasks, and outputs. Validate local
   existence and provenance without reading credentials.
3. Design and validate relaxation and property stages. Agent procedure: design and validate the alloy property workflow before execution.
4. Read this reference when selecting or reviewing a concrete APEX property parameter block: [references/property-parameters.md](references/property-parameters.md).
5. Validate the candidate JSON against the installed APEX version and local
   help. Present the exact action, target, cost, affected paths, and expected
   evidence. Representative commands are:

```bash
apex --version
apex submit param_joint.json -c global.json
apex list
apex getsteps -i JOB_ID
apex retrieve -i JOB_ID -w WORKDIR
apex report -w WORKDIR
```

6. Use the user-configured apex CLI only for the reviewed submit, inspect, retrieve, report, or control action. Obtain fresh confirmation for submission,
   retry, resume, stop, terminate, delete, remote retrieval, database archive,
   or replacement of existing files.
7. Check every task status, structure/calculator provenance, units, convergence,
   result completeness, and failure record before scientific interpretation.
8. Agent procedure: assess convergence, provenance, property definitions, uncertainty, and scientific meaning.

## Hard constraints

- The user owns the APEX runtime, backend, account, credentials, machine profile, compute budget, and every remote state change.
- Do not embed endpoints, images, credentials, private paths, scheduler secrets,
  or database configuration in Skill artifacts.
- Do not submit, retry, resume, cancel, delete, retrieve, archive, or overwrite
  without reviewing that exact operation and obtaining required confirmation.
- Do not treat task completion as scientific validity; validate definitions,
  convergence, units, and calculator applicability.
- ResearchSpec conversion and installation never execute APEX or contact a
  backend.

## Responsibilities

The Agent chooses the scientific design, validates input meaning, requests
confirmation, reviews failures, and interprets results. APEX performs only the
reviewed external action; its backend does not decide scientific suitability.

Return a reviewed property plan, input inventory, validation criteria, and interpretation record.
Stop when the structure, potential, property definition, or completion evidence is insufficient.
Return evidence-linked property results with limitations and failed or incomplete tasks marked.
Do not conclude when required tasks failed, units conflict, or convergence is unverified.

## Outputs and completion

Return property scope, reviewed inputs, exact commands, authority and
confirmation records, task/result inventory, convergence checks, values with
units, provenance, uncertainty, limitations, and failed/incomplete work.
Completion requires complete task evidence and a result that is scientifically
interpretable under the stated calculator and parameter assumptions.

## Failure handling

If apex or its backend is unavailable, preserve the plan and report the missing configuration without installing, retrying, or switching providers. If a task
fails, retain its first relevant error and ask whether to repair or rerun. If
retrieved artifacts are incomplete or mismatched, stop interpretation. Never
silently resubmit or weaken validation.

## Examples

Happy path: validate elastic-property parameters for a relaxed alloy, present a
single confirmed submission, retrieve completed tasks, check units and
convergence, and report the tensor with limitations.

Near miss: a user supplies a fixed remote endpoint but no approved machine
profile or cost boundary. Prepare the input review, but do not submit or persist
the endpoint.
