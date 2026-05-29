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
