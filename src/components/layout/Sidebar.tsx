import type { Category } from '@shared/types'
import { CATEGORY_LABELS, ALL_CATEGORIES } from '@shared/types'
import { motion } from 'framer-motion'

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
        width: collapsed ? 48 : 200,
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

      <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <SidebarItem icon="📚" label="全部课程" count={null} active={view === 'all'} onClick={onViewAll} collapsed={collapsed} />
        <SidebarItem icon="⭐" label="我的收藏" count={favoriteCount > 0 ? favoriteCount : null} active={view === 'favorites'} onClick={onViewFavorites} collapsed={collapsed} />
        <SidebarItem icon="📌" label="我的课程" count={userCourseCount > 0 ? userCourseCount : null} active={view === 'user'} onClick={onViewUserCourses} collapsed={collapsed} />

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
        <SidebarItem icon="📖" label="练习中" count={inProgressCount > 0 ? inProgressCount : null} active={view === 'in-progress'} onClick={onViewInProgress} collapsed={collapsed} />
        <SidebarItem icon="🏆" label="已掌握" count={completedCount > 0 ? completedCount : null} active={view === 'completed'} onClick={onViewCompleted} collapsed={collapsed} />
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
    <motion.div
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: collapsed ? '8px 6px' : '8px 12px',
        borderRadius: 6,
        cursor: 'pointer',
        fontSize: collapsed ? 16 : 13,
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        background: active ? 'var(--color-sidebar-active)' : 'transparent',
        transition: 'all 0.15s ease',
        justifyContent: collapsed ? 'center' : undefined,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
      title={collapsed ? label : undefined}
    >
      <span style={{ fontSize: collapsed ? 16 : 14, flexShrink: 0 }}>{icon}</span>
      {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
      {!collapsed && count != null && (
        <span style={{ fontSize: 11, opacity: 0.6 }}>{count}</span>
      )}
    </motion.div>
  )
}
