---
layout: home

hero:
  name: Healico 站点规则
  text: 完整文档、零基础教程与本地测试站
  tagline: 用一份声明式 JSON 描述列表、搜索、详情、章节、图片和协议行为。
  actions:
    - theme: brand
      text: 零基础跟做
      link: /getting-started/zero-to-rule
    - theme: alt
      text: 阅读完整参考
      link: /reference/site-schema
    - theme: alt
      text: 下载规则示例
      link: https://healico.github.io/healico-site-rules/rule-demo.json

features:
  - icon: 🧭
    title: 分阶段学习
    details: 先跑通列表，再补详情、章节、图片、搜索和高级协议。
  - icon: 🧪
    title: 本地可验证
    details: 内置零依赖模拟接口，支持列表、搜索、详情、章节和图片分页。
  - icon: 🛡️
    title: 安全边界明确
    details: 不包含真实站点、凭据、Cookie、Token、密钥或追踪代码。
  - icon: 🧩
    title: 完整字段参考
    details: 覆盖站点结构、选择器、URL 模板、请求协议、浏览器模式与校验规则。
  - icon: ⚡️
    title: 通用协议能力
    details: 讲解请求步骤、响应步骤、状态、恢复、缓存和读取回退。
  - icon: 🤝
    title: 可复用 Skill
    details: 提供规则编写 Skill，让协作助手按同一套流程生成和审查规则。
---

## 推荐阅读顺序

1. [零基础跟做](/getting-started/zero-to-rule)
2. [能力边界](/getting-started/capability-map)
3. [站点结构](/reference/site-schema)
4. [选择器](/reference/selectors)
5. [规则字段总表](/reference/rule-fields)
6. [URL 与分页](/reference/url-pagination)
7. [详情、章节与图片](/reference/chapters-gallery)
8. [请求协议](/reference/request-profile)
9. [浏览器与媒体](/reference/browser-media)
10. [校验与安全](/reference/validation-security)
11. [模式与排错](/reference/recipes-debugging)

## 本地运行

```bash
npm install
npm run docs:dev
```

另一个终端启动模拟接口：

```bash
node scripts/serve-blog.cjs
```

## 验证

```bash
npm test
npm run docs:build
```

## 内容边界

本站只传授通用规则知识和本地验证方法。示例仅使用 `127.0.0.1`、局域网地址或保留域名 `*.test`，不引用任何真实站点，也不提供绕过登录、验证码、付费墙、访问控制或版权限制的方法。
