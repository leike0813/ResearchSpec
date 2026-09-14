# Own Vendor Anchor Conversion — revision-master @ snapshot-13e69610

- registry subset SHA-256: `334fe1eefd1c91cbb962888b6ebf6a30b9456d8160d59471d195827687f10253`
- packages tree SHA-256: `5701026e4b0ba380727a5a76cdf4cde905f7ca5432f43dfcecf7cf56ac68f0f0`
- capability count: 5 · operational: 5

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 4 | 1 | 36 | `b08bd884a9b6` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 4 | 1 | 38 | `c1ed654755dc` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 4 | 1 | 36 | `18c82a15ea84` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 5 | 1 | 40 | `23f40e806588` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 4 | 1 | 36 | `ba612aad074f` |

## Verification

- [x] `pnpm revision-master:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
