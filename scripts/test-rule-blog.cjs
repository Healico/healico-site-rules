#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { startServer } = require('./serve-blog.cjs');

const root = path.resolve(__dirname, '..');

async function getJson(base, pathname) {
  const response = await fetch(new URL(pathname, base));
  assert.equal(response.status, 200, `${pathname} should return 200`);
  return await response.json();
}

async function assertNoExternalUrl(text, label) {
  const matches = [...text.matchAll(/https?:\/\/[^\s"'<>)]+/g)].map(match => match[0]);
  for (const value of matches) {
    const allowed = value.startsWith('http://127.0.0.1:') || value.startsWith('http://localhost:');
    assert.ok(allowed, `${label} contains a non-local URL: ${value}`);
  }
}

async function main() {
  const rule = JSON.parse(await fs.readFile(path.join(root, 'site/rule-demo.json'), 'utf8'));
  assert.equal(rule.name, '本地规则演示');
  assert.equal(rule.domain, '127.0.0.1:8787');
  assert.ok(rule.indexUrl.startsWith('http://127.0.0.1:8787/'));
  assert.equal(rule.indexRule.item.selector, '$.payload.books');
  assert.equal(rule.indexRule.idCode.selector, '$.key');
  assert.equal(rule.detailRule.chaptersApiRule.chapterRule.item.selector, '$.payload.entries');
  assert.equal(rule.galleryRule.image.selector, '$.original');
  for (const forbidden of ['decrypt', 'apiAuth', 'aesSalt', 'legacyKey', 'unsupportedLegacyAuth']) {
    assert.ok(!(forbidden in rule), `rule must not contain ${forbidden}`);
  }

  const indexHtml = await fs.readFile(path.join(root, 'site/index.html'), 'utf8');
  const demoHtml = await fs.readFile(path.join(root, 'site/test-site/index.html'), 'utf8');
  const skill = await fs.readFile(path.join(root, 'skills/healico-rule-author/SKILL.md'), 'utf8');
  await assertNoExternalUrl(indexHtml, 'site/index.html');
  await assertNoExternalUrl(demoHtml, 'site/test-site/index.html');
  await assertNoExternalUrl(JSON.stringify(rule), 'site/rule-demo.json');
  await assertNoExternalUrl(skill, 'skills/healico-rule-author/SKILL.md');
  assert.match(skill, /node scripts\/lint-rules\.cjs/);
  assert.match(skill, /Do not include cookies, tokens, passwords/);

  const server = await startServer(0);
  try {
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}/`;
    const health = await getJson(base, 'healthz');
    assert.equal(health.ok, true);

    const page1 = await getJson(base, 'api/books?page=1');
    assert.equal(page1.payload.books.length, 2);
    assert.equal(page1.payload.books[0].key, 'star-atlas');
    assert.equal(page1.links.next, '/api/books?page=2');
    const page2 = await getJson(base, 'api/books?page=2');
    assert.equal(page2.payload.books.length, 1);
    assert.equal(page2.links.next, null);

    const search = await getJson(base, 'api/search?q=%E6%98%9F&page=1');
    assert.equal(search.payload.books.length, 1);
    assert.equal(search.payload.books[0].label, '星图旅记');

    const detail = await getJson(base, 'api/books/star-atlas');
    assert.equal(detail.book.label, '星图旅记');
    const chapters = await getJson(base, 'api/books/star-atlas/chapters');
    assert.equal(chapters.payload.entries.length, 12);
    assert.equal(chapters.payload.entries[0].key, 'star-atlas-1');

    const images1 = await getJson(base, 'api/chapters/star-atlas-1/images?page=1');
    assert.deepEqual(images1.payload.pictures.map(item => item.index), [1, 2]);
    assert.equal(images1.links.next, '/api/chapters/star-atlas-1/images?page=2');
    const images2 = await getJson(base, 'api/chapters/star-atlas-1/images?page=2');
    assert.deepEqual(images2.payload.pictures.map(item => item.index), [3, 4]);
    assert.equal(images2.links.next, null);

    const skillResponse = await fetch(new URL('downloads/healico-rule-author/SKILL.md', base));
    assert.equal(skillResponse.status, 200);
    assert.match(await skillResponse.text(), /^name: healico-rule-author$/m);

    const blogResponse = await fetch(new URL('/', base));
    assert.equal(blogResponse.status, 200);
    assert.match(await blogResponse.text(), /Healico 站点规则怎么写/);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  console.log('Rule blog tests passed.');
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
