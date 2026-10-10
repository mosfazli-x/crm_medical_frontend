<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- Offline indicator -->
      <Transition name="pwa-status">
        <div v-if="!online" class="pwa-offline" :dir="dir" role="status" aria-live="polite">
          <Icon name="lucide:wifi-off" size="15" />
          <span>{{ t('pwa.offline') }}</span>
        </div>
      </Transition>

      <!-- Update available -->
      <Transition name="pwa-status">
        <div v-if="needRefresh" class="pwa-update" :dir="dir" role="alert">
          <span class="pwa-update__icon"><Icon name="lucide:sparkles" size="18" /></span>
          <div class="pwa-update__copy">
            <strong>{{ t('pwa.updateTitle') }}</strong>
            <small>{{ t('pwa.updateDesc') }}</small>
          </div>
          <button type="button" class="pwa-update__btn" @click="applyUpdate">
            {{ t('pwa.update') }}
          </button>
          <button
            type="button"
            class="pwa-update__close"
            :aria-label="t('pwa.later')"
            @click="dismissUpdate"
          >
            <Icon name="lucide:x" size="16" />
          </button>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const { t, locale } = useI18n()
const { $pwa } = useNuxtApp()

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

const online = ref(true)
const needRefresh = computed(() => $pwa?.needRefresh ?? false)

function goOnline() {
  online.value = true
}
function goOffline() {
  online.value = false
}

onMounted(() => {
  online.value = navigator.onLine
  window.addEventListener('online', goOnline)
  window.addEventListener('offline', goOffline)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', goOnline)
  window.removeEventListener('offline', goOffline)
})

async function applyUpdate() {
  await $pwa?.updateServiceWorker(true)
}

async function dismissUpdate() {
  await $pwa?.cancelPrompt()
}
</script>

<style scoped>
.pwa-offline {
  position: fixed;
  z-index: 9998;
  top: calc(0.75rem + env(safe-area-inset-top, 0px));
  inset-inline-start: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.9rem;
  border-radius: 999px;
  background: #b45309;
  color: #fff7ed;
  font-size: 0.78rem;
  font-weight: 600;
  box-shadow: 0 12px 30px -12px rgba(180, 83, 9, 0.8);
}

.pwa-update {
  position: fixed;
  z-index: 9998;
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  inset-inline-end: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: min(26rem, calc(100vw - 2.5rem));
  padding: 0.7rem 0.75rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 20px 50px -20px rgba(15, 23, 42, 0.4);
}

.pwa-update__icon {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.7rem;
  background: rgba(95, 143, 235, 0.14);
  color: #3b6fd4;
}

.pwa-update__copy {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.pwa-update__copy strong {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
}

.pwa-update__copy small {
  font-size: 0.72rem;
  color: #64748b;
}

.pwa-update__btn {
  flex-shrink: 0;
  padding: 0.5rem 0.85rem;
  border: 0;
  border-radius: 0.7rem;
  background: linear-gradient(135deg, #5f8feb, #0ea5e9);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.pwa-update__btn:hover {
  filter: brightness(1.05);
}

.pwa-update__close {
  flex-shrink: 0;
  display: inline-grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  border-radius: 0.55rem;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.pwa-update__close:hover {
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
}

:global(.dark) .pwa-update {
  background: #1b2436;
  border-color: rgba(255, 255, 255, 0.08);
}

:global(.dark) .pwa-update__copy strong {
  color: #f1f5f9;
}

:global(.dark) .pwa-update__copy small {
  color: #94a3b8;
}

:global(.dark) .pwa-update__close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.pwa-status-enter-active,
.pwa-status-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.pwa-status-enter-from,
.pwa-status-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.pwa-update.pwa-status-enter-from,
.pwa-update.pwa-status-leave-to {
  transform: translateY(1rem);
}

@media (max-width: 520px) {
  .pwa-update {
    inset-inline: 0.75rem;
    max-width: none;
  }
}
</style>
