/**
 * Sistema de Recategorização Automática
 *
 * Permite recategorizar transações existentes baseado em:
 * - Correções manuais do usuário
 * - Padrões aprendidos
 * - Merchant/descrição similar
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface SimilarTransaction {
  id: string
  description: string
  merchant: string | null
  amount: number
  date: string
  category_id: string | null
  category_name?: string
  category_icon?: string
}

export interface RecategorizeResult {
  success: boolean
  updated: number
  errors: number
  message?: string
}

// =====================================================
// BUSCAR TRANSAÇÕES SIMILARES
// =====================================================

/**
 * Buscar transações similares por merchant
 */
export async function findSimilarTransactionsByMerchant(
  merchant: string,
  excludeId?: string
): Promise<SimilarTransaction[]> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const query = supabase
      .from('transactions')
      .select(`
        id,
        description,
        merchant,
        amount,
        date,
        category_id,
        categories:category_id (
          name,
          icon
        )
      `)
      .eq('user_id', user.id)
      .eq('merchant', merchant)
      .order('date', { ascending: false })
      .limit(100)

    if (excludeId) {
      query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error

    return (
      data?.map((tx: any) => ({
        id: tx.id,
        description: tx.description,
        merchant: tx.merchant,
        amount: tx.amount,
        date: tx.date,
        category_id: tx.category_id,
        category_name: tx.categories?.name,
        category_icon: tx.categories?.icon,
      })) || []
    )
  } catch (error) {
    console.error('Error finding similar transactions:', error)
    return []
  }
}

/**
 * Buscar transações similares por descrição
 */
export async function findSimilarTransactionsByDescription(
  description: string,
  excludeId?: string
): Promise<SimilarTransaction[]> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    // Extrair palavras-chave da descrição (palavras com 4+ caracteres)
    const keywords = description
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length >= 4)
      .slice(0, 3) // Primeiras 3 palavras significativas

    if (keywords.length === 0) return []

    // Buscar transações que contenham qualquer keyword
    const pattern = keywords.join('|')

    const query = supabase
      .from('transactions')
      .select(`
        id,
        description,
        merchant,
        amount,
        date,
        category_id,
        categories:category_id (
          name,
          icon
        )
      `)
      .eq('user_id', user.id)
      .ilike('description', `%${keywords[0]}%`)
      .order('date', { ascending: false })
      .limit(100)

    if (excludeId) {
      query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) throw error

    return (
      data?.map((tx: any) => ({
        id: tx.id,
        description: tx.description,
        merchant: tx.merchant,
        amount: tx.amount,
        date: tx.date,
        category_id: tx.category_id,
        category_name: tx.categories?.name,
        category_icon: tx.categories?.icon,
      })) || []
    )
  } catch (error) {
    console.error('Error finding similar transactions by description:', error)
    return []
  }
}

/**
 * Buscar todas as transações similares (merchant OU descrição)
 */
export async function findAllSimilarTransactions(
  merchant: string | null,
  description: string,
  excludeId?: string
): Promise<{
  byMerchant: SimilarTransaction[]
  byDescription: SimilarTransaction[]
  total: number
}> {
  const byMerchant = merchant
    ? await findSimilarTransactionsByMerchant(merchant, excludeId)
    : []

  const byDescription = await findSimilarTransactionsByDescription(
    description,
    excludeId
  )

  // Remover duplicatas (por ID)
  const merchantIds = new Set(byMerchant.map((t) => t.id))
  const uniqueByDescription = byDescription.filter((t) => !merchantIds.has(t.id))

  const total = byMerchant.length + uniqueByDescription.length

  return {
    byMerchant,
    byDescription: uniqueByDescription,
    total,
  }
}

// =====================================================
// RECATEGORIZAR EM LOTE
// =====================================================

/**
 * Recategorizar múltiplas transações
 */
export async function recategorizeTransactions(
  transactionIds: string[],
  newCategoryId: string
): Promise<RecategorizeResult> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, updated: 0, errors: 0, message: 'Não autenticado' }
    }

    // Atualizar todas as transações
    const { error, count } = await supabase
      .from('transactions')
      .update({ category_id: newCategoryId })
      .in('id', transactionIds)
      .eq('user_id', user.id)

    if (error) throw error

    // Revalidate paths
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')

    return {
      success: true,
      updated: count || 0,
      errors: 0,
      message: `${count || 0} transações recategorizadas com sucesso!`,
    }
  } catch (error: any) {
    console.error('Error recategorizing transactions:', error)
    return {
      success: false,
      updated: 0,
      errors: transactionIds.length,
      message: error.message || 'Erro ao recategorizar',
    }
  }
}

/**
 * Recategorizar por merchant
 */
export async function recategorizeByMerchant(
  merchant: string,
  newCategoryId: string
): Promise<RecategorizeResult> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, updated: 0, errors: 0, message: 'Não autenticado' }
    }

    // Atualizar todas as transações com este merchant
    const { error, count } = await supabase
      .from('transactions')
      .update({ category_id: newCategoryId })
      .eq('user_id', user.id)
      .eq('merchant', merchant)

    if (error) throw error

    // Revalidate paths
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')

    return {
      success: true,
      updated: count || 0,
      errors: 0,
      message: `${count || 0} transações de "${merchant}" recategorizadas!`,
    }
  } catch (error: any) {
    console.error('Error recategorizing by merchant:', error)
    return {
      success: false,
      updated: 0,
      errors: 0,
      message: error.message || 'Erro ao recategorizar',
    }
  }
}

// =====================================================
// APLICAR PADRÕES APRENDIDOS
// =====================================================

/**
 * Aplicar todos os padrões aprendidos às transações existentes
 */
export async function applyLearnedPatterns(): Promise<RecategorizeResult> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, updated: 0, errors: 0, message: 'Não autenticado' }
    }

    // Buscar padrões aprendidos com alta confiança
    const { data: patterns } = await supabase
      .from('learned_patterns')
      .select('*')
      .eq('user_id', user.id)
      .gte('confidence_score', 0.7) // Só padrões com 70%+ confiança

    if (!patterns || patterns.length === 0) {
      return {
        success: true,
        updated: 0,
        errors: 0,
        message: 'Nenhum padrão aprendido encontrado',
      }
    }

    let totalUpdated = 0
    let totalErrors = 0

    // Aplicar cada padrão
    for (const pattern of patterns) {
      try {
        let query = supabase
          .from('transactions')
          .update({ category_id: pattern.category_id })
          .eq('user_id', user.id)

        // Filtrar por merchant se houver
        if (pattern.merchant) {
          query = query.eq('merchant', pattern.merchant)
        }

        // Filtrar por descrição se houver
        if (pattern.description_pattern) {
          query = query.ilike('description', `%${pattern.description_pattern}%`)
        }

        const { error, count } = await query

        if (error) {
          totalErrors++
        } else {
          totalUpdated += count || 0

          // Incrementar times_applied
          await supabase.rpc('increment_pattern_usage', {
            pattern_id: pattern.id,
            pattern_type: 'category',
          })
        }
      } catch (err) {
        totalErrors++
      }
    }

    // Revalidate paths
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')

    return {
      success: totalUpdated > 0,
      updated: totalUpdated,
      errors: totalErrors,
      message: `${totalUpdated} transações recategorizadas usando ${patterns.length} padrões aprendidos!`,
    }
  } catch (error: any) {
    console.error('Error applying learned patterns:', error)
    return {
      success: false,
      updated: 0,
      errors: 0,
      message: error.message || 'Erro ao aplicar padrões',
    }
  }
}

/**
 * Obter estatísticas de padrões aprendidos
 */
export async function getLearnedPatternsStats(): Promise<{
  totalPatterns: number
  highConfidence: number
  lowConfidence: number
  patterns: Array<{
    id: string
    merchant: string | null
    description_pattern: string | null
    category_name: string
    category_icon: string
    times_applied: number
    confidence_score: number
  }>
}> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { totalPatterns: 0, highConfidence: 0, lowConfidence: 0, patterns: [] }
    }

    const { data: patterns } = await supabase
      .from('learned_patterns')
      .select(`
        id,
        merchant,
        description_pattern,
        times_applied,
        confidence_score,
        categories:category_id (
          name,
          icon
        )
      `)
      .eq('user_id', user.id)
      .order('times_applied', { ascending: false })

    if (!patterns) {
      return { totalPatterns: 0, highConfidence: 0, lowConfidence: 0, patterns: [] }
    }

    const highConfidence = patterns.filter((p) => p.confidence_score >= 0.7).length
    const lowConfidence = patterns.filter((p) => p.confidence_score < 0.7).length

    return {
      totalPatterns: patterns.length,
      highConfidence,
      lowConfidence,
      patterns: patterns.map((p: any) => ({
        id: p.id,
        merchant: p.merchant,
        description_pattern: p.description_pattern,
        category_name: p.categories?.name || 'Unknown',
        category_icon: p.categories?.icon || '❓',
        times_applied: p.times_applied,
        confidence_score: p.confidence_score,
      })),
    }
  } catch (error) {
    console.error('Error getting learned patterns stats:', error)
    return { totalPatterns: 0, highConfidence: 0, lowConfidence: 0, patterns: [] }
  }
}
