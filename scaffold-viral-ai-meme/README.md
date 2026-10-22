# Viral AI Meme Video Generator Scaffold (出海爆款快钱脚手架)

专为**出海独立开发者“抓突发热梗赚快钱”**打造的标准化 Next.js 极速建站脚手架。  
基于对 `hittheroaddude.org` 和 `bulin47.online` 的底层逆向与深度工程复刻。

---

## ⚡️ 10 分钟克隆上线新梗流程 (SOP)

当监控脚本发现下一个爆发热词（如 `Özil AI Goal`、`Día de Muertos Pet` 等）时：

### 1. 修改唯一配置文件 `site.config.ts`
只需修改这一个文件，全站元数据、文案、视频样例、价格和 Schema.org 结构化数据自动同步：
```typescript
export const siteConfig: MemeConfig = {
  name: "Ozil AI Goal",
  slug: "ozil-ai-goal",
  domain: "ozilai.online",
  title: "Ozil AI Goal Video Generator – The 2016 Solo Goal Recast",
  aiModelEndpoint: "fal-ai/kling-video/v1.5/pro/image-to-video",
  baseReferenceVideoUrl: "/reference/ozil-12s.mp4",
  pricing: {
    solo: { name: "Solo", videos: 1, price: 9.99, ... },
    trio: { name: "Trio", videos: 3, price: 24.99, ... },
    crew: { name: "Crew", videos: 5, price: 39.99, ... },
  },
  // ...
};
```

### 2. 放置 3 个成片演示视频
将 3 个带声音的 9:16 成品短视频放入 `public/examples/`，供首屏轮播展示。

### 3. 配置环境变量 `.env.local`
```bash
FAL_KEY=your_fal_ai_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. 部署
```bash
npm install
npm run build
# 或者一键 push 到 GitHub 关联 Vercel / Cloudflare Pages 自动部署上线
```

---

## 🛡 内置核心工程防护

1. **防谷歌翻译崩溃补丁 (`__domTranslationGuard`)**：彻底杜绝 React 因浏览器自动翻译 DOM 错位白屏的通病。
2. **Google 满配富摘要 (Rich Snippets)**：自动注入 `WebSite`、`SoftwareApplication`、`FAQPage`，在 Google SERP 抢占折叠卡片。
3. **法律合规防火墙**：强制免责声明 + 上传者 18 岁无侵权许可勾选框，避免肖像侵权纠纷。
4. **单次充值代币体系**：无月付订阅，纯一次性代币包，防退款争端与纠纷。
