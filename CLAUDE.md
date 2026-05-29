# CLAUDE.md

## 项目概况

**剪映学堂（ClipAcademy）** — 聚合B站、小红书、抖音优质剪辑教程的 Web 应用。

- 网站：https://clipacademy.netlify.app
- GitHub：https://github.com/yinmengya66-wq/clipacademy
- 分支：wanman/shared-types-validation
- 部署：Netlify（push 自动部署）

## 技术栈

React 18 + Vite 6 + TypeScript | Netlify Functions (Node.js 22) | framer-motion

## 常用命令

```
npm run dev          # Vite dev server (:5173)
npm run build        # 生产构建
npm run typecheck    # TypeScript 检查
npm run test         # Vitest 测试
```

## 目录结构

```
02_project/
├── index.html              # SPA 入口
├── vite.config.ts          # @ 和 @shared 别名，/api 代理到 :3001
├── netlify.toml            # 构建配置 + API 路由重写
├── tsconfig.json           # 排除 server/
├── netlify/
│   ├── functions/          # 每个 .ts = 一个 Lambda
│   │   ├── search.ts       # /api/search
│   │   ├── courses.ts      # /api/courses/:bvId
│   │   ├── categories.ts   # /api/categories
│   │   └── suggestions.ts  # /api/search/suggestions?q=
│   └── lib/
│       ├── data.ts         # 共享数据逻辑（搜索/筛选/排序）
│       └── seed.json       # 82 门种子课程
├── server/                 # Express 后端（保留参考，未使用）
│   └── src/data/seed.json  # 课程数据源
├── src/
│   ├── main.tsx
│   ├── App.tsx             # 主组件（~350行）
│   ├── App.css             # 全局样式 + CSS变量 + 响应式 + 动画
│   ├── hooks/useCourses.ts # useCourses/useFavorites/useFilters/useProficiency
│   ├── services/api.ts     # fetch('/api/...') 调用层
│   └── shared/types/course.ts # Course, Platform, Category, Difficulty
└── package.json
```

## 架构关键点

### 数据流
前端 `api.ts` → fetch `/api/search` → Netlify 路由重写 → `/functions/search` Lambda → `netlify/lib/data.ts` 从 `seed.json` import 数据 → JSON 筛选/排序/分页 → 返回

### Netlify Functions 陷阱
- **functions/ 下所有 .ts 文件都会被当成独立 Lambda**
- 共享代码必须在 functions/ 外面（如 `netlify/lib/`）
- 不能用 `fs.readFileSync` 读数据文件（Lambda 运行时找不到）
- 必须用 `import data from './seed.json'` 让 esbuild 内嵌 JSON

### 路由重写顺序（netlify.toml）
- `/api/search/suggestions` 必须写在 `/api/search` 前面，否则被后者匹配
- courses 用 `:bvId` 占位符捕获并转成 query param

### 前端 API 调用
- Base: `import.meta.env.VITE_API_BASE ?? '/api'`
- 生产环境走相对路径 `/api/...`，由 Netlify 重写到 Functions

## 当前数据状态

- 82 门种子课程，14 个分类，每分类 4-9 门
- 目标：每分类 50+，总数 700+
- B站 API geo-blocked（当前网络无法访问）
- "外部搜索"回退：生成 B站/小红书/抖音搜索链接

## 部署平台选择经历

1. Railway → 免费额度用完
2. Vercel → 账号无 defaultTeamId，创建团队需绑卡
3. **Netlify ← 当前方案**，免费无需绑卡

## 网络环境

- 需要代理 `127.0.0.1:7897` 访问外网
- git remote 内嵌 token
- Netlify CLI v26.x（命令格式与 v17.x 不同）

## 功能清单

搜索 | 筛选（平台/分类/难度） | 排序 | 实时建议 | 分类浏览 | 收藏 | 掌握度标记 | 详情面板（B站iframe） | 外部搜索 | 响应式
