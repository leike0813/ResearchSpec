<!--
══════════════════════════════════════════════
ARS 提取工件（Extraction Artifact）— M1 研究段
══════════════════════════════════════════════
工件类型: knowledge-pack
能力/包 ID: KP-M1-SR-02 screening-failure-paths
提取日期: 2026-11-20
提取方式: verbatim — 上游原文逐字节保留，未改写、未压缩
来源对照（source mapping）:
    - vendor/ars/sr-screener/references/failure_paths.md（全文）
变更台账（ledger）:
    1. [保留] 上游全文逐字节保留。
    2. [标注] 失败与中断路径在 ResearchSpec 中必须保持 pending，不得默认排除；重试范围写入 Procedure。
说明: 提取阶段只做忠实迁移与归属标注；执行边界、独立性和门禁在 Procedure 中定义。
══════════════════════════════════════════════
-->

# Failure paths

| # | Situation | How it shows | Recovery |
|---|-----------|--------------|----------|
| F1 | Protocol vague, contradictory or missing a criterion | Protocol Architect cannot place a criterion; boundary cases get disputed | Ask targeted questions (max five at a time); mark inferred items `[proposed]`; nothing is screened until confirmed |
| F2 | Seed study not in the search results | `prepare_records.py` prints "NOT FOUND" | Search problem: fix the strategy and re-export before screening |
| F3 | Seed study excluded in the pilot | QC pilot report | Read both reasons, amend the definition or code wording, re-pilot the same batches |
| F4 | Export formats misread | A file is "skipped (format not recognised)" or record counts differ from the database's total | Re-export as RIS or MEDLINE; `--db "file=Database"` for labels; reconcile counts before screening |
| F5 | A reviewer returns fewer decisions than records | Workflow log "incomplete"; merge lists pending IDs | Automatic Grep retry inside the run; later `--jobs pending`; lower `max_records` if frequent |
| F6 | Malformed decisions (label/code mismatch, IDs from another batch) | merge prints "dropped ..." counts | Discarded by design, then retried; many in one batch: inspect that batch file |
| F7 | Every agent fails at once | Workflow returns all batches "screen-failed" | Usually a wrong `agent_type` or model alias: fix the config, regenerate, rerun the pilot |
| F8 | Usage limit or closed session mid-run | Workflow stops; journal partial | Merge everything so far, then `--jobs pending`; nothing is defaulted or lost |
| F9 | Many conflicts or a criterion read two ways | Pilot conflicts cluster on one code | Add a definition or example to the protocol (amendment), re-pilot |
| F10 | "unclear" share far above expectations | QC report | Tighten the core-criteria gate; check whether a systematically missing field (for example no abstracts) drives it |
| F11 | QC advances many rechecked exclusions | merge prints "exclusions advanced by QC" | Exclusions are unreliable: find the pattern, amend, re-screen the affected batches |
| F12 | Criteria change after screening started | Team request | Amendment log entry; decide which records the change can flip; re-screen those; never mix old and new rules silently |
| F13 | Prepared work folder would be overwritten | `prepare_records.py` refuses | Use a new `--work` folder; `--force` only when no decisions exist, since IDs would change |
| F14 | PDFs not matched at full text | `prepare_fulltext.py` "not retrieved" count | Rename PDFs with the record ID or give a `--map` CSV; truly unobtainable reports go in the PRISMA "not retrieved" box |
| F15 | No subagents available | Session cannot spawn agents | Offer `quick` mode (single-reviewer triage, disclosed as such) or run the pipeline in Claude Code |
| F16 | Pilot is incomplete or excluded a record the team advanced | `merge_decisions.py --pilot-labels` prints "STOP"; `--jobs all` and pending jobs outside the pilot refuse | Finish every labelled pilot record, or read the missed record's AI reason and amend the protocol, then merge with `--pilot-labels` again; start outside the pilot anyway only if the user decides so, with `--pilot-override "<reason>"` (recorded, reported in the methods text) |
| F17 | Screening done but numbers still provisional | merge prints "PENDING QC" | Run `build_workflow.py ta --jobs recheck` for the required recheck of joint exclusions and near-miss records, then merge again |
