# Own Vendor Anchor Conversion — revision-master @ snapshot-13e69610

- registry subset SHA-256: `544c4e6c1c6c248ee89c5855572cca5803cf97eb4138d8215951770882dc6277`
- packages tree SHA-256: `b3195cff6baf9184ee857915f4e5357951cd57da6ad0ace942d532d9fdcc4bb8`
- capability count: 5 · operational: 5

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 4 | 1 | 36 | `b08bd884a9b6` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 4 | 1 | 38 | `c1ed654755dc` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 5 | 1 | 37 | `e5fe8d878c87` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 6 | 1 | 41 | `8396e32edd72` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 4 | 1 | 36 | `ba612aad074f` |

## Verification

- [x] `pnpm revision-master:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
