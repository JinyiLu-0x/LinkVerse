<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<h1 align="center" style="font-weight: 800; tracking: tight;">LinkVerse / 链际极客工作区</h1>

<p align="center" style="font-size: 1.1rem; color: #555;">
  A relationship-first workspace for mapping product ideas, research notes, and references in one visual system.<br/>
  一个以关系为中心的知识图谱工作区，将产品灵感、研究笔记和参考资料融合在同一个可视化系统内。
</p>

---

## ✨ Design & Features / 核心功能体验

LinkVerse is crafted with a meticulous, Apple-inspired premium aesthetic. Every interaction feels fluid and purposeful.
LinkVerse 采用精美的、受 Apple 启发的极简高级美学设计，每一次交互都流畅且意义明确。

- 🧠 **Infinite Mind Graphs (无限图谱):** Visual mind maps powered by React Flow, making project strategy crystal clear. / 由 React Flow 驱动的可视化脑图，让项目策略一目了然。
- 📝 **Dual View Mode (双重视图):** Side-by-side note editing and graph mapping. Notes dynamically construct visual nodes. / 笔记撰写与图谱映射并行，笔记即刻化为可视节点。
- 🤖 **Gemini AI Copilot (AI 智能生成):** Integrated AI engine (`gemini-2.5-flash`) for auto-generating structures, connecting ideas, and chatting about your workspace context. / 内置 AI 引擎，用于自动生成结构、串联灵感以及围绕工作区上下文对话。
- ⚡ **Zero-config Local Mode (零配置本地直开):** Works flawlessly offline with a local JSON file database, but easily scales to Postgres. / 完美支持离线本地 JSON 数据库，并可一键切换至 Postgres 生产环境。

---

## 🚀 Run Locally / 运行指南

**Prerequisites / 环境要求:** Node.js

### 1. Install Dependencies / 安装依赖项
```bash
npm install
```

### 2. Configure AI Environment / 配置 AI 环境变量
Add your API key (Optional but recommended for full AI features):
添加您的 API 密钥（可选，推荐使用以解锁完整 AI 功能）：
- Recommended: copy `.env.example` to `.env.local` and fill in `VITE_AI_API_KEY`
  推荐方式: 将 `.env.example` 复制为 `.env.local` 并在里面加上 `VITE_AI_API_KEY`
- Quick local edit: replace the placeholder in [`ai.config.ts`](./ai.config.ts)
  快速调试: 把 [`ai.config.ts`](./ai.config.ts) 中的占位符替换掉

### 3. Spin up the Workspace / 启动工作区
```bash
npm run dev
```

---

## ⚙️ AI Configuration / AI 引擎设置

The default model operates efficiently with `gemini-2.5-flash`.
默认模型高效运行于 `gemini-2.5-flash`。

To switch models dynamically, you can use the built-in UI settings or edit [`ai.config.ts`](./ai.config.ts) directly. Remember to keep `.env.local` secured for your primary keys.
如需动态切换模型，请使用系统内置 UI 设置，或直接修改 [`ai.config.ts`](./ai.config.ts)。请务必妥善保管好 `.env.local` 文件中的主要密钥。

---

<p align="center" style="color: #888; font-size: 0.9rem;">Built with passion & aesthetic obsession. / 极致审美，热忱打造。</p>
