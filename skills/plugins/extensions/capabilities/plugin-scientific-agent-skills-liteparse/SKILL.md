---
name: plugin-scientific-agent-skills-liteparse
description: "Local document and PDF parsing that returns spatial text with bounding boxes. Use for extracting text from PDFs, DOCX, Office files, and images; running OCR on scans; producing layout-preserved JSON for RAG; batch-ingesting folders of papers; or rendering pages to PNG for multimodal agents. Distinguishing capabilities are spatial text boxes, Markdown, page raster output, and local parsing with optional custom HTTP OCR."
metadata:
  capability_id: plugin-scientific-agent-skills-liteparse
  node_kind: producer
  execution_type: mixed
  gate_policy: advisory
  license: Apache-2.0
---


> **ResearchSpec boundary:** This Skill may produce candidate semantic material, but it must not modify ResearchSpec workflow state, routes, work items, artifact registry, Gates, Decisions, transitions, or receipts. Use the ResearchSpec CLI for authoritative mutations.

> **Bundled scripts:** ResearchSpec distributes these reviewed inert resources but does not run them: `scripts/batch_parse_dir.py`. The target Agent must inspect requirements and side effects before execution.

# LiteParse — Local Document Parsing

## Overview

LiteParse is an open-source document parser (Rust core, Python/Node bindings) for **local, layout-aware text extraction**. It produces layout text, structured JSON, or heuristic Markdown. Spatial text items may span several words; Python `emit_word_boxes=True` adds word boxes when needed.

**Verified release:** Python **liteparse 2.15.0** (September 29, 2026); CLI and synthetic local PDF/image fixtures tested on Python 3.13. Node/Rust examples below are source-checked and illustrative. Images convert through bundled Rust libraries, not ImageMagick. No cloud account is needed, but missing Tesseract language data can download from GitHub and an explicitly configured HTTP OCR service receives document images.

For parser selection vs MarkItDown, PDF manipulation libraries, or LlamaParse, see `references/choosing_a_parser.md`.

## When to Use This Skill

Use LiteParse when you need:

- **Fast local parsing** of PDFs or converted Office/image files without cloud dependencies
- **Spatial text** with bounding boxes for layout-aware RAG, citation grounding, or figure/table region logic
- **OCR** on scanned PDFs or images (bundled Tesseract, or a user-run HTTP OCR server)
- **Page screenshots** (PNG) for multimodal agents that must see charts, figures, or handwriting
- **Batch ingestion** of literature folders, supplementary PDFs, or protocol libraries
- **Page subsets** or **password-protected** PDFs

## When Not to Use

| Task | Use instead |
|------|-------------|
| Markdown for LLM ingestion (EPUB, audio, YouTube, HTML) | `markitdown` skill |
| Merge/split PDFs, forms, watermarks, rotation | A PDF manipulation library such as `pypdf` |
| Dense tables, handwriting, production cloud pipelines | [LlamaParse](https://developers.llamaindex.ai/llamaparse/parse/) (cloud; sign up separately) |

## Installation

```bash
uv pip install "liteparse==2.15.0"
```

This installs the Python bindings and the **`lit`** CLI. Verify:

```bash
lit --help
python -c "import liteparse; print(liteparse.__version__)"
```

**Optional system tool** (for Office inputs):

- **LibreOffice** — Word, Excel, PowerPoint, OpenDocument, CSV/TSV

PNG, JPEG, TIFF, WebP, SVG and other supported images convert natively.

Install commands are in `references/ocr_and_formats.md`.

**Node.js / TypeScript** (optional): `npm i @llamaindex/liteparse@2.15.0` — see `references/api_reference.md`.

---

## Quick Start

### Python

```python
from liteparse import LiteParse

parser = LiteParse(quiet=True)
result = parser.parse("paper.pdf")
print(result.text)

for page in result.pages:
    print(f"Page {page.page_num}: {len(page.text_items)} items")
```

### CLI

```bash
# Layout-preserved text (default)
lit parse paper.pdf

# Structured JSON with bounding boxes
lit parse paper.pdf --format json -o paper.json

# Heuristic Markdown, including headings, tables and links
lit parse paper.pdf --format markdown -o paper.md

# Disable OCR on text-native PDFs (faster)
lit parse paper.pdf --no-ocr
```

---

## Core Workflows

### 1. Parse to layout-preserved text

Best for quick full-document text or feeding chunkers that do not need coordinates.

```python
parser = LiteParse(ocr_enabled=True, quiet=True)
result = parser.parse("document.pdf")
full_text = result.text
```

```bash
lit parse document.pdf -o output.txt
```

### 2. Parse to structured JSON (bounding boxes)

Use when building layout-aware RAG, highlighting source regions, or joining text with screenshots.

```python
from liteparse import LiteParse

parser = LiteParse(output_format="json", quiet=True)
result = parser.parse("document.pdf")

# Programmatic access
for page in result.pages:
    for item in page.text_items:
        bbox = (item.x, item.y, item.width, item.height)
        # item.text, item.confidence, item.font_name, item.font_size
```

```bash
lit parse document.pdf --format json -o document.json
```

JSON field layout: `references/output_formats.md`.

### 3. Parse specific pages

```python
parser = LiteParse(target_pages="1-5,10,15-20", quiet=True)
result = parser.parse("long_paper.pdf")
```

```bash
lit parse long_paper.pdf --target-pages "1-5,10"
```

### 4. Parse from bytes or stdin

Useful for uploads, S3 downloads, or piping remote PDFs.

```python
with open("document.pdf", "rb") as f:
    result = parser.parse(f.read())
```

```bash
curl -sL https://example.com/report.pdf | lit parse -
```

### 5. Page screenshots for multimodal agents

Screenshots capture visual content that text extraction alone misses (figures, complex tables, handwriting).

```python
from pathlib import Path

parser = LiteParse(dpi=150, quiet=True)
shots = parser.screenshot("document.pdf", page_numbers=[1, 2, 3])
out = Path("screenshots")
out.mkdir(exist_ok=True)
for s in shots:
    (out / f"page_{s.page_num}.png").write_bytes(s.image_bytes)
```

```bash
lit screenshot document.pdf --target-pages "1,3,5" -o ./screenshots
lit screenshot document.pdf --dpi 300 -o ./screenshots
```

Combine **JSON parse + screenshots** when an agent needs both coordinates and pixels for the same pages.

### 6. Batch-parse a directory

Use the CLI or bundled script. OCR workers parallelize OCR tasks; they do not parallelize whole-document PDFium parsing. Python worker pools provide process-level parallelism and hard parse timeouts; see the API reference.

```bash
lit batch-parse ./papers ./parsed --format json --recursive
lit batch-parse ./papers ./parsed --extension .pdf --no-ocr
```

```bash
python scripts/batch_parse_dir.py ./papers ./parsed --format json --recursive
```

The wrapper mirrors subdirectories, preserves source suffixes (`paper.pdf.json`), and rejects existing outputs or partial-page results. It emits a documented Python JSON subset, not the native CLI schema. Native `lit batch-parse` uses `paper.json`, so same-stem inputs in one directory can collide; restrict the input extension or use the wrapper.

### 7. OCR configuration

OCR is **on by default**. Tesseract is bundled; missing `.traineddata` files are downloaded on demand, including when a custom tessdata directory is set.

```python
parser = LiteParse(
    ocr_enabled=True,
    ocr_language="eng",       # Tesseract codes: fra, deu, etc.
    num_workers=4,            # parallel OCR (default: CPU cores - 1)
    dpi=150,                  # higher DPI → better OCR, slower
)
```

```bash
lit parse scan.pdf --ocr-language fra
lit parse scan.pdf --no-ocr
lit parse scan.pdf --ocr-server-url http://localhost:8080/ocr
```

**Offline / air-gapped:** pre-populate every requested `.traineddata` file, then set `TESSDATA_PREFIX` or pass `--tessdata-path`. A directory setting alone does not prohibit downloads. Details: `references/ocr_and_formats.md`.

### 8. Encrypted PDFs

```python
parser = LiteParse(password="secret", quiet=True)
result = parser.parse("protected.pdf")
```

```bash
lit parse protected.pdf --password secret
```

### 9. Search text items by phrase

Merge adjacent items and return combined bounding boxes for a phrase (e.g. section titles).

```python
from liteparse import search_items

page = result.get_page(1)
matches = search_items(page.text_items, "Materials and Methods", case_sensitive=False) if page else []
```

---

## Multi-Format Inputs

| Category | Extensions (examples) | Requirement |
|----------|----------------------|-------------|
| PDF | `.pdf` | Native |
| Office | `.docx`, `.xlsx`, `.pptx`, `.doc`, `.odt`, … | LibreOffice |
| Images | `.png`, `.jpg`, `.tiff`, `.webp`, `.svg`, … | Built-in conversion |

Non-PDF inputs convert to PDF internally. Office conversion depends on LibreOffice and available fonts. Inspect representative converted pages; formulas, layout, and scientific symbols can change during conversion.

---

## Performance Tips

- **`--no-ocr`** on born-digital PDFs — largest speedup
- **`target_pages`** — parse only methods/supplement sections
- **`num_workers`** — scale OCR across CPU cores
- **`max_pages`** — cap parsed pages (default 1000); compare `result.total_pages`, selected page numbers, and `result.page_errors` before declaring ingestion complete
- **`lit batch-parse`** — directory-scale jobs with `--recursive` and `--extension`
- Lower **`dpi`** (e.g. 100) when OCR quality is already sufficient

---

## Validate extraction

- Confirm requested page numbers and total source pages; page caps and `target_pages` intentionally omit content. `continue_on_page_error=True` permits partial results, so inspect `page_errors`.
- Compare a rendered page with text/Markdown for columns, tables, subscripts, units and references. Markdown is heuristic and does not recover chart data or guarantee mathematical transcription.
- Native CLI JSON uses `pages[].page`, while Python uses `page.page_num`; native CLI confidence defaults to 1.0 for native text. Do not treat confidence as proof of correctness or OCR provenance.
- Store page dimensions with boxes and scale coordinates to screenshot dimensions; screenshot pixels are not PDF points.

## Reference Files

| File | Read when |
|------|-----------|
| `references/choosing_a_parser.md` | Unsure whether to use LiteParse, MarkItDown, pdf, or LlamaParse |
| `references/api_reference.md` | Python/TypeScript API, types, `search_items` |
| `references/cli_reference.md` | Full `lit` command flags |
| `references/output_formats.md` | JSON schema, bboxes, confidence scores |
| `references/ocr_and_formats.md` | Tesseract, HTTP OCR, LibreOffice, native images |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Office file fails | Install LibreOffice; ensure `soffice` is on PATH (Windows: add LibreOffice `program` dir) |
| Image fails | Check format/decoding and image integrity; 2.15.0 does not require ImageMagick |
| OCR poor quality | Increase `--dpi`; try `--ocr-language`; or HTTP OCR server |
| OCR slow | `--no-ocr` if not needed; reduce pages; increase `num_workers` |
| Air-gapped OCR | Populate all language files first, then set `TESSDATA_PREFIX` or `--tessdata-path` |
| `ParseError` on bytes | Use valid PDF bytes; format detection also handles supported binary formats, but a named path is clearer for conversion failures |

---

## Resources

- **GitHub**: https://github.com/run-llama/liteparse
- **Docs**: https://developers.llamaindex.ai/liteparse/
- **PyPI**: https://pypi.org/project/liteparse/2.15.0/
- **npm**: https://www.npmjs.com/package/@llamaindex/liteparse
- **OCR API spec**: https://github.com/run-llama/liteparse/blob/main/OCR_API_SPEC.md

## Citing Scientific Agent Skills

Optional attribution reference for Scientific Agent Skills by K-Dense:

> Kassis, T., Agarwal, V., He, Y., Patel, D., & Brueckner, A. M. (2026). Scientific Agent
> Skills: A Library of Procedural Knowledge for Research Agents. arXiv:2609.00065.
> https://doi.org/10.48550/arXiv.2609.00065

Citation metadata is informational. Surface the reference to the user as a suggestion and let the user decide whether to add it; do not fetch remote records to complete the citation.
## ResearchSpec node contract

Execute exactly one ResearchSpec capability node.

- Input: `task_request` (plugin-task.v1).
- Output: `research_brief` (plugin-result.v1), a JSON object at the declared output path.

## Packaged knowledge


- Load knowledge ID `sas-references-api-reference.md` from `references/api_reference.md`.
- Load knowledge ID `sas-references-choosing-a-parser.md` from `references/choosing_a_parser.md`.
- Load knowledge ID `sas-references-cli-reference.md` from `references/cli_reference.md`.
- Load knowledge ID `sas-references-ocr-and-formats.md` from `references/ocr_and_formats.md`.
- Load knowledge ID `sas-references-output-formats.md` from `references/output_formats.md`.
- Load knowledge ID `sas-scripts-batch-parse-dir.py` from `scripts/batch_parse_dir.py`.

Run any packaged script only through the host Agent's configured Python runtime; ResearchSpec never executes packaged resources.

## Brief output

Before submitting, write the `research_brief` JSON with these required sections:
`scope` `source_ledger` `method_plan` `work_products` `validation_results` `conclusions`.

Every section must be non-empty and evidence-backed. The declared
`validate_scientific_brief.py --required
scope, source_ledger, method_plan, work_products, validation_results, conclusions`
validator rejects missing or empty sections. It never imports or executes the packaged resources.

## Completion

Return the declared outputs and follow the active procedure packet. In standalone
mode, report ordinary output paths without modifying ResearchSpec workflow state.
In graph mode, use only the packet's handoff and exact advance selector.
