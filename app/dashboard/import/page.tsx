/**
 * Página de Import de Extratos Bancários
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ImportClient from './ImportClient'

export default async function ImportPage() {
  const supabase = await createClient()

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user accounts
  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('type, name')

  return (
    <DashboardLayout>
      <ImportClient
        accounts={accounts || []}
        categories={categories || []}
      />
    </DashboardLayout>
  )
}
