<template>
  <MedicalDashboardLoader :show="show" @finished="$emit('finished')" />
</template>
<script setup lang="ts">
import MedicalDashboardLoader from '~/components/loading/MedicalDashboardLoader.vue'
defineProps<{ show: boolean }>()
defineEmits<{ (e: 'finished'): void }>()
</script>