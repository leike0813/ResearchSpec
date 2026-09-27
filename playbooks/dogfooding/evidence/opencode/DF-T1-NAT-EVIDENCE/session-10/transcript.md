我看清楚项目结构了：草稿、claims、sources都在 `benchmark/` 下，这是合成的 dogfooding 测试夹具（README 明确说明）。我先确认一下您希望报告放在哪个位置，然后核对各条论断与对应来源。

---

我按 standalone流程处理这个任务：检查草稿论断 → 对照 `sources.yaml` 与 `claims.yaml` → 把核查报告作为项目级普通文件写到 `work/` 下（不写进 `researchspec/` 的工作流状态，也不修改 `benchmark/` 合成夹具）。

---

报告已写入 `work/claim-verification-report.md`（78 行，未触动 `benchmark/` 夹具和 `researchspec/` 状态）。

**核查结论（3 条显式论断 + 1 条背景句）：**

- CLM-01（结构化提示 →可见修订增加）→ **SUPPORTED**，措辞与样本边界相符
- 「faster feedback may be offset by verification work」→ **SUPPORTED**，准确转述 SYN-INTERVIEW-02 的双向效应
- 「CLM-02 不被证据支持」的自我拒斥 → **SUPPORTED**，与来源 limits 一致
- 引言背景句 → **AMBIGUOUS**，缺样本边界标注

**主要缺口：**

- CLM-03、SYN-SURVEY-03、SYN-POLICY-04 在正文中完全未引用，证据池一半被弃用
- 草稿自列的「Methods / alternative explanations / policy variation / conclusion」四节全部缺位
- CLM-03 因果方向、CLM-02 净工作量、写作质量代理变量、态度→行为桥、政策可推广性均需额外材料（详见报告第三部分7 项）
