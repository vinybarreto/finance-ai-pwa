/**
 * Categorização Automática com Claude AI
 *
 * Usa o Claude API para analisar descrição e estabelecimento
 * de transações e sugerir a categoria mais apropriada.
 */

'use server'

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  parent_id?: string
}

interface CategorizationRequest {
  description: string
  merchant?: string
  amount?: number
  categories: Category[]
}

interface CategorizationResult {
  category_id: string
  category_name: string
  confidence: number
  reasoning: string
  transaction_type: 'income' | 'expense'
}

/**
 * Categorizar transação usando Claude AI
 */
export async function categorizeTransaction(
  request: CategorizationRequest
): Promise<CategorizationResult> {
  try {
    // Preparar lista de categorias para o Claude
    const categoriesList = request.categories
      .map((cat) => `- ${cat.name} (${cat.type}) [ID: ${cat.id}]`)
      .join('\n')

    const prompt = `Você é um assistente especializado em categorização de transações financeiras.

Analise a seguinte transação e determine:
1. Qual é a categoria mais apropriada
2. Se é uma RECEITA (income) ou DESPESA (expense)
3. Nível de confiança na categorização (0-100%)
4. Breve explicação da escolha

TRANSAÇÃO:
- Descrição: ${request.description}
${request.merchant ? `- Estabelecimento: ${request.merchant}` : ''}
${request.amount ? `- Valor: €${request.amount}` : ''}

CATEGORIAS DISPONÍVEIS:
${categoriesList}

IMPORTANTE:
- Se for salário, freelance, investimento → RECEITA
- Se for compra, serviço, conta → DESPESA
- Se mencionar "Continente", "Pingo Doce", "supermercado" → Alimentação
- Se mencionar "combustível", "gasolina", "Galp", "BP" → Transporte
- Se mencionar "Netflix", "Spotify", "HBO" → Entretenimento
- Se mencionar "farmácia", "médico", "hospital" → Saúde
- Se mencionar "aluguel", "condomínio", "água", "luz" → Habitação
- Se mencionar "restaurante", "café", "bar" → Alimentação
- Se mencionar "Uber", "Bolt", "táxi", "autocarro" → Transporte

Responda APENAS com um objeto JSON válido neste formato exato:
{
  "category_id": "ID_DA_CATEGORIA",
  "category_name": "Nome da Categoria",
  "confidence": 95,
  "reasoning": "Breve explicação de 1 linha",
  "transaction_type": "income ou expense"
}`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extrair resposta
    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Resposta inválida do Claude')
    }

    // Parse JSON da resposta
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Não foi possível extrair JSON da resposta')
    }

    const result: CategorizationResult = JSON.parse(jsonMatch[0])

    // Validar categoria existe
    const categoryExists = request.categories.some(
      (cat) => cat.id === result.category_id
    )
    if (!categoryExists) {
      throw new Error('Categoria sugerida não existe')
    }

    return result
  } catch (error) {
    console.error('Erro na categorização:', error)

    // Fallback: categorias padrão
    const defaultCategory = request.categories.find(
      (cat) => cat.name === 'Outros' || cat.name === 'Diversos'
    )

    if (!defaultCategory) {
      throw new Error('Erro na categorização e nenhuma categoria padrão encontrada')
    }

    return {
      category_id: defaultCategory.id,
      category_name: defaultCategory.name,
      confidence: 0,
      reasoning: 'Erro na categorização automática',
      transaction_type: 'expense',
    }
  }
}

/**
 * Categorizar múltiplas transações em lote
 */
export async function categorizeBatch(
  transactions: Array<{
    description: string
    merchant?: string
    amount?: number
  }>,
  categories: Category[]
): Promise<CategorizationResult[]> {
  const results: CategorizationResult[] = []

  for (const transaction of transactions) {
    const result = await categorizeTransaction({
      description: transaction.description,
      merchant: transaction.merchant,
      amount: transaction.amount,
      categories,
    })
    results.push(result)
  }

  return results
}

/**
 * Sugerir tags baseado na transação
 */
export async function suggestTags(
  description: string,
  merchant?: string
): Promise<string[]> {
  try {
    const prompt = `Analise esta transação e sugira 2-3 tags curtas relevantes:

Descrição: ${description}
${merchant ? `Estabelecimento: ${merchant}` : ''}

Exemplos de boas tags:
- "urgente", "parcelado", "presente", "trabalho", "pessoal"
- "essencial", "luxo", "saúde", "educação"
- "mensal", "anual", "única"

Responda APENAS com um array JSON de strings:
["tag1", "tag2", "tag3"]`

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      temperature: 0.5,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return []
    }

    // Parse array JSON
    const arrayMatch = content.text.match(/\[[\s\S]*\]/)
    if (!arrayMatch) {
      return []
    }

    const tags: string[] = JSON.parse(arrayMatch[0])
    return tags.slice(0, 3) // Máximo 3 tags
  } catch (error) {
    console.error('Erro ao sugerir tags:', error)
    return []
  }
}
