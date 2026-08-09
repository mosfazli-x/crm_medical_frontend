<template>
  <span class="ui-price inline-flex flex-col leading-tight min-w-0" :dir="dir">
    <template v-if="detail.hasValue">
      <span class="ui-price-digits inline-flex items-baseline gap-1" :class="digitsClass">
        <span class="tabular-nums">{{ detail.digits }}</span>
        <span v-if="detail.unit" class="ui-price-unit !text-[10px] !font-normal !opacity-60 !whitespace-nowrap"
          :class="unitClass">{{ detail.unit }}</span>
      </span>
      <span v-if="showWords && detail.words"
        class="ui-price-words !text-[11px] !leading-snug !font-normal !opacity-50 !whitespace-normal" :class="wordsClass"
        dir="rtl">
        {{ detail.words }}
      </span>
    </template>
    <span v-else class="ui-price-empty !text-slate-400">—</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFormatting } from '~/composables/useFormatting'

const props = withDefaults(defineProps<{
  value: number | string | null | undefined
  showWords?: boolean
  digitsClass?: string
  wordsClass?: string
  unitClass?: string
}>(), {
  showWords: true,
  digitsClass: '',
  wordsClass: '',
  unitClass: '',
})

const { locale } = useI18n()
const { formatPriceDetail } = useFormatting()

const dir = computed(() => locale.value === 'fa' ? 'rtl' : 'ltr')
const detail = computed(() => formatPriceDetail(props.value))
</script>
