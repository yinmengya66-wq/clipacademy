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
  const { favoriteIds, toggle: toggleFav } = useFavorites()
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const hiddenIds = useMemo(() => getHiddenCourseIds(), [courses])

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
    switch (view) {
      case 'favorites': return courses.filter((c) => favoriteIds.has(c.id))
      case 'user': return userCourses
      case 'in-progress': return courses.filter((c) => { const p = proficiency[c.id] ?? 0; return p > 0 && p < 100 })
      case 'completed': return courses.filter((c) => (proficiency[c.id] ?? 0) >= 100)
      default:
        if (view.startsWith('cat-')) {
          const cat = view.slice(4) as Category
          return courses.filter((c) => c.category === cat)
        }
        return courses
    }
  }, [courses, view, favoriteIds, proficiency, userCourses])

  const isHomepage = view === 'all' && !filters.keyword && filters.platforms.length === 0 && filters.categories.length === 0 && filters.difficulties.length === 0

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

  const handlePlatformSearch = useCallback((platform: Platform) => {
    const keyword = filters.keyword || CATEGORY_LABELS['basics']
    openExternalLink(getPlatformSearchUrl(platform, keyword))
  }, [filters.keyword])

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

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filter + Sort — always visible */}
          <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ padding: '0 28px' }}>
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
              padding: '8px 28px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderTop: '1px solid var(--color-border-light)',
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
          </div>

          {/* Content: Homepage blocks or filtered/sorted grid */}
          {isHomepage ? (
            <HomePage
              courses={courses}
              loading={loading}
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
        borderRadius: 6,
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
