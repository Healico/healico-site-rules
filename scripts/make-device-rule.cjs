#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

function buildDeviceRule(rule, host, port = 8787) {
  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(host) || host === '127.0.0.1') {
    throw new Error('请传入电脑的局域网 IPv4 地址，例如 192.168.1.23');
  }
  const parts = host.split('.').map(Number);
  if (parts.some(part => part < 0 || part > 255)) {
    throw new Error('IPv4 地址无效');
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('端口必须是 1–65535 的整数');
  }
  const target = `${host}:${port}`;
  const text = JSON.stringify(rule, null, 2).replace(/127\.0\.0\.1:8787/g, target);
  const output = JSON.parse(text);
  output.name = '局域网规则演示';
  return output;
}

async function main() {
  const host = process.argv[2];
  const port = Number(process.argv[3] || process.env.PORT || 8787);
  if (!host) {
    console.error('用法: node scripts/make-device-rule.cjs <电脑局域网IPv4> [端口]');
    console.error('示例: node scripts/make-device-rule.cjs 192.168.1.23 8787');
    process.exitCode = 1;
    return;
  }
  const source = path.join(__dirname, '../site/rule-demo.json');
  const output = path.join(process.cwd(), 'device-rule.json');
  const rule = JSON.parse(await fs.readFile(source, 'utf8'));
  const converted = buildDeviceRule(rule, host, port);
  await fs.writeFile(output, JSON.stringify(converted, null, 2) + '\n', 'utf8');
  console.log(`已生成: ${output}`);
  console.log(`请确认服务以局域网模式运行: node scripts/serve-blog.cjs --lan --port ${port}`);
  console.log(`然后在 Healico 首页选择“文件导入”，选择 device-rule.json。`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { buildDeviceRule };
