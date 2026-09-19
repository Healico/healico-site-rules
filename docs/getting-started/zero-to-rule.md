# 零基础写出第一条规则

这篇教程不要求你先懂爬虫、JSONPath 或应用源码。你只需要按顺序执行命令、打开页面、复制一份 JSON，最后在 Healico 里看到本地测试数据。

## 你会得到什么

- 一条能显示列表、搜索、详情、章节和图片分页的本地规则
- 一个可以反复修改的本地测试站
- 一套从列表到完整规则的调试顺序

## 准备

- 一台电脑
- Node.js 18 或更高版本
- 文本编辑器
- 可选：装有 Healico 的设备

## 第 1 步：确认 Node.js

```bash
node --version
```

看到 `v18`、`v20`、`v22` 或更高版本都可以。

## 第 2 步：安装并启动

```bash
git clone https://github.com/Healico/healico-site-rules.git
cd healico-site-rules
npm install
npm run docs:dev
```

保持第一个终端运行。再打开一个终端：

```bash
node scripts/serve-blog.cjs
```

浏览器打开：

- 文档：<http://127.0.0.1:5173/healico-site-rules/>
- 列表接口：<http://127.0.0.1:8787/api/books?page=1>
- 测试站：<http://127.0.0.1:8787/test-site/>

## 第 3 步：先看懂接口

列表接口返回类似：

```json
{
  "payload": {
    "books": [
      {
        "key": "star-atlas",
        "label": "星图旅记",
        "cover": "http://127.0.0.1:8787/api/cover/star-atlas"
      }
    ]
  },
  "links": {
    "next": "/api/books?page=2"
  }
}
```

先回答五个问题：

| 问题 | JSON 答案 | 规则字段 |
| --- | --- | --- |
| 列表数组在哪里？ | `payload.books` | `indexRule.item.selector` |
| 唯一 ID？ | `key` | `indexRule.idCode.selector` |
| 标题？ | `label` | `indexRule.title.selector` |
| 封面？ | `cover` | `indexRule.cover.selector` |
| 下一页？ | `links.next` | `indexRule.nextPageUrl.selector` |

::: warning 最容易犯的错
`item` 和 `nextPageUrl` 从响应根对象求值；`idCode`、`title`、`cover` 从每个数组元素内部求值。
:::

## 第 4 步：保存最小规则

创建 `my-first-rule.json`：

```json
{
  "name": "我的第一条规则",
  "domain": "127.0.0.1:8787",
  "indexUrl": "http://127.0.0.1:8787/api/books?page={page:1}",
  "indexRule": {
    "item": { "selector": "$.payload.books" },
    "idCode": { "selector": "$.key" },
    "title": { "selector": "$.label" },
    "cover": { "selector": "$.cover" },
    "nextPageUrl": { "selector": "$.links.next" }
  }
}
```

检查 JSON：

```bash
node -e "JSON.parse(require('fs').readFileSync('my-first-rule.json','utf8')); console.log('JSON OK')"
```

## 第 5 步：导入 Healico

### 电脑或模拟器

1. 打开 Healico 首页。
2. 点击右上角「文件导入」。
3. 选择 `my-first-rule.json`。
4. 看到「已导入站点：我的第一条规则」。

也可以在导入面板中粘贴 JSON 后点击「导入」。

### 手机或平板

手机不能用 `127.0.0.1` 访问电脑。让设备与电脑连接同一网络后：

```bash
node scripts/serve-blog.cjs --lan
```

终端会输出电脑的局域网地址。假设是 `192.168.1.23`：

```bash
node scripts/make-device-rule.cjs 192.168.1.23 8787
```

生成 `device-rule.json`，传入设备后在 Healico 中导入。

## 第 6 步：验收

- [ ] 列表显示 2 本作品
- [ ] 第 2 页显示 1 本作品
- [ ] 搜索「星」只出现《星图旅记》
- [ ] 搜索不存在的词返回空列表
- [ ] 详情显示标题和简介
- [ ] 章节目录显示 12 话
- [ ] 第一话图片显示第 1、2 页
- [ ] 总共 4 张图片后停止

## 第 7 步：换用完整规则

下载 [rule-demo.json](https://healico.github.io/healico-site-rules/rule-demo.json)，或查看 [站点结构](/reference/site-schema)。

完整规则额外包含：

- `searchUrl` 与 `searchRule`
- `detailUrl` 与 `detailRule`
- `chaptersApi` 与 `chaptersApiRule`
- `galleryUrl` 与 `galleryRule`

## 第 8 步：修改数据练习

打开 `scripts/serve-blog.cjs`，找到：

```js
{
  key: 'star-atlas',
  label: '星图旅记',
  summary: '一名制图师在本地测试数据中整理星区航线的合成故事。',
  chapters: 12
}
```

修改 `label` 或 `chapters`，重启服务后观察列表变化。

## 第 9 步：为自己的接口写规则

先确认你有权访问并解析该接口，然后回答：

1. 列表第一页 URL 是什么？
2. 列表数组路径是什么？
3. 唯一 ID 字段是什么？
4. 标题字段是什么？
5. 封面字段是什么？
6. 下一页字段是什么？
7. 详情 URL 如何由 `idCode` 生成？
8. 图片 URL 如何由 `cidCode` 生成？

按 [模式与排错](/reference/recipes-debugging) 中的骨架填写，并按「列表 → 详情 → 图片 → 搜索」的顺序测试。
