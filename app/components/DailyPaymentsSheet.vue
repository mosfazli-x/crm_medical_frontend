<script setup lang="ts">
import { onBeforeRouteLeave } from 'vue-router'
import type { DailyReportVisitType, PatientOption } from '~/types/report'

const props = defineProps<{
  patients: PatientOption[]
  visitTypes: DailyReportVisitType[]
}>()

const { t } = useI18n()
const { apiFetch } = useApi()
const { toDateStr, formatJalaliLong, formatPriceDetail } = useFormatting()
const categories = ['visit', 'mixed_laser', 'single_laser', 'colposcopy', 'co_test', 'miscellaneous'] as const
const amountFields = ['bankAmount', 'posAmount', 'cashAmount'] as const
type Category = typeof categories[number]
type AmountField = typeof amountFields[number]
type JoinedPatient = Pick<PatientOption, 'firstName' | 'lastName' | 'nationalId'>
interface SheetRecord {
  id: string
  reportDate: string
  patientId: string
  visitType: string
  category: Category
  bankAmount: string
  posAmount: string
  cashAmount: string
  patient?: JoinedPatient | null
}
interface SheetRow extends Omit<SheetRecord, 'patientId'> {
  patientId: string | null
  snapshot: string | null
  saving: boolean
  deleting: boolean
  attempted: boolean
  error: 'validation' | 'saveError' | 'deleteError' | null
}

const selectedDate = ref(toDateStr(new Date()))
const rows = ref<SheetRow[]>([])
const loading = ref(false)
const loadError = ref(false)
const savingAll = ref(false)
const sheetEl = ref<HTMLElement>()
const busy = computed(() => loading.value || savingAll.value || rows.value.some(row => row.saving || row.deleting))
const dirtyRows = computed(() => rows.value.filter(isDirty))
const headingDate = computed(() => formatJalaliLong(new Date(`${selectedDate.value}T12:00:00`)))
const visitNames = computed(() => [...new Set(props.visitTypes.filter(type => type.isActive && !type.isDeleted).map(type => type.name))])

// Join-only patients remain selectable even when the parent's patient list is paginated.
const patientItems = computed(() => {
  const items = new Map<string, { id: string; label: string }>()
  for (const patient of props.patients) {
    items.set(patient.id, { id: patient.id, label: patientLabel(patient) })
  }
  for (const row of rows.value) {
    if (row.patientId && !items.has(row.patientId)) {
      items.set(row.patientId, { id: row.patientId, label: row.patient ? patientLabel(row.patient) : row.patientId })
    }
  }
  return [...items.values()]
})

function patientLabel(patient: JoinedPatient) {
  return [patient.firstName, patient.lastName, patient.nationalId].filter(Boolean).join(' ')
}

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 1632)).replace(/٫/g, '.')
}

// Never sum floating-point currency. An empty payment cell explicitly means zero.
function cents(value: string): number | null {
  const normalized = normalizeDigits(value).trim()
  if (!normalized) return 0
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(normalized)) return null
  const [whole = '0', fraction = ''] = normalized.split('.')
  const result = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return result <= 999999999999 ? result : null
}

function snapshot(row: SheetRow) {
  return JSON.stringify([row.patientId, row.visitType, row.category, ...amountFields.map(field => cents(row[field]) ?? row[field])])
}
function isDirty(row: SheetRow) { return row.snapshot === null || row.snapshot !== snapshot(row) }
function rowTotal(row: SheetRow) {
  const values = amountFields.map(field => cents(row[field]))
  return values.some(value => value === null) ? null : values.reduce<number>((sum, value) => sum + (value ?? 0), 0)
}
const totals = computed(() => {
  const sums = { bankAmount: 0, posAmount: 0, cashAmount: 0, total: 0 }
  for (const row of rows.value) {
    for (const field of amountFields) sums[field] += cents(row[field]) ?? 0
  }
  sums.total = sums.bankAmount + sums.posAmount + sums.cashAmount
  return sums
})
const invalidAmounts = computed(() => rows.value.some(row => amountFields.some(field => cents(row[field]) === null)))
function money(value: number | null) {
  return value === null ? '—' : formatPriceDetail(value / 100).digits
}
function amountLabel(field: AmountField) {
  return t(`dailyReports.sheet.${field === 'bankAmount' ? 'bank' : field === 'posAmount' ? 'pos' : 'cash'}`)
}
function canDiscard() {
  return !busy.value && (!dirtyRows.value.length || window.confirm(t('dailyReports.sheet.discardConfirm')))
}

async function load() {
  loading.value = true
  loadError.value = false
  try {
    const result = await apiFetch<{ data: SheetRecord[] }>(`/api/daily-reports/sheet?date=${selectedDate.value}`)
    if (!Array.isArray(result.data)) throw new Error('Invalid sheet response')
    rows.value = result.data.map(record => {
      const row: SheetRow = { ...record, snapshot: null, saving: false, deleting: false, attempted: true, error: null }
      row.snapshot = snapshot(row)
      return row
    })
  } catch {
    loadError.value = true
  } finally {
    loading.value = false
  }
}
async function refresh() {
  if (!canDiscard()) return false
  await load()
  return !loadError.value
}
defineExpose({ refresh })

async function changeDate(value: string) {
  if (value === selectedDate.value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000-')) return
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime()) || toDateStr(parsed) !== value || !canDiscard()) return
  selectedDate.value = value
  rows.value = []
  await load()
}
function pickDate(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value
  // Restore immediately: a cancelled confirmation must also restore the native picker.
  input.value = selectedDate.value
  void changeDate(value)
}
function moveDate(offset: number) {
  const date = new Date(`${selectedDate.value}T12:00:00`)
  date.setDate(date.getDate() + offset)
  void changeDate(toDateStr(date))
}
async function addRow() {
  if (busy.value || loadError.value) return
  rows.value.push({
    id: crypto.randomUUID(), reportDate: selectedDate.value, patientId: null,
    visitType: '', category: 'visit', bankAmount: '', posAmount: '', cashAmount: '',
    snapshot: null, saving: false, deleting: false, attempted: false, error: null,
  })
  await nextTick()
  const last = sheetEl.value?.querySelector('tbody tr:last-child')
  last?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  last?.querySelector<HTMLInputElement>('input')?.focus()
}

async function saveRow(row: SheetRow): Promise<boolean> {
  row.error = null
  const amounts = amountFields.map(field => cents(row[field]))
  if (!row.patientId || !row.visitType.trim() || row.visitType.trim().length > 100
    || !categories.includes(row.category) || amounts.some(value => value === null)) {
    row.error = 'validation'
    return false
  }
  row.saving = true
  row.attempted = true
  try {
    const response = await apiFetch<{ data: SheetRecord }>(`/api/daily-reports/sheet/${row.id}`, {
      method: 'PUT',
      body: {
        reportDate: selectedDate.value, patientId: row.patientId, visitType: row.visitType.trim(), category: row.category,
        bankAmount: amounts[0]! / 100, posAmount: amounts[1]! / 100, cashAmount: amounts[2]! / 100,
      },
    })
    if (!response.data || response.data.id !== row.id) throw new Error('Invalid saved row')
    const patient = response.data.patient ?? (row.patientId === response.data.patientId ? row.patient : undefined)
    Object.assign(row, response.data, { patient })
    row.snapshot = snapshot(row)
    return true
  } catch {
    row.error = 'saveError'
    return false
  } finally {
    row.saving = false
  }
}
async function saveOne(row: SheetRow) {
  if (busy.value || !isDirty(row)) return
  await saveRow(row)
}
async function saveAll() {
  if (busy.value || !dirtyRows.value.length) return
  const changed = [...dirtyRows.value]
  savingAll.value = true
  try {
    // Only acknowledged rows get a new snapshot; failed rows stay dirty for retry.
    for (const row of changed) await saveRow(row)
  } finally {
    savingAll.value = false
  }
}
async function removeRow(row: SheetRow) {
  if (busy.value || !window.confirm(t('dailyReports.sheet.deleteConfirm'))) return
  if (row.snapshot !== null || row.attempted) {
    row.deleting = true
    row.error = null
    try {
      const result = await apiFetch<{ success: boolean }>(`/api/daily-reports/sheet/${row.id}`, { method: 'DELETE' })
      if (result.success !== true) throw new Error('Invalid delete response')
    } catch (error: unknown) {
      // A failed PUT may have reached the server. Delete its stable UUID as well;
      // a 404 then means there is nothing left to remove.
      const status = (error as { status?: number; response?: { status?: number } })
      if (status.status !== 404 && status.response?.status !== 404) {
        row.error = 'deleteError'
        return
      }
    } finally {
      row.deleting = false
    }
  }
  rows.value = rows.value.filter(item => item.id !== row.id)
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (dirtyRows.value.length || busy.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}
onBeforeRouteLeave((to) => {
  // A pending read must not trap navigation or block useApi's auth redirects.
  if (/\/login\/?$/.test(to.path)) return true
  if (savingAll.value || rows.value.some(row => row.saving || row.deleting)) return false
  return !dirtyRows.value.length || window.confirm(t('dailyReports.sheet.discardConfirm'))
})
onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload)
  void load()
})
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
</script>

<template>
  <section ref="sheetEl" class="payments-sheet" :aria-label="t('dailyReports.sheet.title')" :aria-busy="busy">
    <header class="sheet-header">
      <div class="sheet-heading">
        <span class="sheet-emblem" aria-hidden="true"><Icon name="lucide:table-2" /></span>
        <div>
          <h2>{{ t('dailyReports.sheet.title') }}</h2>
          <p>{{ t('dailyReports.sheet.subtitle') }}</p>
        </div>
      </div>
      <div class="header-actions">
        <button type="button" class="sheet-button" :disabled="busy || loadError" @click="addRow">
          <Icon name="lucide:plus" aria-hidden="true" />{{ t('dailyReports.sheet.addRow') }}
        </button>
        <button type="button" class="sheet-button primary" :disabled="busy || !dirtyRows.length || loadError" @click="saveAll">
          <Icon :name="savingAll ? 'lucide:loader-circle' : 'lucide:save'" :class="{ spinning: savingAll }" aria-hidden="true" />
          {{ t(savingAll ? 'dailyReports.sheet.saving' : 'dailyReports.sheet.saveAll') }}
          <span v-if="dirtyRows.length" class="button-count">{{ dirtyRows.length }}</span>
        </button>
      </div>
    </header>

    <div class="date-toolbar">
      <div class="date-navigation">
        <button type="button" class="icon-button" :aria-label="t('dailyReports.sheet.previousDay')" :disabled="busy" @click="moveDate(-1)">
          <Icon name="lucide:chevron-right" class="date-arrow" aria-hidden="true" />
        </button>
        <div class="date-caption"><span>{{ t('dailyReports.sheet.date') }}</span><strong>{{ headingDate }}</strong></div>
        <button type="button" class="icon-button" :aria-label="t('dailyReports.sheet.nextDay')" :disabled="busy" @click="moveDate(1)">
          <Icon name="lucide:chevron-left" class="date-arrow" aria-hidden="true" />
        </button>
      </div>
      <div class="date-controls">
        <input type="date" class="date-input" :value="selectedDate" min="0001-01-01" max="9999-12-31" :aria-label="t('dailyReports.sheet.date')" :disabled="busy" @change="pickDate">
        <button type="button" class="sheet-button quiet" :disabled="busy || selectedDate === toDateStr(new Date())" @click="changeDate(toDateStr(new Date()))">{{ t('dailyReports.sheet.today') }}</button>
      </div>
    </div>

    <div class="sheet-summary" aria-live="polite">
      <div class="summary-grand"><span>{{ t('dailyReports.sheet.total') }}</span><strong dir="auto">{{ money(totals.total) }} <small>{{ t('dailyReports.sheet.currency') }}</small></strong></div>
      <div v-for="field in amountFields" :key="field" class="summary-method"><span>{{ amountLabel(field) }}</span><strong>{{ money(totals[field]) }}</strong></div>
      <div class="summary-status"><span>{{ rows.length }} {{ t('dailyReports.sheet.rows') }}</span><strong :class="{ 'is-unsaved': dirtyRows.length }"><Icon :name="dirtyRows.length ? 'lucide:circle-dot' : 'lucide:check-check'" aria-hidden="true" />{{ dirtyRows.length ? `${dirtyRows.length} ${t('dailyReports.sheet.unsaved')}` : t('dailyReports.sheet.saved') }}</strong></div>
    </div>

    <div v-if="loading" class="sheet-state" role="status"><Icon name="lucide:loader-circle" class="spinning" aria-hidden="true" /><span>{{ t('common.loading') }}</span></div>
    <div v-else-if="loadError" class="sheet-state" role="alert">
      <Icon name="lucide:cloud-off" aria-hidden="true" /><h3>{{ t('dailyReports.sheet.loadError') }}</h3>
      <button type="button" class="sheet-button" :disabled="busy" @click="refresh"><Icon name="lucide:rotate-cw" aria-hidden="true" />{{ t('dailyReports.sheet.retry') }}</button>
    </div>
    <div v-else-if="!rows.length" class="sheet-state empty-state">
      <span class="empty-emblem"><Icon name="lucide:table-2" aria-hidden="true" /></span>
      <h3>{{ t('dailyReports.sheet.emptyTitle') }}</h3><p>{{ t('dailyReports.sheet.emptyDescription') }}</p>
      <button type="button" class="sheet-button" @click="addRow"><Icon name="lucide:plus" aria-hidden="true" />{{ t('dailyReports.sheet.addRow') }}</button>
    </div>
    <div v-else class="table-scroll" tabindex="0" role="region" :aria-label="t('dailyReports.sheet.title')">
      <table>
        <caption class="sr-only">{{ t('dailyReports.sheet.title') }} — {{ headingDate }}. {{ t('dailyReports.sheet.hint') }}</caption>
        <thead><tr>
          <th scope="col" class="row-number"><span class="sr-only">{{ t('dailyReports.sheet.rows') }}</span>#</th>
          <th scope="col" class="patient-column">{{ t('dailyReports.sheet.patient') }}</th>
          <th scope="col">{{ t('dailyReports.sheet.visitType') }}</th>
          <th scope="col">{{ t('dailyReports.sheet.category') }}</th>
          <th v-for="field in amountFields" :key="field" scope="col" class="amount-column">{{ amountLabel(field) }}<small>{{ t('dailyReports.sheet.currency') }}</small></th>
          <th scope="col" class="total-column">{{ t('dailyReports.sheet.total') }}</th>
          <th scope="col" class="actions-column">{{ t('dailyReports.sheet.actions') }}</th>
        </tr></thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="row.id" :class="{ 'dirty-row': isDirty(row), 'error-row': row.error }">
            <th scope="row" class="row-number"><span>{{ index + 1 }}</span><span class="row-marker" :class="{ dirty: isDirty(row) }" :title="t(isDirty(row) ? 'dailyReports.sheet.unsaved' : 'dailyReports.sheet.saved')" /><span class="sr-only">{{ t(isDirty(row) ? 'dailyReports.sheet.unsaved' : 'dailyReports.sheet.saved') }}</span></th>
            <td class="patient-column">
              <v-autocomplete v-model="row.patientId" :items="patientItems" item-title="label" item-value="id" :aria-label="`${t('dailyReports.sheet.patient')} ${index + 1}`" :placeholder="t('dailyReports.sheet.patient')" :disabled="busy" :error="row.error === 'validation' && !row.patientId" :menu-props="{ attach: 'body', maxHeight: 320 }" density="compact" variant="outlined" hide-details clearable autocomplete="off" class="patient-picker" />
            </td>
            <td><select v-model="row.visitType" :aria-label="`${t('dailyReports.sheet.visitType')} ${index + 1}`" :aria-invalid="row.error === 'validation' && !row.visitType" :disabled="busy"><option value="" disabled>{{ t('dailyReports.sheet.visitType') }}</option><option v-if="row.visitType && !visitNames.includes(row.visitType)" :value="row.visitType">{{ row.visitType }}</option><option v-for="name in visitNames" :key="name" :value="name">{{ name }}</option></select></td>
            <td><select v-model="row.category" :aria-label="`${t('dailyReports.sheet.category')} ${index + 1}`" :disabled="busy"><option v-for="category in categories" :key="category" :value="category">{{ t(`dailyReports.sheet.categories.${category}`) }}</option></select></td>
            <td v-for="field in amountFields" :key="field" class="amount-column"><input v-model="row[field]" type="text" inputmode="decimal" dir="ltr" autocomplete="off" placeholder="0.00" :aria-label="`${amountLabel(field)} ${index + 1}`" :aria-invalid="cents(row[field]) === null" :aria-describedby="cents(row[field]) === null || row.error ? `sheet-error-${row.id}` : undefined" :disabled="busy"></td>
            <td class="total-column"><strong>{{ money(rowTotal(row)) }}</strong></td>
            <td class="actions-column">
              <div class="row-actions">
                <button type="button" class="icon-button save-button" :disabled="busy || !isDirty(row)" :aria-label="`${t('dailyReports.sheet.saveRow')} ${index + 1}`" :title="t('dailyReports.sheet.saveRow')" @click="saveOne(row)"><Icon :name="row.saving ? 'lucide:loader-circle' : isDirty(row) ? 'lucide:save' : 'lucide:check'" :class="{ spinning: row.saving }" aria-hidden="true" /></button>
                <button type="button" class="icon-button remove-button" :disabled="busy" :aria-label="`${t('dailyReports.sheet.remove')} ${index + 1}`" :title="t('dailyReports.sheet.remove')" @click="removeRow(row)"><Icon :name="row.deleting ? 'lucide:loader-circle' : 'lucide:trash-2'" :class="{ spinning: row.deleting }" aria-hidden="true" /></button>
              </div>
              <p v-if="row.error || amountFields.some(field => cents(row[field]) === null)" :id="`sheet-error-${row.id}`" class="row-error" role="alert">{{ t(`dailyReports.sheet.${row.error || 'validation'}`) }}</p>
            </td>
          </tr>
        </tbody>
        <tfoot><tr><th colspan="4" scope="row">{{ t('dailyReports.sheet.total') }} <span class="footer-count">{{ rows.length }} {{ t('dailyReports.sheet.rows') }}</span></th><td v-for="field in amountFields" :key="field" class="amount-column">{{ money(totals[field]) }}</td><td class="total-column">{{ money(totals.total) }}</td><td><span class="footer-currency">{{ t('dailyReports.sheet.currency') }}</span></td></tr></tfoot>
      </table>
    </div>
    <footer class="sheet-footer">
      <p><Icon name="lucide:info" aria-hidden="true" />{{ t('dailyReports.sheet.independentNote') }}</p>
      <p :class="{ 'validation-note': invalidAmounts }" :role="invalidAmounts ? 'alert' : undefined">{{ t(invalidAmounts ? 'dailyReports.sheet.validation' : 'dailyReports.sheet.hint') }}</p>
    </footer>
  </section>
</template>

<style scoped>
.payments-sheet { color: var(--asa-label); background: var(--asa-bg-card); border: 1px solid var(--asa-card-ring); border-radius: 1.25rem; box-shadow: var(--asa-card-shadow); min-width: 0; overflow: hidden; font-size: .8125rem; line-height: 1.5; }
.sheet-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1.5rem; }
.sheet-heading, .header-actions, .date-navigation, .date-controls, .row-actions { display: flex; align-items: center; gap: .5rem; }
.sheet-heading { gap: .875rem; }
.sheet-emblem, .empty-emblem { display: grid; place-items: center; flex-shrink: 0; width: 2.75rem; height: 2.75rem; border-radius: .875rem; background: var(--asa-accent-soft); color: var(--asa-accent-deep); }
.sheet-emblem :deep(svg), .empty-emblem :deep(svg) { width: 1.375rem; height: 1.375rem; }
h2 { font-size: 1.125rem; font-weight: 750; margin: 0; letter-spacing: -.025em; }
.sheet-heading p { color: var(--asa-label-2); margin: .25rem 0 0; font-size: .75rem; }
.sheet-button, .icon-button { display: inline-flex; align-items: center; justify-content: center; gap: .5rem; border: 1px solid var(--asa-sep); border-radius: .625rem; background: var(--asa-bg-card); color: var(--asa-label); font: inherit; font-weight: 600; cursor: pointer; transition: background-color 150ms, border-color 150ms; }
.sheet-button { min-height: 2.5rem; padding: .5rem .875rem; }
.icon-button { width: 2.25rem; height: 2.25rem; flex-shrink: 0; }
.sheet-button :deep(svg), .icon-button :deep(svg), .sheet-footer :deep(svg), .summary-status :deep(svg) { width: 1rem; height: 1rem; flex-shrink: 0; }
.sheet-button:hover:not(:disabled), .icon-button:hover:not(:disabled) { background: var(--asa-accent-soft); border-color: var(--asa-accent); }
.primary { background: var(--asa-accent-soft); color: var(--asa-label); border-color: color-mix(in srgb, var(--asa-accent) 45%, var(--asa-sep)); }
.button-count { border-radius: .25rem; padding: 0 .375rem; background: color-mix(in srgb, var(--asa-accent) 25%, transparent); font-variant-numeric: tabular-nums; }
.quiet { border-color: transparent; background: transparent; color: var(--asa-accent-deep); }
button:disabled { opacity: .45; cursor: not-allowed; }
button:focus-visible, input:focus-visible, select:focus-visible, .table-scroll:focus-visible { outline: 2px solid var(--asa-accent-deep); outline-offset: 3px; }
.date-toolbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .75rem; padding: .875rem 1.5rem; background: color-mix(in srgb, var(--asa-label) 2%, var(--asa-bg-card)); border-block: 1px solid var(--asa-sep); }
.date-caption { display: flex; flex-direction: column; padding-inline: .5rem; min-width: 12rem; }
.date-caption > span { font-size: .625rem; color: var(--asa-label-2); }
.date-caption strong { font-size: .8125rem; font-weight: 650; }
:host-context([dir='rtl']) .date-arrow, :global([dir='rtl']) .payments-sheet .date-arrow { transform: scaleX(-1); }
.date-input { padding: .5rem .625rem; border: 1px solid var(--asa-sep); border-radius: .5rem; background: var(--asa-bg-card); color: var(--asa-label); font: inherit; color-scheme: light dark; direction: ltr; min-width: 0; }
.sheet-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 1.5rem; padding: 1.25rem 1.5rem; }
.sheet-summary > div { display: flex; flex-direction: column; gap: .25rem; }
.sheet-summary span { color: var(--asa-label-2); font-size: .6875rem; }
.sheet-summary strong { font-size: .875rem; font-variant-numeric: tabular-nums; }
.summary-grand { padding-inline-end: 1.5rem; border-inline-end: 1px solid var(--asa-sep); }
.summary-grand strong { font-size: 1.5rem; font-weight: 750; letter-spacing: -.035em; }
.summary-grand small { font-size: .6875rem; color: var(--asa-label-2); font-weight: 500; letter-spacing: normal; }
.summary-status { margin-inline-start: auto; }
.summary-status strong { display: flex; align-items: center; gap: .375rem; font-size: .75rem; color: var(--asa-label-2); }
.summary-status .is-unsaved { color: var(--asa-label); }
.table-scroll { max-width: 100%; overflow-x: auto; overscroll-behavior-x: contain; border-top: 1px solid var(--asa-sep); scrollbar-color: var(--asa-track) transparent; }
table { border-collapse: separate; border-spacing: 0; width: 100%; min-width: 75rem; text-align: start; }
th, td { padding: .625rem .5rem; border-bottom: 1px solid var(--asa-sep); vertical-align: middle; text-align: start; }
thead { background: color-mix(in srgb, var(--asa-label) 3%, var(--asa-bg-card)); }
thead th { font-size: .6875rem; color: var(--asa-label-2); font-weight: 650; padding-block: .75rem; white-space: nowrap; }
thead small { display: block; font-size: .5625rem; font-weight: 400; margin-top: .125rem; }
.row-number { width: 3rem; padding-inline: .875rem; font-size: .6875rem; text-align: center; font-variant-numeric: tabular-nums; color: var(--asa-label-2); }
.row-marker { display: block; width: .25rem; height: .25rem; margin: .25rem auto 0; border-radius: 50%; background: var(--asa-track); }
.row-marker.dirty { background: var(--asa-amber); }
.dirty-row > th { box-shadow: inset 3px 0 var(--asa-amber); }
:global([dir='rtl']) .payments-sheet .dirty-row > th { box-shadow: inset -3px 0 var(--asa-amber); }
tbody tr:hover { background: color-mix(in srgb, var(--asa-accent) 3%, transparent); }
.patient-column { width: 17rem; min-width: 17rem; }
select, .amount-column input { width: 100%; height: 2.5rem; border: 1px solid var(--asa-sep); border-radius: .5rem; background: var(--asa-bg-card); color: var(--asa-label); font: inherit; padding: .5rem; }
select { min-width: 9.5rem; max-width: 13rem; }
select:disabled, input:disabled { opacity: .6; }
.amount-column { width: 8.5rem; min-width: 8.5rem; text-align: end; font-variant-numeric: tabular-nums; }
.amount-column input { text-align: right; font-variant-numeric: tabular-nums; }
.amount-column input::placeholder { color: var(--asa-label-2); opacity: .7; }
[aria-invalid='true'] { border-color: var(--asa-rose) !important; background: var(--asa-rose-soft) !important; }
.total-column { text-align: end; min-width: 9rem; padding-inline: .875rem; font-variant-numeric: tabular-nums; background: color-mix(in srgb, var(--asa-accent) 4%, transparent); }
.actions-column { min-width: 6.5rem; width: 6.5rem; }
.row-actions { justify-content: center; gap: .25rem; }
.row-actions .icon-button { border-color: transparent; background: transparent; }
.save-button { color: var(--asa-accent-deep); }
.remove-button { color: var(--asa-label-2); }
.remove-button:hover:not(:disabled) { color: var(--asa-rose); background: var(--asa-rose-soft); border-color: transparent; }
.row-error { color: var(--asa-label); background: var(--asa-rose-soft); border-inline-start: 2px solid var(--asa-rose); padding: .375rem; margin: .375rem 0 0; font-size: .625rem; min-width: 9rem; }
.patient-picker :deep(.v-field) { border-radius: .5rem; font-size: .8125rem; color: var(--asa-label); background: var(--asa-bg-card); }
.patient-picker :deep(.v-field__outline) { --v-field-border-opacity: .2; }
.patient-picker :deep(.v-field__input) { min-height: 2.5rem; padding-block: .375rem; }
.patient-picker :deep(.v-field__append-inner) { padding-top: .5rem; }
tfoot { background: color-mix(in srgb, var(--asa-accent) 6%, var(--asa-bg-card)); font-weight: 700; }
tfoot td, tfoot th { padding-block: 1rem; border-bottom: 0; }
tfoot th { padding-inline-start: 1.25rem; }
.footer-count { margin-inline-start: .75rem; color: var(--asa-label-2); font-size: .6875rem; font-weight: 400; }
.footer-currency { color: var(--asa-label-2); font-size: .625rem; font-weight: 400; }
.sheet-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .5rem 1rem; padding: .875rem 1.5rem; border-top: 1px solid var(--asa-sep); color: var(--asa-label-2); font-size: .6875rem; }
.sheet-footer p { display: flex; align-items: center; gap: .375rem; margin: 0; }
.validation-note { color: var(--asa-label); background: var(--asa-rose-soft); border-radius: .375rem; padding: .25rem .5rem; }
.sheet-state { min-height: 16rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .75rem; text-align: center; padding: 2rem; border-top: 1px solid var(--asa-sep); color: var(--asa-label-2); }
.sheet-state > :deep(svg) { width: 1.75rem; height: 1.75rem; }
.sheet-state h3 { font-size: .9375rem; color: var(--asa-label); margin: 0; }
.sheet-state p { font-size: .8125rem; margin: 0; max-width: 30rem; }
.empty-emblem { width: 3.5rem; height: 3.5rem; border-radius: 1rem; margin-bottom: .25rem; }
.empty-state .sheet-button { margin-top: .5rem; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.spinning { animation: sheet-spin 1s linear infinite; }
@keyframes sheet-spin { to { transform: rotate(360deg); } }
@media (max-width: 640px) {
  .sheet-header { flex-direction: column; align-items: stretch; padding: 1rem; }
  .header-actions { flex-wrap: wrap; }
  .header-actions .sheet-button { flex: 1; }
  .date-toolbar, .sheet-summary, .sheet-footer { padding: 1rem; }
  .date-navigation { width: 100%; justify-content: space-between; }
  .date-caption { min-width: 0; text-align: center; }
  .date-controls { width: 100%; }
  .date-input { flex: 1; }
  .sheet-summary { gap: 1rem; }
  .summary-grand { width: 100%; border-inline-end: 0; padding: 0 0 .75rem; border-bottom: 1px solid var(--asa-sep); }
  .summary-status { margin-inline-start: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .spinning { animation: none; }
  .sheet-button, .icon-button { transition: none; }
}
</style>
