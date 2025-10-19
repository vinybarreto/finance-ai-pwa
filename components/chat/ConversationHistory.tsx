/**
 * Conversation History - Sidebar com histórico
 *
 * Lista de conversas passadas
 */

'use client'

import { useState } from 'react'
import { Plus, Trash2, MessageSquare, ChevronLeft, Search } from 'lucide-react'
import { deleteConversation, createConversation } from '@/lib/ai/chat'

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

interface ConversationHistoryProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string | null) => void
  onConversationDeleted?: () => void
  onConversationCreated?: () => void
  isMobile?: boolean
  onClose?: () => void
}

export default function ConversationHistory({
  conversations,
  activeConversationId,
  onSelectConversation,
  onConversationDeleted,
  onConversationCreated,
  isMobile = false,
  onClose,
}: ConversationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  // Filtrar conversas por busca
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Criar nova conversa
  const handleNewConversation = async () => {
    onSelectConversation(null)
    if (onConversationCreated) {
      onConversationCreated()
    }
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Deletar conversa
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Deseja realmente deletar esta conversa?')) return

    setDeleting(id)

    const result = await deleteConversation(id)

    if (result.success) {
      // Se a conversa deletada era a ativa, limpar seleção
      if (activeConversationId === id) {
        onSelectConversation(null)
      }
      if (onConversationDeleted) {
        onConversationDeleted()
      }
    } else {
      alert('Erro ao deletar conversa: ' + result.error)
    }

    setDeleting(null)
  }

  // Selecionar conversa
  const handleSelect = (id: string) => {
    onSelectConversation(id)
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } else if (diffDays === 1) {
      return 'Ontem'
    } else if (diffDays < 7) {
      return `${diffDays} dias atrás`
    } else {
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
      })
    }
  }

  return (
    <div className="flex h-full flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversas
          </h2>
          {isMobile && (
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        <button
          onClick={handleNewConversation}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          Nova Conversa
        </button>

        {/* Busca */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar conversas..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {searchTerm
                ? 'Nenhuma conversa encontrada'
                : 'Nenhuma conversa ainda'}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {searchTerm
                ? 'Tente outra busca'
                : 'Clique em "Nova Conversa" para começar'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => {
              const isActive = activeConversationId === conversation.id
              const isDeleting = deleting === conversation.id

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleSelect(conversation.id)}
                  className={`group relative cursor-pointer rounded-lg p-3 transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  } ${isDeleting ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3
                        className={`truncate text-sm font-medium ${
                          isActive
                            ? 'text-blue-900 dark:text-blue-100'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {conversation.title}
                      </h3>
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {conversation.messages.length} mensagens
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(conversation.updated_at)}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleDelete(conversation.id, e)}
                      disabled={isDeleting}
                      className="shrink-0 rounded-lg p-1.5 text-gray-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      title="Deletar conversa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {isActive && (
                    <div className="absolute left-0 top-0 h-full w-1 rounded-r bg-blue-600" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
