# 中国专利申报材料语义审阅

审阅对象为本机原仓库 `main` 的 `14d40f003e9ca7d1d55dabbbd7d1aea455367368`，Git tree 为 `cb781cb497d9122b5f2bc84925ef3c2e7891b5c1`。GitHub 在固定版本时尚无提交。完整 135 个条目及处置见 `vendor/chinese-patent-helper/source-inventory.json`，SHA-256 为 `03c0dd7253d640b6859dd7497d7d8936101a5f86973f32583a26013c47a6619a`。快照保留 29 个文件，提取索引绑定其中 13 个原始运行资源。作者授权原创指令、代码和相关资料按 MIT 分发。

对照 `vendor/chinese-patent-helper/upstream/chinese-patent-helper/SKILL.md` 及三份上游参考文档，审查 `skills/capabilities/generation-chinese-patent-filing/` 的发布副本。

| 上游依据 | 发布结果 |
| --- | --- |
| 「禁止用常识、外部资料或推测填补本案技术特征」及说明书、权项、摘要、图样各节 | preserved。确认的必要特征、条件关系、依附结构和外观归属进入工作稿。核验记录保留来源、缺项和争议。 |
| 「主输入为一份可读取的中文 Markdown 或 DOCX」及任务目录版本规则 | adapted。增加已交付 `application_bundle` 的普通文件输入，逐件核对索引角色、限制和审定版本。产物及核验记录在 `researchspec/` 之外，原案卷和旧版留存。 |
| 「中文原始申请正常进入时」核对原文，外文原始申请忠实翻译及转换 | preserved。桌面推演分别使用中文原始案卷与外文原始案卷。前者直接进入原文核对、声明和附件分支，后者还须经译文逐项对照、分册转换及检查。发明和实用新型分别使用 150101 和 150102。第 19 条或第 34 条修改按专门事项交接。 |
| 「ZIP 的实际来源」及外观草稿、交付 ZIP 各自验收 | preserved。独立记录直接导入、逐页组稿、回显和预览证据。包转换成功只支持本地结果。历史样稿无法证明当前案卷状态。 |
| 「仅在用户明确授权时」导入，申请人认证并正式提交 | adapted。明示以本案官网入口、材料及操作范围为准。宿主止于草稿和预览，申请人处理敏感身份、正式提交及缴费。 |
| 兼容程序入口、七个 Python 模块、两件运行资产 | adapted。两个命令和参数延续原样，生成 DOCX 时清除样稿标题和作者字段。保留 XML ZIP 分册和样式模型。发布包中另外六个 Python 模块与源文件字节一致。 |
| 官方请求书、外观编辑器模板和仓库级开发材料 | removed from the published payload。参考文本链接国知局官方入口。合成回归样稿保留在维护快照。 |

五书 DOCX 与国知局官方下载件的 SHA-256 同为 `e52e39abec20f433c635e0586109465371ba7f5c144a01845e5dd49d04844c21`。按维护者确认随包保留原件，在 NOTICE 单列来源和许可状态。sRGB-v4.icc 与 Compact ICC Profiles 的 `8e22c542d632e8800625581c4b417a2d081c02b4` 对应 Git blob 一致，许可为 CC0-1.0。两件发布资产只参与本地转换。

Procedure 通过已选「知识产权材料」域独立激活。申请材料、草稿核验和浏览器协助均不形成 ResearchSpec Gate 或 Decision。现有专利申请图和状态继续由 CLI 管理。

用 `scripts/verify-chinese-patent-filing.py` 在独立目录验证发布包。上游 17 项转换测试通过，另验证 PCT 外文审定译文 DOCX 的模板元数据清理及四个 XML 分册。两次 authoring 字节一致。网页版行为依据当前案卷的实际回显，合成样稿只覆盖离线转换和流程分支核对。

## 结论

declared-fit-with-notes。四类申请可按对应材料和证据进入本地处理。当前案卷的草稿导入和整包预览须由申请人或经其授权的宿主核验。
