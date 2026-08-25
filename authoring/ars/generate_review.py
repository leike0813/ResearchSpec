#!/usr/bin/env python3
"""ARS 提取审阅 HTML 生成器（里程碑通用）。

用法: python generate_review.py <milestone-dir> [output.html]
- 扫描 milestone-dir 下全部带提取头（ARS 提取工件）的 .md 文件；
- 对每个工件做逐字节保真验证（sha256 比对 vendor/ars 上游原文/切片）；
- 读取 milestone-dir/review-notes.md（## 覆盖检查 / ## 未提取依赖 / ## 审阅要点）；
- 输出自包含审阅 HTML。
"""
import hashlib
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent   # ResearchSpec/
ARS = ROOT / "vendor/ars"

milestone = sys.argv[1] if len(sys.argv) > 1 else "m1-research"
MIL = ROOT / "authoring/ars" / milestone
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "artifacts/generated/arsu-reviews" / f"{milestone}-review.html"


def parse_header(text: str):
    m = re.search(r"<!--(.*?)-->", text, re.S)
    if not m:
        return {}
    head = m.group(1)
    body = text[m.end():].lstrip("\n")
    d = {"body": body}
    mode = None
    for line in head.split("\n"):
        s = line.strip()
        if s.startswith("工件类型:"):
            d["kind"] = s.split(":", 1)[1].strip()
        elif s.startswith("能力/包 ID:"):
            d["id"] = s.split(":", 1)[1].strip()
        elif s.startswith("来源对照（source mapping）:"):
            mode = "source"
        elif s.startswith("变更台账（ledger）:"):
            mode = "ledger"
        elif s.startswith("说明:"):
            mode = "note"
        elif s.startswith("════"):
            continue
        elif mode == "source" and s.startswith("- "):
            d.setdefault("sources", []).append(s[2:].strip())
        elif mode == "ledger" and re.match(r"^\d+\. \[", s):
            d.setdefault("ledger", []).append(s.split("] ", 1)[1])
    return d


def sha256(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def verify(meta: dict):
    src_line = next((s for s in meta.get("sources", []) if s.startswith("vendor/ars/")), None)
    if not src_line:
        return {"status": "skip", "detail": "无 vendor/ars 来源行", "upstream": "—"}
    m = re.match(r"vendor/ars/(.+\.(?:md|py|json))", src_line)
    upstream = ARS / m.group(1)
    if not upstream.exists():
        return {"status": "error", "detail": f"上游文件不存在: {upstream}", "upstream": src_line}
    rng_matches = list(re.finditer(r"L(\d+)-(\d+)", src_line))
    rng = rng_matches[-1] if rng_matches else None  # 取最后一个匹配，避开章节名中的 L\d-\d 干扰
    upstream_text = upstream.read_text(encoding="utf-8")
    if rng:
        lines = upstream_text.split("\n")
        expected = "\n".join(lines[int(rng.group(1)) - 1:int(rng.group(2))]) + "\n"
    else:
        expected = upstream_text
    body = meta.get("body", "")
    ok = sha256(body) == sha256(expected)
    return {
        "status": "pass" if ok else "FAIL",
        "detail": f"sha256 比对{'一致' if ok else '不一致!'} · 工件 {len(body.splitlines())} 行 vs 上游切片 {len(expected.splitlines())} 行",
        "upstream": f"vendor/ars/{m.group(1)}" + (f" L{rng.group(1)}-{rng.group(2)}" if rng else "（全文）"),
    }


def load_notes():
    p = MIL / "review-notes.md"
    if not p.exists():
        return {"title": milestone, "intro": "", "coverage": "", "deps": "", "tips": ""}
    text = p.read_text(encoding="utf-8")
    sections = re.split(r"^## ", text, flags=re.M)
    title = sections[0].strip()
    notes = {"title": "", "intro": "", "coverage": "", "deps": "", "tips": ""}
    for s in sections[1:]:
        name, _, body = s.partition("\n")
        body = body.strip()
        if name.startswith("覆盖检查"):
            notes["coverage"] = body
        elif name.startswith("未提取依赖"):
            notes["deps"] = body
        elif name.startswith("审阅要点"):
            notes["tips"] = body
    head = sections[0].strip().split("\n")
    if head and head[0].startswith("# "):
        notes["title"] = head[0][2:].strip()
        notes["intro"] = "\n".join(head[1:]).strip()
    else:
        notes["title"] = title
    return notes


CSS = """
:root{--ink:#1c2433;--soft:#4a5568;--muted:#7a8699;--bg:#f7f8fa;--card:#fff;--line:#e3e8ef;
--accent:#2b4c8c;--ok:#2e7d4f;--fail:#b23b3b;--warn:#b36b00}
*{box-sizing:border-box}body{margin:0;font-family:-apple-system,'Segoe UI','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif;
color:var(--ink);background:var(--bg);line-height:1.7;font-size:15px}
code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
code{background:#f0f2f5;padding:1px 5px;border-radius:4px;font-size:.88em}
main{max-width:1180px;margin:0 auto;padding:30px 40px 90px}
h1{font-size:27px;margin:0 0 4px}h2{font-size:21px;margin:46px 0 12px;padding:10px 0 8px 14px;border-left:5px solid var(--accent);
border-bottom:1px solid var(--line);background:linear-gradient(90deg,#eef3fb,transparent 70%);border-radius:0 6px 6px 0}
h3{font-size:16px;margin:26px 0 8px;color:var(--accent)}
.meta{color:var(--muted);font-size:13px;margin-bottom:26px}
table{border-collapse:collapse;width:100%;font-size:13.5px;background:var(--card);border:1px solid var(--line);border-radius:8px;overflow:hidden;margin:10px 0}
th{background:#eef1f6;text-align:left;padding:7px 12px;border-bottom:2px solid var(--line);white-space:nowrap}
td{padding:7px 12px;border-bottom:1px solid #edf0f4;vertical-align:top}
tr:last-child td{border-bottom:none}td code{white-space:nowrap}
.badge{display:inline-block;font-size:11.5px;font-weight:600;padding:1px 9px;border-radius:999px}
.b-pass{background:#eef7f1;color:var(--ok);border:1px solid #c4e0cf}.b-fail{background:#fdf1f0;color:var(--fail);border:1px solid #ecc8c8}
.b-warn{background:#fdf6e8;color:var(--warn);border:1px solid #ecd9b0}.b-kp{background:#eef3fb;color:var(--accent);border:1px solid #c9d8ef}
.b-cap{background:#f3f0fb;color:#5b4a9e;border:1px solid #d9d2ee}
.artifact{border:1px solid var(--line);border-radius:10px;background:var(--card);margin:16px 0;overflow:hidden}
.artifact>summary{cursor:pointer;padding:13px 18px;font-weight:700;font-size:15px;background:#fbfcfe;list-style:none}
.artifact>summary::-webkit-details-marker{display:none}
.artifact>summary:hover{background:#f2f6fb}
.artifact[open]>summary{border-bottom:1px solid var(--line)}
.artifact .body-wrap{max-height:560px;overflow:auto;background:#101826;color:#d6e2f2;margin:0}
.artifact pre{margin:0;padding:14px 18px;font-size:12.5px;line-height:1.55;white-space:pre-wrap;word-break:break-word}
.ledger-table td:first-child{white-space:nowrap;width:130px;font-weight:600}
.kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:16px 0}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:10px;text-align:center;padding:13px 8px}
.kpi .num{font-size:24px;font-weight:800;color:var(--accent)}.kpi .lbl{font-size:12px;color:var(--muted)}
.callout{border-radius:8px;padding:12px 16px;margin:14px 0;font-size:13.5px;border:1px solid var(--line)}
.callout.contract{background:#fdf6e8;border-color:#ecd9b0}
.callout.note{background:#eef3fb;border-color:#c9d8ef}
.callout .ct{font-weight:700;display:block;margin-bottom:4px}
ul{margin:6px 0;padding-left:22px}li{margin:3px 0}
"""

notes = load_notes()

# scan artifacts
artifacts = []
for p in sorted(MIL.rglob("*")):
    if not p.is_file() or p.name == "review-notes.md" or p.suffix not in (".md", ".py", ".json"):
        continue
    text = p.read_text(encoding="utf-8")
    if "ARS 提取工件" not in text:
        continue
    meta = parse_header(text)
    meta["rel"] = str(p.relative_to(MIL))
    meta["v"] = verify(meta)
    artifacts.append(meta)

kp = [a for a in artifacts if a.get("kind") == "knowledge-pack"]
cap = [a for a in artifacts if a.get("kind") == "capability"]
n_pass = sum(1 for a in artifacts if a["v"]["status"] == "pass")
n_fail = len(artifacts) - n_pass

P = []
P.append(f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(notes['title'])} · 提取审阅</title>
<style>{CSS}</style></head><body><main>
<h1>{html.escape(notes['title'])}</h1>
<div class="meta">ARS 吸收 · 能力/知识包提取工件审阅 · 生成于 2026-08-15 · 工件目录 <code>authoring/ars/{milestone}/</code></div>
""")

P.append("""
<h2>提取保真契约（审阅基准）</h2>
<div class="callout contract">
<span class="ct">本次提取的硬承诺</span>
<ol>
<li><strong>忠实迁移</strong>：提取阶段对上游指令<strong>零改写、零压缩</strong>——所有工件正文与上游原文逐字节一致（sha256 验证，结果见下表）；</li>
<li><strong>偏离必登记</strong>：任何归属标注、合并计划、待定项都在每个工件的"变更台账"中逐条登记；内容删改一律推迟到 authoring 阶段；</li>
<li><strong>来源可回溯</strong>：每个工件头部记录来源文件 + 章节 + 行范围，可直接定位上游原文；</li>
<li><strong>变体全保留</strong>：跨技能合并（如 drafting 两变体）在提取阶段<strong>保留两个全文</strong>，合并在 authoring 阶段另行执行。</li>
</ol>
</div>
""")

P.append(f"""
<h2>保真验证总览</h2>
<div class="kpi-row">
<div class="kpi"><div class="num">{len(artifacts)}</div><div class="lbl">提取工件</div></div>
<div class="kpi"><div class="num">{len(kp)}</div><div class="lbl">知识包</div></div>
<div class="kpi"><div class="num">{len(cap)}</div><div class="lbl">能力文件</div></div>
<div class="kpi"><div class="num">{n_pass}</div><div class="lbl">sha256 逐字节通过</div></div>
<div class="kpi"><div class="num">{n_fail}</div><div class="lbl">验证失败</div></div>
</div>
<table>
<tr><th>工件</th><th>类型</th><th>上游来源</th><th>保真验证</th></tr>
""")
for a in artifacts:
    v = a["v"]
    badge = "b-pass" if v["status"] == "pass" else "b-fail"
    kind_badge = '<span class="badge b-kp">知识包</span>' if a.get("kind") == "knowledge-pack" else '<span class="badge b-cap">能力</span>'
    P.append(
        f'<tr><td><code>{html.escape(a["rel"])}</code></td><td>{kind_badge}</td>'
        f'<td><code>{html.escape(v.get("upstream", ""))}</code></td>'
        f'<td><span class="badge {badge}">{v["status"].upper()}</span> {html.escape(v["detail"])}</td></tr>'
    )
P.append("</table>")

P.append('<h2>提取工件详情（含完整内容与来源对照）</h2>')
P.append('<p class="meta">点击每个工件展开：元数据 → 来源对照 → 变更台账 → 完整原文（深色块内）。</p>')
for a in artifacts:
    kind_label = "知识包" if a.get("kind") == "knowledge-pack" else "能力"
    kind_badge = "b-kp" if a.get("kind") == "knowledge-pack" else "b-cap"
    src_rows = "".join(f"<tr><td><code>{html.escape(s)}</code></td></tr>" for s in a.get("sources", []))
    ledger_rows = ""
    for entry in a.get("ledger", []):
        m2 = re.match(r"^\[([^\]]+)\]\s*(.*)", entry)
        tag, desc = (m2.group(1), m2.group(2)) if m2 else ("", entry)
        tag_badge = "b-pass" if tag == "保留" else "b-warn"
        ledger_rows += f'<tr><td><span class="badge {tag_badge}">{html.escape(tag)}</span></td><td>{html.escape(desc)}</td></tr>'
    body = html.escape(a.get("body", ""))
    P.append(f"""
<details class="artifact">
<summary><span class="badge {kind_badge}">{kind_label}</span> {html.escape(a.get("id", a["rel"]))} &nbsp;·&nbsp; <code>{html.escape(a["rel"])}</code></summary>
<table>
<tr><th style="width:120px">类型</th><td>{kind_label}</td></tr>
<tr><th>来源对照</th><td><table style="border:none">{src_rows}</table></td></tr>
<tr><th>变更台账</th><td><table class="ledger-table" style="border:none">{ledger_rows}</table></td></tr>
</table>
<div class="body-wrap"><pre>{body}</pre></div>
</details>
""")

if notes["coverage"]:
    P.append(f'<h2>覆盖检查：源文件去向</h2>\n{notes["coverage"]}\n')
if notes["deps"]:
    P.append(f'<h2>未提取依赖清单（authoring 阶段处理）</h2>\n<div class="callout note">{notes["deps"]}</div>\n')
if notes["tips"]:
    P.append(f'<h2>审阅要点提示</h2>\n{notes["tips"]}\n')

P.append(f"""
<footer style="margin-top:50px;padding-top:14px;border-top:1px solid var(--line);color:var(--muted);font-size:12.5px">
本页由 <code>authoring/ars/generate_review.py {milestone}</code> 生成；sha256 保真验证直接比对 <code>vendor/ars</code> 上游原文。
</footer>
</main></body></html>
""")

OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text("".join(P), encoding="utf-8")
print(f"wrote {OUT} ({OUT.stat().st_size // 1024} KB) · {len(artifacts)} artifacts · {n_pass} pass / {n_fail} fail")
