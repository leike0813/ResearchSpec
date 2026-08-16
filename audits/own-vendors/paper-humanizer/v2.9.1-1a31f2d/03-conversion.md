# Own Vendor Anchor Conversion — paper-humanizer @ v2.9.1-1a31f2d

- registry subset SHA-256: `2072a9958bf602810fd088ff817ebbd5e439051d57fee954f2905c12ce821568`
- packages tree SHA-256: `a381454fd5d4e1922a88eee2cfc138e5d4c3ca0caf760bb43b3f6666fa029a53`
- capability count: 4 · operational: 4

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `cap-check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 3 | 1 | 7 | `ce05890ad13b` |
| `cap-check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `4a10be43f314` |
| `cap-generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `270d12dd61c0` |
| `cap-transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 2 | 1 | 5 | `913141498828` |

## Verification

- [x] `pnpm paper-humanizer:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
