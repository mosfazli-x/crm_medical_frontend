<template>
  <div class="ui-field" :class="{ 'ui-field--error': !!error, 'ui-field--disabled': disabled }">
    <label
      v-if="label"
      :for="inputId"
      class="ui-field__label"
      :class="{ 'ui-field__label--required': required }"
    >
      {{ label }}
    </label>
    <p v-if="description" class="ui-field__description">{{ description }}</p>
    <div class="ui-field__input-wrap" :class="{ 'ui-field__input-wrap--error': !!error }">
      <span v-if="$slots.prefix" class="ui-field__prefix">
        <slot name="prefix" />
      </span>
      <input
        :id="inputId"
        ref="inputRef"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :dir="dir"
        class="ui-field__input"
        :class="[
          { 'ui-field__input--has-prefix': !!$slots.prefix, 'ui-field__input--has-suffix': !!$slots.suffix || clearable },
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
      <button
        v-if="clearable && modelValue"
        type="button"
        class="ui-field__clear"
        aria-label="Clear"
        @click="$emit('update:modelValue', '')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      <span v-if="$slots.suffix" class="ui-field__suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="error" class="ui-field__error" role="alert">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  description?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  error?: string
  clearable?: boolean
  autocomplete?: string
  dir?: 'rtl' | 'ltr' | 'auto'
  id?: string
}>(), {
  type: 'text',
  modelValue: '',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement>()
const inputId = computed(() => props.id || `ui-field-${Math.random().toString(36).slice(2, 8)}`)

defineExpose({ focus: () => inputRef.value?.focus(), blur: () => inputRef.value?.blur() })
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

.ui-field__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-1-5);
}

.ui-field__input-wrap {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background-color: var(--color-surface-muted);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  transition: all var(--duration-fast) var(--ease-default);
}

.ui-field__input-wrap:focus-within {
  background-color: var(--color-surface);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.ui-field__input-wrap--error {
  border-color: var(--color-danger);
}

.ui-field__input-wrap--error:focus-within {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

:global(.dark) .ui-field__input-wrap {
  background-color: var(--color-border);
  border-color: var(--color-border);
}

:global(.dark) .ui-field__input-wrap:focus-within {
  background-color: var(--color-blue-grey);
  border-color: var(--color-primary);
}

.ui-field__input {
  flex: 1;
  min-width: 0;
  padding: var(--spacing-2-5) var(--spacing-3);
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-base);
  font-family: inherit;
  color: var(--color-text-primary);
  line-height: var(--leading-normal);
}

.ui-field__input::placeholder {
  color: var(--color-text-muted);
}

.ui-field__input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

:global(.dark) .ui-field__input {
  color: var(--color-slate-100);
}

.ui-field__input--has-prefix {
  padding-inline-start: 0;
}

.ui-field__input--has-suffix {
  padding-inline-end: 0;
}

.ui-field__prefix,
.ui-field__suffix {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  padding-inline: var(--spacing-3);
  flex-shrink: 0;
}

.ui-field__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1);
  margin-inline-end: var(--spacing-2);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-default);
}

.ui-field__clear:hover {
  color: var(--color-text-primary);
  background-color: var(--color-border-subtle);
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
