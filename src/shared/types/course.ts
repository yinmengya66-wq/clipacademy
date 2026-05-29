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

export const CATEGORY_LABELS: Record<Category, string> = {
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
  /** B站 BV号，用于播放器嵌入 */
  bvId?: string
  /** 播放量 */
  playCount?: number
  /** 弹幕数 */
  danmaku?: number
  /** 收藏数 */
  favorites?: number
}

// ===== 搜索 =====

export interface CourseSearchParams {
  keyword?: string
  platforms?: Platform[]
  categories?: Category[]
  difficulties?: Difficulty[]
}

// ===== 掌握程度 =====

export const PROFICIENCY_LEVELS = [
  { value: 0, label: '未学习' },
  { value: 30, label: '了解 (30%)' },
  { value: 50, label: '练习中 (50%)' },
  { value: 70, label: '熟练 (70%)' },
  { value: 100, label: '精通 (100%)' },
] as const

// ===== 常量数组（遍历/筛选 UI 使用） =====

export const ALL_PLATFORMS: Platform[] = Object.keys(PLATFORM_LABELS) as Platform[]
export const ALL_CATEGORIES: Category[] = Object.keys(CATEGORY_LABELS) as Category[]
export const ALL_DIFFICULTIES: Difficulty[] = Object.keys(DIFFICULTY_LABELS) as Difficulty[]
