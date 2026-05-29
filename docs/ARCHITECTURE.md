# 架构设计文档

> **状态**: 已更新 — 技术栈已确定为 Electron + React + TypeScript。

---

## 概述

剪映学堂是一个基于 **Electron + React + TypeScript** 的桌面应用，采用 **多进程架构**（主进程 / 渲染进程 / 预加载脚本），聚合多平台优质剪辑课程资源。

## 架构图

```
┌──────────────────────────────────────────────┐
│               Renderer Process                │
│  ┌────────────────────────────────────────┐  │
│  │             React App                   │  │
│  │  (Sidebar / Search / Filters / Grid / Detail) │
│  ├────────────────────────────────────────┤  │
│  │          Custom Hooks                   │  │
│  │  (useCourses / useFavorites / useFilters / useProficiency) │
│  ├────────────────────────────────────────┤  │
│  │           Services (api.ts)             │  │
│  │  (searchCourses / getFavorites / getProficiency) │
│  └──────────────┬─────────────────────────┘  │
│                 │ IPC (contextBridge)         │
├─────────────────┼────────────────────────────┤
│    Preload      │                             │
│    Script       │  安全暴露 Node.js API       │
├─────────────────┼────────────────────────────┤
│               Main Process                    │
│  ┌────────────────────────────────────────┐  │
│  │        Electron APIs                     │  │
│  │  (Window / Menu / Shell / Dialog)        │  │
│  ├────────────────────────────────────────┤  │
│  │        Data Layer                        │  │
│  │  (JSON 文件读写 / 本地持久化)             │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

## 进程职责

| 进程 | 运行时 | 职责 |
|------|--------|------|
| **Main** （主进程） | Node.js | 窗口管理、系统菜单、文件 I/O、应用生命周期 |
| **Preload** （预加载） | Node.js + DOM 受限访问 | 通过 `contextBridge` 安全暴露主进程 API 给渲染进程 |
| **Renderer** （渲染进程） | Chromium 沙箱 | React UI 渲染、用户交互、状态管理 |

## 核心设计决策

1. **多进程隔离**：遵循 Electron 安全最佳实践，渲染进程在沙箱中运行，通过 preload 脚本与主进程通信
2. **UI 架构**：React 函数组件 + Hooks，按功能模块组织组件树
3. **状态管理**：初期使用 React Context + useReducer，复杂度提升后考虑 Zustand
4. **数据持久化**：主进程管理 JSON 文件读写，通过 IPC 暴露给渲染进程；课程数据以 JSON 格式存储在 `src/resources/` 中
5. **搜索实现**：渲染进程本地过滤搜索，关键字匹配标题/描述/作者/标签
6. **样式方案**：CSS 变量 + 全局样式表，按 BEM 风格组织组件类名
7. **开发模式**：Electron 不可用时自动回退到 localStorage，支持纯浏览器开发调试
7. **测试策略**：Vitest 单元测试 + Testing Library 组件测试

## 组件树

```
App (Renderer / App.tsx)
├── Sidebar (侧边栏)
│   ├── Logo + 导航 (全部课程 / 我的收藏)
│   ├── 学习进度筛选 (按掌握程度: 0%/30%/50%/70%/100%)
│   └── 分类浏览 (14 个技能分类)
├── MainContent
│   ├── Toolbar (搜索框 + 清除筛选)
│   ├── FilterRows (平台 / 分类 / 难度 筛选按钮)
│   ├── ResultCount + CourseGrid
│   │   ├── CourseCard (标题 / 作者 / 平台标签 / 描述 / 难度 / 时长 / 掌握程度)
│   │   └── EmptyState
│   └── DetailPanel (侧滑面板)
│       ├── 课程详情 (标题 / 元信息 / 描述 / 标签)
│       ├── 掌握程度选择器 (5 级)
│       └── 平台跳转链接
```

## 数据流

```
用户操作 → React 组件 → Custom Hooks → Service 层 (api.ts)
                                              │
                                  ┌───────────┴───────────┐
                                  │   window.electronAPI  │ (preload 暴露)
                                  │   OR localStorage     │ (浏览器开发回退)
                                  └───────────┬───────────┘
                                              │ IPC
                                  ┌───────────┴───────────┐
                                  │     主进程服务          │
                                  │  (内存存储 / 系统调用)   │
                                  └───────────────────────┘
```

### 数据存储策略

| 数据类型 | 主进程存储 | 浏览器回退 |
|---------|-----------|-----------|
| 课程数据 | TypeScript 种子文件 (64门) | 同主进程，在 api.ts 中直接 import |
| 收藏列表 | `Set<string>` (内存) | `localStorage['clipacademy-favorites']` |
| 掌握程度 | `Map<string, number>` (内存) | `localStorage['clipacademy-proficiency']` |

## 安全模型

- 渲染进程运行在 `sandbox: true` 的 BrowserWindow 中
- `contextIsolation: true`，禁止直接访问 Node.js
- 所有主进程交互通过 `contextBridge.exposeInMainWorld` 暴露的白名单 API
- 不启用 `nodeIntegration` 或 `remote` 模块

---

*本文档随项目实现持续更新。*
