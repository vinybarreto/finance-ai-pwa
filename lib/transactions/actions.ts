/**
 * Server Actions para Transações
 *
 * CRUD completo de transações com:
 * - Criar transação
 * - Atualizar saldo da conta automaticamente
 * - Detectar transferências internas
 * - Multi-moeda (EUR/BRL)
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface CreateTransactionData {
  account_id: string
  category_id: string
  transaction_type: 'income' | 'expense' | 'transfer'
  amount: number
  currency: string
  description: string
  date: string
  merchant?: string
  notes?: string
  tags?: string[]
  is_internal_transfer?: boolean
  related_transaction_id?: string
  to_account_id?: string // Para transferências
}

/**
 * Criar nova transação
 */
export async function createTransaction(data: CreateTransactionData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Se for transferência interna, criar 2 transações relacionadas
  if (data.is_internal_transfer && data.to_account_id) {
    return await createInternalTransfer(data, user.id)
  }

  // Criar transação normal
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: data.account_id,
      category_id: data.category_id,
      transaction_type: data.transaction_type,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      date: data.date,
      merchant: data.merchant,
      notes: data.notes,
      tags: data.tags,
      is_internal_transfer: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar transação:', error)
    return { error: error.message }
  }

  // Atualizar saldo da conta
  await updateAccountBalance(data.account_id, data.transaction_type, data.amount)

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')

  return { success: true, transaction }
}

/**
 * Criar transferência interna (2 transações relacionadas)
 */
async function createInternalTransfer(data: CreateTransactionData, userId: string) {
  const supabase = createClient()

  // Transação 1: Saída da conta origem
  const { data: outgoingTx, error: error1 } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      account_id: data.account_id,
      category_id: data.category_id,
      transaction_type: 'expense',
      amount: data.amount,
      currency: data.currency,
      description: `Transferência para ${data.description}`,
      date: data.date,
      notes: data.notes,
      tags: data.tags,
      is_internal_transfer: true,
    })
    .select()
    .single()

  if (error1) {
    console.error('Erro ao criar transação de saída:', error1)
    return { error: error1.message }
  }

  // Transação 2: Entrada na conta destino
  const { data: incomingTx, error: error2 } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      account_id: data.to_account_id!,
      category_id: data.category_id,
      transaction_type: 'income',
      amount: data.amount,
      currency: data.currency,
      description: `Transferência de ${data.description}`,
      date: data.date,
      notes: data.notes,
      tags: data.tags,
      is_internal_transfer: true,
      related_transaction_id: outgoingTx.id,
    })
    .select()
    .single()

  if (error2) {
    console.error('Erro ao criar transação de entrada:', error2)
    // Rollback da primeira transação
    await supabase.from('transactions').delete().eq('id', outgoingTx.id)
    return { error: error2.message }
  }

  // Atualizar o related_transaction_id da primeira transação
  await supabase
    .from('transactions')
    .update({ related_transaction_id: incomingTx.id })
    .eq('id', outgoingTx.id)

  // Atualizar saldos das duas contas
  await updateAccountBalance(data.account_id, 'expense', data.amount)
  await updateAccountBalance(data.to_account_id!, 'income', data.amount)

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')

  return { success: true, transactions: [outgoingTx, incomingTx] }
}

/**
 * Atualizar saldo da conta
 */
async function updateAccountBalance(
  accountId: string,
  transactionType: string,
  amount: number
) {
  const supabase = createClient()

  // Buscar saldo atual
  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('id', accountId)
    .single()

  if (!account) return

  // Calcular novo saldo
  const newBalance =
    transactionType === 'income'
      ? account.balance + amount
      : account.balance - amount

  // Atualizar saldo
  await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId)
}

/**
 * Buscar todas as transações do usuário
 */
export async function getTransactions(filters?: {
  account_id?: string
  category_id?: string
  transaction_type?: string
  start_date?: string
  end_date?: string
  search?: string
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  let query = supabase
    .from('transactions')
    .select(
      `
      *,
      account:accounts(id, name, icon, color, currency),
      category:categories!transactions_category_id_fkey(id, name, icon, color, type)
    `
    )
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  // Aplicar filtros
  if (filters?.account_id) {
    query = query.eq('account_id', filters.account_id)
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.transaction_type) {
    query = query.eq('transaction_type', filters.transaction_type)
  }

  if (filters?.start_date) {
    query = query.gte('date', filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte('date', filters.end_date)
  }

  if (filters?.search) {
    query = query.or(
      `description.ilike.%${filters.search}%,merchant.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
    )
  }

  const { data: transactions, error } = await query

  if (error) {
    console.error('Erro ao buscar transações:', error)
    return { error: error.message }
  }

  return { transactions }
}

/**
 * Deletar transação
 */
export async function deleteTransaction(transactionId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Buscar a transação para reverter o saldo
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .eq('user_id', user.id)
    .single()

  if (!transaction) {
    return { error: 'Transação não encontrada' }
  }

  // Se for transferência interna, deletar ambas
  if (transaction.is_internal_transfer && transaction.related_transaction_id) {
    await supabase
      .from('transactions')
      .delete()
      .eq('id', transaction.related_transaction_id)

    // Reverter saldo da conta relacionada
    const relatedType =
      transaction.transaction_type === 'income' ? 'expense' : 'income'
    await updateAccountBalance(
      transaction.account_id,
      relatedType,
      transaction.amount
    )
  }

  // Reverter saldo da conta
  const reverseType =
    transaction.transaction_type === 'income' ? 'expense' : 'income'
  await updateAccountBalance(
    transaction.account_id,
    reverseType,
    transaction.amount
  )

  // Deletar a transação
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao deletar transação:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/transactions')
  revalidatePath('/dashboard')

  return { success: true }
}
