import { CHINESE_PATENT_FILING_ID } from "../../graph-profiles/intellectual-property.js";
import type { AuthoringOptions, CapabilityAuthoringSource } from "./author.js";

export const CHINESE_PATENT_HELPER_ROOT = "authoring/chinese-patent-helper";
export const CHINESE_PATENT_HELPER_SNAPSHOT = "vendor/chinese-patent-helper/upstream";
export const CHINESE_PATENT_HELPER_INDEX = CHINESE_PATENT_HELPER_ROOT + "/extraction-index.json";
export const CHINESE_PATENT_HELPER_OPTIONS: AuthoringOptions = {
  extractionIndexPath: CHINESE_PATENT_HELPER_INDEX,
  origin: "vendor-derived",
  standaloneOnly: true,
};

const localAsset = (file: string, read_when: string, license = "MIT") => ({
  source_path: CHINESE_PATENT_HELPER_ROOT + "/" + file,
  output_path: file,
  read_when,
  license,
});
const upstreamAsset = (file: string, read_when: string, license = "MIT") => ({
  ...localAsset(file, read_when, license),
  source_path: CHINESE_PATENT_HELPER_SNAPSHOT + "/chinese-patent-helper/" + file,
});

export const CHINESE_PATENT_FILING: CapabilityAuthoringSource = {
  capability_id: CHINESE_PATENT_FILING_ID,
  title: "中国专利申报材料",
  description: "根据交底书、审定稿、外观图样或 PCT 原始申请准备发明、实用新型、外观设计及 PCT 中国国家阶段材料，生成国知局 CNIPA XML ZIP 和 DOCX，核对申报草稿（China patent filing, PCT national phase）。",
  class: "generation",
  node_kind: "producer",
  execution_type: "mixed",
  gate_policy: "advisory",
  license: "MIT",
  extraction_artifact_id: "CPH-CAP-01",
  procedure_path: CHINESE_PATENT_HELPER_ROOT + "/SKILL.md",
  inputs: [
    { role: "filing_source", schema_ref: "chinese-patent-filing-source.v1", required: false, source_policy: "handoff" },
    { role: "application_bundle", schema_ref: "application-bundle.v1", required: false, source_policy: "handoff" },
  ],
  outputs: [{ role: "filing_verification", schema_ref: "chinese-patent-filing-verification.v1", required: true }],
  knowledge_sources: [],
  package_assets: [
    localAsset("references/申请文件与核验.md", "checking domestic form fields, claims, figures or evidence"),
    localAsset("references/PCT进入中国国家阶段.md", "preparing a PCT China national phase entry"),
    localAsset("references/官方XML转换与草稿导入.md", "converting an approved draft or verifying draft readback"),
    upstreamAsset("scripts/build_filing.py", "producing an editable DOCX or CNIPA ZIP from approved Markdown or DOCX"),
    upstreamAsset("scripts/docx_to_cnipa_zip.py", "reconverting an approved DOCX to a CNIPA ZIP"),
    { ...upstreamAsset("scripts/filing_docx_reader.py", "diagnosing DOCX input"), recovery_only: true },
    { ...localAsset("scripts/filing_docx_writer.py", "diagnosing DOCX output"), recovery_only: true },
    { ...upstreamAsset("scripts/filing_ir.py", "diagnosing the shared filing document model"), recovery_only: true },
    { ...upstreamAsset("scripts/filing_markdown.py", "diagnosing Markdown input"), recovery_only: true },
    { ...upstreamAsset("scripts/filing_xml_writer.py", "diagnosing XML output"), recovery_only: true },
    upstreamAsset("assets/WORD转XML编辑器五书模板文件.docx", "rendering local DOCX or preparing a copy for the official editor", "LicenseRef-CNIPA-Official-Template"),
    upstreamAsset("assets/sRGB-v4.icc", "converting CMYK design images with embedded source profiles", "CC0-1.0"),
    { ...localAsset("LICENSE", "checking the license of original material"), recovery_only: true },
    { ...localAsset("NOTICE.md", "checking the source and terms of the distributed assets"), recovery_only: true },
  ],
};
