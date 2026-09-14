# Own Vendor Anchor Conversion — paper-humanizer @ v2.9.1-1a31f2d

- registry subset SHA-256: `15f8ce2fc743baf29479f8952a436dc609afe4ee9c5aeef28cff99ab4551273e`
- packages tree SHA-256: `53c44c03a94696226293ec3319b77b3b35ac8314632307e603c2b47b27b7510a`
- capability count: 4 · operational: 4

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 3 | 1 | 6 | `c0779f5cf35a` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `608608b5185b` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `d1e6fba4efb4` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 2 | 1 | 5 | `530ce33b99fe` |

## Verification

- [x] `pnpm paper-humanizer:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
