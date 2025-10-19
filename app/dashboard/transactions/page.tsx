/**
 * Página de Transações
 */

import DashboardLayout from '@/components/layout/DashboardLayout'
import TransactionsClient from '@/components/transactions/TransactionsClient'
import { createClient } from '@/lib/supabase/server'
import { getTransactions } from '@/lib/transactions/actions'

export default async function TransactionsPage() {
  const supabase = createClient()

  // Buscar contas do usuário
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order')

  // Buscar categorias
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Buscar transações
  const { transactions } = await getTransactions()

  return (
    <DashboardLayout>
      <TransactionsClient
        accounts={accounts || []}
        categories={categories || []}
        initialTransactions={transactions || []}
      />
    </DashboardLayout>
  )
}
