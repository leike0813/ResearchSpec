# Own Vendor Anchor Conversion — revision-master @ snapshot-13e69610

- registry subset SHA-256: `3d05991643ea9db66cdefdb0e034673f1325780f52feb008a8543ad9ba183174`
- packages tree SHA-256: `875711dd7408a9a2de4ef5ff77634857fb127ab421879be560d4eaa9c472424b`
- capability count: 5 · operational: 5

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 6 | 1 | 38 | `eccbfd2ec9cc` |
| `design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 6 | 1 | 44 | `678e26990197` |
| `design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 12 | 1 | 44 | `9e3d9a6bfb88` |
| `generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 13 | 1 | 51 | `dbd50fb00c01` |
| `transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 10 | 1 | 42 | `5d157fc9f170` |

## Verification

- [x] `pnpm revision-master:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
