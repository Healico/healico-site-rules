# 详情、章节与图片

## 详情字段

| 字段 | 说明 |
| --- | --- |
| `title` | 作品标题 |
| `desc` | 简介 |
| `cover` | 详情封面 |
| `author` / `uploader` / `category` | 作者、上传者、分类 |
| `datetime` / `published` | 时间 |
| `rating` | 评分 |
| `tags` | 标签 |
| `pictures` | 预览图片数量或集合 |
| `photoAlbumLink` | 相册入口 |
| `secondLevelPageUrl` | 二级页面入口 |

## 章节来源一：详情页内解析

```json
"detailRule": {
  "title": { "selector": "$.book.label" },
  "chapterRule": {
    "item": { "selector": "$.payload.chapters" },
    "idCode": { "selector": "$.key" },
    "title": { "selector": "$.label" },
    "url": { "selector": "$.href" }
  }
}
```

`chapterRule.item` 与 `idCode` 必填。章节 ID 为空的条目会被拒绝；重复 ID 按首次出现顺序去重。

## 章节来源二：独立章节接口

```json
"detailRule": {
  "title": { "selector": "$.book.label" },
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

规则：

- `chaptersApiRule` 是响应容器。
- 章节字段放在 `chaptersApiRule.chapterRule` 内。
- 接口使用 `detailHTTPHeaders`。
- 可省略章节 `url`，让 `galleryUrl` 由 `cidCode` 生成。
- 请求失败、JSON 无效、章节 ID 缺失或分页异常时，不把部分目录报告为成功。

## 单章与当前页

| 字段 | 作用 |
| --- | --- |
| `singleChapterWhenEmpty` | 详情没有章节时视为单章 |
| `currentPageAsChapter` | 把当前详情地址插入为第一章 |
| `fallbackItem` | 主章节选择器无命中时的备用选择器 |

## 图片规则

```json
"galleryRule": {
  "item": { "selector": "$.payload.pictures" },
  "image": { "selector": "$.original" },
  "link": { "selector": "$.viewer" },
  "nextPageUrl": { "selector": "$.links.next" },
  "totalImages": { "selector": "$.payload.total" }
}
```

| 字段 | 说明 |
| --- | --- |
| `item` | 图片数组或节点 |
| `image` | 原图地址 |
| `link` | 二级查看页地址 |
| `nextPageUrl` | 图片分页地址 |
| `totalImages` | 已知总数时必须完整获得 |

字符串数组：

```json
{
  "item": { "selector": "$" },
  "image": { "selector": "this" }
}
```

## 图片顺序处理

```json
"processing": {
  "orderPath": "$.payload.order",
  "urlPattern": "/thumb/(.*)$",
  "urlReplacement": "/original/$1"
}
```

| 字段 | 说明 |
| --- | --- |
| `orderPath` | 顺序数组；数量必须与图片数量一致 |
| `urlPattern` | 地址替换正则 |
| `urlReplacement` | 替换模板 |
| `strips` | 分条还原配置 |

`strips` 包含 `id`、`hash`、`bands`、`multiplier`、`add`。顺序数量不符或槽位冲突时必须失败。

## 媒体字段

| 字段 | 说明 |
| --- | --- |
| `video` | 视频地址或播放器参数 |
| `duration` / `views` / `likes` | 时长与统计 |
| `largeImage` | 大图或封面 |
| `webPlayer` | 交给内嵌网页播放器 |
| `videoHTTPHeaders` | 媒体请求头 |
