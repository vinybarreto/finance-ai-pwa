'use client'

/**
 * Sidebar - Menu lateral responsivo
 *
 * Features:
 * - Responsivo (collapsible no mobile)
 * - Dark/light theme toggle
 * - Active route highlighting
 * - User profile section
 * - Logout button
 */

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  Target,
  PiggyBank,
  Receipt,
  TrendingUp,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'
import { logout } from '@/lib/auth/actions'

interface SidebarProps {
  user: {
    email: string
    user_metadata: {
      full_name?: string
    }
  }
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Transações',
    href: '/dashboard/transactions',
    icon: ArrowLeftRight,
  },
  {
    name: 'Importar',
    href: '/dashboard/import',
    icon: Upload,
  },
  {
    name: 'Orçamentos',
    href: '/dashboard/budgets',
    icon: Target,
  },
  {
    name: 'Contas a Pagar',
    href: '/dashboard/bills',
    icon: Receipt,
  },
  {
    name: 'Investimentos',
    href: '/dashboard/investments',
    icon: TrendingUp,
  },
  {
    name: 'Caixinhas',
    href: '/dashboard/goals',
    icon: PiggyBank,
  },
  {
    name: 'Chat IA',
    href: '/dashboard/chat',
    icon: MessageSquare,
  },
  {
    name: 'Configurações',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark')
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-lg dark:bg-gray-800 lg:hidden"
      >
        {mobileOpen ? (
          <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 h-screen
          bg-white shadow-xl dark:bg-gray-800
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-20' : 'w-72'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            {!collapsed && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Finance AI
              </h1>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 lg:block"
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* User Info */}
          <div className="border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <User className="h-5 w-5 text-white" />
              </div>
              {!collapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {user.user_metadata.full_name || 'Usuário'}
                  </p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {navigation.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 rounded-lg px-3 py-2.5
                    transition-colors duration-200
                    ${
                      active
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}
                  {active && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              title={collapsed ? 'Alternar tema' : undefined}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 flex-shrink-0" />
              ) : (
                <Sun className="h-5 w-5 flex-shrink-0" />
              )}
              {!collapsed && (
                <span className="text-sm font-medium">
                  {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                </span>
              )}
            </button>

            {/* Logout */}
            <form>
              <button
                formAction={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                title={collapsed ? 'Sair' : undefined}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">Sair</span>}
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}
