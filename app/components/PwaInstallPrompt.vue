<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="pwa-invite">
        <div
          v-if="show"
          class="pwa-invite"
          :dir="dir"
          role="dialog"
          aria-labelledby="pwa-invite-title"
        >
          <div class="pwa-invite__card">
            <button
              type="button"
              class="pwa-invite__close"
              :aria-label="t('pwa.later')"
              @click="onLater"
            >
              <Icon name="lucide:x" size="18" />
            </button>

            <header class="pwa-invite__head">
              <span class="pwa-invite__mark" aria-hidden="true">
                <img src="/pwa-192x192.png" alt="" width="52" height="52">
              </span>
              <div class="pwa-invite__titles">
                <p class="pwa-invite__eyebrow">{{ t('pwa.eyebrow') }}</p>
                <h2 id="pwa-invite-title" class="pwa-invite__title">{{ t('pwa.title') }}</h2>
              </div>
            </header>

            <p class="pwa-invite__desc">{{ t('pwa.desc') }}</p>

            <!-- iOS: no programmatic install — walk the user through Safari -->
            <template v-if="mode === 'ios'">
              <p class="pwa-invite__lead">{{ t('pwa.iosLead') }}</p>
              <ol class="pwa-invite__steps">
                <li>
                  <span class="pwa-invite__step-icon"><Icon name="lucide:share" size="16" /></span>
                  <span>{{ t('pwa.iosSteps.one') }}</span>
                </li>
                <li>
                  <span class="pwa-invite__step-icon"><Icon name="lucide:plus-square" size="16" /></span>
                  <span>{{ t('pwa.iosSteps.two') }}</span>
                </li>
                <li>
                  <span class="pwa-invite__step-icon"><Icon name="lucide:check" size="16" /></span>
                  <span>{{ t('pwa.iosSteps.three') }}</span>
                </li>
              </ol>
            </template>

            <!-- Chromium / Android: native install is available -->
            <ul v-else class="pwa-invite__perks">
              <li v-for="perk in perks" :key="perk">
                <span class="pwa-invite__tick"><Icon name="lucide:check" size="13" /></span>
                <span>{{ perk }}</span>
              </li>
            </ul>

            <div class="pwa-invite__actions">
              <button
                v-if="mode === 'native'"
                type="button"
                class="pwa-invite__btn pwa-invite__btn--primary"
                :disabled="busy || done"
                @click="onInstall"
              >
                <Icon :name="done ? 'lucide:check' : 'lucide:download'" size="18" />
                <span>{{ done ? t('pwa.installedShort') : busy ? t('pwa.installing') : t('pwa.install') }}</span>
              </button>

              <button
                v-else
                type="button"
                class="pwa-invite__btn pwa-invite__btn--primary"
                @click="onLater"
              >
                <Icon name="lucide:check" size="18" />
                <span>{{ t('pwa.gotIt') }}</span>
              </button>

              <button
                v-if="mode === 'native'"
                type="button"
                class="pwa-invite__btn pwa-invite__btn--ghost"
                @click="onLater"
              >
                {{ t('pwa.later') }}
              </button>
            </div>

            <button type="button" class="pwa-invite__never" @click="onNever">
              {{ t('pwa.never') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const { t, locale } = useI18n()
const { shouldShow, mode, install, snooze, dismissForever } = usePwaInstall()

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

const ready = ref(false)
const busy = ref(false)
const done = ref(false)

const show = computed(() => ready.value && !done.value && shouldShow.value)

const perks = computed(() => [
  t('pwa.perks.fast'),
  t('pwa.perks.fullscreen'),
  t('pwa.perks.offline'),
])

let revealTimer: ReturnType<typeof setTimeout> | undefined

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && show.value) onLater()
}

onMounted(() => {
  // Give the landing curtain / dashboard a beat before the invite slides in.
  revealTimer = setTimeout(() => {
    ready.value = true
  }, 2400)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  if (revealTimer) clearTimeout(revealTimer)
  window.removeEventListener('keydown', onKeydown)
})

async function onInstall() {
  if (busy.value || done.value) return
  busy.value = true
  try {
    const outcome = await install()
    if (outcome === 'accepted') {
      done.value = true
      setTimeout(() => {
        done.value = false
      }, 4000)
    } else if (outcome === 'dismissed') {
      snooze()
    }
  } finally {
    busy.value = false
  }
}

function onLater() {
  snooze()
}

function onNever() {
  dismissForever()
}
</script>

<style scoped>
.pwa-invite {
  position: fixed;
  z-index: 9999;
  inset-inline-start: 1.25rem;
  bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  width: min(23rem, calc(100vw - 2.5rem));
  pointer-events: none;
}

.pwa-invite__card {
  position: relative;
  pointer-events: auto;
  padding: 1.25rem 1.25rem 1rem;
  border-radius: 1.25rem;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.04),
    0 24px 60px -20px rgba(15, 23, 42, 0.35);
  color: #0f172a;
  font-family: var(--pwa-font, inherit);
  overflow: hidden;
}

/* Ice accent along the top edge — a small nod to the brand */
.pwa-invite__card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, #5f8feb, #22d3ee);
}

.pwa-invite__close {
  position: absolute;
  top: 0.75rem;
  inset-inline-end: 0.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 0.6rem;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.pwa-invite__close:hover {
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
}

.pwa-invite__close:focus-visible {
  outline: 2px solid #5f8feb;
  outline-offset: 2px;
}

.pwa-invite__head {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding-inline-end: 1.75rem;
}

.pwa-invite__mark {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 0.95rem;
  overflow: hidden;
  box-shadow: 0 6px 16px -6px rgba(30, 55, 84, 0.55);
}

.pwa-invite__mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pwa-invite__titles {
  min-width: 0;
}

.pwa-invite__eyebrow {
  margin: 0 0 0.15rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f8feb;
}

.pwa-invite__title {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 700;
  line-height: 1.3;
  color: #0f172a;
}

.pwa-invite__desc {
  margin: 0.85rem 0 0;
  font-size: 0.82rem;
  line-height: 1.65;
  color: #475569;
}

.pwa-invite__lead {
  margin: 0.85rem 0 0.5rem;
  font-size: 0.8rem;
  line-height: 1.6;
  color: #475569;
}

.pwa-invite__perks {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.pwa-invite__perks li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.8rem;
  color: #334155;
}

.pwa-invite__tick {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 999px;
  background: rgba(95, 143, 235, 0.14);
  color: #3b6fd4;
}

.pwa-invite__steps {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}

.pwa-invite__steps li {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.8rem;
  line-height: 1.55;
  color: #334155;
}

.pwa-invite__step-icon {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 0.5rem;
  background: rgba(95, 143, 235, 0.12);
  color: #3b6fd4;
}

.pwa-invite__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.1rem;
}

.pwa-invite__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.75rem;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 0.85rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.14s ease, filter 0.18s ease, background-color 0.18s ease;
}

.pwa-invite__btn:active {
  transform: translateY(1px);
}

.pwa-invite__btn:focus-visible {
  outline: 2px solid #5f8feb;
  outline-offset: 2px;
}

.pwa-invite__btn--primary {
  flex: 1 1 auto;
  color: #ffffff;
  background: linear-gradient(135deg, #5f8feb, #0ea5e9);
  box-shadow: 0 10px 22px -12px rgba(14, 165, 233, 0.9);
}

.pwa-invite__btn--primary:hover:not(:disabled) {
  filter: brightness(1.05);
}

.pwa-invite__btn--primary:disabled {
  cursor: default;
  opacity: 0.9;
}

.pwa-invite__btn--ghost {
  flex: 0 0 auto;
  color: #475569;
  background: rgba(15, 23, 42, 0.05);
}

.pwa-invite__btn--ghost:hover {
  background: rgba(15, 23, 42, 0.09);
}

.pwa-invite__never {
  display: block;
  width: 100%;
  margin: 0.75rem 0 0;
  padding: 0;
  border: 0;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 500;
  color: #94a3b8;
  text-align: center;
  cursor: pointer;
  transition: color 0.18s ease;
}

.pwa-invite__never:hover {
  color: #64748b;
  text-decoration: underline;
}

.pwa-invite__never:focus-visible {
  outline: 2px solid #5f8feb;
  outline-offset: 2px;
  border-radius: 0.4rem;
}

/* ── Motion ───────────────────────────────────────────────────────── */
.pwa-invite-enter-active,
.pwa-invite-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.pwa-invite-enter-from,
.pwa-invite-leave-to {
  opacity: 0;
  transform: translateY(1.25rem) scale(0.98);
}

/* ── Dark theme ───────────────────────────────────────────────────── */
:global(.dark) .pwa-invite__card {
  background: #1b2436;
  border-color: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.4),
    0 24px 60px -20px rgba(0, 0, 0, 0.65);
}

:global(.dark) .pwa-invite__title {
  color: #f1f5f9;
}

:global(.dark) .pwa-invite__desc,
:global(.dark) .pwa-invite__lead {
  color: #b6c0cf;
}

:global(.dark) .pwa-invite__perks li,
:global(.dark) .pwa-invite__steps li {
  color: #cbd5e1;
}

:global(.dark) .pwa-invite__close {
  color: #94a3b8;
}

:global(.dark) .pwa-invite__close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

:global(.dark) .pwa-invite__btn--ghost {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.08);
}

:global(.dark) .pwa-invite__btn--ghost:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* ── Mobile: full-width bottom sheet ─────────────────────────────── */
@media (max-width: 520px) {
  .pwa-invite {
    inset-inline: 0;
    bottom: 0;
    width: 100%;
  }

  .pwa-invite__card {
    border-radius: 1.35rem 1.35rem 0 0;
    padding: 1.35rem 1.2rem calc(1.1rem + env(safe-area-inset-bottom, 0px));
    border-inline: 0;
    border-bottom: 0;
  }

  .pwa-invite-enter-from,
  .pwa-invite-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pwa-invite-enter-active,
  .pwa-invite-leave-active {
    transition: opacity 0.2s linear;
  }

  .pwa-invite-enter-from,
  .pwa-invite-leave-to {
    transform: none;
  }
}
</style>
