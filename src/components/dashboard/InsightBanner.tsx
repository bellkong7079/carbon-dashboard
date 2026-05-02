interface InsightBannerProps {
  message: string
  level: 'info' | 'warning' | 'critical'
}

const styles = {
  critical: {
    bg: 'bg-red-950/60',
    border: 'border-l-4 border-red-500',
    text: 'text-red-200',
  },
  warning: {
    bg: 'bg-orange-950/60',
    border: 'border-l-4 border-orange-500',
    text: 'text-orange-200',
  },
  info: {
    bg: 'bg-emerald-950/60',
    border: 'border-l-4 border-emerald-500',
    text: 'text-emerald-200',
  },
}

export default function InsightBanner({ message, level }: InsightBannerProps) {
  const s = styles[level]
  return (
    <div className={`${s.bg} ${s.border} rounded-r-lg px-4 py-3`}>
      <p className={`text-sm font-medium ${s.text}`}>{message}</p>
    </div>
  )
}
