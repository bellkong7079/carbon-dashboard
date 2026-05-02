interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function Header({ title, description, action }: HeaderProps) {
  return (
    <div
      style={{
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-faint)',
        flexShrink: 0,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 600,
            fontSize: 18,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
              fontSize: 11,
              color: 'var(--text-muted)',
              marginTop: 1,
            }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
