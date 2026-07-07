<template>
  <div class="crm-date-nav">
    <button class="crm-date-nav-btn" :aria-label="prevLabel" @click="$emit('prev')">
      <AltArrowLeft class="w-5 h-5 text-slate-400 fill-current rotate-180 transition-colors hover:text-slate-600" />
    </button>
    <span class="crm-date-nav-label">{{ label }}</span>
    <button class="crm-date-nav-btn" :aria-label="nextLabel" @click="$emit('next')">
      <AltArrowLeft class="w-5 h-5 text-slate-400 fill-current transition-colors hover:text-slate-600" />
    </button>
  </div>
</template>

<script setup lang="ts">
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'

defineProps<{
  label: string
  prevLabel?: string
  nextLabel?: string
}>()

defineEmits<{ prev: []; next: [] }>()
</script>
