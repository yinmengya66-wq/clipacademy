interface EmptyStateProps {
  icon?: string
  message?: string
  hint?: string
}

export default function EmptyState({
  icon = '🔍',
  message = '没有找到匹配的课程',
  hint = '试试更换筛选条件，或使用外部搜索',
}: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.6 }}>{icon}</div>
      <p style={{ fontSize: 14, marginBottom: 8 }}>{message}</p>
      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{hint}</div>
    </div>
  )
}
