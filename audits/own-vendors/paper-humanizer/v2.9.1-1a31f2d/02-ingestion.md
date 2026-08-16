# Own Vendor Anchor Ingestion — paper-humanizer @ v2.9.1-1a31f2d

- extraction index: `docs/paper-humanizer_extraction/extraction-index.json`
- index SHA-256: `a033ea7fe15d3735baad929b0c0ed3d30ecd0598fec495b76cdcfa8c880e3e55`
- artifact count: 9 · pass: 9 · fail: 0 · error: 0

## Artifact Inventory

| artifact_id | milestone | kind | path | sha256 |
|---|---|---|---|---|
| `PH-CAP-01` | paper-humanizer | capability | `docs/paper-humanizer_extraction/capabilities/01_review_workflow.md` | `a2bc1f63c46a7b69a7bdfbad38ee7320995faf28804bd0b263c1a29b4fd5c8c7` |
| `PH-CAP-02` | paper-humanizer | capability | `docs/paper-humanizer_extraction/capabilities/02_full_workflow.md` | `b59e27ea9fa476efb278dcf0135df197b976be1fd2096e92c815e752407b1b9e` |
| `PH-CAP-03` | paper-humanizer | capability | `docs/paper-humanizer_extraction/capabilities/03_reference_taxonomy.md` | `9e89846ed3db75238eb64bda289409e7b0fdff957fce6b77c3685778db2773b5` |
| `PH-KP-01` | paper-humanizer | knowledge-pack | `docs/paper-humanizer_extraction/knowledge/01_diagnostic_guidance.md` | `7364799ca64c40f2cb7e31e966384161559b175467d2ef23a16d29f00af063ad` |
| `PH-KP-02` | paper-humanizer | knowledge-pack | `docs/paper-humanizer_extraction/knowledge/02_document_yaml_contract.md` | `3a8505e6a7fb6d8fa6c30914253d7e6cce0e192f01215beba5c07810b3147f46` |
| `PH-SCRIPT-01` | paper-humanizer | script | `docs/paper-humanizer_extraction/scripts/document_pipeline.py` | `1f58a75033ac460a64a601464535a4d4d79cfed3d402514acc2f70271ba767d7` |
| `PH-SCRIPT-02` | paper-humanizer | script | `docs/paper-humanizer_extraction/scripts/full_workflow.py` | `9e8c7d8dad1d3bd6326452cfa0e10ae509d7773c0efee3367a5c1c280c0677f2` |
| `PH-CAP-04` | paper-humanizer | capability | `docs/paper-humanizer_extraction/capabilities/04_revision_execution.md` | `017605fb428a5c40198cd51a82aa399287a508a3c9584ca77fa768bb16ffcbaf` |
| `PH-CAP-05` | paper-humanizer | capability | `docs/paper-humanizer_extraction/capabilities/05_verification_acceptance.md` | `287f18d942311f16159d6470eaaa5714280fd1317abb1278e4bb6573e9f72f88` |

## Verification

- 上游 source mapping 逐项 byte-for-byte 校验。
- 新增/修改/删除 artifact 必须在后续增量锚点中显式列出。
