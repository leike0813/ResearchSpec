import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('./prototype-review-workbench.html', import.meta.url), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script, 'prototype script exists');
new Function(script);

const pure = script.slice(script.indexOf('const SECTIONS ='), script.indexOf('const storeKey='));
const { documentFor, snapshotFor, makeAnchor, resolvedComment, initialState } = runInNewContext(
  `${pure}\n({ documentFor, snapshotFor, makeAnchor, resolvedComment, initialState })`
);

for (const format of ['markdown', 'quarto', 'latex']) {
  const blocks = documentFor(format);
  const snapshot = snapshotFor(format);
  for (const comment of initialState(format).comments) {
    const block = blocks.find(item => item.id === comment.original.block_hint);
    assert.ok(block, comment.id);
    assert.equal(comment.original.render_id, snapshot.render_id);
    assert.equal(block.text.slice(comment.original.start, comment.original.end), comment.original.exact_quote);
    assert.equal(resolvedComment(comment).current.block_id, block.id);
    assert.equal(resolvedComment(comment).status, '已挂载');
  }
}
assert.equal(initialState('empty').comments.length, 0);
assert.equal(initialState('next').comments.length, 0);
assert.notEqual(snapshotFor('latex').render_id, snapshotFor('next').render_id);
assert.equal(documentFor('latex').some(block => block.kind === 'raw'), true);
assert.equal(documentFor('markdown').some(block => block.kind === 'raw'), false);
const image = documentFor('latex').find(block => block.kind === 'image');
assert.equal(makeAnchor(image, 0, image.text.length, documentFor('latex'), snapshotFor('latex')).resource_id, image.resource);
console.log('prototype syntax and frozen anchors: OK');
