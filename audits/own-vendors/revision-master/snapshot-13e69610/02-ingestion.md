# Own Vendor Anchor Ingestion — revision-master @ snapshot-13e69610

- extraction index: `docs/revision-master_extraction/extraction-index.json`
- index SHA-256: `583c3ce78a7e48d02c204e8c46163777422de738f32cbea453b158627d62376a`
- artifact count: 45 · pass: 45 · fail: 0 · error: 0

## Artifact Inventory

| artifact_id | milestone | kind | path | sha256 |
|---|---|---|---|---|
| `RM-CAP-01` | revision-master | capability | `docs/revision-master_extraction/capabilities/stage-1-entry-and-bootstrap.md` | `75e4bb7ee303006ac9dd228b36b208720aa615899ba9342ac2ffa7e1ca7dafbc` |
| `RM-CAP-02` | revision-master | capability | `docs/revision-master_extraction/capabilities/stage-2-manuscript-analysis.md` | `a4cb8861f532cafdab3ac4fdf527bc8e44abbeede95874f1a7704aa32bc7c4d9` |
| `RM-CAP-03` | revision-master | capability | `docs/revision-master_extraction/capabilities/stage-3-comment-atomization.md` | `98583576c55131b1caf2b52aca9d6bd7f964ef42341f64e7f605e89d9a69b3f0` |
| `RM-CAP-04` | revision-master | capability | `docs/revision-master_extraction/capabilities/stage-4-workboard-planning.md` | `8f9c9b028c326aeae2d6874fd7724cd3c95392dfe8bb192d4fa6add0458dafd5` |
| `RM-CAP-05` | revision-master | capability | `docs/revision-master_extraction/capabilities/stage-5-strategy-and-execution.md` | `a0fb3787f5158a824babaf73ec013002603134664656687f48aa9d7475cc2ea0` |
| `RM-CAP-06` | revision-master | capability | `docs/revision-master_extraction/capabilities/stage-6-final-review-and-export.md` | `4f78dc6ea6608a7090cdbd7becd343789f27a4146a2f710272d39f4d26ba0513` |
| `RM-KP-01` | revision-master | knowledge-pack | `docs/revision-master_extraction/knowledge/helper-scripts.md` | `e839ba23c971b02a43a5c78fafdf0e0ec26941cc7f867401a2b4f3cee5c316f2` |
| `RM-KP-02` | revision-master | knowledge-pack | `docs/revision-master_extraction/knowledge/sql-write-recipes.md` | `d936354ebeec69de02309c64cccb244d7907b4b27032d6b2e3a4b18a4bb88147` |
| `RM-KP-03` | revision-master | knowledge-pack | `docs/revision-master_extraction/knowledge/workflow-glossary.md` | `e2fdd11465ab134de5c8e7e7fdd57d64c3599490227e360bf78146c1aec80e26` |
| `RM-KP-04` | revision-master | knowledge-pack | `docs/revision-master_extraction/knowledge/workflow-state-machine.md` | `cc8dc7378f04ab3cecf964e3ba49ca239f7ffb4f84dfb20fa0e4285456018f1b` |
| `RM-SCRIPT-01` | revision-master | script | `docs/revision-master_extraction/scripts/detect_main_tex.py` | `eed3cdc18838ecbfe59f4c547de53c91fe248849f28935c4f8a17a860fd91efc` |
| `RM-SCRIPT-02` | revision-master | script | `docs/revision-master_extraction/scripts/init_artifact_workspace.py` | `8538e10fb5f459ca24d9dd689a85f881257ce90f24202df7a9efafa1fd3b535f` |
| `RM-SCRIPT-03` | revision-master | script | `docs/revision-master_extraction/scripts/gate_and_render_workspace.py` | `086d816ba70854f163b33be18bed7dc810b3fbab7d8da39bdefa35db54163a8e` |
| `RM-SCRIPT-04` | revision-master | script | `docs/revision-master_extraction/scripts/workspace_db.py` | `97690173eb1831780731fefdb87230ccb17d9f198bbb853875242fcd8b08ad61` |
| `RM-SCRIPT-05` | revision-master | script | `docs/revision-master_extraction/scripts/runtime_localization.py` | `6e18f9ec958c705140ce329ee27bb97ef943e10ac8a2ab04038526f7732ab773` |
| `RM-SCRIPT-06` | revision-master | script | `docs/revision-master_extraction/scripts/capture_revision_action.py` | `1abad05bd2c2fc35cd8e9f9d88ae5a272055cd525507642fcadfd89cf4717ba3` |
| `RM-SCRIPT-07` | revision-master | script | `docs/revision-master_extraction/scripts/commit_revision_round.py` | `181acd68041dbb1f20d96d2d7f42f754704c4626f7018a7cb85df9193e1e49f3` |
| `RM-SCRIPT-08` | revision-master | script | `docs/revision-master_extraction/scripts/export_manuscript_variants.py` | `c51d7a7b589d076c15c965277ee18653e6eea2674fa65fcf56c500a262c6ab84` |
| `RM-ASSET-01` | revision-master | schema | `docs/revision-master_extraction/assets/schema/revision-master-schema.yaml` | `5a023017ad6e5b0f0642ee47722b3aa82d850244d38eb5b2f843d04d6de8eb05` |
| `RM-ASSET-02` | revision-master | runtime-digest | `docs/revision-master_extraction/assets/runtime/skill-runtime-digest.md` | `b54470e9f028a2c68c7d3b67da22ab55556e99134c7b2cef0eb9495667f23eff` |
| `RM-ASSET-03` | revision-master | localization | `docs/revision-master_extraction/assets/localization/source-messages.yaml` | `62079d8f833544c005c3a71f98636af921ded67c964ebe7dcd45909a9deb3c82` |
| `RM-ASSET-04` | revision-master | template | `docs/revision-master_extraction/assets/templates/action-copy-variants.md.j2` | `52ea86128dacb618b77d69e6764cafcdf39eec96ebe4b7fd5a09f34de36c61e9` |
| `RM-ASSET-05` | revision-master | template | `docs/revision-master_extraction/assets/templates/agent-resume.md.j2` | `a2845d2c1eedefb46f8e9ba026776068d99542bef2470b9323992f332526a234` |
| `RM-ASSET-06` | revision-master | template | `docs/revision-master_extraction/assets/templates/atomic-comment-workboard.md.j2` | `080005f3058ce38e6906df9592a1770c7c7b09f5c477bdffc4b4a7db7346bc20` |
| `RM-ASSET-07` | revision-master | template | `docs/revision-master_extraction/assets/templates/atomic-review-comment-list.md.j2` | `f0955a37f33dc5e8c3f2bcd25f97546284431af97ae7bfdc3a691e40275f2dd6` |
| `RM-ASSET-08` | revision-master | template | `docs/revision-master_extraction/assets/templates/export-patch-plan.md.j2` | `981cf95315730a59b6461bf2660b4bd09629a033cd2c272b6172812b6f71b6c4` |
| `RM-ASSET-09` | revision-master | template | `docs/revision-master_extraction/assets/templates/final-assembly-checklist.md.j2` | `11378f0925df4f1d586736f30f691e0e21593155a48dadf762f29c24b0144539` |
| `RM-ASSET-10` | revision-master | template | `docs/revision-master_extraction/assets/templates/manuscript-execution-graph.md.j2` | `967eb61aa713202cc1f39d0d34cda38ef57c4151353b52b085e267bafc0a1f85` |
| `RM-ASSET-11` | revision-master | template | `docs/revision-master_extraction/assets/templates/manuscript-revision-guide.md.j2` | `cea2c7ce66000a5e16fd0da063db6e60f6bb39901af294e1081b6b98b3a9dba9` |
| `RM-ASSET-12` | revision-master | template | `docs/revision-master_extraction/assets/templates/manuscript-structure-summary.md.j2` | `0df6523a4a0979bd673730f3ba35c7777a1d6ff42ce7e02c416cf95eb1fe41ef` |
| `RM-ASSET-13` | revision-master | template | `docs/revision-master_extraction/assets/templates/raw-review-thread-list.md.j2` | `0f24d0017045300027b872c97a2ef3a1a058f950a16f41a4ff087824e11ec9b4` |
| `RM-ASSET-14` | revision-master | template | `docs/revision-master_extraction/assets/templates/render-manifest.yaml` | `21ca5daf691324dc90dc5c810c76efd095207752cf174a75c338c97130953130` |
| `RM-ASSET-15` | revision-master | template | `docs/revision-master_extraction/assets/templates/response-coverage-matrix.md.j2` | `68d05740227bec56bcb96d74b5a1d173b290400352ccf73d15b5fa79ec2f9bbd` |
| `RM-ASSET-16` | revision-master | template | `docs/revision-master_extraction/assets/templates/response-letter-outline.md.j2` | `067cd6ce4fb6ad4301f4de54c463994abc9eb93c0d83e2d35d1fccd9d8cceccb` |
| `RM-ASSET-17` | revision-master | template | `docs/revision-master_extraction/assets/templates/response-letter-preview.md.j2` | `608541f61325ad7fb01c60bf7d6ce2db9580861c9c215196920228555d553360` |
| `RM-ASSET-18` | revision-master | template | `docs/revision-master_extraction/assets/templates/response-letter-preview.tex.j2` | `66c9bb0c039b218f19cc7358f6719bdeca08c04b2d6e51a513fc87f4535c19e3` |
| `RM-ASSET-19` | revision-master | template | `docs/revision-master_extraction/assets/templates/response-letter-table-preview.md.j2` | `608541f61325ad7fb01c60bf7d6ce2db9580861c9c215196920228555d553360` |
| `RM-ASSET-20` | revision-master | template | `docs/revision-master_extraction/assets/templates/response-letter-table-preview.tex.j2` | `2caa380ed73b6772d4b47f42af80c02224817156c2016691f423a51e606b51f2` |
| `RM-ASSET-21` | revision-master | template | `docs/revision-master_extraction/assets/templates/response-strategy-card.md.j2` | `c1103734df07ebcda235e3737904df8fd0d3761639fa3444d88324e84acd13a5` |
| `RM-ASSET-22` | revision-master | template | `docs/revision-master_extraction/assets/templates/review-comment-coverage.md.j2` | `f6749c83aac30598ccfa9dc8f72816d0f275232628d839976c9d6ce21623ffe0` |
| `RM-ASSET-23` | revision-master | template | `docs/revision-master_extraction/assets/templates/revision-action-log.md.j2` | `38245c42889720d6d20f3942324b65368b12ee322a8ca3e57529535fa085af04` |
| `RM-ASSET-24` | revision-master | template | `docs/revision-master_extraction/assets/templates/style-profile.md.j2` | `64edf1cc877868ebd9710c7de6bc8e1f1a4508ea1e79a36b460d285fcc8c84a8` |
| `RM-ASSET-25` | revision-master | template | `docs/revision-master_extraction/assets/templates/supplement-intake-plan.md.j2` | `58bd92ae5ca5d416a71d0a2fef072ccc78706c51a99a6c606e36c326862dbe46` |
| `RM-ASSET-26` | revision-master | template | `docs/revision-master_extraction/assets/templates/supplement-suggestion-plan.md.j2` | `742cb463e10053c78b6d240892449c4e64bb3fab3d309b364cbefbfa4b36bae6` |
| `RM-ASSET-27` | revision-master | template | `docs/revision-master_extraction/assets/templates/thread-to-atomic-mapping.md.j2` | `8ab4f321a3b1a5186a2cb4f33acbfd1406e234ff002c21b6040d4b94666ddcaf` |

## Verification

- 上游 source mapping 逐项 byte-for-byte 校验。
- 新增/修改/删除 artifact 必须在后续增量锚点中显式列出。
