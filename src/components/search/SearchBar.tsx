interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  showSuggestions: boolean
  suggestionLoading: boolean
  onSelectSuggestion: (title: string) => void
  onBlur: () => void
  onFocus: () => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  suggestions,
  showSuggestions,
  suggestionLoading,
  onSelectSuggestion,
  onBlur,
  onFocus,
  placeholder = '搜索课程或粘贴B站/小红书链接...',
}: SearchBarProps) {
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 16px 10px 42px',
          border: '1.5px solid var(--color-border)',
          borderRadius: 10,
          fontSize: 14,
          background: 'var(--color-bg)',
          color: 'var(--color-text)',
          outline: 'none',
          fontFamily: 'var(--font-sans)',
          transition: 'all 0.2s',
        }}
      />
      {showSuggestions && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 50,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {suggestionLoading ? (
            <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--color-text-muted)' }}>
              搜索建议加载中...
            </div>
          ) : (
            suggestions.map((s) => (
              <div
                key={s}
                onMouseDown={() => onSelectSuggestion(s)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--color-text)',
                  borderBottom: '1px solid var(--color-border-light)',
                }}
              >
                {s}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
