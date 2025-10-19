/**
 * Sistema de Detecção de Duplicatas
 *
 * Detecta transações duplicadas baseado em:
 * - Data (mesma data)
 * - Valor (mesmo valor absoluto)
 * - Descrição (mesma descrição exata)
 */

import { createClient } from '@/lib/supabase/server'
import type { ParsedTransaction } from './parsers'

export interface DuplicateCheck {
  isDuplicate: boolean
  existingTransactionId?: string
  matchScore: number // 0.0 to 1.0
}

/**
 * Verificar se uma transação é duplicada
 */
export async function checkDuplicate(
  userId: string,
  accountId: string,
  transaction: ParsedTransaction
): Promise<DuplicateCheck> {
  const supabase = await createClient()

  try {
    // Buscar transações na mesma data e com mesmo valor
    const { data: existing, error } = await supabase
      .from('transactions')
      .select('id, description, amount, date, merchant')
      .eq('user_id', userId)
      .eq('account_id', accountId)
      .eq('date', transaction.date)
      .eq('amount', transaction.amount)
      .limit(10)

    if (error) throw error

    if (!existing || existing.length === 0) {
      return { isDuplicate: false, matchScore: 0 }
    }

    // Verificar se alguma tem a mesma descrição exata
    for (const tx of existing) {
      const matchScore = calculateMatchScore(transaction, tx)

      if (matchScore >= 0.95) {
        // 95% de certeza = duplicata
        return {
          isDuplicate: true,
          existingTransactionId: tx.id,
          matchScore,
        }
      }
    }

    // Não encontrou duplicata exata
    return { isDuplicate: false, matchScore: 0 }
  } catch (error) {
    console.error('Error checking duplicate:', error)
    return { isDuplicate: false, matchScore: 0 }
  }
}

/**
 * Calcular score de similaridade entre duas transações
 */
function calculateMatchScore(
  newTx: ParsedTransaction,
  existingTx: any
): number {
  let score = 0

  // 1. Data (obrigatório) - já foi filtrado, então +30%
  score += 0.3

  // 2. Valor (obrigatório) - já foi filtrado, então +30%
  score += 0.3

  // 3. Descrição exata - +40%
  const newDesc = normalize(newTx.description)
  const existingDesc = normalize(existingTx.description)

  if (newDesc === existingDesc) {
    score += 0.4
  } else {
    // Similaridade parcial
    const similarity = stringSimilarity(newDesc, existingDesc)
    score += 0.4 * similarity
  }

  return score
}

/**
 * Normalizar string para comparação
 */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
}

/**
 * Calcular similaridade entre duas strings (Dice Coefficient)
 */
function stringSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0
  if (str1.length < 2 || str2.length < 2) return 0.0

  const bigrams1 = getBigrams(str1)
  const bigrams2 = getBigrams(str2)

  let intersection = 0
  for (const bigram of bigrams1) {
    if (bigrams2.has(bigram)) {
      intersection++
      bigrams2.delete(bigram) // Contar apenas uma vez
    }
  }

  return (2.0 * intersection) / (bigrams1.size + bigrams2.size)
}

/**
 * Extrair bigrams de uma string
 */
function getBigrams(str: string): Set<string> {
  const bigrams = new Set<string>()
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.substring(i, i + 2))
  }
  return bigrams
}

/**
 * Verificar duplicatas em lote
 */
export async function checkDuplicatesBatch(
  userId: string,
  accountId: string,
  transactions: ParsedTransaction[]
): Promise<Map<number, DuplicateCheck>> {
  const results = new Map<number, DuplicateCheck>()

  // Verificar cada transação
  for (let i = 0; i < transactions.length; i++) {
    const check = await checkDuplicate(userId, accountId, transactions[i])
    results.set(i, check)
  }

  return results
}

/**
 * Filtrar transações removendo duplicatas
 */
export function filterDuplicates(
  transactions: ParsedTransaction[],
  duplicateChecks: Map<number, DuplicateCheck>
): {
  unique: ParsedTransaction[]
  duplicates: ParsedTransaction[]
} {
  const unique: ParsedTransaction[] = []
  const duplicates: ParsedTransaction[] = []

  transactions.forEach((tx, index) => {
    const check = duplicateChecks.get(index)
    if (check && check.isDuplicate) {
      duplicates.push(tx)
    } else {
      unique.push(tx)
    }
  })

  return { unique, duplicates }
}
