# 请求协议配置：requestProfile

`requestProfile` 描述通用请求管线：基础地址、公开协议参数、请求前计算、响应后处理、状态、恢复和缓存。它只描述协议，不应包含个人凭据。

## 顶层字段

| 字段 | 说明 |
| --- | --- |
| `publicParameters` | 作者公开的协议常量 |
| `transport` | 请求传输配置 |
| `baseUrl` | 协议基础地址 |
| `forceBase` | 是否强制使用基础地址 |
| `domains` | 允许的协议主机 |
| `headers` | 协议层请求头 |
| `steps` | 请求前值计算 |
| `responseSteps` | 响应后处理 |
| `state` | 状态字段声明 |
| `initializeUrl` / `initializeHeaders` | 初始化请求 |
| `credentialOrigins` | 可携带私有请求头的 HTTPS origin |
| `retry` | 协议错误恢复 |
| `auxiliaryToken` | 辅助公开令牌状态 |
| `queryDefaults` | 默认查询参数 |
| `successCodePath` / `successCode` | 成功码判断 |
| `cacheTtlMs` / `galleryCacheTtlMs` / `cacheMaxEntries` / `cacheIgnoreQuery` | 缓存策略 |
| `serial` | 是否串行请求 |
| `account` | 账号流程描述 |
| `readFallback` | 特定读取回退 |

## 公开参数限制

`publicParameters` 最多 32 项，键必须是合法标识符，值必须是字符串且不超过 256 字符。不能使用 token、cookie、authorization、password、secret、session、signature、device 等凭据相关名称。

::: danger 安全边界
公开参数只放协议本身的无害常量；用户令牌、账号状态和设备身份不能写入可分享规则。
:::

## 状态字段

```json
"state": [
  {
    "name": "layout",
    "initial": "default",
    "label": "布局",
    "options": ["default", "compact"],
    "optionLabels": ["默认", "紧凑"],
    "resettable": true
  }
]
```

## ValueStep 结构

```json
{
  "op": "hmac",
  "out": "signature",
  "input": "path={{path}}&timestamp={{timestamp}}",
  "key": "public-demo-key",
  "algorithm": "SHA256",
  "encoding": "utf8"
}
```

| 属性 | 说明 |
| --- | --- |
| `op` | 操作类型 |
| `out` | 输出变量名 |
| `input` | 输入模板 |
| `key` / `iv` | 密钥或初始向量模板 |
| `encoding` | `utf8`、`base64`、`hex` |
| `algorithm` | 哈希、HMAC 或 AES 算法 |
| `flags` | 正则 flags |
| `pattern` / `replacement` | 正则匹配或替换 |
| `start` / `end` | 切片范围 |
| `path` | JSONPath |
| `fallback` | 正则失败时的回退模板 |

## 支持的操作

| `op` | 行为 |
| --- | --- |
| `template` | 展开 `{{name}}` |
| `hash` | 摘要，默认 MD5 |
| `hmac` | HMAC，默认 SHA256 |
| `base64` | UTF-8 转 Base64 |
| `slice` | 截取字符串 |
| `regex` | 正则捕获 |
| `replace` | 全局正则替换 |
| `json` | 从 JSON 输入读取 JSONPath |
| `aes` | AES 解密 |
| `jsonBoundary` | 截取并校验嵌入 JSON |
| `zipSort` | 按 key 字符顺序重排 input 字符 |
| `random` | 按模式生成随机值 |
| `authorization` | 拼接 `scheme value` |

步骤按数组顺序执行；后续步骤可引用前面 `out` 变量。步骤最多 64 项。

## 域名发现

```json
"discovery": {
  "url": "https://discover.example.test/hosts",
  "steps": [
    { "op": "json", "input": "{{body}}", "path": "$.hosts", "out": "body" }
  ],
  "path": "$.hosts",
  "maxHosts": 5
}
```

## 错误恢复

```json
"retry": {
  "codes": [429, 503],
  "codePath": "$.code",
  "maxAttempts": 3,
  "recoveryUrl": "https://reader.example.test/recover"
}
```

恢复必须有限、显式。不能把 401、403、验证码或付费墙当作可自动绕过的状态。

## 辅助令牌

`auxiliaryToken` 包含：

- `state`
- `equals`
- `url`
- `path`
- `query`
- `ttlMs`
- `fallback`

它只描述公开协议状态，不能保存用户凭据。

## 账号配置

`account` 包含：

- `enabled`
- `url`
- `steps`
- `body`
- `headers`
- `tokenPath`
- `messagePath`
- `tokenState`

账号令牌属于当前用户和设备，不应写入可分享 JSON。

## 读取回退

```json
"readFallback": {
  "origin": "https://backup.example.test",
  "pathPattern": "^/api/chapters/[^/]+/images$",
  "queryParameters": ["page"],
  "headers": { "Accept": "application/json" }
}
```

`readFallback` 必须声明规范 HTTPS origin、完整路径正则、查询参数白名单和独立请求头。
