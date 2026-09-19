# 校验与安全

## JSON 输入校验

- 顶层必须是对象。
- 不允许 `__proto__`、`constructor`、`prototype`。
- 嵌套深度最多 64。
- 正则必须可编译。
- 数组与对象类型必须符合字段要求。

## 拒绝的旧字段

以下旧专用字段会直接拒绝导入：

- `decrypt`
- `apiAuth`
- `aesSalt`
- `chapterJsonPath`
- `chapterIdField`
- `chaptersApiViaWebView`
- `galleryWebView`
- `unsupportedLegacyAuth`
- `legacyKey`

这些能力应改用通用 `requestProfile`、`responseSteps`、`webDom` 或显式渲染模式表达。

## 结构性校验

- 配置 `chaptersApi` 时，必须提供 `chaptersApiRule.chapterRule.item.selector` 和 `idCode.selector`。
- `webDom: true` 时，必须提供非空 `pageReadyMarker.selector`。
- `renderMode` 只能是 `browserScript`、`contentEnvelope`、`playerEnvelope`。
- 普通 `maxPages` 为 1–200。
- 浏览器脚本 `maxPages` 为 1–1000。
- `browserPageStep` 为 1–100。

## 协议配置校验

- `steps`、`responseSteps`、`playerSteps` 最多 64 项。
- `out` 必须是合法变量名。
- AES 算法只能是 CBC 或 ECB。
- `readFallback.origin` 必须是规范 HTTPS origin。
- `readFallback.pathPattern` 必须是完整路径正则。
- `credentialOrigins` 必须是规范 HTTPS origin。

## 网络与凭据边界

- 跨域请求只保留公开协商类请求头。
- Cookie 只发送给站点同源目标。
- HTTPS 页面不能重定向到 HTTP。
- 请求头覆盖不区分大小写。
- 不要在规则中写 Cookie、Authorization、Token、密码、签名密钥、设备身份或私人账号参数。
- `publicParameters` 不能包含凭据相关命名。

## 授权与合规

- 规则只用于你有权访问的内容。
- 不要绕过登录、验证码、付费墙、访问控制或版权限制。
- 不要把私有接口、未公开地址或他人数据写入公开规则。
- 教学示例只使用本地地址或保留域名。
- 分享前逐项检查请求头和协议常量。

## 本地测试

```bash
npm test
npm run docs:build
node scripts/serve-blog.cjs
```

## 发布前检查表

- [ ] JSON 语法有效，无注释和尾逗号
- [ ] 没有旧专用字段
- [ ] 列表、搜索、详情、章节、图片逐项验证
- [ ] 分页第一页、最后一页、空结果均通过
- [ ] 章节 ID 唯一且非空
- [ ] 图片顺序和总数正确
- [ ] 没有凭据、Cookie、Token、密码、密钥
- [ ] 没有真实第三方站点示例
- [ ] 错误路径不会无限重试
- [ ] 用户已获得内容访问授权
