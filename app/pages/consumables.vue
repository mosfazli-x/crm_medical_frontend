<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('consumables.title') }}</h1>
        <p class="dash-head__date">{{ t('consumables.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button class="asa-btn asa-btn--ghost" :disabled="exporting" :aria-label="t('consumables.exportExcel')"
          @click="exportExcel">
          <Download v-if="!exporting" class="w-4! h-4! stroke-current" />
          <v-icon v-else size="16" class="sc-spin">mdi-loading</v-icon>
          <span class="hidden sm:!inline">{{ t('consumables.exportExcel') }}</span>
        </button>
        <button v-if="isAdmin" class="asa-btn asa-btn--primary" :aria-label="t('consumables.addItem')"
          @click="openAddItem">
          <Plus class="w-4! h-4! stroke-current" />
          <span>{{ t('consumables.addItem') }}</span>
        </button>
      </div>
    </header>

    <!-- ─── Summary metrics ─── -->
    <div v-if="!report" class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
      <div v-for="i in 3" :key="`cm-${i}`" class="asa-skel rounded-[22px]! h-28!" />
    </div>
    <div v-else class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
      <div class="asa-card sc-metric">
        <div class="asa-tint asa-tint--teal">
          <Wallet class="w-5! h-5! fill-current" />
        </div>
        <div class="sc-metric__copy">
          <p class="sc-metric__value" dir="ltr">{{ formatPrice(liveTotal) }}</p>
          <p class="sc-metric__label">{{ t('consumables.totalMonthExpense') }}</p>
        </div>
      </div>

      <div class="asa-card sc-metric">
        <div class="asa-tint asa-tint--green">
          <ClipboardCheck class="w-5! h-5! fill-current" />
        </div>
        <div class="sc-metric__copy">
          <p class="sc-metric__value asa-green">{{ pn(report.recordedCount) }}</p>
          <p class="sc-metric__label">{{ t('consumables.recordedItems') }}</p>
        </div>
      </div>

      <div class="asa-card sc-metric">
        <div class="asa-tint asa-tint--indigo">
          <Calendar class="w-5! h-5! fill-current" />
        </div>
        <div class="sc-metric__copy">
          <p class="sc-metric__value">{{ pn(monthsList.length) }}</p>
          <p class="sc-metric__label">{{ t('consumables.monthsRecorded') }}</p>
        </div>
      </div>
    </div>

    <!-- ─── Monthly items card ─── -->
    <div class="asa-card sc-card mt-5!">
      <div class="sc-card__head">
        <div class="sc-card__head-copy">
          <h2 class="asa-card-title">{{ monthLabel }}</h2>
          <p v-if="report" class="asa-card-sub">{{ recordedOf }}</p>
        </div>
        <div class="sc-card__head-actions">
          <span v-if="report && report.recordedCount > 0" class="sc-pill sc-pill--teal">
            {{ pn(report.recordedCount) }} · {{ t('consumables.recordedItems') }}
          </span>
          <button v-if="isAdmin" class="asa-btn asa-btn--primary asa-btn--sm"
            :disabled="saving || reportLoading || !report" :aria-label="t('consumables.saveMonth')" @click="saveMonth">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-content-save-outline</v-icon>
              <span>{{ t('consumables.saveMonth') }}</span>
            </template>
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="sc-toolbar">
        <div class="sc-navseg" :aria-label="t('consumables.monthLabel')">
          <button class="sc-navseg__btn" :aria-label="t('consumables.previousMonth')" @click="shiftMonth(-1)">
            <v-icon size="16">{{ prevIcon }}</v-icon>
          </button>
          <button class="sc-navseg__label" :title="t('consumables.currentMonth')" @click="goToday">
            {{ monthLabel }}
          </button>
          <button class="sc-navseg__btn" :aria-label="t('consumables.nextMonth')" @click="shiftMonth(1)">
            <v-icon size="16">{{ nextIcon }}</v-icon>
          </button>
        </div>
        <div class="sc-spacer" />
        <div class="sc-field sc-field--mini">
          <v-select v-model="year" :items="yearOptions" variant="solo" density="comfortable" hide-details="auto"
            :aria-label="t('consumables.yearLabel')" />
        </div>
        <div class="sc-field sc-field--mini">
          <v-select v-model="month" :items="monthOptions" item-title="label" item-value="value" variant="solo"
            density="comfortable" hide-details="auto" :aria-label="t('consumables.monthLabel')" />
        </div>
        <button class="sc-icon-btn" :disabled="reportLoading" :aria-label="t('consumables.refresh')"
          @click="refreshAll">
          <v-icon size="16" :class="{ 'sc-spin': reportLoading }">mdi-refresh</v-icon>
        </button>
      </div>

      <!-- Body -->
      <div v-if="reportLoading && !report" class="sc-skel">
        <div v-for="i in 5" :key="`csk-${i}`" class="sc-skel__row">
          <div class="asa-skel h-10! w-10! rounded-xl! sc-skel__av" />
          <div class="sc-skel__lines">
            <div class="asa-skel h-3.5! w-44! rounded-md!" />
            <div class="asa-skel h-3! w-28! rounded-md! sc-skel__line-sub" />
          </div>
          <div class="asa-skel h-8! w-24! rounded-lg!" />
        </div>
      </div>

      <template v-else-if="report">
        <div v-if="report.items.length === 0" class="sc-empty">
          <div class="asa-tint asa-tint--teal sc-empty__tint">
            <Basket class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="sc-empty__title">{{ t('consumables.noItems') }}</p>
            <p class="sc-empty__desc">{{ t('consumables.emptyMonth') }}</p>
          </div>
        </div>

        <div v-else class="sc-list__body">
          <article v-for="(row, index) in report.items" :key="row.id" class="sc-exp-row"
            :class="{ 'sc-exp-row--off': !row.isActive }">
            <span class="sc-exp-row__idx" dir="ltr">{{ pn(index + 1) }}</span>

            <div class="sc-exp-row__main">
              <p class="sc-exp-row__name">{{ row.name }}</p>
              <div v-if="!row.isActive" class="sc-exp-row__pills">
                <span class="sc-pill sc-pill--amber">{{ t('consumables.inactive') }}</span>
              </div>
            </div>

            <div class="sc-exp-row__amount">
              <div v-if="isAdmin && row.isActive" class="sc-field">
                <v-text-field v-model.number="row.amount" variant="solo" density="compact" type="number" min="0"
                  hide-details :aria-label="t('consumables.amount')" />
              </div>
              <p v-else class="sc-exp-row__num" dir="ltr">{{ formatNumber(row.amount) }}</p>
            </div>

            <div class="sc-exp-row__notes">
              <div v-if="isAdmin && row.isActive" class="sc-field">
                <v-text-field v-model="row.notes" variant="solo" density="compact" hide-details
                  :placeholder="t('consumables.notes')" />
              </div>
              <p v-else class="sc-exp-row__note">{{ row.notes || '—' }}</p>
            </div>

            <div v-if="isAdmin" class="sc-exp-row__actions">
              <button class="sc-icon-btn" :title="t('common.edit')" :aria-label="t('common.edit')"
                @click="openEditItem(row)">
                <v-icon size="16">mdi-pencil-outline</v-icon>
              </button>
              <button v-if="row.isActive" class="sc-icon-btn sc-icon-btn--danger" :title="t('common.delete')"
                :aria-label="t('common.delete')" @click="confirmDeleteItem(row)">
                <TrashBin class="w-4! h-4! fill-current" />
              </button>
            </div>
          </article>
        </div>

        <div class="sc-foot">
          <p class="sc-foot__label">{{ t('consumables.total') }}</p>
          <p class="sc-foot__value" dir="ltr">{{ formatPrice(liveTotal) }}</p>
        </div>
      </template>
    </div>

    <!-- ─── Month history card ─── -->
    <div class="asa-card sc-card mt-5!">
      <div class="sc-card__head">
        <div class="sc-card__head-copy">
          <h2 class="asa-card-title">{{ t('consumables.monthHistory') }}</h2>
          <p class="asa-card-sub">{{ t('consumables.monthsRecorded') }}</p>
        </div>
        <div class="sc-card__head-actions">
          <span class="sc-pill sc-pill--indigo">{{ pn(monthsList.length) }}</span>
        </div>
      </div>

      <div v-if="monthsLoading" class="sc-skel">
        <div v-for="i in 3" :key="`hsk-${i}`" class="sc-skel__row">
          <div class="asa-skel h-10! w-10! rounded-xl!" />
          <div class="sc-skel__lines">
            <div class="asa-skel h-3.5! w-36! rounded-md!" />
            <div class="asa-skel h-3! w-24! rounded-md! sc-skel__line-sub" />
          </div>
        </div>
      </div>

      <div v-else-if="monthsList.length === 0" class="sc-empty">
        <div class="asa-tint asa-tint--indigo sc-empty__tint">
          <Calendar class="w-6! h-6! fill-current" />
        </div>
        <div>
          <p class="sc-empty__title">{{ t('consumables.emptyMonth') }}</p>
          <p class="sc-empty__desc">{{ t('consumables.monthHistory') }}</p>
        </div>
      </div>

      <div v-else class="sc-list__body sc-hlist">
        <article v-for="entry in monthsList" :key="entry.month" class="sc-hrow"
          :class="{ 'sc-hrow--on': entry.month === selectedMonth }">
          <div class="asa-tint asa-tint--teal asa-tint--sm sc-hrow__tint">
            <Calendar class="w-4! h-4! fill-current" />
          </div>
          <div class="sc-hrow__main">
            <p class="sc-hrow__month">{{ monthNameFromKey(entry.month) }}</p>
            <p class="sc-hrow__meta">
              <span class="sc-pill sc-pill--green">{{ pn(entry.count) }} · {{ t('consumables.recordedItems') }}</span>
              <span v-if="entry.month === selectedMonth" class="sc-pill sc-pill--teal">
                {{ t('consumables.currentMonth') }}
              </span>
            </p>
          </div>
          <div class="sc-hrow__end">
            <p class="sc-hrow__total" dir="ltr">{{ formatPrice(entry.total) }}</p>
            <button class="sc-icon-btn sc-hrow__go" :aria-label="monthNameFromKey(entry.month)"
              @click="jumpToMonth(entry.month)">
              <v-icon size="16">{{ nextIcon }}</v-icon>
            </button>
          </div>
        </article>
      </div>
    </div>

    <!-- ─── Add / Edit item dialog ─── -->
    <v-dialog v-model="itemDialog" max-width="480" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ editingItem ? t('consumables.editItem') : t('consumables.addItem') }}</h2>
            <span class="asa-dialog__sub">{{ t('consumables.title') }}</span>
          </div>
          <button class="sc-x" :aria-label="t('common.close')" @click="itemDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div class="sc-fields">
            <div class="sc-field">
              <span class="asa-field-label">{{ t('consumables.itemNameLabel') }}</span>
              <v-text-field v-model="itemForm.name" :placeholder="t('consumables.itemNameLabel')" variant="solo"
                density="comfortable" hide-details="auto" append-inner-icon="mdi-draw-pen"
                @click:append-inner="openHandwriting('name')" />
            </div>
            <div v-if="editingItem" class="sc-inactive">
              <span class="sc-inactive__label">{{ t('consumables.inactive') }}</span>
              <v-switch v-model="itemInactive" color="#D70015" hide-details density="compact" />
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="itemDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="savingItem" @click="saveItem">
            <v-progress-circular v-if="savingItem" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-check</v-icon>
              <span>{{ t('common.save') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Delete item confirm ─── -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('consumables.deleteItemConfirm') }}</h2>
            <span class="asa-dialog__sub">{{ t('consumables.inactive') }}</span>
          </div>
          <button class="sc-x" :aria-label="t('common.close')" @click="deleteDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="deleteDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--rose asa-btn--sm" :disabled="deleting" @click="executeDeleteItem">
            <v-progress-circular v-if="deleting" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-trash-can-outline</v-icon>
              <span>{{ t('common.delete') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric"
      @insert="applyHandwriting" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import moment from 'moment-jalaali'
import Plus from '~/components/icons/Plus.vue'
import Download from '~/components/icons/Download.vue'
import Wallet from '~/components/icons/Wallet.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import Calendar from '~/components/icons/Calendar.vue'
import Basket from '~/components/icons/Basket.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { useApi } from '~/composables/useApi'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

interface ReportRow {
  id: string
  name: string
  sortOrder: number
  isActive: boolean
  amount: number
  notes: string | null
}

interface MonthReport {
  month: string
  total: number
  recordedCount: number
  items: ReportRow[]
}

interface MonthSummary {
  month: string
  total: number
  count: number
}

const { t, locale } = useI18n()
const { pn, isRtl } = useLang()
const { formatPrice } = useFormatting()
const { apiFetch } = useApi()
const { user, token } = useAuth()
const { $toast } = useNuxtApp()

const isFa = computed(() => locale.value === 'fa')
const role = computed(() => user.value?.role || '')
const isAdmin = computed(() => role.value === 'admin_doctor')

// ─── Jalali month navigation ───
const FA_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
const EN_MONTHS = ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar', 'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand']

const monthNames = computed(() => (isFa.value ? FA_MONTHS : EN_MONTHS))

const year = ref(moment().format('jYYYY'))
const month = ref(moment().format('jMM'))
const selectedMonth = computed(() => `${year.value}-${month.value}`)

const yearOptions = computed(() => {
  const current = Number(moment().format('jYYYY'))
  const list: number[] = []
  for (let y = current - 6; y <= current + 2; y++) list.push(y)
  return list.map(String)
})

const monthOptions = computed(() =>
  monthNames.value.map((name, index) => ({ label: name, value: String(index + 1).padStart(2, '0') }))
)

const monthLabel = computed(() => `${monthNames.value[Number(month.value) - 1] || month.value} ${year.value}`)

const shiftMonth = (delta: number) => {
  let y = Number(year.value)
  let m = Number(month.value) + delta
  if (m < 1) { m = 12; y -= 1 }
  if (m > 12) { m = 1; y += 1 }
  year.value = String(y)
  month.value = String(m).padStart(2, '0')
}

const goToday = () => {
  year.value = moment().format('jYYYY')
  month.value = moment().format('jMM')
}

const prevIcon = computed(() => (isRtl.value ? 'mdi-chevron-right' : 'mdi-chevron-left'))
const nextIcon = computed(() => (isRtl.value ? 'mdi-chevron-left' : 'mdi-chevron-right'))

const monthNameFromKey = (key: string) => {
  const [y, m] = key.split('-')
  return `${monthNames.value[Number(m) - 1] || m} ${y}`
}

const jumpToMonth = (key: string) => {
  const [y, m] = key.split('-')
  year.value = y
  month.value = m
}

// ─── Data ───
const report = ref<MonthReport | null>(null)
const reportLoading = ref(false)
const monthsList = ref<MonthSummary[]>([])
const monthsLoading = ref(false)

const liveTotal = computed(() =>
  (report.value?.items || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
)

const recordedOf = computed(() => {
  if (!report.value) return ''
  const total = report.value.items.length
  const recorded = Math.min(report.value.recordedCount, total)
  return t('consumables.recordedOf', { recorded: pn(recorded), total: pn(total) })
})

const formatNumber = (value: number | string | null | undefined) => {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US').format(num)
}

async function loadReport() {
  reportLoading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: MonthReport }>(`/api/consumables?month=${selectedMonth.value}`)
    if (res.success) report.value = res.data
  } catch {
    $toast.error(t('consumables.saveError'))
  } finally {
    reportLoading.value = false
  }
}

async function loadMonths() {
  monthsLoading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: MonthSummary[] }>('/api/consumables/months')
    if (res.success) monthsList.value = res.data
  } catch { /* */ } finally {
    monthsLoading.value = false
  }
}

async function refreshAll() {
  await Promise.all([loadReport(), loadMonths()])
}

watch(selectedMonth, () => loadReport())

onMounted(() => {
  loadReport()
  loadMonths()
})

// ─── Save month ───
const saving = ref(false)

async function saveMonth() {
  if (!report.value) return
  const items = report.value.items
    .filter((row) => row.isActive)
    .map((row) => ({
      item_id: row.id,
      amount: Number(row.amount) || 0,
      notes: (row.notes || '').trim() || null,
    }))

  saving.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: MonthReport }>('/api/consumables/expenses', {
      method: 'PUT',
      body: { month: selectedMonth.value, items },
    })
    if (res.success) {
      report.value = res.data
      $toast.success(t('consumables.saved'))
      await loadMonths()
    }
  } catch {
    $toast.error(t('consumables.saveError'))
  } finally {
    saving.value = false
  }
}

// ─── Export ───
const exporting = ref(false)

async function exportExcel() {
  exporting.value = true
  try {
    const apiBase = useRuntimeConfig().public.apiBase || ''
    const response = await fetch(`${apiBase}/api/consumables/export?month=${selectedMonth.value}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    })
    if (!response.ok) throw new Error('Export failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `consumables-${selectedMonth.value}.xlsx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch {
    $toast.error(t('consumables.exportError'))
  } finally {
    exporting.value = false
  }
}

// ─── Item management ───
const itemDialog = ref(false)
const savingItem = ref(false)
const editingItem = ref<ReportRow | null>(null)
const itemForm = ref<{ name: string }>({ name: '' })
const itemInactive = ref(false)

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      name: t('consumables.itemNameLabel'),
    },
    target: itemForm,
  })

function openAddItem() {
  editingItem.value = null
  itemForm.value = { name: '' }
  itemInactive.value = false
  itemDialog.value = true
}

function openEditItem(row: ReportRow) {
  editingItem.value = row
  itemForm.value = { name: row.name }
  itemInactive.value = !row.isActive
  itemDialog.value = true
}

async function saveItem() {
  if (!itemForm.value.name.trim()) {
    $toast.error(t('consumables.fillNameRequired'))
    return
  }
  savingItem.value = true
  try {
    const payload = { name: itemForm.value.name.trim(), is_active: !itemInactive.value }
    if (editingItem.value) {
      const res = await apiFetch<{ success: boolean }>(`/api/consumables/items/${editingItem.value.id}`, {
        method: 'PUT',
        body: payload,
      })
      if (res.success) $toast.success(t('consumables.itemUpdated'))
    } else {
      const res = await apiFetch<{ success: boolean }>('/api/consumables/items', {
        method: 'POST',
        body: payload,
      })
      if (res.success) $toast.success(t('consumables.itemCreated'))
    }
    itemDialog.value = false
    await loadReport()
  } catch {
    $toast.error(t('consumables.saveError'))
  } finally {
    savingItem.value = false
  }
}

// ─── Delete item (confirm dialog) ───
const deleteDialog = ref(false)
const deleting = ref(false)
const deleteTarget = ref<ReportRow | null>(null)

function confirmDeleteItem(row: ReportRow) {
  deleteTarget.value = row
  deleteDialog.value = true
}

async function executeDeleteItem() {
  const row = deleteTarget.value
  if (!row) return
  deleting.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/consumables/items/${row.id}`, {
      method: 'DELETE',
    })
    if (res.success) {
      $toast.success(t('consumables.itemDeleted'))
      deleteDialog.value = false
      deleteTarget.value = null
      await loadReport()
    }
  } catch {
    $toast.error(t('consumables.saveError'))
  } finally {
    deleting.value = false
  }
}

useSeoMeta({
  title: t('consumables.titleSeo'),
})
</script>

<style scoped>
/* ── Spinner ─────────────────────────────────────── */
.sc-spin {
  animation: sc-spin 800ms linear infinite;
}

@keyframes sc-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Metric cards ────────────────────────────────── */
.sc-metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
}

.sc-metric__copy {
  min-width: 0;
}

.sc-metric__value {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.sc-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

/* ── Shared card chrome ──────────────────────────── */
.sc-card {
  padding: 0;
  overflow: hidden;
}

.sc-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.375rem 1.5rem;
  border-bottom: 1px solid var(--asa-sep);
}

.sc-card__head-copy {
  min-width: 0;
}

.sc-card__head-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.sc-spacer {
  flex: 1;
}

/* ── Toolbar ─────────────────────────────────────── */
.sc-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.625rem;
  padding: 0.875rem 1.5rem;
  border-bottom: 1px solid var(--asa-sep);
}

.sc-navseg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  border-radius: 0.75rem;
}

.sc-navseg__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    box-shadow 150ms var(--ease-default);
}

.sc-navseg__btn:hover {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.dark .sc-navseg__btn:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.sc-navseg__label {
  height: 2rem;
  padding: 0 0.75rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--asa-label);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.sc-navseg__label:hover {
  background: var(--asa-bg-card);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

.dark .sc-navseg__label:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.sc-field--mini {
  width: 7.25rem;
}

/* Vuetify fields inside our controls (solo variant, token-toned) */
.sc-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.75rem;
  box-shadow: none;
  color: var(--asa-label);
}

.sc-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.sc-field :deep(.v-field__overlay) {
  background: transparent;
}

.sc-field :deep(.v-field__input),
.sc-field :deep(.v-field__input::placeholder),
.sc-field :deep(.v-label),
.sc-field :deep(.v-select__selection) {
  color: var(--asa-label);
}

.sc-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.sc-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.sc-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

.sc-field :deep(.v-field--variant-solo .v-field__outline) {
  display: none;
}

/* ── Skeleton ────────────────────────────────────── */
.sc-skel {
  padding: 0.875rem 1.5rem;
}

.sc-skel__row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.625rem 0;
}

.sc-skel__row + .sc-skel__row {
  border-top: 1px solid var(--asa-sep);
}

.sc-skel__lines {
  flex: 1;
  min-width: 0;
}

.sc-skel__line-sub {
  margin-top: 0.5rem;
}

.sc-skel__av {
  flex-shrink: 0;
}

/* ── Empty state ─────────────────────────────────── */
.sc-empty {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2.25rem 1.5rem;
}

.sc-empty__tint {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1.125rem;
  flex-shrink: 0;
}

.sc-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-empty__desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

/* ── Expense rows ────────────────────────────────── */
.sc-list__body {
  display: flex;
  flex-direction: column;
}

.sc-exp-row {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr) 9.5rem minmax(0, 1.25fr) auto;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.5rem;
  transition: opacity 200ms var(--ease-default);
}

.sc-exp-row + .sc-exp-row {
  border-top: 1px solid var(--asa-sep);
}

.sc-exp-row--off {
  opacity: 0.62;
}

.sc-exp-row__idx {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}

.sc-exp-row__main {
  min-width: 0;
}

.sc-exp-row__name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-exp-row__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.sc-exp-row__num {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.sc-exp-row__note {
  font-size: 0.8125rem;
  color: var(--asa-label-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sc-exp-row__actions {
  display: flex;
  gap: 0.25rem;
}

/* ── Grand total footer ──────────────────────────── */
.sc-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-accent-soft) 45%, transparent);
}

.sc-foot__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-foot__value {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--asa-accent-deep);
  font-variant-numeric: tabular-nums;
}

.dark .sc-foot__value {
  color: var(--asa-accent);
}

/* ── Pills (scoped, token based) ─────────────────── */
.sc-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
}

.sc-pill--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .sc-pill--teal {
  color: var(--asa-accent);
}

.sc-pill--green {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.sc-pill--amber {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.sc-pill--indigo {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

/* ── Icon buttons ────────────────────────────────── */
.sc-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    transform 120ms var(--ease-default);
}

.sc-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.sc-icon-btn--danger:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.sc-icon-btn:active {
  transform: scale(0.92);
}

/* ── Month history rows ──────────────────────────── */
.sc-hlist {
  padding: 0.5rem 1.5rem;
}

.sc-hrow {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 0;
  border-radius: 0.875rem;
  transition: background-color 150ms var(--ease-default);
}

.sc-hrow + .sc-hrow {
  border-top: 1px solid var(--asa-sep);
}

.sc-hrow--on {
  background: color-mix(in srgb, var(--asa-accent-soft) 55%, transparent);
}

.sc-hrow__tint {
  margin-inline-start: 0.5rem;
}

.sc-hrow__main {
  min-width: 0;
}

.sc-hrow__month {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.sc-hrow__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;
}

.sc-hrow__end {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sc-hrow__total {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.sc-hrow__go {
  flex-shrink: 0;
}

/* ── Dialog helpers ──────────────────────────────── */
.sc-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: var(--asa-label-2);
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.sc-x:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.sc-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sc-inactive {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--asa-sep);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.sc-inactive__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

/* ── Responsive tuning ───────────────────────────── */
@media (max-width: 959px) {
  .sc-exp-row {
    grid-template-columns: 2rem minmax(0, 1fr) 9.5rem auto;
  }

  .sc-exp-row__notes {
    grid-column: 2 / -1;
  }
}

@media (max-width: 719px) {
  .sc-exp-row {
    grid-template-columns: 1.75rem minmax(0, 1fr) auto;
    gap: 0.625rem 0.75rem;
  }

  .sc-exp-row__amount {
    grid-column: 2;
  }

  .sc-exp-row__notes {
    grid-column: 2;
  }

  .sc-exp-row__actions {
    grid-column: 3;
    grid-row: 1 / span 3;
    flex-direction: column;
  }

  .sc-hrow {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .sc-hrow__go {
    display: none;
  }
}

@media (max-width: 479px) {
  .sc-card__head {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sc-spin {
    animation: none;
  }
}
</style>