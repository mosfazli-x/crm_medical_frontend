<template>
  <div ref="rootEl" class="patient-selector">
    <!-- Selected patient chip -->
    <div v-if="selected && !isOpen" class="selected-chip" @click="openAndFocus">
      <div class="selected-chip-avatar">
        <Icon name="lucide:user" class="!w-3.5 !h-3.5 !text-indigo-500" />
      </div>
      <div class="selected-chip-info">
        <span class="selected-chip-name">{{ selected.firstName }} {{ selected.lastName }}</span>
        <span v-if="selected.nationalId" class="selected-chip-meta">{{ selected.nationalId }}</span>
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

    <!-- Search input -->
    <div class="input-wrapper" :class="{ focused: isFocused, open: isOpen }">
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
      />
      <button
        v-if="query || selected"
        type="button"
        class="input-clear"
        :aria-label="t('dailyReports.clearSearch')"
        @mousedown.prevent="clearAll"
      >
        <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
      </button>
      <div class="input-chevron" :class="{ rotated: isOpen }">
        <Icon name="lucide:chevron-down" class="!w-4 !h-4" />
      </div>
    </div>

    <!-- Dropdown -->
    <Transition name="dropdown">
      <div v-if="isOpen" class="dropdown" role="listbox">
        <!-- Results list -->
        <div v-if="filtered.length" class="dropdown-results">
          <div class="dropdown-count">
            {{ t('patientSearch.resultsCount', { count: filtered.length }) }}
          </div>
          <div class="dropdown-scroll" ref="listEl">
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
            </div>
          </div>
        </div>

        <!-- No results -->
        <div v-else class="dropdown-empty">
          <Icon name="lucide:user-x" class="!w-5 !h-5 !text-slate-300 dark:!text-slate-500" />
          <p class="dropdown-empty-title">{{ t('patientSearch.noResults') }}</p>
          <p class="dropdown-empty-hint">{{ t('patientSearch.noResultsHint') }}</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { PatientOption } from '~/types/report'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: string | null | undefined
    patients: PatientOption[]
    label?: string
    placeholder?: string
  }>(),
  {
    label: '',
    placeholder: '',
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

// Close on outside click
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

/* ── Selected chip ── */
.selected-chip {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.375rem;
  background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.dark .selected-chip {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%);
  border-color: rgba(79, 70, 229, 0.3);
}
.selected-chip:hover {
  border-color: rgba(79, 70, 229, 0.35);
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.1);
}
.selected-chip-avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(79, 70, 229, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dark .selected-chip-avatar {
  background: rgba(99, 102, 241, 0.2);
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
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dark .selected-chip-name {
  color: #e2e8f0;
}
.selected-chip-meta {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #6366f1;
  font-family: 'Courier New', monospace;
  background: rgba(99, 102, 241, 0.08);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  white-space: nowrap;
}
.selected-chip-clear {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.375rem;
  border: none;
  background: rgba(79, 70, 229, 0.12);
  color: #6366f1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s ease;
}
.selected-chip-clear:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
}

/* ── Input wrapper ── */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 3rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  background: #ffffff;
  transition: all 0.2s ease;
  overflow: hidden;
}
.dark .input-wrapper {
  border-color: #2a2d37;
  background: #0f1115;
}
.input-wrapper:hover {
  border-color: #cbd5e1;
}
.dark .input-wrapper:hover {
  border-color: #3a3d47;
}
.input-wrapper.focused {
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08);
}
.dark .input-wrapper.focused {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
}
.input-wrapper.open {
  border-radius: 0.75rem 0.75rem 0 0;
  border-bottom-color: transparent;
}
.input-icon {
  padding-left: 0.875rem;
  padding-right: 0.875rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.dark .input-icon {
  color: #64748b;
}
.search-input {
  flex: 1;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  direction: inherit;
}
.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.dark .search-input {
  color: #e2e8f0;
}
.dark .search-input::placeholder {
  color: #64748b;
}
.input-clear {
  padding: 0.375rem;
  margin-right: 0.25rem;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}
.input-clear:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
}
.input-chevron {
  padding-right: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.dark .input-chevron {
  color: #64748b;
}
.input-chevron.rotated {
  transform: rotate(180deg);
}

/* ── Dropdown ── */
.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-top: 1px solid #f1f5f9;
  border-radius: 0 0 0.75rem 0.75rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 15px -3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
.dark .dropdown {
  background: #16181d;
  border-color: #2a2d37;
  border-top-color: #1e2028;
}
.dropdown-results {
  padding: 0;
}
.dropdown-count {
  padding: 0.5rem 0.875rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #94a3b8;
  border-bottom: 1px solid #f1f5f9;
  letter-spacing: 0.025em;
}
.dark .dropdown-count {
  color: #64748b;
  border-bottom-color: #1e2028;
}
.dropdown-scroll {
  max-height: 16rem;
  overflow-y: auto;
  padding: 0.25rem;
}
.dropdown-scroll::-webkit-scrollbar {
  width: 4px;
}
.dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.dropdown-scroll::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
:global(.dark) .dropdown-scroll::-webkit-scrollbar-thumb {
  background: #334155;
}

/* ── Result cards ── */
.result-card {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  padding: 0.625rem 0.625rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.12s ease;
}
.result-card:hover,
.result-card.active {
  background: #f8fafc;
}
.dark .result-card:hover,
.dark .result-card.active {
  background: rgba(79, 70, 229, 0.08);
}
.result-card.selected {
  background: #eef2ff;
}
.dark .result-card.selected {
  background: rgba(79, 70, 229, 0.15);
}
.result-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}
.dark .result-avatar {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(99, 102, 241, 0.1));
}
.result-avatar-text {
  font-size: 0.625rem;
  font-weight: 700;
  color: #4F46E5;
  letter-spacing: 0.05em;
}
.dark .result-avatar-text {
  color: #818cf8;
}
.result-info {
  flex: 1;
  min-width: 0;
}
.result-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
}
.dark .result-name {
  color: #e2e8f0;
}
.result-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
}
.result-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: #64748b;
  font-weight: 500;
}
.dark .result-meta-item {
  color: #94a3b8;
}

/* ── Empty state ── */
.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
}
.dropdown-empty-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  margin-top: 0.625rem;
}
.dark .dropdown-empty-title {
  color: #cbd5e1;
}
.dropdown-empty-hint {
  font-size: 0.6875rem;
  color: #94a3b8;
  margin-top: 0.25rem;
}
.dark .dropdown-empty-hint {
  color: #64748b;
}

/* ── Mark highlight ── */
:deep(mark) {
  background: rgba(99, 102, 241, 0.2);
  color: inherit;
  border-radius: 0.125rem;
  padding: 0 0.0625rem;
}

/* ── Transition ── */
.dropdown-enter-active {
  transition: all 0.15s ease;
}
.dropdown-leave-active {
  transition: all 0.1s ease;
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
