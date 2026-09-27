import fs from 'node:fs';
import path from 'node:path';
import { assessmentDir, attemptDir, campaignDir, evidenceHash, fail, loadCampaignCatalog, readJson, rubricKeys, writeJson } from './lib.mjs';

const outcomes = new Set(['yes', 'no', 'unknown']);
const verdicts = new Set(['pass', 'fail', 'blocked', 'invalid', 'undetermined']);
const modes = new Set(['entry_missed', 'wrong_route', 'state_boundary', 'user_control', 'evidence_claim', 'deliverable', 'host_blocked', 'invalid_precondition', 'insufficient_evidence', 'other']);
const lineCount = new Map();

export function assessmentState(root, campaignId, sessionId) {
  const file = path.join(assessmentDir(root, campaignId, sessionId), 'state.json');
  return fs.existsSync(file) ? readJson(file) : { status: 'pending' };
}

function refs(value, dir, events) {
  if (!Array.isArray(value) || !value.length) fail('Assessment claim needs evidence references');
  const valid = value.filter(ref => {
    if (!ref || typeof ref !== 'object') return false;
    if (Number.isInteger(ref.event)) return ref.event > 0 && events.has(ref.event);
    if (Array.isArray(ref.event_range)) return ref.event_range.length === 2 && Number.isInteger(ref.event_range[0]) && Number.isInteger(ref.event_range[1]) && ref.event_range[0] > 0 && ref.event_range[1] >= ref.event_range[0] && events.has(ref.event_range[0]) && events.has(ref.event_range[1]);
    if (typeof ref.file !== 'string' || !Number.isInteger(ref.line) || ref.line < 1 || path.isAbsolute(ref.file) || ref.file.split(/[\\/]/).includes('..')) return false;
    const base = ref.file === 'packet.json' ? path.join(path.dirname(path.dirname(dir)), 'assessments', path.basename(dir)) : dir;
    const file = path.join(base, ref.file);
    if (!fs.existsSync(file)) return false;
    const actual = fs.realpathSync(file);
    if (!actual.startsWith(`${fs.realpathSync(base)}${path.sep}`) || !fs.statSync(actual).isFile() || fs.statSync(actual).size > 20 * 1024 * 1024 || !/\.(json|jsonl|ndjson|yaml|yml|md|txt|stdout|stderr)$/i.test(actual)) return false;
    if (!lineCount.has(actual)) lineCount.set(actual, fs.readFileSync(actual, 'utf8').split('\n').length);
    return ref.line <= lineCount.get(actual);
  });
  value.splice(0, value.length, ...valid);
  if (!valid.length) fail('Assessment claim has no valid evidence references');
  if (valid.every(ref => ref.file === 'packet.json')) fail('Assessment claim cites only the scenario contract');
}
function claim(value, dir, events) {
  if (!value || typeof value.reason !== 'string' || !value.reason.trim()) fail('Assessment claim lacks reasoning');
  refs(value.refs, dir, events);
}
function markdown(report) {
  const a = report.analysis;
  const cite = items => items.map(x => {
    const file = x.event || x.event_range ? 'events.ndjson' : x.file;
    const line = x.event || x.event_range?.[0] || x.line;
    const label = x.event ? `事件 ${x.event}` : x.event_range ? `事件 ${x.event_range.join('–')}` : `${file}:${line}`;
    const target = file === 'packet.json' ? `packet.json#L${line}` : `../../sessions/${report.session_id}/${file.split('/').map(encodeURIComponent).join('/')}#L${line}`;
    return `[${label}](${target})`;
  }).join('；');
  const out = [`# ${report.facts.scenario.title} · ${report.facts.host} · ${report.session_id}`, '', `**验收建议：${a.recommendation.verdict}** — ${a.recommendation.reason}`, '', `证据摘要：\`${report.evidence_hash}\`；验收模型：\`${report.assessor.host}/${report.assessor.model}\``, '', '## 测试内容', '', report.facts.scenario.intent, '', `前置条件：${report.facts.scenario.initial_state || '见场景目录'}`, '', '## 实际 Prompt', '', '```text', report.facts.prompt, '```', '', '## 宿主行动', ''];
  for (const x of a.actions) out.push(`- ${x.text}（${cite(x.refs)}）`);
  out.push('', '## 交付与变化', '');
  for (const x of report.facts.changed) out.push(`- ${x}`);
  if (!report.facts.changed_known) out.push('变更清单缺失，无法确认文件变化。');
  else if (!report.facts.changed.length) out.push('无文件变化。');
  for (const x of a.deliverables) out.push(`- ${x.path}：${x.assessment}（${cite(x.refs)}）`);
  out.push('', '## 前置条件与硬断言', '', `前置条件 ${a.precondition.result}：${a.precondition.reason}（${cite(a.precondition.refs)}）`);
  for (const x of a.assertions) out.push(`- ${x.index + 1}. ${report.facts.scenario.hard_assertions[x.index]} — ${x.result}：${x.reason}（${cite(x.refs)}）`);
  out.push('', '## 四项评分', '');
  for (const key of rubricKeys) out.push(`- ${key}：${a.scores[key].value ?? '未知'} — ${a.scores[key].reason}（${cite(a.scores[key].refs)}）`);
  out.push('', '## 结论依据与限制', '', `${a.recommendation.reason}（${cite(a.recommendation.refs)}）`, '', `失败模式：${a.recommendation.failure_modes.join('、') || '无'}`, '', `证据缺口：${report.facts.evidence_gaps.join('、') || '无'}`, '');
  return out.join('\n');
}

export function validateAssessment(root, campaignId, sessionId, draft, assessor) {
  const dir = attemptDir(root, campaignId, sessionId);
  const session = readJson(path.join(dir, 'session.json'));
  if (!['sealed', 'blocked', 'interrupted'].includes(session.state) || !session.evidence_hash || evidenceHash(dir) !== session.evidence_hash) fail('Attempt evidence is unsealed or changed');
  const { catalog, hash } = loadCampaignCatalog(root, campaignId);
  const campaign = readJson(path.join(campaignDir(root, campaignId), 'campaign.json'));
  if (campaign.schema_version !== '2') fail('Historical campaign is read-only');
  if (campaign.catalog_hash && campaign.catalog_hash !== hash) fail('Assessment scenario catalog changed since campaign creation');
  const scenario = catalog.scenarios.find(x => x.scenario_id === session.scenario);
  if (!scenario) fail('Unknown assessment scenario');
  const events = new Map();
  const eventFile = path.join(dir, 'events.ndjson');
  if (fs.existsSync(eventFile)) for (const line of fs.readFileSync(eventFile, 'utf8').split('\n').filter(Boolean)) { const event = JSON.parse(line); events.set(event.seq, event); }
  const a = draft?.analysis;
  if (!a || typeof a.summary !== 'string' || !a.summary.trim() || !Array.isArray(a.actions) || !Array.isArray(a.deliverables) || !Array.isArray(a.assertions) || !a.scores || !a.recommendation) fail('Incomplete assessment report');
  for (const x of a.actions) { if (typeof x.text !== 'string' || !x.text.trim()) fail('Action lacks description'); refs(x.refs, dir, events); }
  for (const x of a.deliverables) { if (typeof x.path !== 'string' || !x.path.trim() || typeof x.assessment !== 'string' || !x.assessment.trim()) fail('Deliverable lacks description'); refs(x.refs, dir, events); }
  if (!outcomes.has(a.precondition?.result)) fail('Invalid precondition result');
  claim(a.precondition, dir, events);
  if (a.assertions.length !== scenario.hard_assertions.length) fail('Assessment assertion count mismatch');
  for (let i = 0; i < a.assertions.length; i++) { const x = a.assertions[i]; if (x.index !== i || !outcomes.has(x.result)) fail('Invalid assessment assertion'); claim(x, dir, events); }
  for (const key of rubricKeys) { const x = a.scores[key]; if (x?.value !== null && (!Number.isInteger(x?.value) || x.value < 0 || x.value > 3)) fail('Invalid assessment score'); claim(x, dir, events); }
  const r = a.recommendation;
  if (!verdicts.has(r.verdict) || typeof r.reason !== 'string' || !r.reason.trim() || !Array.isArray(r.failure_modes) || r.failure_modes.some(x => !modes.has(x))) fail('Invalid assessment recommendation');
  refs(r.refs, dir, events);
  if (r.verdict === 'pass') {
    const complete = session.state === 'sealed' && session.exit_code === 0 && !session.diagnostics_error && !session.evidence_gaps?.length && fs.existsSync(path.join(dir, 'trace.jsonl')) && fs.existsSync(path.join(dir, 'before-status.stdout')) && fs.existsSync(path.join(dir, 'after-status.stdout'));
    if (!complete || a.precondition.result !== 'yes' || a.assertions.some(x => x.result !== 'yes') || rubricKeys.some(k => !Number.isInteger(a.scores[k].value) || a.scores[k].value === 0) || rubricKeys.reduce((n, k) => n + a.scores[k].value, 0) < 9) fail('Pass recommendation violates evidence or rubric');
  }
  const promptFile = path.join(dir, 'prompts.md');
  const diffFile = path.join(dir, 'file-diff.json');
  const changed = session.changed || (fs.existsSync(diffFile) ? (readJson(diffFile).changed || []).map(x => typeof x === 'string' ? x : x.path) : []);
  const facts = { host: session.host, model: session.requested_model || null, observed_model: session.observed_model || null, host_version: session.host_version || null, state: session.state, issue: session.issue || null, prompt: fs.existsSync(promptFile) ? fs.readFileSync(promptFile, 'utf8').trimEnd() : scenario.prompts.join('\n'), scenario: { id: scenario.scenario_id, title: scenario.title, intent: scenario.intent, initial_state: scenario.initial_state, fixture_variant: scenario.fixture_variant, first_query: scenario.first_query, procedure_chain: scenario.procedure_chain, hard_assertions: scenario.hard_assertions }, changed, changed_known: !!session.changed || fs.existsSync(diffFile), evidence_gaps: session.evidence_gaps || [] };
  return { schema_version: '1', session_id: sessionId, evidence_hash: session.evidence_hash, catalog_hash: hash, created_at: new Date().toISOString(), assessor, facts, analysis: a };
}

export function saveAssessment(root, campaignId, sessionId, draft, assessor) {
  const report = validateAssessment(root, campaignId, sessionId, draft, assessor);
  const dir = assessmentDir(root, campaignId, sessionId);
  writeJson(path.join(dir, 'report.json'), report);
  fs.writeFileSync(path.join(dir, 'report.md'), `${markdown(report)}\n`);
  writeJson(path.join(dir, 'state.json'), { status: 'ready', updated_at: report.created_at, evidence_hash: report.evidence_hash });
  return report;
}
