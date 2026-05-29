import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function getInitialTheme(): 'light' | 'dark' {
  const stored = localStorage.getItem('clipacademy-theme')
  if (stored === 'dark' || stored === 'light') return stored
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('clipacademy-theme', theme)
  }, [theme])

  return (
    <motion.button
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'none',
        border: 'none',
        fontSize: 20,
        cursor: 'pointer',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
        lineHeight: 1,
      }}
      title={theme === 'light' ? '切换暗色模式' : '切换亮色模式'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </motion.button>
  )
}
