<template>
  <Teleport to="body">
    <Transition name="app-sheet">
      <div
        v-if="modelValue"
        class="app-sheet-backdrop"
        @click.self="closeable && emit('update:modelValue', false)"
      >
        <div
          class="app-sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
          @keydown.esc="closeable && emit('update:modelValue', false)"
        >
          <span class="app-sheet__grip" aria-hidden="true" />

          <header class="app-sheet__header">
            <span>
              <span class="app-sheet__title">{{ title }}</span>
              <span v-if="subtitle" class="app-sheet__sub">{{ subtitle }}</span>
            </span>
            <button
              v-if="closeable"
              type="button"
              class="app-iconbtn"
              :aria-label="closeText"
              @click="emit('update:modelValue', false)"
            >
              <Icon name="lucide:x" size="18" />
            </button>
          </header>

          <div class="app-sheet__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="app-sheet__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    subtitle?: string
    closeable?: boolean
    closeLabel?: string
  }>(),
  { subtitle: '', closeable: true, closeLabel: '' },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const closeText = computed(() => props.closeLabel || t('common.close'))

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.modelValue && props.closeable) {
    emit('update:modelValue', false)
  }
}

// Freeze the page behind the sheet while it is open.
watch(
  () => props.modelValue,
  (open) => {
    if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>
