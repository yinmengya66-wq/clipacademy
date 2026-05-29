/**
 * 共享类型 barrel 导出测试
 *
 * 验证 @shared/types/index.ts 正确重新导出所有类型和常量。
 */

import { describe, it, expect } from 'vitest'
import {
  PLATFORM_LABELS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
} from '@shared/types'

describe('@shared/types barrel export', () => {
  it('re-exports PLATFORM_LABELS', () => {
    expect(PLATFORM_LABELS).toBeDefined()
    expect(PLATFORM_LABELS.xiaohongshu).toBe('小红书')
  })

  it('re-exports CATEGORY_LABELS', () => {
    expect(CATEGORY_LABELS).toBeDefined()
    expect(CATEGORY_LABELS.basics).toBe('基础操作')
  })

  it('re-exports DIFFICULTY_LABELS', () => {
    expect(DIFFICULTY_LABELS).toBeDefined()
    expect(DIFFICULTY_LABELS.beginner).toBe('入门')
  })
})
