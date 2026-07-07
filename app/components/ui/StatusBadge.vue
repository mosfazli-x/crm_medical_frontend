<template>
  <span :class="badgeClass(status)">{{ badgeLabel(status) }}</span>
</template>

<script setup lang="ts">
defineProps<{ status: string }>()
const { badgeClass, badgeLabel } = useStatusBadge()
</script>
