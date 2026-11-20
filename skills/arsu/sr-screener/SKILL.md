---
name: sr-screener
description: "Screen study records against confirmed eligibility criteria and trace PRISMA counts to individual decisions. Routes: sr-screener:protocol, sr-screener:quick, sr-screener:pilot, sr-screener:ta-screen, sr-screener:ft-screen, sr-screener:adjudicate, sr-screener:audit, sr-screener:report. Use for: screen these abstracts; screen full texts; resolve screening conflicts; 系统综述文献筛选; 核对排除理由. Near-miss routing: design a search strategy -> deep-research:systematic-review. Before each start, present stable-spec and handoff prerequisites, boundary outputs, formal Gates, risk, cost, and obtain an instance-scoped confirmation."
---

<!-- researchspec-contract-preflight:v11 -->
<!-- researchspec-literature-adapter:zotero-library:v2 -->
## ResearchSpec Contract Preflight

Follow the active procedure packet. In standalone mode, work only with ordinary
project files outside researchspec/, return their paths to the caller, and do not
create or mutate runs, nodes, handoffs, Gates, Decisions, overrides, or transitions.

In graph mode, locate the project researchspec/ workspace and use only the exact
selectors and authority returned by `researchspec status --json` and
`researchspec instructions <selector> --json`. For a new root run, request
`researchspec instructions profile:<profile-id> --json` and present the selected
entry, prerequisites, boundary outputs, formal Gates, Decisions, risk, cost, and
confirmation scope. Start only after the user confirms that exact entry summary.
Nodes and bound child runs declared by the frozen graph inherit that authorization;
every formal Gate and Decision still requires its own confirmation, and
alternate-model review requires separate current consent.

Read only the route-relevant parts of specs/project.md, specs/sources.yaml,
specs/claims.yaml, and specs/manuscript.yaml. Pipeline work also reads the
managed profile projection. After start, treat the owning run.yaml, frozen
graph.yaml, node instance files, and run handoff.md as runtime authority. Do not
reconstruct the frontier from Skill prose; use selectors returned by status and
request directed instructions for the eligible node, Gate, Decision, or pending
child start.

Treat confirmed `specs/manuscript.yaml.delivery` as the source-format contract;
reuse task-local confirmed requirements for ordinary work without a stable commitment.
The first manuscript-writing intake resolves `working_format`; a later change
to a confirmed selection requires a project change. QMD is Markdown-compatible
source: require a `.qmd` boundary path and preserve YAML frontmatter, fenced
code, executable-cell options, citations, cross-references, and other Quarto
metadata as opaque manuscript content during review, annotation, and revision.
Record source and target format IDs on handoff entries; a rendered target also
records `renderer: quarto`.




Produce semantic files at explicit project-relative paths outside
researchspec/, then submit their unique roles, types, purposes, paths, producers
or intended consumers, and relevant limits through the owning CLI action. Do not
register, copy, hash-bind, or assign framework IDs to boundary files.
Only the ResearchSpec CLI may mutate run or node lifecycle state, handoffs,
formal Gates, Decisions, overrides, and transitions.

For a formal Gate, use researchspec-verify to prepare evidence-linked findings,
show the proposed verdict and consequences, and obtain explicit human
confirmation. Record the verdict with "researchspec decide gate:<run>/<gate>".
Complete executable work only with "researchspec advance node:<run>/<node>"
after the eligible Node Card's output and validator requirements are satisfied.
A failed-Gate override requires its own human approval and reason on the owning
Gate; confirmations never complete an execution node.

Optional domain procedures are bounded advisory helpers. Suggest at most three
domains, keep plugin consent separate from graph entry confirmation, preview the exact
domain IDs and resolved procedures, and install only after explicit consent. Activate
a selected procedure with `researchspec instructions procedure:<procedure-id> --json`
after selection, availability, and manifest-hash checks. Decline or failure leaves
the graph selector, active producer, and workflow frontier unchanged.

For literature work, the active ARSU producer may use an installed
Zotero task Skill as a bounded provider after a just-in-time readiness check.
Adapter results remain working evidence and cannot directly modify stable specs,
run or node state, Gates, Decisions, transitions, or handoffs. Private or
library-bound work pauses when readiness fails. Acquisition is candidate-only
without a current bounded authorization, and Curation requires a separate request.

The packaged academic-pipeline/scripts/adapters/zotero.py path is separate: it
reads only a user-supplied Better BibTeX JSON export, requires a user-provided
Python 3.11+ environment with PyYAML, and is not a live Zotero fact source.

This generated block uses profile researchspec-preflight-v11 for
sr-screener and the current file-based protocol:
status -> instructions <selector> -> start/decide/advance -> status.

# Systematic review screening

Use the ResearchSpec `sr-screener` graph profile for governed screening runs. Each route below is backed by its host-neutral procedure; continue with `instructions procedure:<id>` and, for profile runs, the active graph node instructions. Quick triage is standalone and does not schedule a graph node.

Before starting a full run, confirm the scope and estimated effort for protocol, pilot, title/abstract screening, exclusion QC, full-text screening and final reporting, including the human Gates. After protocol approval, the coordinator runs the screening-pilot package tool with `prepare WORK INPUT... --config CONFIG`, binds WORK/records.json as screening_data_identity and gives each pilot seat only its isolated packet. Confirm the batch estimate before dispatch.

- `screening-protocol` (Available in the sr-screener graph profile.) Screening protocol: turn a proposal into ordered eligibility criteria. Produces `screening_protocol`, `screening_config`.
- `screening-quick` (Standalone; does not schedule a graph node.) Single-reviewer triage: screen a few abstracts against my criteria. Produces `triage_table`.
- `screening-pilot` (Available in the sr-screener graph profile.) Pilot calibration: calibrate screening against team labels and seeds. Produces `pilot_report`.
- `screening-ta-screen` (Available in the sr-screener graph profile.) Title and abstract screening: independently screen database exports; 题名摘要双筛. Produces `screening_log`.
- `screening-ft-screen` (Available in the sr-screener graph profile.) Full-text eligibility: assess retrieved reports with page and section evidence. Produces `full_text_decisions`.
- `screening-adjudicate` (Available in the sr-screener graph profile.) Screening conflict adjudication: advise on conflicting eligibility decisions. Produces `adjudication_advice`.
- `screening-audit` (Available in the sr-screener graph profile.) Exclusion audit: recheck near misses and sample jointly excluded studies. Produces `exclusion_audit`.
- `screening-report` (Available in the sr-screener graph profile.) PRISMA report and corpus: reconcile PRISMA counts and export screening results. Produces `prisma_counts`, `literature_corpus`.

ResearchSpec owns workflow state; procedures produce screening artifacts through the run handoff.
