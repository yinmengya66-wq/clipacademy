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
  | 'colorGrading'
  | 'transitions'
  | 'audioDesign'
  | 'subtitles'
  | 'editingMind'
  | 'effects'
  | 'storytelling'

const CATEGORY_LABELS: Record<Category, string> = {
  basics: '基础操作',
  colorGrading: '调色',
  transitions: '转场特效',
  audioDesign: '音效设计',
  subtitles: '字幕标题',
  editingMind: '剪辑思维',
  effects: '视觉特效',
  storytelling: '叙事技巧',
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

## 数据存储结构

课程数据以 JSON 文件存储，由主进程管理读写：

```
src/resources/
└── courses.json        # 课程索引主文件
    [
      {
        "id": "uuid-string",
        "title": "示例课程标题",
        "author": "作者名",
        "platform": "bilibili",
        "url": "https://...",
        "category": "colorGrading",
        "difficulty": "beginner",
        "duration": 600,
        "description": "课程简介...",
        "tags": ["调色", "LUT", "达芬奇"],
        "thumbnailURL": null,
        "createdAt": "2025-01-01T00:00:00Z",
        "updatedAt": "2025-01-01T00:00:00Z"
      }
    ]
```

## TypeScript 类型定义

```typescript
// src/shared/types/course.ts

export type Platform = 'xiaohongshu' | 'bilibili' | 'douyin' | 'youtube'

export type Category =
  | 'basics'
  | 'colorGrading'
  | 'transitions'
  | 'audioDesign'
  | 'subtitles'
  | 'editingMind'
  | 'effects'
  | 'storytelling'

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
  openExternalLink: (url: string) => Promise<void>
}

// 渲染进程中调用
// window.electronAPI.searchCourses({ keyword: '调色' })
```

---

*本文档将在数据模型设计完成后补充完整的验证规则和测试用例。*
