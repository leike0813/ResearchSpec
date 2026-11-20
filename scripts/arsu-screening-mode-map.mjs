const root = "sr-screener";
const doc = (kind, name) => ({ kind, name });

export const SCREENING_MODE_MAP = [
  { mode: "protocol", title: "Screening protocol", capability: "screening-protocol", nodes: ["protocol", "protocol-confirmation"], docs: [doc("agent", "protocol_architect_agent"), doc("reference", "protocol_template"), doc("reference", "decision_rules")], anchors: [["protocol", "protocol"], ["eligibility criteria", "eligibility criteria"], ["inclusion and exclusion", "inclusion and exclusion"]] },
  { mode: "quick", title: "Single reviewer triage", capability: "screening-quick", docs: [doc("agent", "screening_reviewer_agent"), doc("reference", "decision_rules"), doc("example", "quick_screen_example")], anchors: [["abstract screening", "abstract"], ["eligibility decision", "eligibility"], ["include or exclude", "include"]] },
  { mode: "pilot", title: "Pilot calibration", capability: "screening-pilot", nodes: ["protocol", "protocol-confirmation", "pilot-a", "pilot-b", "pilot", "pilot-approval"], docs: [doc("agent", "screening_reviewer_agent"), doc("agent", "qc_auditor_agent"), doc("reference", "quality_control"), doc("reference", "reviewer_roles"), doc("reference", "decision_rules")], anchors: [["pilot screening", "pilot"], ["reviewer agreement", "agreement"], ["calibration", "calibration"]] },
  { mode: "ta-screen", title: "Title and abstract screening", capability: "screening-ta-screen", nodes: ["protocol", "ta-a", "ta-b", "ta", "ta-adjudication", "exclusion-audit", "ta-quality"], docs: [doc("agent", "screening_reviewer_agent"), doc("agent", "qc_auditor_agent"), doc("reference", "decision_rules"), doc("reference", "reviewer_roles"), doc("workflow", "ta_screening.template.js")], anchors: [["title and abstract", "title"], ["reviewer decisions", "reviewer"], ["conflicts and exclusions", "exclusion"]] },
  { mode: "ft-screen", title: "Full text eligibility", capability: "screening-ft-screen", nodes: ["protocol", "ta", "ta-adjudication", "exclusion-audit", "ta-quality", "ft-a", "ft-b", "ft", "ft-adjudication", "ft-quality"], docs: [doc("agent", "screening_reviewer_agent"), doc("agent", "qc_auditor_agent"), doc("reference", "decision_rules"), doc("reference", "failure_paths"), doc("workflow", "ft_screening.template.js")], anchors: [["full text eligibility", "full text"], ["exclusion reason", "reason"], ["page and section", "page"]] },
  { mode: "adjudicate", title: "Screening conflict adjudication", capability: "screening-adjudicate", nodes: ["ta", "ta-adjudication", "ft", "ft-adjudication"], docs: [doc("agent", "screening_reviewer_agent"), doc("reference", "decision_rules"), doc("reference", "reviewer_roles"), doc("reference", "failure_paths")], anchors: [["screening conflict", "conflict"], ["reviewer disagreement", "disagreement"], ["human decision", "human"]] },
  { mode: "audit", title: "Exclusion audit", capability: "screening-audit", nodes: ["ta", "exclusion-audit"], docs: [doc("agent", "qc_auditor_agent"), doc("reference", "quality_control"), doc("reference", "decision_rules"), doc("reference", "failure_paths")], anchors: [["excluded records", "excluded"], ["eligibility criteria", "criteria"], ["audit sample", "sample"]] },
  { mode: "report", title: "PRISMA report and corpus", capability: "screening-report", nodes: ["protocol", "ta", "ta-adjudication", "exclusion-audit", "ta-quality", "ft", "ft-adjudication", "ft-quality", "report", "human-verification"], docs: [doc("agent", "reporter_agent"), doc("agent", "qc_auditor_agent"), doc("reference", "reporting_and_handoff"), doc("reference", "quality_control")], anchors: [["PRISMA flow", "PRISMA"], ["study counts", "counts"], ["literature corpus", "literature"]] },
].map((entry) => ({
  ...entry,
  route: `${root}:${entry.mode}`,
  upstream: [doc("skill", "SKILL.md"), ...entry.docs],
}));

export function screeningDocPath(item) {
  if (item.kind === "skill") return `${root}/SKILL.md`;
  if (item.kind === "example") return `${root}/examples/${item.name}.md`;
  if (item.kind === "workflow") return `${root}/templates/workflows/${item.name}`;
  return `${root}/${item.kind}s/${item.name}.md`;
}
