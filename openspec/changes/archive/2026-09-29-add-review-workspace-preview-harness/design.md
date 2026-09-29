# Design

## Context

The published `review-workspace/index.html` is a self-contained `file://` page that reveals its three-column interface after file import. Three TypeScript adapters already produce validated workspace descriptors. The existing Skill Browser runner compiles harness TypeScript into ignored `.harness-dist/` before launching its server.

## Goals / Non-Goals

**Goals:** Open a populated copy of the real review page in one command and switch among three representative adapters and manuscript formats.

**Non-Goals:** Create a second review UI, run a live ResearchSpec workflow, or expose sample data through production packages.

## Decisions

- Extend the existing harness compilation runner with a review-preview mode. This reuses the TypeScript build and ignored output directory instead of adding a second server or dependency.
- Build three fixed sample descriptors through the existing adapter functions. Keep stable workspace IDs so browser drafts are reproducible. Use Markdown, QMD, and LaTeX content and multiple items to exercise rendering, navigation, filtering, and disposition controls.
- Generate three HTML files by copying the current static page and appending a small development bootstrap. It adds a sample switcher and passes a sample `File` through the page's existing import event. Encode embedded JSON as Base64 so manuscript text cannot break out of the script element. The source page stays byte-for-byte untouched.
- Open the annotation preview through the platform's default browser opener. A `--no-open` option supports headless checks; print the local URL in both cases. No HTTP server is required.

## Risks / Trade-offs

- [Browser `file://` storage policies vary] → The page already treats storage as optional; review and export remain available.
- [Generated HTML could diverge from the source] → Regenerate it from the current page on every command run and exercise the existing import path.
- [No graphical browser is available] → Leave generated files in `.harness-dist/` and print a local URL.
