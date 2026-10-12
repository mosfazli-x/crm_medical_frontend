<template>
  <div class="app-rise">
    <div v-if="loading" class="app-list">
      <div class="app-skel" style="height: 168px;" />
      <div v-for="i in 4" :key="i" class="app-skel" style="height: 68px;" />
    </div>

    <!-- Patients cannot log attendance -->
    <div v-else-if="!canPunch" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:shield-off" size="26" /></span>
      <p>ثبت حضور و غیاب برای نقش شما فعال نیست</p>
    </div>

    <template v-else>
      <!-- ══════════ Punch card (every clinic member) ══════════ -->
      <section class="app-card app-pad punch">
        <p class="punch__eyebrow">{{ todayLabel }}</p>
        <div
          class="app-avatar app-avatar--lg"
          :style="{ background: selfOpen ? 'var(--app-green-soft)' : 'var(--app-surface-2)' }"
        >
          <Icon :name="selfOpen ? 'lucide:log-out' : 'lucide:log-in'" size="26" />
        </div>
        <h2 class="punch__title">
          {{ selfOpen ? 'در حال کار هستید' : todayRecord ? 'خارج از شیفت هستید' : 'ورود ثبت نشده' }}
        </h2>
        <p class="app-muted punch__hint">
          {{ selfOpen ? 'برای پایان کار، خروج را ثبت کنید' : 'برای شروع کار، ورود را ثبت کنید' }}
        </p>

        <button
          type="button"
          class="app-btn app-mt-16"
          :class="selfOpen ? 'app-btn--danger' : 'app-btn--primary'"
          :disabled="punchBusy"
          @click="togglePunch"
        >
          <Icon
            :name="punchBusy ? 'lucide:loader-2' : selfOpen ? 'lucide:log-out' : 'lucide:log-in'"
            size="19"
            :class="{ 'app-spin': punchBusy }"
          />
          {{ selfOpen ? 'ثبت خروج' : 'ثبت ورود' }}
        </button>

        <p v-if="todayRecord?.workedMinutes" class="app-muted punch__worked">
          <Icon name="lucide:timer" size="14" /> امروز {{ formatMinutes(todayRecord.workedMinutes) }}
        </p>

        <div v-if="todayRecord?.sessions?.length" class="app-scroll-x punch__sessions">
          <span v-for="(session, i) in todayRecord.sessions" :key="i" class="app-pill app-pill--neutral">
            {{ sessionLabelItem(session) }}
          </span>
        </div>
      </section>

      <!-- ══════════ ADMIN: today's team report ══════════ -->
      <template v-if="isAdmin">
        <section class="app-hero app-mt-16">
          <p class="app-hero__eyebrow">گزارش حضور امروز</p>
          <h1 class="app-hero__title">وضعیت همکاران</h1>
          <div class="app-hero__meta">
            <span class="app-hero__chip">
              <Icon name="lucide:user-check" size="15" /> حاضر {{ pn(counts.present) }}
            </span>
            <span class="app-hero__chip">
              <Icon name="lucide:clock-alert" size="15" /> تأخیر {{ pn(counts.late) }}
            </span>
            <span class="app-hero__chip">
              <Icon name="lucide:user-x" size="15" /> غایب {{ pn(counts.absent) }}
            </span>
            <span class="app-hero__chip">
              <Icon name="lucide:plane" size="15" /> مرخصی {{ pn(counts.leave) }}
            </span>
          </div>
        </section>

        <div class="app-section">
          <h2>سوابق امروز</h2>
          <button type="button" @click="refresh">به‌روزرسانی</button>
        </div>

        <div v-if="!records.length" class="app-empty">
          <span class="app-empty__icon"><Icon name="lucide:calendar-x" size="26" /></span>
          <p>امروز هنوز حضوری ثبت نشده است</p>
        </div>

        <div v-else class="app-list">
          <div v-for="record in records" :key="record.id" class="app-row">
            <span class="app-avatar">{{ initials(record.staffName) }}</span>
            <span class="app-row__body">
              <span class="app-row__title">{{ record.staffName || 'کارمند' }}</span>
              <span class="app-row__sub">
                <template v-if="record.sessions?.length">{{ sessionLabel(record.sessions) }}</template>
                <template v-else>بدون تردد ثبت‌شده</template>
              </span>
            </span>
            <span class="app-row__tail">
              <span class="app-pill" :class="statusPill(record.status)">{{ statusLabel(record.status) }}</span>
              <span v-if="record.workedMinutes" class="app-muted" style="display: block; margin-top: 6px; font-size: 11.5px;">
                {{ formatMinutes(record.workedMinutes) }}
              </span>
            </span>
            <button
              type="button"
              class="app-iconbtn att-del"
              :aria-label="`حذف رکورد ${record.staffName || 'کارمند'}`"
              @click="openDelete(record)"
            >
              <Icon name="lucide:trash-2" size="17" />
            </button>
          </div>
        </div>
      </template>

      <!-- ══════════ SELF: monthly history ══════════ -->
      <template v-else>
        <div class="app-section app-mt-16">
          <button type="button" class="app-iconbtn" aria-label="ماه قبل" @click="shiftMonth(-1)">
            <Icon name="lucide:chevron-right" size="18" />
          </button>
          <h2>{{ monthLabel }}</h2>
          <button type="button" class="app-iconbtn" aria-label="ماه بعد" :disabled="isCurrentMonth" @click="shiftMonth(1)">
            <Icon name="lucide:chevron-left" size="18" />
          </button>
        </div>

        <section class="app-stats">
          <div class="app-stat">
            <span class="app-stat__label"><Icon name="lucide:check-circle-2" size="14" /> روزهای کارکرد</span>
            <span class="app-stat__value">{{ pn(monthRate) }}٪</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__label"><Icon name="lucide:timer" size="14" /> این ماه</span>
            <span class="app-stat__value">{{ formatMinutes(monthMinutes) }}</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__label"><Icon name="lucide:calendar-days" size="14" /> سوابق</span>
            <span class="app-stat__value">{{ pn(selfRecords.length) }}</span>
          </div>
        </section>

        <div v-if="!selfRecords.length" class="app-empty">
          <span class="app-empty__icon"><Icon name="lucide:calendar-x" size="26" /></span>
          <p>در این ماه سابقه‌ای ثبت نشده است</p>
        </div>

        <div v-else class="app-list app-mt-16">
          <div v-for="record in selfRecords" :key="record.id" class="app-row">
            <span class="app-avatar" style="width: 40px; height: 40px; font-size: 12px;">{{ pn(dayOf(record.date)) }}</span>
            <span class="app-row__body">
              <span class="app-row__title">{{ weekday(record.date) }}</span>
              <span class="app-row__sub">
                <template v-if="record.sessions?.length">{{ sessionLabel(record.sessions) }}</template>
                <template v-else>—</template>
              </span>
            </span>
            <span class="app-row__tail">
              <span class="app-pill" :class="statusPill(record.status)">{{ statusLabel(record.status) }}</span>
              <span v-if="record.workedMinutes" class="app-muted" style="display: block; margin-top: 6px; font-size: 11.5px;">
                {{ formatMinutes(record.workedMinutes) }}
              </span>
            </span>
          </div>
        </div>
      </template>
    </template>

    <UiConfirmDialog
      v-model="deleteOpen"
      variant="danger"
      title="حذف رکورد حضور"
      :message="deleteMessage"
      confirm-label="حذف"
      cancel-label="انصراف"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import type {
  AttendanceRecord,
  AttendanceReport,
  AttendanceSession,
  AttendanceStatus,
} from '~/types/attendance'

definePageMeta({ layout: 'app', appTitle: 'حضور و غیاب', appSubtitle: 'تردد کارکنان' })

interface ApiEnvelope<T> { success: boolean; data: T }

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: 'حاضر',
  late: 'تأخیر',
  absent: 'غایب',
  leave: 'مرخصی',
  holiday: 'تعطیل',
}
const STATUS_PILL: Record<AttendanceStatus, string> = {
  present: 'app-pill--green',
  late: 'app-pill--amber',
  absent: 'app-pill--rose',
  leave: 'app-pill--indigo',
  holiday: 'app-pill--teal',
}

const { user } = useAuth()
const { apiFetch } = useApi()
const { pn } = useLang()
const { formatMinutes, todayJalali } = useFormatting()
const { $toast } = useNuxtApp()

// Only patients are barred from logging their own attendance; every other
// clinic role (admin, doctors, lab, pharmacy, staff) can check in and out.
const canPunch = computed(() => Boolean(user.value) && user.value?.role !== 'patient')
const isAdmin = computed(() => user.value?.role === 'admin_doctor')
const today = todayJalali()

const records = ref<AttendanceRecord[]>([])
const selfRecords = ref<AttendanceRecord[]>([])
const loading = ref(true)
const punchBusy = ref(false)

// Admin record deletion
const deleteOpen = ref(false)
const deleteTarget = ref<AttendanceRecord | null>(null)
const deleting = ref(false)

// Jalali month shown in the personal history (defaults to the current month).
const cursor = ref(moment())

const todayLabel = computed(() => moment().format('dddd jD jMMMM jYYYY'))

const counts = computed(() => ({
  present: records.value.filter((r) => r.status === 'present').length,
  late: records.value.filter((r) => r.status === 'late').length,
  absent: records.value.filter((r) => r.status === 'absent').length,
  leave: records.value.filter((r) => r.status === 'leave').length,
}))

const todayRecord = computed(() => selfRecords.value.find((r) => r.date === today) ?? null)
const selfOpen = computed(() =>
  (todayRecord.value?.sessions ?? []).some((s) => s.checkInTime && !s.checkOutTime),
)
const monthMinutes = computed(() => selfRecords.value.reduce((sum, r) => sum + (r.workedMinutes || 0), 0))
const monthRate = computed(() => {
  if (!selfRecords.value.length) return 0
  const worked = selfRecords.value.filter((r) => r.status === 'present' || r.status === 'late').length
  return Math.round((worked / selfRecords.value.length) * 100)
})
const monthLabel = computed(() => cursor.value.format('jMMMM jYYYY'))
const isCurrentMonth = computed(() => cursor.value.format('jYYYY-jMM') === moment().format('jYYYY-jMM'))

const statusLabel = (s: AttendanceStatus) => STATUS_LABEL[s] || s
const statusPill = (s: AttendanceStatus) => STATUS_PILL[s] || 'app-pill--neutral'

function initials(name?: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '؟'
  return parts.length === 1 ? parts[0]!.charAt(0) : parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
}

function clock(value: string | null | undefined): string {
  if (!value) return '--:--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 5)
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

function sessionLabelItem(session: AttendanceSession): string {
  return session.checkOutTime
    ? `${clock(session.checkInTime)} → ${clock(session.checkOutTime)}`
    : `${clock(session.checkInTime)} → در حال کار`
}

function sessionLabel(sessions: AttendanceSession[]): string {
  const first = sessions[0]
  const last = sessions[sessions.length - 1]
  if (!first) return '—'
  return `${clock(first.checkInTime)} → ${last?.checkOutTime ? clock(last.checkOutTime) : 'در حال کار'}`
}

const dayOf = (date: string) => moment(date, 'jYYYY-jMM-jDD').format('jD')
const weekday = (date: string) => moment(date, 'jYYYY-jMM-jDD').format('dddd jD jMMMM')

async function fetchReport() {
  try {
    const params = new URLSearchParams({ startDate: today, endDate: today })
    const res = await apiFetch<ApiEnvelope<AttendanceReport>>(`/api/staff/attendance/report?${params}`)
    records.value = res?.success && Array.isArray(res.data?.records) ? res.data.records : []
  } catch {
    records.value = []
  }
}

async function fetchSelf() {
  try {
    const res = await apiFetch<ApiEnvelope<AttendanceRecord[]>>(
      `/api/staff/attendance/me?month=${cursor.value.format('jM')}&year=${cursor.value.format('jYYYY')}`,
    )
    selfRecords.value = (res?.success && Array.isArray(res.data) ? res.data : [])
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    selfRecords.value = []
  }
}

async function refresh() {
  loading.value = true
  const jobs: Array<Promise<unknown>> = []
  if (canPunch.value) jobs.push(fetchSelf())
  if (isAdmin.value) jobs.push(fetchReport())
  await Promise.all(jobs)
  loading.value = false
}

function shiftMonth(delta: number) {
  if (delta > 0 && isCurrentMonth.value) return
  cursor.value = cursor.value.clone().add(delta, 'jMonth')
  void fetchSelf()
}

async function togglePunch() {
  punchBusy.value = true
  try {
    if (selfOpen.value) {
      const res = await apiFetch<{ success: boolean }>('/api/staff/attendance/check-out', {
        method: 'POST',
        body: { notes: null },
      })
      if (res?.success) {
        $toast.success('خروج با موفقیت ثبت شد')
        await fetchSelf()
        if (isAdmin.value) await fetchReport()
      }
    } else {
      // The backend creates today's record on the fly, so a check-in always works
      // even before the first punch of the day.
      const res = await apiFetch<{ success: boolean }>('/api/staff/attendance/check-in', {
        method: 'POST',
        body: { workLocation: 'clinic', notes: null },
      })
      if (res?.success) {
        $toast.success('ورود با موفقیت ثبت شد')
        await fetchSelf()
        if (isAdmin.value) await fetchReport()
      }
    }
  } catch {
    $toast.error('ثبت تردد ناموفق بود')
  } finally {
    punchBusy.value = false
  }
}

const deleteMessage = computed(() =>
  deleteTarget.value
    ? `رکورد حضور «${deleteTarget.value.staffName || 'کارمند'}» در تاریخ ${deleteTarget.value.date} حذف شود؟ این عمل قابل بازگشت نیست.`
    : '',
)

function openDelete(record: AttendanceRecord) {
  deleteTarget.value = record
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(
      `/api/staff/attendance/${deleteTarget.value.id}`,
      { method: 'DELETE' },
    )
    if (res?.success) {
      $toast.success('رکورد حذف شد')
      deleteOpen.value = false
      // Deleting a record can move both the team report and the admin's own history.
      await Promise.all([fetchReport(), fetchSelf()])
    }
  } catch {
    $toast.error('حذف رکورد ناموفق بود')
  } finally {
    deleting.value = false
  }
}

// `user` is hydrated from localStorage on mount, so the role can resolve a tick
// after this page's own hook. Re-run once it lands so the view never stays blank.
let bootstrapped = false
watch(
  () => user.value?.role,
  () => {
    if (bootstrapped) void refresh()
  },
)

onMounted(() => {
  bootstrapped = true
  if (user.value) void refresh()
})
</script>

<style scoped>
.punch {
  text-align: center;
}
.punch__eyebrow {
  font-size: 12px;
  font-weight: 600;
  color: var(--app-muted);
  margin-bottom: 10px;
}
.punch__title {
  margin-top: 12px;
  font-size: 17px;
  font-weight: 800;
}
.punch__hint {
  margin-top: 4px;
  font-size: 12.5px;
}
.punch__worked {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 12px;
  font-size: 12.5px;
}
.punch__sessions {
  justify-content: center;
  margin-top: 12px;
}

.app-avatar--lg {
  width: 64px;
  height: 64px;
  font-size: 22px;
  margin: 0 auto;
}

.app-spin {
  animation: app-spin 0.9s linear infinite;
}
@keyframes app-spin {
  to { transform: rotate(360deg); }
}

.att-del {
  width: 34px;
  height: 34px;
  color: var(--app-expense);
  background: var(--app-rose-soft);
}

.app-mt-0 { margin-top: 0; }
</style>
