/**
 * Dashboard Principal
 */

import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Buscar contas do usuário
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order')

  // Calcular saldo total
  const totalBalance = accounts?.reduce((sum, acc) => {
    // Converter BRL para EUR para cálculo (taxa aproximada)
    const balanceInEur =
      acc.currency === 'BRL' ? acc.balance / 5.5 : acc.balance
    return sum + balanceInEur
  }, 0)

  return (
    <DashboardLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bem-vindo, {user.user_metadata.full_name || user.email}! 👋
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Aqui está um resumo das suas finanças
        </p>
      </div>

      {/* Saldo Total */}
      <div className="mb-8">
        <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
          <p className="text-sm font-medium opacity-90">Saldo Total (aprox.)</p>
          <p className="mt-2 text-4xl font-bold">
            € {totalBalance?.toFixed(2) || '0.00'}
          </p>
          <p className="mt-1 text-xs opacity-75">
            Valores em BRL convertidos aproximadamente
          </p>
        </div>
      </div>

      {/* Suas Contas */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Suas Contas Bancárias
        </h2>

        {accounts && accounts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div
                      className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <span className="text-2xl">{account.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {account.name}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {account.account_type === 'checking'
                        ? 'Conta Corrente'
                        : account.account_type}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-700">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {account.currency === 'EUR' ? '€' : 'R$'}{' '}
                    {account.balance.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {account.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
            <p className="text-yellow-800 dark:text-yellow-300">
              Nenhuma conta encontrada. As contas devem ter sido criadas
              automaticamente no signup.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Ações Rápidas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/transactions"
            className="rounded-lg bg-white p-4 text-left shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <div className="text-2xl">💰</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
              Nova Transação
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Lançar receita ou despesa
            </p>
          </Link>

          <Link
            href="/dashboard/chat"
            className="rounded-lg bg-white p-4 text-left shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <div className="text-2xl">💬</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
              Chat com IA
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pergunte sobre suas finanças
            </p>
          </Link>

          <Link
            href="/dashboard/transactions"
            className="rounded-lg bg-white p-4 text-left shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <div className="text-2xl">📊</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
              Relatórios
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Ver análises e gráficos
            </p>
          </Link>

          <Link
            href="/dashboard/goals"
            className="rounded-lg bg-white p-4 text-left shadow transition-shadow hover:shadow-lg dark:bg-gray-800"
          >
            <div className="text-2xl">🎯</div>
            <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
              Metas
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Acompanhar objetivos
            </p>
          </Link>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-lg bg-blue-50 p-6 dark:bg-blue-900/20">
        <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-300">
          🚧 Em Desenvolvimento
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-300">
          Esta é uma versão inicial. Funcionalidades completas em breve:
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-blue-800 dark:text-blue-300">
          <li>Lançamentos de transações</li>
          <li>Chat com IA</li>
          <li>Dashboards e gráficos</li>
          <li>Orçamentos e metas</li>
          <li>Investimentos</li>
        </ul>
      </div>
    </DashboardLayout>
  )
}

