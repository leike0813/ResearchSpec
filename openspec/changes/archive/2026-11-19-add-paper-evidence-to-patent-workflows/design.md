# Design

## Context

Patent intake already accepts a finished paper as technical materials, including standalone use. Application review currently checks claims against the specification and figures. Claim-chart intake accepts a patent feature set and comparison materials but models its comparison targets around existing patent, product and standard scenarios.

## Goals / Non-Goals

Keep evidence available at the point of review in both standalone and graph work. Drafting changes belong to the patent authoring and maintenance path. The comparison is a ResearchSpec-authored fixed Procedure available through Navigate. The external repository is a bibliographic design reference only. Write original procedures, code, test cases and documentation using local conventions. Exclude external prompts, translations or close paraphrases, scripts, schemas, examples and repository snapshots from the deliverables.

## Decisions

- When a paper supplies the principal technical disclosure, record its candidate features and source locations in one ordinary case attachment. Use the existing index file list with the role `paper_evidence` and a readable table. Carry its reference through disclosure and application bundles. Add claim numbers and limitations once assigned. Keep the table outside formal application text. On revision create a new version for the accepted inputs, preserving the previous record.
- Distinguish direct disclosure from an interpretation requiring explanation. Record the actual observed passage or result and its locator. When support is missing, narrow the claim to supported facts or return the question to the inventor. On legacy paper cases without the attachment, use authorized available originals to reconstruct the record or report the affected limits. The reviewer reads evidence and reports findings. Corrections belong to the producing stage.
- Register `analysis-paper-patent-comparison` as a fixed analysis producer with `execution_type: llm` and no formal Gate. Accept two required user-supplied files, `paper_source` and `patent_source`, directly through standalone bindings. Existing reading notes may assist with locators. The original documents remain the basis of comparison.
- Produce one ordinary Markdown file, `comparison_report`, with an evidence table and a short chronology. Build the table from both documents, citing precise locations and recording the direction of each difference. Keep missing or unread content visible. Use the existing delivery convention for reporting paths and limitations.
- Keep the six existing claim-chart scenes, their input roles, shared XLSX exporter and OA callers on their current path. The new report can be written by the Procedure itself. The discovery description should select bilateral technical comparison from natural-language requests and distinguish it from producing a conventional claim chart.
- Register the standalone package in the fixed registry with project authorship. Preserve the existing mapping of vendor-derived stages to the seven patent graphs and their source inventory. The implementation should account for the additional bundled capability only where the product catalog or documentation describes that total.

## Risks / Trade-offs

A locator can exist even when its contents do not support a claim. Human-readable findings must address that relationship. A partial scan can also look like a one-sided finding. Mark unread or unavailable sections explicitly and limit absence claims to the inspected material.
