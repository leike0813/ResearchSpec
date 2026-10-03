# 交底接入 (Patent intake)

## 何时

用户给出技术材料、项目目录或一句话方案，要开始交底挖掘；或者上游组合已经把材料
整理成案件索引，本阶段接过来定案。

## 输入

- `technical_materials`（必需）：发明人材料、项目目录或可选 `.tex`。若上游已经整理成一份 `kind: case` 的索引，就按已整理案件接入。
- `research_report` / `synthesis_report`（可选）：研究阶段的既有结论，只读引用。
- `graded_sources`（可选）：学术来源分级。评的是学术来源可信度，不是专利方案完整度；
  引用时保留它给出的等级，不要拿它去判断交底写得够不够。

## 步骤

1. 先判断 `technical_materials` 是原始材料还是已整理的案件索引：是一份 `kind: case` 索引就走「接入既有案件」，是原始材料或目录就走「新案建档」。
2. 三个问题收敛边界：Q1 技术主题或产品模块，一句话；Q2 专利类型（发明 / 实用新型 /
   外观设计 / 不确定，默认发明）；Q3 文头联系人（不提供就全部写「待填写」，不阻塞）。
   细则与例子见 `knowledge/pd-kp-02-patent-intake-and-types.md`。
3. 新案建档：扫描材料，逐项记录来源路径、类型线索、假设与缺口。材料超出本案时只取相关技术要点，不做全库扫描。读入的 `research_report` / `synthesis_report` 只引用其结论与其定位，不复制正文。
4. `.tex` 稿件按「先结构后正文」扫一遍：读 `\\section` / `\\subsection` 层级定骨架，读公式环境取符号，读 `\\label` / `\\ref` 取件号交叉引用，把图表清单记下来。只抽与本案相关的章节，不整篇转写。
5. 接入既有案件：读索引的 `metadata`（`patent_type`、`case_id`、已有假设）与 `files`，核对索引与实际材料一致；保留其中已记录的研究引用，作为一条 `research_reference` 留在 `metadata` 里。本阶段补充或修正类型、边界与缺口，不推翻上游已定的技术事实。
6. 材料明显偏结构或外观、且当前仍是默认发明时，反问一次并等待确认；未回复维持发明。
7. PDF / PPTX / DOCX 材料按需转成可读文本：

```bash
python tools/pdf_to_md.py --input <材料.pdf> --output <工作区相对路径>
python tools/pptx_to_md.py --input <材料.pptx> --output <工作区相对路径>
python tools/docx_to_md.py --input <材料.docx> --output <工作区相对路径>
python tools/patent_type.py --pub <公开号> --json
```

   转换依赖缺失就跳过该件，保留原始文件。
8. 写 `patent_case` 索引，结构见 `contracts/patent-file-index.v1.md`：

```bash
python tools/patent_files.py create --project-root <root> --kind case \
  --out <out>/case.index.json --file technical_materials=<root>/<主材料> \
  --limitation "<缺口或限制>" --meta patent_type=invention --meta case_id=<案件 slug>
```

   每一件纳入索引的材料都用 `--file role=<path>` 单独登记一次。

## 硬约束

- 不得从聊天空写交底；不得把仓库 `examples/*/knowledge/` 当成交底产出。
- 接入既有案件时不得删改上游已记录的 `research_reference`；发现与材料冲突就写进 `limitations`，不静默覆盖。
- 发明人、申请人、文头联系人缺失就写「待填写」，不阻塞。
- 类型默认发明，只有用户明确说明或本轮追问确认才切换。
- 索引写在工作区普通目录下，不写进 `researchspec/`，也不带 run、节点、Gate 或 Decision 字段。

## 失败路径

- 路径不可读或材料缺失：写进 `limitations` 并继续，不编造内容。
- 转换依赖缺失：保留原始材料并把该项记为 `not_checked`，不声称已转换。
- 传入索引校验不通过（`kind` 不对、路径越界、文件缺失）：照实报告并停下，不要改索引去迁就。

## 完成

输出 `patent_case`（`patent-case.v1`，`kind: case`）。`metadata` 含 `patent_type`、`case_id`、`assumptions` 与 `research_reference`（如有），`limitations` 列全本次识别到的缺口。汇报实际文件路径，不代为启动下游节点。
