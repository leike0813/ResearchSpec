# Patent absorption semantic review

Reviewed source: commit `5073d3d837a5d139ef2bc763c9dd46bb9605df84`, tree
`d4abb0dd1b7cc8b2f0f131060faad707be63ca96`, all 489 tracked files. The
maintenance decision binds the final authoring, complete package and graph
trees, registry subsets, source decisions and maintained files. Approval here
concerns the reviewed fixed capability distribution; it supplies no runtime
human Gate verdict or legal conclusion.

## This review round

The round repaired output ownership only. `scripts/patent-disclosure-skill-maintenance.mjs`
no longer calls the ARSU profile emitter during `artifacts`, so patent
maintenance can no longer leave `skills/arsu/profiles` half written behind a
stale ARSU conversion manifest. The ARSU conversion projects every authored
profile, patent ones included, and remains their only writer; patent maintenance
reads that projection back and compares it with the authored definitions.

No production byte changed. The eighteen package tree hashes, the seven profile
hashes, the registry subsets, the authoring tree hash and the source audit hash
are identical to the previous binding. Only three maintained files changed: the
maintenance script, its maintenance Skill and `docs/maintainer/patent-disclosure-skill.md`,
all of which are bound again below. Because the generation path changed, this
round re-derived its conclusions from the current packages, profiles and
definitions rather than carrying the previous approval forward.

## What this round checked directly

- Every audited capability ships a package and a registry row; all eighteen do.
- Every `tools/`, `references/` and `scripts/` path named in a patent `SKILL.md`
  resolves inside that package, except the shared configuration paragraph noted
  below.
- Every capability node in the seven patent profiles binds and expects roles its
  capability manifest declares, in `manifest.yaml` and in the `## Inputs` and
  `## Outputs` sections. Node-level `from_role` references name the producing
  node's role rather than a consumed one, and those producers are covered by the
  same check on the producing node.
- Every subgraph a composition binds resolves to an existing profile and entry
  node: `research-main` enters at `research-question`, `academic-paper` at
  `intake`, `patent-docket` at `disclosure`, `patent-intelligence` at `search`.
  `research-main` produces all four roles both compositions expect.
- `MERMAID_LICENSE` and `THREE_LICENSE` sit with the packages that copy the
  corresponding resources, and both packages carry `LICENSE` and `NOTICE.md`.
- Playwright and CadQuery remain unavailable in the shared environment;
  python-docx and pymupdf are present. Browser, CAD and live-service behavior is
  still uncertified.

## Business assessment

| Business | Preserved behavior and reviewed boundary |
| --- | --- |
| Disclosure | Intake, invention mining, prior-art positioning, six-chapter disclosure and read-only review. Invention, utility-model and design paths require their own schemas and figures; protection layout is optional behind a human Decision and a conditional Gate, producing a reviewed 1+N plan. Missing technical facts remain gaps. |
| Application | Claims, specification, abstract, figure planning/composition and Word emission consume actual disclosure files. Required type-specific materials precede drafting; consistency review preserves inputs. |
| Docket | Stable issue IDs, semantic dispositions and one bounded versioned revision. The CLI owns formal rounds, Gates and Decisions. The three-round budget is displayed guidance. Accepted outputs are explicitly rebound through CLI handoff before another round; extra cases are separate confirmed tasks. |
| Search | Bibliographic and derived-query search plus explicitly selected feature coverage. Query and evidence limits accompany actual results; service availability is not assumed. |
| Reader | PDF text/figure extraction, type-specific reading, claim features and paragraph evidence. Optional selected-vault projection retains notes, Canvas, Bases and glossary files; the requested vault and write scope govern delivery. |
| Claim chart | Claim/feature evidence, strength distinctions, local intake and XLSX delivery. Missing features or paragraphs receive bounded semantic completion against selected source material, without claiming another graph node completed. |
| Map | Interactive local presentation over a frozen selected notes corpus. IPC and model inputs are explicitly configured; caches are corpus-scoped. The local-model reader does not download or mutate weights, and the server binds loopback. |
| Office action | Defect mapping, evidence-bound response draft, Word and Excel delivery, and read-only review. A portable local history helper ingests explicitly redacted versioned cases, retrieves them without providers, and scores relative strategy support. Confirmed historical gold cases are distinct from an authorization probability. |
| Examination policy | Source hierarchy, publication and effective dates, current versus future rules, and an ordinary policy brief. Its `policy_request` input is optional at the graph node, so the brief can be produced from the policy sources alone. Package changes are concrete source suggestions for maintenance, not autonomous installed-package writes. |

## Compositions and control

`research-to-patent` runs the `research-main` subgraph first, then a patent
intake node that joins the technical materials with the research report,
synthesis and graded sources into a case index, and only then enters the
`patent-docket` subgraph. A literature synthesis is therefore never presented as
an invention, and prior-art analysis still runs inside the docket.

`patent-informed-paper` starts at a human source-scope Gate, runs the research
and intelligence children in one all-join, then feeds the bridge's real Markdown
bibliography and synthesis to the existing `academic-paper` writing child. Both
bridge inputs and both subgraph outputs were re-checked against the shipped
manifests. Academic citations and grading remain present; patent-derived
assertions keep their source type, locations and evidence limitations.

All eighteen stages are fixed registry members, with seven authored profiles.
Navigate remains the single base host entry. No patent-specific workflow engine
branch, new public command, plugin-domain membership or model-service
integration was added.

## Observation on a shared configuration paragraph

Every patent package projects one shared configuration paragraph that reads, in
substance, that the index tool and the golden-case tool use only the standard
library. `tools/oa_history.py` ships only in `generation-patent-oa-response`.
In the other seventeen packages the sentence therefore names a tool that is not
there.

This does not change the executable contract. Each package states in the same
file that its `## Tools` section is the executable surface and that any script
name absent from it is not an available tool, and the re-check above confirms
that only `generation-patent-oa-response` lists `oa_history.py` in `## Tools`,
matching the package that actually contains it. It is recorded here as a wording
observation about one shared authored paragraph, not as a behavior finding, so a
future wording pass can tighten the sentence without changing this binding.

## Provenance and execution limits

The source audit accounts for every tracked file, actual source hashes, authored
derivation, resource adaptations and external prerequisites. Binary resources
are copied as bytes. Root MIT attribution and the full Mermaid and Three.js
notices accompany applicable distributed resources.

The earlier absorption round ran the copied-tree runtime tests, the graph
scenarios and the full suite; this round changed no production byte, so those
results still describe the current output. The full suite, package verification
and all-target projection matrix are re-run for this change as a whole and are
not re-claimed here.

Playwright and CadQuery are absent. Browser and CAD dependent rendering, live
CNIPA access, configured vector layouts and visual interaction in Obsidian or the
browser remain uncertified. No dependency was installed and no model, credential
setup or external service was invoked. The Procedures report missing
prerequisites as incomplete delivery rather than successful rendering.
