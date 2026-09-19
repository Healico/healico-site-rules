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
    return privateIp || host === 'github.com' || host === 'healico.github.io' || host.endsWith('.test') || host.includes('你的IP');
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
  const zeroHtml = await fs.readFile(path.join(root, 'site/zero-to-rule.html'), 'utf8');
  const capabilityHtml = await fs.readFile(path.join(root, 'site/capability-map.html'), 'utf8');
  const docsFiles = ['index.html', 'site-schema.html', 'selectors.html', 'rule-fields.html', 'url-pagination.html', 'chapters-gallery.html', 'request-profile.html', 'browser-media.html', 'validation-security.html', 'recipes-debugging.html'];
  const docsHtml = await Promise.all(docsFiles.map(async name => await fs.readFile(path.join(root, 'site/docs', name), 'utf8')));
  const demoHtml = await fs.readFile(path.join(root, 'site/test-site/index.html'), 'utf8');
  const skill = await fs.readFile(path.join(root, 'skills/healico-rule-author/SKILL.md'), 'utf8');
  await assertNoExternalUrl(indexHtml, 'site/index.html');
  await assertNoExternalUrl(zeroHtml, 'site/zero-to-rule.html');
  await assertNoExternalUrl(capabilityHtml, 'site/capability-map.html');
  for (let i = 0; i < docsFiles.length; i++) {
    await assertNoExternalUrl(docsHtml[i], `site/docs/${docsFiles[i]}`);
  }
  await assertNoExternalUrl(demoHtml, 'site/test-site/index.html');
  await assertNoExternalUrl(JSON.stringify(rule), 'site/rule-demo.json');
  await assertNoExternalUrl(skill, 'skills/healico-rule-author/SKILL.md');
  assert.match(skill, /node scripts\/lint-rules\.cjs/);
  assert.match(skill, /Do not include cookies, tokens, passwords/);
  assert.match(zeroHtml, /第 1 步：确认电脑能运行 Node\.js/);
  assert.match(zeroHtml, /第 9 步：为自己的接口写规则/);
  assert.match(capabilityHtml, /当前还没有完整讲解/);
  assert.match(capabilityHtml, /requestProfile\.steps/);
  assert.match(capabilityHtml, /需要请求签名或时间戳/);
  assert.match(indexHtml, /capability-map\.html/);
  assert.match(indexHtml, /docs\/index\.html/);
  assert.match(capabilityHtml, /docs\/index\.html/);
  assert.match(docsHtml[0], /Healico 站点规则完整文档/);
  assert.match(docsHtml[1], /站点结构与顶层字段/);
  assert.match(docsHtml[2], /选择器参考/);
  assert.match(docsHtml[3], /规则级字段总表/);
  assert.match(docsHtml[4], /URL 模板与分页/);
  assert.match(docsHtml[5], /详情、章节与图片/);
  assert.match(docsHtml[6], /请求协议配置/);
  assert.match(docsHtml[7], /浏览器与媒体模式/);
  assert.match(docsHtml[8], /校验与安全/);
  assert.match(docsHtml[9], /常见模式与排错/);
  assert.match(skill, /## Top-level site fields/);
  assert.match(skill, /## Request profile/);
  assert.match(skill, /## Browser and media modes/);
  assert.match(skill, /## Review checklist/);
  assert.match(indexHtml, /zero-to-rule\.html/);

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

    const docsResponse = await fetch(new URL('docs/index.html', base));
    assert.equal(docsResponse.status, 200);
    assert.match(await docsResponse.text(), /Healico 站点规则完整文档/);

    const capabilityResponse = await fetch(new URL('capability-map.html', base));
    assert.equal(capabilityResponse.status, 200);
    assert.match(await capabilityResponse.text(), /学完这个站，能写哪类 Healico 站点规则/);

    const lessonResponse = await fetch(new URL('zero-to-rule.html', base));
    assert.equal(lessonResponse.status, 200);
    assert.match(await lessonResponse.text(), /零基础写出第一条 Healico 站点规则/);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }

  console.log('Rule blog tests passed.');
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
