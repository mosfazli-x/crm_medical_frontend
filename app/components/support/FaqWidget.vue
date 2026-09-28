<template>
  <div class="help-root">
    <!-- Drawer -->
    <aside
      id="help-panel"
      ref="panelRef"
      role="dialog"
      class="help-panel"
      :class="{ 'help-panel--open': isOpen, 'help-panel--drag': isDragging }"
      :style="panelStyle"
      :inert="!isOpen && !isDragging"
      :aria-hidden="!isOpen && !isDragging"
      aria-label="Support & Help"
    >
      <!-- Drag-to-close strip -->
      <div class="help-panel__strip" aria-hidden="true" @pointerdown.prevent="beginDrag($event, true)">
        <i class="help-panel__strip-dots" />
      </div>

      <!-- Header -->
      <header class="help-panel__head">
        <div class="help-panel__brand">
          <span class="asa-tint asa-tint--teal help-panel__brand-icon">
            <FaqIcon class="help-panel__brand-svg" />
          </span>
          <div class="help-panel__brand-copy">
            <h2 class="help-panel__brand-title">{{ t('support.widget.title') }}</h2>
            <p class="help-panel__brand-sub">{{ t('support.widget.subtitle') }}</p>
          </div>
        </div>

        <div class="help-panel__head-actions">
          <button
            v-if="messages.length"
            type="button"
            class="help-iconbtn"
            :title="t('support.widget.clearChat')"
            :aria-label="t('support.widget.clearChat')"
            @click="clearMessages"
          >
            <TrashBin class="help-iconbtn__svg" />
          </button>
          <button
            type="button"
            class="help-iconbtn"
            :aria-label="t('support.launcher.closeLabel')"
            @click="close()"
          >
            <CloseIcon class="help-iconbtn__svg help-iconbtn__svg--stroke" />
          </button>
        </div>
      </header>

      <!-- Segmented tabs -->
      <nav class="help-tabs" aria-label="Support sections">
        <button
          type="button"
          class="help-tabs__btn"
          :class="{ 'help-tabs__btn--on': tab === 'ask' }"
          @click="switchTab('ask')"
        >
          <ChatDots class="help-tabs__icon" />
          {{ t('support.tabs.ask') }}
        </button>
        <button
          type="button"
          class="help-tabs__btn"
          :class="{ 'help-tabs__btn--on': tab === 'guide' }"
          @click="switchTab('guide')"
        >
          <Welcome class="help-tabs__icon" />
          {{ t('support.tabs.guide') }}
        </button>
      </nav>

      <!-- Body -->
      <div class="help-panel__body">
        <!-- Ask tab -->
        <section v-show="tab === 'ask'" class="help-chat">
          <div v-if="messages.length === 0" class="help-welcome">
            <span class="asa-tint asa-tint--teal help-welcome__icon">
              <Bell class="help-welcome__svg" />
            </span>
            <h3 class="help-welcome__title">{{ t('support.widget.welcomeTitle') }}</h3>
            <p class="help-welcome__desc">{{ t('support.widget.welcomeDesc') }}</p>
          </div>

          <div ref="messagesContainer" class="help-msgs">
            <SupportFaqMessageBubble
              v-for="msg in messages"
              :key="msg.id"
              :message="msg"
              @confirm="handleConfirm"
            />

            <div v-if="isLoading" class="help-typing" aria-label="Loading" aria-live="polite">
              <i class="help-typing__dot" style="animation-delay: 0ms" />
              <i class="help-typing__dot" style="animation-delay: 140ms" />
              <i class="help-typing__dot" style="animation-delay: 280ms" />
            </div>
          </div>

          <SupportFaqSuggestedQuestions v-if="messages.length === 0" @select="handleQuickQuestion" />

          <form class="help-input" @submit.prevent="handleSend">
            <div class="help-input__field">
              <input
                ref="inputRef"
                v-model="inputText"
                type="text"
                autocomplete="off"
                :placeholder="t('support.widget.placeholder')"
                :disabled="isLoading"
                :aria-label="t('support.widget.placeholder')"
              >
            </div>
            <button
              type="submit"
              class="help-input__send"
              :disabled="!inputText.trim() || isLoading"
              :aria-label="t('support.tabs.ask')"
            >
              <svg class="help-input__send-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3.478 20.424 21.75 12 3.478 3.576l-.01 6.4L14.25 12 3.47 14.024l.008 6.4Z" />
              </svg>
            </button>
          </form>
        </section>

        <!-- Guide tab -->
        <SupportGuideSection v-show="tab === 'guide'" @start-tour="startTour" @ask="switchTab('ask')" />
      </div>

      <!-- Footer -->
      <footer class="help-panel__foot">
        <span class="help-panel__foot-grip" aria-hidden="true" />
        {{ t('support.launcher.dragHint') }}
      </footer>
    </aside>

    <!-- Launcher (drag handle) -->
    <button
      ref="launcherRef"
      type="button"
      class="help-launcher"
      :class="{ 'help-launcher--hidden': isOpen, 'help-launcher--drag': isDragging }"
      :aria-label="isOpen ? t('support.launcher.closeLabel') : t('support.launcher.label')"
      :aria-expanded="isOpen ? 'true' : 'false'"
      :aria-controls="'help-panel'"
      @pointerdown.prevent="beginDrag($event, false)"
      @click="onLauncherClick"
    >
      <span class="help-launcher__grip" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <FaqIcon class="help-launcher__icon" />
      <span class="help-launcher__label">{{ t('support.launcher.label') }}</span>
      <svg
        class="help-launcher__chevron"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.4"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m15 5-7 7 7 7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import FaqIcon from '~/components/icons/FaqIcon.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import Bell from '~/components/icons/Bell.vue'
import Welcome from '~/components/icons/Welcome.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import CloseIcon from '~/components/icons/X.vue'

const { t } = useI18n()
const { isOpen, open, close, toggle } = useFaqWidget()
const { messages, isLoading, askQuestion, confirmAnswer, clearMessages } = useSupportChat()
const tutorial = useTutorial()

const tab = ref<'ask' | 'guide'>('ask')

const inputText = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

/* ---------- drag-to-open / drag-to-close ---------- */
const isDragging = ref(false)
const dragProg = ref(0)
const panelRef = ref<HTMLElement | null>(null)
const panelWidth = ref(400)
const startX = ref(0)
const startProg = ref(0)
const movedPast = ref(false)
const suppressClick = ref(false)

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

const measurePanel = () => {
  if (panelRef.value) {
    panelWidth.value = Math.max(panelRef.value.offsetWidth, 320)
  }
}

const panelStyle = computed(() => {
  const tx = isDragging.value
    ? panelWidth.value * (1 - dragProg.value)
    : (isOpen.value ? 0 : panelWidth.value)
  return { transform: `translateX(${tx}px)` }
})

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return
  const dx = e.clientX - startX.value
  if (Math.abs(dx) > 6) movedPast.value = true
  dragProg.value = clamp(startProg.value - dx / panelWidth.value, 0, 1)
  e.preventDefault()
}

const cleanup = () => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
}

const onPointerUp = () => stopDrag()
const onPointerCancel = () => {
  suppressClick.value = true
  stopDrag()
}

const stopDrag = () => {
  if (!isDragging.value) return
  isDragging.value = false
  if (dragProg.value >= 0.45) open()
  else close()
  if (movedPast.value) suppressClick.value = true
  dragProg.value = 0
  cleanup()
}

const beginDrag = (e: PointerEvent, fromOpen: boolean) => {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if (isDragging.value) return
  isDragging.value = true
  startX.value = e.clientX
  startProg.value = fromOpen ? 1 : 0
  dragProg.value = startProg.value
  movedPast.value = false
  measurePanel()
  window.addEventListener('pointermove', onPointerMove, { passive: false })
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
}

const onLauncherClick = () => {
  if (suppressClick.value) {
    suppressClick.value = false
    return
  }
  toggle()
}

const startTour = async () => {
  close()
  await nextTick()
  await tutorial.startTutorial()
}

const switchTab = (name: 'ask' | 'guide') => {
  tab.value = name
  if (name === 'ask' && isOpen.value) nextTick(() => inputRef.value?.focus())
}

/* ---------- chat ---------- */
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
    nextTick(() => {
      measurePanel()
      if (tab.value === 'ask') inputRef.value?.focus()
    })
  } else {
    dragProg.value = 0
  }
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) close()
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(measurePanel)
  window.addEventListener('keydown', onKeydown)
  if (typeof ResizeObserver !== 'undefined' && panelRef.value) {
    resizeObserver = new ResizeObserver(measurePanel)
    resizeObserver.observe(panelRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  cleanup()
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.help-root {
  /* fixed children anchored to the physical right edge regardless of dir */
}

/* ============ Launcher ============ */
.help-launcher {
  position: fixed;
  top: 50%;
  right: 0;
  z-index: 2040;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 2.875rem;
  padding: 0.875rem 0 0.875rem;
  border: 1px solid var(--asa-card-ring);
  border-right: none;
  border-radius: 1.125rem 0 0 1.125rem;
  background: color-mix(in srgb, var(--asa-bg-card) 94%, transparent);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  box-shadow: -8px 10px 28px -10px rgba(17, 24, 39, 0.22);
  color: var(--asa-label);
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  transition: opacity 0.28s var(--ease-default), transform 0.35s var(--ease-premium), border-color 0.28s;
  outline: none;
  isolation: isolate;
}

.help-launcher::after {
  content: '';
  position: absolute;
  inset: 1.375rem -1px 1.375rem auto;
  width: 3px;
  border-radius: 99px;
  background: linear-gradient(180deg, var(--asa-accent), color-mix(in srgb, var(--asa-accent) 35%, transparent));
  opacity: 0.75;
}

.help-launcher:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 40%, var(--asa-card-ring));
  background: color-mix(in srgb, var(--asa-bg-card) 98%, transparent);
}

.help-launcher:active {
  cursor: grabbing;
}

.help-launcher:focus-visible {
  border-color: var(--asa-accent);
}

.help-launcher--drag {
  cursor: grabbing;
}

.help-launcher--hidden {
  opacity: 0;
  pointer-events: none;
  transform: translate(16px, -50%);
}

.help-launcher__grip {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.help-launcher__grip i {
  display: block;
  width: 10px;
  height: 2px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--asa-label) 22%, transparent);
  transition: width 0.2s var(--ease-default);
}

.help-launcher:hover .help-launcher__grip i {
  background: color-mix(in srgb, var(--asa-accent) 55%, transparent);
}

.help-launcher__icon {
  width: 1.25rem !important;
  height: 1.25rem !important;
  fill: var(--asa-accent);
}

.help-launcher__label {
  writing-mode: vertical-lr;
  text-orientation: mixed;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--asa-label-2);
}

.help-launcher__chevron {
  width: 1rem;
  height: 1rem;
  color: color-mix(in srgb, var(--asa-accent) 85%, transparent);
  animation: help-pulse-x 1.8s ease-in-out infinite;
}

@keyframes help-pulse-x {
  0%, 100% { transform: translateX(0); opacity: 0.55; }
  50% { transform: translateX(-2px); opacity: 1; }
}

/* ============ Panel ============ */
.help-panel {
  position: fixed;
  top: 0.75rem;
  bottom: 0.75rem;
  right: 0.75rem;
  z-index: 2050;
  width: min(26rem, 94vw);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.375rem;
  background: color-mix(in srgb, var(--asa-bg-card) 97%, transparent);
  backdrop-filter: blur(24px) saturate(1.5);
  -webkit-backdrop-filter: blur(24px) saturate(1.5);
  box-shadow: 0 24px 60px -18px rgba(15, 23, 42, 0.32), 0 4px 14px rgba(15, 23, 42, 0.08);
  color: var(--asa-label);
  visibility: hidden;
  transition: transform 520ms var(--ease-premium), visibility 0s 0.52s;
  will-change: transform;
}

:global(.dark) .help-panel {
  box-shadow: 0 28px 70px -18px rgba(0, 0, 0, 0.7), 0 4px 14px rgba(0, 0, 0, 0.45);
}

.help-panel::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--asa-accent) 45%, transparent), transparent);
  opacity: 0.8;
}

.help-panel--open,
.help-panel--drag {
  visibility: visible;
  transition: transform 520ms var(--ease-premium), visibility 0s 0s;
}

.help-panel--drag {
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .help-panel,
  .help-panel--open,
  .help-panel--drag {
    transition: none;
  }
}

/* Drag-to-close strip */
.help-panel__strip {
  position: absolute;
  inset: 0 auto 0 0;
  width: 1.75rem;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ew-resize;
  touch-action: none;
  opacity: 0;
  transition: opacity 0.25s var(--ease-default);
}

.help-panel--open .help-panel__strip {
  opacity: 1;
}

.help-panel__strip-dots {
  width: 4px;
  height: 4px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--asa-label) 24%, transparent);
  box-shadow: 0 -8px 0 color-mix(in srgb, var(--asa-label) 24%, transparent),
    0 8px 0 color-mix(in srgb, var(--asa-label) 24%, transparent);
}

/* Header */
.help-panel__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.125rem 0.625rem 0;
}

.help-panel__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.help-panel__brand-icon {
  width: 2.625rem;
  height: 2.625rem;
  border-radius: 0.875rem;
  margin-inline-start: 1.375rem;
}

.help-panel__brand-svg {
  width: 1.375rem !important;
  height: 1.375rem !important;
  fill: currentColor;
}

.help-panel__brand-copy {
  min-width: 0;
}

.help-panel__brand-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.help-panel__brand-sub {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.help-panel__head-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.help-iconbtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: 0.6875rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background 0.2s var(--ease-default), color 0.2s var(--ease-default);
}

.help-iconbtn:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.help-iconbtn:active {
  background: color-mix(in srgb, var(--asa-label) 12%, transparent);
}

.help-iconbtn:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}

.help-iconbtn__svg {
  width: 1.0625rem !important;
  height: 1.0625rem !important;
  fill: currentColor;
}

.help-iconbtn__svg--stroke {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

/* Segmented tabs */
.help-tabs {
  display: flex;
  gap: 0.25rem;
  margin-inline: 1.25rem;
  padding: 0.1875rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.help-tabs__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  height: 2.125rem;
  padding: 0 0.75rem;
  border: none;
  border-radius: 0.6875rem;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s var(--ease-default), color 0.2s var(--ease-default), box-shadow 0.2s var(--ease-default);
}

.help-tabs__btn--on {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.08), 0 4px 12px -4px rgba(17, 24, 39, 0.14);
}

.help-tabs__icon {
  width: 1rem !important;
  height: 1rem !important;
  fill: currentColor;
}

.help-tabs__btn:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 1px;
}

/* Body */
.help-panel__body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Ask tab */
.help-chat {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.help-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.375rem;
  padding: 1.375rem 1.5rem 1rem;
}

.help-welcome__icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.375rem;
  margin-bottom: 0.5rem;
}

.help-welcome__svg {
  width: 2rem !important;
  height: 2rem !important;
  fill: currentColor;
}

.help-welcome__title {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
}

.help-welcome__desc {
  max-width: 24rem;
  font-size: 0.8125rem;
  line-height: 1.55;
  color: var(--asa-label-2);
}

.help-msgs {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.375rem 1.25rem 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  scroll-behavior: smooth;
}

.help-typing {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  align-self: flex-start;
  padding: 0.75rem 0.9375rem;
  border-radius: 0.875rem;
  border-top-left-radius: 0.375rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border: 1px solid var(--asa-card-ring);
}

.help-typing__dot {
  width: 6px;
  height: 6px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--asa-label) 35%, transparent);
  animation: help-bounce 1s ease-in-out infinite;
}

@keyframes help-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-3px); opacity: 1; }
}

/* Input */
.help-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem 1.125rem;
  border-top: 1px solid var(--asa-sep);
  margin-top: auto;
}

.help-input__field {
  flex: 1;
  display: flex;
  align-items: center;
  height: 2.75rem;
  padding: 0 0.9375rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  transition: border-color 0.2s var(--ease-default), box-shadow 0.2s var(--ease-default);
}

.help-input__field:focus-within {
  border-color: color-mix(in srgb, var(--asa-accent) 55%, var(--asa-card-ring));
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 16%, transparent);
}

.help-input__field input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.875rem;
  font-family: inherit;
}

.help-input__field input::placeholder {
  color: var(--asa-label-3);
}

.help-input__field input:disabled {
  opacity: 0.6;
}

.help-input__send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  flex-shrink: 0;
  border: none;
  border-radius: 0.875rem;
  background: var(--asa-accent);
  color: #fff;
  cursor: pointer;
  transition: background 0.2s var(--ease-default), transform 0.15s var(--ease-default), opacity 0.2s;
  box-shadow: 0 6px 16px -6px color-mix(in srgb, var(--asa-accent) 60%, transparent);
}

.help-input__send:hover {
  background: color-mix(in srgb, var(--asa-accent) 86%, #000);
  transform: translateY(-1px);
}

:global(.dark) .help-input__send:hover {
  background: color-mix(in srgb, var(--asa-accent) 80%, #fff);
}

.help-input__send:disabled {
  opacity: 0.4;
  cursor: default;
  transform: none;
  box-shadow: none;
}

.help-input__send:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: 2px;
}

.help-input__send-svg {
  width: 1.0625rem;
  height: 1.0625rem;
}

/* Guide tab */
.help-guide {
  flex: 1;
  min-height: 0;
}

/* Footer */
.help-panel__foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.4375rem 1rem 0.6875rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.help-panel__foot-grip {
  width: 22px;
  height: 3px;
  border-radius: 99px;
  background: color-mix(in srgb, var(--asa-label) 20%, transparent);
}
</style>