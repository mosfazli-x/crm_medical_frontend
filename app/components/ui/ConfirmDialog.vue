<template>
  <UiDialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="sm" :closeable="!loading">
    <template #header>
      <div class="ui-confirm__header">
        <div v-if="variant !== 'default'" class="ui-confirm__icon" :class="`ui-confirm__icon--${variant}`">
          <svg v-if="variant === 'danger'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else-if="variant === 'warning'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <span>{{ title }}</span>
      </div>
    </template>

    <p class="ui-confirm__message">{{ message }}</p>
    <slot />

    <template #footer>
      <UiButton variant="ghost" size="md" :disabled="loading" @click="$emit('update:modelValue', false)">
        {{ cancelLabel }}
      </UiButton>
      <UiButton :variant="variant === 'danger' ? 'danger' : 'accent'" size="md" :loading="loading" @click="$emit('confirm')">
        {{ confirmLabel }}
      </UiButton>
    </template>
  </UiDialog>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger' | 'warning'
  loading?: boolean
}>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
  loading: false,
})

defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>

<style scoped>
.ui-confirm__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.ui-confirm__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--spacing-10);
  height: var(--spacing-10);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.ui-confirm__icon--danger {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
}

.ui-confirm__icon--warning {
  background-color: var(--color-warning-subtle);
  color: var(--color-warning);
}

.ui-confirm__message {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

:global(.dark) .ui-confirm__message {
  color: var(--color-slate-400);
}
</style>
