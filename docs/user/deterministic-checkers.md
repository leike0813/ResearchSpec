# 确定性检查报告

七个 ARS 检查能力提供包内 Python 入口：时间一致性、PDF 预检、材料护照、投稿文件包、引用存在性、引用核查汇总、污染信号。它们计算外部报告；ResearchSpec CLI 负责节点状态与正式 Gate。

先读取当前节点的 `researchspec instructions node:<run>/<node> --json`，按其中的输入角色准备材料。把路径转成绝对路径，写入工作目录中的请求文件：

```json
{"inputs":[{"role":"pdf_path","path":"/absolute/paper.pdf"}]}
```

从该能力包目录运行其 SKILL 中列出的命令，例如：

```bash
python3 validators/pdf-read-preflight.py pdf /absolute/request.json --generate
```

将标准输出保存为节点声明的 JSON 报告，然后通过 `advance` 提交报告路径。CLI 会把冻结图解析出的当前输入传给验证器；验证器重新计算并比较报告，拒绝缺失输入、被修改的结果或已不匹配当前材料的报告。验证期间不会改写报告或材料。

Python 使用宿主配置的环境。JSON 输入除 PDF 外使用标准库；YAML 输入需要 PyYAML，PDF 解析需要 pypdf。工具不会自动安装依赖。PDF 解析不可用时明确返回 `UNAVAILABLE`，不会把文件扩展名或 `%%EOF` 当成结构有效的证明。

引用与污染检查消费由用户授权的检索工具取得的结构化 resolver 观察，不会自行联网。缺少观察时保留 `unresolvable` 或 `not_checked`。摘要保留这些状态，不把它们算成查证成功。

报告通过重算验证只表示计算一致。报告中的 `FAIL`、`UNAVAILABLE`、`not_checked` 和适用范围仍需阅读；正式 Gate 的人类确认不会被脚本替代。投稿检查仅承诺报告中列出的文件、校验和、披露文件及显式文本格式检查；未提供的期刊政策和未执行的元数据检查保持显式未检查。护照检查是材料记录的一致性检查，不授予恢复运行或研究授权。
