/**
 * Server Actions para Templates de Transações
 *
 * Permite criar templates reutilizáveis para transações recorrentes.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface CreateTemplateData {
  name: string
  description?: string
  icon?: string
  account_id: string
  category_id: string
  transaction_type: 'income' | 'expense'
  amount: number
  currency: string
  merchant?: string
  notes?: string
  tags?: string[]
}

export interface Template {
  id: string
  user_id: string
  name: string
  description?: string
  icon?: string
  account_id: string
  category_id: string
  transaction_type: 'income' | 'expense'
  amount: number
  currency: string
  merchant?: string
  notes?: string
  tags?: string[]
  times_used: number
  last_used_at?: string
  created_at: string
  updated_at: string
  account?: {
    id: string
    name: string
    icon: string
    currency: string
  }
  category?: {
    id: string
    name: string
    icon: string
    color: string
  }
}

/**
 * Criar novo template
 */
export async function createTemplate(data: CreateTemplateData) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Não autenticado' }
    }

    const { data: template, error } = await supabase
      .from('transaction_templates')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
        icon: data.icon,
        account_id: data.account_id,
        category_id: data.category_id,
        transaction_type: data.transaction_type,
        amount: data.amount,
        currency: data.currency,
        merchant: data.merchant,
        notes: data.notes,
        tags: data.tags,
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar template:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/transactions')

    return { success: true, template }
  } catch (error) {
    console.error('Erro ao criar template:', error)
    return { error: 'Erro ao criar template' }
  }
}

/**
 * Buscar todos os templates do usuário
 */
export async function getTemplates() {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Não autenticado' }
    }

    const { data: templates, error } = await supabase
      .from('transaction_templates')
      .select(
        `
        *,
        account:accounts(id, name, icon, currency),
        category:categories(id, name, icon, color)
      `
      )
      .eq('user_id', user.id)
      .order('times_used', { ascending: false })

    if (error) {
      console.error('Erro ao buscar templates:', error)
      return { error: error.message }
    }

    return { templates: templates as Template[] }
  } catch (error) {
    console.error('Erro ao buscar templates:', error)
    return { error: 'Erro ao buscar templates' }
  }
}

/**
 * Deletar template
 */
export async function deleteTemplate(templateId: string) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Não autenticado' }
    }

    const { error } = await supabase
      .from('transaction_templates')
      .delete()
      .eq('id', templateId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar template:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/transactions')

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar template:', error)
    return { error: 'Erro ao deletar template' }
  }
}

/**
 * Usar template para criar transação
 */
export async function useTemplate(templateId: string, customData?: Partial<CreateTemplateData>) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Não autenticado' }
    }

    // Buscar template
    const { data: template, error: templateError } = await supabase
      .from('transaction_templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single()

    if (templateError || !template) {
      return { error: 'Template não encontrado' }
    }

    // Criar transação usando dados do template (mesclando com customData se fornecido)
    const transactionData = {
      user_id: user.id,
      account_id: customData?.account_id || template.account_id,
      category_id: customData?.category_id || template.category_id,
      transaction_type: customData?.transaction_type || template.transaction_type,
      amount: customData?.amount || template.amount,
      currency: customData?.currency || template.currency,
      description: customData?.description || template.name,
      date: new Date().toISOString().split('T')[0], // Hoje
      merchant: customData?.merchant || template.merchant,
      notes: customData?.notes || template.notes,
      tags: customData?.tags || template.tags,
      is_internal_transfer: false,
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (transactionError) {
      console.error('Erro ao criar transação:', transactionError)
      return { error: transactionError.message }
    }

    // Atualizar saldo da conta
    const { data: account } = await supabase
      .from('accounts')
      .select('balance')
      .eq('id', transactionData.account_id)
      .single()

    if (account) {
      const newBalance =
        transactionData.transaction_type === 'income'
          ? account.balance + transactionData.amount
          : account.balance - transactionData.amount

      await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', transactionData.account_id)
    }

    // Incrementar contador de uso do template
    await supabase.rpc('increment_template_usage', { template_id: templateId })

    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')

    return { success: true, transaction }
  } catch (error) {
    console.error('Erro ao usar template:', error)
    return { error: 'Erro ao criar transação a partir do template' }
  }
}

/**
 * Atualizar template
 */
export async function updateTemplate(templateId: string, data: Partial<CreateTemplateData>) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Não autenticado' }
    }

    const { error } = await supabase
      .from('transaction_templates')
      .update({
        name: data.name,
        description: data.description,
        icon: data.icon,
        account_id: data.account_id,
        category_id: data.category_id,
        transaction_type: data.transaction_type,
        amount: data.amount,
        currency: data.currency,
        merchant: data.merchant,
        notes: data.notes,
        tags: data.tags,
      })
      .eq('id', templateId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao atualizar template:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/transactions')

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar template:', error)
    return { error: 'Erro ao atualizar template' }
  }
}
