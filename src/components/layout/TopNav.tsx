import type { ReactNode } from 'react'
import ThemeToggle from './ThemeToggle'

interface TopNavProps {
  logo?: string
  children?: ReactNode
}

export default function TopNav({ logo = '剪映学堂', children }: TopNavProps) {
  return (
    <nav
      style={{
        height: 'var(--topnav-height)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        background: 'var(--color-topnav-bg)',
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'var(--backdrop-blur)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontWeight: 800,
          fontSize: 16,
          color: 'var(--color-primary)',
          letterSpacing: '-0.3px',
          flexShrink: 0,
        }}
      >
        {logo}
      </span>
      {children}
      <div style={{ marginLeft: 'auto' }}>
        <ThemeToggle />
      </div>
    </nav>
  )
}
