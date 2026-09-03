<template>
  <div class="ui-field" :class="{ 'ui-field--error': !!error, 'ui-field--disabled': disabled }">
    <label v-if="label" :for="selectId" class="ui-field__label" :class="{ 'ui-field__label--required': required }">
      {{ label }}
    </label>
    <div class="ui-select-wrap" :class="{ 'ui-select-wrap--error': !!error }">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="ui-select"
        @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="opt in normalizedOptions" :key="opt.value" :value="opt.value" :disabled="opt.disabled">
          {{ opt.label }}
        </option>
      </select>
      <svg class="ui-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 9l6 6 6-6"/>
      </svg>
    </div>
    <p v-if="error" class="ui-field__error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
type SelectOption = string | { value: string; label: string; disabled?: boolean }

const props = withDefaults(defineProps<{
  modelValue?: string
  options: SelectOption[]
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  id?: string
}>(), {
  modelValue: '',
  disabled: false,
  required: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectId = computed(() => props.id || `ui-select-${Math.random().toString(36).slice(2, 8)}`)

const normalizedOptions = computed(() =>
  props.options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt, disabled: false } : opt
  )
)
</script>

<style scoped>
.ui-field {
  display: flex;
  flex-direction: column;
}

.ui-field__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1-5);
  padding-inline-start: var(--spacing-0-5);
}

:global(.dark) .ui-field__label {
  color: var(--color-slate-400);
}

.ui-field__label--required::after {
  content: ' *';
  color: var(--color-danger);
}

.ui-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.ui-select {
  width: 100%;
  padding: var(--spacing-2-5) var(--spacing-10) var(--spacing-2-5) var(--spacing-3);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--color-text-primary);
  appearance: none;
  cursor: pointer;
  outline: none;
  transition: all var(--duration-fast) var(--ease-default);
}

.ui-select:focus {
  background-color: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

:global(.dark) .ui-select {
  background-color: var(--color-border);
  border-color: var(--color-border);
  color: var(--color-slate-100);
}

:global(.dark) .ui-select:focus {
  background-color: var(--color-blue-grey);
  border-color: var(--color-primary);
}

.ui-select:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ui-select-wrap--error .ui-select {
  border-color: var(--color-danger);
}

.ui-select-wrap--error .ui-select:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.ui-select-chevron {
  position: absolute;
  inset-inline-end: var(--spacing-3);
  pointer-events: none;
  color: var(--color-text-muted);
}

.ui-field__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin-top: var(--spacing-1);
  padding-inline-start: var(--spacing-0-5);
}

.ui-field--disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
