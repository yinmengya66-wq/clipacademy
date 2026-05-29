# 剪辑课程查询 · ClipAcademy

> 一个简约高级的桌面应用，基于 Electron + React + TypeScript 构建，聚合小红书、B站、抖音、YouTube 等平台的优质剪辑课程资源。一站式搜索、分类浏览、快速跳转学习。

> **项目状态**: 🏗️ 架构设计阶段 — 技术栈已确定，文档已就绪，代码脚手架与 UI 开发进行中。

---

## 项目愿景

**ClipAcademy** 旨在为剪辑学习者（尤其是剪映用户）提供一个清爽高效的课程发现与索引工具。它不替代任何平台，而是作为你的"剪辑课程导航仪"——帮助你从海量内容中快速找到真正值得学习的课程。

### 解决的问题

- 剪辑课程分散在小红书、B站、抖音、YouTube 等多个平台，查找费时
- 各个平台的搜索机制和推荐算法各不相同，课程质量参差不齐
- 学习者难以系统性规划学习路径（调色 → 转场 → 特效 → 声音设计...）

### 设计理念

- **不造轮子**：不做视频播放器，不做社区，聚焦于"发现 + 索引 + 跳转"
- **跨平台桌面体验**：基于 Electron 构建，原生级窗口管理、系统通知、菜单栏
- **简约不简单**：界面干净，但搜索和分类能力强大

---

## 功能规划

### v1.0 MVP

- [ ] **课程搜索** — 按关键词搜索课程，支持多平台结果聚合
- [ ] **分类浏览** — 按技能维度分类：基础操作、调色、转场特效、音效设计、字幕标题、剪辑思维
- [ ] **平台筛选** — 按来源平台过滤：小红书 / B站 / 抖音 / YouTube
- [ ] **课程详情** — 展示课程标题、作者、平台、时长、难度、简介
- [ ] **一键跳转** — 点击课程卡片直接在浏览器中打开原始链接
- [ ] **收藏功能** — 本地收藏常用课程，方便随时回顾

### 后续版本

- [ ] 学习路径推荐（如：新手入门路径 → 进阶技巧路径）
- [ ] 本地课程库定期同步更新
- [ ] 剪映版本兼容性标注
- [ ] 课程评分与用户评价
- [ ] 跨设备同步收藏数据

---

## 技术栈

> 以下方案已在「项目脚手架搭建与技术选型」任务中确定。

| 层级 | 方案 | 说明 |
|------|------|------|
| 桌面框架 | Electron 33 | 跨平台桌面应用框架，Chromium + Node.js |
| UI 框架 | React 18 + TypeScript | 组件化 UI，类型安全 |
| 构建工具 | electron-vite 2 + Vite 6 | 极速 HMR 开发体验，主进程/预加载/渲染进程统一构建 |
| 测试框架 | Vitest + Testing Library | 单元测试 + 组件测试，Vite 原生集成 |
| 代码规范 | ESLint + TypeScript strict | 静态检查，严格模式 |
| 打包分发 | electron-builder | macOS DMG/ZIP 打包，支持自动更新 |
| 最低系统 | macOS 13 Ventura | Electron 33 最低要求 |

---

## 项目结构

```
ClipAcademy/
├── README.md                    # 项目说明
├── CHANGELOG.md                 # 更新日志
├── package.json                 # 项目配置与依赖
├── electron.vite.config.ts      # electron-vite 构建配置
├── tsconfig.json                # TypeScript 配置
├── tsconfig.node.json           # Node 端 TypeScript 配置
├── vitest.config.ts             # Vitest 测试配置
├── docs/
│   ├── ARCHITECTURE.md          # 架构设计文档
│   └── DATA_MODEL.md            # 课程数据模型设计
├── resources/                   # 应用图标等静态资源
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 主进程入口
│   │   └── preload.ts           # 预加载脚本（contextBridge）
│   ├── renderer/                # React 渲染进程
│   │   ├── index.html           # HTML 入口
│   │   ├── App.tsx              # 根组件
│   │   ├── components/          # UI 组件
│   │   │   ├── Sidebar/         # 侧边栏导航
│   │   │   ├── Search/          # 搜索界面
│   │   │   ├── Browse/          # 分类浏览
│   │   │   ├── Detail/          # 课程详情
│   │   │   └── Common/          # 通用组件
│   │   ├── hooks/               # 自定义 Hooks
│   │   ├── services/            # 数据服务层
│   │   └── styles/              # 样式文件
│   ├── shared/                  # 主进程/渲染进程共享代码
│   │   └── types/               # 共享类型定义
│   └── resources/               # 课程数据 JSON 等
└── tests/                       # 测试文件
```

---

## 开发指南

### 环境要求

- macOS 13 Ventura 或更高版本
- Node.js 20 LTS 或更高版本
- npm 10+ 或 pnpm 8+

### 快速开始

```bash
# 1. 克隆项目
git clone <repo-url>
cd ClipAcademy

# 2. 安装依赖
npm install

# 3. 启动开发模式（带热更新）
npm run dev

# 4. 构建生产版本
npm run build

# 5. 打包 macOS 应用
npm run package
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器，支持 HMR |
| `npm run build` | 构建生产版本到 dist/ |
| `npm run start` | 直接启动 Electron（需先构建） |
| `npm run package` | 打包为 macOS DMG/ZIP |
| `npm run test` | 运行单元测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run lint` | ESLint 代码检查 |
| `npm run typecheck` | TypeScript 类型检查 |

### 贡献指南

1. 从 `main` 分支创建功能分支：`git checkout -b feature/your-feature`
2. 使用 React 函数组件 + Hooks，遵循组件化开发规范
3. 所有新功能需包含单元测试（Vitest），覆盖核心逻辑
4. 共享类型定义放在 `src/shared/types/` 目录
5. 提交前确保通过：`npm run typecheck && npm run lint && npm run test`
6. 主进程代码遵循 Electron 安全最佳实践，避免 `nodeIntegration: true`

---

## 数据来源

课程数据通过以下方式获取和整理：

- **手动精选**：从各平台人工筛选高质量课程
- **课程元数据**：标题、作者、平台、链接、难度等级、技能标签
- **定期更新**：课程数据独立于应用版本进行更新

> 注意：本应用仅索引和链接到各平台原始内容，不存储或分发视频文件。
> 所有课程版权归原作者和平台所有。

---

## 许可证

MIT License

---

*Built with ❤️ for video editing learners*
*专注剪辑学习，从零到一*
