# ClipAcademy Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor ClipAcademy from a single 650-line App.tsx into a modular component architecture with dual-theme system, three-block homepage, percentage-based progress, and learning paths.

**Architecture:** TopNav + collapsible Sidebar layout. App.tsx becomes a thin orchestrator that composes layout, home, course, and search components. Theme via CSS custom properties on `[data-theme]` attribute. State management stays in existing hooks (useCourses, useFavorites, useFilters, useProficiency) with proficiency value range changed to 0-100.

**Tech Stack:** React 18 + TypeScript + Vite 6 + framer-motion + CSS custom properties

---

### Task 1: Theme System — CSS Variables

**Files:**
- Create: `src/styles/theme.css`
- Modify: `src/main.tsx:1-10`

- [ ] **Step 1: Create theme.css with light and dark variable sets**

```css
/* src/styles/theme.css */

/* Light theme (default) */
:root {
  --color-bg: #fafafe;
  --color-surface: rgba(255, 255, 255, 0.85);
  --color-sidebar-bg: #f8f9fb;
  --color-sidebar-hover: #ede9fe;
  --color-sidebar-active: #ede9fe;
  --color-topnav-bg: rgba(255, 255, 255, 0.9);
  --color-primary: #6c5ce7;
  --color-primary-hover: #5a4bd1;
  --color-primary-light: #ede9fe;
  --color-text: #1a1a2e;
  --color-text-secondary: #6b7280;
  --color-text-muted: #9ca3af;
  --color-border: #e5e7eb;
  --color-border-light: #f3f4f6;
  --color-tag-bg: #f3f4f6;
  --color-star: #f59e0b;
  --color-accent: #a78bfa;
  --color-success: #059669;
  --color-danger: #dc2626;
  --color-skeleton: #f0f0f0;
  --color-skeleton-shine: #e0e0e0;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-xs: 6px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-xl: -8px 0 40px rgba(0, 0, 0, 0.10);
  --backdrop-blur: blur(10px);
  --font-sans: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'PingFang SC', 'Noto Sans SC', 'Segoe UI', sans-serif;
  --sidebar-width: 200px;
  --topnav-height: 56px;
}

/* Dark theme */
[data-theme="dark"] {
  --color-bg: #0a0a0f;
  --color-surface: #1c1c28;
  --color-sidebar-bg: #0b0b10;
  --color-sidebar-hover: #1c1c28;
  --color-sidebar-active: #6c5ce7;
  --color-topnav-bg: rgba(11, 11, 16, 0.9);
  --color-primary: #6c5ce7;
  --color-primary-hover: #7c7cf7;
  --color-primary-light: #1c1c28;
  --color-text: #e5e7eb;
  --color-text-secondary: #9ca3af;
  --color-text-muted: #6b7280;
  --color-border: #2d2d3d;
  --color-border-light: #1f1f2e;
  --color-tag-bg: #1f1f2e;
  --color-star: #f59e0b;
  --color-accent: #a78bfa;
  --color-success: #34d399;
  --color-danger: #f87171;
  --color-skeleton: #1c1c28;
  --color-skeleton-shine: #2d2d3d;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-xs: 6px;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.4);
  --shadow-xl: -8px 0 40px rgba(0, 0, 0, 0.5);
}

/* Global resets */
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
}

body {
  font-family: var(--font-sans);
  background: var(--color-bg);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.3s ease, color 0.3s ease;
}

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--color-text-muted); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-text-secondary); }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

- [ ] **Step 2: Import theme.css in main.tsx**

Change the import in `src/main.tsx` from `'./App.css'` to `'./styles/theme.css'`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/theme.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Verify the app loads with new theme variables**

Run: `npm run dev`
Expected: App loads, light theme applied. Open browser console, run `document.documentElement.setAttribute('data-theme', 'dark')` — background should turn dark.

- [ ] **Step 4: Commit**

```bash
git add src/styles/theme.css src/main.tsx
git commit -m "feat: add dual-theme CSS variable system (light + dark)"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 2: ThemeToggle Component

**Files:**
- Create: `src/components/layout/ThemeToggle.tsx`

- [ ] **Step 1: Create ThemeToggle component**

```typescript
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('clipacademy-theme')
  if (stored === 'dark' || stored === 'light') return stored
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('clipacademy-theme', theme)
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'none',
        border: 'none',
        fontSize: 20,
        cursor: 'pointer',
        padding: '6px 10px',
        borderRadius: varRadius,
        lineHeight: 1,
      }}
      title={theme === 'light' ? '切换暗色模式' : '切换亮色模式'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </motion.button>
  )
}

const varRadius = 'var(--radius-sm)'
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component with localStorage persistence"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 3: LoadingSkeleton Component

**Files:**
- Create: `src/components/shared/LoadingSkeleton.tsx`

- [ ] **Step 1: Create LoadingSkeleton**

```typescript
export default function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="course-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-thumb" />
          <div className="skeleton-body">
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Add skeleton CSS to theme.css**

Append to `src/styles/theme.css`:

```css
/* Skeleton loading */
.skeleton-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
.skeleton-thumb {
  height: 180px;
  background: linear-gradient(90deg,
    var(--color-skeleton) 25%,
    var(--color-skeleton-shine) 50%,
    var(--color-skeleton) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.skeleton-line {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg,
    var(--color-skeleton) 25%,
    var(--color-skeleton-shine) 50%,
    var(--color-skeleton) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.skeleton-line.short { width: 60%; }
.skeleton-line.medium { width: 80%; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/LoadingSkeleton.tsx src/styles/theme.css
git commit -m "feat: add LoadingSkeleton component"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 4: EmptyState Component

**Files:**
- Create: `src/components/shared/EmptyState.tsx`

- [ ] **Step 1: Create EmptyState**

```typescript
interface EmptyStateProps {
  icon?: string
  message?: string
  hint?: string
}

export default function EmptyState({
  icon = '🔍',
  message = '没有找到匹配的课程',
  hint = '试试更换筛选条件，或使用外部搜索',
}: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.6 }}>{icon}</div>
      <p style={{ fontSize: 14, marginBottom: 8 }}>{message}</p>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{hint}</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/EmptyState.tsx
git commit -m "feat: add EmptyState component"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 5: TopNav Component

**Files:**
- Create: `src/components/layout/TopNav.tsx`

- [ ] **Step 1: Create TopNav**

```typescript
import { ReactNode } from 'react'
import ThemeToggle from './ThemeToggle'

interface TopNavProps {
  logo?: string
  children?: ReactNode
}

export default function TopNav({ logo = '剪映学堂', children }: TopNavProps) {
  return (
    <nav
      style={{
        height: 'var(--topnav-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--color-topnav-bg)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'var(--backdrop-blur)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: 16,
          color: 'var(--color-primary)',
          letterSpacing: '-0.3px',
          flexShrink: 0,
        }}
      >
        {logo}
      </span>
      {children}
      <div style={{ marginLeft: 'auto' }}>
        <ThemeToggle />
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/TopNav.tsx
git commit -m "feat: add TopNav component with theme toggle"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 6: SearchBar Component

**Files:**
- Create: `src/components/search/SearchBar.tsx`

- [ ] **Step 1: Create SearchBar (search input + suggestions + URL paste detection)**

```typescript
import { useRef } from 'react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  showSuggestions: boolean
  suggestionLoading: boolean
  onSelectSuggestion: (title: string) => void
  onBlur: () => void
  onFocus: () => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  suggestions,
  showSuggestions,
  suggestionLoading,
  onSelectSuggestion,
  onBlur,
  onFocus,
  placeholder = '搜索课程或粘贴B站/小红书链接...',
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 16px 10px 42px',
          border: '1.5px solid var(--color-border)',
          borderRadius: 10,
          fontSize: 14,
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          outline: 'none',
          fontFamily: 'var(--font-sans)',
          transition: 'all 0.2s',
        }}
      />
      {showSuggestions && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {suggestionLoading ? (
            <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>
              搜索建议加载中...
            </div>
          ) : (
            suggestions.map((s) => (
              <div
                key={s}
                onMouseDown={() => onSelectSuggestion(s)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--color-text)',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {s}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/search/SearchBar.tsx
git commit -m "feat: add SearchBar component with URL paste support"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 7: FilterBar Component

**Files:**
- Create: `src/components/search/FilterBar.tsx`

- [ ] **Step 1: Create FilterBar (platform, category, difficulty filter chips)**

```typescript
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

const filterSectionStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 8,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', minWidth: 42, flexShrink: 0,
}

export default function FilterBar({
  platforms, categories, difficulties,
  onTogglePlatform, onToggleCategory, onToggleDifficulty,
  onClear, hasActiveFilters,
}: FilterBarProps) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
      {/* Platforms */}
      <div style={filterSectionStyle}>
        <span style={labelStyle}>平台</span>
        {ALL_PLATFORMS.map((p) => (
          <button
            key={p}
            onClick={() => onTogglePlatform(p)}
            className={`filter-chip ${platforms.includes(p) ? 'active' : ''}`}
          >
            {PLATFORM_LABELS[p]}
          </button>
        ))}
      </div>
      {/* Categories */}
      <div style={filterSectionStyle}>
        <span style={labelStyle}>分类</span>
        {ALL_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onToggleCategory(c)}
            className={`filter-chip ${categories.includes(c) ? 'active' : ''}`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      {/* Difficulties */}
      <div style={filterSectionStyle}>
        <span style={labelStyle}>难度</span>
        {ALL_DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => onToggleDifficulty(d)}
            className={`filter-chip ${difficulties.includes(d) ? 'active' : ''}`}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
        {hasActiveFilters && (
          <button onClick={onClear} style={{
            marginLeft: 8, padding: '5px 14px', borderRadius: 100, border: 'none',
            background: 'transparent', color: 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-sans)',
          }}>
            清除筛选
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add filter-chip CSS to theme.css**

```css
/* Filter chips */
.filter-chip {
  padding: 5px 14px;
  border-radius: 100px;
  border: 1.5px solid var(--color-border);
  background: var(--color-surface);
  font-size: 12.5px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--color-text-secondary);
  white-space: nowrap;
  font-family: var(--font-sans);
  font-weight: 450;
}
.filter-chip:hover { border-color: var(--color-primary); color: var(--color-primary); }
.filter-chip.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/search/FilterBar.tsx src/styles/theme.css
git commit -m "feat: add FilterBar component"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 8: CourseCard Component

**Files:**
- Create: `src/components/course/CourseCard.tsx`
- Reference: `src/App.tsx:388-492` (existing card markup to extract)

- [ ] **Step 1: Create CourseCard with progress bar, thumbnail, delete button**

```typescript
import type { Course } from '@shared/types'
import { PLATFORM_LABELS, DIFFICULTY_LABELS, CATEGORY_LABELS } from '@shared/types'

interface CourseCardProps {
  course: Course
  isFavorite: boolean
  progress: number
  onToggleFav: (id: string) => void
  onSelect: (course: Course) => void
  onDelete: (course: Course) => void
  onProgressClick: (course: Course) => void
}

function formatPlayCount(n: number | undefined | null): string {
  if (n == null || n === 0) return ''
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万播放`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}千播放`
  return `${n}播放`
}

function formatDuration(s: number | null): string {
  if (s === null) return '--'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`
}

export default function CourseCard({
  course, isFavorite, progress, onToggleFav, onSelect, onDelete, onProgressClick,
}: CourseCardProps) {
  const bvId = course.bvId || course.url.match(/BV[0-9A-Za-z]{10}/)?.[0]

  return (
    <div className="course-card" onClick={() => onSelect(course)}>
      {/* Thumbnail */}
      <div className="card-thumbnail">
        {course.thumbnailURL ? (
          <img
            src={course.thumbnailURL}
            alt={course.title}
            referrerPolicy="no-referrer"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="card-thumbnail-placeholder">{bvId ? '🎬' : '📹'}</div>
        )}
        {course.duration != null && (
          <span className="card-duration-badge">{formatDuration(course.duration)}</span>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        <div className="card-header">
          <div className="card-title">
            {course.title}
            {course.id.startsWith('user-') && <span className="user-badge">我的</span>}
          </div>
          <button
            className="card-fav-btn"
            onClick={(e) => { e.stopPropagation(); onToggleFav(course.id) }}
            title={isFavorite ? '取消收藏' : '收藏'}
          >
            {isFavorite ? '⭐' : '☆'}
          </button>
        </div>

        <div className="card-meta">
          <span className={`platform-badge platform-${course.platform}`}>
            {PLATFORM_LABELS[course.platform]}
          </span>
          <span className="card-author">{course.author}</span>
          {course.playCount != null && course.playCount > 0 && (
            <span className="card-playcount">{formatPlayCount(course.playCount)}</span>
          )}
        </div>

        <div className="card-desc">{course.description}</div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="card-progress" onClick={(e) => { e.stopPropagation(); onProgressClick(course) }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-label">{progress}%</span>
          </div>
        )}

        <div className="card-footer">
          <span className={`diff-badge diff-${course.difficulty}`}>
            {DIFFICULTY_LABELS[course.difficulty]}
          </span>
          <span className="card-category-label">{CATEGORY_LABELS[course.category]}</span>
          <button
            className="card-delete-btn"
            title="删除此课程"
            onClick={(e) => { e.stopPropagation(); onDelete(course) }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add course card and progress bar CSS to theme.css**

```css
/* Course Grid */
.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 18px;
}

/* Course Card */
.course-card {
  background: var(--color-surface);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
}
.course-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
  border-color: var(--color-accent);
}

/* Thumbnail */
.card-thumbnail {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #e0e7ff, #f3e8ff);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.card-thumbnail img {
  transition: transform 0.3s ease;
}
.course-card:hover .card-thumbnail img {
  transform: scale(1.05);
}
.card-thumbnail-placeholder { font-size: 40px; opacity: 0.3; }
.card-duration-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.75);
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

/* Card Body */
.card-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; }
.card-title {
  font-size: 14.5px;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.user-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 10px;
  font-weight: 600;
  vertical-align: middle;
}
.card-fav-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 2px;
  flex-shrink: 0;
  transition: transform 0.15s;
  line-height: 1;
}
.card-fav-btn:hover { transform: scale(1.2); }

.card-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
}
.card-author { font-weight: 450; }
.card-playcount { font-size: 11px; color: var(--color-text-muted); }

.card-desc {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Progress bar */
.card-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}
.progress-label {
  font-size: 11px;
  color: var(--color-primary);
  font-weight: 600;
  min-width: 32px;
}

/* Footer badges */
.card-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}
.card-category-label { font-size: 12px; color: var(--color-text-muted); }

/* Platform badges */
.platform-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}
.platform-bilibili { background: #fb7299; color: #fff; }
.platform-xiaohongshu { background: #fe2c55; color: #fff; }
.platform-douyin { background: #111; color: #eee; }
.platform-youtube { background: #ff0000; color: #fff; }

/* Difficulty badges */
.diff-badge {
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 500;
}
.diff-beginner { background: #d1fae5; color: #065f46; }
.diff-intermediate { background: #fef3c7; color: #92400e; }
.diff-advanced { background: #fee2e2; color: #991b1b; }

/* Delete button */
.card-delete-btn {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 18px;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 1;
  transition: all 0.15s;
  font-family: var(--font-sans);
}
.card-delete-btn:hover { color: var(--color-danger); background: rgba(239,68,68,0.1); }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/course/CourseCard.tsx src/styles/theme.css
git commit -m "feat: add CourseCard component with progress bar"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 9: CourseGrid Component

**Files:**
- Create: `src/components/course/CourseGrid.tsx`

- [ ] **Step 1: Create CourseGrid**

```typescript
import type { Course } from '@shared/types'
import CourseCard from './CourseCard'
import EmptyState from '../shared/EmptyState'
import LoadingSkeleton from '../shared/LoadingSkeleton'

interface CourseGridProps {
  courses: Course[]
  loading: boolean
  favoriteIds: Set<string>
  proficiency: Record<string, number>
  onToggleFav: (id: string) => void
  onSelect: (course: Course) => void
  onDelete: (course: Course) => void
  onProgressClick: (course: Course) => void
}

export default function CourseGrid({
  courses, loading, favoriteIds, proficiency,
  onToggleFav, onSelect, onDelete, onProgressClick,
}: CourseGridProps) {
  if (loading && courses.length === 0) return <LoadingSkeleton count={6} />
  if (courses.length === 0) return <EmptyState />

  return (
    <div className="course-grid">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          isFavorite={favoriteIds.has(course.id)}
          progress={proficiency[course.id] ?? 0}
          onToggleFav={onToggleFav}
          onSelect={onSelect}
          onDelete={onDelete}
          onProgressClick={onProgressClick}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/course/CourseGrid.tsx
git commit -m "feat: add CourseGrid component"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 10: CourseDetail Component

**Files:**
- Create: `src/components/course/CourseDetail.tsx`
- Reference: `src/App.tsx:498-643` (existing detail panel)

- [ ] **Step 1: Create CourseDetail (extract from App.tsx)**

```typescript
import type { Course, Platform } from '@shared/types'
import { PLATFORM_LABELS, DIFFICULTY_LABELS, CATEGORY_LABELS, ALL_PLATFORMS } from '@shared/types'

interface CourseDetailProps {
  course: Course
  progress: number
  onClose: () => void
  onSetProgress: (courseId: string, level: number) => void
  onDelete: (course: Course) => void
  onPlatformSearch: (platform: Platform) => void
}

function formatPlayCount(n: number | undefined | null): string {
  if (n == null || n === 0) return ''
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万播放`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}千播放`
  return `${n}播放`
}

function formatDuration(s: number | null): string {
  if (s === null) return '--'
  const m = Math.floor(s / 60)
  const sec = s % 60
  return m > 0 ? `${m}分${sec}秒` : `${sec}秒`
}

const PROF_VALUES = [0, 25, 50, 75, 100]

export default function CourseDetail({
  course, progress, onClose, onSetProgress, onDelete, onPlatformSearch,
}: CourseDetailProps) {
  const bvId = course.bvId || course.url.match(/BV[0-9A-Za-z]{10}/)?.[0]

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="detail-overlay" onClick={handleOverlayClick}>
      <div className="detail-panel">
        {/* Header */}
        <div className="detail-header">
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>课程详情</span>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="detail-body">
          {/* Player */}
          {bvId ? (
            <div className="detail-player">
              <iframe
                src={`https://player.bilibili.com/player.html?bvid=${bvId}&page=1&high_quality=1&autoplay=0`}
                allowFullScreen
              />
            </div>
          ) : (
            <div className="detail-no-player">
              {course.platform !== 'bilibili'
                ? `${PLATFORM_LABELS[course.platform]} 暂不支持内嵌播放`
                : '暂无播放源'}
            </div>
          )}

          {/* Title */}
          <div className="detail-title">{course.title}</div>

          {/* Stats */}
          <div className="detail-stats">
            {course.playCount != null && course.playCount > 0 && (
              <span className="detail-stat">▶ {formatPlayCount(course.playCount)}</span>
            )}
            {course.favorites != null && course.favorites > 0 && (
              <span className="detail-stat">⭐ {course.favorites} 收藏</span>
            )}
            <span className="detail-stat">🕐 {formatDuration(course.duration)}</span>
          </div>

          {/* Meta */}
          <div className="detail-meta">
            <span className={`platform-badge platform-${course.platform}`}>{PLATFORM_LABELS[course.platform]}</span>
            <span className={`diff-badge diff-${course.difficulty}`}>{DIFFICULTY_LABELS[course.difficulty]}</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{CATEGORY_LABELS[course.category]}</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>UP主: {course.author}</span>
          </div>

          {/* Description */}
          <div className="detail-desc">{course.description}</div>

          {/* Tags */}
          {course.tags.length > 0 && (
            <>
              <div className="detail-section-title">技能标签</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {course.tags.map((tag) => (
                  <span key={tag} className="detail-tag">{tag}</span>
                ))}
              </div>
            </>
          )}

          {/* Progress slider */}
          <div className="detail-section-title">学习进度</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => onSetProgress(course.id, Number(e.target.value))}
              style={{ flex: 1, maxWidth: 300 }}
            />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)', minWidth: 40 }}>
              {progress}%
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {PROF_VALUES.map((v) => (
              <button
                key={v}
                onClick={() => onSetProgress(course.id, v)}
                className={`filter-chip ${progress === v ? 'active' : ''}`}
              >
                {v === 0 ? '未学习' : `${v}%`}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="detail-section-title">操作</div>
          <button
            className="filter-chip"
            style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', alignSelf: 'flex-start', padding: '8px 18px', fontSize: 13 }}
            onClick={() => { onDelete(course); onClose() }}
          >
            {course.id.startsWith('user-') ? '删除此课程' : '隐藏此课程'}
          </button>

          {/* Watch link */}
          {bvId ? (
            <a
              className="detail-watch-link"
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              在 {PLATFORM_LABELS[course.platform]} 上观看
            </a>
          ) : (
            <button
              className="detail-watch-link"
              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              onClick={() => onPlatformSearch(course.platform)}
            >
              在 {PLATFORM_LABELS[course.platform]} 搜索相关教程
            </button>
          )}

          {/* Cross-platform search */}
          <div className="detail-section-title">在其他平台搜索</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALL_PLATFORMS.filter((p) => p !== course.platform).map((p) => (
              <button
                key={p}
                className="filter-chip"
                onClick={() => onPlatformSearch(p)}
                style={{ cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add detail panel CSS to theme.css**

```css
/* Detail Panel */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
  backdrop-filter: blur(2px);
}
.detail-panel {
  width: 520px;
  max-width: 100vw;
  background: var(--color-surface);
  height: 100%;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}
.detail-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-topnav-bg);
  backdrop-filter: var(--backdrop-blur);
  z-index: 1;
}
.detail-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 6px 10px;
  color: var(--color-text-muted);
  border-radius: 6px;
  transition: all 0.15s;
}
.detail-close:hover { background: var(--color-bg); color: var(--color-text); }
.detail-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.detail-player {
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: #000;
  aspect-ratio: 16/9;
}
.detail-player iframe { width: 100%; height: 100%; border: none; }
.detail-no-player {
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 14px;
  border-radius: var(--radius-sm);
}
.detail-title { font-size: 20px; font-weight: 700; line-height: 1.3; }
.detail-stats { display: flex; gap: 16px; flex-wrap: wrap; }
.detail-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}
.detail-desc {
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}
.detail-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.detail-tag {
  padding: 4px 12px;
  background: var(--color-tag-bg);
  border-radius: 100px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.detail-watch-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--color-primary);
  color: #fff;
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
  align-self: flex-start;
}
.detail-watch-link:hover { background: var(--color-primary-hover); transform: translateY(-1px); }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/course/CourseDetail.tsx src/styles/theme.css
git commit -m "feat: add CourseDetail component with progress slider"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 11: Sidebar Component

**Files:**
- Create: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar with all 14 categories and proficiency filter**

```typescript
import type { Category } from '@shared/types'
import { CATEGORY_LABELS, ALL_CATEGORIES } from '@shared/types'

interface SidebarProps {
  view: string
  categoryCounts: Record<string, number>
  favoriteCount: number
  userCourseCount: number
  inProgressCount: number
  completedCount: number
  collapsed: boolean
  onToggleCollapse: () => void
  onViewAll: () => void
  onViewFavorites: () => void
  onViewUserCourses: () => void
  onViewCategory: (cat: Category) => void
  onViewInProgress: () => void
  onViewCompleted: () => void
}

export default function Sidebar({
  view, categoryCounts, favoriteCount, userCourseCount,
  inProgressCount, completedCount, collapsed, onToggleCollapse,
  onViewAll, onViewFavorites, onViewUserCourses,
  onViewCategory, onViewInProgress, onViewCompleted,
}: SidebarProps) {
  return (
    <aside
      style={{
        width: collapsed ? 48 : 'var(--sidebar-width)',
        flexShrink: 0,
        background: 'var(--color-sidebar-bg)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        transition: 'width 0.25s ease',
        userSelect: 'none',
      }}
    >
      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '8px', alignSelf: 'flex-end', fontSize: 14,
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {collapsed ? '▶' : '◀'}
      </button>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SidebarItem icon="📚" label="全部课程" count={null} active={view === 'all'} onClick={onViewAll} collapsed={collapsed} />
        <SidebarItem icon="⭐" label="我的收藏" count={favoriteCount} active={view === 'favorites'} onClick={onViewFavorites} collapsed={collapsed} />
        <SidebarItem icon="📌" label="我的课程" count={userCourseCount} active={view === 'user'} onClick={onViewUserCourses} collapsed={collapsed} />

        {!collapsed && <div className="sidebar-section-label">分类</div>}
        {ALL_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] ?? 0
          return (
            <SidebarItem
              key={cat}
              icon="•"
              label={CATEGORY_LABELS[cat]}
              count={count > 0 ? count : null}
              active={view === `cat-${cat}`}
              onClick={() => onViewCategory(cat)}
              collapsed={collapsed}
            />
          )
        })}

        {!collapsed && <div className="sidebar-section-label">学习进度</div>}
        <SidebarItem icon="📖" label="练习中" count={inProgressCount} active={view === 'in-progress'} onClick={onViewInProgress} collapsed={collapsed} />
        <SidebarItem icon="🏆" label="已掌握" count={completedCount} active={view === 'completed'} onClick={onViewCompleted} collapsed={collapsed} />
      </nav>
    </aside>
  )
}

function SidebarItem({
  icon, label, count, active, onClick, collapsed,
}: {
  icon: string; label: string; count: number | null;
  active: boolean; onClick: () => void; collapsed: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '8px 6px' : '8px 12px',
        borderRadius: 'var(--radius-xs)',
        cursor: 'pointer',
        fontSize: collapsed ? 16 : 13,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        background: active ? 'var(--color-sidebar-active)' : 'transparent',
        transition: 'all 0.15s ease',
        justifyContent: collapsed ? 'center' : undefined,
        whiteSpace: 'nowrap',
      }}
      title={collapsed ? label : undefined}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'var(--color-sidebar-hover)'
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
      }}
    >
      <span style={{ fontSize: collapsed ? 16 : 14, flexShrink: 0 }}>{icon}</span>
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && count != null && (
        <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add sidebar CSS to theme.css**

```css
.sidebar-section-label {
  padding: 16px 12px 4px;
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 1px;
  text-transform: uppercase;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx src/styles/theme.css
git commit -m "feat: add collapsible Sidebar component"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 12: Learning Paths Data

**Files:**
- Create: `src/data/learning-paths.json`

- [ ] **Step 1: Create learning paths JSON**

```json
[
  {
    "id": "path-zero-to-one",
    "name": "剪辑从零到一",
    "description": "从零基础到能独立完成一支短片",
    "difficulty": "beginner",
    "icon": "🎬",
    "color": "#6c5ce7",
    "courseIds": []
  },
  {
    "id": "path-color-grading",
    "name": "调色专项训练",
    "description": "系统学习调色理论和实战技巧",
    "difficulty": "intermediate",
    "icon": "🎨",
    "color": "#a78bfa",
    "courseIds": []
  },
  {
    "id": "path-effects",
    "name": "特效与合成",
    "description": "AE特效、合成、抠像等进阶技能",
    "difficulty": "advanced",
    "icon": "✨",
    "color": "#f59e0b",
    "courseIds": []
  },
  {
    "id": "path-mobile",
    "name": "手机剪辑大师",
    "description": "用手机完成专业级剪辑",
    "difficulty": "beginner",
    "icon": "📱",
    "color": "#34d399",
    "courseIds": []
  }
]
```

- [ ] **Step 2: Commit**

```bash
git add src/data/learning-paths.json
git commit -m "feat: add learning paths data structure"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 13: ContinueLearning Component

**Files:**
- Create: `src/components/home/ContinueLearning.tsx`

- [ ] **Step 1: Create ContinueLearning (horizontal scroll of in-progress courses)**

```typescript
import type { Course } from '@shared/types'
import { motion } from 'framer-motion'

interface ContinueLearningProps {
  courses: Course[]
  proficiency: Record<string, number>
  onSelect: (course: Course) => void
}

export default function ContinueLearning({ courses, proficiency, onSelect }: ContinueLearningProps) {
  const inProgress = courses
    .filter((c) => {
      const p = proficiency[c.id] ?? 0
      return p > 0 && p < 100
    })
    .sort((a, b) => (proficiency[b.id] ?? 0) - (proficiency[a.id] ?? 0))
    .slice(0, 8)

  if (inProgress.length === 0) return null

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>📖 继续学习</h3>
      </div>
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {inProgress.map((course, i) => {
          const p = proficiency[course.id] ?? 0
          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(course)}
              style={{
                minWidth: 200,
                background: 'var(--color-surface)',
                borderRadius: 'var(--radius)',
                padding: 12,
                cursor: 'pointer',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                flexShrink: 0,
              }}
              whileHover={{ y: -4, boxShadow: 'var(--shadow-lg)' }}
            >
              <div style={{
                height: 100,
                borderRadius: 'var(--radius-xs)',
                background: course.thumbnailURL
                  ? `url(${course.thumbnailURL}) center/cover`
                  : 'linear-gradient(135deg, #e0e7ff, #ede9fe)',
                marginBottom: 8,
              }} />
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {course.title}
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${p}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 4, fontWeight: 500 }}>
                进度 {p}%
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/ContinueLearning.tsx
git commit -m "feat: add ContinueLearning component with horizontal scroll"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 14: LearningPaths Component

**Files:**
- Create: `src/components/home/LearningPaths.tsx`

- [ ] **Step 1: Create LearningPaths display**

```typescript
import { motion } from 'framer-motion'
import learningPaths from '../../data/learning-paths.json'

interface LearningPathsProps {
  proficiency: Record<string, number>
}

export default function LearningPaths({ proficiency }: LearningPathsProps) {
  const paths = learningPaths.map((path) => {
    const completedCount = path.courseIds.filter((id) => (proficiency[id] ?? 0) >= 100).length
    const totalCount = path.courseIds.length
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
    return { ...path, completedCount, totalCount, progress }
  })

  return (
    <section style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>🗺️ 学习路径</h3>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {paths.map((path, i) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              padding: 16,
              borderLeft: `3px solid ${path.color}`,
              border: `1px solid var(--color-border)`,
              borderLeftWidth: 3,
              borderLeftColor: path.color,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ fontSize: 20, marginBottom: 8 }}>{path.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{path.name}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
              {path.description}
            </div>
            <div className="progress-bar" style={{ height: 4, marginBottom: 6 }}>
              <div className="progress-fill" style={{ width: `${path.progress}%`, background: path.color }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              {path.totalCount > 0
                ? `已完成 ${path.completedCount}/${path.totalCount}`
                : `${path.totalCount} 门课程`}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/LearningPaths.tsx
git commit -m "feat: add LearningPaths component"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 15: RecommendedList Component

**Files:**
- Create: `src/components/home/RecommendedList.tsx`

- [ ] **Step 1: Create RecommendedList with smart recommendation logic**

```typescript
import { useMemo } from 'react'
import type { Course } from '@shared/types'
import CourseCard from '../course/CourseCard'
import { motion } from 'framer-motion'

interface RecommendedListProps {
  allCourses: Course[]
  proficiency: Record<string, number>
  favoriteIds: Set<string>
  hiddenIds: Set<string>
  onToggleFav: (id: string) => void
  onSelect: (course: Course) => void
  onDelete: (course: Course) => void
  onProgressClick: (course: Course) => void
}

export default function RecommendedList({
  allCourses, proficiency, favoriteIds, hiddenIds,
  onToggleFav, onSelect, onDelete, onProgressClick,
}: RecommendedListProps) {
  const recommended = useMemo(() => {
    // Find user's top categories from courses with progress
    const categoryScores: Record<string, number> = {}
    for (const course of allCourses) {
      const p = proficiency[course.id] ?? 0
      if (p > 0) {
        categoryScores[course.category] = (categoryScores[course.category] ?? 0) + p
      }
    }

    // Sort categories by score
    const topCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat)

    // If no history, fall back to high-playcount courses
    if (topCategories.length === 0) {
      return allCourses
        .filter((c) => !hiddenIds.has(c.id) && (proficiency[c.id] ?? 0) < 100)
        .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
        .slice(0, 6)
    }

    // Recommend uncompleted courses in top categories
    return allCourses
      .filter((c) =>
        topCategories.includes(c.category) &&
        !hiddenIds.has(c.id) &&
        (proficiency[c.id] ?? 0) < 100
      )
      .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
      .slice(0, 6)
  }, [allCourses, proficiency, hiddenIds])

  if (recommended.length === 0) return null

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>✨ 猜你喜欢</h3>
      </div>
      <div className="course-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {recommended.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <CourseCard
              course={course}
              isFavorite={favoriteIds.has(course.id)}
              progress={proficiency[course.id] ?? 0}
              onToggleFav={onToggleFav}
              onSelect={onSelect}
              onDelete={onDelete}
              onProgressClick={onProgressClick}
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/RecommendedList.tsx
git commit -m "feat: add RecommendedList with smart category-based recommendations"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 16: HomePage Component

**Files:**
- Create: `src/components/home/HomePage.tsx`

- [ ] **Step 1: Create HomePage that composes the three blocks**

```typescript
import type { Course } from '@shared/types'
import ContinueLearning from './ContinueLearning'
import LearningPaths from './LearningPaths'
import RecommendedList from './RecommendedList'

interface HomePageProps {
  courses: Course[]
  proficiency: Record<string, number>
  favoriteIds: Set<string>
  hiddenIds: Set<string>
  onToggleFav: (id: string) => void
  onSelect: (course: Course) => void
  onDelete: (course: Course) => void
  onProgressClick: (course: Course) => void
}

export default function HomePage(props: HomePageProps) {
  return (
    <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
      <ContinueLearning
        courses={props.courses}
        proficiency={props.proficiency}
        onSelect={props.onSelect}
      />
      <LearningPaths proficiency={props.proficiency} />
      <RecommendedList
        allCourses={props.courses}
        proficiency={props.proficiency}
        favoriteIds={props.favoriteIds}
        hiddenIds={props.hiddenIds}
        onToggleFav={props.onToggleFav}
        onSelect={props.onSelect}
        onDelete={props.onDelete}
        onProgressClick={props.onProgressClick}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/home/HomePage.tsx
git commit -m "feat: add HomePage component composing three blocks"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 17: Update Proficiency Hook for 0-100 Range

**Files:**
- Modify: `src/shared/types/course.ts:101-107`
- Modify: `src/hooks/useCourses.ts:117-143`

- [ ] **Step 1: Update PROFICIENCY_LEVELS in types to use 0-100 labels**

Replace the PROFICIENCY_LEVELS constant in `src/shared/types/course.ts`:

```typescript
export const PROFICIENCY_LEVELS = [
  { value: 0, label: '未学习' },
  { value: 25, label: '了解 (25%)' },
  { value: 50, label: '练习中 (50%)' },
  { value: 75, label: '熟练 (75%)' },
  { value: 100, label: '精通 (100%)' },
] as const
```

The old values were `[0, 30, 50, 70, 100]` — change to `[0, 25, 50, 75, 100]`.

- [ ] **Step 2: Verify typecheck**

Run: `npm run typecheck`
Expected: No errors related to PROFICIENCY_LEVELS change.

- [ ] **Step 3: Commit**

```bash
git add src/shared/types/course.ts
git commit -m "feat: update proficiency levels to 0-25-50-75-100 percentage scale"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 18: Rewire App.tsx as Orchestrator

**Files:**
- Modify: `src/App.tsx` (complete rewrite to ~200 lines)
- Delete: `src/App.css` (styles moved to theme.css)

- [ ] **Step 1: Rewrite App.tsx using new components**

```typescript
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Course, Platform, Category } from '@shared/types'
import { CATEGORY_LABELS } from '@shared/types'
import { useCourses, useFavorites, useFilters, useProficiency } from './hooks/useCourses'
import { openExternalLink, getSuggestions, extractURL, fetchCourseFromURL, addUserCourse, removeUserCourse, hideCourse, getHiddenCourseIds } from './services/api'
import TopNav from './components/layout/TopNav'
import Sidebar from './components/layout/Sidebar'
import SearchBar from './components/search/SearchBar'
import FilterBar from './components/search/FilterBar'
import HomePage from './components/home/HomePage'
import CourseGrid from './components/course/CourseGrid'
import CourseDetail from './components/course/CourseDetail'

type FetchStatus = 'idle' | 'fetching' | 'success' | 'error' | 'duplicate'
type View = 'all' | 'favorites' | 'user' | 'in-progress' | 'completed' | `cat-${Category}`

const SORT_OPTIONS = [
  { value: 'play_count', label: '最多播放' },
  { value: 'favorites', label: '最多收藏' },
  { value: 'newest', label: '最新' },
  { value: 'duration', label: '最长' },
] as const

function getPlatformSearchUrl(platform: Platform, keyword: string): string {
  const q = encodeURIComponent(keyword)
  switch (platform) {
    case 'bilibili': return `https://search.bilibili.com/all?keyword=${q}&order=click`
    case 'xiaohongshu': return `https://www.xiaohongshu.com/search_result?keyword=${q}`
    case 'douyin': return `https://www.douyin.com/search/${q}`
    case 'youtube': return `https://www.youtube.com/results?search_query=${q}`
  }
}

export default function App() {
  const { courses, total, loading, search, userCourses, refreshUserCourses } = useCourses()
  const { favoriteIds, toggle: toggleFav, isFavorite } = useFavorites()
  const { proficiency, setLevel, getLevel } = useProficiency()
  const filters = useFilters()
  const [view, setView] = useState<View>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [sortBy, setSortBy] = useState<string>('play_count')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')
  const [fetchMsg, setFetchMsg] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const hiddenIds = useMemo(() => getHiddenCourseIds(), [courses])

  // Search effect
  useEffect(() => {
    search({
      keyword: filters.keyword || undefined,
      platforms: filters.platforms.length ? filters.platforms : undefined,
      categories: filters.categories.length ? filters.categories : undefined,
      difficulties: filters.difficulties.length ? filters.difficulties : undefined,
      sort: sortBy,
    })
  }, [filters.keyword, filters.platforms, filters.categories, filters.difficulties, sortBy, search])

  // Filter courses by view
  const displayedCourses = useMemo(() => {
    switch (view) {
      case 'favorites': return courses.filter((c) => favoriteIds.has(c.id))
      case 'user': return courses.filter((c) => c.id.startsWith('user-'))
      case 'in-progress': return courses.filter((c) => { const p = proficiency[c.id] ?? 0; return p > 0 && p < 100 })
      case 'completed': return courses.filter((c) => (proficiency[c.id] ?? 0) >= 100)
      default:
        if (view.startsWith('cat-')) {
          const cat = view.slice(4) as Category
          return courses.filter((c) => c.category === cat)
        }
        return courses
    }
  }, [courses, view, favoriteIds, proficiency])

  // Is on homepage (no filters/search active)
  const isHomepage = view === 'all' && !filters.keyword && filters.platforms.length === 0 && filters.categories.length === 0 && filters.difficulties.length === 0

  // Category counts for sidebar
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of courses) {
      counts[c.category] = (counts[c.category] ?? 0) + 1
    }
    return counts
  }, [courses])

  const inProgressCount = useMemo(
    () => courses.filter((c) => { const p = proficiency[c.id] ?? 0; return p > 0 && p < 100 }).length,
    [courses, proficiency]
  )
  const completedCount = useMemo(
    () => courses.filter((c) => (proficiency[c.id] ?? 0) >= 100).length,
    [courses, proficiency]
  )

  // URL fetch handler
  const handleURLFetch = useCallback(async (url: string) => {
    const existing = userCourses.some((c) => c.url === url)
    if (existing) {
      setFetchStatus('duplicate')
      setFetchMsg('该链接已添加过')
      setTimeout(() => setFetchStatus('idle'), 2500)
      return
    }
    setFetchStatus('fetching')
    setFetchMsg('正在获取课程信息...')
    const course = await fetchCourseFromURL(url)
    if (course) {
      addUserCourse(course)
      refreshUserCourses()
      setFetchStatus('success')
      setFetchMsg(`已添加：${course.title.slice(0, 30)}...`)
      setView('all')
      filters.setKeyword(course.title)
      search({ keyword: course.title, sort: sortBy })
      setTimeout(() => setFetchStatus('idle'), 3000)
    } else {
      setFetchStatus('error')
      setFetchMsg('获取失败，请检查链接是否正确（目前仅支持B站视频链接）')
      setTimeout(() => setFetchStatus('idle'), 4000)
    }
  }, [userCourses, refreshUserCourses, search, sortBy, filters])

  // Search change handler
  const handleSearchChange = useCallback((value: string) => {
    const url = extractURL(value)
    if (url) { handleURLFetch(url); return }
    filters.setKeyword(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setSuggestionLoading(true)
        try {
          const results = await getSuggestions(value)
          setSuggestions(results)
          setShowSuggestions(results.length > 0)
        } catch { setSuggestions([]) }
        setSuggestionLoading(false)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [handleURLFetch, filters])

  const selectSuggestion = useCallback((title: string) => {
    filters.setKeyword(title)
    setShowSuggestions(false)
  }, [filters])

  // Platform search
  const handlePlatformSearch = useCallback((platform: Platform) => {
    const keyword = filters.keyword || '剪映教程'
    openExternalLink(getPlatformSearchUrl(platform, keyword))
  }, [filters.keyword])

  // Course actions
  const handleDelete = useCallback((course: Course) => {
    if (course.id.startsWith('user-')) {
      removeUserCourse(course.id)
      refreshUserCourses()
    } else {
      hideCourse(course.id)
    }
    search({
      keyword: filters.keyword || undefined,
      platforms: filters.platforms.length ? filters.platforms : undefined,
      categories: filters.categories.length ? filters.categories : undefined,
      difficulties: filters.difficulties.length ? filters.difficulties : undefined,
      sort: sortBy,
    })
  }, [refreshUserCourses, search, filters, sortBy])

  const handleProgressClick = useCallback((course: Course) => {
    const current = getLevel(course.id)
    const next = current >= 100 ? 0 : Math.min(100, current + 25)
    setLevel(course.id, next)
  }, [getLevel, setLevel])

  const hasActiveFilters = filters.platforms.length > 0 || filters.categories.length > 0 || filters.difficulties.length > 0 || !!filters.keyword

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top Nav */}
      <TopNav>
        <div style={{ display: 'flex', gap: 4 }}>
          <NavTab active={view === 'all'} onClick={() => { setView('all'); filters.clearAll() }}>全部</NavTab>
          <NavTab active={view === 'favorites'} onClick={() => setView('favorites')}>收藏</NavTab>
          <NavTab active={view === 'user'} onClick={() => setView('user')}>我的课程</NavTab>
        </div>
        <SearchBar
          value={filters.keyword}
          onChange={handleSearchChange}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          suggestionLoading={suggestionLoading}
          onSelectSuggestion={selectSuggestion}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        {fetchStatus !== 'idle' && (
          <span style={{
            fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
            color: fetchStatus === 'success' ? 'var(--color-success)' : fetchStatus === 'error' || fetchStatus === 'duplicate' ? 'var(--color-danger)' : 'var(--color-primary)',
          }}>
            {fetchMsg}
          </span>
        )}
      </TopNav>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar
          view={view}
          categoryCounts={categoryCounts}
          favoriteCount={favoriteIds.size}
          userCourseCount={userCourses.length}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          onViewAll={() => setView('all')}
          onViewFavorites={() => setView('favorites')}
          onViewUserCourses={() => setView('user')}
          onViewCategory={(cat) => setView(`cat-${cat}`)}
          onViewInProgress={() => setView('in-progress')}
          onViewCompleted={() => setView('completed')}
        />

        {/* Main content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filter + Sort bar (only when not on homepage) */}
          {!isHomepage && (
            <>
              <div style={{ padding: '0 28px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                <FilterBar
                  platforms={filters.platforms}
                  categories={filters.categories}
                  difficulties={filters.difficulties}
                  onTogglePlatform={filters.togglePlatform}
                  onToggleCategory={filters.toggleCategory}
                  onToggleDifficulty={filters.toggleDifficulty}
                  onClear={filters.clearAll}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
              <div style={{
                padding: '8px 28px', background: 'var(--color-surface)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortBy(opt.value)}
                      style={{
                        padding: '4px 12px', borderRadius: 100, border: 'none',
                        background: sortBy === opt.value ? 'var(--color-primary)' : 'transparent',
                        color: sortBy === opt.value ? '#fff' : 'var(--color-text-secondary)',
                        cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-sans)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {loading ? '搜索中...' : `共 ${displayedCourses.length} 个课程`}
                </div>
              </div>
            </>
          )}

          {/* Content area */}
          {isHomepage ? (
            <HomePage
              courses={courses}
              proficiency={proficiency}
              favoriteIds={favoriteIds}
              hiddenIds={hiddenIds}
              onToggleFav={toggleFav}
              onSelect={setSelectedCourse}
              onDelete={handleDelete}
              onProgressClick={handleProgressClick}
            />
          ) : (
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              <CourseGrid
                courses={displayedCourses}
                loading={loading}
                favoriteIds={favoriteIds}
                proficiency={proficiency}
                onToggleFav={toggleFav}
                onSelect={setSelectedCourse}
                onDelete={handleDelete}
                onProgressClick={handleProgressClick}
              />
            </div>
          )}
        </main>
      </div>

      {/* Detail Panel */}
      {selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          progress={getLevel(selectedCourse.id)}
          onClose={() => setSelectedCourse(null)}
          onSetProgress={setLevel}
          onDelete={handleDelete}
          onPlatformSearch={handlePlatformSearch}
        />
      )}
    </div>
  )
}

function NavTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 'var(--radius-xs)',
        border: 'none',
        background: active ? 'var(--color-primary)' : 'transparent',
        color: active ? '#fff' : 'var(--color-text-secondary)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        fontFamily: 'var(--font-sans)',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Delete App.css**

```bash
rm src/App.css
```

This file's styles have all been migrated to `src/styles/theme.css`.

- [ ] **Step 3: Verify typecheck and dev server**

Run: `npm run typecheck && npm run dev`
Expected: No type errors. Dev server starts. App loads with new layout.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx && git rm src/App.css
git commit -m "refactor: rewrite App.tsx as thin orchestrator, delete App.css"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 19: Responsive Layout

**Files:**
- Modify: `src/styles/theme.css` (append responsive rules)

- [ ] **Step 1: Add responsive CSS to theme.css**

```css
/* Responsive */
@media (max-width: 1280px) {
  .course-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
}

@media (max-width: 1024px) {
  :root { --sidebar-width: 48px; }
  .sidebar-section-label { display: none; }
  .course-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
}

@media (max-width: 768px) {
  :root { --topnav-height: 48px; }
  .course-grid { grid-template-columns: 1fr; }
  .detail-panel { width: 100vw; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/theme.css
git commit -m "feat: add responsive layout breakpoints"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

---

### Task 20: Final Integration Test

- [ ] **Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: Zero errors.

- [ ] **Step 2: Run tests**

Run: `npm run test`
Expected: All tests pass.

- [ ] **Step 3: Manual smoke test**

Start dev server `npm run dev`, verify:
- Page loads with new layout (top nav + sidebar + homepage)
- Search works (type keyword, see suggestions)
- URL paste works (paste B站 link, course added)
- Theme toggle works (click 🌙 / ☀️, theme switches smoothly)
- Sidebar collapse works (click ◀ / ▶)
- Category navigation works (click sidebar category)
- Course card progress bar visible
- Detail panel opens with progress slider (0-100%)
- Delete/hide courses works
- Favorites toggle works
- Filter chips work
- Sort options work
- Homepage three blocks show (if courses with progress exist)
- Responsive: narrow browser to mobile width, layout adapts

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A
git commit -m "chore: final polish and responsive fixes for redesign"

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```
