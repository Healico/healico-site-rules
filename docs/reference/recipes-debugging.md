# 常见模式与排错

## 普通 JSON 列表

```json
{
  "item": { "selector": "$.payload.books" },
  "idCode": { "selector": "$.key" },
  "title": { "selector": "$.label" },
  "cover": { "selector": "$.cover" },
  "nextPageUrl": { "selector": "$.links.next" }
}
```

## HTML 列表

```json
{
  "item": { "selector": "main .book" },
  "idCode": { "selector": "[data-key]", "function": "attr", "param": "data-key" },
  "title": { "selector": "h2", "function": "text" },
  "cover": { "selector": "img", "function": "attr", "param": "data-src, src" },
  "url": { "selector": "a", "function": "attr", "param": "href" }
}
```

## 字符串数组

```json
{
  "item": { "selector": "$" },
  "image": { "selector": "this" }
}
```

## 章节 API

```json
"detailRule": {
  "chaptersApi": "/api/books/{idCode:}/chapters",
  "chaptersApiRule": {
    "maxPages": 20,
    "chapterRule": {
      "item": { "selector": "$.payload.entries" },
      "idCode": { "selector": "$.key" },
      "title": { "selector": "$.label" },
      "url": { "selector": "$.href" }
    },
    "nextPageUrl": { "selector": "$.links.next" }
  }
}
```

## 客户端渲染

```json
"indexRule": {
  "webDom": true,
  "pageReadyMarker": { "selector": "main .book" },
  "item": { "selector": "main .book" }
}
```

## 请求前计算

```json
"requestProfile": {
  "publicParameters": {
    "apiVersion": "1"
  },
  "steps": [
    { "op": "template", "out": "path", "input": "/api/books" },
    { "op": "template", "out": "material", "input": "{{apiVersion}}:{{path}}" },
    { "op": "hmac", "out": "signature", "input": "{{material}}", "key": "public-demo-key", "algorithm": "SHA256" }
  ]
}
```

教学与测试应使用本地模拟服务验证计算结果，不使用真实站点或真实密钥。

## 排错表

| 症状 | 优先检查 |
| --- | --- |
| 列表为空 | `item.selector` 层级、响应类型、数组是否嵌套 |
| 有列表但详情失败 | `idCode` 是否非空、`detailUrl` 占位符、手动拼接详情地址 |
| 章节为空 | 章节字段是否放在 `chaptersApiRule.chapterRule` 内 |
| 图片为空 | `galleryUrl`、`item`、`image`、响应类型 |
| 第二页重复 | `nextPageUrl` 是否返回当前页、模板页码是否递增 |
| 图片乱序 | `processing.orderPath` 数量、槽位冲突、分条配置 |
| 导入失败 | JSON 语法、旧字段、原型保留键、必填选择器 |
| 手机访问失败 | 是否误用 `127.0.0.1`，应使用局域网地址和 `device-rule.json` |

## 推荐调试顺序

1. 浏览器打开入口地址，确认响应结构。
2. 只写 `item`，确认命中数量。
3. 加 `idCode` 和 `title`。
4. 加详情 URL，用固定 ID 验证。
5. 加章节规则，验证目录完整。
6. 加图片规则，验证第一页、最后一页和总数。
7. 最后加搜索和高级协议能力。
