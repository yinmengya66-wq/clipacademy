/**
 * 课程数据验证层
 *
 * 提供类型守卫和字段级验证函数，供主进程数据加载时使用。
 */

import type { Course, Platform, Category, Difficulty } from '@shared/types'

// ===== 类型守卫 =====

const PLATFORMS: readonly Platform[] = ['xiaohongshu', 'bilibili', 'douyin', 'youtube']

const CATEGORIES: readonly Category[] = [
  'basics',
  'colorGrading',
  'transitions',
  'audioDesign',
  'subtitles',
  'editingMind',
  'effects',
  'storytelling',
]

const DIFFICULTIES: readonly Difficulty[] = ['beginner', 'intermediate', 'advanced']

export function isPlatform(value: unknown): value is Platform {
  return typeof value === 'string' && (PLATFORMS as readonly string[]).includes(value)
}

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORIES as readonly string[]).includes(value)
}

export function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && (DIFFICULTIES as readonly string[]).includes(value)
}

// ===== Course 验证 =====

export interface CourseValidationError {
  field: string
  message: string
}

export function validateCourse(course: unknown): CourseValidationError[] {
  const errors: CourseValidationError[] = []

  if (!course || typeof course !== 'object') {
    return [{ field: 'root', message: 'Course must be a non-null object' }]
  }

  const c = course as Record<string, unknown>

  // id: required string
  if (typeof c.id !== 'string' || c.id.length === 0) {
    errors.push({ field: 'id', message: 'id must be a non-empty string' })
  }

  // title: required string
  if (typeof c.title !== 'string' || c.title.length === 0) {
    errors.push({ field: 'title', message: 'title must be a non-empty string' })
  }

  // author: required string
  if (typeof c.author !== 'string' || c.author.length === 0) {
    errors.push({ field: 'author', message: 'author must be a non-empty string' })
  }

  // platform: required Platform
  if (!isPlatform(c.platform)) {
    errors.push({ field: 'platform', message: `platform must be one of: ${PLATFORMS.join(', ')}` })
  }

  // url: required string
  if (typeof c.url !== 'string' || c.url.length === 0) {
    errors.push({ field: 'url', message: 'url must be a non-empty string' })
  }

  // category: required Category
  if (!isCategory(c.category)) {
    errors.push({ field: 'category', message: `category must be one of: ${CATEGORIES.join(', ')}` })
  }

  // difficulty: required Difficulty
  if (!isDifficulty(c.difficulty)) {
    errors.push({
      field: 'difficulty',
      message: `difficulty must be one of: ${DIFFICULTIES.join(', ')}`,
    })
  }

  // duration: number | null
  if (c.duration !== null && c.duration !== undefined && typeof c.duration !== 'number') {
    errors.push({ field: 'duration', message: 'duration must be a number or null' })
  }

  // description: required string
  if (typeof c.description !== 'string') {
    errors.push({ field: 'description', message: 'description must be a string' })
  }

  // tags: required string array
  if (!Array.isArray(c.tags) || !c.tags.every((t: unknown) => typeof t === 'string')) {
    errors.push({ field: 'tags', message: 'tags must be an array of strings' })
  }

  // thumbnailURL: string | null
  if (c.thumbnailURL !== null && c.thumbnailURL !== undefined && typeof c.thumbnailURL !== 'string') {
    errors.push({ field: 'thumbnailURL', message: 'thumbnailURL must be a string or null' })
  }

  // createdAt: required ISO 8601 string
  if (typeof c.createdAt !== 'string' || isNaN(Date.parse(c.createdAt))) {
    errors.push({ field: 'createdAt', message: 'createdAt must be a valid ISO 8601 date string' })
  }

  // updatedAt: required ISO 8601 string
  if (typeof c.updatedAt !== 'string' || isNaN(Date.parse(c.updatedAt))) {
    errors.push({ field: 'updatedAt', message: 'updatedAt must be a valid ISO 8601 date string' })
  }

  return errors
}

export function isValidCourse(course: unknown): course is Course {
  return validateCourse(course).length === 0
}
