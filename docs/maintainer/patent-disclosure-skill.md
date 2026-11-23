# Patent fixed capability maintenance

The third-party source is pinned at commit
`91e3b43a3e6b568c627bc83ffcb73ff453bf0304`, tree
`b2ffa8dfca682ae9535c6e43c68cabe7ebf9e3d2`. The root Skill reports 5.2.1.
The `snapshot-91e3b43a` source audit accounts for all 540 tracked files.

The nine businesses become eighteen stages maintained in the ordinary capability
registry. Seven graph profiles are authored in
`src/arsu-converter/workflow/graph-profiles/patent.ts`; the ARSU conversion
projects them together with the academic profiles and owns
`skills/arsu/profiles` plus the entries that describe it in the ARSU conversion
manifest. Patent maintenance reads that projection back and compares it with
the authored definitions, so profile repair means editing the definition and
running the ARSU conversion, never writing the shared registry from this
maintenance path. `pnpm arsu:convert` refuses to write when the current output
already differs from its own manifest; that state is repaired once with the
converter's `--force` option, after inspecting the drift. Core workflow code
uses the common graph runtime.

`src/graph-profiles/intellectual-property.ts` selects four profiles and their
exclusive capabilities for the Intellectual property materials domain. The
extension registry references these existing projections and their reviewed hashes.
After changing a selected projection, refresh the extension registry through
`scripts/generate-software-copyright-materials.mjs`. Patent search and patent-informed
paper continue to resolve through the base runtime.

`audits/patent-disclosure-skill/catalog.json` owns maintained paths and the pin.
Typed definitions in `src/vendor-converters/patent-disclosure-skill/capabilities.ts`
own capability IDs, role contracts, knowledge derivation and per-stage resource
membership. Adapted tools and reviewed resources live in
`authoring/patent-disclosure-skill/`. Identical source tools have one maintained
source and independent package copies. Business variants remain distinct.

The standalone `analysis-paper-patent-comparison` package is authored directly
under `skills/capabilities/` with original MIT provenance. Register its manifest
hash in the fixed registry. The maintenance catalog includes it in the reviewed
package trees separately from the eighteen upstream-derived stages.

`scripts/patent-source-audit.mjs` records source hashes, dispositions, resources
and authored knowledge derivation. Capability extraction preserves upstream
business instructions as provenance; generated Procedures implement the
ResearchSpec control boundary. Root routing, installers, autonomous workflow
writers, self-modifying maintenance, product examples and marketing images stay
in the source audit. The application stage includes the reviewed divisional
illustration as a conditional reference.
IPC datasets and model weights are configured external inputs.

The root source is MIT, copyright 2026 handsomestWei. Each applicable package
includes the source license and attribution. Mermaid and Three.js resources
carry their own upstream notices; MIT identity alone does not replace those
copyright notices. Binary resources are copied and verified as raw bytes.
Conditional resources have explicit read/use conditions in generated Skills.

Use the project [maintenance Skill](../../.agents/skills/patent-disclosure-skill-maintenance/SKILL.md)
for the complete analysis, ingestion, conversion, semantic review and anchor
lifecycle. `patent:author`, `patent:check` and `patent:idempotence` are deterministic
authoring commands. `patent-maintenance:artifacts`, `records`, `baseline`, `check`
and `diff` own this source's independent maintenance anchor. Read-only check is
offline and fails on drift or a stale semantic review. Baseline binds the exact
reviewed complete tree; it does not invent review conclusions.

The ARSU maintenance anchor covers its extracted and owned companion packages.
Its registry projection, profile analysis and parity rows are scoped to that
set; independent fixed vendors retain their own anchors while sharing the
runtime registry. Adding patent packages therefore leaves the existing ARSU
package and profile bytes and approved anchor unchanged.

Static conversion, installation, discovery, packaging and checks never execute
vendor runtime code. Copied-tree tests exercise adapted tools on local fixtures.
Word, CAD, browser rendering and semantic models remain externally configured;
test reports must distinguish executed fixture behavior from unavailable tools.
Run the full suite and package verification when distribution changes.
