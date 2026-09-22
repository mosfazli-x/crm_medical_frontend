<template>
  <component
    :is="tag"
    :type="tag === 'button' ? type : undefined"
    :href="tag === 'a' ? href : undefined"
    :to="tag === 'NuxtLink' ? to : undefined"
    :disabled="disabled || loading"
    :aria-disabled="disabled || loading"
    :aria-busy="loading"
    class="ui-btn"
    :class="[
      `ui-btn--${variant}`,
      `ui-btn--${size}`,
      {
        'ui-btn--loading': loading,
        'ui-btn--block': block,
        'ui-btn--icon-only': iconOnly,
      },
    ]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="ui-btn__spinner" aria-hidden="true">
      <svg class="ui-btn__spinner-svg" viewBox="0 0 24 24" fill="none">
        <circle class="ui-btn__spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="ui-btn__spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </span>
    <span v-if="$slots.prefix && !loading" class="ui-btn__prefix">
      <slot name="prefix" />
    </span>
    <span v-if="$slots.default" class="ui-btn__label">
      <slot />
    </span>
    <span v-if="$slots.suffix" class="ui-btn__suffix">
      <slot name="suffix" />
    </span>
  </component>
</template>

<script setup lang="ts">
type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'success' | 'warning' | 'link'
type ButtonSize = 'sm' | 'md' | 'lg'

withDefaults(defineProps<{
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  iconOnly?: boolean
  type?: 'button' | 'submit' | 'reset'
  href?: string
  to?: string
  tag?: string
}>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  iconOnly: false,
  type: 'button',
  tag: 'button',
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<style scoped>
.ui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1-5);
  font-family: inherit;
  font-weight: var(--font-weight-semibold);
  border: 1px solid transparent;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  line-height: 1;
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-default);
  border-radius: var(--radius-lg);
}

.ui-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Sizes */
.ui-btn--sm {
  padding: var(--spacing-1-5) var(--spacing-3);
  font-size: var(--text-xs);
  border-radius: var(--radius-md);
}

.ui-btn--md {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
}

.ui-btn--lg {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--text-base);
  border-radius: var(--radius-xl);
}

/* Variants */
.ui-btn--primary {
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  border-color: rgba(79, 70, 229, 0.2);
}

.ui-btn--primary:hover:not(:disabled) {
  background-color: var(--color-teal-100);
  border-color: rgba(79, 70, 229, 0.3);
}

.ui-btn--primary:active:not(:disabled) {
  background-color: var(--color-teal-200);
}

.ui-btn--accent {
  background-color: var(--color-primary);
  color: #ffffff;
  border-color: var(--color-primary);
}

.ui-btn--accent:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.ui-btn--accent:active:not(:disabled) {
  background-color: var(--color-primary-active);
}

.ui-btn--secondary {
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.ui-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-surface-muted);
  border-color: var(--color-slate-300);
}

.ui-btn--ghost {
  background-color: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}

.ui-btn--ghost:hover:not(:disabled) {
  background-color: var(--color-surface-muted);
  color: var(--color-text-primary);
}

.ui-btn--danger {
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
  border-color: rgba(220, 38, 38, 0.2);
}

.ui-btn--danger:hover:not(:disabled) {
  background-color: var(--color-red-100);
  border-color: rgba(220, 38, 38, 0.3);
}

.ui-btn--success {
  background-color: var(--color-success-subtle);
  color: var(--color-success);
  border-color: rgba(5, 150, 105, 0.2);
}

.ui-btn--success:hover:not(:disabled) {
  background-color: var(--color-emerald-100);
}

.ui-btn--warning {
  background-color: var(--color-warning-subtle);
  color: var(--color-warning);
  border-color: rgba(217, 119, 6, 0.2);
}

.ui-btn--warning:hover:not(:disabled) {
  background-color: var(--color-amber-100);
}

.ui-btn--link {
  background: transparent;
  color: var(--color-primary);
  border: none;
  padding: 0;
}

.ui-btn--link:hover:not(:disabled) {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

/* States */
.ui-btn:disabled,
.ui-btn--loading {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.ui-btn--block {
  width: 100%;
}

.ui-btn--icon-only {
  padding: var(--spacing-2);
}

.ui-btn--icon-only.ui-btn--sm {
  padding: var(--spacing-1-5);
}

.ui-btn--icon-only.ui-btn--lg {
  padding: var(--spacing-3);
}

/* Loading spinner */
.ui-btn__spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ui-btn__spinner-svg {
  width: 1em;
  height: 1em;
  animation: ui-btn-spin 0.75s linear infinite;
}

.ui-btn__spinner-track {
  opacity: 0.25;
}

.ui-btn__spinner-head {
  opacity: 0.9;
}

@keyframes ui-btn-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ui-btn__prefix,
.ui-btn__suffix {
  display: inline-flex;
  align-items: center;
}

.ui-btn__label {
  display: inline-flex;
  align-items: center;
}

/* Dark mode overrides */
:global(.dark) .ui-btn--secondary {
  background-color: var(--color-blue-grey);
  border-color: var(--color-border);
  color: var(--color-slate-300);
}

:global(.dark) .ui-btn--secondary:hover:not(:disabled) {
  background-color: var(--color-slate-700);
}

:global(.dark) .ui-btn--ghost {
  color: var(--color-slate-400);
}

:global(.dark) .ui-btn--ghost:hover:not(:disabled) {
  background-color: var(--color-blue-grey);
  color: var(--color-slate-200);
}

:global(.dark) .ui-btn--danger {
  background-color: rgba(127, 29, 29, 0.2);
  border-color: rgba(220, 38, 38, 0.3);
  color: var(--color-red-400);
}

:global(.dark) .ui-btn--danger:hover:not(:disabled) {
  background-color: rgba(127, 29, 29, 0.35);
}
</style>
