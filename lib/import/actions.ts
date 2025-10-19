/**
 * Server Actions - Import de Extratos Bancários
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { detectBank, parseFile, validateFile, type BankName, type ParsedTransaction } from './parsers'
import { checkDuplicate, checkDuplicatesBatch } from './duplicate-detection'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// =====================================================
// TIPOS
// =====================================================

export interface ImportPreview {
  bank: BankName
  fileName: string
  totalTransactions: number
  transactions: PreviewTransaction[]
  duplicateCount: number
  error?: string
}

export interface PreviewTransaction extends ParsedTransaction {
  isDuplicate: boolean
  suggestedCategoryId?: string
  suggestedCategoryName?: string
  confidence?: number
}

export interface ImportResult {
  success: boolean
  importedCount: number
  duplicateCount: number
  errorCount: number
  errors?: string[]
}

// =====================================================
// STEP 1: PREVIEW IMPORT
// =====================================================

/**
 * Preview do import - parseia arquivo e sugere categorizações
 */
export async function previewImport(
  accountId: string,
  fileName: string,
  fileContent: string
): Promise<ImportPreview> {
  const supabase = await createClient()

  try {
    // 1. Get user ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 2. Detect bank
    const detection = detectBank(fileContent, fileName)
    if (detection.bank === 'unknown') {
      return {
        bank: 'unknown',
        fileName,
        totalTransactions: 0,
        transactions: [],
        duplicateCount: 0,
        error: 'Não foi possível identificar o banco. Formato não reconhecido.',
      }
    }

    // 3. Validate file
    const validation = validateFile(fileContent, detection.bank)
    if (!validation.valid) {
      return {
        bank: detection.bank,
        fileName,
        totalTransactions: 0,
        transactions: [],
        duplicateCount: 0,
        error: validation.error,
      }
    }

    // 4. Parse transactions
    const parsed = parseFile(fileContent, detection.bank)

    // 5. Check duplicates
    const duplicateChecks = await checkDuplicatesBatch(user.id, accountId, parsed)

    // 6. Get categories
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, icon, type, user_id')
      .or(`user_id.is.null,user_id.eq.${user.id}`)

    const categoriesMap = new Map(categories?.map((c) => [c.id, c]) || [])

    // 7. Get learned patterns
    const { data: learnedPatterns } = await supabase
      .from('learned_patterns')
      .select('*')
      .eq('user_id', user.id)
      .gte('confidence_score', 0.5) // Só padrões com confiança >= 50%

    // 8. Suggest categorization para cada transação
    const previewTransactions: PreviewTransaction[] = []
    let duplicateCount = 0

    for (let i = 0; i < parsed.length; i++) {
      const tx = parsed[i]
      const dupCheck = duplicateChecks.get(i)
      const isDuplicate = dupCheck?.isDuplicate || false

      if (isDuplicate) duplicateCount++

      // Tentar categoria aprendida primeiro
      let suggestedCategoryId: string | undefined
      let suggestedCategoryName: string | undefined
      let confidence: number | undefined

      const learned = findLearnedCategory(tx, learnedPatterns || [])
      if (learned) {
        suggestedCategoryId = learned.category_id
        const cat = categoriesMap.get(learned.category_id)
        suggestedCategoryName = cat?.name
        confidence = learned.confidence_score
      }

      previewTransactions.push({
        ...tx,
        isDuplicate,
        suggestedCategoryId,
        suggestedCategoryName,
        confidence,
      })
    }

    // 9. Se não tem categorias aprendidas suficientes, usar Claude AI
    const needsAI = previewTransactions.filter((tx) => !tx.isDuplicate && !tx.suggestedCategoryId)
    if (needsAI.length > 0 && needsAI.length <= 50) {
      // Só usar AI se for <= 50 transações para não gastar muitos tokens
      const aiSuggestions = await categorizeBatchWithClaude(
        needsAI,
        categories || []
      )

      // Aplicar sugestões do Claude
      aiSuggestions.forEach((suggestion, index) => {
        const txIndex = previewTransactions.findIndex(
          (t) => !t.isDuplicate && !t.suggestedCategoryId && t === needsAI[index]
        )
        if (txIndex >= 0 && suggestion.categoryId) {
          previewTransactions[txIndex].suggestedCategoryId = suggestion.categoryId
          previewTransactions[txIndex].suggestedCategoryName = suggestion.categoryName || undefined
          previewTransactions[txIndex].confidence = suggestion.confidence
        }
      })
    }

    return {
      bank: detection.bank,
      fileName,
      totalTransactions: parsed.length,
      transactions: previewTransactions,
      duplicateCount,
    }
  } catch (error: any) {
    console.error('Error in previewImport:', error)
    return {
      bank: 'unknown',
      fileName,
      totalTransactions: 0,
      transactions: [],
      duplicateCount: 0,
      error: error.message || 'Erro desconhecido',
    }
  }
}

// =====================================================
// STEP 2: CONFIRM AND IMPORT
// =====================================================

/**
 * Confirmar e importar transações
 */
export async function confirmImport(
  accountId: string,
  transactions: PreviewTransaction[],
  fileName: string,
  bankName: BankName
): Promise<ImportResult> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let importedCount = 0
    let duplicateCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Criar batch record
    const { data: batch, error: batchError } = await supabase
      .from('import_batches')
      .insert({
        user_id: user.id,
        bank_name: bankName,
        file_name: fileName,
        file_type: fileName.endsWith('.ofx') ? 'ofx' : 'csv',
        total_transactions: transactions.length,
        status: 'processing',
      })
      .select()
      .single()

    if (batchError) throw batchError

    // Importar cada transação
    for (const tx of transactions) {
      // Pular duplicatas
      if (tx.isDuplicate) {
        duplicateCount++
        continue
      }

      try {
        // Criar transação
        const { error: txError } = await supabase.from('transactions').insert({
          user_id: user.id,
          account_id: accountId,
          category_id: tx.suggestedCategoryId || null,
          transaction_type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          description: tx.description,
          merchant: tx.merchant,
          notes: tx.notes,
          date: tx.date,
          tags: [],
        })

        if (txError) {
          errorCount++
          errors.push(`${tx.description}: ${txError.message}`)
        } else {
          importedCount++
        }
      } catch (err: any) {
        errorCount++
        errors.push(`${tx.description}: ${err.message}`)
      }
    }

    // Atualizar batch
    await supabase
      .from('import_batches')
      .update({
        status: errorCount > 0 ? 'completed' : 'completed',
        imported_count: importedCount,
        duplicate_count: duplicateCount,
        error_count: errorCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', batch.id)

    return {
      success: errorCount === 0,
      importedCount,
      duplicateCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    }
  } catch (error: any) {
    console.error('Error in confirmImport:', error)
    return {
      success: false,
      importedCount: 0,
      duplicateCount: 0,
      errorCount: transactions.length,
      errors: [error.message],
    }
  }
}

// =====================================================
// APRENDIZADO - SALVAR CORREÇÕES DO USUÁRIO
// =====================================================

/**
 * Salvar correção de categoria feita pelo usuário
 * E retornar transações similares para recategorização
 */
export async function learnCategoryCorrection(
  merchant: string | undefined,
  description: string,
  correctedCategoryId: string
): Promise<{
  learned: boolean
  similarCount: number
  similarTransactionIds?: string[]
}> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { learned: false, similarCount: 0 }

    // Upsert learned pattern
    const { error: learnError } = await supabase.from('learned_patterns').upsert({
      user_id: user.id,
      merchant: merchant || null,
      description_pattern: extractPattern(description),
      category_id: correctedCategoryId,
      times_applied: 1,
      confidence_score: 1.0,
    })

    if (learnError) {
      console.error('Error upserting learned pattern:', learnError)
      return { learned: false, similarCount: 0 }
    }

    // Buscar transações similares já importadas
    let query = supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .neq('category_id', correctedCategoryId) // Só as que ainda não têm a categoria correta

    if (merchant) {
      query = query.eq('merchant', merchant)
    } else {
      // Buscar por descrição similar
      const pattern = extractPattern(description)
      if (pattern) {
        query = query.ilike('description', `%${pattern}%`)
      }
    }

    const { data: similar, error: similarError } = await query.limit(100)

    if (similarError) {
      console.error('Error finding similar transactions:', similarError)
      return { learned: true, similarCount: 0 }
    }

    return {
      learned: true,
      similarCount: similar?.length || 0,
      similarTransactionIds: similar?.map((t) => t.id) || [],
    }
  } catch (error) {
    console.error('Error learning category correction:', error)
    return { learned: false, similarCount: 0 }
  }
}

/**
 * Salvar correção de transferência interna
 */
export async function learnTransferCorrection(
  description: string,
  isInternalTransfer: boolean,
  targetAccountId?: string
): Promise<void> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('learned_transfers').upsert({
      user_id: user.id,
      description_pattern: extractPattern(description),
      is_internal_transfer: isInternalTransfer,
      target_account_id: targetAccountId || null,
      times_applied: 1,
      confidence_score: 1.0,
    })
  } catch (error) {
    console.error('Error learning transfer correction:', error)
  }
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Buscar categoria aprendida baseado no merchant/descrição
 */
function findLearnedCategory(tx: ParsedTransaction, patterns: any[]): any | null {
  for (const pattern of patterns) {
    // Match por merchant
    if (pattern.merchant && tx.merchant) {
      if (
        pattern.merchant.toLowerCase() === tx.merchant.toLowerCase() ||
        tx.merchant.toLowerCase().includes(pattern.merchant.toLowerCase())
      ) {
        return pattern
      }
    }

    // Match por descrição
    if (pattern.description_pattern) {
      const descLower = tx.description.toLowerCase()
      const patternLower = pattern.description_pattern.toLowerCase()
      if (descLower.includes(patternLower)) {
        return pattern
      }
    }
  }

  return null
}

/**
 * Extrair padrão de uma descrição (primeiras palavras significativas)
 */
function extractPattern(description: string): string {
  const words = description
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3) // Palavras com mais de 3 letras
    .slice(0, 3) // Primeiras 3 palavras

  return words.join(' ')
}

/**
 * Categorizar lote com Claude AI
 */
async function categorizeBatchWithClaude(
  transactions: ParsedTransaction[],
  categories: any[]
): Promise<
  Array<{
    categoryId: string | null
    categoryName: string | null
    confidence: number
  }>
> {
  try {
    const categoriesList = categories
      .map((c) => `- ${c.id}: ${c.name} (${c.type})`)
      .join('\n')

    const transactionsList = transactions
      .map(
        (tx, i) =>
          `${i + 1}. ${tx.description} | ${tx.merchant || 'N/A'} | €${tx.amount} | ${tx.type}`
      )
      .join('\n')

    const prompt = `Você é um especialista em categorização de transações bancárias.

Categorias disponíveis:
${categoriesList}

Transações para categorizar:
${transactionsList}

Para cada transação, sugira o ID da categoria mais adequada.
Responda APENAS com um JSON array neste formato exato:
[
  {"index": 1, "categoryId": "uuid-aqui", "confidence": 0.95},
  {"index": 2, "categoryId": "uuid-aqui", "confidence": 0.80}
]

Regras:
- confidence deve estar entre 0.0 e 1.0
- Se não tiver certeza, use confidence < 0.7
- Considere o merchant e a descrição para escolher a categoria
- Se for claramente uma transferência interna, use null para categoryId`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Parse JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('Claude response not in expected format:', responseText)
      return transactions.map(() => ({
        categoryId: null,
        categoryName: null,
        confidence: 0,
      }))
    }

    const suggestions = JSON.parse(jsonMatch[0])
    const categoriesMap = new Map(categories.map((c) => [c.id, c]))

    return transactions.map((_, index) => {
      const suggestion = suggestions.find((s: any) => s.index === index + 1)
      if (!suggestion) {
        return { categoryId: null, categoryName: null, confidence: 0 }
      }

      const category = categoriesMap.get(suggestion.categoryId)
      return {
        categoryId: suggestion.categoryId,
        categoryName: category?.name || null,
        confidence: suggestion.confidence || 0,
      }
    })
  } catch (error) {
    console.error('Error categorizing with Claude:', error)
    return transactions.map(() => ({
      categoryId: null,
      categoryName: null,
      confidence: 0,
    }))
  }
}
