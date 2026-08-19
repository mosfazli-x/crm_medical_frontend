import { ref, computed } from 'vue'

/**
 * Reusable handwriting-to-text integration for any component with text inputs.
 *
 * Usage:
 * ```ts
 * const { openHandwriting, applyHandwriting, handwritingOpen, handwritingLabel, handwritingNumeric } =
 *   useHandwritingFields({ fieldLabels: { name: 'basicInfo.firstName', phone: 'basicInfo.phone' } })
 *
 * // In template: add to each v-text-field:
 * //   append-inner-icon="mdi-draw-pen"
 * //   @click:append-inner="openHandwriting('name')"
 * //
 * // At the bottom of <template>:
 * //   <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel"
 * //     :numeric="handwritingNumeric" @insert="applyHandwriting" />
 * ```
 */
export function useHandwritingFields(opts: {
  fieldLabels: Record<string, string>
  /** Write recognized text into this reactive object (e.g. a `form` ref). If omitted, caller handles `applyHandwriting` manually. */
  target?: ReturnType<typeof ref<Record<string, any>>>
}) {
  const { fieldLabels, target } = opts

  const isOpen = ref(false)
  const currentField = ref<string | null>(null)
  const isNumeric = ref(false)

  const label = computed(() =>
    currentField.value && fieldLabels[currentField.value]
      ? fieldLabels[currentField.value]
      : '',
  )

  function open(field: string, numeric = false) {
    currentField.value = field
    isNumeric.value = numeric
    isOpen.value = true
  }

  function apply(text: string) {
    if (!currentField.value) return
    if (target?.value) {
      target.value[currentField.value] = text
    }
  }

  return {
    handwritingOpen: isOpen,
    handwritingLabel: label,
    handwritingNumeric: isNumeric,
    handwritingTarget: currentField,
    openHandwriting: open,
    applyHandwriting: apply,
  }
}
