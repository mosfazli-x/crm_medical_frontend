<template>
  <div class="flex" :class="message.role === 'user' ? 'justify-end' : 'justify-start'">
    <!-- System message -->
    <div v-if="message.role === 'system'" class="w-full">
      <div class="rounded-xl bg-blue-50 px-4 py-3 text-center dark:bg-blue-900/20">
        <p class="text-xs text-blue-700 dark:text-blue-300">{{ message.content }}</p>
        <span v-if="message.source === 'escalated'" class="mt-1 inline-flex items-center gap-1 text-[10px] text-blue-500">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {{ t('support.message.escalated') }}
        </span>
      </div>
    </div>

    <!-- User message -->
    <div v-else-if="message.role === 'user'" class="max-w-[85%]">
      <div class="rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5! text-white">
        <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
      </div>
      <p class="mt-1 text-[10px] text-gray-400 dark:text-gray-500 text-end">{{ formatTime(message.timestamp) }}</p>
    </div>

    <!-- Assistant message -->
    <div v-else class="max-w-[85%]">
      <div class="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <!-- Source badge -->
        <div class="mb-2 flex items-center gap-1.5">
          <span
            class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            :class="sourceBadgeClass"
          >
            <svg v-if="message.source === 'faq'" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <svg v-else-if="message.source === 'gemini'" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            <svg v-else-if="message.source === 'groq'" class="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            {{ sourceLabel }}
          </span>
        </div>

        <!-- Answer content -->
        <p class="text-sm leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ message.content }}</p>

        <!-- Confirm button -->
        <div v-if="message.needsConfirmation && !message.confirmed" class="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ t('support.message.helpful') }}</span>
          <button
            @click="$emit('confirm', message.ticketId, true)"
            class="inline-flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
          >
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {{ t('support.message.yes') }}
          </button>
          <button
            @click="$emit('confirm', message.ticketId, false)"
            class="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ t('support.message.no') }}
          </button>
        </div>

        <!-- Confirmed badge -->
        <div v-if="message.confirmed" class="mt-2 flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
          <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ t('support.message.confirmed') }}
        </div>
      </div>
      <p class="mt-1 text-[10px] text-gray-400 dark:text-gray-500">{{ formatTime(message.timestamp) }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const props = defineProps<{ message: ChatMessage }>()
defineEmits<{ confirm: [ticketId: string, helpful: boolean] }>()

const { t, locale } = useI18n()

const sourceBadgeClass = computed(() => {
  switch (props.message.source) {
    case 'faq': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
    case 'gemini': return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    case 'groq': return 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
    case 'admin': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    default: return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
})

const sourceLabel = computed(() => {
  switch (props.message.source) {
    case 'faq': return t('support.source.faq')
    case 'gemini': return t('support.source.gemini')
    case 'groq': return t('support.source.groq')
    case 'admin': return t('support.source.admin')
    default: return ''
  }
})

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>
