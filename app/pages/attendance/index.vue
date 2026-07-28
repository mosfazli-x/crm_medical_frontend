<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('attendance.title')"
      :subtitle="isAdmin ? $t('attendance.adminSubtitle') : $t('attendance.employeeSubtitle')" />

    <!-- Admin View -->
    <template v-if="isAdmin">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <UiStatCard :label="$t('attendance.presentToday')" :value="todayStats.present" valueClass="!text-emerald-600">
          <template #icon><v-icon size="24" color="#059669">mdi-check-circle-outline</v-icon></template>
        </UiStatCard>
        <UiStatCard :label="$t('attendance.absentToday')" :value="todayStats.absent" valueClass="!text-red-500">
          <template #icon><v-icon size="24" color="#EF4444">mdi-close-circle-outline</v-icon></template>
        </UiStatCard>
        <UiStatCard :label="$t('attendance.lateToday')" :value="todayStats.late" valueClass="!text-amber-600">
          <template #icon><v-icon size="24" color="#D97706">mdi-clock-alert-outline</v-icon></template>
        </UiStatCard>
        <UiStatCard :label="$t('attendance.leaveToday')" :value="todayStats.leave" valueClass="!text-blue-600">
          <template #icon><v-icon size="24" color="#2563EB">mdi-account-clock-outline</v-icon></template>
        </UiStatCard>
      </div>

      <UiContentCard class="mb-6">
        <template #header>
          <div class="flex flex-wrap items-center gap-3">
            <h3 class="crm-card-title">{{ $t('attendance.reportTitle') }}</h3>
          </div>
        </template>
        <template #headerAction>
          <div class="flex items-center gap-2">
            <v-btn variant="tonal" size="small" class="crm-btn" @click="openBulkDialog">
              <v-icon start size="16">mdi-pencil-plus-outline</v-icon>
              {{ $t('attendance.manualEntry') }}
            </v-btn>
          </div>
        </template>

        <div class="flex flex-wrap items-center gap-3 mb-4 px-2!">
          <div class="relative min-w-[200px] h-[40px] border rounded overflow-hidden">
            <PersianDatetimePicker v-model="reportFilters.startDate" type="date" display-format="jYYYY/jMM/jDD"
              format="jYYYY/jMM/jDD" variant="outlined" density="compact" :label="$t('attendance.fromDate')" hide-details />
          </div>
          <div class="relative min-w-[200px] h-[40px] border rounded overflow-hidden">
            <PersianDatetimePicker v-model="reportFilters.endDate" type="date" display-format="jYYYY/jMM/jDD"
              format="jYYYY/jMM/jDD" variant="outlined" density="compact" :label="$t('attendance.toDate')" hide-details />
          </div>
          <v-select v-model="reportFilters.staffId" :items="staffOptions" item-title="label" item-value="value"
            variant="outlined" density="compact" :label="$t('attendance.staffLabel')" hide-details clearable class="max-w-[200px]" />
          <v-select v-model="reportFilters.status" :items="statusOptions" variant="outlined" density="compact"
            :label="$t('staff.status')" hide-details clearable class="max-w-[160px]" />
          <v-btn variant="flat" class="crm-btn crm-btn-accent" @click="fetchReport">{{ $t('attendance.fetchReport') }}</v-btn>
        </div>

        <div class="crm-table-wrap">
          <table class="crm-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.staffName') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.position') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('common.date') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.workHours') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('staff.status') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.workLocation') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.workDuration') }}</th>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.note') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('staff.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="record in reportRecords" :key="record.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{{
                  record.staffName }}</td>
                <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{{ record.staffPosition || '---' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{{ formatJalaliDate(record.date) }}</td>
                <td class="px-4 py-3 text-sm whitespace-nowrap">
                  <div v-if="record.sessions?.length" class="flex flex-col gap-1">
                    <span v-for="(s, i) in record.sessions" :key="i" class="font-mono text-xs text-slate-600" dir="ltr">
                      {{ formatSessionTime(s.checkInTime) }} - {{ formatSessionTime(s.checkOutTime) }}
                    </span>
                  </div>
                  <span v-else class="text-xs text-slate-400">---</span>
                </td>
                <td class="px-4 py-3">
                  <span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', statusStyle(record.status)]">
                    {{ statusLabel(record.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-500 whitespace-nowrap">{{ locationLabel(record.workLocation) }}
                </td>
                <td class="px-4 py-3 text-sm font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap" dir="ltr">
                  {{
                    formatWorkedHours(record.workedMinutes) }}</td>
                <td class="px-4 py-3 text-xs text-slate-400 max-w-[150px] truncate">{{ record.notes || record.adminNotes
                  ||
                  '---' }}</td>
                <td class="px-4 py-3 text-center">
                  <v-tooltip :text="$t('staff.edit')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="text-amber-500 hover:text-amber-600"
                        @click="editRecord(record)">
                        <v-icon size="18">mdi-pencil-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="reportRecords.length === 0" class="text-center py-8 text-sm text-slate-400">
            {{ $t('attendance.noRecords') }}
          </div>
        </div>
      </UiContentCard>

      <!-- Summary table -->
      <UiContentCard v-if="reportSummary.length > 0" :title="$t('attendance.periodSummary')">
        <div class="crm-table-wrap">
          <table class="crm-table">
            <thead>
              <tr>
                <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.staffName') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.totalDays') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.present') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.late') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.absent') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.leave') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.holiday') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.workingHoursLabel') }}</th>
                <th class="px-4 py-3 text-sm font-bold text-center whitespace-nowrap">{{ $t('attendance.attendanceRate') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="s in reportSummary" :key="s.staffId" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{{ s.staffName }}</td>
                <td class="px-4 py-3 text-sm text-center font-mono">{{ s.totalDays }}</td>
                <td class="px-4 py-3 text-sm text-center font-mono text-emerald-600">{{ s.presentDays }}</td>
                <td class="px-4 py-3 text-sm text-center font-mono text-amber-600">{{ s.lateDays }}</td>
                <td class="px-4 py-3 text-sm text-center font-mono text-red-500">{{ s.absentDays }}</td>
                <td class="px-4 py-3 text-sm text-center font-mono text-blue-600">{{ s.leaveDays }}</td>
                <td class="px-4 py-3 text-sm text-center font-mono text-purple-600">{{ s.holidayDays }}</td>
                <td class="px-4 py-3 text-sm text-center font-mono text-indigo-600 font-bold" dir="ltr">{{
                  formatWorkedHours(s.totalWorkedMinutes) }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-3 py-1 rounded-full text-xs font-bold" :class="rateClass(s)">
                    {{ ratePercent(s) }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UiContentCard>
    </template>

    <!-- Staff Self View -->
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <UiContentCard class="lg:col-span-1">
          <div class="text-center py-4">
            <div
              class="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-4">
              <v-icon size="36" color="#4F46E5">mdi-account-outline</v-icon>
            </div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">{{ user?.fullName || $t('staff.name') }}</h3>
            <p class="text-sm text-slate-500 mt-1">{{ todayStatus }}</p>

            <div class="mt-6 space-y-3">
              <v-btn variant="flat" block
                class="crm-btn !bg-emerald-600 hover:!bg-emerald-700 !text-white !h-14 !text-base"
                :loading="actionLoading" @click="doCheckIn">
                <v-icon start size="22">mdi-login</v-icon>
                {{ $t('attendance.newCheckIn') }}
              </v-btn>
              <v-btn v-if="hasOpenSession" variant="flat" block
                class="crm-btn !bg-red-500 hover:!bg-red-600 !text-white !h-14 !text-base" :loading="actionLoading"
                @click="doCheckOut">
                <v-icon start size="22">mdi-logout</v-icon>
                {{ $t('attendance.checkOutBtn') }}
              </v-btn>
              <div v-if="todayRecord"
                class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-left">
                <p class="text-xs text-slate-500 mb-2">{{ $t('attendance.todaySessionsLabel') }}</p>
                <div v-for="(s, i) in todayRecord.sessions" :key="i"
                  class="flex items-center gap-2 text-xs font-mono text-slate-600 mb-1">
                  <v-icon size="14" color="#4F46E5">mdi-clock-outline</v-icon>
                  {{ formatSessionTime(s.checkInTime) }} - {{ formatSessionTime(s.checkOutTime) || '...' }}
                </div>
                <div v-if="!todayRecord.sessions?.length" class="text-xs text-slate-400">{{ $t('attendance.noSessionsYet') }}</div>
              </div>
            </div>
          </div>
        </UiContentCard>

        <UiContentCard :title="$t('attendance.historyTitle')" class="lg:col-span-2">
          <div class="flex items-center gap-3 mb-4">
            <v-select v-model="selectedMonth" :items="jalaliMonthOptions" variant="outlined" density="compact"
              hide-details class="max-w-[200px]" />
            <div
              class="mr-auto px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <span class="text-xs text-indigo-500">{{ $t('attendance.totalWorkHours') }}</span>
              <span class="text-sm font-bold text-indigo-700 dark:text-indigo-300 mr-2" dir="ltr">{{
                formatWorkedHoursLabel(totalWorkedThisMonth) }}</span>
            </div>
          </div>

          <div class="crm-table-wrap">
            <table class="crm-table">
              <thead>
                <tr>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('common.date') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.workHours') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('staff.status') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.workLocation') }}</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">{{ $t('attendance.workDuration') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="record in myRecords" :key="record.id" class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{{
                    formatJalaliDate(record.date) }}</td>
                  <td class="px-4 py-3 text-sm whitespace-nowrap">
                    <div v-if="record.sessions?.length" class="flex flex-col gap-1">
                      <span v-for="(s, i) in record.sessions" :key="i" class="font-mono text-xs text-slate-600"
                        dir="ltr">
                        {{ formatSessionTime(s.checkInTime) }} - {{ formatSessionTime(s.checkOutTime) || '...' }}
                      </span>
                    </div>
                    <span v-else class="text-xs text-slate-400">---</span>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', statusStyle(record.status)]">
                      {{ statusLabel(record.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-500">{{ locationLabel(record.workLocation) }}</td>
                  <td class="px-4 py-3 text-sm font-mono text-indigo-600 font-semibold" dir="ltr">{{
                    formatWorkedHours(record.workedMinutes) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="myRecords.length === 0" class="text-center py-8 text-sm text-slate-400">
              {{ $t('attendance.noRecords') }}
            </div>
          </div>
        </UiContentCard>
      </div>
    </template>

    <!-- Edit Attendance Dialog -->
    <v-dialog v-model="editDialog" max-width="550">
      <v-card class="rounded-2xl">
        <div class="crm-dialog-header">
          <h3 class="crm-dialog-title">{{ $t('attendance.editRecordTitle') }}</h3>
          <button @click="editDialog = false" class="crm-dialog-close"><v-icon size="20">mdi-close</v-icon></button>
        </div>
        <v-card-text class="crm-dialog-body">
          <div class="space-y-4">
            <div>
              <label class="crm-label">{{ $t('staff.status') }}</label>
              <v-select v-model="editForm.status" :items="statusOptions" variant="outlined" density="comfortable"
                hide-details />
            </div>
            <div>
              <label class="crm-label">{{ $t('attendance.sessions') }}</label>
              <div class="space-y-2">
                <div v-for="(session, idx) in editForm.sessions" :key="idx"
                  class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <v-text-field v-model="session.checkInTime" type="time" variant="outlined" density="compact"
                    :label="$t('attendance.checkIn')" hide-details class="max-w-[130px]" />
                  <span class="text-xs text-slate-400">{{ $t('attendance.to') }}</span>
                  <v-text-field v-model="session.checkOutTime" type="time" variant="outlined" density="compact"
                    :label="$t('attendance.checkOut')" hide-details class="max-w-[130px]" />
                  <v-btn icon variant="text" size="small" color="error" @click="editForm.sessions.splice(idx, 1)">
                    <v-icon size="18">mdi-close</v-icon>
                  </v-btn>
                </div>
                <v-btn variant="tonal" size="small" class="crm-btn"
                  @click="editForm.sessions.push({ checkInTime: '08:00', checkOutTime: '12:00' })">
                  <v-icon start size="14">mdi-plus</v-icon>
                  {{ $t('attendance.addSession') }}
                </v-btn>
              </div>
            </div>
            <div>
              <label class="crm-label">{{ $t('attendance.staffNote') }}</label>
              <v-textarea v-model="editForm.notes" variant="outlined" density="comfortable" rows="2" hide-details />
            </div>
            <div>
              <label class="crm-label">{{ $t('attendance.adminNote') }}</label>
              <v-textarea v-model="editForm.adminNotes" variant="outlined" density="comfortable" rows="2"
                hide-details />
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="crm-dialog-footer">
          <v-spacer />
          <v-btn variant="text" class="crm-btn crm-btn-ghost" @click="editDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn variant="flat" class="crm-btn crm-btn-accent" :loading="editLoading" @click="saveEdit">{{ $t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bulk Attendance Dialog -->
    <v-dialog v-model="bulkDialog" max-width="700">
      <v-card class="rounded-2xl">
        <div class="crm-dialog-header">
          <h3 class="crm-dialog-title">{{ $t('attendance.bulkTitle') }}</h3>
          <button @click="bulkDialog = false" class="crm-dialog-close"><v-icon size="20">mdi-close</v-icon></button>
        </div>
        <v-card-text class="crm-dialog-body">
          <div class="space-y-4">
            <div>
              <label class="crm-label">{{ $t('attendance.dateRequired') }}</label>
              <PersianDatetimePicker v-model="bulkForm.date" type="date" display-format="jYYYY/jMM/jDD"
                format="jYYYY/jMM/jDD" variant="outlined" density="comfortable" hide-details />
            </div>
            <div v-for="(item, idx) in bulkForm.records" :key="idx"
              class="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
              <div class="flex items-center gap-3">
                <div class="flex-1">
                  <div class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ item.fullName }}</div>
                </div>
                <v-select v-model="item.status" :items="statusOptions" variant="outlined" density="compact" hide-details
                  class="max-w-[140px]" />
                <v-text-field v-model="item.adminNotes" variant="outlined" density="compact" :placeholder="$t('attendance.notePlaceholder')"
                  hide-details class="max-w-[150px]" />
              </div>
              <div class="space-y-1">
                <div v-for="(session, sIdx) in item.sessions" :key="sIdx" class="flex items-center gap-2">
                  <v-text-field v-model="session.checkInTime" type="time" variant="outlined" density="compact"
                    :label="$t('attendance.checkIn')" hide-details class="max-w-[120px]" />
                  <span class="text-xs text-slate-400">{{ $t('attendance.to') }}</span>
                  <v-text-field v-model="session.checkOutTime" type="time" variant="outlined" density="compact"
                    :label="$t('attendance.checkOut')" hide-details class="max-w-[120px]" />
                  <v-btn icon variant="text" size="small" color="error" @click="item.sessions.splice(sIdx, 1)">
                    <v-icon size="16">mdi-close</v-icon>
                  </v-btn>
                </div>
                <v-btn variant="text" size="x-small" class="text-indigo-500"
                  @click="item.sessions.push({ checkInTime: '08:00', checkOutTime: '12:00' })">
                  + {{ $t('attendance.addSession') }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="crm-dialog-footer">
          <v-spacer />
          <v-btn variant="text" class="crm-btn crm-btn-ghost" @click="bulkDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn variant="flat" class="crm-btn crm-btn-accent" :loading="bulkLoading" @click="submitBulk">{{ $t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import moment from 'moment-jalaali'

const { user } = useAuth()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { formatJalaliDate, todayJalali } = useFormatting()
const { t } = useI18n()

const isAdmin = computed(() => user?.value?.role === 'admin_doctor' || (user as any)?.role === 'admin_doctor')

// --- Admin State ---
const staffOptions = ref<{ label: string; value: string }[]>([])
const reportRecords = ref<any[]>([])
const reportSummary = ref<any[]>([])
const todayStats = reactive({ present: 0, absent: 0, late: 0, leave: 0 })
const reportFilters = reactive({
  startDate: todayJalali(),
  endDate: todayJalali(),
  staffId: '',
  status: '',
})

const editDialog = ref(false)
const editLoading = ref(false)
const editRecordId = ref('')
const editForm = reactive<{ status: string; notes: string; adminNotes: string; sessions: { checkInTime: string; checkOutTime: string }[] }>({
  status: '',
  notes: '',
  adminNotes: '',
  sessions: [],
})

const bulkDialog = ref(false)
const bulkLoading = ref(false)
const bulkForm = reactive({
  date: todayJalali(),
  records: [] as { staffId: string; fullName: string; status: string; adminNotes: string; sessions: { checkInTime: string; checkOutTime: string }[] }[],
})

// --- Staff State ---
const todayRecord = ref<any>(null)
const myRecords = ref<any[]>([])
const actionLoading = ref(false)
const selectedMonth = ref('')

const hasOpenSession = computed(() => {
  if (!todayRecord.value?.sessions) return false
  return todayRecord.value.sessions.some((s: any) => s.checkInTime && !s.checkOutTime)
})
const todayStatus = computed(() => {
  if (!todayRecord.value) return t('attendance.notCheckedIn')
  const sessions = todayRecord.value.sessions || []
  if (sessions.length === 0) return t('attendance.notCheckedIn')
  if (hasOpenSession.value) return t('attendance.currentlyWorking')
  return t('attendance.allSessionsRecorded')
})
const totalWorkedThisMonth = computed(() => {
  return myRecords.value.reduce((sum: number, r: any) => sum + (r.workedMinutes || 0), 0)
})

const statusOptions = computed(() => [
  { title: t('attendance.statusPresent'), value: 'present' },
  { title: t('attendance.statusAbsent'), value: 'absent' },
  { title: t('attendance.statusLate'), value: 'late' },
  { title: t('attendance.statusLeave'), value: 'leave' },
  { title: t('attendance.statusHoliday'), value: 'holiday' },
])

const jalaliMonthOptions = computed(() => {
  const items = []
  const monthNames = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']
  for (let i = 0; i < 6; i++) {
    const m = moment().subtract(i, 'jMonth')
    const jM = m.jMonth() + 1
    const jY = m.jYear()
    items.push({ title: `${monthNames[jM - 1]} ${jY}`, value: `${jM}-${jY}` })
  }
  return items
})

// --- Methods ---
const formatSessionTime = (ts: string | null) => {
  if (!ts) return '--:--'
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const formatWorkedHours = (minutes: number | null | undefined) => {
  if (minutes == null) return '--'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

const formatWorkedHoursLabel = (minutes: number | null | undefined) => {
  if (minutes == null) return '---'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m} ${t('common.notes')}`
  if (m === 0) return `${h} ${t('attendance.workingHoursLabel')}`
  return `${h} ${t('attendance.workingHoursLabel')} ${t('attendance.to')} ${m} ${t('common.notes')}`
}

const statusLabel = (s: string) => ({ present: t('attendance.statusPresent'), absent: t('attendance.statusAbsent'), late: t('attendance.statusLate'), leave: t('attendance.statusLeave'), holiday: t('attendance.statusHoliday') }[s] || s)
const statusStyle = (s: string) => ({
  present: 'bg-emerald-50 text-emerald-700',
  absent: 'bg-red-50 text-red-600',
  late: 'bg-amber-50 text-amber-700',
  leave: 'bg-blue-50 text-blue-600',
  holiday: 'bg-purple-50 text-purple-600',
}[s] || 'bg-slate-50 text-slate-600')
const locationLabel = (l: string | null) => ({ clinic: t('attendance.locationClinic'), remote: t('attendance.locationRemote'), field: t('attendance.locationField') }[l || ''] || '---')

const ratePercent = (s: any) => {
  if (!s.totalDays) return 0
  return Math.round(((s.presentDays + s.lateDays) / s.totalDays) * 100)
}
const rateClass = (s: any) => {
  const r = ratePercent(s)
  if (r >= 90) return 'bg-emerald-50 text-emerald-700'
  if (r >= 70) return 'bg-amber-50 text-amber-700'
  return 'bg-red-50 text-red-600'
}

const jalaliToApiDate = (jalaliStr: string) => {
  return jalaliStr.replace(/\//g, '-')
}

// --- Admin Methods ---
const fetchStaffList = async () => {
  try {
    const res = await apiFetch<any>('/api/staff')
    if (res.success) {
      staffOptions.value = res.data.map((s: any) => ({ label: s.fullName, value: s.id }))
    }
  } catch { /* ignore */ }
}

const fetchReport = async () => {
  try {
    const params = new URLSearchParams({
      startDate: jalaliToApiDate(reportFilters.startDate) || '',
      endDate: jalaliToApiDate(reportFilters.endDate) || '',
    })
    if (reportFilters.staffId) params.set('staffId', reportFilters.staffId)
    if (reportFilters.status) params.set('status', reportFilters.status)

    const res = await apiFetch<any>(`/api/staff/attendance/report?${params.toString()}`)
    if (res.success) {
      reportRecords.value = res.data.records || []
      reportSummary.value = res.data.summary || []
    }
  } catch {
    $toast.error(t('attendance.fetchReportError'))
  }
}

const fetchTodayStats = async () => {
  const today = todayJalali()
  try {
    const res = await apiFetch<any>(`/api/staff/attendance/report?startDate=${today}&endDate=${today}`)
    if (res.success && res.data?.summary) {
      todayStats.present = 0
      todayStats.absent = 0
      todayStats.late = 0
      todayStats.leave = 0
      for (const s of res.data.summary) {
        todayStats.present += s.presentDays || 0
        todayStats.absent += s.absentDays || 0
        todayStats.late += s.lateDays || 0
        todayStats.leave += s.leaveDays || 0
      }
    }
  } catch { /* ignore */ }
}

const editRecord = (record: any) => {
  editRecordId.value = record.id
  editForm.status = record.status
  editForm.notes = record.notes || ''
  editForm.adminNotes = record.adminNotes || ''
  editForm.sessions = (record.sessions || []).map((s: any) => ({
    checkInTime: formatSessionTime(s.checkInTime),
    checkOutTime: formatSessionTime(s.checkOutTime),
  }))
  editDialog.value = true
}

const saveEdit = async () => {
  editLoading.value = true
  try {
    const body: any = {
      status: editForm.status,
      notes: editForm.notes || null,
      adminNotes: editForm.adminNotes || null,
      sessions: editForm.sessions.filter(s => s.checkInTime),
    }
    const res = await apiFetch<any>(`/api/staff/attendance/${editRecordId.value}`, {
      method: 'PUT',
      body,
    })
    if (res.success) {
      $toast.success(t('attendance.recordUpdated'))
      editDialog.value = false
      fetchReport()
    }
  } catch {
    $toast.error(t('attendance.updateError'))
  } finally {
    editLoading.value = false
  }
}

const openBulkDialog = () => {
  bulkForm.date = todayJalali()
  bulkForm.records = staffOptions.value.map(s => ({
    staffId: s.value,
    fullName: s.label,
    status: 'present',
    adminNotes: '',
    sessions: [{ checkInTime: '08:00', checkOutTime: '12:00' }],
  }))
  bulkDialog.value = true
}

const submitBulk = async () => {
  bulkLoading.value = true
  try {
    const res = await apiFetch<any>('/api/staff/attendance/bulk', {
      method: 'POST',
      body: {
        date: jalaliToApiDate(bulkForm.date),
        records: bulkForm.records.map(r => ({
          staffId: r.staffId,
          status: r.status,
          adminNotes: r.adminNotes || null,
          sessions: r.sessions.filter(s => s.checkInTime),
        })),
      },
    })
    if (res.success) {
      $toast.success(t('attendance.attendanceSaved'))
      bulkDialog.value = false
      fetchReport()
    }
  } catch {
    $toast.error(t('attendance.saveError'))
  } finally {
    bulkLoading.value = false
  }
}

// --- Staff Methods ---
const doCheckIn = async () => {
  actionLoading.value = true
  try {
    const res = await apiFetch<any>('/api/staff/attendance/check-in', { method: 'POST', body: { workLocation: 'clinic' } })
    if (res.success) {
      todayRecord.value = res.data
      $toast.success(t('attendance.checkInSuccess'))
      fetchMyRecords()
    }
  } catch (err: any) {
    $toast.error(err?.data?.error || t('attendance.checkInError'))
  } finally {
    actionLoading.value = false
  }
}

const doCheckOut = async () => {
  actionLoading.value = true
  try {
    const res = await apiFetch<any>('/api/staff/attendance/check-out', { method: 'POST', body: {} })
    if (res.success) {
      todayRecord.value = res.data
      $toast.success(t('attendance.checkOutSuccess'))
      fetchMyRecords()
    }
  } catch (err: any) {
    $toast.error(err?.data?.error || t('attendance.checkOutError'))
  } finally {
    actionLoading.value = false
  }
}

const fetchMyRecords = async () => {
  const now = moment()
  let targetMonth: number
  let targetYear: number

  if (selectedMonth.value) {
    const parts = selectedMonth.value.split('-')
    targetMonth = parseInt(parts[0] || '0')
    targetYear = parseInt(parts[1] || '0')
  } else {
    targetMonth = now.jMonth() + 1
    targetYear = now.jYear()
  }

  try {
    const res = await apiFetch<any>(`/api/staff/attendance/me?month=${targetMonth}&year=${targetYear}`)
    if (res.success) {
      myRecords.value = res.data || []
      const today = todayJalali()
      todayRecord.value = myRecords.value.find((r: any) => r.date === today) || null
    }
  } catch { /* ignore */ }
}

// --- Init ---
const init = async () => {
  const now = moment()
  selectedMonth.value = `${now.jMonth() + 1}-${now.jYear()}`

  if (isAdmin.value) {
    await fetchStaffList()
    fetchReport()
    fetchTodayStats()
  } else {
    fetchMyRecords()
  }
}

watch(selectedMonth, () => {
  if (!isAdmin.value) fetchMyRecords()
})

onMounted(init)
useSeoMeta({ title: t('attendance.titleSeo') })
</script>
