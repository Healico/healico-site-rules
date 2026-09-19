# 站点结构与顶层字段

一条 Healico 站点规则是一个 JSON 对象。顶层字段描述请求地址、请求头、展示方式、页面配置和各阶段解析规则。

## 最小结构

```json
{
  "name": "本地示例",
  "domain": "reader.example.test",
  "indexUrl": "https://reader.example.test/api/books?page={page:1}",
  "indexRule": {
    "item": { "selector": "$.payload.books" },
    "idCode": { "selector": "$.key" },
    "title": { "selector": "$.label" },
    "cover": { "selector": "$.cover" },
    "nextPageUrl": { "selector": "$.links.next" }
  }
}
```

`name`、`domain`、`indexUrl`、`indexRule` 是入门阶段的最小组合。其他字段应在对应阶段验证通过后添加。

## 入口地址

| 字段 | 作用 | 说明 |
| --- | --- | --- |
| `indexUrl` | 列表入口 | 必填，通常包含 `{page:1}` |
| `searchUrl` | 搜索入口 | 通常包含 `{keyword:}` 和页码 |
| `detailUrl` | 详情入口 | 通常由 `{idCode:}` 生成 |
| `galleryUrl` | 图片入口 | 通常由 `{cidCode:}` 生成 |
| `webUrl` | 人类可读页面 | 详情入口是 API 时可提供 |
| `seriesUrl` | 系列入口 | 用于系列或合集 |
| `tagUrl` | 标签入口 | 配合 `tagSearchRule` |
| `loginUrl` | 登录页面 | 只描述入口，不包含凭据 |

## 请求头

公共请求头写在 `httpHeaders`。阶段请求头会覆盖同名公共字段。

| 字段 | 阶段 |
| --- | --- |
| `indexHTTPHeaders` | 列表 |
| `searchHTTPHeaders` | 搜索 |
| `detailHTTPHeaders` | 详情与章节接口 |
| `galleryHTTPHeaders` | 图片页 |
| `imageHTTPHeaders` | 图片请求 |
| `videoHTTPHeaders` | 视频请求 |

::: danger 禁止硬编码凭据
不要在可分享规则中写 Cookie、Authorization、Token、密码、签名密钥或设备身份。公开协议常量使用 `requestProfile.publicParameters`，用户状态由应用内账号流程处理。
:::

## 解析规则

| 字段 | 作用 |
| --- | --- |
| `indexRule` | 解析列表 |
| `searchRule` | 解析搜索，缺省时可回退列表规则 |
| `detailRule` | 解析详情、章节入口和元数据 |
| `galleryRule` | 解析图片或视频 |
| `seriesRule` | 解析系列 |
| `tagSearchRule` | 解析标签搜索 |
| `extraRule` | 扩展数据容器 |

## 页面配置

`pages` 是对象数组，用于同一站点内的多个分类页：

```json
"pages": [
  {
    "name": "最近更新",
    "indexUrl": "/api/latest?page={page:1}",
    "listRule": { "item": { "selector": "$.items" } },
    "detailRule": { "title": { "selector": "$.title" } },
    "galleryRule": { "image": { "selector": "$.url" } }
  }
]
```

页面级字段包括：

- `name`
- `displayMode`
- `indexUrl`
- `detailUrlPattern`
- `galleryUrlPattern`
- `flags`
- `listRule`
- `detailRule`
- `galleryRule`

## 图片与网络选项

| 字段 | 说明 |
| --- | --- |
| `imageTransport` | 图片传输策略，默认 `rcp` |
| `imageHeaderMode` | `merge` 或 `replace` |
| `imageHostPatterns` | 图片主机匹配正则数组 |
| `mirrors` | 备用主机映射 |
| `credentialOrigins` | 可携带私有请求头的 HTTPS origin |

`mirrors` 示例：

```json
{
  "reader.example.test": ["backup.example.test"]
}
```

## 展示与元数据

| 字段 | 说明 |
| --- | --- |
| `displayMode` | 展示模式 |
| `chapterOrder` | 章节顺序，如 `asc`、`desc` |
| `galleryDirection` | 阅读方向 |
| `imagePairingMode` | 双页拼合模式 |
| `flags` | 兼容展示标记 |
| `version` | 规则版本 |
| `author` / `authorWebsite` / `icon` | 作者信息 |
| `throttleBudget` | 每任务章节请求预算 |

## 完整骨架

```json
{
  "name": "完整骨架示例",
  "domain": "reader.example.test",
  "version": "1",
  "indexUrl": "https://reader.example.test/api/books?page={page:1}",
  "searchUrl": "https://reader.example.test/api/search?q={keyword:}&page={page:1}",
  "detailUrl": "https://reader.example.test/api/books/{idCode:}",
  "galleryUrl": "https://reader.example.test/api/chapters/{cidCode:}/images?page={page:1}",
  "httpHeaders": { "Accept": "application/json" },
  "indexRule": {},
  "searchRule": {},
  "detailRule": {},
  "galleryRule": {},
  "requestProfile": {},
  "pages": []
}
```

空对象仅用于展示字段位置；实际规则应删除未使用字段。
