'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListChecks, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/activities', label: '활동 데이터', icon: ListChecks },
  { href: '/api-docs', label: 'API 문서', icon: FileText },
]

function HexIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <polygon
        points="14,2 25,8 25,20 14,26 3,20 3,8"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        fill="none"
      />
      <polygon
        points="14,7 21,11 21,17 14,21 7,17 7,11"
        stroke="var(--color-accent)"
        strokeWidth="0.75"
        fill="rgba(34,211,238,0.06)"
      />
    </svg>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex flex-col"
      style={{
        width: 240,
        minHeight: '100vh',
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border-subtle)',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '20px 20px 18px',
          borderBottom: '1px solid var(--border-faint)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <HexIcon />
        <div>
          <p
            style={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            CARBON
          </p>
          <p
            style={{
              fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
              fontWeight: 300,
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
            }}
          >
            DASHBOARD
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md transition-all duration-150 relative',
                'text-sm'
              )}
              style={{
                padding: '9px 12px',
                marginBottom: 2,
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontWeight: active ? 500 : 400,
                fontSize: 13,
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'var(--bg-elevated)' : 'transparent',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                borderRadius: 6,
                position: 'relative',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 2,
                    height: 16,
                    background: 'var(--color-accent)',
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}
              <Icon
                size={15}
                style={{ color: active ? 'var(--color-accent)' : 'var(--text-secondary)' }}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer Badge */}
      <div
        style={{
          padding: '12px 16px 16px',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 6,
          }}
        >
          배출계수 버전
        </p>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            borderRadius: 4,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <span
            className="animate-pulse"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-success)',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontFamily: 'var(--font-dm-mono), DM Mono, monospace',
              color: 'var(--text-secondary)',
            }}
          >
            v2024.1
          </span>
        </div>
      </div>
    </aside>
  )
}
