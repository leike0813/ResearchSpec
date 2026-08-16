# Procedure

Run the bundled `validators/contamination-signals.py` with the current submission JSON.

1. Compute contamination signals from corpus and model-output evidence.
2. Do not infer contamination from style alone.
3. Report advisory scores and the evidence used.
4. Never block output on advisory signals alone.

## Output Format

Structured verifier findings from the script.
