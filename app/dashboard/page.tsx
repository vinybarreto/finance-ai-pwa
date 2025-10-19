/**
 * Dashboard Principal
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/auth/actions'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar contas do usuário
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header temporário */}
      <header className="bg-white shadow dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Finance AI
            </h1>
            <form>
              <button
                formAction={logout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bem-vindo, {user.user_metadata.full_name || user.email}! 👋
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Este é seu painel de controle financeiro
          </p>
        </div>

        {/* Suas Contas */}
        <div className="mb-8">
          <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Suas Contas Bancárias
          </h3>

          {accounts && accounts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl">{account.icon}</p>
                      <h4 className="mt-2 font-semibold text-gray-900 dark:text-white">
                        {account.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {account.account_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {account.currency === 'EUR' ? '€' : 'R$'}{' '}
                        {account.balance.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {account.currency}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-yellow-50 p-6 dark:bg-yellow-900/20">
              <p className="text-yellow-800 dark:text-yellow-300">
                Nenhuma conta encontrada. As contas devem ter sido criadas automaticamente
                no signup.
              </p>
            </div>
          )}
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
      </main>
    </div>
  )
}
