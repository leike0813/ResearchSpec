# Own Vendor Anchor Conversion — chinese-patent-helper @ snapshot-14d40f0

- registry subset SHA-256: `b1dc62bac6f16ce49bb7f2fb7550ff022c0ea3899c6d414101924989deb54913`
- packages tree SHA-256: `ac9714f7b8e7ecdba5e550cedfffead7fda71ce2016b7707554f90af8b59779c`
- capability count: 1 · operational: 1

## Capability Packages

| capability_id | title | class | node_kind | execution | gate | maturity | in/out | knowledge | validators | files | manifest sha12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `generation-chinese-patent-filing` | 中国专利申报材料 | generation | producer | mixed | advisory | operational | 2/1 | 14 | 1 | 16 | `a393d6ca926b` |

## Delivery Assets

| path | sha256 |
|---|---|
| `skills/capabilities/generation-chinese-patent-filing/assets/sRGB-v4.icc` | `d25e5802044c70ad354c8931ae945814a1826aa954ebe9e74efb68945c3ce2fd` |
| `skills/capabilities/generation-chinese-patent-filing/assets/WORD转XML编辑器五书模板文件.docx` | `e52e39abec20f433c635e0586109465371ba7f5c144a01845e5dd49d04844c21` |

## Verification

- [x] `pnpm chinese-patent-helper:author` twice: byte-identical
- [x] `pnpm capability:parity`
- [x] `pnpm check` / `pnpm lint`
- [x] full test suite
