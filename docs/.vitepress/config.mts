import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'Healico 站点规则',
  description: 'Healico 通用站点规则完整文档、零基础教程、本地测试站点与规则编写 Skill。',
  head: [
    ['meta', { name: 'robots', content: 'index,follow' }]
  ],
  cleanUrls: true,
  themeConfig: {
    siteTitle: 'Healico 站点规则',
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    lastUpdated: { text: '最后更新' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除搜索',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    nav: [
      { text: '开始', link: '/getting-started/zero-to-rule' },
      { text: '参考', link: '/reference/site-schema' },
      { text: '高级', link: '/reference/request-profile' },
      { text: '规则示例', link: '/rule-demo.json' },
      { text: 'Skill', link: '/downloads/healico-rule-author/SKILL.md' }
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '首页', link: '/' },
          { text: '零基础跟做', link: '/getting-started/zero-to-rule' },
          { text: '能力边界', link: '/getting-started/capability-map' }
        ]
      },
      {
        text: '核心参考',
        items: [
          { text: '站点结构', link: '/reference/site-schema' },
          { text: '选择器', link: '/reference/selectors' },
          { text: '规则字段总表', link: '/reference/rule-fields' },
          { text: 'URL 与分页', link: '/reference/url-pagination' },
          { text: '详情、章节与图片', link: '/reference/chapters-gallery' }
        ]
      },
      {
        text: '高级能力',
        items: [
          { text: '请求协议', link: '/reference/request-profile' },
          { text: '浏览器与媒体', link: '/reference/browser-media' }
        ]
      },
      {
        text: '质量与实战',
        items: [
          { text: '校验与安全', link: '/reference/validation-security' },
          { text: '模式与排错', link: '/reference/recipes-debugging' }
        ]
      },
      {
        text: '资源',
        items: [
          { text: '规则示例', link: '/rule-demo.json' },
          { text: '规则编写 Skill', link: '/downloads/healico-rule-author/SKILL.md' },
          { text: '本地测试站', link: '/test-site/' }
        ]
      }
    ]
  }
})
