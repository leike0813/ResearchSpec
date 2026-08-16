# Own Vendor Audit Record Template

每个锚点目录包含：

- `01-analysis.md`：上游身份、库存、转换映射与决策。
- `02-ingestion.md`：全部 extraction artifact 清单与 SHA-256。
- `03-conversion.md`：vendor capability packages 表与验证结果。
- `04-review.md`：per-package parity 与 artifact hash。
- `05-semantic-review.md`：**Agent 必填**，逐项 preserved / adapted / removed / gap 判定与证据。
- `artifacts/parity-packages.json`：vendor package 的 parity slice。
- `manifest.json`：机器可验证锚点状态。
