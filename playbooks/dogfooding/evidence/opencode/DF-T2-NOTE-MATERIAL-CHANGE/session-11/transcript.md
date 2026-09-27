我来核对一下当前材料状态，再决定怎么处理。

`researchspec status --json` 显示 0 runs，前沿/pending gates/decisions 均为空，没有图状态可以恢复。比对注释与现有文件：
- `work/researchspec-notes/writing-evidence.md` 仍只是 fixture 模板的拷贝
- `benchmark/sources.yaml` 不存在（注释里指明的必需来源）
- `researchspec/specs/sources.yaml` 与 `claims.yaml` 只是 schema 2 占位（`sources: []` / `claims: []`）
- `benchmark/partial-manuscript.md` 行内已给出 CLM-01（谨慎成立）和 CLM-02（不被证据支持）的判断，但没有独立核查报告

先把进度写进任务笔记以备后续溯源：

---

`benchmark/sources.yaml` 是本轮核查的必需输入，但你工作区里看不到这个文件；草稿里只剩行内的 CLM-01/CLM-02 判断，无法独立完成论断核查。请问下一步希望怎么走：

1) 由你重新提供 `benchmark/sources.yaml` 到该路径；
2) 改用其他路径/名称的来源（例如填充 `researchspec/specs/sources.yaml`）；
3) 没有来源材料可用，停止本轮核查并保留现状。
