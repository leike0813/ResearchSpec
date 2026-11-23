#!/usr/bin/env python3
"""Build and verify one applicant-approved R11 case using local files."""

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import tempfile
import unicodedata
import zipfile
from datetime import date
from pathlib import Path

from build_docx_from_md import (
    DOCX_AVAILABLE, add_header_to_existing_docx,
    build_manual_docx_python, normalize_docx_text_color, probe_image_size,
)
from common import COPYRIGHT_CODE_EXTS, is_excluded, is_known_config_file, split_source_lines
from generate_application_info import FIELD_ORDER, effective_len
from render_code_pdf import FPDF_AVAILABLE, render_markdown_to_pdf


CASE_ROOT = "work/software-copyright"
DRAFT = "草稿"
FORMAL = "正式资料"
INDEX = "材料索引.json"
REPORT = "校验报告.md"
REQUEST = f"{DRAFT}/材料确认.json"
REVIEW = f"{DRAFT}/独立复核.json"
PREPARATION = f"{FORMAL}/.制作记录.json"
SOURCE_LEDGER = f"{DRAFT}/源码记录.json"
MANUAL = f"{DRAFT}/操作手册.md"
ARTIFACTS = {
    "application": f"{FORMAL}/申请表信息.txt",
    "source_docx": f"{FORMAL}/程序鉴别材料.docx",
    "manual_docx": f"{FORMAL}/操作手册.docx",
    "source_pdf": f"{FORMAL}/程序鉴别材料.pdf",
    "manual_pdf": f"{FORMAL}/操作手册.pdf",
}
APPROVALS = ("project", "business", "application", "sources", "screenshots", "draft")
REVIEW_CHECKS = ("source_authenticity", "manual_and_screenshots", "manual_layout_and_contents", "application_and_proofs")
CHAPTERS = ("说明", "功能特点", "系统要求", "常见问题解答", "术语表")
PLACEHOLDER = re.compile(r"待用户确认|截图预留|截图缺失|截图无法插入|STOP_FOR_USER|\b(?:TODO|TBD)\b")
IMAGE = re.compile(r"!\[([^\]\n]+)\]\((截图/[^()\n]+\.(?:png|jpe?g))\)", re.IGNORECASE)
LINES_PER_PAGE = 50


class CaseError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise CaseError(message)


def bounded(root, relative):
    require(isinstance(relative, str) and relative, "需要明确的相对路径")
    parts = relative.split("/")
    require(not any(part in ("", ".", "..") for part in parts) and
            not re.search(r"[\\:\x00-\x1f]", relative), "路径必须留在指定目录内")
    path = root
    for part in parts:
        path = path / part
        require(not path.is_symlink(), f"路径含符号链接：{relative}")
    return path


def regular(path, limit=80_000_000):
    require(path.is_file() and 0 < path.stat().st_size <= limit, f"缺少、为空或超出大小限制：{path.name}")
    return path


def load(path):
    value = json.loads(regular(path, 2_000_000).read_text(encoding="utf-8"))
    require(isinstance(value, dict), f"需要 JSON 对象：{path.name}")
    return value


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def atomic(path, data):
    require(not path.exists() or path.is_file(), f"输出位置不是文件：{path.name}")
    with tempfile.NamedTemporaryFile(dir=path.parent, delete=False) as temporary:
        temporary.write(data)
    temp = Path(temporary.name)
    try:
        os.replace(temp, path)
    finally:
        temp.unlink(missing_ok=True)


def fingerprints(root, paths):
    return {name: digest(regular(bounded(root, path)).read_bytes()) for name, path in paths.items()}


def validated_fields(request, source_pages):
    supplied = request.get("fields")
    require(isinstance(supplied, dict) and set(supplied) <= set(FIELD_ORDER), "申请表包含未知字段")
    fields = {}
    for field in FIELD_ORDER:
        value = str(source_pages) if field == "页数" else supplied.get(field, "")
        require(isinstance(value, str) and not PLACEHOLDER.search(value) and
                not re.search(r"[\x00-\x1f]", value), f"申请表字段缺少确认或含控制字符：{field}")
        if field not in ("软件简称", "首次发表日期"):
            require(value.strip(), f"缺少申请表字段：{field}")
        fields[field] = value.strip()
    require(re.fullmatch(r"[1-9][0-9]*", fields["源程序量"]), "源程序量应为实际总行数")
    require(fields["发表状态"] in ("已发表", "未发表"), "确认发表状态")
    completion = date.fromisoformat(fields["开发完成日期"])
    require(completion.isoformat() == fields["开发完成日期"], "开发完成日期应采用 YYYY-MM-DD")
    publication = fields["首次发表日期"]
    if fields["发表状态"] == "已发表":
        publication_date = date.fromisoformat(publication)
        require(publication_date.isoformat() == publication and publication_date >= completion, "核对首次发表日期")
    else:
        require(not publication, "未发表的软件留空首次发表日期")
    limits = {field: 50 for field in FIELD_ORDER[12:18] + FIELD_ORDER[20:22]}
    limits.update({"编程语言": 120, "软件的主要功能": 1300, "软件的技术特点": 100})
    for field, maximum in limits.items():
        require(effective_len(fields[field]) <= maximum, f"申请表字段超长：{field}")
    require(effective_len(fields["软件的主要功能"]) >= 500, "主要功能不足 500 字，请用真实功能证据补写")
    require("页数" not in supplied or supplied["页数"] == fields["页数"], "申请表页数与程序鉴别材料不一致")
    return fields


def source_material(root, request):
    selection = request.get("sources")
    require(isinstance(selection, list) and selection and all(isinstance(name, str) for name in selection),
            "需要申请人确认的有序源码列表")
    require(len(selection) == len(set(selection)), "源码列表含重复路径")
    project = request.get("project")
    source_root = root if project == "." else bounded(root, project)
    require(source_root.is_dir(), "目标软件项目目录不存在")
    stream = []
    ledger = []
    for name in selection:
        path = bounded(source_root, name)
        relative = path.relative_to(root)
        require(not any(is_excluded(Path(part)) or part == "researchspec" for part in relative.parts)
                and not relative.is_relative_to(CASE_ROOT) and path.suffix.lower() in COPYRIGHT_CODE_EXTS
                and not is_known_config_file(path), f"不支持作为鉴别材料的文件：{name}")
        data = regular(path, 800_000).read_bytes()
        source = data.decode("utf-8-sig")
        require(not re.search(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", source), f"源码含二进制或控制字符：{name}")
        lines = [(name, number, line) for number, line in enumerate(split_source_lines(source), 1) if line.strip()]
        require(lines, f"源码文件没有可排版的内容：{name}")
        stream.extend(lines)
        ledger.append({"path": name, "sha256": digest(data), "nonblank_lines": len(lines)})
    edge = 30 * LINES_PER_PAGE
    delivery = stream if len(stream) <= 2 * edge else stream[:edge] + stream[-edge:]
    pages = [delivery[start:start + LINES_PER_PAGE] for start in range(0, len(delivery), LINES_PER_PAGE)]
    records = [
        [{"path": name, "line": number} for name, number, _ in page]
        for page in pages
    ]
    return [[line for _, _, line in page] for page in pages], {
        "project": project, "files": ledger, "pages": records,
        "deposit": "all" if len(stream) <= 2 * edge else "first-and-last-30",
    }


def manual_material(case, fields):
    manual = regular(bounded(case, MANUAL), 2_000_000).read_text(encoding="utf-8")
    require(manual.splitlines()[0] == f'# {fields["软件全称"]} 操作手册', "操作手册标题须与确认名称一致")
    require(not PLACEHOLDER.search(manual) and not re.search(r"<[/!a-zA-Z]|^\[.+\]:", manual, re.MULTILINE),
            "手册含占位内容、原始 HTML 或引用式资源")
    headings = re.findall(r"^##\s+([^\n]+)$", manual, re.MULTILINE)
    chapters = [re.sub(r"^[一二三四五六七八九十]+、", "", title) for title in headings]
    require(len(chapters) >= 6 and chapters[:3] == list(CHAPTERS[:3]) and chapters[-2:] == list(CHAPTERS[-2:]),
            "核对操作手册章节及真实的功能模块")
    images = {}
    for line in manual.splitlines():
        if "![" not in line:
            continue
        match = IMAGE.fullmatch(line.strip())
        require(match is not None, "截图须使用独立一行、图注和截图目录内的 PNG 或 JPEG 路径")
        caption, name = match.groups()
        require(re.fullmatch(rf"图\s*{len(images) + 1}\s+\S.*", caption), "截图需要连续编号和图注")
        image_path = regular(bounded(case, name), 20_000_000)
        require(probe_image_size(image_path), f"无法读取截图尺寸：{image_path.name}")
        images[caption] = name
    return headings, fingerprints(case, images)


def case_inputs(root, case):
    request_path = bounded(case, REQUEST)
    request = load(request_path)
    approvals = request.get("approvals")
    require(isinstance(approvals, dict) and all(approvals.get(key) is True for key in APPROVALS),
            "需要项目、业务、申请表、源码顺序、截图方式和草稿的申请人确认")
    record = request.get("evidence")
    require(isinstance(record, str) and record.startswith(f"{DRAFT}/"), "需要草稿目录内的业务证据记录")
    pages, ledger = source_material(root, request)
    fields = validated_fields(request, len(pages))
    headings, images = manual_material(case, fields)
    proofs = request.get("required_proofs", [])
    require(isinstance(proofs, list) and all(isinstance(item, str) and item.startswith("证明材料/") for item in proofs),
            "需要申请人确认的证明材料路径")
    inputs = {
        **fingerprints(case, {"request": REQUEST, "manual": MANUAL, "evidence": record}),
        "screenshots": images,
        "proofs": fingerprints(case, {item: item for item in proofs}),
        "sources": digest(encoded(ledger)),
    }
    return pages, ledger, fields, headings, inputs


def native(argv, *, cwd=None, timeout=120):
    result = subprocess.run(argv, cwd=cwd, check=True, stdin=subprocess.DEVNULL,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
    return result.stdout.decode("utf-8", errors="replace")


def pandoc_manual(case, output, header):
    pandoc = shutil.which("pandoc")
    require(pandoc, "操作手册 Word 生成需要已安装的 python-docx 或 Pandoc")
    native([pandoc, "--from=markdown-raw_html-raw_attribute", "--to=docx", "--toc",
            "--toc-depth=2", "--metadata=toc-title:目录",
            f"--resource-path={case}", str(bounded(case, MANUAL)), "-o", str(output)], cwd=case)
    add_header_to_existing_docx(output, header)


def write_code_docx(output, pages, header):
    # Source is passed as data so Markdown fences or section markers in code stay literal.
    from build_docx_from_md import minimal_docx, paragraph_xml

    body = []
    for page in pages:
        for line in page:
            body.append(paragraph_xml(line.expandtabs(4), font="Consolas", size_half_points=14, line_twips=280))
        if page is not pages[-1]:
            body[-1] = body[-1].replace('</w:r></w:p>', '<w:br w:type="page"/></w:r></w:p>')
    minimal_docx(output, "\n".join(body), header)


def prepare(root, case):
    pages, ledger, fields, _, inputs = case_inputs(root, case)
    preparation = bounded(case, PREPARATION)
    doc_paths = {name: ARTIFACTS[name] for name in ("source_docx", "manual_docx")}
    if preparation.exists():
        saved = load(preparation)
        require(saved["inputs"] == inputs and saved["documents"] == fingerprints(case, doc_paths),
                "已有材料与当前输入不同。保留旧案，复制确认稿到新案再制作")
        require(load(bounded(case, SOURCE_LEDGER)) == ledger, "源码记录已变化")
        return saved
    formal = bounded(case, FORMAL)
    require(not formal.exists() or (formal.is_dir() and not any(formal.iterdir())), "正式目录已有内容，请先核对")
    ledger_path = bounded(case, SOURCE_LEDGER)
    require(not ledger_path.exists() or load(ledger_path) == ledger, "源码记录与当前输入不一致")
    header = f'{fields["软件全称"]} {fields["版本号"]}'
    with tempfile.TemporaryDirectory(dir=case) as directory:
        temporary = Path(directory)
        staged = temporary / FORMAL
        staged.mkdir(mode=0o700)
        source, manual = (bounded(temporary, doc_paths[name]) for name in ("source_docx", "manual_docx"))
        write_code_docx(source, pages, header)
        if DOCX_AVAILABLE:
            build_manual_docx_python(bounded(case, MANUAL), manual, case, fields["软件全称"], fields["版本号"])
        else:
            pandoc_manual(case, manual, header)
        normalize_docx_text_color(manual)
        require(not PLACEHOLDER.search(docx_text(manual)), "手册 Word 包含未完成的内容")
        saved = {"inputs": inputs, "documents": fingerprints(temporary, doc_paths)}
        atomic(bounded(temporary, PREPARATION), encoded(saved))
        atomic(ledger_path, encoded(ledger))
        staged.rename(formal)
    return saved


def docx_text(path):
    import xml.etree.ElementTree as xml

    with zipfile.ZipFile(path) as document:
        parts = [name for name in document.namelist()
                 if name == "word/document.xml" or re.fullmatch(r"word/header\d+\.xml", name)]
        return "\n".join("".join(xml.fromstring(document.read(name)).itertext()) for name in parts)


def compact(text):
    return "".join(unicodedata.normalize("NFC", text).split())


def pdf_pages(path):
    regular(path)
    info, pdftotext = shutil.which("pdfinfo"), shutil.which("pdftotext")
    require(info and pdftotext, "PDF 核验需要已安装的 pdfinfo 和 pdftotext")
    metadata = native([info, str(path)])
    count = re.search(r"^Pages:\s+([1-9][0-9]*)\s*$", metadata, re.MULTILINE)
    require(count and re.search(r"^Encrypted:\s+no\b", metadata, re.MULTILINE), f"PDF 无有效页数或已加密：{path.name}")
    pages = native([pdftotext, "-layout", str(path), "-"]).split("\f")
    if pages[-1] == "":
        pages.pop()
    require(len(pages) == int(count.group(1)), f"PDF 页数无法验证：{path.name}")
    return pages


def verified(root, case):
    pages, ledger, fields, headings, inputs = case_inputs(root, case)
    saved = load(bounded(case, PREPARATION))
    require(saved["inputs"] == inputs, "源码、草稿、截图或确认范围已变化")
    hashes = fingerprints(case, {name: file for name, file in ARTIFACTS.items() if name != "application"})
    require(hashes["source_docx"] == saved["documents"]["source_docx"], "程序鉴别 Word 文件已变化")
    require(load(bounded(case, SOURCE_LEDGER)) == ledger, "源码记录已变化")
    header = compact(f'{fields["软件全称"]} {fields["版本号"]}')
    for kind in ("source", "manual"):
        require(header in compact(docx_text(bounded(case, ARTIFACTS[f"{kind}_docx"]))), "Word 页眉名称或版本不一致")
    source = pdf_pages(bounded(case, ARTIFACTS["source_pdf"]))
    manual = pdf_pages(bounded(case, ARTIFACTS["manual_pdf"]))
    require(len(source) == len(pages), "程序鉴别 PDF 页数不符")
    for index, (actual, expected) in enumerate(zip(source, pages), 1):
        lines = [compact(line) for line in actual.splitlines() if line.strip()]
        require(lines and header in lines[0] and f"第{index}页" in lines[0], f"程序鉴别 PDF 第 {index} 页页眉或页码不符")
        require(lines[1:] == [compact(line) for line in expected], f"程序鉴别 PDF 第 {index} 页源码与确认内容不符")
    require(all(header in compact(page) for page in manual), "操作手册 PDF 页眉名称或版本不一致")
    manual_text = compact("".join(manual))
    require(all(compact(heading) in manual_text for heading in headings) and "目录" in manual_text,
            "操作手册 PDF 缺少目录或已确认的章节")
    require(not PLACEHOLDER.search(manual_text), "操作手册 PDF 含未完成内容")
    application = "".join(f"{name}：{value}\n" for name, value in fields.items()).encode()
    hashes["application"] = digest(application)
    summary = {
        "software_name": fields["软件全称"], "version": fields["版本号"],
        "artifact_paths": ARTIFACTS, "sha256": hashes, "source_pages": len(source), "manual_pages": len(manual),
        "proof_paths": sorted(inputs["proofs"]), "proof_sha256": inputs["proofs"],
    }
    summary["case_fingerprint"] = digest(encoded({"inputs": inputs, "materials": summary}))
    return summary, application


def review(case, summary):
    record = load(bounded(case, REVIEW))
    require(record.get("case_fingerprint") == summary["case_fingerprint"], "独立复核与当前材料不匹配")
    reviewer, evidence = record.get("reviewer"), record.get("evidence")
    require(isinstance(reviewer, str) and reviewer.strip() and isinstance(evidence, str) and evidence.strip()
            and all(record.get(key) is True for key in REVIEW_CHECKS), "缺少可追溯的独立复核与申请人确认")
    return digest(encoded(record))


def inspect_or_accept(root, case, action):
    summary, application = verified(root, case)
    if action == "inspect":
        return summary
    summary["review_sha256"] = review(case, summary)
    report = (
        f'# R11 材料校验\n\n{summary["software_name"]} {summary["version"]}\n\n'
        f'- 程序鉴别材料 {summary["source_pages"]} 页，逐页核对确认源码。\n'
        f'- 操作手册 {summary["manual_pages"]} 页，已核对名称、版本、目录和章节。\n'
        f'- 独立复核见 `{REVIEW}`。\n'
    ).encode()
    if action == "check-ready":
        require(load(bounded(case, INDEX)) == summary and
                regular(bounded(case, REPORT)).read_bytes() == report and
                regular(bounded(case, ARTIFACTS["application"])).read_bytes() == application,
                "材料索引、校验报告或正式申请表已变化")
        return summary
    path = bounded(case, ARTIFACTS["application"])
    require(not path.exists() or path.read_bytes() == application, "正式申请表已有不同内容")
    atomic(path, application)
    atomic(bounded(case, REPORT), report)
    atomic(bounded(case, INDEX), encoded(summary))
    return summary


def export_pdf(root, case):
    saved = load(bounded(case, PREPARATION))
    pages, _, fields, _, inputs = case_inputs(root, case)
    require(saved["inputs"] == inputs, "材料输入已变化，请核对制作记录")
    require(digest(regular(bounded(case, ARTIFACTS["source_docx"])).read_bytes())
            == saved["documents"]["source_docx"], "程序鉴别 Word 文件已变化")
    office = shutil.which("soffice") or shutil.which("libreoffice")
    if FPDF_AVAILABLE and not bounded(case, ARTIFACTS["source_pdf"]).exists():
        with tempfile.TemporaryDirectory(dir=case) as directory:
            markdown, pdf = Path(directory) / "source.md", Path(directory) / "source.pdf"
            # The upstream renderer reserves the Markdown fence and page markers.
            if all(not re.match(r"^\s*(?:```|##\s+第\s*\d+\s*页)", line) for page in pages for line in page):
                markdown.write_text("\n".join(
                    f"## 第 {index} 页\n```\n" + "\n".join(page) + "\n```"
                    for index, page in enumerate(pages, 1)), encoding="utf-8")
                render_markdown_to_pdf(markdown, pdf, f'{fields["软件全称"]} {fields["版本号"]}')
                atomic(bounded(case, ARTIFACTS["source_pdf"]), pdf.read_bytes())
    missing = [kind for kind in ("source", "manual") if not bounded(case, ARTIFACTS[f"{kind}_pdf"]).exists()]
    if missing and office:
        with tempfile.TemporaryDirectory(dir=case) as directory:
            target = Path(directory)
            arguments = [str(bounded(case, ARTIFACTS[f"{kind}_docx"])) for kind in missing]
            native([office, f"-env:UserInstallation={(target / 'profile').as_uri()}", "--headless",
                    "--convert-to", "pdf", "--outdir", directory, *arguments], timeout=180)
            for kind in missing:
                dest = bounded(case, ARTIFACTS[f"{kind}_pdf"])
                generated = target / dest.name
                if generated.is_file():
                    atomic(dest, regular(generated).read_bytes())
    return {"missing_pdfs": [ARTIFACTS[f"{kind}_pdf"] for kind in missing
                            if not bounded(case, ARTIFACTS[f"{kind}_pdf"]).exists()]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=("prepare", "export-pdf", "inspect", "accept", "check-ready"))
    parser.add_argument("--root", type=Path, required=True, help="ResearchSpec project root")
    parser.add_argument("--case", required=True, help="Case directory name under work/software-copyright")
    args = parser.parse_args()
    try:
        require(re.fullmatch(r"[a-z0-9][a-z0-9-]{0,79}", args.case), "需要有效的 case-id")
        root = args.root.resolve(strict=True)
        case = bounded(root, f"{CASE_ROOT}/{args.case}")
        require(case.is_dir(), "软著工作目录不存在")
        if args.action == "prepare":
            result = prepare(root, case)
        elif args.action == "export-pdf":
            result = export_pdf(root, case)
        else:
            result = inspect_or_accept(root, case, args.action)
        print(json.dumps(result, ensure_ascii=False))
        return 0
    except (OSError, ValueError, KeyError, zipfile.BadZipFile, subprocess.SubprocessError, RuntimeError) as error:
        print(json.dumps({"action": args.action, "error": str(error)}, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
