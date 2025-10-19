/**
 * Página de Chat com IA
 */

import DashboardLayout from '@/components/layout/DashboardLayout'
import ChatPageClient from '@/components/chat/ChatPage'
import { getConversations } from '@/lib/ai/chat'

export default async function ChatPage() {
  // Buscar conversas no servidor
  const result = await getConversations()
  const conversations = result.conversations || []

  return (
    <DashboardLayout>
      <ChatPageClient initialConversations={conversations} />
    </DashboardLayout>
  )
}
