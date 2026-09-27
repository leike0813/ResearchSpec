import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { adapters } from '../scripts/dogfood/hosts.mjs';
import { assessmentDir, attemptDir, campaignDir, evidenceHash, loadCatalog, loadConfig, matrixCaseDir, resolveSelection, rubricKeys, writeJson } from '../scripts/dogfood/lib.mjs';
import { saveAssessment } from '../scripts/dogfood/assessment.mjs';
import { importReview, report } from '../scripts/dogfood/review.mjs';
import { startServer } from '../scripts/dogfood/server.mjs';

const config = loadConfig('playbooks/dogfooding/harness.example.yaml');
const { catalog } = loadCatalog();

test('suite and model selection follows the catalog and per-host config', () => {
  const ids = [...Object.keys(adapters), 'agents', 'gemini'];
  const matrix = resolveSelection({ host: [], scenario: [], model: [] }, config, catalog, ids, adapters);
  assert.equal(matrix.matrix.targets.length * matrix.matrix.modes.length, ids.length * 3);
  assert.deepEqual(matrix.hosts, []);
  const full = resolveSelection({ behaviorHost: 'claude', host: [], scenario: [], model: [] }, config, catalog, ids, adapters);
  assert.equal(full.hosts.length, 1);
  assert.equal(full.scenarios.length, 18);
  assert.equal(full.repeat, 2);
  assert.equal(full.models.claude, 'opus');
  assert.ok(adapters.claude.argv(full.models.claude, 'prompt', '/tmp/project', 60).some(arg => arg.includes(full.models.claude)));
  const one = resolveSelection({ behaviorHost: 'claude', scenario: ['DF-T2-UNRELATED'], model: ['claude=another-model'] }, config, catalog, ids, adapters);
  assert.equal(one.models.claude, 'another-model');
  const overrideOnly = resolveSelection({ behaviorHost: 'claude', scenario: ['DF-T2-UNRELATED'], model: ['claude=another-model'], assessorHost: 'codex', assessorModel: 'model' }, { hosts: {} }, catalog, ids, adapters);
  assert.equal(overrideOnly.models.claude, 'another-model');
  assert.throws(() => resolveSelection({ behaviorHost: 'gemini', scenario: ['DF-T2-UNRELATED'] }, config, catalog, ids, adapters), /execution adapter/);
  assert.throws(() => resolveSelection({ full: true }, config, catalog, ids, adapters), /retired/);
});

test('live API exposes appended events and refuses writes or unlisted files', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchspec-harness-api-'));
  const campaignId = '20260927T000000Z-abcdef';
  const sessionId = 'codex--df-t2-unrelated--01';
  const dir = attemptDir(root, campaignId, sessionId);
  writeJson(path.join(campaignDir(root, campaignId), 'campaign.json'), { id: campaignId, schema_version: '2', selection: { matrix: { targets: ['codex'], modes: ['skills'] }, hosts: ['codex'], scenarios: ['DF-T2-UNRELATED'] }, sessions: [{ id: sessionId }] });
  const matrixDir = matrixCaseDir(root, campaignId, 'codex', 'skills');
  writeJson(path.join(matrixDir, 'report.json'), { target: 'codex', mode: 'skills', status: 'pass', checks: [] });
  writeJson(path.join(matrixDir, 'state.json'), { status: 'pass' });
  writeJson(path.join(dir, 'session.json'), { id: sessionId, host: 'codex', scenario: 'DF-T2-UNRELATED', state: 'running', ordinal: 1 });
  const { server, url } = await startServer(root, campaignId);
  try {
    const base = new URL(url).origin;
    assert.equal((await fetch(url)).status, 200);
    assert.equal((await fetch(`${base}/api/campaign`).then(x => x.json())).sessions[0].state, 'running');
    assert.equal((await fetch(`${base}/api/campaign`).then(x => x.json())).matrix[0].status, 'pass');
    fs.writeFileSync(path.join(dir, 'events.ndjson'), `${JSON.stringify({ seq: 1, type: 'tool', label: 'researchspec status' })}\n`);
    const events = await fetch(`${base}/api/sessions/${sessionId}/events?offset=0`).then(x => x.json());
    assert.equal(events.events[0].label, 'researchspec status');
    fs.appendFileSync(path.join(dir, 'events.ndjson'), `${JSON.stringify({ seq: 2, type: 'answer', label: 'done' })}\n`);
    const more = await fetch(`${base}/api/sessions/${sessionId}/events?offset=${events.next}`).then(x => x.json());
    assert.deepEqual(more.events.map(x => x.seq), [2]);
    fs.writeFileSync(path.join(dir, 'big.txt'), 'x'.repeat(1024 * 1024 + 1));
    assert.equal((await fetch(`${base}/api/sessions/${sessionId}/files/big.txt`)).status, 413);
    const download = await fetch(`${base}/api/sessions/${sessionId}/files/big.txt?download=1`);
    assert.equal(download.status, 200);
    assert.equal((await download.arrayBuffer()).byteLength, 1024 * 1024 + 1);
    assert.match(download.headers.get('content-disposition'), /attachment/);
    assert.equal((await fetch(`${base}/api/sessions/${sessionId}/files/%2e%2e%2fsecret.txt`)).status, 404);
    assert.equal((await fetch(`${base}/api/campaign`, { method: 'POST' })).status, 405);
    assert.equal((await fetch(`${base}/api/matrix/codex/skills`).then(x => x.json())).report.status, 'pass');
    assert.equal((await fetch(`${base}/api/matrix/codex/skills/files/report.json`)).status, 200);
    assert.equal((await fetch(`${base}/api/matrix/codex/skills/files/%2e%2e%2fsecret.txt`)).status, 404);
    assert.equal((await fetch(`${base}/matrix.css`)).status, 200);
    assert.equal((await fetch(`${base}/api/matrix/other/skills`)).status, 404);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('human pass requires complete evidence and stays bound after import', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchspec-harness-review-'));
  const campaignId = '20260927T000000Z-fedcba';
  const sessionId = 'codex--df-t2-unrelated--01';
  const dir = attemptDir(root, campaignId, sessionId);
  writeJson(path.join(campaignDir(root, campaignId), 'campaign.json'), { id: campaignId, schema_version: '2', selection: { matrix: { targets: [], modes: [] }, hosts: ['codex'], scenarios: ['DF-T2-UNRELATED'] }, sessions: [{ id: sessionId }] });
  fs.mkdirSync(dir, { recursive: true });
  for (const name of ['trace.jsonl', 'before-status.stdout', 'after-status.stdout']) fs.writeFileSync(path.join(dir, name), '{}\n');
  const evidence_hash = evidenceHash(dir);
  writeJson(path.join(dir, 'session.json'), { id: sessionId, host: 'codex', scenario: 'DF-T2-UNRELATED', state: 'sealed', ordinal: 1, exit_code: 0, evidence_hash, review_status: 'unreviewed' });
  const assertions = catalog.scenarios.find(x => x.scenario_id === 'DF-T2-UNRELATED').hard_assertions.map((_, index) => ({ index, result: 'yes', evidence: 'trace.jsonl' }));
  const review = { session_id: sessionId, evidence_hash, reviewer: 'maintainer', verdict: 'pass', precondition: 'yes', assertions, scores: Object.fromEntries(rubricKeys.map(key => [key, 3])), human_corrections: 0, resume_attempts: 0, successful_resumes: 0 };
  const file = path.join(root, 'review-input.json');
  writeJson(file, { schema_version: '2', campaign_id: campaignId, reviews: [{ ...review, scores: { ...review.scores, user_control: 0 } }] });
  assert.throws(() => importReview(root, campaignId, file), /rubric/);
  writeJson(file, { schema_version: '2', campaign_id: campaignId, reviews: [{ ...review, evidence_hash: 'stale' }] });
  assert.throws(() => importReview(root, campaignId, file), /Stale/);
  fs.unlinkSync(path.join(dir, 'after-status.stdout'));
  const incompleteHash = evidenceHash(dir);
  writeJson(path.join(dir, 'session.json'), { id: sessionId, host: 'codex', scenario: 'DF-T2-UNRELATED', state: 'sealed', ordinal: 1, exit_code: 0, evidence_hash: incompleteHash, review_status: 'unreviewed' });
  writeJson(file, { schema_version: '2', campaign_id: campaignId, reviews: [{ ...review, evidence_hash: incompleteHash }] });
  assert.throws(() => importReview(root, campaignId, file), /complete evidence/);
  fs.writeFileSync(path.join(dir, 'after-status.stdout'), '{}\n');
  writeJson(path.join(dir, 'session.json'), { id: sessionId, host: 'codex', scenario: 'DF-T2-UNRELATED', state: 'sealed', ordinal: 1, exit_code: 0, evidence_hash, review_status: 'unreviewed' });
  writeJson(file, { schema_version: '2', campaign_id: campaignId, reviews: [review] });
  assert.equal(importReview(root, campaignId, file).imported, 1);
  assert.equal(evidenceHash(dir), evidence_hash);
  assert.match(report(root, campaignId), /\| codex \| DF-T2-UNRELATED \| 1 \| 0 \| 0 \| 0 \| incomplete \|/);
});

test('assessment is evidence-bound and direct human review requires a local token', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchspec-assessment-'));
  const campaignId = '20260927T000001Z-abcdef', sessionId = 'codex--df-t2-unrelated--01';
  const dir = attemptDir(root, campaignId, sessionId);
  writeJson(path.join(campaignDir(root, campaignId), 'campaign.json'), { id: campaignId, schema_version: '2', selection: { matrix: { targets: [], modes: [] }, hosts: ['codex'], scenarios: ['DF-T2-UNRELATED'] }, sessions: [{ id: sessionId }] });
  fs.mkdirSync(dir, { recursive: true });
  for (const name of ['trace.jsonl', 'before-status.stdout', 'after-status.stdout']) fs.writeFileSync(path.join(dir, name), '{}\n');
  fs.writeFileSync(path.join(dir, 'events.ndjson'), `${JSON.stringify({ seq: 1, type: 'answer', label: '323' })}\n`);
  fs.writeFileSync(path.join(dir, 'file-diff.json'), '{"changed":[]}\n');
  const evidence_hash = evidenceHash(dir);
  writeJson(path.join(dir, 'session.json'), { id: sessionId, host: 'codex', scenario: 'DF-T2-UNRELATED', state: 'sealed', exit_code: 0, evidence_hash, review_status: 'unreviewed' });
  const ref = [{ event: 1 }], fileRef = [{ file: 'file-diff.json', line: 1 }];
  const analysis = { summary: '宿主回答计算问题', actions: [{ text: '回答 323', refs: ref }], deliverables: [], precondition: { result: 'yes', reason: '请求属于非研究问题', refs: ref }, assertions: [{ index: 0, result: 'yes', reason: '直接回答', refs: ref }, { index: 1, result: 'yes', reason: '没有文件变化', refs: fileRef }], scores: Object.fromEntries(rubricKeys.map(k => [k, { value: 3, reason: '符合场景', refs: ref }])), recommendation: { verdict: 'pass', reason: '硬断言和分数均满足', failure_modes: [], refs: ref } };
  assert.throws(() => saveAssessment(root, campaignId, sessionId, { analysis: { ...analysis, actions: [{ text: '错误引用', refs: [{ event: 99 }] }] } }, { host: 'claude', model: 'opus' }), /reference/);
  analysis.assertions[0].refs = [{ file: 'trace.jsonl', line: 1000 }, ...ref];
  const saved = saveAssessment(root, campaignId, sessionId, { analysis }, { host: 'claude', model: 'opus' });
  assert.equal(saved.analysis.recommendation.verdict, 'pass');
  assert.deepEqual(saved.analysis.assertions[0].refs, ref);
  assert.equal(evidenceHash(dir), evidence_hash);
  assert.ok(fs.existsSync(path.join(assessmentDir(root, campaignId, sessionId), 'report.md')));
  const { server, url } = await startServer(root, campaignId);
  try {
    const base = new URL(url).origin, overview = await fetch(`${base}/api/campaign`).then(x => x.json());
    const { hash } = await fetch(`${base}/api/sessions/${sessionId}/report`).then(x => x.json());
    const review = { session_id: sessionId, evidence_hash, report_hash: hash, reviewer: 'human', verdict: 'pass', precondition: 'yes', assertions: analysis.assertions.map(x => ({ index: x.index, result: x.result, evidence: '事件或文件引用' })), scores: Object.fromEntries(rubricKeys.map(k => [k, 3])), human_corrections: 0, resume_attempts: 0, successful_resumes: 0 };
    const endpoint = `${base}/api/sessions/${sessionId}/review`;
    const post = (body, token = overview.review_token) => fetch(endpoint, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', 'X-Dogfood-Review-Token': token }, body: JSON.stringify(body) });
    assert.equal((await post(review, 'bad')).status, 403);
    assert.equal((await post({ ...review, evidence_hash: 'changed' })).status, 400);
    assert.equal((await post(review)).status, 200);
    assert.equal((await fetch(`${base}/api/sessions/${sessionId}/evidence?event=1`).then(x => x.json())).events[0].label, '323');
    const old = await fetch(endpoint).then(x => x.json());
    assert.equal((await post({ ...review, verdict: 'fail', reason: '复核后发现问题', amend_reason: '纠正误判', expected_review_hash: old.hash })).status, 200);
    assert.equal(fs.readdirSync(path.join(dir, 'reviews')).length, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('historical campaigns cannot receive new assessments or published verdicts', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'researchspec-legacy-assessment-'));
  const campaignId = 'legacy-20260927T000002Z-abcdef', sessionId = 'codex--df-t2-unrelated--session-01';
  const dir = attemptDir(root, campaignId, sessionId);
  writeJson(path.join(campaignDir(root, campaignId), 'campaign.json'), { id: campaignId, schema_version: '1', selection: { hosts: ['codex'], scenarios: ['DF-T2-UNRELATED'] }, sessions: [{ id: sessionId }] });
  fs.mkdirSync(dir, { recursive: true });
  const evidence_hash = evidenceHash(dir);
  writeJson(path.join(dir, 'session.json'), { id: sessionId, host: 'codex', scenario: 'DF-T2-UNRELATED', state: 'sealed', legacy: true, exit_code: 0, evidence_hash });
  assert.throws(() => saveAssessment(root, campaignId, sessionId, {}, { host: 'codex', model: 'test' }), /read-only/);
  assert.throws(() => report(root, campaignId, true), /read-only/);
  const { server, url } = await startServer(root, campaignId);
  try {
    const base = new URL(url).origin;
    const response = await fetch(`${base}/api/sessions/${sessionId}/review`, { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json', 'X-Dogfood-Review-Token': 'unused' }, body: '{}' });
    assert.equal(response.status, 403);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
