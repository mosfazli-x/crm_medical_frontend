<template>
  <Teleport to="body">
    <Transition name="ui-dialog">
      <div v-if="modelValue" class="ui-dialog-overlay" :class="{ 'ui-dialog-overlay--dark': scrim }" @click.self="closeable && close()">
        <div
          ref="dialogRef"
          class="ui-dialog"
          :class="[`ui-dialog--${size}`]"
          role="dialog"
          :aria-modal="true"
          :aria-labelledby="titleId"
          @keydown.esc="closeable && close()"
        >
          <div v-if="title || $slots.header" class="ui-dialog__header">
            <h2 :id="titleId" class="ui-dialog__title">
              <slot name="header">{{ title }}</slot>
            </h2>
            <button v-if="closeable" class="ui-dialog__close" aria-label="Close" @click="close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="ui-dialog__body" :class="{ 'ui-dialog__body--flush': flush }">
            <slot />
          </div>
          <div v-if="$slots.footer" class="ui-dialog__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeable?: boolean
  scrim?: boolean
  flush?: boolean
}>(), {
  size: 'md',
  closeable: true,
  scrim: true,
  flush: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const close = () => emit('update:modelValue', false)

const titleId = `ui-dialog-${Math.random().toString(36).slice(2, 8)}`
const dialogRef = ref<HTMLElement>()

// Prevent body scroll when open
watch(() => props.modelValue, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.ui-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.ui-dialog-overlay--dark {
  background: rgba(0, 0, 0, 0.6);
}

.ui-dialog {
  background-color: var(--color-surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-height: calc(100vh - var(--spacing-8));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:global(.dark) .ui-dialog {
  background-color: var(--color-blue-grey);
}

.ui-dialog--sm { max-width: 24rem; }
.ui-dialog--md { max-width: 32rem; }
.ui-dialog--lg { max-width: 40rem; }
.ui-dialog--xl { max-width: 56rem; }
.ui-dialog--full { max-width: calc(100vw - var(--spacing-8)); }

.ui-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-5) var(--spacing-6);
  border-bottom: 1px solid var(--color-border-subtle);
}

:global(.dark) .ui-dialog__header {
  border-bottom-color: var(--color-border);
}

.ui-dialog__title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

:global(.dark) .ui-dialog__title {
  color: var(--color-slate-100);
}

.ui-dialog__close {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-1-5);
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-default);
}

.ui-dialog__close:hover {
  background-color: var(--color-surface-muted);
  color: var(--color-text-primary);
}

:global(.dark) .ui-dialog__close:hover {
  background-color: var(--color-border);
}

.ui-dialog__body {
  padding: var(--spacing-6);
  overflow-y: auto;
  flex: 1;
}

.ui-dialog__body--flush {
  padding: 0;
}

.ui-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border-subtle);
  background-color: var(--color-surface-muted);
}

:global(.dark) .ui-dialog__footer {
  border-top-color: var(--color-border);
  background-color: var(--color-dark-grey);
}

/* Transition */
.ui-dialog-enter-active {
  transition: opacity var(--duration-normal) var(--ease-default);
}
.ui-dialog-leave-active {
  transition: opacity var(--duration-fast) var(--ease-default);
}
.ui-dialog-enter-from,
.ui-dialog-leave-to {
  opacity: 0;
}

.ui-dialog-enter-active .ui-dialog {
  transition: transform var(--duration-normal) var(--ease-premium),
              opacity var(--duration-normal) var(--ease-default);
}
.ui-dialog-leave-active .ui-dialog {
  transition: transform var(--duration-fast) var(--ease-default),
              opacity var(--duration-fast) var(--ease-default);
}
.ui-dialog-enter-from .ui-dialog {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
.ui-dialog-leave-to .ui-dialog {
  transform: scale(0.98);
  opacity: 0;
}
</style>
