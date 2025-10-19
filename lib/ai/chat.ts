/**
 * Chat com IA - Server Actions
 *
 * Integração completa com Claude AI para conversar sobre finanças.
 * Features:
 * - Streaming de respostas
 * - Contexto financeiro automático
 * - Comandos especiais
 * - Histórico de conversas
 */

'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  created_at: string
  updated_at: string
}

interface FinancialContext {
  totalBalance: number
  accounts: Array<{ name: string; balance: number; currency: string }>
  recentTransactions: Array<{
    description: string
    amount: number
    type: string
    date: string
    category: string
  }>
  monthlyStats: {
    income: number
    expenses: number
    balance: number
  }
}

/**
 * Buscar contexto financeiro do usuário
 */
async function getFinancialContext(): Promise<FinancialContext> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Usuário não autenticado')
  }

  // Buscar contas
  const { data: accounts } = await supabase
    .from('accounts')
    .select('name, balance, currency')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Buscar transações recentes (últimos 30 dias)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: transactions } = await supabase
    .from('transactions')
    .select(
      `
      description,
      amount,
      transaction_type,
      date,
      category:categories!transactions_category_id_fkey(name)
    `
    )
    .eq('user_id', user.id)
    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: false })
    .limit(50)

  // Calcular estatísticas do mês atual
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const { data: monthlyTransactions } = await supabase
    .from('transactions')
    .select('transaction_type, amount, is_internal_transfer')
    .eq('user_id', user.id)
    .gte('date', firstDayOfMonth.toISOString().split('T')[0])

  const monthlyStats = (monthlyTransactions || []).reduce(
    (acc, tx) => {
      if (tx.is_internal_transfer) return acc

      if (tx.transaction_type === 'income') {
        acc.income += tx.amount
      } else if (tx.transaction_type === 'expense') {
        acc.expenses += tx.amount
      }

      return acc
    },
    { income: 0, expenses: 0, balance: 0 }
  )

  monthlyStats.balance = monthlyStats.income - monthlyStats.expenses

  const totalBalance = (accounts || []).reduce((sum, acc) => sum + acc.balance, 0)

  return {
    totalBalance,
    accounts: accounts || [],
    recentTransactions:
      transactions?.map((tx: any) => ({
        description: tx.description,
        amount: tx.amount,
        type: tx.transaction_type,
        date: tx.date,
        category: tx.category?.name || 'Sem categoria',
      })) || [],
    monthlyStats,
  }
}

/**
 * Formatar contexto financeiro para o Claude
 */
function formatContextForClaude(context: FinancialContext): string {
  const accountsList = context.accounts
    .map((acc) => `- ${acc.name}: ${acc.currency} ${acc.balance.toFixed(2)}`)
    .join('\n')

  const recentTx = context.recentTransactions
    .slice(0, 10)
    .map(
      (tx) =>
        `- ${tx.date}: ${tx.description} (${tx.category}) - ${tx.type === 'income' ? '+' : '-'}€${tx.amount.toFixed(2)}`
    )
    .join('\n')

  return `CONTEXTO FINANCEIRO DO USUÁRIO:

SALDO TOTAL: €${context.totalBalance.toFixed(2)}

CONTAS:
${accountsList}

ESTATÍSTICAS DO MÊS ATUAL:
- Receitas: €${context.monthlyStats.income.toFixed(2)}
- Despesas: €${context.monthlyStats.expenses.toFixed(2)}
- Saldo: €${context.monthlyStats.balance.toFixed(2)}

ÚLTIMAS TRANSAÇÕES:
${recentTx || 'Nenhuma transação recente'}

Use essas informações para responder de forma personalizada e contextualizada.`
}

/**
 * Detectar e processar comandos especiais
 */
function detectCommand(message: string): { isCommand: boolean; command?: string; params?: string } {
  const commandRegex = /^\/(\w+)\s*(.*)?$/
  const match = message.trim().match(commandRegex)

  if (match) {
    return {
      isCommand: true,
      command: match[1],
      params: match[2] || '',
    }
  }

  return { isCommand: false }
}

/**
 * Processar comando especial
 */
async function processCommand(
  command: string,
  params: string,
  context: FinancialContext
): Promise<string> {
  switch (command.toLowerCase()) {
    case 'resumo':
      return `📊 **RESUMO FINANCEIRO**

💰 Saldo Total: €${context.totalBalance.toFixed(2)}

📈 Mês Atual:
- Receitas: €${context.monthlyStats.income.toFixed(2)}
- Despesas: €${context.monthlyStats.expenses.toFixed(2)}
- Saldo: €${context.monthlyStats.balance.toFixed(2)}

🏦 Contas:
${context.accounts.map((acc) => `- ${acc.name}: ${acc.currency} ${acc.balance.toFixed(2)}`).join('\n')}

Use \`/insights\` para ver análises detalhadas ou \`/gastos [categoria]\` para analisar uma categoria específica.`

    case 'gastos':
      const category = params || 'todas as categorias'
      return `Analisando gastos em ${category}... Esta funcionalidade será implementada em breve.`

    case 'insights':
      return `🔍 **INSIGHTS FINANCEIROS**

Analisando seus padrões de gastos e gerando recomendações personalizadas...

Esta funcionalidade de insights avançados será implementada em breve.`

    case 'meta':
      const targetAmount = params || 'não especificado'
      return `🎯 **PLANEJAMENTO DE META**

Meta de: ${targetAmount}

Vou te ajudar a criar um plano para atingir essa meta. Esta funcionalidade será implementada em breve.`

    case 'help':
      return `📚 **COMANDOS DISPONÍVEIS**

- \`/resumo\` - Ver resumo financeiro rápido
- \`/gastos [categoria]\` - Analisar gastos por categoria
- \`/insights\` - Receber insights personalizados
- \`/meta [valor]\` - Criar planejamento de meta
- \`/help\` - Ver esta mensagem

Você também pode fazer perguntas livres sobre suas finanças!`

    default:
      return `Comando \`/${command}\` não reconhecido. Use \`/help\` para ver comandos disponíveis.`
  }
}

/**
 * Enviar mensagem e receber resposta do Claude
 */
export async function sendMessage(conversationId: string | null, userMessage: string) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    // Buscar contexto financeiro
    const context = await getFinancialContext()

    // Verificar se é um comando
    const { isCommand, command, params } = detectCommand(userMessage)

    let assistantMessage: string

    if (isCommand && command) {
      // Processar comando especial
      assistantMessage = await processCommand(command, params || '', context)
    } else {
      // Buscar conversa existente se houver ID
      let messages: Message[] = []

      if (conversationId) {
        const { data: conversation } = await supabase
          .from('ai_conversations')
          .select('messages')
          .eq('id', conversationId)
          .eq('user_id', user.id)
          .single()

        if (conversation) {
          messages = conversation.messages as Message[]
        }
      }

      // Adicionar mensagem do usuário
      const newUserMessage: Message = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString(),
      }

      messages.push(newUserMessage)

      // Preparar mensagens para o Claude
      const claudeMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // System message com contexto financeiro
      const systemMessage = `Você é um assistente financeiro pessoal inteligente e amigável.

SUAS CARACTERÍSTICAS:
- Responda em português do Brasil
- Seja conciso mas completo
- Use emojis quando apropriado
- Forneça insights práticos e acionáveis
- Sempre baseie suas respostas nos dados reais do usuário

${formatContextForClaude(context)}

IMPORTANTE:
- Quando o usuário perguntar sobre saldos, gastos ou transações, use os dados fornecidos acima
- Seja proativo em sugerir melhorias financeiras
- Se não tiver informação suficiente, peça mais detalhes`

      // Chamar Claude API
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemMessage,
        messages: claudeMessages,
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Resposta inválida do Claude')
      }

      assistantMessage = content.text
    }

    // Adicionar resposta do assistente
    const newAssistantMessage: Message = {
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date().toISOString(),
    }

    // Atualizar ou criar conversa
    let finalConversationId = conversationId

    if (conversationId) {
      // Atualizar conversa existente
      const { data: currentConversation } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      const updatedMessages = [
        ...(currentConversation?.messages as Message[]),
        { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
        newAssistantMessage,
      ]

      await supabase
        .from('ai_conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
    } else {
      // Criar nova conversa
      const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '')

      const { data: newConversation } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          messages: [
            { role: 'user', content: userMessage, timestamp: new Date().toISOString() },
            newAssistantMessage,
          ],
          title,
        })
        .select('id')
        .single()

      finalConversationId = newConversation?.id || null
    }

    revalidatePath('/dashboard/chat')

    return {
      success: true,
      message: assistantMessage,
      conversationId: finalConversationId,
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error)
    return { error: 'Erro ao processar mensagem' }
  }
}

/**
 * Buscar todas as conversas do usuário
 */
export async function getConversations() {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('id, title, created_at, updated_at, messages')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar conversas:', error)
      return { error: error.message }
    }

    return { conversations }
  } catch (error) {
    console.error('Erro ao buscar conversas:', error)
    return { error: 'Erro ao buscar conversas' }
  }
}

/**
 * Buscar conversa específica
 */
export async function getConversation(conversationId: string) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    const { data: conversation, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Erro ao buscar conversa:', error)
      return { error: error.message }
    }

    return { conversation }
  } catch (error) {
    console.error('Erro ao buscar conversa:', error)
    return { error: 'Erro ao buscar conversa' }
  }
}

/**
 * Deletar conversa
 */
export async function deleteConversation(conversationId: string) {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao deletar conversa:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/chat')

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar conversa:', error)
    return { error: 'Erro ao deletar conversa' }
  }
}

/**
 * Criar nova conversa vazia
 */
export async function createConversation() {
  try {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Usuário não autenticado' }
    }

    const { data: conversation, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: 'Nova conversa',
        messages: [],
      })
      .select('id')
      .single()

    if (error) {
      console.error('Erro ao criar conversa:', error)
      return { error: error.message }
    }

    revalidatePath('/dashboard/chat')

    return { success: true, conversationId: conversation.id }
  } catch (error) {
    console.error('Erro ao criar conversa:', error)
    return { error: 'Erro ao criar conversa' }
  }
}
