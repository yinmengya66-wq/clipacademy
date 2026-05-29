import type { Course } from '@shared/types'
import { PLATFORM_LABELS, DIFFICULTY_LABELS, CATEGORY_LABELS } from '@shared/types'
import { motion } from 'framer-motion'

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

function extractBvId(url: string): string | null {
  const match = url.match(/BV[0-9A-Za-z]{10}/)
  return match ? match[0] : null
}

export default function CourseCard({
  course, isFavorite, progress, onToggleFav, onSelect, onDelete, onProgressClick,
}: CourseCardProps) {
  const bvId = course.bvId || extractBvId(course.url)

  return (
    <motion.div
      className="course-card"
      onClick={() => onSelect(course)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
    >
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
    </motion.div>
  )
}
