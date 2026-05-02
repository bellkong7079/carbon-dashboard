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

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="flex flex-col w-60 min-h-screen bg-gray-900 border-r border-gray-800">
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-emerald-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">C</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Carbon Dashboard</p>
            <p className="text-[10px] text-gray-400">PCF 탄소 관리 플랫폼</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
              pathname === href
                ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-600">GHG Protocol 기준</p>
        <p className="text-[10px] text-gray-600">Scope 2 / Scope 3</p>
      </div>
    </aside>
  )
}
