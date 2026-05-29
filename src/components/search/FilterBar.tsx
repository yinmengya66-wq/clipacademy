import type { Platform, Category, Difficulty } from '@shared/types'
import { PLATFORM_LABELS, CATEGORY_LABELS, DIFFICULTY_LABELS, ALL_PLATFORMS, ALL_CATEGORIES, ALL_DIFFICULTIES } from '@shared/types'

interface FilterBarProps {
  platforms: Platform[]
  categories: Category[]
  difficulties: Difficulty[]
  onTogglePlatform: (p: Platform) => void
  onToggleCategory: (c: Category) => void
  onToggleDifficulty: (d: Difficulty) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export default function FilterBar({
  platforms, categories, difficulties,
  onTogglePlatform, onToggleCategory, onToggleDifficulty,
  onClear, hasActiveFilters,
}: FilterBarProps) {
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 42, flexShrink: 0 }}>平台</span>
        {ALL_PLATFORMS.map((p) => (
          <button key={p} onClick={() => onTogglePlatform(p)} className={`filter-chip ${platforms.includes(p) ? 'active' : ''}`}>
            {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 42, flexShrink: 0 }}>分类</span>
        {ALL_CATEGORIES.map((c) => (
          <button key={c} onClick={() => onToggleCategory(c)} className={`filter-chip ${categories.includes(c) ? 'active' : ''}`}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 42, flexShrink: 0 }}>难度</span>
        {ALL_DIFFICULTIES.map((d) => (
          <button key={d} onClick={() => onToggleDifficulty(d)} className={`filter-chip ${difficulties.includes(d) ? 'active' : ''}`}>
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
        {hasActiveFilters && (
          <button onClick={onClear} style={{ marginLeft: 8, padding: '5px 14px', borderRadius: 100, border: 'none', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-sans)' }}>
            清除筛选
          </button>
        )}
      </div>
    </div>
  )
}
