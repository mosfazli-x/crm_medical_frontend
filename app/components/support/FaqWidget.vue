<template>
  <div class="fixed bottom-6 left-6 z-[9999]">
    <!-- Floating Button -->
    <button @click="toggle"
      class="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      :class="isOpen
        ? 'bg-red-500! hover:bg-red-600! shadow-red-500/30!'
        : 'bg-indigo-600! hover:bg-indigo-700! shadow-indigo-600/30!'">
      <svg v-if="!isOpen" class="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else class="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Chat Dialog -->
    <transition name="chat-slide">
      <div v-if="isOpen"
        class="absolute bottom-20 left-0 w-[380px] max-h-[550px] rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900 flex flex-col overflow-hidden"
        :class="locale === 'fa' ? 'origin-bottom-left' : 'origin-bottom-right'">
        <!-- Header -->
        <div class="flex items-center gap-3 bg-indigo-600 px-5 py-4 text-white">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-bold">{{ t('support.widget.title') }}</h3>
            <p class="text-xs text-indigo-200">{{ t('support.widget.subtitle') }}</p>
          </div>
          <button @click="clearMessages" class="rounded-lg p-1.5! hover:bg-white/20 transition-colors"
            :title="t('support.widget.clearChat')">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          style="min-height: 180px; max-height: 350px;">
          <!-- Welcome message -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center py-4 text-center">
            <div
              class="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
              <svg class="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h4 class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">{{ t('support.widget.welcomeTitle') }}
            </h4>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ t('support.widget.welcomeDesc') }}</p>
          </div>

          <!-- Message list -->
          <SupportFaqMessageBubble v-for="msg in messages" :key="msg.id" :message="msg" @confirm="handleConfirm" />

          <!-- Loading indicator -->
          <div v-if="isLoading" class="flex justify-start">
            <div class="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
              <div class="flex gap-1">
                <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 0ms"></div>
                <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 150ms"></div>
                <div class="h-2 w-2 animate-bounce rounded-full bg-gray-400" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Questions -->
        <SupportFaqSuggestedQuestions v-if="messages.length === 0" @select="handleQuickQuestion" />

        <!-- Input -->
        <div class="border-t border-gray-200 p-3 dark:border-gray-700">
          <form @submit.prevent="handleSend" class="flex gap-2 py-1 px-1">
            <input ref="inputRef" v-model="inputText" type="text" :placeholder="t('support.widget.placeholder')"
              class="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5! text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
              :disabled="isLoading" />
            <button type="submit" :disabled="!inputText.trim() || isLoading"
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600! text-white! transition-all hover:bg-indigo-700! disabled:opacity-50 disabled:cursor-not-allowed">
              <svg class="h-4 w-4 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const { isOpen, toggle } = useFaqWidget()
const { messages, isLoading, askQuestion, confirmAnswer, clearMessages } = useSupportChat()

const inputText = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const handleSend = async () => {
  const text = inputText.value.trim()
  if (!text) return
  inputText.value = ''
  await askQuestion(text)
  nextTick(scrollToBottom)
}

const handleQuickQuestion = async (question: string) => {
  await askQuestion(question)
  nextTick(scrollToBottom)
}

const handleConfirm = async (ticketId: string, helpful: boolean) => {
  await confirmAnswer(ticketId, helpful)
  nextTick(scrollToBottom)
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => messages.value.length, () => {
  nextTick(scrollToBottom)
})

watch(isOpen, (val) => {
  if (val) {
    nextTick(() => inputRef.value?.focus())
  }
})
</script>

<style scoped>
.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}
</style>
