import type { Course } from '@shared/types'
import ContinueLearning from './ContinueLearning'
import RecommendedList from './RecommendedList'
import CourseGrid from '../course/CourseGrid'

interface HomePageProps {
  courses: Course[]
  loading: boolean
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

      {/* Full course grid below blocks */}
      <section style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)', marginBottom: 12 }}>📚 全部课程</h3>
        <CourseGrid
          courses={props.courses}
          loading={props.loading}
          favoriteIds={props.favoriteIds}
          proficiency={props.proficiency}
          onToggleFav={props.onToggleFav}
          onSelect={props.onSelect}
          onDelete={props.onDelete}
          onProgressClick={props.onProgressClick}
        />
      </section>
    </div>
  )
}
