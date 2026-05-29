# 课程数据模型设计

> **状态**: 已更新 — 数据模型使用 TypeScript 类型定义，与 Electron 技术栈保持一致。

---

## 概述

本文档定义 ClipAcademy 的核心数据模型，包括课程实体、分类体系、平台枚举等。共享类型定义位于 `src/shared/types/` 目录，主进程与渲染进程均可引用。

## 核心实体

### Course（课程）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string (UUID) | 唯一标识 |
| title | string | 课程标题 |
| author | string | 作者/UP主名称 |
| platform | Platform | 来源平台（枚举） |
| url | string | 课程原始链接 |
| category | Category | 所属技能分类 |
| difficulty | Difficulty | 难度等级 |
| duration | number \| null | 视频时长（秒），可选 |
| description | string | 课程简介 |
| tags | string[] | 技能标签列表 |
| thumbnailURL | string \| null | 缩略图链接，可选 |
| createdAt | string (ISO 8601) | 收录日期 |
| updatedAt | string (ISO 8601) | 最后更新日期 |

### Platform（平台）

```typescript
type Platform = 'xiaohongshu' | 'bilibili' | 'douyin' | 'youtube'

const PLATFORM_LABELS: Record<Platform, string> = {
  xiaohongshu: '小红书',
  bilibili: 'B站',
  douyin: '抖音',
  youtube: 'YouTube',
}
```

### Category（分类）

```typescript
type Category =
  | 'basics'
  | 'transitions'
  | 'colorGrading'
  | 'audioDesign'
  | 'subtitles'
  | 'animeEdit'
  | 'mashup'
  | 'talkingHead'
  | 'ecommerce'
  | 'knowledgeShare'
  | 'varietyShow'
  | 'effects'
  | 'vlog'
  | 'beatSync'

const CATEGORY_LABELS: Record<Category, string> = {
  basics: '基础操作',
  transitions: '转场特效',
  colorGrading: '调色滤镜',
  audioDesign: '音效BGM',
  subtitles: '字幕动画',
  animeEdit: '漫剪',
  mashup: '混剪',
  talkingHead: '口播',
  ecommerce: '电商带货',
  knowledgeShare: '知识分享',
  varietyShow: '综艺类',
  effects: '视觉特效',
  vlog: 'Vlog日常',
  beatSync: '卡点节奏',
}
```

### Difficulty（难度）

```typescript
type Difficulty = 'beginner' | 'intermediate' | 'advanced'

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}
```

### 掌握程度（Proficiency）

```typescript
const PROFICIENCY_LEVELS = [
  { value: 0, label: '未学习' },
  { value: 30, label: '了解 (30%)' },
  { value: 50, label: '练习中 (50%)' },
  { value: 70, label: '熟练 (70%)' },
  { value: 100, label: '精通 (100%)' },
] as const
```

每个课程与用户的掌握程度关联存储在 `Record<string, number>`（courseId → level）。

## 数据存储结构

课程数据以 TypeScript 种子文件存储，收藏和掌握程度由主进程在内存中管理：

```
src/shared/data/
└── courses.ts          # 种子数据 (64 门课程)
    export const SEED_COURSES: Course[] = [
      {
        id: "uuid-string",
        title: "示例课程标题",
        author: "作者名",
        platform: "bilibili",
        url: "https://www.bilibili.com/video/BV1xxx/",
        category: "colorGrading",
        difficulty: "beginner",
        duration: 600,
        description: "课程简介...",
        tags: ["调色", "LUT", "达芬奇"],
        thumbnailURL: null,
        createdAt: "2026-05-01T00:00:00Z",
        updatedAt: "2026-05-01T00:00:00Z"
      }
    ]
```

## TypeScript 类型定义

```typescript
// src/shared/types/course.ts

export type Platform = 'xiaohongshu' | 'bilibili' | 'douyin' | 'youtube'

export type Category =
  | 'basics'
  | 'transitions'
  | 'colorGrading'
  | 'audioDesign'
  | 'subtitles'
  | 'animeEdit'
  | 'mashup'
  | 'talkingHead'
  | 'ecommerce'
  | 'knowledgeShare'
  | 'varietyShow'
  | 'effects'
  | 'vlog'
  | 'beatSync'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Course {
  id: string
  title: string
  author: string
  platform: Platform
  url: string
  category: Category
  difficulty: Difficulty
  duration: number | null
  description: string
  tags: string[]
  thumbnailURL: string | null
  createdAt: string
  updatedAt: string
}

export interface CourseSearchParams {
  keyword?: string
  platforms?: Platform[]
  categories?: Category[]
  difficulties?: Difficulty[]
}

export interface CourseSearchResult {
  courses: Course[]
  total: number
  keyword: string
}

export const PROFICIENCY_LEVELS = [
  { value: 0, label: '未学习' },
  { value: 30, label: '了解 (30%)' },
  { value: 50, label: '练习中 (50%)' },
  { value: 70, label: '熟练 (70%)' },
  { value: 100, label: '精通 (100%)' },
] as const
```

## IPC 数据接口

渲染进程通过 `contextBridge` 暴露的 API 与主进程交互课程数据：

```typescript
// src/main/preload.ts — 暴露给渲染进程的接口
interface ElectronAPI {
  searchCourses: (params: CourseSearchParams) => Promise<CourseSearchResult>
  getCourseById: (id: string) => Promise<Course | null>
  getAllCategories: () => Promise<Category[]>
  getFavoriteIds: () => Promise<string[]>
  toggleFavorite: (courseId: string) => Promise<boolean>
  getProficiency: () => Promise<Record<string, number>>
  setProficiency: (courseId: string, level: number) => Promise<void>
  openExternalLink: (url: string) => Promise<void>
}

// 渲染进程中调用
// window.electronAPI.searchCourses({ keyword: '调色' })
// window.electronAPI.setProficiency('course-uuid', 70)
```

---

*本文档将在数据模型设计完成后补充完整的验证规则和测试用例。*
