<template>
  <div ref="rootEl" class="patient-selector">
    <div v-if="selected && !isOpen" class="selected-chip" @click="openAndFocus">
      <div class="selected-chip-avatar">
        <Icon name="lucide:user" class="!w-3.5 !h-3.5" />
      </div>
      <div class="selected-chip-info">
        <span class="selected-chip-name">{{ selected.firstName }} {{ selected.lastName }}</span>
        <span v-if="selected.nationalId" class="selected-chip-meta" dir="ltr">{{ selected.nationalId }}</span>
      </div>
      <button
        type="button"
        class="selected-chip-clear"
        :aria-label="t('dailyReports.clearPatient')"
        @click.stop="clearSelection"
      >
        <Icon name="lucide:x" class="!w-3 !h-3" />
      </button>
    </div>

    <div class="input-wrapper" :class="{ focused: isFocused }">
      <div class="input-icon">
        <Icon name="lucide:search" class="!w-4 !h-4" />
      </div>
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        class="search-input"
        :placeholder="selected ? t('dailyReports.changePatient') : placeholder"
        autocomplete="off"
        role="combobox"
        :aria-expanded="isOpen"
        aria-haspopup="listbox"
        :aria-label="label"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      >
      <button
        v-if="query || selected"
        type="button"
        class="input-clear"
        :aria-label="t('dailyReports.clearSearch')"
        @mousedown.prevent="clearAll"
      >
        <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
      </button>
      <button
        v-if="handwritingLabel"
        type="button"
        class="hw-btn"
        :title="t('handwriting.title')"
        :aria-label="t('handwriting.title')"
        @mousedown.prevent
        @click="openHandwriting"
      >
        <v-icon size="17">mdi-draw-pen</v-icon>
      </button>
      <div class="input-chevron" :class="{ rotated: isOpen }">
        <Icon name="lucide:chevron-down" class="!w-4 !h-4" />
      </div>
    </div>

    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown" role="listbox">
        <div v-if="filtered.length" class="dropdown-results">
          <div class="dropdown-count">
            {{ t('patientSearch.resultsCount', { count: filtered.length }) }}
          </div>
          <div ref="listEl" class="dropdown-scroll">
            <div
              v-for="(patient, idx) in filtered"
              :key="patient.id"
              class="result-card"
              :class="{ active: idx === activeIndex, selected: patient.id === modelValue }"
              role="option"
              :aria-selected="idx === activeIndex"
              @mouseenter="activeIndex = idx"
              @mousedown.prevent="selectPatient(patient)"
            >
              <div class="result-avatar">
                <span class="result-avatar-text">{{ initials(patient) }}</span>
              </div>
              <div class="result-info">
                <div class="result-name">
                  <span v-html="highlight(patient.firstName)" />
                  <span v-html="highlight(patient.lastName)" />
                </div>
                <div class="result-meta">
                  <span v-if="patient.nationalId" class="result-meta-item">
                    <Icon name="lucide:id-card" class="!w-3 !h-3" />
                    <span class="crm-ltr" v-html="highlight(patient.nationalId)" />
                  </span>
                  <span v-if="patient.phone" class="result-meta-item">
                    <Icon name="lucide:phone" class="!w-3 !h-3" />
                    <span class="crm-ltr" v-html="highlight(patient.phone)" />
                  </span>
                  <span v-if="patient.insuranceType" class="result-meta-item">
                    <Icon name="lucide:shield-check" class="!w-3 !h-3" />
                    <span>{{ patient.insuranceType }}</span>
                  </span>
                </div>
              </div>
              <div v-if="patient.id === modelValue" class="result-check">
                <Icon name="lucide:check" class="!w-4 !h-4" />
              </div>
            </div>
          </div>
        </div>

        <div v-else class="dropdown-empty">
          <Icon name="lucide:user-x" class="!w-5 !h-5" />
          <p class="dropdown-empty-title">{{ t('patientSearch.noResults') }}</p>
          <p class="dropdown-empty-hint">{{ t('patientSearch.noResultsHint') }}</p>
        </div>
      </div>
    </Transition>

    <HandwritingDialog
      v-model="hwOpen"
      :label="handwritingLabel"
      @insert="applyHandwriting"
    />
  </div>
</template>

<script setup lang="ts">
import type { PatientOption } from '~/types/report'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined
    patients: PatientOption[]
    label?: string
    placeholder?: string
    handwritingLabel?: string
  }>(),
  {
    label: '',
    placeholder: '',
    handwritingLabel: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  select: [patient: PatientOption | null]
}>()

const rootEl = ref<HTMLElement>()
const inputEl = ref<HTMLInputElement>()
const listEl = ref<HTMLElement>()

const query = ref('')
const isOpen = ref(false)
const isFocused = ref(false)
const activeIndex = ref(-1)
const hwOpen = ref(false)

const selected = computed(() =>
  props.modelValue ? props.patients.find((p) => p.id === props.modelValue) || null : null,
)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.patients.slice(0, 50)
  return props.patients.filter((p) => {
    const haystack = [p.firstName, p.lastName, p.nationalId, p.phone]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  }).slice(0, 50)
})

function highlight(text: string) {
  const q = query.value.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>')
}

function initials(p: PatientOption) {
  const f = p.firstName?.[0] || ''
  const l = p.lastName?.[0] || ''
  return (f + l).toUpperCase()
}

function openAndFocus() {
  isOpen.value = true
  nextTick(() => inputEl.value?.focus())
}

function onFocus() {
  isFocused.value = true
  isOpen.value = true
  activeIndex.value = -1
}

function onBlur() {
  isFocused.value = false
  setTimeout(() => {
    isOpen.value = false
    activeIndex.value = -1
  }, 150)
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      isOpen.value = true
      activeIndex.value = 0
      scrollToActive()
      return
    }
    return
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
      scrollToActive()
      break
    case 'ArrowUp':
      e.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
      scrollToActive()
      break
    case 'Enter': {
      e.preventDefault()
      const patient = filtered.value[activeIndex.value]
      if (activeIndex.value >= 0 && patient) {
        selectPatient(patient)
      }
      break
    }
    case 'Escape':
      e.preventDefault()
      inputEl.value?.blur()
      break
  }
}

function scrollToActive() {
  nextTick(() => {
    if (!listEl.value) return
    const active = listEl.value.children[activeIndex.value] as HTMLElement
    if (active) {
      active.scrollIntoView({ block: 'nearest' })
    }
  })
}

function selectPatient(patient: PatientOption) {
  emit('update:modelValue', patient.id)
  emit('select', patient)
  query.value = ''
  isOpen.value = false
  nextTick(() => inputEl.value?.blur())
}

function clearSelection() {
  emit('update:modelValue', null)
  emit('select', null)
  query.value = ''
}

function clearAll() {
  clearSelection()
  nextTick(() => inputEl.value?.focus())
}

function openHandwriting() {
  hwOpen.value = true
}

function applyHandwriting(text: string) {
  query.value = text
  isOpen.value = true
  activeIndex.value = 0
  nextTick(() => inputEl.value?.focus())
}

function onClickOutside(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<style scoped>
.patient-selector {
  position: relative;
}

.selected-chip {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.375rem;
  background: var(--asa-indigo-soft);
  border: 1px solid color-mix(in srgb, var(--asa-indigo) 22%, transparent);
  border-radius: 0.75rem;
  cursor: pointer;
  color: var(--asa-label);
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default),
    background-color 150ms var(--ease-default);
}

.selected-chip:hover {
  background: color-mix(in srgb, var(--asa-indigo) 20%, transparent);
  box-shadow: 0 2px 8px -4px color-mix(in srgb, var(--asa-indigo) 55%, transparent);
}

.selected-chip-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--asa-bg-card) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--asa-indigo) 16%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--asa-indigo);
  flex-shrink: 0;
}

.selected-chip-info {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-chip-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-chip-meta {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-2);
  font-family: 'Courier New', monospace;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  padding: 0.125rem 0.375rem;
  border-radius: 0.375rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.selected-chip-clear {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.375rem;
  border: none;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label-3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.selected-chip-clear:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 2.75rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  transition: background-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.input-wrapper:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
}

.input-wrapper.focused {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.input-icon {
  padding-inline-start: 0.875rem;
  padding-inline-end: 0.625rem;
  color: var(--asa-label-3);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color 150ms var(--ease-default);
}

.input-wrapper.focused .input-icon {
  color: var(--asa-accent);
}

.search-input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--asa-label);
  direction: inherit;
}

.search-input::placeholder {
  color: var(--asa-label-3);
  font-weight: 400;
}

.input-clear {
  padding: 0.375rem;
  border: none;
  background: transparent;
  color: var(--asa-label-3);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
  flex-shrink: 0;
}

.input-clear:hover {
  color: var(--asa-accent);
  background: var(--asa-accent-soft);
}

.hw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--asa-label-3);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.hw-btn:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.input-chevron {
  padding-inline-end: 0.75rem;
  color: var(--asa-label-3);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: transform 200ms var(--ease-default);
}

.input-chevron.rotated {
  transform: rotate(180deg);
}

.dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  z-index: 60;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  box-shadow: var(--asa-card-shadow);
  overflow: hidden;
}

.dropdown-results {
  padding: 0;
}

.dropdown-count {
  padding: 0.625rem 0.875rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-3);
  border-bottom: 1px solid var(--asa-sep);
  letter-spacing: 0.025em;
}

.dropdown-scroll {
  max-height: 18rem;
  overflow-y: auto;
  padding: 0.375rem;
}

.dropdown-scroll::-webkit-scrollbar {
  width: 4px;
}

.dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-scroll::-webkit-scrollbar-thumb {
  background: color-mix(in srgb, var(--asa-label) 22%, transparent);
  border-radius: 4px;
}

.result-card {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: background-color 120ms var(--ease-default);
}

.result-card:hover,
.result-card.active {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.result-card.selected {
  background: var(--asa-indigo-soft);
}

.result-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  background: var(--asa-indigo-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.result-avatar-text {
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--asa-indigo);
  letter-spacing: 0.05em;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
}

.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
  align-items: center;
}

.result-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
  font-weight: 500;
}

.result-check {
  color: var(--asa-indigo);
  align-self: center;
  flex-shrink: 0;
}

.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--asa-label-3);
}

.dropdown-empty-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  margin-top: 0.625rem;
}

.dropdown-empty-hint {
  font-size: 0.6875rem;
  color: var(--asa-label-2);
  margin-top: 0.25rem;
}

:deep(mark) {
  background: var(--asa-accent-soft);
  color: inherit;
  border-radius: 0.125rem;
  padding: 0 0.0625rem;
}

.dropdown-enter-active {
  transition: all 150ms var(--ease-default);
}

.dropdown-leave-active {
  transition: all 100ms var(--ease-default);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>