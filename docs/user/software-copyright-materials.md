# 软件著作权登记材料

在已初始化的 ResearchSpec 项目里，可以直接请 Agent 为指定软件准备中国软件著作权登记 R11 一般交存材料。论文介绍软件功能或提及登记情况时，Navigate 继续使用论文流程。如果你同时需要论文和登记材料，Navigate 会另建登记案件，分别交付。

## 启用登记 Procedure

登记 Procedure 随「知识产权材料」工具域提供。先查看该域及安装预览，确认后再安装。

```sh
researchspec plugin show intellectual-property-materials
researchspec plugin install intellectual-property-materials --dry-run --yes
researchspec plugin install intellectual-property-materials --yes
researchspec instructions procedure:plugin-software-copyright-materials
```

通常在对话中制作材料即可。需要正式工作流记录时，可另行确认启动登记 profile。通过本地验收的案件索引对应交付角色 `registration_materials`。

曾安装旧测试版「私法与民事义务」域的项目，可先安装新域，再用
`researchspec plugin uninstall private-law-and-civil-obligations` 清理旧选择。

## 确认、制作和复核

先确认软件名称、版本、著作权人、开发和发表事实，以及允许披露的源码文件和顺序。操作手册应基于软件实际运行和经确认的截图。Agent 在 `work/software-copyright/<case-id>/` 保存案件文件。

- `正式资料/` 包含申请表信息，以及程序鉴别材料和操作手册各一份 DOCX、一份 PDF。
- `材料索引.json` 和 `校验报告.md` 记录已验收的文件和核验结果。
- `草稿/` 保留确认依据、源码记录和独立复核证据。所需的证明文件留在 `证明材料/`。

请安排未参与制作的审核者核对源码真实性和页序、手册步骤和截图、目录和排版、申请表及证明文件。本机转换工具不可用时，可用 Word 工具更新目录并导出 PDF，再交给 Agent 检查。必要文件或独立复核缺失时，案件会保留现有材料，等待补齐后再验收。

## 选择填报方式

1. **本地交付**。验收后领取材料，按自己的安排办理登记。
2. **手工填报指引**。根据本案材料获取字段和附件对照，由申请人在平台上操作。
3. **宿主浏览器协助**。在当前会话单独确认案件、站点、字段和附件范围。Agent 在授权内填写、上传和保存草稿，并回读平台状态。页面状态不明确时，记录已核实的事实，再由申请人决定如何继续。

登录、身份核验、申请声明、签章和正式提交均由申请人完成。
