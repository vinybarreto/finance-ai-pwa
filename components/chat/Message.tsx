/**
 * Componente de Mensagem do Chat
 *
 * Exibe uma mensagem do usuário ou do assistente.
 */

'use client'

import { User, Bot } from 'lucide-react'

interface MessageProps {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export default function Message({ role, content, timestamp }: MessageProps) {
  const isUser = role === 'user'

  // Formatar timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Processar markdown básico (negrito, código inline, listas)
  const renderContent = (text: string) => {
    const lines = text.split('\n')

    return lines.map((line, index) => {
      let processedLine = line

      // Negrito **texto**
      processedLine = processedLine.replace(
        /\*\*(.+?)\*\*/g,
        '<strong class="font-bold">$1</strong>'
      )

      // Código inline `código`
      processedLine = processedLine.replace(
        /`(.+?)`/g,
        '<code class="rounded bg-gray-200 dark:bg-gray-700 px-1 py-0.5 text-sm font-mono">$1</code>'
      )

      // Lista com -
      if (line.trim().startsWith('-')) {
        processedLine = processedLine.replace(/^-\s/, '• ')
      }

      // Emoji de ícones comuns
      processedLine = processedLine
        .replace(/📊/g, '<span class="text-xl">📊</span>')
        .replace(/💰/g, '<span class="text-xl">💰</span>')
        .replace(/📈/g, '<span class="text-xl">📈</span>')
        .replace(/📉/g, '<span class="text-xl">📉</span>')
        .replace(/🏦/g, '<span class="text-xl">🏦</span>')
        .replace(/🔍/g, '<span class="text-xl">🔍</span>')
        .replace(/🎯/g, '<span class="text-xl">🎯</span>')
        .replace(/📚/g, '<span class="text-xl">📚</span>')

      return (
        <span
          key={index}
          dangerouslySetInnerHTML={{ __html: processedLine }}
          className="block"
        />
      )
    })
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div
        className={`max-w-[80%] space-y-1 ${
          isUser ? 'order-1' : 'order-2'
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
          }`}
        >
          <div className="whitespace-pre-wrap break-words">
            {renderContent(content)}
          </div>
        </div>

        {timestamp && (
          <p
            className={`text-xs text-gray-500 dark:text-gray-400 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {formatTime(timestamp)}
          </p>
        )}
      </div>

      {isUser && (
        <div className="order-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-600 text-white dark:bg-gray-700">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  )
}
