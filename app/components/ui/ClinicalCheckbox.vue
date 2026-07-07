<template>
  <label
    class="crm-checkbox"
    :class="[
      modelValue ? 'crm-checkbox--checked' : '',
      `crm-checkbox--${variant}`,
      $attrs.class,
    ]"
  >
    <input
      type="checkbox"
      class="crm-checkbox-input"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="crm-checkbox-box" aria-hidden="true">
      <svg v-if="modelValue" class="crm-checkbox-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
    <span v-if="label" class="crm-checkbox-label">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue: boolean
  label?: string
  variant?: 'primary' | 'warning' | 'danger'
  disabled?: boolean
}>(), {
  variant: 'primary',
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function onChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>
