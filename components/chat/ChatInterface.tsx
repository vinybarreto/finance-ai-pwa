/**
 * Chat Interface - Componente principal
 *
 * Interface completa do chat com IA
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import Message from './Message'
import TypingIndicator from './TypingIndicator'
import QuickCommands from './QuickCommands'
import { sendMessage } from '@/lib/ai/chat'

interface MessageType {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatInterfaceProps {
  conversationId: string | null
  initialMessages: MessageType[]
  onConversationCreated?: (id: string) => void
}

export default function ChatInterface({
  conversationId: initialConversationId,
  initialMessages,
  onConversationCreated,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  // Enviar mensagem
  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Adicionar mensagem do usuário imediatamente
    const newUserMessage: MessageType = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newUserMessage])
    setLoading(true)

    try {
      const result = await sendMessage(conversationId, userMessage)

      if (result.error) {
        // Mostrar erro como mensagem do assistente
        const errorMessage: MessageType = {
          role: 'assistant',
          content: `❌ Erro: ${result.error}`,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, errorMessage])
      } else if (result.success && result.message) {
        // Adicionar resposta do assistente
        const assistantMessage: MessageType = {
          role: 'assistant',
          content: result.message,
          timestamp: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Atualizar ID da conversa se foi criada
        if (result.conversationId && !conversationId) {
          setConversationId(result.conversationId)
          onConversationCreated?.(result.conversationId)
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMessage: MessageType = {
        role: 'assistant',
        content: '❌ Erro ao processar mensagem. Tente novamente.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Enviar com Enter (Shift+Enter para nova linha)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Executar comando rápido
  const handleQuickCommand = (command: string) => {
    setInput(command)
    // Auto-enviar comando
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Área de mensagens */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-6">
            <div className="text-center">
              <div className="text-6xl">💬</div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
                Olá! Como posso ajudar?
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Faça perguntas sobre suas finanças ou use os comandos rápidos
              </p>
            </div>

            <QuickCommands onCommand={handleQuickCommand} />

            <div className="max-w-md space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium">Exemplos de perguntas:</p>
              <ul className="space-y-1 pl-4">
                <li>• Quanto gastei este mês?</li>
                <li>• Qual foi minha maior despesa?</li>
                <li>• Tenho dinheiro suficiente para comprar um carro?</li>
                <li>• Quais categorias estou gastando mais?</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message
                key={index}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input de mensagem */}
      <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
            disabled={loading}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            style={{ maxHeight: '200px' }}
          />

          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 Dica: Use comandos como <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">/resumo</code>,{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">/insights</code> ou{' '}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-700">/help</code>
        </p>
      </div>
    </div>
  )
}
