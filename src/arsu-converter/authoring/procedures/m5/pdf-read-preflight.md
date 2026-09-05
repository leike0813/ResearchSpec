# Procedure

Generate the report with `validators/pdf-read-preflight.py` using the executable report contract below.

pdf_path is the actual PDF file. Structural checks compare declared, enumerated and reader page counts. Optional content classification is not bundled and remains not_checked.

1. Check PDF structure using bounded parsing. Report declared, enumerated and
   reader page counts, plus parse warnings. Text-layer availability is not
   tested by this structural preflight.
2. Return `PASS | FAIL | UNAVAILABLE` without modifying the PDF. Only `PASS`
   licenses page anchors for downstream citation work; missing or failed
   preflight leaves page provenance unverified and must be surfaced.
3. Optional content classification is a separate advisory. Run it only when
   explicitly requested, over the exact already-read bytes, with bounded
   execution and output. A classifier result never changes the structural
   verdict or authorizes OCR, external uploads, or manuscript edits.

## Output Format

Structured verifier findings from the script, with any separate content advisory
clearly labelled and never treated as structural proof.
