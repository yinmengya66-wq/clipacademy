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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>📖 继续学习</h3>
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
                  ? `url(${course.thumbnailURL}) center/cover no-repeat`
                  : 'linear-gradient(135deg, #e0e7ff, #ede9fe)',
                marginBottom: 8,
              }} />
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text)' }}>
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
