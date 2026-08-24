# Own Vendor Anchor Conversion — paper-humanizer @ v2.9.1-1a31f2d

- registry subset SHA-256: `d7164f0cc446a350f2f4f56ff50360cf8d44c6ee7485b946e2bd115f8e17798d`
- packages tree SHA-256: `877f764a7447d68cf558753e54d896caeca69dc0231eecf64fd4faf5ce24b2e2`
- capability count: 4 · operational: 4

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `check-paper-humanization-review` | Paper Humanization Review | verification | checker | mixed | none | operational | 2/2 | 3 | 1 | 6 | `ef9780d14bb0` |
| `check-paper-humanization-verification` | Paper Humanization Verification | verification | checker | mixed | none | operational | 2/1 | 3 | 1 | 6 | `3b395ddb76db` |
| `generation-humanization-reference` | Paper Humanizer Reference Mode | generation | observer | llm | none | operational | 0/0 | 1 | 1 | 3 | `ce0fe3b3eef6` |
| `transform-paper-humanization-revision` | Paper Humanization Revision | transformation | producer | mixed | required | operational | 2/2 | 2 | 1 | 5 | `68fb272a60f4` |

## Verification

- [x] `pnpm paper-humanizer:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
