<template>
  <label class="ep-field">
    <span class="ep-field__label">
      {{ label }}
      <span v-if="required" class="ep-field__req">*</span>
    </span>
    <slot />
    <span v-if="error" class="ep-field__error">{{ error }}</span>
  </label>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    required?: boolean
    error?: string
  }>(),
  { required: false, error: '' },
)
</script>

<style scoped>
.ep-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.ep-field__label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--app-text-2);
}

.ep-field__req {
  color: var(--app-expense);
}

.ep-field__error {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--app-expense);
}
</style>
