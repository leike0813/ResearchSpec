# Own Vendor Anchor Conversion — revision-master @ snapshot-13e69610

- registry subset SHA-256: `e5def17e0c605db3626e01cbe30c22ac79c03eff7443fdee43ef36630c57522d`
- packages tree SHA-256: `ff9e59e627d869be81ecf4ce252dadc14f56613c03a802134b37f8dec9635c09`
- capability count: 5 · operational: 5

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 4 | 1 | 36 | `636d11915f2b` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 4 | 1 | 38 | `5d630feb1f67` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 4 | 1 | 36 | `2a185071f942` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 5 | 1 | 40 | `9400c053e331` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 4 | 1 | 36 | `7a4fa94febd7` |

## Verification

- [x] `pnpm revision-master:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
