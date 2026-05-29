import { useState, useEffect, useMemo, useRef } from 'react'
import type { Course, Platform, Category, Difficulty } from '@shared/types'
import {
  PLATFORM_LABELS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  ALL_PLATFORMS,
  ALL_CATEGORIES,
  ALL_DIFFICULTIES,
  PROFICIENCY_LEVELS,
} from '@shared/types'
import { useCourses, useFavorites, useFilters, useProficiency } from './hooks/useCourses'
import { openExternalLink, getSuggestions } from './services/api'

type View = 'all' | 'favorites' | { category: Category } | { proficiency: number }

const PROF_VALUES = [30, 50, 70, 100] as const
const SORT_OPTIONS = [
  { value: 'play_count', label: '最多播放' },
  { value: 'favorites', label: '最多收藏' },
  { value: 'newest', label: '最新' },
  { value: 'duration', label: '最长' },
] as const

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

function extractBvId(url: string): string | null {
  const match = url.match(/BV[0-9A-Za-z]{10}/)
  return match ? match[0] : null
}

function getPlatformSearchUrl(platform: Platform, keyword: string): string {
  const q = encodeURIComponent(keyword)
  switch (platform) {
    case 'bilibili': return `https://search.bilibili.com/all?keyword=${q}&order=click`
    case 'xiaohongshu': return `https://www.xiaohongshu.com/search_result?keyword=${q}`
    case 'douyin': return `https://www.douyin.com/search/${q}`
    case 'youtube': return `https://www.youtube.com/results?search_query=${q}`
  }
}

function App() {
  const { courses, total, loading, search } = useCourses()
  const { favoriteIds, toggle: toggleFav, isFavorite } = useFavorites()
  const { proficiency, setLevel, getLevel } = useProficiency()
  const filters = useFilters()
  const [view, setView] = useState<View>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [sortBy, setSortBy] = useState<string>('play_count')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    search({
      keyword: filters.keyword || undefined,
      platforms: filters.platforms.length ? filters.platforms : undefined,
      categories: filters.categories.length ? filters.categories : undefined,
      difficulties: filters.difficulties.length ? filters.difficulties : undefined,
      sort: sortBy,
    })
  }, [filters.keyword, filters.platforms, filters.categories, filters.difficulties, sortBy, search])

  const displayedCourses = useMemo(() => {
    if (view === 'favorites') return courses.filter((c) => favoriteIds.has(c.id))
    if (typeof view === 'object' && 'category' in view) {
      return courses.filter((c) => c.category === view.category)
    }
    if (typeof view === 'object' && 'proficiency' in view) {
      return courses.filter((c) => (proficiency[c.id] ?? 0) === view.proficiency)
    }
    return courses
  }, [courses, view, favoriteIds, proficiency])

  const learnedCount = useMemo(() => Object.keys(proficiency).length, [proficiency])

  const handleSearchChange = (value: string) => {
    filters.setKeyword(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setSuggestionLoading(true)
        try {
          const results = await getSuggestions(value)
          setSuggestions(results)
          setShowSuggestions(results.length > 0)
        } catch {
          setSuggestions([])
        }
        setSuggestionLoading(false)
      }, 300)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (title: string) => {
    filters.setKeyword(title)
    setShowSuggestions(false)
    searchInputRef.current?.blur()
  }

  const handlePlatformSearch = (platform: Platform) => {
    const keyword = filters.keyword || CATEGORY_LABELS[view && typeof view === 'object' && 'category' in view ? view.category : 'basics']
    openExternalLink(getPlatformSearchUrl(platform, keyword))
  }

  const currentBvId = selectedCourse ? (selectedCourse.bvId || extractBvId(selectedCourse.url)) : null

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">剪映学堂</div>
        <div className="sidebar-subtitle">剪辑课程聚合搜索</div>
        <nav className="sidebar-nav">
          <div
            className={`sidebar-nav-item ${view === 'all' ? 'active' : ''}`}
            onClick={() => setView('all')}
          >
            <span className="nav-icon">📚</span>全部课程
            <span className="nav-count">{total}</span>
          </div>
          <div
            className={`sidebar-nav-item ${view === 'favorites' ? 'active' : ''}`}
            onClick={() => setView('favorites')}
          >
            <span className="nav-icon">⭐</span>我的收藏
            {favoriteIds.size > 0 && <span className="nav-count">{favoriteIds.size}</span>}
          </div>
          <div className="sidebar-section-title">学习进度</div>
          {PROFICIENCY_LEVELS.filter((l) => l.value > 0).map((l) => {
            const count = courses.filter((c) => (proficiency[c.id] ?? 0) === l.value).length
            return (
              <div
                key={l.value}
                className={`sidebar-nav-item ${
                  typeof view === 'object' && 'proficiency' in view && view.proficiency === l.value ? 'active' : ''
                }`}
                onClick={() =>
                  setView(
                    typeof view === 'object' && 'proficiency' in view && view.proficiency === l.value
                      ? 'all'
                      : { proficiency: l.value }
                  )
                }
              >
                <span className="nav-icon">
                  {l.value >= 100 ? '🏆' : l.value >= 70 ? '🎯' : l.value >= 50 ? '📖' : '👀'}
                </span>
                {l.label}
                {count > 0 && <span className="nav-count">{count}</span>}
              </div>
            )
          })}
          <div className="sidebar-section-title">技能分类</div>
          {ALL_CATEGORIES.map((cat) => {
            const catCount = courses.filter((c) => c.category === cat).length
            return (
              <div
                key={cat}
                className={`sidebar-nav-item ${
                  typeof view === 'object' && 'category' in view && view.category === cat ? 'active' : ''
                }`}
                onClick={() =>
                  setView(typeof view === 'object' && 'category' in view && view.category === cat ? 'all' : { category: cat })
                }
              >
                <span className="nav-icon">•</span>
                {CATEGORY_LABELS[cat]}
                {catCount > 0 && <span className="nav-count">{catCount}</span>}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="app-main">
        {/* Toolbar */}
        <div className="app-toolbar">
          <div className="search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              className="search-input"
              type="text"
              placeholder={loading ? '搜索中...' : '搜索课程、作者、标签...'}
              value={filters.keyword}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {showSuggestions && (
              <div className="search-suggestions">
                {suggestionLoading ? (
                  <div className="search-suggestion-item" style={{ color: '#9ca3af' }}>搜索建议加载中...</div>
                ) : (
                  suggestions.map((s) => (
                    <div key={s} className="search-suggestion-item" onMouseDown={() => selectSuggestion(s)}>
                      {s}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {(filters.keyword || filters.platforms.length > 0 || filters.categories.length > 0 || filters.difficulties.length > 0) && (
            <button
              onClick={filters.clearAll}
              style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}
            >
              清除筛选
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="filter-area">
          <div className="filter-row">
            <span className="filter-section-label">平台</span>
            {ALL_PLATFORMS.map((p) => (
              <button
                key={p}
                className={`filter-chip ${filters.platforms.includes(p) ? 'active' : ''}`}
                onClick={() => filters.togglePlatform(p)}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <span className="filter-section-label">分类</span>
            {ALL_CATEGORIES.map((c) => (
              <button
                key={c}
                className={`filter-chip ${filters.categories.includes(c) ? 'active' : ''}`}
                onClick={() => filters.toggleCategory(c)}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          <div className="filter-row">
            <span className="filter-section-label">难度</span>
            {ALL_DIFFICULTIES.map((d) => (
              <button
                key={d}
                className={`filter-chip ${filters.difficulties.includes(d) ? 'active' : ''}`}
                onClick={() => filters.toggleDifficulty(d)}
              >
                {DIFFICULTY_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        {/* Sort bar */}
        <div className="sort-bar">
          <div className="sort-options">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`sort-chip ${sortBy === opt.value ? 'active' : ''}`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="platform-search-links">
            <span style={{ fontSize: 11, color: '#9ca3af', marginRight: 4 }}>外部搜索:</span>
            {(['bilibili', 'xiaohongshu', 'douyin'] as Platform[]).map((p) => (
              <button
                key={p}
                className="platform-search-link"
                onClick={() => handlePlatformSearch(p)}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="app-content">
          <div className="result-count">
            {loading ? '搜索中...' : `共 ${displayedCourses.length} 个课程`}
            {learnedCount > 0 && ` · 已学习 ${learnedCount} 门`}
          </div>

          {loading && displayedCourses.length === 0 ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : displayedCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <p>没有找到匹配的课程</p>
              <div className="empty-state-hint">试试更换筛选条件，或使用"外部搜索"在平台上搜索</div>
            </div>
          ) : (
            <div className="course-grid">
              {displayedCourses.map((course) => {
                const bvId = course.bvId || extractBvId(course.url)
                return (
                  <div
                    key={course.id}
                    className="course-card"
                    onClick={() => setSelectedCourse(course)}
                  >
                    <div className="card-thumbnail">
                      {course.thumbnailURL ? (
                        <img
                          src={course.thumbnailURL}
                          alt={course.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="card-thumbnail-placeholder">
                          {bvId ? '🎬' : '📹'}
                        </div>
                      )}
                      {course.duration != null && (
                        <span className="card-thumbnail-overlay">{formatDuration(course.duration)}</span>
                      )}
                    </div>
                    <div className="card-body">
                      <div className="card-header">
                        <div className="card-title">{course.title}</div>
                        <button
                          className="card-fav"
                          onClick={(e) => { e.stopPropagation(); toggleFav(course.id) }}
                          title={isFavorite(course.id) ? '取消收藏' : '收藏'}
                        >
                          {isFavorite(course.id) ? '⭐' : '☆'}
                        </button>
                      </div>
                      <div className="card-meta">
                        <span className={`platform-badge platform-${course.platform}`}>
                          {PLATFORM_LABELS[course.platform]}
                        </span>
                        <span className="author">{course.author}</span>
                        {course.playCount != null && course.playCount > 0 && (
                          <span className="play-count">{formatPlayCount(course.playCount)}</span>
                        )}
                      </div>
                      <div className="card-desc">{course.description}</div>
                      <div className="card-footer">
                        <span className={`diff-badge diff-${course.difficulty}`}>
                          {DIFFICULTY_LABELS[course.difficulty]}
                        </span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{CATEGORY_LABELS[course.category]}</span>
                        {getLevel(course.id) > 0 && (
                          <span
                            className="prof-badge"
                            onClick={(e) => {
                              e.stopPropagation()
                              const current = getLevel(course.id)
                              const idx = PROF_VALUES.indexOf(current as typeof PROF_VALUES[number])
                              const next = idx >= 0 && idx < PROF_VALUES.length - 1 ? PROF_VALUES[idx + 1] : 0
                              setLevel(course.id, next)
                            }}
                          >
                            {getLevel(course.id) >= 100 ? '🏆' : getLevel(course.id) >= 70 ? '🎯' : getLevel(course.id) >= 50 ? '📖' : '👀'}
                            {getLevel(course.id)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedCourse && (
          <div className="detail-overlay" onClick={() => setSelectedCourse(null)}>
            <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
              <div className="detail-header">
                <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>课程详情</span>
                <button className="detail-close" onClick={() => setSelectedCourse(null)}>✕</button>
              </div>
              <div className="detail-body">
                {/* Cover Image */}
                {selectedCourse.thumbnailURL && (
                  <div className="detail-cover">
                    <img
                      src={selectedCourse.thumbnailURL}
                      alt={selectedCourse.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                {/* Player */}
                {currentBvId ? (
                  <div className="detail-player-wrapper">
                    <iframe
                      src={`https://player.bilibili.com/player.html?bvid=${currentBvId}&page=1&high_quality=1&autoplay=0`}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="detail-no-player">
                    {selectedCourse.platform !== 'bilibili' ? `${PLATFORM_LABELS[selectedCourse.platform]} 暂不支持内嵌播放` : '暂无播放源'}
                  </div>
                )}

                <div className="detail-title">{selectedCourse.title}</div>

                <div className="detail-stats">
                  {selectedCourse.playCount != null && selectedCourse.playCount > 0 && (
                    <span className="detail-stat">▶ {formatPlayCount(selectedCourse.playCount)}</span>
                  )}
                  {selectedCourse.favorites != null && selectedCourse.favorites > 0 && (
                    <span className="detail-stat">⭐ {selectedCourse.favorites} 收藏</span>
                  )}
                  <span className="detail-stat">🕐 {formatDuration(selectedCourse.duration)}</span>
                </div>

                <div className="detail-meta">
                  <span className={`platform-badge platform-${selectedCourse.platform}`}>
                    {PLATFORM_LABELS[selectedCourse.platform]}
                  </span>
                  <span className={`diff-badge diff-${selectedCourse.difficulty}`}>
                    {DIFFICULTY_LABELS[selectedCourse.difficulty]}
                  </span>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>
                    {CATEGORY_LABELS[selectedCourse.category]}
                  </span>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>
                    UP主: {selectedCourse.author}
                  </span>
                </div>

                <div className="detail-desc">{selectedCourse.description}</div>

                {selectedCourse.tags.length > 0 && (
                  <>
                    <div className="detail-section-title">技能标签</div>
                    <div className="detail-tags">
                      {selectedCourse.tags.map((tag) => (
                        <span key={tag} className="card-tag">{tag}</span>
                      ))}
                    </div>
                  </>
                )}

                <div className="detail-section-title">掌握程度</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PROFICIENCY_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      className={`filter-chip ${getLevel(selectedCourse.id) === l.value ? 'active' : ''}`}
                      onClick={() => setLevel(selectedCourse.id, l.value)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Watch link */}
                {currentBvId ? (
                  <a
                    className="detail-link"
                    href={selectedCourse.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.preventDefault(); openExternalLink(selectedCourse.url) }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    在 {PLATFORM_LABELS[selectedCourse.platform]} 上观看
                  </a>
                ) : (
                  <button
                    className="detail-link"
                    style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                    onClick={() => handlePlatformSearch(selectedCourse.platform)}
                  >
                    在 {PLATFORM_LABELS[selectedCourse.platform]} 搜索相关教程
                  </button>
                )}

                {/* Cross-platform search links */}
                <div className="detail-section-title">在其他平台搜索</div>
                <div className="detail-platform-links">
                  {ALL_PLATFORMS.filter((p) => p !== selectedCourse.platform).map((p) => (
                    <button
                      key={p}
                      className="detail-platform-link"
                      style={{ cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                      onClick={() => handlePlatformSearch(p)}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
