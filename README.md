# Hextris Unblocked - SEO 游戏实战练手站

本项目严格遵循出海与 SEO 专家**哥飞**分享的独立站与游戏站 SEO 方法论搭建，旨在通过低难度（Low KD）、精准搜索意图（High Intent）、零服务器成本的现代静态前端架构，快速跑通**“建站 $\to$ 部署 $\to$ GSC 收录 $\to$ 拿排名前三 $\to$ 广告变现”**的全流程。

---

## 一、 为什么选择 `Hextris Unblocked`？

| 评估指标 | 关键数据 | 优势解读 |
| :--- | :--- | :--- |
| **核心关键词** | `hextris unblocked` | 搜索意图明确：在校学生（Chromebook）或上班族寻找免安装、免翻墙即玩网页游戏 |
| **衍生关键词** | `hextris online`, `play hextris`, `hexagonal tetris` | 矩阵化长尾词全面覆盖 |
| **全球月搜索量** | **8,000 ～ 18,000** | 满足“每天几百自然访问（约 200~500 UV/天）”的练手目标 |
| **KD 竞争难度** | **4 ～ 8（极低）** | Ahrefs/Semrush 显示排名前页所需外链极少，新站站内 SEO 做好即可破局 |
| **技术实现** | 纯前端 HTML5 Canvas + Web Audio API | 零后端、零 API 成本、极速响应、100/100 Core Web Vitals 评分 |

---

## 二、 哥飞游戏站 SEO 核心要素落地清单

1. **黄金首屏即开即玩（Search Intent 100% 满足）**：
   - 顶部首屏直接嵌入完整的 HTML5 Canvas 游戏画布，用户进站 1 秒即可开玩，跳出率极低。
   - 内置 Web Audio API 合成音效（无需任何外部音频资源，绝无 404）。
   - 移动端适配：支持屏幕左右触控与独立触摸按钮，iOS/Android/平板通杀。
2. **每日挑战（Daily Challenge）留存机制**：
   - 参考哥飞关于 *Nerdle* 案例的深度拆解，内置根据当天日期生成的伪随机确定性种子（`Daily Challenge`）。
   - 全球玩家每天面对相同的下落方块序列，促成社群与朋友间的每日成绩比拼，把一次性搜索流量变成高频回访老客。
3. **厚重的站内 SEO 文本与长尾结构**：
   - 规范语义化标签：标准 `H1`、`H2`、`H3` 关键词层次。
   - 包含快捷键指南（表格）、游戏消除数学公式（$(N)^2 \times \text{Multiplier} \times 10$）、通关进阶 5 大技巧。
   - 针对 Chromebook / 学校网络环境的专题解答。
4. **Google 结构化数据（JSON-LD）全覆盖**：
   - `schema.org/VideoGame`（游戏名称、平台、单人模式、评分）
   - `schema.org/FAQPage`（常见问答直接对标 Google SERP 折叠卡片）
   - `schema.org/BreadcrumbList`（面包屑导航）
5. **合规搜索引擎配置文件**：
   - `sitemap.xml`
   - `robots.txt`
   - OpenGraph & Twitter Card 社交分享卡片。

---

## 三、 本地运行与构建

```bash
# 1. 进入项目根目录
cd /Users/uu66/Documents/antigravity/seo-game-website

# 2. 安装开发依赖（已安装完成）
npm install

# 3. 启动本地开发热更新服务器
npm run dev

# 4. 构建生产环境静态文件（输出至 dist 目录）
npm run build

# 5. 本地预览生产构建产物
npm run preview
```

---

## 四、 零成本上线部署指南（推荐 Cloudflare Pages）

本站为纯静态产物，打包后仅 ~30KB，推荐以下免费托管服务：

### 方案 A：Cloudflare Pages（哥飞极力推荐）
1. 将本地代码 push 到 GitHub 私有/公开仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) $\to$ **Compute (Workers) & Pages** $\to$ **Create application** $\to$ **Pages** $\to$ 连接 GitHub 仓库。
3. 构建配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy**，即可在几十秒内获得一个免费全球加速的 `*.pages.dev` 域名。
5. （可选）在域名服务商处绑定一个包含核心关键词的精准域名（如 `hextris-unblocked.com` 或 `hextrisunblocked.io`）。

### 方案 B：Vercel
- 直接执行 `npx vercel` 或在 Vercel 网页导入 GitHub 仓库，一键极速发布。

---

## 五、 上线后 Google 排名与收录 4 步走

1. **Google Search Console (GSC) 验证**：
   - 添加网站资源（Domain 或 URL 前缀）。
   - 在 Sitemaps 处提交 `https://你的域名/sitemap.xml`。
   - 在 URL 审查工具中对首页提交**“请求编入索引”**。
2. **监测索引与排名**：
   - 上线 3~7 天后在 Google 搜索 `site:你的域名` 查看收录情况。
   - 查看 GSC 的“效果”报表，观察 `hextris unblocked`、`hextris online` 的展示量（Impressions）与点击率（CTR）。
3. **获取基础外链（冷启动）**：
   - 在 Product Hunt、Reddit (r/WebGames, r/incremental_games)、Twitter/X、itch.io 等发布游戏分享。
   - 在独立开发平台（如 IndieHackers、V2EX、出海社群）分享你的出海练手案例。
4. **接入变现**：
   - 当网站日均自然访问稳定在 100~300 UV 以上时，向 **Google AdSense** 提交审核。
   - 由于本站具备完整的游戏说明、FAQ、免责声明与原生 HTML5 内容，非常容易通过 AdSense 审核。
