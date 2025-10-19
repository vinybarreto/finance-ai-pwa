/**
 * Página de Contas a Pagar/Receber
 */

import DashboardLayout from '@/components/layout/DashboardLayout'

export default function BillsPage() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Contas a Pagar
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie suas contas e compromissos financeiros
        </p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <div className="text-6xl">📋</div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Em breve
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sistema de contas a pagar em desenvolvimento
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
