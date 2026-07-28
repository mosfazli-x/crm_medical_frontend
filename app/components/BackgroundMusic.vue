<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const { t } = useI18n()
const { isPlaying, volume, isReady, toggle, setVolume } = useBackgroundMusic()

const showSlider = ref(false)
const sliderRef = ref<HTMLInputElement | null>(null)

function onSliderInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value)
  setVolume(val / 100)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'm' || e.key === 'M') {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
    toggle()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div
    class="imm-music-wrap"
    @mouseenter="showSlider = true"
    @mouseleave="showSlider = false"
  >
    <button
      class="imm-music-toggle"
      :class="{ 'imm-music-toggle--active': isPlaying }"
      :title="isPlaying ? t('landing.music.off') : t('landing.music.on')"
      :aria-label="isPlaying ? t('landing.music.off') : t('landing.music.on')"
      @click="toggle"
    >
      <svg v-if="isPlaying" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    </button>

    <Transition name="imm-volume">
      <div v-if="showSlider" class="imm-volume-popup">
        <input
          ref="sliderRef"
          type="range"
          min="0"
          max="100"
          :value="Math.round(volume * 100)"
          class="imm-volume-slider"
          :aria-label="t('landing.music.volume')"
          @input="onSliderInput"
        />
      </div>
    </Transition>
  </div>
</template>
