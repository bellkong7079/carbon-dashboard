interface InsightBannerProps {
  message: string
  level: 'info' | 'warning' | 'critical'
}

const styles = {
  critical: {
    bg: 'rgba(127,29,29,0.25)',
    border: '1px solid rgba(239,68,68,0.25)',
    lBorder: '#ef4444',
    text: '#fca5a5',
  },
  warning: {
    bg: 'rgba(120,53,15,0.25)',
    border: '1px solid rgba(251,146,60,0.25)',
    lBorder: '#f97316',
    text: '#fdba74',
  },
  info: {
    bg: 'rgba(6,78,59,0.25)',
    border: '1px solid rgba(52,211,153,0.25)',
    lBorder: '#34d399',
    text: '#6ee7b7',
  },
}

export default function InsightBanner({ message, level }: InsightBannerProps) {
  const s = styles[level] ?? styles.info
  return (
    <div
      style={{
        borderRadius: '0 8px 8px 0',
        background: s.bg,
        border: s.border,
        borderLeft: `3px solid ${s.lBorder}`,
        padding: '12px 20px',
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontWeight: 500,
          color: s.text,
        }}
      >
        {message}
      </p>
      <p
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
          color: 'var(--text-muted)',
          marginTop: 3,
        }}
      >
        GHG Protocol Scope 3 기준 · 배출계수 v2024.1 적용
      </p>
    </div>
  )
}
