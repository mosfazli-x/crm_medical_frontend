<script setup lang="ts">
import { ref } from 'vue';
import { useCounter } from '../composables/Usecounter';

const props = defineProps<{
  end: number
  suffix?: string
  label: string
}>()

const el = ref<HTMLElement | null>(null)
const { display } = useCounter(el, props.end, { suffix: props.suffix ?? '' })
</script>

<template>
  <div ref="el" class="!flex !flex-col !items-center !gap-2 sm:!gap-3 !group cursor-default">
    <div class="!relative">
      <span class="counter-value !font-display !text-3xl sm:!text-4xl md:!text-5xl lg:!text-6xl !font-black !text-ink tabular-nums !tracking-tight counter-underline group-hover:!text-emerald-deep !transition-colors !duration-300">
        {{ display }}
      </span>
      <span class="!absolute !inset-0 !-inset-x-4 !-inset-y-2 !rounded-full !bg-emerald/5 !blur-xl !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-500 !-z-10" />
    </div>
    <span class="!text-xs sm:!text-sm md:!text-base !text-muted !font-medium !transition-colors !duration-300 group-hover:!text-emerald-deep">{{ label }}</span>
  </div>
</template>
