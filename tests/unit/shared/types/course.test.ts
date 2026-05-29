/**
 * 课程数据模型 — 常量测试
 *
 * 验证所有运行时常量（Label 映射）的正确性。
 */

import { describe, it, expect } from 'vitest'
import {
  PLATFORM_LABELS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from '@shared/types/course'

// ============================================================================
// PLATFORM_LABELS
// ============================================================================

describe('PLATFORM_LABELS', () => {
  it('has all four platforms with Chinese labels', () => {
    expect(PLATFORM_LABELS).toEqual({
      xiaohongshu: '小红书',
      bilibili: 'B站',
      douyin: '抖音',
      youtube: 'YouTube',
    })
  })

  it('has exactly 4 entries', () => {
    expect(Object.keys(PLATFORM_LABELS)).toHaveLength(4)
  })
})

// ============================================================================
// CATEGORY_LABELS
// ============================================================================

describe('CATEGORY_LABELS', () => {
  it('has all eight categories with Chinese labels', () => {
    expect(CATEGORY_LABELS).toEqual({
      basics: '基础操作',
      colorGrading: '调色',
      transitions: '转场特效',
      audioDesign: '音效设计',
      subtitles: '字幕标题',
      editingMind: '剪辑思维',
      effects: '视觉特效',
      storytelling: '叙事技巧',
    })
  })

  it('has exactly 8 entries', () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(8)
  })
})

// ============================================================================
// DIFFICULTY_LABELS
// ============================================================================

describe('DIFFICULTY_LABELS', () => {
  it('has all three difficulty levels with Chinese labels', () => {
    expect(DIFFICULTY_LABELS).toEqual({
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级',
    })
  })

  it('has exactly 3 entries', () => {
    expect(Object.keys(DIFFICULTY_LABELS)).toHaveLength(3)
  })
})
