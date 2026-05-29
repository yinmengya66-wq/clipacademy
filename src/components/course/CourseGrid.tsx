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
