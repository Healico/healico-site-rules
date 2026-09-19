# Healico Site Rules

Healico 通用站点规则编写指南、完整规则示例、离线测试站点，以及可下载的规则编写 Skill。

- 在线指南：<https://healico.github.io/healico-site-rules/>
- 零基础跟做教程：<https://healico.github.io/healico-site-rules/zero-to-rule.html>
- 能力边界与学习路线：<https://healico.github.io/healico-site-rules/capability-map.html>
- 完整规则文档：<https://healico.github.io/healico-site-rules/docs/index.html>
- 规则示例：[`site/rule-demo.json`](site/rule-demo.json)
- 规则编写 Skill：[`skills/healico-rule-author/SKILL.md`](skills/healico-rule-author/SKILL.md)

本仓库只包含本地测试数据和保留域名示例，不包含任何真实第三方站点、凭据或追踪脚本。

## 本地运行

```bash
node scripts/serve-blog.cjs
```

打开 <http://127.0.0.1:8787/> 查看指南和测试站点。

## 验证

```bash
node scripts/test-rule-blog.cjs
```

测试覆盖规则 JSON、静态页面、本地接口、分页和 Skill 下载路径。

## 目录

- `site/`：静态博客、测试站点与规则示例
- `scripts/serve-blog.cjs`：零依赖本地 HTTP 服务
- `scripts/test-rule-blog.cjs`：离线回归测试
- `scripts/make-device-rule.cjs`：把本地规则转换成手机可访问的局域网规则
- `skills/healico-rule-author/`：供协作助手使用的规则编写说明
- `.github/workflows/deploy-rule-blog.yml`：GitHub Pages 部署流程
