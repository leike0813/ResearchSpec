# AGENTS.md

## Project Mission

ResearchSpec is becoming the agent-neutral, spec-driven framework layer for
Academic Research Skills Universal (ARSU).

The project is no longer a generic ultra-light research contract initializer.
Its primary job is to absorb ARSU, maintain ARSU-derived skill artifacts inside
this repository, and provide the contract layer that lets those skills work
through stable files instead of platform-specific runtime assumptions.

Current external reference paths:

- ResearchSpec project: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec`
- ARS converter input pinned in ResearchSpec: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/ars`
- ARSU project to be absorbed: `/home/joshua/Workspace/Code/Skill/academic-research-skills-universal`
- ARS upstream checkout inside ARSU: `/home/joshua/Workspace/Code/Skill/academic-research-skills-universal/vendor/ars`
- ToolUniverse vendor converter source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/tooluniverse`
- Scientific Agent Skills vendor converter source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/scientific-agent-skills`
- Materials-Science-Skills-For-LLM audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/materials-science-skills-for-llm`
- FinRobot audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/finrobot`
- HistAgent audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/histagent`
- Revision-Master vendor converter source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/revision-master`
- Revision-Master audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/audits/revision-master/snapshot-13e69610`
- Education Agent Skills working checkout: `/home/joshua/Workspace/Code/Skill/education-agent-skills`
- Education Agent Skills audit source: `/home/joshua/Workspace/Code/JavaScript/ResearchSpec/vendor/education-agent-skills`

When paths or ownership change, update this file in the same change so future
agents do not follow stale locations.

Wayfinder planning maps and decision tickets use GitHub Issues for this repo;
follow `.agents/skills/setup-matt-pocock-skills/issue-tracker-github.md`.

## Product Direction

ResearchSpec should become:

- an OpenSpec-style framework for academic paper writing workflows;
- an agent-neutral host for ARSU-derived skills;
- a spec-driven contract system for research intent, sources, claims,
  manuscripts, workflow state, gates, decisions, artifacts, and patches;
- a converter/maintenance layer for ARSU outputs after ARSU is absorbed.

ResearchSpec should not become:

- an LLM API integration layer;
- a platform-specific Claude Code or Codex adapter;
- a web app, database-first research platform, or citation manager replacement;
- a hand-maintained copy of generated ARSU artifacts when converter rules should
  own the output.

The optional interactive manuscript review workspace is a local static surface
over frozen `review-workspace.v2` documents. An Agent captures the relevant
source set outside `researchspec/` and prepares one static selectable document;
the browser keeps drafts in browser-local state and exports advisory
`review-workspace-result.v2` snapshots. It never rerenders changed source,
relocates annotations, installs host tools, or owns manuscript, SQLite, handoff,
Gate, Decision, node, or other ResearchSpec workflow mutations. The retained
`review-workspace/v1.html` page and the v1 contract keep existing v1 drafts and
results on their original path; v1 and v2 are never mixed. Browser failure falls
back to the same review in Agent dialogue.

review-response additionally offers the independent
`revision-master-review-workspace.v1` workbench at
`review-workspace/revision-master.html`, delivered with its package-local
`workbench/` read-only projection, receipt DDL, and write guidance. It carries
four handoffs: coverage mapping, whole workboard, current strategy, and round
revision/response, and exports `revision-master-review-result.v1`. Internal
confirmation is explicit and scoped to coverage, the whole board, or the current
strategy; a round seen marker is separate. The Agent validates each returned
result against its retained snapshot and per-scope dependencies, applies
accepted feedback through package-local semantic writes, and commits the
successful processing receipt with that semantic write in one task transaction.
Preparation and inspection stay read-only, and formal Gate verdicts and Decision
choices remain separate human confirmations in Agent dialogue.

Files remain the interface. Tool adapters may render and write files, but should
not call agent APIs or depend on a specific model.

The maintainer-only dogfooding harness checks init projection across all
registered targets and all three delivery modes without model calls. Its natural
behavior suite runs on one selected host; the result does not certify other
hosts' behavior. It may launch a separately configured host Agent through Orca
to draft evidence-bound acceptance reports. Those reports are advisory. Only
a human review record can establish formal behavior acceptance;
the local review service may write that record but never ResearchSpec workflow
state or sealed attempt evidence. Its `dogfood-audit` project Skill is not an
installed research-entry Skill. Campaign records live in the ignored project
directory `.dogfood/campaigns/`; harness commands use that fixed location.

## Canonical User Usage Model

`docs/user/usage-model.md` is the canonical source for how users enter,
confirm, run, resume, verify, and finish ARSU work. Product, architecture, CLI,
schema, Skill, converter, and workflow changes must preserve that model or update
it through an explicit OpenSpec change before implementation.

The locked direction is:

- `researchspec init` prepares a schema `"2"` graph workspace and preset
  profiles; it does not start academic work.
- User-Agent dialogue starts from a natural research task and discovers suitable
  capabilities without requiring internal names. Ordinary work may remain
  standalone across sessions. Formal Gates or Decisions, parallel/join work,
  revision rounds, or auditable workflow state require a graph; persistence or
  continuation alone does not. An unfinished related run takes precedence over
  standalone continuation; a completed historical run does not.
- Navigate's main Agent maintains plain notes at
  `work/researchspec-notes/<task-id>.md` for sustained ordinary work, after
  validating any delegated output. Notes record the goal, inputs and outputs,
  completed work and evidence limits, open questions, next step, and any
  related run.
  They are informal files outside `researchspec/`: they are not registered in
  the installation manifest, scanned by `status` or `check`, exposed through a
  CLI selector, or accepted as proof of run, node, or Gate completion. Resume
  ordinary work by checking the note against current materials and outputs,
  never by note modification order. Ask one focused question only when
  candidate tasks or changed materials leave task identity, inputs, or the
  next step unresolved; report other differences and continue. Resume an
  unfinished related run through `status --json` and exact node instructions.
- Stable specs hold confirmed scope, claims, limitations, and delivery
  requirements. Candidate questions, provisional positions, and draft outlines
  remain in ordinary working files. Promoting or changing a commitment uses
  the existing project change lifecycle.
- Starting a run requires a user-confirmed profile entry summary with
  prerequisites, boundary outputs, formal Gates, and cost. Nodes authorized by
  the frozen graph do not require per-node starts; each formal Gate and Decision
  still requires its own confirmation.
- ResearchSpec CLI is the only workflow-state mutation authority. Each run's
  `run.yaml`, frozen `graph.yaml`, and per-node instance files are runtime
  authority; capability Skills produce semantic files outside `researchspec/`
  and describe exchange in the run `handoff.md`.
- Legal node/control and handoff mutations persist newly satisfied run completion
  and affected ancestor completion in the same write plan as the owning record.
  Reuse graph completion evaluation; inspection stays read-only and parent
  subgraph node state stays derived.
- Capability graph profiles own nodes, parallel/join policy, Gates, Decisions,
  revision-round templates, and subgraph bindings. Do not hard-code any research
  graph in core.
- Capability manifests own required input roles and allowed source policies (a
  source or explicit non-empty source list). Graph admission and consumption use
  the shared manifest contract; input bindings choose one allowed source and
  explicit producer-role mappings. Instructions and advance share role resolution;
  only consumption checks external material readability. Optional unbound roles
  are allowed; every supplied binding must resolve, including the applicable round.
- Boundary deliverables are ordinary project files outside `researchspec/`;
  ResearchSpec does not register, hash-bind, copy, or lifecycle-manage them.
- Every formal Gate requires human confirmation. Failed-Gate overrides and
  branch choices are recorded only in the owning node instance. Ordinary
  exploration belongs in working material.
- Alternate-model review uses only a host-native subagent after separate
  confirmation of model, content category, and cost for the current run/node.
  Run confirmation does not grant this consent, child nodes and revision rounds
  ask again, and ResearchSpec never stores model consent or configures/calls a
  model service.

The fixed base user-visible Agent surface is exactly one Skill:
`researchspec-navigate`. Its generated `references/cli-handbook.md` and
`references/arsu-routes.md` provide progressive CLI and ARSU route detail from
their canonical renderers. ARSU Skills, the other three Companion workflows, the
47 bundled core capabilities, and all registered plugin extensions are hidden
Procedures discovered from their existing registries and loaded on demand with
`list procedures`, `show procedure:<id>`, and
`instructions procedure:<id>`. The Procedure catalog is runtime-derived and is
not another persisted registry. The optional `zotero-library` Adapter adds seven
literature Skills when selected (`zotero-library-agent`,
`zotero-library-query`, `zotero-literature-acquisition`,
`zotero-literature-analysis`, `zotero-research-synthesis`,
`zotero-library-curation`, `zotero-bridge-cli`). In `skills` mode, Skill-capable
tools receive Navigate. In `commands` mode, command-capable tools receive one
Navigate wrapper while Skill-only tools receive the Navigate Skill fallback. In
`both` mode they receive both supported entry forms. Codex writes project `.agents/skills` and never generates global
custom prompts; Kimi writes `.kimi-code/skills` and reads `.kimi` only for migration.
`windsurf` remains an input alias for `devin`.
The tool catalog also owns project research-entry metadata. Reviewed native
rules use manifest-owned dedicated files or fixed regions in shared files;
unreviewed targets retain explicit Navigate discovery. Region hashes cover only
the owned bytes, while whole-file transaction preconditions protect surrounding
user content. Entry installation does not certify live host invocation or grant
workflow, model, plugin, Adapter, or external-service consent.
Optional ResearchSpec-maintained domains select extension Procedures and graph
profiles without projecting their raw or extension Skills into the host catalog.

The 24 registered class-A hosts with project-local native custom-agent support
also receive exactly two managed non-entry profiles: `researchspec-executor`
for eligible pure-LLM producers and `researchspec-reviewer` for eligible
pure-LLM checkers or observers. Activation packet schema `"1"` carries the
advisory recommendation; `mixed`, `script`, outputless reference and
coordinator Procedures stay in Navigate. Workers execute one packet, never
mutate ResearchSpec state or ask the user, and return a fixed brief for parent
validation. Navigate alone serializes CLI mutations. Profiles do not pin a
vendor model; unknown, non-inherited or alternate effective models retain the
existing per-run/node model, content-category and cost consent boundary.

`src/literature-adapters/catalog.ts` is the installation SSOT for the optional
`zotero-library` Adapter, while `config.yaml.literature_adapters.selected` is the
workspace selection SSOT. Project runtime and profile files live only under
`.zotero-bridge/`; status and checks are static and never execute binaries or
contact Zotero. The Adapter requires Zotero with the `zotero-agents` plugin, but
ResearchSpec never probes or installs either prerequisite. Bundle, CLI, and Skill versions are component-local identities:
never compare their patch versions with one another or reject an update merely
because those patch versions differ. Admission follows the fixed release-set,
protocol/schema, build fingerprint, command checksum and reviewed hashes. The
seven runner files and seven output schemas are opaque runtime metadata:
conversion, delivery, status, checking and packaging preserve their bytes but
never execute or interpret them.

The public CLI has sixteen top-level commands: `init`, `update`, `status`,
`instructions`, `start`, `advance`, `check`, `list`, `show`, `handoff`, `pack`,
`propose`, `decide`, `archive`, `doctor`, and `plugin`. New workspaces use only
the current schema `"2"` contract. Old or unknown workspaces are reported and
left unchanged; ResearchSpec provides no compatibility reader, migration,
rollback, or semantic repair. The runtime protocol is
`status -> instructions <selector> -> start/decide/advance -> status`.
Command wrappers are adapters, not separate product capabilities. Do not add a
new public command or Companion merely to expose a low-level transaction.

Domain plugins are stable user installation units assembled from project-maintained vendor Skills,
not third-party runtimes. Vendor and domain are separate many-to-many layers: vendor converters own upstream version, provenance, adaptation, and hard Skill dependencies; domains own fixed reviewed Skill lists. They may assist semantic work but must not own or
directly modify stable specs, graph runs, node state, handoffs, Gates,
Decisions, or transitions. ResearchSpec distributes static reviewed
content and never executes plugin scripts or installs their dependencies.

At runtime, Navigate and the active producer may discover optional domain
assistance from compact Procedure cards. Suggest at most three domains
in one batch, keep plugin consent separate from root-run confirmation, preview the
exact install, and require explicit domain IDs plus `--yes` for non-interactive
execution. Activate a selected extension with
`instructions procedure:<procedure-id>` only after selection, availability, and
manifest-hash checks. The plugin Procedure is a bounded advisory helper whose result
returns to the original ARSU producer. Decline or failure must leave the core
selector, producer, frontier, and workflow authority unchanged.

Discipline domains use ANZSRC 2020 Fields of Research Group as their only
classification standard; Field is audit metadata and never automatic membership.
ResearchSpec also owns exactly five coarse tool domains documented in
`docs/developer/domain-taxonomy.md`. The internal catalog pre-creates all 213 discipline
domains and five tool domains, but empty domains remain hidden from ordinary user
discovery and installation. A selected domain that becomes empty is unavailable
recovery state until it is safely uninstalled or repopulated.

`vendor/tooluniverse` is the maintainer-only pinned input for the ToolUniverse
vendor converter. Production admission is controlled by the v1.5.4 audit and
converter policies: 130 reviewed research Skills are generated into an isolated
vendor bundle and assigned by the source-neutral catalog to 28 ANZSRC Group
domains and two non-empty tool domains. The complete 185-Skill audit excludes
55 surfaces, including three business candidates awaiting separate admission.
Reviewed tool-contract adaptations live in
`src/vendor-converters/tooluniverse/semantic-adaptations.ts`; unchanged Skills
retain their audited source release and revision so incremental regeneration
preserves their bytes. Neither the source
checkout nor generated admission authorizes dependency installation, script
execution, credential setup, MCP configuration, or workflow writes.

All 130 reviewed ToolUniverse Skills also project one-to-one into the new
plugin extension mode as `plugin-tooluniverse-*` capabilities and profiles.
`scripts/generate-tooluniverse-extensions.mjs` is the deterministic generator:
it preserves each reviewed `SKILL.md` body, copies all 348 non-standard
resources at their original relative paths as SHA-256 knowledge refs, and binds
every package to `validate_tooluniverse_brief.py` with the six generic evidence
fields. Packages with `.py` resources are `execution_type: mixed`; the rest are
`execution_type: llm`. The 30 ToolUniverse domain assignments are derived from
the source-neutral domain catalog. ResearchSpec never imports or executes
packaged scripts and never installs their dependencies.

`audits/tooluniverse/catalog.json` is the ToolUniverse extension maintenance
SSOT. `scripts/tooluniverse-maintenance.mjs` and
`.agents/skills/tooluniverse-maintenance/SKILL.md` provide catalog-driven
`artifacts / records / baseline / check / diff` anchors and the Agent semantic
review gate; `artifacts` regenerates the 130 packages first. The current anchor
is `v1.5.4-8ec5d4b` under `audits/tooluniverse/v1.5.4-8ec5d4b/`. Future updates must follow the
maintenance Skill before regenerating any `plugin-tooluniverse-*` package or
profile.

`vendor/scientific-agent-skills` is the maintainer-only pinned input for the
Scientific Agent Skills v2.70.0 converter. Its immutable audit covers all 167
upstream Skills. The complete production policies admit 56 reviewed,
vendor-prefixed Skills and exclude 111 for authority, redistribution, ARSU or
ToolUniverse overlap, manual security, domain fit, or content-review reasons.
The generated bundle contributes to 24 ANZSRC Group domains and all five tool
domains. The 42-item manual security catalog is a production SSOT: 41 Skills
are clear, 39 of them only with their approved adaptations, and
`dhdna-profiler` remains a confirmed failure. Do not execute bundled scripts,
install dependencies, handle Skill credentials, infer approval from upstream
security labels, or bypass the checked-in admission, manual-review,
dependency, resource, and
source-neutral domain decisions. External model or service use must remain
provider-neutral, use the target Agent's user-approved configuration, and
never expose or persist secrets through ResearchSpec.

All reviewed Scientific Agent Skills also project one-to-one into the new
plugin extension mode as `plugin-scientific-agent-skills-*` capabilities and
profiles. `scripts/generate-scientific-agent-skills-extensions.mjs` is the
deterministic generator: it preserves each reviewed `SKILL.md` body, copies all
632 reviewed non-standard resources at their original relative paths as
byte-level SHA-256 knowledge refs under MIT, and binds every package to
`validate_scientific_brief.py` with the six generic evidence fields. Packages
with `.py` resources are `execution_type: mixed` (33) and the rest are
`execution_type: llm` (23). The 29 Scientific Agent Skills domain assignments
(24 ANZSRC Group and five tool domains) are derived from the source-neutral
domain catalog. Knowledge-ref verification is
byte-level so reviewed binary example assets (png/gif) project and verify
correctly; text hashes are unchanged. ResearchSpec never imports or executes
packaged scripts, installs dependencies, or configures credentials.

`audits/scientific-agent-skills/catalog.json` is the Scientific Agent Skills
extension maintenance SSOT. `scripts/scientific-agent-skills-maintenance.mjs`
and `.agents/skills/scientific-agent-skills-maintenance/SKILL.md` provide
catalog-driven `artifacts / records / baseline / check / diff` anchors and the
Agent semantic review gate; `artifacts` regenerates every reviewed package
first. The current anchor is `v2.70.0` under
`audits/scientific-agent-skills/v2.70.0/`. Future updates must follow the
maintenance Skill before regenerating any `plugin-scientific-agent-skills-*`
package or profile.

`vendor/materials-science-skills-for-llm` is the maintainer-only pinned input
for the `snapshot-fafd3ab` audit and converter of all 12 upstream Skills. The
complete production policies admit seven curated, vendor-prefixed Skills and
exclude five for maintenance scope, private tooling, overlap, or privileged
platform authority. Converter version 2 publishes seven complete
ResearchSpec-authored non-native Skill trees bound to aggregate SHA-256
`c45bafc4be7e4fa540cc119cbaa81cec8f0e453d60fc9f2efd0124d8ec717e3e`.
Atomsk is a Tier 1 external-tool Skill without references; APEX, DeePTB, DP-GEN,
GPUMD, Phonopy, and Uni-Mol are Tier 2 trees with exactly one substantial,
conditionally read reference each. All ordinary paths and hard constraints live
in `SKILL.md`. The 24-item source catalog, typed capability definitions,
fourteen external-resource decisions, seven-item relationship catalog,
per-Skill derivation, and hash-bound review decision are production SSOTs.
Generated Skills contribute to `materials-engineering`,
`macromolecular-and-materials-chemistry`, and
`computational-modeling-and-simulation`; GPU, remote-service, and HPC use alone
does not create infrastructure-domain membership. Do not execute upstream
commands, install dependencies, configure credentials, retrieve resources,
access external services, compile software, or run scheduler/HPC work. Do not
bypass the checked-in admission, relationship, source-file, resource,
capability, derivation, review, license, or source-neutral domain decisions.

The seven reviewed Materials-Science Skills also project one-to-one into the
new plugin extension mode under `skills/plugins/extensions/` as
`plugin-materials-*` packages. All seven are `execution_type: llm`
instruction-led packages with `validate_materials_brief.py` evidence
validators; six copy their reviewed reference as a hash-bound knowledge ref and
Atomsk has none. Domain assignments mirror the raw-Skill membership.
ResearchSpec static commands and the validators never invoke APEX, Atomsk,
DeePTB, DP-GEN, GPUMD, Phonopy, or Uni-Mol.

`audits/materials-science-skills-for-llm/catalog.json` is the Materials-Science
extension maintenance SSOT. `scripts/materials-science-skills-for-llm-maintenance.mjs`
and `.agents/skills/materials-science-skills-for-llm-maintenance/SKILL.md`
provide catalog-driven `artifacts / records / baseline / check / diff` anchors
and the Agent semantic review gate. The current anchor is `snapshot-fafd3ab`
under `audits/materials-science-skills-for-llm/snapshot-fafd3ab/`. Future
updates must follow the maintenance Skill before regenerating any
`plugin-materials-*` package or profile.

`vendor/finrobot` is the maintainer-only pinned input for the
`snapshot-2717499` audit and converter. FinRobot has no first-party upstream
`SKILL.md`; its immutable audit covers all 1,049 tracked Git entries, 129
source-bound knowledge surfaces, eight origins, seven license claims, and six
candidates. Production policies admit six neutral `financial-research-*` Skills
from nineteen reviewed source files. The 39 admitted surfaces map exactly once to
complete ResearchSpec-authored Agent procedures or deterministic Python 3.11
standard-library entrypoints; no upstream FinRobot runtime file or provider
helper is distributed.
FinNLP, AutoGen-attributed content, 56 third-party Skill copies with four
fixtures, unredistributable datasets, unclear filing/marker trees, and hard
FinRobot aggregate dependencies remain excluded. All generated Skills carry
Apache-2.0 licensing, immutable derivation metadata, empty hard Skill
dependencies, and advisory-only relationships. They contribute to
`banking-finance-and-investment`; statement analysis and company fundamentals
also contribute to `accounting-auditing-and-accountability`.

FinRobot safety is form safety, not business-capability removal. ResearchSpec
conversion, checking, packaging, installation, discovery, and update never
import or execute generated resources, install dependencies, initialize clients,
read credentials, or contact services. When explicitly invoked by the target
Agent, the Skills may use user-authorized browser, filing, market-data, local
corpus, and execution tools
and may produce calculations, forecasts, probabilities, sentiment, valuation,
targets, ratings, recommendations, and conclusions. Never embed actual secrets,
private endpoints, private datasets, local user paths, or unknown-origin content
in published files, and do not bypass the checked-in admission, source, surface,
origin, license, resource, relationship, derivation, and review decisions.

FinRobot converter version 2 binds the approved aggregate tree hash
`1a101495abecacbc702a8ce8fd3b376631b88e9cc45de3d9a216d6aaedb3a4c6`.
Company fundamentals, event evidence, relative valuation, and statement analysis
are Tier 3 script-assisted Skills with a copied `lib/financial_support.py`;
competitive position and corporate risk are Tier 1 Agent procedures. The
current trees contain no references because no supporting material meets the
progressive-disclosure threshold. Do not reintroduce AgentSpec, dependency
manifests, provider contracts/adapters, generic runners, product metadata, or
unconsumed auxiliary resources.

The six reviewed FinRobot Skills also project one-to-one into the new plugin
extension mode under `skills/plugins/extensions/`: four mixed capabilities
(`plugin-financial-company-fundamentals`,
`plugin-financial-event-evidence`,
`plugin-financial-relative-valuation`,
`plugin-financial-statement-analysis`) copy reviewed entrypoints and
`financial_support.py` into `tools/` as hash-bound knowledge refs and declare
`validate_financial_brief.py` evidence validators; two llm capabilities
(`plugin-financial-competitive-position`, `plugin-financial-corporate-risk`)
use the output-role policy only. The two finance domain assignments mirror the
raw-Skill domain membership. Static commands never execute extension tools or
validators; only `advance` runs the declared `python3` validator.

`audits/finrobot/catalog.json` is the FinRobot extension maintenance SSOT.
`scripts/finrobot-maintenance.mjs` and
`.agents/skills/finrobot-maintenance/SKILL.md` provide catalog-driven
`artifacts / records / baseline / check / diff` anchors and the Agent semantic
review gate. The current anchor is `snapshot-2717499` under
`audits/finrobot/snapshot-2717499/`. Future FinRobot extension updates must
follow the maintenance Skill before regenerating any `plugin-financial-*`
package or profile.

`vendor/histagent` is the maintainer-only pinned input for the
`snapshot-47bbe21` audit and converter of all 120 tracked files. The approved
production bundle contains three self-contained executable Skills:
`histagent-historical-research`,
`histagent-historical-source-identification`, and
`histagent-historical-source-analysis`. All have empty hard Skill dependencies
and advisory-only relationships. Historical studies receives all three;
heritage, archive and museum studies receives source identification and source
analysis; no tool domain receives a HistAgent Skill. The converter binds the
archived audit, complete 21-surface capability map, five attributed-source
records, and approved aggregate tree hash
`c44f136b6945868ddde7871b5f5ecd7bfb8ac09f84f080f46fbd37f9e173dbd3`.

The three reviewed HistAgent Skills also project one-to-one into the new plugin
extension mode under `skills/plugins/extensions/`:
`plugin-historical-research`,
`plugin-historical-source-analysis`, and
`plugin-historical-source-identification`. All three are mixed packages that
copy the reviewed entrypoint, `historical_support.py`, and both conditionally
read references into hash-bound knowledge paths and declare
`validate_historical_brief.py` evidence validators. The Skill-local research
Gate remains a package tool and never gains ResearchSpec workflow authority.
Domain assignments mirror the raw-Skill membership.

`audits/histagent/catalog.json` is the HistAgent extension maintenance SSOT.
`scripts/histagent-maintenance.mjs` and
`.agents/skills/histagent-maintenance/SKILL.md` provide catalog-driven
`artifacts / records / baseline / check / diff` anchors and the Agent semantic
review gate. The current anchor is `snapshot-47bbe21` under
`audits/histagent/snapshot-47bbe21/`. Future HistAgent extension updates must
follow the maintenance Skill before regenerating any `plugin-historical-*`
package or profile.

HistAgent must not publish thin provider wrappers. Every generated Skill is a
complete eight-file authored tree whose `SKILL.md` contains the ordinary runtime
path and all hard constraints. Each claimed capability maps to a concrete
bundled script, bundled resource, or user-configured external tool. Source
identification and source analysis are script-assisted; historical research
uses Skill-local JSON state and gates without becoming ResearchSpec workflow
authority. Production bytes must remain identical to the approved trees.

HistAgent capability preservation does not authorize implementation copying.
Do not copy or expose `scripts/cookies.py`, telemetry defaults, tracked bytecode,
unresolved `browser_use` content, unverified figures, or fixed provider
credentials. The AutoGen/Magentic-One attribution scope includes
`scripts/agent_web_browser.py`, `scripts/image_web_browser.py`,
`scripts/mdconvert.py`, `scripts/reformulator.py`, and
`scripts/text_web_browser.py`. Implementation reuse requires exact per-file
MIT-source verification and notice preservation; unresolved content requires
implementation-equivalent replacement. HistBench, GAIA,
and HLE datasets, runners, scoring, combination, and judgment remain audit-only.
Historical-source outputs must distinguish raw observation or OCR,
normalized transcription, emendation, translation, and interpretation, with no
unmarked completion. Explicit Skill invocation permits configured providers and
task materials only under target-Agent and host policy. Conversion, checking,
idempotence, packaging, installation, discovery, update, and registry assembly
never import or execute HistAgent code, install dependencies, read credentials,
start browsers, contact services, or upload material.

`vendor/education-agent-skills` is the maintainer-only pinned input for the
`snapshot-32fce5c` audit at commit
`32fce5c0d097ec675cf81c750a65a379e4d87e3c` and tree
`3223d79299ae10391c22549debef7ffc9ef7a0e2`. Its immutable audit covers all
238 tracked files and all 165 upstream Skills. The checked-in JSON is the audit
SSOT; its Markdown report is derived deterministically and normal audit checking
is offline. Upstream README, registry, domain, tag, evidence-strength, and
relationship claims are observations only and never production authority.

The pinned root has no tracked license text. README and plugin CC BY-SA 4.0
claims, plus the subtree-scoped `mcp-server/LICENSE`, do not prove Skill-level
redistribution rights or embedded framework provenance. All 165 Skills therefore
remain excluded by the immutable audit even where their content fit would
otherwise be a candidate or defer. The ResearchSpec-owned
`evidence-map.json` is bound to immutable audit SHA-256
`e9326c43078db4c6bce4387c5a41a5bef775ad4d1691095c2020ef9cb9926857`
and maps all 872 declarations to 719 normalized works: 293 verified, 410
unresolved, zero conflicting, and 16 not applicable. Twenty explicit
multi-version declarations use composite mappings. Its
`evidence-report.md` is derived deterministically, and
`education-agent-skills:evidence:check` is offline and read-only.

The supplementary Google Scholar discovery round targeted the 428 works that
were initially unresolved. Scholar returned candidates for 18 works and no
result for 11 before an HTTP 429 challenge blocked the remaining 399 intended
lookups across the canonical and regional Scholar hosts. Seventeen returned
candidates were independently confirmed through reliable destinations; one
mismatched candidate remained unresolved. Scholar result pages are discovery
metadata only and never verification sources.

Evidence verification proves bibliographic existence and identity only.
`claim_support_reviewed` remains false for every work; effect sizes, support
scope, interpretation, and misattribution are not upgraded by a verified
publication record. Original frameworks and unpublished practice methods remain
non-publication evidence rather than verified works. All `chains_well_with`
declarations remain prospective advisory relationships and never hard
dependencies.

Do not execute or install the upstream installer, MCP server, tests, scripts, or
dependencies; do not configure credentials, contact hosted services, upload
learner material, or grant learner-data access. Student-facing tutoring, minor
analytics, wellbeing or motivation diagnosis, and original frameworks require
explicit review. The `ingest-education-agent-skills` change consumes the
immutable audit and evidence map through a 165-item admission catalog, an
872-item evidence adaptation catalog, and an 813-item advisory relationship
catalog. Its approved production set admits 136 Gareth Manning Skills under
CC BY-SA 4.0 and excludes 19 original-framework Skills plus ten Sean Hu Skills
whose redistribution authority is not established. The generated trees preserve
student-facing capabilities with reviewed safety boundaries and contributes
only to `curriculum-and-pedagogy`, `education-systems`, and
`specialist-studies-in-education`.

The approved production tree is bound to aggregate SHA-256
`c4fc2f93a7553a1c02538d15491ed108afd36ad4a4a291ca4db3bad39e74775d`
and publishes the sixth vendor with 136 static Skill trees, empty hard
dependencies, complete CC BY-SA 4.0 licenses and notices, and membership only in
the three reviewed education domains. Production checking and idempotence must
fail on any source, audit, evidence, policy, license, generated-tree, domain, or
registry drift. Education Agent Skills add no public CLI command or workflow
authority.

All 136 reviewed Education Agent Skills also project one-to-one into the new
plugin extension mode as `plugin-education-agent-skills-*` capabilities and
profiles. `scripts/generate-education-agent-skills-extensions.mjs` is the
deterministic generator: each package is a static `execution_type: llm` tree
with `knowledge_refs: []`, the reviewed `SKILL.md` body and
`researchspec-education-boundary` block preserved, and the shared
`validate_education_brief.py` six-field evidence validator. Domain assignments
mirror the three reviewed education domains.

`audits/education-agent-skills/catalog.json` is the Education Agent Skills
extension maintenance SSOT. `scripts/education-agent-skills-maintenance.mjs`
and `.agents/skills/education-agent-skills-maintenance/SKILL.md` provide
catalog-driven `artifacts / records / baseline / check / diff` anchors and the
Agent semantic review gate; `artifacts` regenerates the 136 packages. The
current anchor is `snapshot-32fce5c` under
`audits/education-agent-skills/snapshot-32fce5c/`. Future updates must follow
the maintenance Skill before regenerating any
`plugin-education-agent-skills-*` package or profile.

Six-vendor maintenance must keep converters isolated: each converter stages
against all published vendors but emits and commits only its own bundle, while a
source-neutral domain catalog and central assembler own the published registry.

Shared maintenance file identities hash original bytes, including binary resources;
UTF-8 decoding belongs only to text parsing. Mechanical maintenance helpers are
shared across vendors while admission, licensing and semantic-review policy remain
vendor-owned. Refresh affected current maintenance records through the maintenance
Skill and preserve immutable audits and unchanged reviewed production bytes.

`vendor/revision-master` is the maintainer-only pinned input for the
revision-master capability absorption. The immutable audit at
`audits/revision-master/snapshot-13e69610/` remains historical provenance and
covers all 48 tracked blob files under `skills/revision-master/` at upstream
commit `13e69610f216f816f106d1a2a1672eedfa01ac9a`. The new absorption path
uses `authoring/revision-master/extraction-index.json` and authors five
capability packages (`design-review-response-intake`,
`analysis-review-response-manuscript-analysis`,
`transform-review-response-comment-atomization`,
`design-review-response-workboard-planning`,
`generation-review-response-round`). The `review-response` graph profile
owns stage order, the five human Gates, and the continue/complete revision
Decision. The upstream Python SQLite runtime and template assets remain
package-local tools and never own ResearchSpec workflow authority. The upstream
repository root has no `LICENSE` file and the `skills/revision-master` subtree
has no per-skill `LICENSE` or copyright notice; the only attribution is the git
commit author `Joshua Reed (leike0813)`, the same principal as ResearchSpec
contributors. Authoring is offline and never executes upstream Python or
installs PyYAML/Jinja2. Vendor root licensing does not replace an evidenced
Skill-level content license.

`audits/own-vendors/catalog.json` is the unified maintenance catalog for
user-owned upstream vendors (currently `paper-humanizer` and
`revision-master`). `scripts/own-vendor-maintenance.mjs` and
`.agents/skills/own-vendor-maintenance/SKILL.md` provide catalog-driven
`artifacts / records / baseline / check / diff` anchors and the Agent semantic
review gate. A future owned vendor is added through its extraction index,
authoring sources, package script, and one additive catalog entry.

Non-native upstream projects such as HistAgent, FinRobot, and
Materials-Science-Skills-For-LLM follow
`docs/maintainer/non-native-vendor-skill-standard.md`. Its templates are authoring
scaffolds, not converter prose fragments or a runtime protocol. `references/`
is optional and contains only substantial context-saving detail; the only copy
of an execution-critical workflow, constraint, authority boundary, output rule,
or failure rule belongs in `SKILL.md`. ResearchSpec does not currently consume a
generic `runner.json`, `RUNTIME.json`, input/output schema, or fixed stdout
envelope. Do not add those files merely to normalize a Skill. Scripts and domain
schemas are allowed only when the Skill actually uses and documents them.

## ARSU Relationship

ARSU is a skill package and converter project. ResearchSpec is the framework
layer that should eventually own it.

The ARS maintenance target is `v3.22.2` at
`7de1c9dfb7af9c02a9b57750761323f35a743aa2`; its audit lives under
`audits/arsu/v3.22.2-7de1c9d/`. Follow `.agents/skills/arsu-maintenance/SKILL.md`
for incremental extraction, conversion and semantic review. ResearchSpec owns
the current revision-patch contract; upstream revision authorization and
role-scoped reviewer criteria are adapted without importing upstream passport,
model-transport or optional workflow-ledger authority. Audit generators render
observations; command success and semantic fitness require actual verification
recorded in `05-semantic-review.md`.
The academic-paper preset binds intake configuration to drafting and abstract
nodes through their optional `writing_configuration` role. Output-language pair
and abstract cardinality travel as ordinary configuration material; omission
uses the declared default, and conflicting supplied declarations stop visibly.

The seven deterministic ARS checker packages use ResearchSpec-authored
report computations and read-only recomputation validators under
`src/arsu-converter/authoring/checkers/`. Executable validator sources must be
explicit; extraction text is provenance, not an executable submission contract.
The runtime passes graph-resolved input materials through the shared input
consumer. Validating a report never clears its scientific findings or replaces
a human Gate. See `docs/user/deterministic-checkers.md` for invocation and scope.

When working on this repository, treat ARSU as the main capability payload:

- `deep-research`
- `academic-paper`
- `academic-paper-reviewer`
- `academic-pipeline`
- optional future ARSU skill groups, if deliberately adopted

The important integration point is the contract design. ResearchSpec contracts
use their own current contracts rather than raw ARS/ARSU contracts, and ARSU
skills must be adapted to consume the ResearchSpec contracts once this project
absorbs them.

Do not bolt ARSU onto the old generic contract model as an afterthought. The
contract model is the core coupling between ResearchSpec and ARSU.

## Current-State Policy

Do not enforce current-state-only cleanup on ARSU-derived content by default.

The upstream ARS project intentionally contains a large amount of version,
history, changelog, migration, and issue-related text. ARSU deliberately accepts
that upstream design because automatically converting thousands of such markers
into a perfectly current-only runtime is brittle and high cost.

Rules:

- Respect upstream ARS/ARSU runtime content unless a task explicitly asks for a
  specific rewrite.
- Do not fail conversion or validation merely because ARSU-derived files contain
  version markers, changelog sections, historical notes, issue references, or
  upstream schema-version language.
- It is acceptable to record those markers as diagnostics or risk findings.
- Do not spend effort on broad semantic cleanup of upstream history text unless
  the user explicitly scopes that work.
- ResearchSpec-authored framework contracts and instructions should still avoid
  stale history and describe the current intended behavior.

## Contract Architecture Direction

The contract layer should be designed carefully before broad ARSU rewrites.
Prefer a typed file-contract model: human-readable Markdown where useful,
machine-checkable YAML/JSON/JSONL where downstream skills or gates depend on
stable fields.

Current workspace layout:

```text
researchspec/
  config.yaml
  tool-installation-manifest.json

  profiles/
    academic-pipeline.yaml

  specs/
    project.md
    sources.yaml
    claims.yaml
    manuscript.yaml

  changes/
    <change-id>/
      change.md
      design.md        # optional
      tasks.md         # optional
      delta.yaml       # optional

  runs/
    <run-id>/
      run.yaml
      graph.yaml
      handoff.md
      nodes/
        <node-instance>.yaml
```

Boundary deliverables live outside `researchspec/`. Generated profiles and Agent
tool projections are manifest-owned static content; stable specs, run records,
node records, handoffs, and changes are not generated projections.

## Contract Design Principles

### 1. Separate Contracts From Artifacts

Contracts describe research intent, constraints, state, and accepted decisions.
Artifacts are drafts, reports, reviews, integrity checks, synthesis outputs,
figures, tables, and generated files.

Do not make a draft or review report the source of truth for research intent.
Keep boundary deliverables outside `researchspec/` and reference them from the
owning run handoff by role, safe project-relative path, purpose, producer,
and intended consumer.

### 2. Make Claims First-Class

Claims must have stable IDs, support, strength, limits, and wording constraints.
Writing and review skills should refer to claim IDs instead of inferring allowed
claims from prose.

High-impact changes to claim scope, strength, contribution, or causal language
require a proposed contract change and human decision.

### 3. Make Human Decisions First-Class

Human decisions are part of the owning node instance or project change, not chat
residue.

Changing research questions, target output, contribution scope, manuscript
structure, review-response strategy, or accepted limitations must be represented
in the relevant graph Decision or proposed project change.

### 4. Keep Workflow State Separate From Research Specs

The ARSU pipeline stage graph belongs to the ARSU skill pack. ResearchSpec core
provides a generic graph runtime and must not hard-code one paper pipeline. The
converter-owned profile registry is projected under `profiles/`.

### 5. Gate Progress, Do Not Invent Semantics

Gate logic should check the frozen graph, owning node, blockers, required handoff roles,
schema validity, and pending decisions. It should not replace LLM or human
academic judgment.

LLMs produce semantic payloads and writing. Scripts validate, render, and apply
deterministic single-owner mutations.

### 6. Prefer Proposed Changes For High-Impact Updates

Follow the OpenSpec pattern: current specs are the truth; proposed changes live
separately until accepted.

Do not silently edit stable specs for high-impact changes. Create a reviewable
project change. Accepting a change does not apply it; the specs must be edited
explicitly and validated before the change becomes `applied`.

## ARSU Mapping Guidance

Use this as the default mapping when designing the integration:

- ARSU RQ Brief -> `specs/project.md` plus the producing run handoff when an
  external brief is retained
- ARSU Bibliography / literature corpus -> `specs/sources.yaml`
- ARSU Synthesis Report -> external boundary file in a handoff; accepted claims
  go to `specs/claims.yaml`, with a project change when meaning changes materially
- ARSU Paper Draft -> external boundary file plus `specs/manuscript.yaml`
- ARSU Integrity Report -> external handoff output plus a human-confirmed Gate
  attempt in the owning node instance
- ARSU Review Report / Revision Roadmap -> external handoff outputs plus a
  project change when stable research meaning changes
- ARSU Response to Reviewers -> external handoff output plus owning-node
  Gate/Decision records where formally required
- ARSU Material Passport -> ordinary external input only; it is not imported as
  ResearchSpec authority
- ARSU Revision Patch -> the ARSU `revision_patch` contract and optional
  stateless helper; there is no ResearchSpec patch lifecycle

## Skill And Converter Rules

When absorbing or maintaining ARSU:

1. Prefer converter-owned outputs over hand-edited generated files.
2. Keep independent skill-group boundaries clear.
3. Do not reintroduce Claude Code, Codex, or other platform runtime assumptions
   into universal ResearchSpec contracts.
4. Preserve upstream ARS content unless a deliberate ResearchSpec normalization
   rule is being implemented.
5. If a deterministic script can validate or render a contract, do not ask the
   LLM to hand-build the authoritative machine artifact.
6. If a semantic decision is required, do not hide it in a script or converter
   rule.

## Engineering Rules

Keep the implementation pragmatic and repo-local.

Prefer:

- TypeScript for the ResearchSpec CLI/framework;
- converter-generated skill artifacts;
- Markdown for human-facing guidance;
- YAML/JSON/JSONL for machine-facing contracts and ledgers;
- explicit schemas and small validators where downstream skills depend on
  stable structure;
- minimal dependencies.

Avoid unless clearly justified:

- runtime LLM dependencies;
- hidden global state;
- platform-specific skill behavior in core contracts;
- broad semantic cleanup of ARSU upstream content;
- large infrastructure before the contract model is stable.

## File Writing Rules

Do not overwrite user content by default.

Managed installation targets must be validated against scope, owner, source
namespace and the existing tool/catalog destinations before reading ownership
hashes or planning cleanup. Invalid existing manifests block projection
mutations; missing manifests are a separate state. Generated write plans carry
program-derived trusted roots and recheck every descendant path component before
mutation, including temporary files, backups and rollback. Descendant symlinks
are blocking even when they point inside the root; the trusted project root
itself may resolve through a symlink. Hash equality never authorizes a path
outside its managed namespace, and force does not bypass these boundaries.

Plugin selection, projections and ownership must share one write plan, with the
manifest last. Config and manifest read snapshots remain preconditions even when
their planned content is unchanged. Reuse the existing executor's path safety
and caught-error rollback; this does not provide cross-file crash atomicity or
cross-process locking.

For generated skill files:

- safe to create if missing;
- skip or report drift if modified unless `--force` or an explicit regeneration
  workflow is used;
- include generated markers where appropriate.

For research contract files:

- create during init or migration;
- do not overwrite during update;
- only overwrite with explicit `--force` or accepted contract patches.

## Agent Behavior When Editing This Repository

When implementing features:

1. First determine whether the change affects ResearchSpec core contracts,
   ARSU conversion, ARSU-derived skill content, or tool adapters.
2. If the change affects contracts, design DTO/schema/interface boundaries
   before implementation.
3. Preserve ARSU upstream content unless the task explicitly asks for
   ResearchSpec normalization.
4. Keep human review in the loop for high-impact research changes.
5. Keep adapters simple and file-based.
6. Add tests around generated file trees, schema validation, drift detection,
   contract patch behavior, and ARSU mapping rules when those surfaces change.
7. Do not introduce runtime LLM dependencies.

## Definition of Done

A change is acceptable when:

- it supports the new ARSU-serving ResearchSpec direction;
- it keeps contract and artifact boundaries clear;
- it preserves agent-neutral behavior;
- it avoids unrequested current-only cleanup of ARSU-derived content;
- it works through files and explicit schemas rather than hidden state;
- it keeps human decisions explicit for high-impact research changes;
- it improves the ability to absorb, maintain, or run ARSU-derived skills through
  ResearchSpec contracts.

## User-Model Acceptance

Treat the packaged CLI and installed Agent surface as the acceptance boundary for
the canonical user model.

- Exercise authoritative workflow mutations through a fresh packaged CLI
  process. Test harnesses may create producer files only at explicit external
  paths returned by instructions; they must not edit controls, Gates, Decisions,
  transitions, generated profiles, or hidden indexes directly.
- Static generated projection writes preserve manifest ownership and drift
  protection. Runtime authority writes use the owning file's current bytes as
  their precondition and do not create a public plan hash or receipt.
- Test stable user-observable journeys and structured contracts. Do not require
  exact documentation headings, archived change identifiers, prose wording,
  diagram labels, source-code layout, or field order unless one is an explicit
  public contract.
- A failing journey must be repaired in its owning implementation. Do not weaken
  the user model or add a test-only authority bypass to make acceptance pass.
