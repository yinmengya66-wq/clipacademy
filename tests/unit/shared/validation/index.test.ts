/**
 * 验证层 barrel 导出测试
 *
 * 验证 @shared/validation/index.ts 正确重新导出所有验证函数。
 */

import { describe, it, expect } from 'vitest'
import {
  isPlatform,
  isCategory,
  isDifficulty,
  validateCourse,
  isValidCourse,
} from '@shared/validation'

describe('@shared/validation barrel export', () => {
  it('re-exports isPlatform as a function', () => {
    expect(typeof isPlatform).toBe('function')
  })

  it('re-exports isCategory as a function', () => {
    expect(typeof isCategory).toBe('function')
  })

  it('re-exports isDifficulty as a function', () => {
    expect(typeof isDifficulty).toBe('function')
  })

  it('re-exports validateCourse as a function', () => {
    expect(typeof validateCourse).toBe('function')
  })

  it('re-exports isValidCourse as a function', () => {
    expect(typeof isValidCourse).toBe('function')
  })

  it('isPlatform works through barrel export', () => {
    expect(isPlatform('bilibili')).toBe(true)
  })

  it('validateCourse works through barrel export', () => {
    const errors = validateCourse(null)
    expect(errors).toHaveLength(1)
  })
})
