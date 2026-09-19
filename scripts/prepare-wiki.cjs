#!/usr/bin/env node
'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const root = path.resolve(__dirname, '..');
  const source = path.join(root, 'skills/healico-rule-author/SKILL.md');
  const target = path.join(root, 'docs/public/downloads/healico-rule-author/SKILL.md');
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(source, target);
  console.log(`Prepared wiki download: ${path.relative(root, target)}`);
}

main().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
