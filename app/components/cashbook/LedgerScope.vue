<template>
  <div ref="rootEl" class="cbls" :class="{ 'cbls--rtl': isRtl }">
    <button
      ref="triggerEl"
      type="button"
      class="cbls__trigger"
      :class="{
        'cbls__trigger--static': !selectable,
        'cbls__trigger--active': isForeign,
        'cbls__trigger--open': isOpen,
      }"
      :aria-label="triggerLabel"
      :aria-haspopup="selectable ? 'listbox' : undefined"
      :aria-expanded="selectable ? isOpen : undefined"
      :aria-controls="selectable ? listboxId : undefined"
      :aria-activedescendant="isOpen && selectable ? optionId(activeIndex) : undefined"
      :aria-disabled="!selectable"
      @click="onTriggerClick"
      @keydown.down.prevent="onKey(1)"
      @keydown.up.prevent="onKey(-1)"
      @keydown.enter.prevent="onConfirm"
      @keydown.space.prevent="onConfirm"
      @keydown.esc="close(true)"
    >
      <span class="cbls__icon" :class="isForeign ? 'cbls__icon--foreign' : 'cbls__icon--own'">
        <v-icon size="20">{{ isForeign ? 'mdi-account-tie-outline' : 'mdi-wallet-outline' }}</v-icon>
      </span>

      <span class="cbls__copy">
        <span class="cbls__eyebrow">{{ t('cashbook.ledgerOwner') }}</span>
        <span class="cbls__value">{{ selectedName }}</span>
        <span v-if="isForeign" class="cbls__flag">
          <v-icon size="12">mdi-eye-outline</v-icon>
          {{ t('cashbook.viewOnly') }}
        </span>
        <span v-else class="cbls__hint">{{ selfName }}</span>
      </span>

      <v-icon v-if="selectable" class="cbls__chevron" size="18" :class="{ 'is-open': isOpen }">mdi-chevron-down</v-icon>
    </button>

    <Transition name="cbls-pop">
      <div
        v-if="isOpen"
        class="cbls__menu"
        @keydown.esc="close(true)"
      >
        <div v-if="showSearch" class="cbls__search">
          <v-icon size="16">mdi-magnify</v-icon>
          <input
            ref="searchEl"
            v-model="query"
            type="text"
            :placeholder="t('cashbook.ownerSearch')"
            :aria-label="t('cashbook.ownerSearch')"
            @keydown.down.prevent="onKey(1)"
            @keydown.up.prevent="onKey(-1)"
            @keydown.enter.prevent="onConfirm"
            @keydown.esc="close(true)"
          >
          <button v-if="query" type="button" class="cbls__search-clear" :aria-label="t('common.clear')" @click="query = ''">
            <v-icon size="14">mdi-close</v-icon>
          </button>
        </div>

        <div
          :id="listboxId"
          class="cbls__list"
          role="listbox"
          :aria-label="t('cashbook.ledgerOwner')"
        >
          <button
            v-for="(option, index) in options"
            :id="optionId(index)"
            :key="option.key"
            :ref="(el) => setOptionEl(el, index)"
            type="button"
            role="option"
            class="cbls__option"
            :class="{
              'is-selected': option.key === selectedKey,
              'is-active': index === activeIndex,
            }"
            :aria-selected="option.key === selectedKey"
            :tabindex="index === activeIndex || (activeIndex < 0 && index === 0) ? 0 : -1"
            @click="pick(index)"
            @mouseenter="activeIndex = index"
          >
            <span v-if="option.key === OWN_KEY" class="cbls__avatar cbls__avatar--own">
              <v-icon size="15">mdi-account-outline</v-icon>
            </span>
            <span v-else class="cbls__avatar">{{ option.initials }}</span>

            <span class="cbls__option-copy">
              <span class="cbls__option-name">{{ option.name }}</span>
              <span class="cbls__option-meta">{{ option.meta }}</span>
            </span>

            <v-icon v-if="option.key === selectedKey" class="cbls__check" size="18">mdi-check</v-icon>
          </button>

          <p v-if="!options.length" class="cbls__empty">
            <v-icon size="20">mdi-account-search-outline</v-icon>
            {{ t('cashbook.noOwnersFound') }}
          </p>
        </div>

        <p class="cbls__menu-foot">
          <v-icon size="13">mdi-information-outline</v-icon>
          {{ t('cashbook.ledgerScopeHint') }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { CashbookOwner } from '~/types/finance'

const OWN_KEY = '__own__'

const { t, locale } = useI18n()

const isRtl = computed(() => locale.value === 'fa')

const props = withDefaults(defineProps<{
  modelValue: string | null
  owners: CashbookOwner[]
  selfName?: string
  selfId?: string
  selectable?: boolean
}>(), {
  selfName: '',
  selfId: '',
  selectable: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()

const rootEl = ref<HTMLElement>()
const triggerEl = ref<HTMLButtonElement>()
const searchEl = ref<HTMLInputElement>()
const optionEls = ref<HTMLElement[]>([])
const isOpen = ref(false)
const query = ref('')
const activeIndex = ref(-1)

const listboxId = 'cbls-listbox'
function optionId(index: number): string {
  return `${listboxId}-opt-${index}`
}

const selfName = computed(() => props.selfName || t('cashbook.myLedger'))
/* The "My ledger" row already represents the signed-in user, so the owner list
   must not repeat them. */
const otherOwners = computed(() => props.owners.filter((owner) => owner.id !== props.selfId))
const selectedOwner = computed(() =>
  otherOwners.value.find((owner) => owner.id === props.modelValue) || null,
)
const isForeign = computed(() => !!selectedOwner.value)
const selectedKey = computed(() => props.modelValue || OWN_KEY)
const selectedName = computed(() => selectedOwner.value?.fullName || t('cashbook.myLedger'))
const showSearch = computed(() => otherOwners.value.length > 5)

interface ScopeOption {
  key: string
  id: string | null
  name: string
  meta: string
  initials: string
}

const options = computed<ScopeOption[]>(() => {
  const list: ScopeOption[] = [{
    key: OWN_KEY,
    id: null,
    name: t('cashbook.myLedger'),
    meta: selfName.value,
    initials: '',
  }]
  const needle = query.value.trim().toLowerCase()
  for (const owner of otherOwners.value) {
    const name = owner.fullName || owner.id
    if (needle && !name.toLowerCase().includes(needle)) continue
    list.push({
      key: owner.id,
      id: owner.id,
      name,
      meta: t(owner.role === 'admin_doctor' ? 'cashbook.roleManager' : 'cashbook.roleDoctor'),
      initials: initials(name),
    })
  }
  return list
})

const triggerLabel = computed(() =>
  `${t('cashbook.ledgerOwner')}: ${selectedName.value}`,
)

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '—'
  if (parts.length === 1) return parts[0]!.slice(0, 1)
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`
}

function toggle() {
  if (!props.selectable) return
  if (isOpen.value) close()
  else open()
}

function open() {
  if (!props.selectable) return
  query.value = ''
  isOpen.value = true
  activeIndex.value = Math.max(0, options.value.findIndex((option) => option.key === selectedKey.value))
  nextTick(() => searchEl.value?.focus())
}

function close(restoreFocus = false) {
  isOpen.value = false
  activeIndex.value = -1
  /* Only on keyboard dismissal: an outside click must keep the focus it took. */
  if (restoreFocus) nextTick(() => triggerEl.value?.focus())
}

function pick(index: number) {
  const option = options.value[index]
  if (!option) return
  emit('update:modelValue', option.id)
  close()
}

function onTriggerClick() {
  if (!props.selectable) return
  toggle()
}

function onConfirm() {
  if (!props.selectable) return
  if (isOpen.value) pick(activeIndex.value)
  else toggle()
}

function onKey(direction: 1 | -1) {
  if (!props.selectable) return
  /* Arrow keys open the listbox from a closed combobox, per the ARIA pattern. */
  if (!isOpen.value) {
    open()
    return
  }
  const total = options.value.length
  if (!total) return
  const from = activeIndex.value < 0 ? (direction === 1 ? -1 : 0) : activeIndex.value
  activeIndex.value = (from + direction + total) % total
  scrollActiveIntoView()
}

function scrollActiveIntoView() {
  nextTick(() => {
    optionEls.value[activeIndex.value]?.scrollIntoView({ block: 'nearest' })
  })
}

function setOptionEl(el: unknown, index: number) {
  if (el instanceof HTMLElement) optionEls.value[index] = el
}

function onPointerDown(event: MouseEvent) {
  if (!rootEl.value?.contains(event.target as Node)) close()
}

onMounted(() => document.addEventListener('mousedown', onPointerDown))
onUnmounted(() => document.removeEventListener('mousedown', onPointerDown))
</script>

<style scoped>
.cbls {
  position: relative;
  min-width: 0;
  flex: 1 1 15rem;
  max-width: 24rem;
}

.cbls__trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 4.25rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--asa-sep);
  border-radius: 1.125rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  color: var(--asa-label);
  text-align: start;
  cursor: pointer;
  transition: background-color 180ms var(--ease-default), border-color 180ms var(--ease-default),
    box-shadow 180ms var(--ease-default), transform 150ms var(--ease-default);
}

.cbls__trigger:hover {
  background: color-mix(in srgb, var(--asa-label) 5.5%, transparent);
  border-color: color-mix(in srgb, var(--asa-accent) 30%, transparent);
}

.cbls__trigger:active {
  transform: scale(0.994);
}

.cbls__trigger:focus-visible {
  outline: none;
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 22%, transparent);
}

.cbls__trigger--active {
  border-color: color-mix(in srgb, var(--asa-amber) 34%, transparent);
  background: color-mix(in srgb, var(--asa-amber) 7%, transparent);
}

.cbls__trigger--open {
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.cbls__trigger--static {
  cursor: default;
}

.cbls__trigger--static:hover {
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  border-color: var(--asa-sep);
}

.cbls__trigger--static:active {
  transform: none;
}

.cbls__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.875rem;
  flex-shrink: 0;
  transition: background-color 180ms var(--ease-default), color 180ms var(--ease-default);
}

.cbls__icon--own {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .cbls__icon--own {
  color: var(--asa-accent);
}

.cbls__icon--foreign {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.cbls__copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.0625rem;
  min-width: 0;
  flex: 1;
}

.cbls__eyebrow {
  color: var(--asa-label-2);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.09em;
  line-height: 1.2;
  text-transform: uppercase;
}

/* Letter-spacing breaks Arabic-script cursive joining, so it is LTR-only. */
.cbls--rtl .cbls__eyebrow {
  letter-spacing: 0;
}

.cbls__value {
  max-width: 100%;
  overflow: hidden;
  color: var(--asa-label);
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cbls__hint {
  max-width: 100%;
  overflow: hidden;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cbls__flag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--asa-amber);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
}

.cbls__chevron {
  flex-shrink: 0;
  color: var(--asa-label-2);
  transition: transform 220ms var(--ease-default), color 180ms var(--ease-default);
}

.cbls__chevron.is-open {
  transform: rotate(180deg);
  color: var(--asa-accent);
}

/* â”€â”€ Menu â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

.cbls__menu {
  position: absolute;
  inset-inline-start: 0;
  inset-inline-end: 0;
  top: calc(100% + 0.5rem);
  z-index: 70;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1rem;
  background: var(--asa-bg-card);
  box-shadow: 0 2px 6px rgba(17, 24, 39, 0.05), 0 24px 48px -18px rgba(17, 24, 39, 0.28);
}

.cbls__search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--asa-sep);
  color: var(--asa-label-2);
}

.cbls__search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font: inherit;
  font-size: 0.8125rem;
  direction: inherit;
}

.cbls__search input::placeholder {
  color: var(--asa-label-2);
}

.cbls__search-clear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.cbls__search-clear:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.cbls__list {
  max-height: 17rem;
  overflow-y: auto;
  padding: 0.375rem;
}

.cbls__list::-webkit-scrollbar {
  width: 4px;
}

.cbls__list::-webkit-scrollbar-track {
  background: transparent;
}

.cbls__list::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: color-mix(in srgb, var(--asa-label) 22%, transparent);
}

.cbls__option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.5rem;
  border: none;
  border-radius: 0.75rem;
  background: transparent;
  color: var(--asa-label);
  text-align: start;
  cursor: pointer;
  transition: background-color 130ms var(--ease-default);
}

.cbls__option.is-active {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.cbls__option.is-selected {
  background: var(--asa-accent-soft);
}

.cbls__option:focus-visible {
  outline: 2px solid var(--asa-accent);
  outline-offset: -2px;
}

.cbls__option + .cbls__option {
  margin-top: 0.125rem;
  padding-top: 0.5625rem;
  box-shadow: inset 0 1px 0 var(--asa-sep);
}

.cbls__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--asa-indigo) 14%, transparent);
  color: var(--asa-indigo);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.dark .cbls__avatar {
  color: var(--asa-indigo);
}

.cbls__avatar--own {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .cbls__avatar--own {
  color: var(--asa-accent);
}

.cbls__option-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.cbls__option-name {
  overflow: hidden;
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cbls__option-meta {
  color: var(--asa-label-2);
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.4;
}

.cbls__check {
  flex-shrink: 0;
  color: var(--asa-accent-deep);
}

.dark .cbls__check {
  color: var(--asa-accent);
}

.cbls__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem 0.75rem;
  color: var(--asa-label-2);
  font-size: 0.75rem;
  text-align: center;
}

.cbls__menu-foot {
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
  padding: 0.625rem 0.875rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
  color: var(--asa-label-2);
  font-size: 0.625rem;
  line-height: 1.5;
}

.cbls-pop-enter-active {
  transition: opacity 160ms var(--ease-default), transform 160ms var(--ease-default);
}

.cbls-pop-leave-active {
  transition: opacity 110ms var(--ease-default), transform 110ms var(--ease-default);
}

.cbls-pop-enter-from,
.cbls-pop-leave-to {
  opacity: 0;
  transform: translateY(-0.375rem) scale(0.985);
}

@media (max-width: 700px) {
  /* Shares the row with the refresh button; the hint ellipsis absorbs the squeeze. */
  .cbls {
    flex: 1 1 0;
    max-width: none;
    order: 1;
  }
}
</style>
