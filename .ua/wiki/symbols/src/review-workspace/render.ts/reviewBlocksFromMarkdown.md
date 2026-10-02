
# reviewBlocksFromMarkdown
<!-- node: function:src/review-workspace/render.ts:reviewBlocksFromMarkdown -->

解析整篇 Markdown：先摘出脚注定义，再按块级公式切分，逐 token 产出标题、段落、表格单元格、代码块与脚注块；解析不出内容时回退为整篇原始块。
类型：函数  
复杂度：中等  
入边数：2  
标签：rendering、parsing、entry-point、markdown  
所属文件：[src/review-workspace/render.ts](../../../../files/src/review-workspace/render.ts.md)
源码：[src/review-workspace/render.ts:79](../../../../../../src/review-workspace/render.ts#L79)

## 被调用

| 调用方 | 位置 | 摘要 |
| --- | --- | --- |
| [prepareRevisionMasterReview](../../../../files/src/review-workspace/revision-master-prepare.ts.md) | src/review-workspace/revision-master-prepare.ts:41–135 | 完整装配流程：校验工作目录在 researchspec/ 之外、比对投影上下文与图交接一致、冻结源与图片、把业务表与冻结文档投影成带定位的块、补充日志片段定位，发布前再次确认候选未变化。 |
| [revisionMasterFixture](../../../../files/tests/helpers/revision-master.ts.md) | tests/helpers/revision-master.ts:13–47 | 构造通过 Schema 的最小工作区：两条原子评语、多对多线索关系、被阻塞与已就绪两种状态、五种作用域与一处 Markdown 块定位。 |

## 调用

该符号没有记录对外调用。
