#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { startServer } = require('./serve-blog.cjs');
const { buildDeviceRule } = require('./make-device-rule.cjs');

const root = path.resolve(__dirname, '..');

async function getJson(base, pathname) {
  const response = await fetch(new URL(pathname, base));
  assert.equal(response.status, 200, `${pathname} should return 200`);
  return await response.json();
}

function allowedUrl(value) {
  if (value.includes('你的IP') || value.includes('.test')) return true;
  try {
    const url = new URL(value);
    const host = url.hostname;
    const privateIp = /^127\.0\.0\.1$/.test(host) || /^localhost$/.test(host) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) || /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host);
    return privateIp || host === 'github.com' || host === 'healico.github.io';
  } catch {
    return false;
  }
}

async function assertNoExternalUrl(text, label) {
  const matches = [...text.matchAll(/https?:\/\/[^\s"'<>)]+/g)].map(match => match[0]);
  for (const value of matches) {
    assert.ok(allowedUrl(value), `${label} contains a non-approved URL: ${value}`);
  }
}

async function assertNoThirdPartySiteMention(text, label) {
  const forbidden = /copymanga|拷贝漫画|禁漫|jmcomic|ehentai|rehentai|wnacg|绅士漫画|动漫屋|dm5|樱花动漫|yhdm|aiyifan|爱壹帆|xvideos|bilibili|youtube|google|baidu|deepseek|zhipu/i;
  assert.ok(!forbidden.test(text), `${label} contains a third-party site reference`);
}

async function main() {
  const rule = JSON.parse(await fs.readFile(path.join(root, 'docs/public/rule-demo.json'), 'utf8'));
  assert.equal(rule.name, '本地规则演示');
  assert.equal(rule.domain, '127.0.0.1:8787');
  assert.equal(rule.indexRule.item.selector, '$.payload.books');
  assert.equal(rule.indexRule.idCode.selector, '$.key');
  assert.equal(rule.detailRule.chaptersApiRule.chapterRule.item.selector, '$.payload.entries');
  assert.equal(rule.galleryRule.image.selector, '$.original');
  for (const forbidden of ['decrypt', 'apiAuth', 'aesSalt', 'legacyKey', 'unsupportedLegacyAuth']) {
    assert.ok(!(forbidden in rule), `rule must not contain ${forbidden}`);
  }

  const docsFiles = [
    'index.md',
    'getting-started/zero-to-rule.md',
    'getting-started/capability-map.md',
    'reference/site-schema.md',
    'reference/selectors.md',
    'reference/rule-fields.md',
    'reference/url-pagination.md',
    'reference/chapters-gallery.md',
    'reference/request-profile.md',
    'reference/browser-media.md',
    'reference/validation-security.md',
    'reference/recipes-debugging.md'
  ];
  const docs = await Promise.all(docsFiles.map(async name =>
    await fs.readFile(path.join(root, 'docs', name), 'utf8')
  ));
  const skill = await fs.readFile(path.join(root, 'skills/healico-rule-author/SKILL.md'), 'utf8');
  const config = await fs.readFile(path.join(root, 'docs/.vitepress/config.mts'), 'utf8');
  const testSite = await fs.readFile(path.join(root, 'docs/public/test-site/index.html'), 'utf8');

  for (let i = 0; i < docsFiles.length; i++) {
    await assertNoExternalUrl(docs[i], `docs/${docsFiles[i]}`);
    await assertNoThirdPartySiteMention(docs[i], `docs/${docsFiles[i]}`);
  }
  await assertNoExternalUrl(JSON.stringify(rule), 'rule-demo.json');
  await assertNoExternalUrl(skill, 'SKILL.md');
  await assertNoExternalUrl(testSite, 'test-site/index.html');
  await assertNoThirdPartySiteMention(skill, 'SKILL.md');
  await assertNoThirdPartySiteMention(testSite, 'test-site/index.html');

  assert.match(config, /base:\s*'\/healico-site-rules\/'/);
  assert.match(config, /https:\/\/healico\.github\.io\/healico-site-rules\/rule-demo\.json/);
  assert.match(config, /https:\/\/healico\.github\.io\/healico-site-rules\/downloads\/healico-rule-author\/SKILL\.md/);
  assert.match(config, /https:\/\/healico\.github\.io\/healico-site-rules\/test-site\//);
  assert.match(config, /provider:\s*'local'/);
  assert.match(config, /零基础跟做/);
  assert.match(config, /请求协议/);
  assert.match(docs[0], /Healico 站点规则/);
  assert.match(docs[1], /零基础写出第一条规则/);
  assert.match(docs[2], /能力边界与学习路线/);
  assert.match(docs[3], /站点结构与顶层字段/);
  assert.match(docs[4], /选择器参考/);
  assert.match(docs[5], /规则级字段总表/);
  assert.match(docs[6], /URL 模板与分页/);
  assert.match(docs[7], /详情、章节与图片/);
  assert.match(docs[8], /请求协议配置/);
  assert.match(docs[9], /浏览器与媒体模式/);
  assert.match(docs[10], /校验与安全/);
  assert.match(docs[11], /常见模式与排错/);
  assert.match(skill, /^## Top-level site fields$/m);
  assert.match(skill, /^## Request profile$/m);
  assert.match(skill, /^## Browser and media modes$/m);
  assert.match(skill, /^## Review checklist$/m);

  const deviceRule = buildDeviceRule(rule, '192.168.1.23', 8787);
  assert.equal(deviceRule.name, '局域网规则演示');
  assert.equal(deviceRule.domain, '192.168.1.23:8787');
  assert.equal(deviceRule.indexUrl, 'http://192.168.1.23:8787/api/books?page={page:1}');
  await assertNoExternalUrl(JSON.stringify(deviceRule), 'generated device rule');

  const server = await startServer(0);
  try {
    const address = server.address();
    const base = `http://127.0.0.1:${address.port}/`;
    const health = await getJson(base, 'healthz');
    assert.equal(health.ok, true);

    const page1 = await getJson(base, 'api/books?page=1');
    assert.equal(page1.payload.books.length, 2);
    assert.equal(page1.payload.books[0].key, 'star-atlas');
    assert.equal(page1.payload.books[0].cover, `${base}api/cover/star-atlas`);
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
    const images2 = await getJson(base, 'api/chapters/star-atlas-1/images?page=2');
    assert.deepEqual(images2.payload.pictures.map(item => item.index), [3, 4]);
    assert.equal(images2.links.next, null);

    for (const pathname of ['rule-demo.json', 'test-site/', 'downloads/healico-rule-author/SKILL.md']) {
      const response = await fetch(new URL(pathname, base));
      assert.equal(response.status, 200, `${pathname} should return 200`);
    }
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  console.log('Rule wiki tests passed.');
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
