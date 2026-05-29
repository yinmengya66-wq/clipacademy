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

function extractBvId(url: string): string | null {
  const match = url.match(/BV[0-9A-Za-z]{10}/)
  return match ? match[0] : null
}

const PROF_VALUES = [0, 25, 50, 75, 100]

export default function CourseDetail({
  course, progress, onClose, onSetProgress, onDelete, onPlatformSearch,
}: CourseDetailProps) {
  const bvId = course.bvId || extractBvId(course.url)

  return (
    <div className="detail-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="detail-panel">
        <div className="detail-header">
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 500 }}>课程详情</span>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="detail-body">
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

          <div className="detail-title">{course.title}</div>

          <div className="detail-stats">
            {course.playCount != null && course.playCount > 0 && (
              <span className="detail-stat">▶ {formatPlayCount(course.playCount)}</span>
            )}
            {course.favorites != null && course.favorites > 0 && (
              <span className="detail-stat">⭐ {course.favorites} 收藏</span>
            )}
            <span className="detail-stat">🕐 {formatDuration(course.duration)}</span>
          </div>

          <div className="detail-meta">
            <span className={`platform-badge platform-${course.platform}`}>{PLATFORM_LABELS[course.platform]}</span>
            <span className={`diff-badge diff-${course.difficulty}`}>{DIFFICULTY_LABELS[course.difficulty]}</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{CATEGORY_LABELS[course.category]}</span>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>UP主: {course.author}</span>
          </div>

          <div className="detail-desc">{course.description}</div>

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

          <div className="detail-section-title">学习进度</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => onSetProgress(course.id, Number(e.target.value))}
              style={{ flex: 1, maxWidth: 300, accentColor: 'var(--color-primary)' }}
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

          <div className="detail-section-title">操作</div>
          <button
            className="filter-chip"
            style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)', alignSelf: 'flex-start', padding: '8px 18px', fontSize: 13 }}
            onClick={() => { onDelete(course); onClose() }}
          >
            {course.id.startsWith('user-') ? '删除此课程' : '隐藏此课程'}
          </button>

          {bvId ? (
            <a className="detail-watch-link" href={course.url} target="_blank" rel="noopener noreferrer">
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

          <div className="detail-section-title">在其他平台搜索</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {ALL_PLATFORMS.filter((p) => p !== course.platform).map((p) => (
              <button key={p} className="filter-chip" onClick={() => onPlatformSearch(p)}>
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
