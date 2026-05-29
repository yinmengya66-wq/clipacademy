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
    const categoryScores: Record<string, number> = {}
    for (const course of allCourses) {
      const p = proficiency[course.id] ?? 0
      if (p > 0) {
        categoryScores[course.category] = (categoryScores[course.category] ?? 0) + p
      }
    }

    const topCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([cat]) => cat)

    if (topCategories.length === 0) {
      return allCourses
        .filter((c) => !hiddenIds.has(c.id) && (proficiency[c.id] ?? 0) < 100)
        .sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0))
        .slice(0, 6)
    }

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
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>✨ 猜你喜欢</h3>
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
