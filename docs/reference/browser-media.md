# 浏览器与媒体模式

浏览器能力是显式启用的。普通规则优先使用 HTTP 请求和声明式选择器；只有确实需要客户端渲染或浏览器执行环境时才使用这些模式。

## webDom

```json
"indexRule": {
  "webDom": true,
  "pageReadyMarker": { "selector": "main .book" },
  "item": { "selector": "main .book" },
  "idCode": { "selector": "[data-key]", "function": "attr", "param": "data-key" },
  "title": { "selector": "h2" }
}
```

规则：

- `webDom: true` 表示先加载页面并等待 DOM。
- `pageReadyMarker.selector` 必填。
- 引擎只读取 DOM，不执行规则作者提供的 JavaScript。
- 页面未在指定时间出现标记时失败。

## browserScript

用于必须让浏览器执行站点返回脚本后才能获得数据的章节页。

| 字段 | 说明 |
| --- | --- |
| `xhrPath` | 加载页面后发起的同源 GET 路径 |
| `resultVar` | 读取结果的全局变量 |
| `pageVars` | 页面变量列表 |
| `pageVarPrefix` | 页面变量前缀 |
| `countVar` | 图片数量变量 |
| `browserPageStep` | 页码步长 |
| `browserRequest` | 章节响应使用浏览器 XHR |
| `browserFallback` | 普通请求失败后有限回退 |

该模式会执行站点返回的脚本，属于高风险能力，只应在明确必要时启用。

## contentEnvelope

用于图片密文数据。

| 字段 | 说明 |
| --- | --- |
| `keyVar` | 页面中密钥变量名 |
| `cctVar` | 页面中初始向量变量名 |
| `defaultCct` | 默认初始向量 |
| `preferWebView` | 优先通过浏览器读取变量 |

`keyVar` 与 `cctVar` 必须是合法 JavaScript 标识符。解密失败或没有图片时必须报错。

## playerEnvelope

用于播放器页参数与媒体地址提取。必须提供：

- `playerUrlPrefix`
- `playerSteps`
- `videoRule`

流程：

1. 从章节页提取播放器参数。
2. 请求播放器页。
3. 通过 `playerSteps` 把响应转换为媒体地址。

## webPlayer

`galleryRule.webPlayer: true` 会把解析出的章节地址交给内嵌网页播放器。

## 风险控制

- 优先普通 HTTP + CSS / JSONPath。
- 其次 `webDom`。
- 最后才考虑 `browserScript`、`contentEnvelope`、`playerEnvelope`。
- 浏览器会话必须复用、排队并有超时。
- 旧回调不能完成新请求。
- 不能利用浏览器能力绕过登录、验证码或访问控制。
