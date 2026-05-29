/**
 * 课程数据模型 — 核心类型定义
 *
 * 主进程与渲染进程共享。所有类型均从 docs/DATA_MODEL.md 提取，
 * 作为 ClipAcademy 应用的数据协议基础。
 */

// ===== 平台 =====

export type Platform = 'xiaohongshu' | 'bilibili' | 'douyin' | 'youtube'

export const PLATFORM_LABELS: Record<Platform, string> = {
  xiaohongshu: '小红书',
  bilibili: 'B站',
  douyin: '抖音',
  youtube: 'YouTube',
}

// ===== 分类 =====

export type Category =
  | 'basics'
  | 'colorGrading'
  | 'transitions'
  | 'audioDesign'
  | 'subtitles'
  | 'editingMind'
  | 'effects'
  | 'storytelling'

export const CATEGORY_LABELS: Record<Category, string> = {
  basics: '基础操作',
  colorGrading: '调色',
  transitions: '转场特效',
  audioDesign: '音效设计',
  subtitles: '字幕标题',
  editingMind: '剪辑思维',
  effects: '视觉特效',
  storytelling: '叙事技巧',
}

// ===== 难度 =====

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
}

// ===== 课程实体 =====

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

// ===== 搜索 =====

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

// ===== IPC 数据接口 (preload → renderer) =====

export interface ElectronAPI {
  searchCourses: (params: CourseSearchParams) => Promise<CourseSearchResult>
  getCourseById: (id: string) => Promise<Course | null>
  getAllCategories: () => Promise<Category[]>
  getFavoriteIds: () => Promise<string[]>
  toggleFavorite: (courseId: string) => Promise<boolean>
  openExternalLink: (url: string) => Promise<void>
}

// 扩展 Window 类型，使渲染进程可以直接使用 window.electronAPI
declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
