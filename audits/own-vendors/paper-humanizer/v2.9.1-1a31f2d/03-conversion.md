# Own Vendor Anchor Conversion — paper-humanizer @ v2.9.1-1a31f2d

- registry subset SHA-256: `70c951dd9aa6806e8f52845fe961056a545e5c40a173e45fba76ac440a0784d4`
- packages tree SHA-256: `011ae8f792e9119258dc5b4d42908e4870253a99677d595224775470e36479a6`
- capability count: 4 · operational: 4

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 4 | 1 | 7 | `82f4495c336d` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `608608b5185b` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `d1e6fba4efb4` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 3 | 1 | 6 | `9b3e0b76998f` |

## Verification

- [x] `pnpm paper-humanizer:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
