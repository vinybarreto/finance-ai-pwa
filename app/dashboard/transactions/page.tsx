/**
 * Página de Transações
 */

import DashboardLayout from '@/components/layout/DashboardLayout'

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Transações
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie todas as suas receitas e despesas
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <div className="text-6xl">💰</div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Em breve
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sistema de transações em desenvolvimento
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
