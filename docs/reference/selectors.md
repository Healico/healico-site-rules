# 选择器参考

选择器负责把 JSON 或 HTML 响应转换成字段值。

## Selector 对象

| 属性 | 类型 | 作用 |
| --- | --- | --- |
| `selector` | string | JSONPath、CSS 选择器或 `this` |
| `function` | string | `text`、`attr`、`html`；支持备选和变换链 |
| `param` | string | `attr` 的属性名或回退链 |
| `regex` | string | 对提取结果执行正则 |
| `replacement` | string | 重组结果，使用 `$1`–`$9` |

## JSONPath 子集

支持：

- `$`
- `$.field`
- `$['field']`
- `$.items[0].name`

不支持：

- 通配符
- 过滤表达式
- 递归下降

当 `item.selector` 指向数组时，引擎会自动迭代数组。

```json
{
  "item": { "selector": "$.payload.books" },
  "idCode": { "selector": "$.key" },
  "title": { "selector": "$.label" },
  "cover": { "selector": "$.cover" },
  "nextPageUrl": { "selector": "$.links.next" }
}
```

::: warning 求值层级
`item` 和响应级字段从根对象求值；`idCode`、`title`、`cover` 等条目字段从每个数组元素求值。
:::

## CSS 模式

当 `selector` 不以 `$.` 开头时按 CSS 处理。多个选择器可用逗号分隔，首个命中生效。

```json
{
  "item": { "selector": "main .book" },
  "idCode": { "selector": "[data-key]", "function": "attr", "param": "data-key" },
  "title": { "selector": "h2", "function": "text" },
  "cover": { "selector": "img", "function": "attr", "param": "data-src, src" }
}
```

`this` 表示当前条目本身：

```json
{
  "item": { "selector": "$" },
  "image": { "selector": "this" }
}
```

## 函数与变换

| 写法 | 行为 |
| --- | --- |
| `text` | 提取文本；缺省或未知函数也按文本处理 |
| `attr` | 提取属性，需要 `param` |
| `html` | 提取内部 HTML |
| `text, attr` | 依次尝试，首个非空结果生效 |
| `attr.decodeBase64` | 先取属性，再 Base64 解码 |
| `text.reversed` | 先取文本，再反转字符串 |

`param` 支持：

- 普通属性名
- `textContent`
- `innerText`
- `text`
- 逗号回退链，如 `data-src, src`

## 正则与替换

```json
{
  "selector": "$.label",
  "function": "text",
  "regex": "第(\\d+)话",
  "replacement": "第 $1 章"
}
```

规则：

- 没有 `replacement` 时，有捕获组取第一个捕获组，没有捕获组取整个匹配。
- 有 `replacement` 时，使用 `$1`–`$9` 引用捕获组。
- 替换模板可使用运行时占位符，如 `{source:}`。
- 正则不匹配时字段为空。

## 常用字段

| 位置 | 字段 |
| --- | --- |
| 列表 | `item`、`fallbackItem`、`idCode`、`title`、`url`、`cover`、`coverWidth`、`coverHeight`、`category`、`uploader`、`author`、`datetime`、`published`、`rating`、`desc` |
| 详情 | `title`、`desc`、`cover`、`author`、`tags`、`pictures`、`photoAlbumLink` |
| 章节 | `item`、`idCode`、`title`、`url`、`datetime`、`totalPages`、`totalImages` |
| 图片 | `item`、`image`、`link`、`nextPageUrl`、`totalImages` |
| 视频 | `video`、`duration`、`views`、`likes`、`largeImage` |
| 评论 | `username`、`content`、`datetime` |
| 标签 | `tagRule.name`、`tagRule.url` |

## 排错顺序

1. 确认响应是 JSON 还是 HTML。
2. 先测 `item`，确认命中数量。
3. 再测 `idCode` 和 `title`。
4. 最后加封面、日期、评分等非关键字段。
