# Own Vendor Anchor Conversion — revision-master @ snapshot-13e69610

- registry subset SHA-256: `463ab7fba548e1d44a594b98835b209ea52da84445153703848580172004bb6a`
- packages tree SHA-256: `3a08effb040b24cb4ea5d9f295ea0a496a6570c308e94628cf8e6ecdb29618d5`
- capability count: 5 · operational: 5

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `cap-analysis-review-response-manuscript-analysis` | Review Response Manuscript Analysis | analysis | producer | mixed | none | operational | 1/1 | 4 | 1 | 36 | `b35129d65bb4` |
| `cap-design-review-response-intake` | Review Response Intake | design | producer | mixed | none | operational | 4/2 | 4 | 1 | 43 | `e089b857cb11` |
| `cap-design-review-response-workboard-planning` | Review Response Workboard Planning | design | producer | mixed | required | operational | 1/1 | 4 | 1 | 36 | `271af3d57221` |
| `cap-generation-review-response-round` | Review Response Round | generation | producer | mixed | required | operational | 1/4 | 5 | 1 | 46 | `1487787f72fa` |
| `cap-transform-review-response-comment-atomization` | Review Response Comment Atomization | transformation | producer | mixed | required | operational | 1/2 | 4 | 1 | 36 | `2e8dcc3632d2` |

## Verification

- [x] `pnpm revision-master:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
