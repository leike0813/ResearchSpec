# 案卷收口核对 (Docket review)

## 何时

一轮修订之后，核对问题清单的关闭情况，给出收口或再开一轮的建议。

**本阶段是只读复核。**它不重写输入，也不推进节点。

## 正式状态不在这里

当前轮次、是否收口、是否再来一轮，都由 ResearchSpec CLI 与人的 Decision 决定。本
阶段不读也不写 `docket.yaml`，不判断 phase 合法性，不声明终态。

## 输入

- `disclosure_bundle`（必需，handoff 或 node_output）
- `application_bundle`（必需，handoff 或 node_output）

## 步骤

1. 解析两个索引，确认本轮两件都已出到新版本。可选地用共享索引工具复核一次：

```bash
python tools/patent_files.py validate --project-root <root> <out>/disclosure.r<N>.index.json --kind disclosure
python tools/patent_files.py validate --project-root <root> <out>/application.r<N>.index.json --kind application
```

2. 对照本轮 `问题清单.md` 逐条标记 done / deferred / open：
   - done 要有对应改动作为证据；
   - deferred 要写明为什么这次不做；
   - open 保留原样。
   处置口径细则见 `knowledge/pd-kp-09-docket-rounds.md`。
3. 交叉核对本轮修订说明里声明的改动与实际文件是否对得上。对不上就是 `issues`。
4. 写 `docket_review`（普通文件）：`status`、逐条 issue 处置、残留条目与文件路径、
   缺的技术事实，以及给人的建议——可以收口了 / 还有阻塞项需要问人 / 建议再来一轮。

## 硬约束

- 不修改任何输入文件，不重写交底或申请。
- 不宣称授权、格式审查通过或问题已全部关闭，除非清单确有对应记录。
- 未满轮但已无非阻塞待办时，照实说「可以收口」，不要建议空转加一轮。
- 不得替人确认收口或继续。

## 失败路径

- 索引校验失败：照实报告，停下。
- 清单与实际改动对不上：记 `issues` 并指出具体哪条。

## 完成

输出 `docket_review`（`docket-review.v1`）的实际文件路径，含 issue 逐条处置、残留项路径与收口建议。收不收、继不继由人决定。
