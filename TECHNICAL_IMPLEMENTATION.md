# Technical Implementation Document / 技术实现文档

This document details the architecture and technical implementation of LinkVerse.
本文档详细介绍了 LinkVerse 的架构和技术实现。

## Architecture Overview / 架构概览

LinkVerse is designed as a fast, relationship-first workspace. It features a modern React SPA connecting to a lightweight Node.js backend API, powered by a dual-mode persistence layer (PostgreSQL or local filesystem).
LinkVerse 被设计为一个快速的、以关系为首的知识图谱工作区。它由现代 React 单页应用和轻量级 Node.js 后端 API 组成，并由双模式持久化层（PostgreSQL 或本地文件系统）支持。

### Frontend / 前端实现

**Core Stack:** React 19, TypeScript, Vite, Tailwind CSS.  
**核心栈:** React 19, TypeScript, Vite, Tailwind CSS.

*   **State Management (Zustand):** The entire workspace state (projects, nodes, edges, open files) is managed via `Zustand` (`store/useStore.ts`). It handles offline caching and synchronization with the backend via `localStorage` persistence and continuous JSON sync.
    **状态管理 (Zustand):** 整个工作区状态（项目、节点、连线、打开的文件）通过 `Zustand` (`store/useStore.ts`) 进行核心管理。它通过 `localStorage` 和连续的 JSON 同步来处理离线缓存和与后端的同步。
*   **Graph Engine (React Flow):** Mind maps and visual notes are rendered using `React Flow`. Custom node components (`MindNode.tsx`) allow rich, interactive editing within a canvas.
    **图谱引擎 (React Flow):** 脑图和可视化笔记使用 `React Flow` 渲染。自定义节点组件 (`MindNode.tsx`) 允许在画布内进行丰富的交互式编辑。
*   **AI Integration (@google/genai):** Gemini 2.5 Flash is deeply integrated into the state store for features like "Copilot Actions" and automated structure generation based on note content.
    **AI 集成 (@google/genai):** Gemini 2.5 Flash 被深度集成到状态存储中，用于“Copilot 操作”和基于笔记内容的自动结构生成。

### Backend / 后端实现

**Core Stack:** Node.js (v22+), Zero-framework HTTP Server.  
**核心栈:** Node.js (v22+), 无框架 HTTP 服务器。

*   **Custom API Engine:** To keep the footprint small, the backend (`server.mjs`) uses the native `node:http` module to serve static files and expose REST API routes (`/api/auth/*`, `/api/workspace`) matching URL pathnames directly.
    **自定义 API 引擎:** 为了保持微小的体积，后端 (`server.mjs`) 使用原生的 `node:http` 模块来提供静态文件和 REST API 路由。
*   **Authentication:** Session-based, stateless token authentication with passwords hashed via `scryptSync` with a secure UUID salt.
    **身份验证:** 基于会话令牌的无状态身份验证，密码通过带有安全 UUID 盐的 `scryptSync` 散列。
*   **Dual-Persistence Strategy (`db.mjs`):**
    **双持久化策略 (`db.mjs`):**
    *   **Postgres Mode:** If `DATABASE_URL` is detected in the environment, it uses the `pg` driver to connect to a PostgreSQL database (e.g., Supabase) for robust multi-user scaling.
        *   **Postgres 模式:** 如果检测到 `DATABASE_URL` 环境变量，它使用 `pg` 驱动程序连接到 PostgreSQL 数据库 (例如 Supabase) 以实现多用户扩展。
    *   **Local File Mode:** For quick local development, it falls back to a file-based JSON store (`backend/data/auth-db.json`) enabling zero-configuration setups.
        *   **本地文件模式:** 对于快速本地开发，它回退到基于文件的 JSON 存储 (`backend/data/auth-db.json`)，实现零配置启动。
