<template>
  <div class="msg" :class="`msg--${message.role}`">
    <!-- System message -->
    <div v-if="message.role === 'system'" class="msg-system">
      <p class="msg-system__text">{{ message.content }}</p>
      <span v-if="message.source === 'escalated'" class="msg-system__badge">
        <svg class="msg-system__badge-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        {{ t('support.message.escalated') }}
      </span>
    </div>

    <!-- User message -->
    <div v-else-if="message.role === 'user'" class="msg-user">
      <div class="msg-user__bubble">{{ message.content }}</div>
      <p class="msg__time msg__time--end">{{ formatTime(message.timestamp) }}</p>
    </div>

    <!-- Assistant message -->
    <div v-else class="msg-assistant">
      <div class="msg-assistant__bubble">
        <div v-if="sourceBadgeClass" class="msg-assistant__badges">
          <span class="msg-assistant__badge" :class="sourceBadgeClass">{{ sourceLabel }}</span>
        </div>

        <p class="msg-assistant__text">{{ message.content }}</p>

        <div v-if="message.needsConfirmation && !message.confirmed" class="msg-assistant__confirm">
          <span class="msg-assistant__confirm-label">{{ t('support.message.helpful') }}</span>
          <div class="msg-assistant__confirm-actions">
            <button
              type="button"
              class="msg-assistant__btn msg-assistant__btn--yes"
              @click="$emit('confirm', message.ticketId, true)"
            >
              <svg class="msg-assistant__btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              {{ t('support.message.yes') }}
            </button>
            <button
              type="button"
              class="msg-assistant__btn msg-assistant__btn--no"
              @click="$emit('confirm', message.ticketId, false)"
            >
              <svg class="msg-assistant__btn-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                <path d="M6 18 18 6M6 6l12 12" />
              </svg>
              {{ t('support.message.no') }}
            </button>
          </div>
        </div>

        <div v-if="message.confirmed" class="msg-assistant__confirmed">
          <svg class="msg-assistant__confirmed-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="m9 12.75 2.25 2.25L15 9.75" />
          </svg>
          {{ t('support.message.confirmed') }}
        </div>
      </div>
      <p class="msg__time">{{ formatTime(message.timestamp) }}</p>
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
    case 'faq': return 'src--faq'
    case 'gemini': return 'src--gemini'
    case 'groq': return 'src--groq'
    case 'admin': return 'src--admin'
    default: return ''
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

<style scoped>
.msg {
  width: 100%;
}

/* System */
.msg-system {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.6875rem 0.875rem;
  border: 1px solid color-mix(in srgb, var(--asa-indigo) 25%, var(--asa-card-ring));
  border-radius: 0.875rem;
  background: var(--asa-indigo-soft);
  text-align: center;
}

.msg-system__text {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--asa-indigo);
  font-weight: 500;
}

.msg-system__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-indigo);
  opacity: 0.85;
}

.msg-system__badge-svg {
  width: 0.8125rem;
  height: 0.8125rem;
}

/* User */
.msg-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-inline-start: auto;
  max-width: 85%;
}

.msg-user__bubble {
  padding: 0.625rem 0.875rem;
  border-radius: 1.125rem;
  border-start-start-radius: 1.125rem;
  border-start-end-radius: 0.375rem;
  background: linear-gradient(135deg, var(--asa-accent), color-mix(in srgb, var(--asa-accent) 82%, var(--asa-accent-deep)));
  color: #fff;
  font-size: 0.8125rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  box-shadow: 0 6px 14px -6px color-mix(in srgb, var(--asa-accent) 55%, transparent);
}

/* Assistant */
.msg-assistant {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 85%;
}

.msg-assistant__bubble {
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.125rem;
  border-start-end-radius: 1.125rem;
  border-start-start-radius: 0.375rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.msg-assistant__badges {
  margin-bottom: 0.5rem;
}

.msg-assistant__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.src--faq {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.src--gemini {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

:global(.dark) .src--gemini {
  color: var(--asa-accent);
}

.src--groq {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.src--admin {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.msg-assistant__text {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label);
  white-space: pre-wrap;
  word-break: break-word;
}

/* Confirm */
.msg-assistant__confirm {
  margin-top: 0.75rem;
  padding-top: 0.6875rem;
  border-top: 1px solid var(--asa-sep);
}

.msg-assistant__confirm-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.msg-assistant__confirm-actions {
  display: flex;
  gap: 0.375rem;
}

.msg-assistant__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: filter 0.2s var(--ease-default);
}

.msg-assistant__btn:hover {
  filter: brightness(0.96);
}

.msg-assistant__btn:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}

.msg-assistant__btn--yes {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.msg-assistant__btn--no {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

:global(.dark) .msg-assistant__btn:hover {
  filter: brightness(1.15);
}

.msg-assistant__btn-svg {
  width: 0.8125rem;
  height: 0.8125rem;
}

/* Confirmed */
.msg-assistant__confirmed {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  margin-top: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-green);
}

.msg-assistant__confirmed-svg {
  width: 0.8125rem;
  height: 0.8125rem;
}

/* Time */
.msg__time {
  margin-top: 0.1875rem;
  font-size: 0.625rem;
  color: var(--asa-label-3);
}

.msg__time--end {
  text-align: end;
}
</style>