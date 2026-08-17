<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('consumables.title')" :subtitle="$t('consumables.subtitle')">
      <template #actions>
        <UiDateNavigator :label="monthLabel" :prev-label="$t('consumables.previousMonth')"
          :next-label="$t('consumables.nextMonth')" @prev="shiftMonth(-1)" @next="shiftMonth(1)" />
      </template>
    </UiPageHeader>

    <!-- Summary Cards -->
    <div class="!grid !grid-cols-1 sm:!grid-cols-3 !gap-4 !pb-6">
      <UiStatCard :label="$t('consumables.totalMonthExpense')" :value="liveTotal"
        value-class="!text-indigo-600 dark:!text-indigo-400">
        <template #icon>
          <Icon name="lucide:wallet" class="!w-5 !h-5 !text-indigo-400" />
        </template>
        <template #value>
          <UiPrice :value="liveTotal" />
        </template>
      </UiStatCard>
      <UiStatCard :label="$t('consumables.recordedItems')" :value="report?.recordedCount || 0"
        value-class="!text-emerald-600 dark:!text-emerald-400">
        <template #icon>
          <Icon name="lucide:clipboard-check" class="!w-5 !h-5 !text-emerald-400" />
        </template>
      </UiStatCard>
      <UiStatCard :label="$t('consumables.monthsRecorded')" :value="monthsList.length"
        value-class="!text-amber-600 dark:!text-amber-400">
        <template #icon>
          <Icon name="lucide:history" class="!w-5 !h-5 !text-amber-400" />
        </template>
      </UiStatCard>
    </div>

    <!-- Controls -->
    <div class="!flex !flex-col lg:!flex-row !justify-between !items-start lg:!items-center !gap-3 !pb-4">
      <div class="!flex !items-center !gap-3 !w-full lg:!w-auto">
        <v-select v-model="year" :items="yearOptions" variant="outlined" density="comfortable"
          :label="$t('consumables.yearLabel')" hide-details class="!bg-white dark:!bg-[#0f1115] !rounded-xl !min-w-[130px]" />
        <v-select v-model="month" :items="monthOptions" item-title="label" item-value="value" variant="outlined"
          density="comfortable" :label="$t('consumables.monthLabel')" hide-details
          class="!bg-white dark:!bg-[#0f1115] !rounded-xl !min-w-[160px]" />
      </div>

      <div class="!flex !items-center !gap-2 !flex-wrap">
        <button v-if="isAdmin" @click="openAddItem" class="crm-btn crm-btn-primary">
          <Plus class="!w-4 !h-4" />
          {{ $t('consumables.addItem') }}
        </button>
        <button :disabled="exporting" @click="exportExcel" class="crm-btn crm-btn-secondary">
          <Icon v-if="exporting" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
          <Icon v-else name="lucide:file-down" class="!w-4 !h-4" />
          {{ $t('consumables.exportExcel') }}
        </button>
        <button v-if="isAdmin" :disabled="saving" @click="saveMonth" class="crm-btn crm-btn-primary">
          <Icon v-if="saving" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
          <Icon v-else name="lucide:save" class="!w-4 !h-4" />
          {{ $t('consumables.saveMonth') }}
        </button>
      </div>
    </div>

    <!-- Items Table -->
    <UiContentCard>
      <template #header>
        <div class="!flex !items-center !justify-between !gap-3">
          <h2 class="crm-card-title">{{ monthLabel }}</h2>
          <p v-if="report && report.total === 0" class="!text-xs !text-slate-500 dark:!text-slate-400">
            {{ $t('consumables.emptyMonth') }}
          </p>
        </div>
      </template>

      <div class="!overflow-x-auto">
        <table class="crm-table">
          <thead>
            <tr>
              <th class="!w-12">{{ '#' }}</th>
              <th>{{ $t('consumables.itemName') }}</th>
              <th class="!min-w-[160px]">{{ $t('consumables.amount') }}</th>
              <th class="!min-w-[200px]">{{ $t('consumables.notes') }}</th>
              <th v-if="isAdmin" class="!text-center">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reportLoading">
              <td :colspan="isAdmin ? 5 : 4"><v-skeleton-loader type="list-item" class="!bg-transparent" /></td>
            </tr>
            <tr v-else-if="report && report.items.length === 0">
              <td :colspan="isAdmin ? 5 : 4" class="!py-16 !text-center">
                <div class="!flex !flex-col !items-center !gap-3">
                  <Icon name="lucide:shopping-basket" class="!w-10 !h-10 !text-slate-300" />
                  <p class="!text-slate-500 !font-semibold">{{ $t('consumables.noItems') }}</p>
                </div>
              </td>
            </tr>
            <tr v-for="(row, index) in report?.items || []" v-else :key="row.id"
              :class="[!row.isActive ? '!opacity-60' : '', 'hover:!bg-slate-50/50 dark:hover:!bg-slate-800/30']">
              <td class="!text-slate-400 !text-xs !font-mono">{{ index + 1 }}</td>
              <td>
                <div class="!flex !items-center !gap-2">
                  <span class="!font-bold">{{ row.name }}</span>
                  <span v-if="!row.isActive" class="crm-badge crm-badge-neutral">{{ $t('consumables.inactive') }}</span>
                </div>
              </td>
              <td>
                <v-text-field v-if="isAdmin && row.isActive" v-model.number="row.amount" variant="outlined"
                  density="compact" type="number" min="0" hide-details
                  class="!max-w-[160px] !bg-white dark:!bg-[#0f1115] !rounded-lg" />
                <span v-else class="!font-bold !tabular-nums">{{ formatNumber(row.amount) }}</span>
              </td>
              <td>
                <v-text-field v-if="isAdmin && row.isActive" v-model="row.notes" variant="outlined" density="compact"
                  hide-details :placeholder="$t('consumables.notes')"
                  class="!max-w-[280px] !bg-white dark:!bg-[#0f1115] !rounded-lg" />
                <span v-else class="!text-sm !text-slate-600 dark:!text-slate-300">{{ row.notes || '---' }}</span>
              </td>
              <td v-if="isAdmin" class="!text-center">
                <div class="!flex !items-center !justify-center !gap-1">
                  <button @click="openEditItem(row)"
                    class="!p-1.5 !text-slate-400 hover:!text-indigo-500 hover:!bg-indigo-50 dark:hover:!bg-indigo-900/20 !rounded-lg"
                    :title="$t('consumables.editItem')">
                    <Icon name="lucide:pencil" class="!w-4 !h-4" />
                  </button>
                  <button v-if="row.isActive" @click="deleteItem(row)"
                    class="!p-1.5 !text-slate-400 hover:!text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20 !rounded-lg"
                    :title="$t('consumables.editItem')">
                    <Icon name="lucide:trash-2" class="!w-4 !h-4" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="report && report.items.length > 0">
              <td colspan="2" class="!font-black !text-sm">{{ $t('consumables.total') }}</td>
              <td class="!font-black !text-indigo-600 dark:!text-indigo-400 !tabular-nums">{{ formatNumber(liveTotal)
                }}</td>
              <td :colspan="isAdmin ? 2 : 1"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiContentCard>

    <!-- Month History -->
    <UiContentCard :title="$t('consumables.monthHistory')" card-class="!mt-6">
      <div class="!overflow-x-auto">
        <table class="crm-table">
          <thead>
            <tr>
              <th>{{ $t('consumables.month') }}</th>
              <th>{{ $t('consumables.recordedItems') }}</th>
              <th>{{ $t('consumables.total') }}</th>
              <th class="!text-center">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="monthsList.length === 0">
              <td colspan="4" class="!py-10 !text-center !text-slate-500 !font-semibold">
                {{ $t('consumables.emptyMonth') }}
              </td>
            </tr>
            <tr v-for="entry in monthsList" v-else :key="entry.month"
              :class="entry.month === selectedMonth ? '!bg-indigo-50/50 dark:!bg-indigo-950/20' : ''">
              <td class="!font-bold">{{ monthNameFromKey(entry.month) }}</td>
              <td class="!text-sm">{{ entry.count }}</td>
              <td class="!tabular-nums !font-semibold">{{ formatNumber(entry.total) }}</td>
              <td class="!text-center">
                <button @click="jumpToMonth(entry.month)" class="crm-btn crm-btn-ghost crm-btn-sm">
                  {{ $t('consumables.month') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiContentCard>

    <!-- Add / Edit Item Dialog -->
    <v-dialog v-model="itemDialog" max-width="480">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-3xl !shadow-2xl !overflow-auto">
        <div class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h2 class="!text-xl !font-black">
            {{ editingItem ? $t('consumables.editItem') : $t('consumables.addItem') }}
          </h2>
          <button @click="itemDialog = false"
            class="!p-2 !text-slate-400 hover:!text-slate-600 dark:hover:!text-slate-200 !bg-slate-50 dark:!bg-slate-800 !rounded-full !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!p-8 !space-y-5">
          <v-text-field v-model="itemForm.name" variant="outlined" density="comfortable"
            :label="$t('consumables.itemNameLabel')" hide-details="auto" />
          <div v-if="editingItem" class="!flex !items-center !justify-between !gap-3 !p-4 !bg-slate-50 dark:!bg-slate-800/50 !rounded-xl">
            <span class="!text-sm !font-semibold">{{ $t('consumables.inactive') }}</span>
            <v-switch v-model="itemForm.is_active" color="indigo" hide-details />
          </div>
        </div>
        <div
          class="!px-8 !py-5 !bg-slate-50/50 dark:!bg-slate-900/50 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end !gap-3">
          <button @click="itemDialog = false" class="crm-btn crm-btn-ghost">{{ $t('common.cancel') }}</button>
          <button :disabled="savingItem" @click="saveItem" class="crm-btn crm-btn-primary">
            <Icon v-if="savingItem" name="lucide:loader-2" class="!w-4 !h-4 !animate-spin" />
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import moment from 'moment-jalaali'
import Plus from '~/components/icons/Plus.vue'
import { useApi } from '~/composables/useApi'

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

const liveTotal = computed(() =>
  (report.value?.items || []).reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
)

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
  try {
    const res = await apiFetch<{ success: boolean; data: MonthSummary[] }>('/api/consumables/months')
    if (res.success) monthsList.value = res.data
  } catch { /* */ }
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
    .filter((row) => row.isActive && (Number(row.amount) > 0 || (row.notes && row.notes.trim())))
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
const itemForm = ref<{ name: string; is_active: boolean }>({ name: '', is_active: true })

function openAddItem() {
  editingItem.value = null
  itemForm.value = { name: '', is_active: true }
  itemDialog.value = true
}

function openEditItem(row: ReportRow) {
  editingItem.value = row
  itemForm.value = { name: row.name, is_active: row.isActive }
  itemDialog.value = true
}

async function saveItem() {
  if (!itemForm.value.name.trim()) {
    $toast.error(t('consumables.fillNameRequired'))
    return
  }
  savingItem.value = true
  try {
    const payload = { name: itemForm.value.name.trim(), is_active: itemForm.value.is_active }
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

async function deleteItem(row: ReportRow) {
  if (!confirm(t('consumables.deleteItemConfirm'))) return
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/consumables/items/${row.id}`, {
      method: 'DELETE',
    })
    if (res.success) {
      $toast.success(t('consumables.itemDeleted'))
      await loadReport()
    }
  } catch {
    $toast.error(t('consumables.saveError'))
  }
}

useSeoMeta({
  title: t('consumables.titleSeo'),
})
</script>
