/**
 * Página de Orçamentos
 */

import DashboardLayout from '@/components/layout/DashboardLayout'

export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Orçamentos
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Planeje e acompanhe seus gastos mensais
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <div className="text-6xl">🎯</div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Em breve
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sistema de orçamentos em desenvolvimento
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
