# Own Vendor Anchor Conversion — revision-master @ snapshot-13e69610

- registry subset SHA-256: `29d341e2ae9b2f8f7b8cef9cb4f5de5a992a215be97cf47a6f450b5d297be723`
- packages tree SHA-256: `6fe0203cea74e889039d193416fceb565da0b7653246007bcf9fe9fe41ce5f27`
- capability count: 5 · operational: 5

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 6 | 1 | 38 | `eccbfd2ec9cc` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 6 | 1 | 44 | `678e26990197` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 12 | 1 | 44 | `c5e4b351f139` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 13 | 1 | 51 | `25e11535f807` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 10 | 1 | 42 | `3d06238d4b4a` |

## Verification

- [x] `pnpm revision-master:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
