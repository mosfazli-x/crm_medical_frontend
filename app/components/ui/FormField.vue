<template>
  <div class="ui-form-field">
    <label v-if="label" :for="fieldId" class="ui-form-field__label" :class="{ 'ui-form-field__label--required': required }">
      {{ label }}
    </label>
    <p v-if="description" class="ui-form-field__description">{{ description }}</p>
    <slot :field-id="fieldId" />
    <p v-if="error" class="ui-form-field__error" role="alert">{{ error }}</p>
    <p v-else-if="hint" class="ui-form-field__hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  description?: string
  error?: string
  hint?: string
  required?: boolean
  id?: string
}>(), {
  required: false,
})

const fieldId = computed(() => props.id || `form-field-${Math.random().toString(36).slice(2, 8)}`)
</script>

<style scoped>
.ui-form-field {
  display: flex;
  flex-direction: column;
}

.ui-form-field__label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-1-5);
  padding-inline-start: var(--spacing-0-5);
}

:global(.dark) .ui-form-field__label {
  color: var(--color-slate-400);
}

.ui-form-field__label--required::after {
  content: ' *';
  color: var(--color-danger);
}

.ui-form-field__description {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-1-5);
}

.ui-form-field__error {
  font-size: var(--text-xs);
  color: var(--color-danger);
  margin-top: var(--spacing-1);
  padding-inline-start: var(--spacing-0-5);
}

.ui-form-field__hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--spacing-1);
  padding-inline-start: var(--spacing-0-5);
}
</style>
