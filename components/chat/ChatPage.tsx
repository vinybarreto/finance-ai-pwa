/**
 * Chat Page Client Component
 */

'use client'

import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import ChatInterface from './ChatInterface'
import ConversationHistory from './ConversationHistory'
import { getConversations, getConversation } from '@/lib/ai/chat'

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

interface ChatPageClientProps {
  initialConversations: Conversation[]
}

export default function ChatPageClient({
  initialConversations,
}: ChatPageClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>(
    initialConversations
  )
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeMessages, setActiveMessages] = useState<Message[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Carregar conversas
  const loadConversations = async () => {
    const result = await getConversations()
    if (result.conversations) {
      setConversations(result.conversations as Conversation[])
    }
  }

  // Carregar conversa específica
  const handleSelectConversation = async (id: string | null) => {
    setActiveConversationId(id)

    if (id) {
      const result = await getConversation(id)
      if (result.conversation) {
        setActiveMessages(result.conversation.messages as Message[])
      }
    } else {
      setActiveMessages([])
    }
  }

  // Recarregar após criar/deletar conversa
  const handleConversationUpdate = () => {
    loadConversations()
  }

  // Quando uma conversa é criada pelo chat
  const handleConversationCreated = (id: string) => {
    setActiveConversationId(id)
    loadConversations()
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Sidebar Desktop */}
      <div className="hidden w-80 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 lg:block">
        <ConversationHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onConversationDeleted={handleConversationUpdate}
          onConversationCreated={handleConversationUpdate}
        />
      </div>

      {/* Sidebar Mobile (overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800">
            <ConversationHistory
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={handleSelectConversation}
              onConversationDeleted={handleConversationUpdate}
              onConversationCreated={handleConversationUpdate}
              isMobile
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Chat principal */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Header mobile */}
        <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chat com IA
            </h1>
          </div>
        </div>

        {/* Chat interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            conversationId={activeConversationId}
            initialMessages={activeMessages}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>
    </div>
  )
}
