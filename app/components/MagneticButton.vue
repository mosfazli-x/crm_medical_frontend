<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMagneticButton } from '../composables/Usemagneticbutton';

const props = withDefaults(
  defineProps<{
    as?: 'button' | 'a'
    href?: string
    variant?: 'solid' | 'outline' | 'ghost'
    icon?: boolean
  }>(),
  { as: 'button', variant: 'solid', icon: true }
)

const btnRef = ref<HTMLElement | null>(null)
useMagneticButton(btnRef)

const ripples = ref<{ id: number; x: number; y: number }[]>([])

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'outline':
      return '!bg-transparent !text-ink !border !border-ink/15 hover:!border-emerald/40 hover:!shadow-[0_0_24px_-4px_rgba(23,168,116,0.2)]'
    case 'ghost':
      return '!bg-white/70 !text-ink !border !border-white/60 backdrop-blur-md hover:!bg-white/90 hover:!shadow-soft'
    default:
      return '!bg-ink !text-sand hover:!bg-ink-soft hover:!shadow-[0_8px_30px_-4px_rgba(11,12,14,0.35)]'
  }
})

function onClick(e: MouseEvent) {
  if (!btnRef.value) return
  const rect = btnRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  const id = Date.now()
  ripples.value.push({ id, x, y })
  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== id)
  }, 600)
}
</script>

<template>
  <component
    :is="as"
    ref="btnRef"
    :href="as === 'a' ? href : undefined"
    class="group btn-ripple !inline-flex !items-center !gap-2 sm:!gap-2.5 !rounded-full !px-5 !py-2.5 sm:!px-7 sm:!py-3.5 !text-xs sm:!text-sm md:!text-base !font-body !font-medium !transition-all !duration-300 !shadow-soft"
    :class="variantClasses"
    @click="onClick"
  >
    <span
      v-for="ripple in ripples"
      :key="ripple.id"
      class="ripple-effect"
      :style="{ left: ripple.x - 10 + 'px', top: ripple.y - 10 + 'px' }"
    />
    <slot />
    <span
      v-if="icon"
      class="hidden! md:flex! !inline-flex !h-5 !w-5 sm:!h-6 sm:!w-6 !items-center !justify-center !rounded-full !bg-white/15 !transition-all !duration-300 group-hover:!-translate-x-1 rtl:group-hover:!translate-x-1 rtl:group-hover:!-rotate-180 group-hover:!shadow-[0_0_12px_rgba(255,255,255,0.15)]"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="!rotate-180 sm:!w-[13px] sm:!h-[13px]">
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
  </component>
</template>
