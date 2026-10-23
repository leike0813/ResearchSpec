# Own Vendor Anchor Conversion — paper-humanizer @ snapshot-84eb2ed

- registry subset SHA-256: `76365e2c2baeb324066cf3354048e326106167ab73d3f539f64d369581da38d5`
- packages tree SHA-256: `bbcf20d72044645e640d2fe95c06d5d4c3732fba7d566ac52356aad7010de6c4`
- capability count: 4 · operational: 4

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 6 | 1 | 9 | `b7c88d93cd7e` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 4 | 1 | 7 | `f16f6a5d7a26` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `21163e55acf6` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 4 | 1 | 7 | `0d328a731a72` |

## Delivery Assets

| path | sha256 |
|---|---|
| `hooks/paper-humanizer/guard.md` | `55b9d67efa5d6712bbeb156595ecdfba941ce64ed93efbd23d1d9100cd21008a` |
| `hooks/paper-humanizer/inject.cjs` | `02398ab616b3fcd2626c83b23c220f49663d2701e0490d6fce848c1fa2c1fbae` |
| `hooks/paper-humanizer/LICENSE` | `4ac4810254ab36d45419141aeb8e69bf50652cfafe5b2dab947d06d44e5cbf96` |

## Verification

- [x] `pnpm paper-humanizer:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
