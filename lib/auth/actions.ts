/**
 * Server Actions para Autenticação
 *
 * Estas funções rodam no servidor e lidam com login, signup e logout.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Login do usuário
 */
export async function login(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Signup (criar nova conta)
 */
export async function signup(formData: FormData) {
  const supabase = createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        full_name: formData.get('name') as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  // Criar 5 contas bancárias iniciais
  await createUserInitialAccounts()

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Logout do usuário
 */
export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

/**
 * Criar as 5 contas bancárias iniciais do usuário
 * (ACTIVO BANK, REVOLUT, WISE, NOVO BANCO, NUBANK)
 */
async function createUserInitialAccounts() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const accounts = [
    {
      user_id: user.id,
      name: 'ACTIVO BANK',
      account_type: 'checking',
      currency: 'EUR',
      balance: 0,
      icon: '🏦',
      color: '#3b82f6',
      display_order: 1,
    },
    {
      user_id: user.id,
      name: 'REVOLUT',
      account_type: 'checking',
      currency: 'EUR',
      balance: 0,
      icon: '💳',
      color: '#8b5cf6',
      display_order: 2,
    },
    {
      user_id: user.id,
      name: 'WISE',
      account_type: 'checking',
      currency: 'EUR',
      balance: 0,
      icon: '🌍',
      color: '#10b981',
      display_order: 3,
    },
    {
      user_id: user.id,
      name: 'NOVO BANCO',
      account_type: 'checking',
      currency: 'EUR',
      balance: 0,
      icon: '🏛️',
      color: '#f59e0b',
      display_order: 4,
    },
    {
      user_id: user.id,
      name: 'NUBANK',
      account_type: 'checking',
      currency: 'BRL',
      balance: 0,
      icon: '💜',
      color: '#8b5cf6',
      display_order: 5,
    },
  ]

  const { error } = await supabase.from('accounts').insert(accounts)

  if (error) {
    console.error('Erro ao criar contas iniciais:', error)
  }
}
