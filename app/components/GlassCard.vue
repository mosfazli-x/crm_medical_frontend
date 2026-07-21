<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTilt } from '../composables/Usetilt';

const props = withDefaults(
  defineProps<{
    tilt?: boolean
    float?: boolean
    padding?: string
  }>(),
  { tilt: false, float: false, padding: '!p-5' }
)

const cardRef = ref<HTMLElement | null>(null)
if (props.tilt) useTilt(cardRef, { max: 6, scale: 1.015 })

function onMouseMove(e: MouseEvent) {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  cardRef.value.style.setProperty('--mouse-x', x + '%')
  cardRef.value.style.setProperty('--mouse-y', y + '%')
}
</script>

<template>
  <div
    ref="cardRef"
    class="glass-surface !rounded-3xl !transition-all !duration-500 !ease-out card-glow card-inner-glow"
    :class="[padding, float ? '!animate-floaty' : '']"
    @mousemove="onMouseMove"
  >
    <slot />
  </div>
</template>
