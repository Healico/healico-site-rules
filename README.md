# Healico Site Rules

Healico 通用站点规则完整文档、零基础教程、离线测试站点，以及可下载的规则编写 Skill。

- 在线 Wiki：<https://healico.github.io/healico-site-rules/>
- 零基础跟做：<https://healico.github.io/healico-site-rules/getting-started/zero-to-rule>
- 能力边界：<https://healico.github.io/healico-site-rules/getting-started/capability-map>
- 规则示例：<https://healico.github.io/healico-site-rules/rule-demo.json>
- 规则编写 Skill：<https://healico.github.io/healico-site-rules/downloads/healico-rule-author/SKILL.md>

本仓库只包含本地测试数据和保留域名示例，不包含任何真实第三方站点、凭据或追踪脚本。

## 技术栈

文档使用开源静态 Wiki 引擎 VitePress 构建，启用本地搜索、侧边栏和上一页 / 下一页导航。构建产物不引用外部 CDN、统计或追踪服务。

## 本地开发

```bash
npm install
npm run docs:dev
```

另一个终端启动本地模拟接口：

```bash
node scripts/serve-blog.cjs
```

文档地址：<http://127.0.0.1:5173/>

模拟接口：<http://127.0.0.1:8787/api/books?page=1>

## 验证与构建

```bash
npm test
npm run docs:build
npm run docs:preview
```

## 目录

- `docs/`：VitePress Wiki 源码
- `docs/public/rule-demo.json`：规则示例
- `docs/public/test-site/`：本地测试站
- `scripts/serve-blog.cjs`：零依赖模拟接口
- `scripts/test-rule-blog.cjs`：离线回归测试
- `scripts/make-device-rule.cjs`：生成手机可访问的局域网规则
- `skills/healico-rule-author/`：规则编写 Skill
