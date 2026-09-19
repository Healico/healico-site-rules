# 规则级字段总表

本页列出规则容器内可出现的字段。不是每条规则都需要全部字段；只写当前阶段实际需要的字段。

## 渲染与请求

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `renderMode` | string | `browserScript`、`contentEnvelope`、`playerEnvelope` |
| `requestUrl` | string | 把章节链接重写为规范请求地址 |
| `requestUrlPattern` | regex | 限制 `requestUrl` 何时生效 |
| `responseSteps` | ValueStep[] | 响应进入选择器前的处理步骤 |
| `playerSteps` | ValueStep[] | 播放器响应转媒体地址的步骤 |
| `browserRequest` | boolean | 章节响应改用浏览器 XHR |
| `browserFallback` | boolean | 普通请求失败后有限回退到浏览器 |
| `preferWebView` | boolean | `contentEnvelope` 优先从浏览器读取变量 |

## 浏览器脚本

| 字段 | 说明 |
| --- | --- |
| `xhrPath` | 页面加载后请求的同源路径 |
| `resultVar` | 结果所在的全局变量 |
| `pageVars` | 要读取的页面变量名数组 |
| `pageVarPrefix` | 页面变量名前缀 |
| `countVar` | 数量变量 |
| `browserPageStep` | 页码步长，范围 1–100 |

## 图片密文

| 字段 | 说明 |
| --- | --- |
| `keyVar` | 密钥变量名 |
| `cctVar` | 初始向量变量名 |
| `defaultCct` | 默认初始向量 |

## 播放器

| 字段 | 说明 |
| --- | --- |
| `playerUrlPrefix` | 播放器页地址前缀 |
| `videoRule` | 从章节页提取播放器参数的规则 |
| `webPlayer` | 是否交给内嵌网页播放器 |

## 条目与内容字段

| 字段 | 说明 |
| --- | --- |
| `item` | 条目数组或节点选择器 |
| `fallbackItem` | 主选择器无命中时的备用选择器 |
| `idCode` | 作品或章节 ID |
| `title` | 标题 |
| `url` | 条目链接 |
| `cover` | 封面 |
| `coverWidth` / `coverHeight` | 封面尺寸 |
| `largeImage` | 大图 |
| `link` | 图片查看页链接 |
| `video` | 视频地址或播放器参数 |
| `category` | 分类 |
| `uploader` | 上传者 |
| `username` | 评论作者 |
| `content` | 评论内容 |
| `author` | 作者 |
| `datetime` | 时间 |
| `published` | 发布时间 |
| `rating` | 评分 |
| `tags` | 标签 |
| `pictures` | 预览图片数量或集合 |
| `desc` | 简介 |
| `duration` | 时长 |
| `views` | 观看数 |
| `likes` | 点赞数 |
| `photoAlbumLink` | 相册入口 |
| `secondLevelPageUrl` | 二级页面入口 |
| `image` | 原图地址 |
| `fallbackCoverUrl` | 详情封面为空时的模板地址 |

## 分页与页码

| 字段 | 说明 |
| --- | --- |
| `nextPageUrl` | 下一页地址 |
| `nextPageButton` | 下一页按钮选择器 |
| `previewPageUrl` | 预览页地址 |
| `currentPageUrl` | 当前页地址 |
| `currentPageNum` | 当前页码 |
| `totalPages` | 总页数 |
| `totalImages` | 总图片数 |
| `pagination` | 偏移分页配置 |
| `maxPages` | 最大请求页数 |

## DOM 与子规则

| 字段 | 说明 |
| --- | --- |
| `webDom` | 是否等待客户端渲染后的 DOM |
| `pageReadyMarker` | DOM 就绪标记选择器 |
| `chapterRule` | 详情页内章节规则 |
| `tagRule` | 标签规则，其 `name` 是选择器 |
| `pictureRule` | 详情预览或查看页图片规则 |
| `commentRule` | 评论规则 |
| `videoRule` | 视频或播放器参数规则 |
| `chaptersApi` | 独立章节接口地址模板 |
| `chaptersApiRule` | 独立章节接口响应容器 |
| `currentPageAsChapter` | 把当前详情页插入为第一章 |
| `singleChapterWhenEmpty` | 无章节时视为单章 |

## 图片处理

| 字段 | 说明 |
| --- | --- |
| `processing.orderPath` | 图片顺序数组路径 |
| `processing.urlPattern` | 图片地址替换正则 |
| `processing.urlReplacement` | 图片地址替换模板 |
| `processing.strips` | 图片分条还原配置 |

## 规则内请求头

规则容器也接受字符串形式的 `httpHeaders`、`imageHTTPHeaders`、`videoHTTPHeaders`。新增规则应优先使用站点顶层对象形式的阶段请求头。
