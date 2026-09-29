# Own Vendor Anchor Conversion — paper-humanizer @ v2.9.1-1a31f2d

- registry subset SHA-256: `7bb5bbf18c05b6a0424556667a12608d23466983bc8c7e75f739a0cd8be1caa5`
- packages tree SHA-256: `de5d97ba17192a495dcf5839af7b74380abe130e8e443ca1bf48986dd26887ec`
- capability count: 4 · operational: 4

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 5 | 1 | 8 | `9f736c43df89` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `608608b5185b` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `d1e6fba4efb4` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 4 | 1 | 7 | `5aebe6e201f3` |

## Verification

- [x] `pnpm paper-humanizer:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
