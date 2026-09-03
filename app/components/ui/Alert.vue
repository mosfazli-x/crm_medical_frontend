<template>
  <div class="ui-alert" :class="[`ui-alert--${variant}`, { 'ui-alert--dismissible': dismissible }]" role="alert">
    <div v-if="icon || $slots.icon" class="ui-alert__icon">
      <slot name="icon">
        <svg v-if="variant === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <svg v-else-if="variant === 'danger'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <svg v-else-if="variant === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      </slot>
    </div>
    <div class="ui-alert__content">
      <h4 v-if="title" class="ui-alert__title">{{ title }}</h4>
      <div class="ui-alert__message">
        <slot>{{ message }}</slot>
      </div>
    </div>
    <button v-if="dismissible" class="ui-alert__dismiss" aria-label="Dismiss" @click="$emit('dismiss')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'danger'
  title?: string
  message?: string
  icon?: boolean
  dismissible?: boolean
}>(), {
  variant: 'info',
  icon: true,
  dismissible: false,
})

defineEmits<{
  dismiss: []
}>()
</script>

<style scoped>
.ui-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-xl);
  border: 1px solid transparent;
}

.ui-alert--info {
  background-color: var(--color-info-subtle);
  border-color: rgba(2, 132, 199, 0.15);
  color: var(--color-info);
}

.ui-alert--success {
  background-color: var(--color-success-subtle);
  border-color: rgba(5, 150, 105, 0.15);
  color: var(--color-success);
}

.ui-alert--warning {
  background-color: var(--color-warning-subtle);
  border-color: rgba(217, 119, 6, 0.15);
  color: var(--color-warning);
}

.ui-alert--danger {
  background-color: var(--color-danger-subtle);
  border-color: rgba(220, 38, 38, 0.15);
  color: var(--color-danger);
}

.ui-alert__icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.ui-alert__content {
  flex: 1;
  min-width: 0;
}

.ui-alert__title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-0-5);
}

.ui-alert__message {
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  opacity: 0.9;
}

.ui-alert__dismiss {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1);
  border: none;
  background: transparent;
  cursor: pointer;
  color: inherit;
  opacity: 0.5;
  border-radius: var(--radius-sm);
  transition: opacity var(--duration-fast) var(--ease-default);
}

.ui-alert__dismiss:hover {
  opacity: 1;
}

:global(.dark) .ui-alert--info {
  background-color: rgba(14, 165, 233, 0.1);
  border-color: rgba(14, 165, 233, 0.25);
  color: var(--color-sky-400);
}

:global(.dark) .ui-alert--success {
  background-color: rgba(5, 150, 105, 0.1);
  border-color: rgba(5, 150, 105, 0.25);
  color: var(--color-emerald-400);
}

:global(.dark) .ui-alert--warning {
  background-color: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.25);
  color: var(--color-amber-400);
}

:global(.dark) .ui-alert--danger {
  background-color: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.25);
  color: var(--color-red-400);
}
</style>
