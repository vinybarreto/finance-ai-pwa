/**
 * Typing Indicator - Loading animation
 *
 * Mostra quando o assistente está "digitando"
 */

'use client'

import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
        <Bot className="h-5 w-5" />
      </div>

      <div className="rounded-2xl bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <div className="flex gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-600" />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-600"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-600"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  )
}
