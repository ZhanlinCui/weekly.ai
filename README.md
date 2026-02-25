<p align="center">
  <img src="https://img.shields.io/badge/WeeklyAI-Global_AI_Discovery-635bff?style=for-the-badge&logo=sparkles&logoColor=white" alt="WeeklyAI" />
</p>

<h1 align="center">WeeklyAI</h1>

<p align="center">
  <strong>The world's first AI-powered product intelligence platform</strong><br/>
  <em>Discover tomorrow's AI unicorns before everyone else</em>
</p>

<p align="center">
  <a href="#-中文">中文</a> · <a href="#-english">English</a> · <a href="#-日本語">日本語</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Flask-3.0-000?style=flat-square&logo=flask" alt="Flask" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/GLM--4.7-Zhipu_AI-635bff?style=flat-square" alt="GLM" />
  <img src="https://img.shields.io/badge/Perplexity-Sonar-00d4aa?style=flat-square" alt="Perplexity" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
</p>

<p align="center">
  <a href="https://frontend-next-psi-nine.vercel.app"><strong>Live Demo</strong></a> · 
  <a href="https://backend-flax-mu-17.vercel.app/api/v1/products/dark-horses"><strong>API</strong></a> · 
  <a href="https://backend-flax-mu-17.vercel.app/api/v1/products/feed/rss"><strong>RSS Feed</strong></a>
</p>

---

## 🇨🇳 中文

### 产品定位

**WeeklyAI** 是全球首个 AI 驱动的产品情报平台。我们每天自动扫描全球 6 大地区的 AI 创业生态，通过多模型智能评分体系（Perplexity Sonar + 智谱 GLM-4.7），从海量信息中精准筛选出高潜力 AI 产品，让产品经理、投资人和创业者在 5 分钟内掌握全球 AI 产品脉搏。

### 核心竞争力

| 能力 | 描述 |
|------|------|
| **全球六区覆盖** | 美国 · 中国 · 欧洲 · 日韩 · 东南亚 · 全球硬件，多语言原生搜索 |
| **双 AI 引擎** | Perplexity Sonar（全球）+ 智谱 GLM-4.7（中国），智能路由，互为回退 |
| **5 级评分体系** | 融资规模 × 创始人背景 × 品类创新 × 社区热度 × 增长信号，量化评判 |
| **硬件专项发掘** | 创新形态硬件（可穿戴 / 桌面 / 随身），40% 形态创新权重，独家评分维度 |
| **AI 对话助手** | 基于 GLM-4.7 的流式对话，实时注入产品数据，秒级回答产品问题 |
| **中英双语** | 前端一键切换中 / 英，语言偏好自动记忆 |
| **Swipe 发现** | Tinder 式卡片交互，支持手势 / 惯性 / 连击特效，30 秒筛出黑马 |
| **10 步自动化流水线** | 发现 → 发布 → 回填 → 解析 → 验证 → 去重 → Logo → 新闻 → 社交信号 → 同步 |

### 产品分层

```
 5分  现象级黑马    融资 >$100M / 品类开创 / 社交爆火
 4分  强力黑马      融资 >$30M / 顶级 VC / ARR >$10M
 3分  高潜力股      融资 $1M-$5M / ProductHunt 上榜
 2分  早期观察      有创新点 / 数据不足但值得追踪
```

### 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  React 19 · TypeScript · SWR · Zod · p5.js · i18n          │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Flask 3.0)                       │
│  REST API · SSE Streaming · Rate Limiting · MongoDB/JSON    │
├──────────────────────┬──────────────────────────────────────┤
│  Perplexity Sonar    │    Zhipu GLM-4.7                     │
│  (US/EU/JP/KR/SEA)   │    (China · search_pro)              │
├──────────────────────┴──────────────────────────────────────┤
│              MongoDB 7 / JSON Fallback                      │
├─────────────────────────────────────────────────────────────┤
│  10-Step Daily Pipeline · launchd · Docker · Vercel         │
└─────────────────────────────────────────────────────────────┘
```

### 快速启动

```bash
git clone https://github.com/ZhanlinCui/weekly.ai.git
cd weekly.ai

# 前端
cd frontend-next && npm install && npm run dev    # localhost:3001

# 后端
cd backend && pip install -r requirements.txt && python run.py  # localhost:5000

# AI 发现（需要 API Key）
cd crawler && python3 tools/auto_discover.py --region all --dry-run
```

### 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| `ZHIPU_API_KEY` | 中国区 | 智谱 GLM-4.7 API Key |
| `PERPLEXITY_API_KEY` | 全球区 | Perplexity Sonar API Key |
| `MONGO_URI` | 可选 | MongoDB 连接（不设则用 JSON） |
| `NEXT_PUBLIC_API_BASE_URL` | 部署时 | 前端 API 地址 |

### API 端点

| 端点 | 说明 |
|------|------|
| `GET /products/dark-horses` | 本周黑马（4-5 分，自动轮换） |
| `GET /products/rising-stars` | 潜力股（2-3 分） |
| `GET /products/weekly-top` | 本周 Top 15（composite / trending / recency） |
| `GET /products/blogs` | 新闻动态（YouTube / X / HN / PH） |
| `GET /search?q=xxx` | 全文搜索（多字段加权） |
| `POST /chat` | AI 对话（GLM-4.7 流式 SSE） |
| `GET /products/feed/rss` | RSS 订阅源 |

---

## 🇺🇸 English

### What is WeeklyAI?

**WeeklyAI** is the world's first AI-powered product intelligence platform. We automatically scan the global AI startup ecosystem across 6 regions daily, using a multi-model scoring system (Perplexity Sonar + Zhipu GLM-4.7) to surface high-potential AI products — so product managers, investors, and founders can catch the next breakout in 5 minutes.

### Why WeeklyAI?

| Capability | Description |
|------------|-------------|
| **6-Region Coverage** | US · China · Europe · Japan/Korea · Southeast Asia · Global Hardware |
| **Dual AI Engine** | Perplexity Sonar (global) + Zhipu GLM-4.7 (China), smart routing with fallback |
| **5-Tier Scoring** | Funding × Founder Background × Category Innovation × Community Buzz × Growth Signals |
| **Hardware Discovery** | Innovative form factors (wearables / desktop / portable), 40% innovation weight |
| **AI Chat Assistant** | GLM-4.7 streaming chat with real-time product data injection |
| **Bilingual (ZH/EN)** | One-click language switch, preference auto-saved |
| **Swipe Discovery** | Tinder-style card interaction with gesture, inertia, and streak effects |
| **10-Step Pipeline** | Discover → Publish → Backfill → Resolve → Validate → Dedup → Logo → News → Social → Sync |

### Product Tiers

```
 5pts  Phenomenal     Funding >$100M / Category creator / Viral
 4pts  Dark Horse     Funding >$30M / Top VC / ARR >$10M
 3pts  Rising Star    Funding $1M-$5M / ProductHunt featured
 2pts  Early Watch    Innovative but insufficient data
```

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  React 19 · TypeScript · SWR · Zod · p5.js · i18n          │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Flask 3.0)                       │
│  REST API · SSE Streaming · Rate Limiting · MongoDB/JSON    │
├──────────────────────┬──────────────────────────────────────┤
│  Perplexity Sonar    │    Zhipu GLM-4.7                     │
│  (US/EU/JP/KR/SEA)   │    (China · search_pro)              │
├──────────────────────┴──────────────────────────────────────┤
│              MongoDB 7 / JSON Fallback                      │
├─────────────────────────────────────────────────────────────┤
│  10-Step Daily Pipeline · launchd · Docker · Vercel         │
└─────────────────────────────────────────────────────────────┘
```

### Quick Start

```bash
git clone https://github.com/ZhanlinCui/weekly.ai.git
cd weekly.ai

# Frontend
cd frontend-next && npm install && npm run dev    # localhost:3001

# Backend
cd backend && pip install -r requirements.txt && python run.py  # localhost:5000

# AI Discovery (requires API keys)
cd crawler && python3 tools/auto_discover.py --region all --dry-run
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ZHIPU_API_KEY` | For China | Zhipu GLM-4.7 API Key |
| `PERPLEXITY_API_KEY` | For Global | Perplexity Sonar API Key |
| `MONGO_URI` | Optional | MongoDB connection (falls back to JSON) |
| `NEXT_PUBLIC_API_BASE_URL` | Deploy | Frontend API base URL |

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /products/dark-horses` | This week's dark horses (4-5 pts, auto-rotation) |
| `GET /products/rising-stars` | Rising stars (2-3 pts) |
| `GET /products/weekly-top` | Weekly Top 15 (composite / trending / recency) |
| `GET /products/blogs` | News feed (YouTube / X / HN / PH) |
| `GET /search?q=xxx` | Full-text search (multi-field weighted) |
| `POST /chat` | AI chat (GLM-4.7 streaming SSE) |
| `GET /products/feed/rss` | RSS feed |

---

## 🇯🇵 日本語

### WeeklyAI とは

**WeeklyAI** は、世界初の AI 駆動型プロダクトインテリジェンスプラットフォームです。毎日グローバル 6 地域の AI スタートアップエコシステムを自動スキャンし、マルチモデルスコアリングシステム（Perplexity Sonar + Zhipu GLM-4.7）を活用して、高ポテンシャルな AI プロダクトを精密に抽出。プロダクトマネージャー、投資家、起業家が 5 分で世界の AI プロダクト動向を把握できます。

### コア機能

| 機能 | 説明 |
|------|------|
| **6 地域カバー** | 米国 · 中国 · 欧州 · 日韓 · 東南アジア · グローバルハードウェア |
| **デュアル AI エンジン** | Perplexity Sonar（グローバル）+ Zhipu GLM-4.7（中国）、スマートルーティング |
| **5 段階スコアリング** | 資金調達 × 創業者背景 × カテゴリ革新 × コミュニティ注目度 × 成長シグナル |
| **ハードウェア発掘** | 革新的フォームファクタ（ウェアラブル / デスクトップ / ポータブル） |
| **AI チャットアシスタント** | GLM-4.7 ストリーミング対話、リアルタイムプロダクトデータ注入 |
| **バイリンガル（中/英）** | ワンクリック言語切替、設定自動保存 |
| **スワイプ発見** | Tinder 式カードインタラクション、ジェスチャー・慣性・連続ヒット対応 |
| **10 ステップ自動パイプライン** | 発見 → 公開 → 補完 → 解決 → 検証 → 重複排除 → ロゴ → ニュース → ソーシャル → 同期 |

### プロダクトティア

```
 5pt  フェノメナル    資金調達 >$100M / カテゴリ創造 / バイラル
 4pt  ダークホース    資金調達 >$30M / トップ VC / ARR >$10M
 3pt  ライジングスター 資金調達 $1M-$5M / ProductHunt 注目
 2pt  アーリーウォッチ 革新的だがデータ不足
```

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)                     │
│  React 19 · TypeScript · SWR · Zod · p5.js · i18n          │
├─────────────────────────────────────────────────────────────┤
│                    Backend (Flask 3.0)                       │
│  REST API · SSE Streaming · Rate Limiting · MongoDB/JSON    │
├──────────────────────┬──────────────────────────────────────┤
│  Perplexity Sonar    │    Zhipu GLM-4.7                     │
│  (US/EU/JP/KR/SEA)   │    (China · search_pro)              │
├──────────────────────┴──────────────────────────────────────┤
│              MongoDB 7 / JSON Fallback                      │
├─────────────────────────────────────────────────────────────┤
│  10-Step Daily Pipeline · launchd · Docker · Vercel         │
└─────────────────────────────────────────────────────────────┘
```

### クイックスタート

```bash
git clone https://github.com/ZhanlinCui/weekly.ai.git
cd weekly.ai

# フロントエンド
cd frontend-next && npm install && npm run dev    # localhost:3001

# バックエンド
cd backend && pip install -r requirements.txt && python run.py  # localhost:5000

# AI ディスカバリー（API キーが必要）
cd crawler && python3 tools/auto_discover.py --region all --dry-run
```

### 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `ZHIPU_API_KEY` | 中国向け | Zhipu GLM-4.7 API キー |
| `PERPLEXITY_API_KEY` | グローバル | Perplexity Sonar API キー |
| `MONGO_URI` | 任意 | MongoDB 接続（未設定で JSON フォールバック） |
| `NEXT_PUBLIC_API_BASE_URL` | デプロイ時 | フロントエンド API ベース URL |

### API エンドポイント

| エンドポイント | 説明 |
|----------------|------|
| `GET /products/dark-horses` | 今週のダークホース（4-5pt、自動ローテーション） |
| `GET /products/rising-stars` | ライジングスター（2-3pt） |
| `GET /products/weekly-top` | ウィークリー Top 15（composite / trending / recency） |
| `GET /products/blogs` | ニュースフィード（YouTube / X / HN / PH） |
| `GET /search?q=xxx` | 全文検索（マルチフィールド加重） |
| `POST /chat` | AI チャット（GLM-4.7 ストリーミング SSE） |
| `GET /products/feed/rss` | RSS フィード |

---

## Project Structure

```
weekly.ai/
├── frontend-next/        Next.js 16 + React 19 (primary frontend)
│   ├── src/app/          Pages (home, product, blog, discover, search)
│   ├── src/components/   Components (chat, home, product, layout, favorites)
│   ├── src/i18n/         Bilingual system (zh/en)
│   ├── src/lib/          API client, product utils, schemas
│   └── src/styles/       Design tokens, base, home, chat
├── backend/              Flask 3.0 API
│   ├── app/routes/       products, search, chat
│   └── app/services/     repository, service, filters, sorting, chat
├── crawler/              AI Discovery Engine
│   ├── tools/            33 automation scripts
│   ├── utils/            Perplexity + GLM clients
│   ├── prompts/          Search + Analysis prompts
│   ├── spiders/          17 crawlers (YouTube, X, HN, PH...)
│   └── data/             Product data (featured, dark horses, blogs)
├── ops/scheduling/       Daily pipeline (launchd + cron)
├── tests/                13 Python test files + Vitest
└── docker-compose.yml    Full-stack containerization
```

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel (Next.js) | [frontend-next-psi-nine.vercel.app](https://frontend-next-psi-nine.vercel.app) |
| Backend | Vercel (Serverless Python) | [backend-flax-mu-17.vercel.app](https://backend-flax-mu-17.vercel.app) |
| Database | MongoDB Atlas / JSON Fallback | Configurable |

## License

MIT

---

<p align="center">
  <strong>WeeklyAI</strong> — Discover the future of AI, before it happens.<br/>
  <sub>Built with Perplexity Sonar, Zhipu GLM-4.7, Next.js 16, and Flask 3.0</sub>
</p>
