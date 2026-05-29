# 架构设计文档

> **状态**: 已更新 — 技术栈已确定为 Electron + React + TypeScript。

---

## 概述

ClipAcademy 是一个基于 **Electron + React + TypeScript** 的桌面应用，采用 **多进程架构**（主进程 / 渲染进程 / 预加载脚本）。

## 架构图

```
┌──────────────────────────────────────────────┐
│               Renderer Process                │
│  ┌────────────────────────────────────────┐  │
│  │             React App                   │  │
│  │  (Sidebar / Search / Browse / Detail)   │  │
│  ├────────────────────────────────────────┤  │
│  │          Custom Hooks                   │  │
│  │  (状态管理 / 业务逻辑 / 数据转换)        │  │
│  ├────────────────────────────────────────┤  │
│  │           Services                      │  │
│  │  (SearchEngine / DataLoader / Favorites)│  │
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
5. **搜索实现**：渲染进程本地全文搜索，使用 Fuse.js 或自定义搜索
6. **样式方案**：CSS Modules 或 Tailwind CSS（待 UI 设计时确定）
7. **测试策略**：Vitest 单元测试 + Testing Library 组件测试

## 组件树

```
App (Renderer)
├── App.tsx
│   ├── Sidebar
│   │   ├── SearchField          # 搜索输入框
│   │   ├── CategoryList          # 分类列表
│   │   └── PlatformFilter        # 平台筛选
│   ├── MainContent
│   │   ├── CourseListView
│   │   │   ├── CourseCard        # 课程卡片
│   │   │   └── EmptyState        # 空状态提示
│   │   └── CourseDetailView
│   │       ├── CourseInfoSection # 课程信息
│   │       ├── PlatformBadge     # 平台标签
│   │       └── OpenLinkButton    # 跳转按钮
│   └── FavoritesPanel            # 收藏面板
```

## 数据流

```
用户操作 → React 组件 → Hooks/Custom Hooks → Service 层
                                                    │
                                        ┌───────────┴───────────┐
                                        │   window.electronAPI  │ (preload 暴露)
                                        └───────────┬───────────┘
                                                    │ IPC
                                        ┌───────────┴───────────┐
                                        │     主进程服务          │
                                        │  (文件读写 / 系统调用)  │
                                        └───────────────────────┘
```

## 安全模型

- 渲染进程运行在 `sandbox: true` 的 BrowserWindow 中
- `contextIsolation: true`，禁止直接访问 Node.js
- 所有主进程交互通过 `contextBridge.exposeInMainWorld` 暴露的白名单 API
- 不启用 `nodeIntegration` 或 `remote` 模块

---

*本文档随项目实现持续更新。*
