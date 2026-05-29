/**
 * 课程数据验证层 — 单元测试
 *
 * 覆盖所有类型守卫和 Course 验证函数，包括边界条件和异常输入。
 */

import { describe, it, expect } from 'vitest'
import {
  isPlatform,
  isCategory,
  isDifficulty,
  validateCourse,
  isValidCourse,
} from '@shared/validation/course'

// ============================================================================
// isPlatform
// ============================================================================

describe('isPlatform', () => {
  it('returns true for valid platform: xiaohongshu', () => {
    expect(isPlatform('xiaohongshu')).toBe(true)
  })

  it('returns true for valid platform: bilibili', () => {
    expect(isPlatform('bilibili')).toBe(true)
  })

  it('returns true for valid platform: douyin', () => {
    expect(isPlatform('douyin')).toBe(true)
  })

  it('returns true for valid platform: youtube', () => {
    expect(isPlatform('youtube')).toBe(true)
  })

  it('returns false for invalid platform string', () => {
    expect(isPlatform('netflix')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isPlatform('')).toBe(false)
  })

  it('returns false for non-string: number', () => {
    expect(isPlatform(123)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isPlatform(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isPlatform(undefined)).toBe(false)
  })

  it('returns false for object', () => {
    expect(isPlatform({})).toBe(false)
  })

  it('returns false for array', () => {
    expect(isPlatform([])).toBe(false)
  })
})

// ============================================================================
// isCategory
// ============================================================================

describe('isCategory', () => {
  const validCategories = [
    'basics',
    'colorGrading',
    'transitions',
    'audioDesign',
    'subtitles',
    'editingMind',
    'effects',
    'storytelling',
  ]

  validCategories.forEach((cat) => {
    it(`returns true for valid category: ${cat}`, () => {
      expect(isCategory(cat)).toBe(true)
    })
  })

  it('returns false for invalid category', () => {
    expect(isCategory('unknown')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isCategory('')).toBe(false)
  })

  it('returns false for non-string: number', () => {
    expect(isCategory(42)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isCategory(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isCategory(undefined)).toBe(false)
  })

  it('returns false for boolean', () => {
    expect(isCategory(true)).toBe(false)
  })
})

// ============================================================================
// isDifficulty
// ============================================================================

describe('isDifficulty', () => {
  it('returns true for beginner', () => {
    expect(isDifficulty('beginner')).toBe(true)
  })

  it('returns true for intermediate', () => {
    expect(isDifficulty('intermediate')).toBe(true)
  })

  it('returns true for advanced', () => {
    expect(isDifficulty('advanced')).toBe(true)
  })

  it('returns false for invalid difficulty', () => {
    expect(isDifficulty('expert')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isDifficulty('')).toBe(false)
  })

  it('returns false for non-string: number', () => {
    expect(isDifficulty(1)).toBe(false)
  })

  it('returns false for null', () => {
    expect(isDifficulty(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isDifficulty(undefined)).toBe(false)
  })
})

// ============================================================================
// validateCourse
// ============================================================================

describe('validateCourse', () => {
  const validCourse = {
    id: 'course-001',
    title: 'Pr 基础入门教程',
    author: '剪辑大师',
    platform: 'bilibili',
    url: 'https://www.bilibili.com/video/BV1xx411c7mD',
    category: 'basics',
    difficulty: 'beginner',
    duration: 3600,
    description: '从零开始学 Premiere Pro',
    tags: ['Pr', '基础', '入门'],
    thumbnailURL: 'https://example.com/thumb.jpg',
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
  }

  it('returns no errors for a valid course', () => {
    expect(validateCourse(validCourse)).toEqual([])
  })

  it('allows duration: null', () => {
    const course = { ...validCourse, duration: null }
    expect(validateCourse(course)).toEqual([])
  })

  it('allows duration: undefined (omitted)', () => {
    const { duration, ...courseWithoutDuration } = validCourse
    expect(validateCourse(courseWithoutDuration)).toEqual([])
  })

  it('allows thumbnailURL: null', () => {
    const course = { ...validCourse, thumbnailURL: null }
    expect(validateCourse(course)).toEqual([])
  })

  it('allows thumbnailURL: undefined (omitted)', () => {
    const { thumbnailURL, ...courseWithoutThumb } = validCourse
    expect(validateCourse(courseWithoutThumb)).toEqual([])
  })

  it('returns root error for null input', () => {
    const errors = validateCourse(null)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toEqual({ field: 'root', message: 'Course must be a non-null object' })
  })

  it('returns root error for undefined input', () => {
    const errors = validateCourse(undefined)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toEqual({ field: 'root', message: 'Course must be a non-null object' })
  })

  it('returns root error for string input', () => {
    const errors = validateCourse('not an object')
    expect(errors).toHaveLength(1)
    expect(errors[0]).toEqual({ field: 'root', message: 'Course must be a non-null object' })
  })

  it('returns root error for number input', () => {
    const errors = validateCourse(42)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toEqual({ field: 'root', message: 'Course must be a non-null object' })
  })

  // -- id --
  it('validates id: missing', () => {
    const { id, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'id')).toBe(true)
  })

  it('validates id: empty string', () => {
    const errors = validateCourse({ ...validCourse, id: '' })
    expect(errors.some((e) => e.field === 'id')).toBe(true)
  })

  it('validates id: not a string', () => {
    const errors = validateCourse({ ...validCourse, id: 123 })
    expect(errors.some((e) => e.field === 'id')).toBe(true)
  })

  // -- title --
  it('validates title: missing', () => {
    const { title, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'title')).toBe(true)
  })

  it('validates title: empty string', () => {
    const errors = validateCourse({ ...validCourse, title: '' })
    expect(errors.some((e) => e.field === 'title')).toBe(true)
  })

  // -- author --
  it('validates author: missing', () => {
    const { author, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'author')).toBe(true)
  })

  it('validates author: empty string', () => {
    const errors = validateCourse({ ...validCourse, author: '' })
    expect(errors.some((e) => e.field === 'author')).toBe(true)
  })

  // -- platform --
  it('validates platform: missing', () => {
    const { platform, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'platform')).toBe(true)
  })

  it('validates platform: invalid value', () => {
    const errors = validateCourse({ ...validCourse, platform: 'netflix' })
    expect(errors.some((e) => e.field === 'platform')).toBe(true)
  })

  // -- url --
  it('validates url: missing', () => {
    const { url, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'url')).toBe(true)
  })

  it('validates url: empty string', () => {
    const errors = validateCourse({ ...validCourse, url: '' })
    expect(errors.some((e) => e.field === 'url')).toBe(true)
  })

  // -- category --
  it('validates category: missing', () => {
    const { category, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'category')).toBe(true)
  })

  it('validates category: invalid value', () => {
    const errors = validateCourse({ ...validCourse, category: 'unknown' })
    expect(errors.some((e) => e.field === 'category')).toBe(true)
  })

  // -- difficulty --
  it('validates difficulty: missing', () => {
    const { difficulty, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'difficulty')).toBe(true)
  })

  it('validates difficulty: invalid value', () => {
    const errors = validateCourse({ ...validCourse, difficulty: 'expert' })
    expect(errors.some((e) => e.field === 'difficulty')).toBe(true)
  })

  // -- duration --
  it('validates duration: wrong type (string)', () => {
    const errors = validateCourse({ ...validCourse, duration: '3600' })
    expect(errors.some((e) => e.field === 'duration')).toBe(true)
  })

  it('validates duration: wrong type (object)', () => {
    const errors = validateCourse({ ...validCourse, duration: {} })
    expect(errors.some((e) => e.field === 'duration')).toBe(true)
  })

  // -- description --
  it('validates description: missing', () => {
    const { description, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'description')).toBe(true)
  })

  it('validates description: not a string', () => {
    const errors = validateCourse({ ...validCourse, description: 123 })
    expect(errors.some((e) => e.field === 'description')).toBe(true)
  })

  it('allows empty string description', () => {
    // description allows empty string (no length check)
    const errors = validateCourse({ ...validCourse, description: '' })
    expect(errors.filter((e) => e.field === 'description')).toHaveLength(0)
  })

  // -- tags --
  it('validates tags: missing', () => {
    const { tags, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'tags')).toBe(true)
  })

  it('validates tags: not an array', () => {
    const errors = validateCourse({ ...validCourse, tags: 'Pr,基础' })
    expect(errors.some((e) => e.field === 'tags')).toBe(true)
  })

  it('validates tags: array with non-string element', () => {
    const errors = validateCourse({ ...validCourse, tags: ['Pr', 123] })
    expect(errors.some((e) => e.field === 'tags')).toBe(true)
  })

  it('allows empty tags array', () => {
    const errors = validateCourse({ ...validCourse, tags: [] })
    expect(errors.filter((e) => e.field === 'tags')).toHaveLength(0)
  })

  // -- thumbnailURL --
  it('validates thumbnailURL: wrong type (number)', () => {
    const errors = validateCourse({ ...validCourse, thumbnailURL: 123 })
    expect(errors.some((e) => e.field === 'thumbnailURL')).toBe(true)
  })

  // -- createdAt --
  it('validates createdAt: missing', () => {
    const { createdAt, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'createdAt')).toBe(true)
  })

  it('validates createdAt: not a string', () => {
    const errors = validateCourse({ ...validCourse, createdAt: 123 })
    expect(errors.some((e) => e.field === 'createdAt')).toBe(true)
  })

  it('validates createdAt: invalid date string', () => {
    const errors = validateCourse({ ...validCourse, createdAt: 'not-a-date' })
    expect(errors.some((e) => e.field === 'createdAt')).toBe(true)
  })

  // -- updatedAt --
  it('validates updatedAt: missing', () => {
    const { updatedAt, ...course } = validCourse
    const errors = validateCourse(course)
    expect(errors.some((e) => e.field === 'updatedAt')).toBe(true)
  })

  it('validates updatedAt: not a string', () => {
    const errors = validateCourse({ ...validCourse, updatedAt: true })
    expect(errors.some((e) => e.field === 'updatedAt')).toBe(true)
  })

  it('validates updatedAt: invalid date string', () => {
    const errors = validateCourse({ ...validCourse, updatedAt: 'invalid-date' })
    expect(errors.some((e) => e.field === 'updatedAt')).toBe(true)
  })

  // -- multiple errors --
  it('returns all errors when multiple fields are invalid', () => {
    const errors = validateCourse({})
    expect(errors.length).toBeGreaterThan(1)
  })

  it('error messages include field name and descriptive message', () => {
    const errors = validateCourse({})
    for (const err of errors) {
      if (err.field !== 'root') {
        expect(err.field).toBeTruthy()
        expect(err.message).toBeTruthy()
        expect(typeof err.message).toBe('string')
      }
    }
  })
})

// ============================================================================
// isValidCourse
// ============================================================================

describe('isValidCourse', () => {
  const validCourse = {
    id: 'course-001',
    title: 'Pr 基础入门教程',
    author: '剪辑大师',
    platform: 'bilibili' as const,
    url: 'https://www.bilibili.com/video/BV1xx411c7mD',
    category: 'basics' as const,
    difficulty: 'beginner' as const,
    duration: 3600,
    description: '从零开始学 Premiere Pro',
    tags: ['Pr', '基础'],
    thumbnailURL: null,
    createdAt: '2024-01-15T08:00:00.000Z',
    updatedAt: '2024-06-01T12:00:00.000Z',
  }

  it('returns true for a valid course', () => {
    expect(isValidCourse(validCourse)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isValidCourse(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isValidCourse(undefined)).toBe(false)
  })

  it('returns false for empty object', () => {
    expect(isValidCourse({})).toBe(false)
  })

  it('returns false for course with missing fields', () => {
    expect(isValidCourse({ id: 'x' })).toBe(false)
  })
})
