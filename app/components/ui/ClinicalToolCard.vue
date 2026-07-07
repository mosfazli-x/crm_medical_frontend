<template>
  <UiContentCard :card-class="mergedCardClass">
    <div class="crm-tool-card-body">
      <div class="crm-tool-card-header">
        <div class="crm-tool-icon" :class="iconClass">
          <slot name="icon" />
        </div>
        <div class="crm-tool-card-titles">
          <h3 class="crm-card-title crm-tool-card-title">{{ title }}</h3>
          <p v-if="subtitle" class="crm-page-subtitle crm-tool-card-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <slot />
    </div>
  </UiContentCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  iconClass?: string
  cardClass?: string
  spanTwo?: boolean
}>()

const mergedCardClass = computed(() => {
  const classes = ['crm-tool-card']
  if (props.spanTwo) classes.push('crm-clinical-grid-span-2')
  if (props.cardClass) classes.push(props.cardClass)
  return classes.join(' ')
})
</script>

<style scoped>
.crm-tool-card-body {
  padding: 1.5rem !important;
}

@media (min-width: 768px) {
  .crm-tool-card-body {
    padding: 2rem !important;
  }
}

.crm-tool-card-header {
  display: flex !important;
  align-items: center !important;
  gap: 1rem !important;
  margin-bottom: 2rem !important;
}

.crm-tool-card-titles {
  min-width: 0 !important;
}

.crm-tool-card-title {
  font-size: 1.25rem !important;
  margin: 0 !important;
}

.crm-tool-card-subtitle {
  margin-top: 0.25rem !important;
  margin-bottom: 0 !important;
}
</style>
