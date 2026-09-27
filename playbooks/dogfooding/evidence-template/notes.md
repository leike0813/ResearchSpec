# Dogfooding Notes

## Run identity

- Workspace schema version: 2
- Scenario ID:
- Root run ID:
- Related child run IDs:
- Fixture variant:
- Profile / entry:
- Target ID / Agent host version / model version / adapter:
- Independent session IDs (two required for a verified target):

## User input and observed behavior

- Original prompt:
- Expected behavior:
- Actual behavior:
- Human corrections (count):
- Tool trace and produced ordinary file paths:
- Last successful selector:
- Failed selector:

## Authority and evidence

- Authoritative-state edit observed: yes / no
- Preview and execution payload identical: yes / no / not applicable
- Candidate path and SHA-256:
- Relevant status/instructions/check/show evidence:
- Exact selectors used (`profile:`, `run:`, `node:`, `gate:`, `decision:`):
- Authority snapshots (`run.yaml`, `graph.yaml`, `nodes/*.yaml`, `handoff.md`):
- Reproducible in a fresh session: yes / no / not tested
- Resume attempts (count):
- Successful resumes (count):
- Resume success rate:
- 约束：Successful resumes 不得超过 resume attempts；attempts 为 0 时恢复成功率记为 N/A，不填写 0%。

## Assessment

- Hard failures:
- Routing and explanation clarity (0–3):
- User control and friction (0–3):
- Semantic content and evidence discipline (0–3):
- Artifact usability (0–3):
- Result: pass / fail / blocked
- Behaviour verification status: unverified / verified（只有两次独立会话的证据满足门槛才可填 verified）
- Defect class: control plane / Agent experience / semantic quality / adapter
- Follow-up:
