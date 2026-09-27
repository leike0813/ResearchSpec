# review-bundle · 索引与目录说明

> 工作语言：中文（与用户指令一致）
> 注：本目录下的全部产出均为"准备阶段"文件，并未修改稿件、未启动 ResearchSpec 工作流、未产出回复信。

## 目录

```
work/review-bundle/
├── README.md                                  # 本文件
├── steps/
│   ├── step1-material-bundle.md               # 步骤 1：材料整理
│   ├── step2-comment-breakdown.md             # 步骤 2：逐条意见拆分
│   └── step3-coverage-and-gaps.md             # 步骤 3：覆盖与遗漏核查
└── atoms/
    ├── M1-synthetic-disclosure.md             # Major #1
    ├── M2-clm02-tradeoff.md                  # Major #2
    ├── M3-clm03-hypothesis.md                # Major #3
    ├── M4-methods-causal-limit.md            # Major #4
    ├── m1-terminology.md                     # Minor #1
    └── m2-limitations-in-conclusion.md       # Minor #2
```

## 字段约定

- 原子文件字段：`metadata / quote / requirements / target locations / evidence support / gap summary / dependencies / pending confirmations / completion criteria`。
- 评论 ID 与批注一一对应：`COM-M1..M4`、`COM-m1..m2`。
- 稳定 claim ID：`CLM-01`、`CLM-02`、`CLM-03` —— 各文件中必须保持一致。

## 与 ResearchSpec 工作流的关系

- 当前未发起任何 run/node/gate/decision；目录与文件均在 `researchspec/` 之外。
- 阶段产物均为"普通项目文件"，可继续用于下一步策略卡 / 修订执行 / 回复信草拟。
- 若后续要进入 ResearchSpec governed 路径：
  1. `researchspec status --json` 确认 workspace 状态；
  2. 由用户授权具体 profile entry 后再 `researchspec start ...`；
  3. 不得在不授权的情况下自行激活 `generation-review-response-round` 等 capability。
