---
name: plugin-tooluniverse-molecular-cloning
description: "Molecular cloning assembly design — Gibson Assembly (overlap design for seamless multi-fragment joining) and Golden Gate Assembly (Type IIS / BsaI / BbsI design with unique 4-bp fusion overhangs). Use when you need to plan how to join DNA fragments into a construct, design assembly overlaps/overhangs, or decide between cloning methods. Covers the domestication (internal-site removal), overhang-uniqueness, and overlap-Tm rules. For PCR primers to generate the fragments, see tooluniverse-primer-design."
metadata:
  capability_id: plugin-tooluniverse-molecular-cloning
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

# Molecular Cloning Assembly Design (Gibson & Golden Gate)

Plan how to join DNA fragments into a construct: design the **overlaps** (Gibson) or **Type IIS overhangs** (Golden Gate) and avoid the failures that come from internal sites and non-unique junctions.

## Step 0 — Pick the method

| Use **Gibson Assembly** when | Use **Golden Gate** when |
|---|---|
| A few fragments, **scarless/seamless** junctions anywhere you choose | Many parts, **standardized reusable** parts (MoClo/modular), one-pot |
| You can add ~20–40 bp homology by PCR | You can remove internal BsaI/BbsI sites (domestication) |
| One-off constructs | Combinatorial libraries / repeated assemblies |

Both are sequence-independent (no scar at the junction for Gibson; a 4-bp fusion scar for Golden Gate). For 2–4 unique fragments, Gibson is usually simplest; for libraries or a parts toolkit, Golden Gate.

## Step 1 — Gibson Assembly

```bash
tu run DNA_gibson_design '{"operation":"gibson_design",
  "fragments":["ATGGCG...GAGGAC","GAGGAC...GGCAAG","GGGCAAG...ATCCT"],
  "overlap_length":20}'
```

For each fragment it returns `left_overlap`, `right_overlap`, and `with_overlaps` (the fragment extended with the homology arms you'd add to your PCR primers — hand these to `tooluniverse-primer-design`).

**Gibson design rules**
- **Overlap length 15–40 bp** (20–25 typical); longer for GC-poor junctions.
- **Overlap Tm ≈ 48–65 °C** and balanced between junctions.
- **Fragment order matters** — list fragments in assembly order; the last fragment's 3′ overlaps the first only if you're making a circle (vector).
- **Avoid repeats/secondary structure** at the junctions (hairpins, direct repeats) → misassembly.
- **Unique junctions** — if two junctions share homology, fragments can swap; redesign so each overlap is unique.

## Step 2 — Golden Gate Assembly

```bash
tu run DNA_golden_gate_design '{"operation":"golden_gate_design",
  "parts":["ATGGCG...AAGAAC","CTGAGC...CTGATC","GAGGAG...GTGGTG"],
  "enzyme":"BsaI"}'
```

Returns `parts_with_overhangs`: each part's unique 4-bp `left_overhang`/`right_overhang` and the `full_sequence` flanked by the Type IIS recognition sites (e.g. BsaI `GGTCTC(N1)` … cutting outside its site to leave the 4-bp fusion overhang).

**Golden Gate design rules**
- **Domestication is mandatory.** The chosen enzyme's site (BsaI `GGTCTC`, BbsI `GAAGAC`) must NOT occur **inside** any part, or it will be cut internally. Remove internal sites by silent mutation before assembly — check every part.
- **Overhangs must be unique and non-palindromic.** Each 4-bp fusion site must differ from the others and not equal its own reverse complement, or junctions misligate. The tool assigns unique non-palindromic overhangs; keep them.
- **Avoid high-GC or all-AT overhangs**; published high-fidelity overhang sets (e.g. Potapov 2018) ligate most cleanly.
- **Order is encoded by the overhangs**, not by listing order — the 4-bp junctions define assembly.

## Step 3 — QC before ordering

`scripts/cloning_qc.py` screens parts for the problems above: internal BsaI/BbsI sites (Golden Gate), overhang uniqueness/palindromes, and Gibson overlap GC/length — and flags PASS/WARN.

## Step 4 — Gotchas (state these)

- **Internal Type IIS sites** (Golden Gate) — the #1 failure; domesticate every part.
- **Non-unique Gibson overlaps** or shared homology → fragment swapping / misassembly.
- **Repeats and strong secondary structure** at junctions reduce efficiency in both methods.
- **Overlap Tm imbalance** (Gibson) → some junctions form, others don't.
- **Generating the fragments** still needs primers with the overlaps/overhangs appended — design and QC those in `tooluniverse-primer-design` (and BLAST for specificity).

## Honest limitations

- These tools design the assembly junctions; they do not simulate the full ligation/exonuclease reaction or guarantee efficiency — validate by sequencing the assembled construct.
- No vector-backbone or ORF-frame checking — confirm reading frame and backbone compatibility yourself.

## Related skills
- `tooluniverse-primer-design` — design the PCR primers (with homology arms / Type IIS tails) to make the fragments.
- `tooluniverse-sequence-analysis` — handle the input sequences.
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- Load knowledge ID `tu-scripts-cloning-qc.py` from `scripts/cloning_qc.py`.

Run any packaged script only through the host Agent's configured Python runtime; ResearchSpec never executes packaged resources.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `source_ledger` `method_plan` `work_products` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_tooluniverse_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

When the brief is written, submit the declared outputs through
`researchspec advance node:<run>/<node>`, then consult `researchspec status` for the next legal
action. Do not choose, start, or advance another node, phase, mode, or run.
