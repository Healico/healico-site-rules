#!/usr/bin/env node
'use strict';

const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

const repoRoot = path.resolve(__dirname, '..');
const siteRoot = path.join(repoRoot, 'docs/public');
const skillPath = path.join(repoRoot, 'skills/healico-rule-author/SKILL.md');
const defaultPort = Number(process.env.PORT || 8787);
const args = new Set(process.argv.slice(2));
const lanMode = args.has('--lan');
const portIndex = process.argv.indexOf('--port');
const cliPort = portIndex >= 0 ? Number(process.argv[portIndex + 1]) : defaultPort;

const books = [
  {
    key: 'star-atlas',
    label: '星图旅记',
    summary: '一名制图师在本地测试数据中整理星区航线的合成故事。',
    chapters: 12
  },
  {
    key: 'paper-lighthouse',
    label: '纸上灯塔',
    summary: '一座由纸页构成的灯塔，用于验证章节字段和图片分页。',
    chapters: 8
  },
  {
    key: 'quiet-orbit',
    label: '安静轨道',
    summary: '两个本地测试角色维护一颗小型观测卫星的日常记录。',
    chapters: 6
  }
];

function bookList(items, origin, pathname, page) {
  return {
    payload: {
      books: items.map(book => ({
        key: book.key,
        label: book.label,
        cover: `${origin}/api/cover/${book.key}`
      }))
    },
    links: { next: items.length > 0 && page < 2 ? `${pathname}?page=${page + 1}` : null }
  };
}

function chapterEntries(book) {
  return Array.from({ length: book.chapters }, (_, index) => {
    const number = index + 1;
    return {
      key: `${book.key}-${number}`,
      label: `第 ${number} 话`,
      href: `/api/chapters/${book.key}-${number}/images?page=1`
    };
  });
}

function svgCover(key, label) {
  const safeLabel = String(label).replace(/[&<>"']/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="480" viewBox="0 0 360 480" role="img" aria-label="${safeLabel}">
  <rect width="360" height="480" fill="#e8efff"/>
  <circle cx="120" cy="130" r="72" fill="#c7d9ff"/>
  <circle cx="245" cy="270" r="96" fill="#dbe7ff"/>
  <text x="30" y="430" font-family="sans-serif" font-size="24" fill="#273a68">${safeLabel}</text>
</svg>`;
}

function staticType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (file.endsWith('.json')) return 'application/json; charset=utf-8';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.md')) return 'text/markdown; charset=utf-8';
  return 'application/octet-stream';
}

function sendJson(res, status, value) {
  const body = JSON.stringify(value, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function sendText(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(body);
}

function requestOrigin(req) {
  const host = req.headers.host || `127.0.0.1:${req.socket.localPort}`;
  return `http://${host}`;
}

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const item of list || []) {
      if (item.family === 'IPv4' && !item.internal) out.push(item.address);
    }
  }
  return [...new Set(out)];
}

function pageOf(query) {
  const raw = Number(query.get('page') || '1');
  return Number.isInteger(raw) && raw >= 1 && raw <= 100 ? raw : 1;
}

async function serveStatic(req, res, pathname) {
  if (pathname === '/') pathname = '/index.html';
  if (pathname === '/test-site') {
    res.writeHead(302, { Location: '/test-site/' });
    res.end();
    return;
  }
  if (pathname === '/test-site/') pathname = '/test-site/index.html';
  if (pathname === '/downloads/healico-rule-author/SKILL.md') {
    const body = await fs.readFile(skillPath, 'utf8');
    sendText(res, 200, body, 'text/markdown; charset=utf-8');
    return;
  }

  const target = path.normalize(path.join(siteRoot, pathname));
  if (!target.startsWith(siteRoot + path.sep)) {
    sendText(res, 403, 'Forbidden');
    return;
  }
  try {
    const stat = await fs.stat(target);
    const file = stat.isDirectory() ? path.join(target, 'index.html') : target;
    const body = await fs.readFile(file);
    res.writeHead(200, {
      'Content-Type': staticType(file),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(body);
  } catch (error) {
    sendText(res, 404, 'Not found');
  }
}

async function requestHandler(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${req.socket.localPort || defaultPort}`);
  const pathname = decodeURIComponent(url.pathname);
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 405, 'Method not allowed');
    return;
  }

  if (pathname === '/healthz') {
    sendJson(res, 200, { ok: true });
    return;
  }

  if (pathname === '/api/books') {
    const page = pageOf(url.searchParams);
    sendJson(res, 200, bookList(books.slice((page - 1) * 2, page * 2), requestOrigin(req), pathname, page));
    return;
  }

  if (pathname === '/api/search') {
    const page = pageOf(url.searchParams);
    const keyword = (url.searchParams.get('q') || '').trim();
    const found = keyword ? books.filter(book => book.label.includes(keyword) || book.key.includes(keyword)) : [];
    sendJson(res, 200, bookList(found.slice((page - 1) * 2, page * 2), requestOrigin(req), pathname, page));
    return;
  }

  const detail = /^\/api\/books\/([^/]+)$/.exec(pathname);
  if (detail) {
    const book = books.find(item => item.key === detail[1]);
    if (!book) {
      sendJson(res, 404, { error: 'book_not_found' });
      return;
    }
    sendJson(res, 200, {
      book: { key: book.key, label: book.label, summary: book.summary, chapterCount: book.chapters }
    });
    return;
  }

  const chapters = /^\/api\/books\/([^/]+)\/chapters$/.exec(pathname);
  if (chapters) {
    const book = books.find(item => item.key === chapters[1]);
    if (!book) {
      sendJson(res, 404, { error: 'book_not_found' });
      return;
    }
    sendJson(res, 200, {
      payload: { entries: chapterEntries(book) },
      links: { next: null }
    });
    return;
  }

  const images = /^\/api\/chapters\/([^/]+)\/images$/.exec(pathname);
  if (images) {
    const page = pageOf(url.searchParams);
    const first = (page - 1) * 2 + 1;
    const pictures = [first, first + 1].map(number => ({
      index: number,
      original: `${requestOrigin(req)}/api/image/${images[1]}/${number}`
    }));
    sendJson(res, 200, {
      payload: { pictures },
      links: { next: first + 1 < 4 ? `${pathname}?page=${page + 1}` : null }
    });
    return;
  }

  const image = /^\/api\/image\/([^/]+)\/(\d+)$/.exec(pathname);
  if (image) {
    const label = `Page ${image[2]}`;
    sendText(res, 200, svgCover(image[1], label), 'image/svg+xml');
    return;
  }

  const cover = /^\/api\/cover\/([^/]+)$/.exec(pathname);
  if (cover) {
    const book = books.find(item => item.key === cover[1]) || { label: 'Healico' };
    sendText(res, 200, svgCover(cover[1], book.label), 'image/svg+xml');
    return;
  }

  await serveStatic(req, res, pathname);
}

function startServer(port = defaultPort, host = '127.0.0.1') {
  const server = http.createServer(requestHandler);
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}

if (require.main === module) {
  startServer(cliPort, lanMode ? '0.0.0.0' : '127.0.0.1').then(server => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : cliPort;
    console.log(`Healico rule blog: http://127.0.0.1:${actualPort}/`);
    console.log(`Local test API:   http://127.0.0.1:${actualPort}/api/books?page=1`);
    if (lanMode) {
      for (const ip of lanAddresses()) {
        console.log(`LAN rule blog:    http://${ip}:${actualPort}/`);
        console.log(`LAN test API:     http://${ip}:${actualPort}/api/books?page=1`);
      }
      console.log(`Generate device rule: node scripts/make-device-rule.cjs <上面的IPv4> ${actualPort}`);
    }
    console.log('Press Ctrl+C to stop.');
  }).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { startServer, requestHandler };
