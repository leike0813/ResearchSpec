# ToolUniverse v1.5.10 upstream delta

The comparison covers the 255 commits from `8ec5d4be77c9e0ce0037eac6fdd4e914f1544b06` to `6b50abef032a702554e2b34a4f592ee674f12f8f`. The published tag resolves to the latter commit and the former is its ancestor. The root Apache-2.0 license has the same Git blob in both trees. [Official release](https://github.com/mims-harvard/ToolUniverse/releases/tag/v1.5.10)

## Inventory and dispositions

The canonical `skills/` tree contains 229 Skill entries. The delta adds 31 remote-tool setup entries, five other platform/setup or publishing entries and 17 research candidates. Nine developer-maintenance entries lost their canonical Skill entries. The 17 research candidates join the three deferred earlier. The 130 previous admissions and all eight hard dependencies remain in the projection. Paths, source identities, file statuses and the reason for each exclusion are in [upstream-delta.json](upstream-delta.json) and [skill-audit.json](../skill-audit.json).

83 admitted Skill directories have upstream file changes. The converter also adapts package-relative script paths and evidence or authority wording where a directory-level diff would miss the downstream impact. The reviewed protein therapeutic design package retains the previous projection. Its v1.5.10 inventory is audited, while the upstream operational delta stays outside delivery.

## Tool contracts and evidence

[tool-contract-delta.json](tool-contract-delta.json) compares the Git-bound named JSON definitions and maps changed tool names and implementation classes to admitted callers. The inventory sees 2,983 old names, 3,079 new names and 2,145 changed, added or removed declarations. Changes include descriptions and test examples. A structural parameter check on referenced tools found 468 changes after filtering descriptive metadata. One malformed JSON file was confined to the old `broken_apis` directory.

| Area | Downstream decision |
| --- | --- |
| GtoPdb | The REST disease tools were retired. Use the public bulk-backed target and interaction tools where appropriate, and keep disease-target associations distinct from disease-drug evidence. Historical report examples retain historical attribution. [#704](https://github.com/mims-harvard/ToolUniverse/pull/704) |
| COSMIC | Follow `gene` and `terms` from the declared parameters. Check success and truncation before interpreting retrieved mutation records. The accessible window cannot establish patient prevalence. |
| FDA Orange Book | Read patent and exclusivity arrays per product, preserve the application identity, and distinguish missing matches from retrieval errors. [#794](https://github.com/mims-harvard/ToolUniverse/pull/794) |
| PubMed guidelines | `query` and `limit` are the search inputs. The optional key belongs to the user-managed tool environment. [#788](https://github.com/mims-harvard/ToolUniverse/pull/788) |
| GWAS Catalog | The v2 implementation replaces retired v1 lookup routes. Continue using the reviewed tool names and preserve the distinction between trait-name resolution, requested filters and evidence coverage. [#776](https://github.com/mims-harvard/ToolUniverse/pull/776) |
| Pagination and framework errors | Use the declared returned-record and total fields and keep failed retrieval separate from an empty successful result. The revised generic error envelope and typed wrappers provide static evidence only. [#824](https://github.com/mims-harvard/ToolUniverse/pull/824) [#856](https://github.com/mims-harvard/ToolUniverse/pull/856) [#861](https://github.com/mims-harvard/ToolUniverse/pull/861) |
| Loading and defaults | The tool registry now permits explicit replace versus append. The reviewed corpus contains no caller that passes the changed category-loading arguments. New upstream default registrations do not grant service or host authorization in ResearchSpec. [#813](https://github.com/mims-harvard/ToolUniverse/pull/813) |

The tool-to-caller map is a static lexical join. Runtime-generated tool names, host configuration, service credentials and live endpoint health are outside what it can establish. Review decisions and generated output evidence are recorded in [05-semantic-review.md](../05-semantic-review.md).
