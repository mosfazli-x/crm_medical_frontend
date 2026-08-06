<template>
  <div ref="root" class="music" :class="{ 'music--playing': isPlaying, 'music--hint': needsGesture && !isPlaying }">
    <button
      type="button"
      class="music__btn"
      :class="{ 'music__btn--paused': !isPlaying }"
      :aria-pressed="isPlaying"
      :aria-label="btnLabel"
      :title="btnLabel"
      @click="toggle"
    >
      <span v-if="isPlaying" class="music__bars" aria-hidden="true">
        <span /><span /><span />
      </span>
      <svg v-else class="music__play" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5.14v13.72L19 12 8 5.14z" />
      </svg>
    </button>

    <button
      type="button"
      class="music__vol"
      :class="{ 'music__vol--open': popOpen }"
      :aria-label="t('aestheticLanding.music.volume')"
      :aria-expanded="popOpen"
      :title="t('aestheticLanding.music.volume')"
      @click="popOpen = !popOpen"
    >
      <svg
viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9.5 9.5 0 0 1 0 13" />
      </svg>
    </button>

    <Transition name="music-pop">
      <div v-if="popOpen" class="music__pop" role="group" :aria-label="t('aestheticLanding.music.volume')">
        <span class="music__track">{{ t('aestheticLanding.music.track') }}</span>
        <input
          class="music__slider"
          type="range"
          min="0"
          max="1"
          step="0.01"
          :value="volume"
          :style="{ '--fill': fillPct }"
          :aria-label="t('aestheticLanding.music.volume')"
          @input="onVolumeInput"
        >
        <span class="music__pct">{{ volumeLabel }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const { t, pn } = useLang()
const { isPlaying, needsGesture, volume, toggle, setVolume } = useLandingMusic()

const popOpen = ref(false)
const root = ref<HTMLElement | null>(null)

const volumePercent = computed(() => Math.round(volume.value * 100))
const fillPct = computed(() => `${(volume.value * 100).toFixed(1)}%`)
const volumeLabel = computed(() => pn(volumePercent.value))

const btnLabel = computed(() => {
  if (isPlaying.value) return t('aestheticLanding.music.pause')
  if (needsGesture.value) return t('aestheticLanding.music.hint')
  return t('aestheticLanding.music.play')
})

function onVolumeInput(e: Event) {
  setVolume(Number((e.target as HTMLInputElement).value))
}

function onDocPointer(e: PointerEvent) {
  if (popOpen.value && root.value && !root.value.contains(e.target as Node)) popOpen.value = false
}

function onDocKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') popOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointer)
  document.addEventListener('keydown', onDocKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer)
  document.removeEventListener('keydown', onDocKeydown)
})
</script>

<style scoped>
.music {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.music__btn,
.music__vol {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  padding: 0;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--champagne) 55%, transparent);
  background: color-mix(in oklab, var(--lightcyan) 6%, transparent);
  color: var(--champagne-bright);
  cursor: pointer;
  transition:
    border-color 0.7s var(--ease-luxe),
    color 0.7s var(--ease-luxe),
    background 0.7s var(--ease-luxe),
    transform 0.7s var(--ease-luxe);
}

.music__btn:hover,
.music__btn:focus-visible,
.music__vol:hover,
.music__vol:focus-visible {
  border-color: var(--champagne);
  background: color-mix(in oklab, var(--lightcyan) 12%, transparent);
  color: var(--champagne-bright);
}

.music__btn:active,
.music__vol:active {
  transform: scale(0.94);
}

.music__btn:focus-visible,
.music__vol:focus-visible {
  outline: 1px dashed color-mix(in oklab, var(--champagne) 60%, transparent);
  outline-offset: 4px;
}

/* ============ PLAYING STATE ============ */

.music__bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 0.7rem;
}

.music__bars span {
  display: block;
  width: 2px;
  height: 100%;
  border-radius: 1px;
  background: currentColor;
  transform-origin: bottom;
  animation: music-bar 1.1s ease-in-out infinite;
}

.music__bars span:nth-child(2) {
  animation-delay: 0.18s;
}

.music__bars span:nth-child(3) {
  animation-delay: 0.36s;
}

@keyframes music-bar {
  0%,
  100% {
    transform: scaleY(0.35);
  }

  50% {
    transform: scaleY(1);
  }
}

/* Soft champagne ring that breathes while music plays */
.music--playing .music__btn::after {
  content: "";
  position: absolute;
  inset: -0.45rem;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--champagne) 40%, transparent);
  opacity: 0;
  animation: music-pulse 2.8s var(--ease-luxe) infinite;
  pointer-events: none;
}

@keyframes music-pulse {
  0% {
    opacity: 0.75;
    transform: scale(0.94);
  }

  70%,
  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

.music__play {
  width: 0.6rem;
  height: 0.72rem;
  fill: currentColor;
}

.music__vol svg {
  width: 0.9rem;
  height: 0.9rem;
}

/* ============ TAP-TO-START HINT ============ */

.music--hint .music__btn {
  animation: music-hint 1.9s ease-in-out infinite;
}

@keyframes music-hint {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in oklab, var(--champagne) 0%, transparent);
  }

  50% {
    box-shadow: 0 0 0 7px color-mix(in oklab, var(--champagne) 16%, transparent);
  }
}

/* ============ VOLUME POPOVER ============ */

.music__pop {
  position: absolute;
  inset-inline-end: 0;
  top: calc(100% + 0.75rem);
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 12.5rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
  border-radius: 8px;
  background: color-mix(in oklab, var(--ink-soft) 86%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.4);
  backdrop-filter: blur(18px) saturate(1.4);
  box-shadow: 0 20px 44px -26px color-mix(in oklab, var(--ink) 95%, transparent);
}

.music__track {
  font-size: 0.52rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--periwinkle) 72%, transparent);
  white-space: nowrap;
}

.music__pct {
  min-width: 2ch;
  text-align: end;
  font-size: 0.55rem;
  font-variant-numeric: tabular-nums;
  color: color-mix(in oklab, var(--champagne) 78%, transparent);
}

.music__slider {
  flex: 1;
  min-width: 4.5rem;
  height: 2px;
  appearance: none;
  border: 0;
  border-radius: 1px;
  background: linear-gradient(
    90deg,
    var(--champagne) var(--fill, 50%),
    color-mix(in oklab, var(--lightcyan) 18%, transparent) var(--fill, 50%)
  );
  cursor: pointer;
}

.music__slider::-webkit-slider-thumb {
  appearance: none;
  width: 0.62rem;
  height: 0.62rem;
  border: 0;
  border-radius: 50%;
  background: var(--champagne-bright);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--champagne) 25%, transparent);
}

.music__slider::-moz-range-thumb {
  width: 0.62rem;
  height: 0.62rem;
  border: 0;
  border-radius: 50%;
  background: var(--champagne-bright);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--champagne) 25%, transparent);
}

.music__slider:focus-visible {
  outline: 1px dashed color-mix(in oklab, var(--champagne) 60%, transparent);
  outline-offset: 4px;
}

/* ============ POPOVER TRANSITION ============ */

.music-pop-enter-active,
.music-pop-leave-active {
  transition: opacity 0.3s var(--ease-luxe), transform 0.3s var(--ease-luxe);
  transform-origin: top center;
}

.music-pop-enter-from,
.music-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

/* ============ REDUCED MOTION ============ */

@media (prefers-reduced-motion: reduce) {

  .music__bars span,
  .music--playing .music__btn::after,
  .music--hint .music__btn {
    animation: none !important;
  }
}
</style>

<style>
/* Persian glyphs must not be letter-spaced — follows the index.vue pattern */
.landing-shell[dir="rtl"] .stage .music__track {
  letter-spacing: 0;
}
</style>
