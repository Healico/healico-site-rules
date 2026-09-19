# URL 模板与分页

## URL 占位符

| 占位符 | 含义 |
| --- | --- |
| `{page:}` | 页码，从 1 开始 |
| `{page:N}` | 页码从 N 开始 |
| `{page:N:S}` | 页码从 N 开始，每次递增 S |
| `{keyword:}` | URL 编码后的搜索词 |
| `{idCode:}` | 作品 ID |
| `{cidCode:}` | 章节 ID |
| `{domain:}` | 当前站点主机 |
| `{source:}` | 当前成功请求地址 |
| `{pageFormat:...}` | 包装器，内部占位符先展开 |

未知或运行时缺失的占位符会保留原样，便于发现配置错误。

## 地址解析

- 列表、搜索、详情、图片入口的相对地址相对于站点域名解析。
- 独立章节接口的相对地址相对于详情请求地址解析。
- `nextPageUrl` 的相对地址相对于当前成功请求地址解析。
- HTTPS 页面不能重定向到 HTTP。

## 下一页链接分页

响应级 `nextPageUrl` 优先于 URL 模板分页：

```json
"nextPageUrl": { "selector": "$.links.next" }
```

返回 `null`、空字符串或不匹配时结束。

## 模板分页

当响应没有下一页字段，但入口模板包含 `{page` 且当前页有条目时，引擎会继续请求下一页：

```json
"indexUrl": "https://reader.example.test/api/books?page={page:1}"
```

返回空列表后停止。

## 偏移分页

`chaptersApiRule.pagination` 用于 offset / limit 风格接口：

```json
"chaptersApiRule": {
  "pagination": {
    "totalPath": "$.payload.total",
    "itemsPath": "$.payload.items",
    "parameter": "offset",
    "pageSize": 100
  },
  "chapterRule": {
    "item": { "selector": "$.payload.items" },
    "idCode": { "selector": "$.key" },
    "title": { "selector": "$.label" }
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `totalPath` | 总数路径 |
| `itemsPath` | 条目数组路径 |
| `parameter` | 偏移查询参数名 |
| `pageSize` | 每页数量 |

## 页数上限

- 普通章节接口默认 50 页，范围 1–200。
- `browserScript` 模式范围 1–1000。
- `browserPageStep` 范围 1–100。
- 达到上限仍有下一页时返回错误。

## 请求地址重写

```json
"galleryRule": {
  "requestUrl": "/api/chapters/{cidCode:}/images?page={page:1}",
  "requestUrlPattern": "^https://reader\\.example\\.test/read/",
  "item": { "selector": "$.payload.pictures" },
  "image": { "selector": "$.original" }
}
```

`requestUrlPattern` 是正则；只有匹配时才重写。

## 循环防护

- 不要重复请求同一 URL。
- 空章节页、无效 JSON、缺失章节 ID 都应视为错误。
- 不能把部分章节目录当作完整目录写入离线文件。
- 每条规则都要验证第一页、最后一页和空结果。
