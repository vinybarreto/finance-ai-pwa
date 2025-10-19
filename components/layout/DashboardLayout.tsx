/**
 * DashboardLayout - Layout principal do dashboard
 *
 * Envolve todas as páginas do dashboard com:
 * - Sidebar responsivo
 * - Área de conteúdo principal
 * - Padding adequado
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect('/login')
  }

  const userForSidebar = {
    email: user.email,
    user_metadata: user.user_metadata,
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar user={userForSidebar} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:ml-72">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
