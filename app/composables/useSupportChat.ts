interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  source?: 'faq' | 'gemini' | 'groq' | 'escalated' | 'admin'
  ticketId?: string
  needsConfirmation?: boolean
  confirmed?: boolean
  timestamp: Date
}

export const useSupportChat = () => {
  const { apiFetch } = useApi()
  const { locale } = useI18n()

  const messages = useState<ChatMessage[]>('support-chat-messages', () => [])
  const isLoading = useState('support-chat-loading', () => false)
  const lastTicketId = useState<string | null>('support-last-ticket-id', () => null)

  const askQuestion = async (question: string, category?: string) => {
    if (!question.trim()) return

    // Add user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    }
    messages.value = [...messages.value, userMsg]

    isLoading.value = true
    try {
      const result = await apiFetch('/api/support/ask', {
        method: 'POST',
        body: {
          question,
          language: locale.value === 'fa' ? 'fa' : 'en',
          category,
        },
      }) as {
        success: boolean
        data: {
          ticket: { id: string }
          source: string
          answer: string | null
          confidence: number | null
          needsConfirmation?: boolean
          escalated?: boolean
        }
      }

      const data = result.data

      if (data.answer) {
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.answer,
          source: data.source as any,
          ticketId: data.ticket.id,
          needsConfirmation: data.needsConfirmation,
          timestamp: new Date(),
        }
        messages.value = [...messages.value, assistantMsg]
        lastTicketId.value = data.ticket.id
      } else if (data.escalated) {
        const systemMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content: locale.value === 'fa'
            ? 'سوال شما به پشتیبانی انسانی ارسال شد. به زودی پاسخ دریافت خواهید کرد.'
            : 'Your question has been escalated to human support. You will receive an answer shortly.',
          source: 'escalated',
          ticketId: data.ticket.id,
          timestamp: new Date(),
        }
        messages.value = [...messages.value, systemMsg]
        lastTicketId.value = data.ticket.id
      }
    } catch (error: any) {
      console.error('Support ask error:', error)
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: locale.value === 'fa'
          ? 'خطا در ارسال سوال. لطفاً دوباره تلاش کنید.'
          : 'Error sending question. Please try again.',
        timestamp: new Date(),
      }
      messages.value = [...messages.value, errorMsg]
    } finally {
      isLoading.value = false
    }
  }

  const confirmAnswer = async (ticketId: string, helpful: boolean, feedback?: string) => {
    try {
      const result = await apiFetch('/api/support/confirm', {
        method: 'POST',
        body: { ticket_id: ticketId, helpful, feedback },
      }) as { success: boolean; data: { message: string } }

      // Update the message to show confirmed
      messages.value = messages.value.map(msg =>
        msg.ticketId === ticketId
          ? { ...msg, confirmed: true, needsConfirmation: false }
          : msg,
      )

      const confirmMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: helpful
          ? (locale.value === 'fa'
            ? 'پاسخ شما ثبت شد و برای تأیید مدیر ارسال شد.'
            : 'Your answer has been submitted for admin approval.')
          : (locale.value === 'fa'
            ? 'متأسفیم که پاسخ مفید نبود. سوال شما به پشتیبانی ارسال شد.'
            : 'Sorry the answer wasn\'t helpful. Your question has been escalated.'),
        timestamp: new Date(),
      }
      messages.value = [...messages.value, confirmMsg]

      return result.data
    } catch {
      return null
    }
  }

  const clearMessages = () => {
    messages.value = []
    lastTicketId.value = null
  }

  return {
    messages,
    isLoading,
    lastTicketId,
    askQuestion,
    confirmAnswer,
    clearMessages,
  }
}
