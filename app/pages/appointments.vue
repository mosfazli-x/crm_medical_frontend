<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head pa-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('appointments.title') }}</h1>
        <p class="dash-head__date">{{ t('appointments.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <nav class="pa-nav" :aria-label="t('appointments.title')">
          <button type="button" class="pa-nav__today" :class="{ 'pa-nav__today--active': isToday }" @click="jumpToday">
            {{ t('appointments.today') }}
          </button>
          <span class="pa-nav__sep" aria-hidden="true" />
          <div class="pa-nav__group">
            <button type="button" class="pa-nav__btn pa-nav__btn--prev" :aria-label="t('appointments.prevDay')" @click="stepDay(-1)">
              <v-icon size="18">mdi-chevron-left</v-icon>
            </button>
            <span class="pa-nav__label crm-ltr">&lrm;{{ navLabel }}</span>
            <button type="button" class="pa-nav__btn pa-nav__btn--next" :aria-label="t('appointments.nextDay')" @click="stepDay(1)">
              <v-icon size="18">mdi-chevron-right</v-icon>
            </button>
          </div>
        </nav>
      </div>
    </header>

    <!-- ─── Loading skeletons ─── -->
    <div v-if="loading && !appointments.length">
      <div class="pa-metrics">
        <div v-for="n in 4" :key="`m-${n}`" class="asa-skel pa-metric-skel" />
      </div>
      <div class="asa-skel pa-table-skel" />
    </div>

    <template v-else>
      <!-- ─── Summary metrics ─── -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('appointments.daySummary') }}</p>
        <div class="pa-metrics">
          <article v-for="m in metrics" :key="m.key" class="asa-card pa-metric">
            <span class="asa-tint" :class="m.tint" aria-hidden="true">
              <component :is="m.icon" class="w-5! h-5! fill-current" />
            </span>
            <div class="pa-metric__copy">
              <p class="pa-metric__value">{{ m.value }}</p>
              <p class="pa-metric__label">{{ m.label }}</p>
            </div>
            <p class="pa-metric__foot">
              <span class="pa-dot" :class="m.dot" aria-hidden="true" />
              {{ m.foot }}
            </p>
          </article>
        </div>
      </section>

      <!-- ─── Frosted toolbar: search / filter / refresh ─── -->
      <div class="asa-toolbar">
        <div class="asa-field asa-field--search">
          <v-text-field v-model="searchQuery" variant="solo" density="comfortable" hide-details clearable
            :placeholder="t('appointments.searchPlaceholder')" prepend-inner-icon="mdi-magnify" />
        </div>
        <div class="asa-field asa-field--select">
          <v-select v-model="statusFilter" :items="statusOptions" item-title="title" item-value="value"
            variant="solo" density="comfortable" hide-details :label="t('appointments.filterStatus')" />
        </div>
        <div class="asa-field asa-field--select">
          <v-select v-model="visitTypeFilter" :items="visitTypeOptions" item-title="title" item-value="value"
            variant="solo" density="comfortable" hide-details :label="t('appointments.filterVisitType')" />
        </div>
        <div class="flex-1! min-w-0" />
        <span class="asa-pill asa-pill--teal whitespace-nowrap!">
          {{ t('appointments.resultsCount', { count: filteredAppointments.length }) }}
        </span>
        <button v-if="hasActiveFilters" type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearFilters">
          <v-icon size="14">mdi-filter-remove-outline</v-icon>
          {{ t('appointments.clearFilters') }}
        </button>
        <v-tooltip :text="t('appointments.refresh')" location="top">
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loading"
              :aria-label="t('appointments.refresh')" @click="fetchAppointments">
              <v-icon :size="18" :class="{ 'animate-spin!': loading }">mdi-refresh</v-icon>
            </button>
          </template>
        </v-tooltip>
      </div>

      <!-- ─── Empty: no match with active filters ─── -->
      <div v-if="!filteredAppointments.length && hasActiveFilters" class="asa-card asa-empty">
        <span class="asa-tint asa-tint--indigo" aria-hidden="true">
          <v-icon icon="mdi-filter-off-outline" size="32" />
        </span>
        <p class="asa-empty__title">{{ t('appointments.noResults') }}</p>
        <p class="asa-empty__sub">{{ t('appointments.noResultsDesc') }}</p>
        <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearFilters">
          <v-icon size="14">mdi-filter-remove-outline</v-icon>
          {{ t('appointments.clearFilters') }}
        </button>
      </div>

      <!-- ─── Empty: no appointments for the day ─── -->
      <div v-else-if="!appointments.length" class="asa-card asa-empty">
        <span class="asa-tint asa-tint--teal" aria-hidden="true">
          <Calendar class="w-8! h-8! fill-current" />
        </span>
        <p class="asa-empty__title">{{ t('appointments.noAppointments') }}</p>
        <p class="asa-empty__sub">{{ t('appointments.noAppointmentsDesc') }}</p>
      </div>

      <!-- ─── Appointment list ─── -->
      <template v-else>
        <!-- Desktop table (lg and up) -->
        <section class="asa-sec hidden! lg:block!">
          <div class="asa-card asa-table-card">
            <div class="asa-table-wrap">
              <table class="asa-table">
                <thead>
                  <tr>
                    <th>{{ t('appointments.colTime') }}</th>
                    <th>{{ t('appointments.colPatient') }}</th>
                    <th>{{ t('appointments.colMobile') }}</th>
                    <th>{{ t('appointments.colVisitType') }}</th>
                    <th>{{ t('appointments.colStatus') }}</th>
                    <th class="pa-th-end">{{ t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appt in filteredAppointments" :key="appt.id">
                    <td>
                      <span class="crm-ltr font-mono font-semibold!">&lrm;{{ timeRange(appt) }}</span>
                    </td>
                    <td>
                      <div class="flex items-center gap-3 min-w-0">
                        <span class="asa-tint pa-avatar pa-avatar--sm" :class="tintOf(appt)">
                          {{ initialsOf(appt) }}
                        </span>
                        <span class="min-w-0">
                          <span class="pa-td-name block">{{ patientName(appt) }}</span>
                          <span class="crm-ltr font-mono block text-[0.6875rem]! tracking-wider!" style="color: var(--asa-label-2)">
                            {{ appt.patientNationalId }}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span class="crm-ltr font-mono text-[0.8125rem]! tracking-wider!">
                        {{ appt.patientPhone || '—' }}
                      </span>
                    </td>
                    <td>
                      <span class="flex items-center gap-2">
                        <span class="pa-vtype-dot" :style="{ backgroundColor: appt.visitTypeColor || '#00adb5' }" aria-hidden="true" />
                        <span>{{ appt.visitTypeName || '—' }}</span>
                      </span>
                    </td>
                    <td>
                      <span class="asa-pill pa-status-pill" :class="statusPillClass(appt.status)">
                        {{ badgeLabel(appt.status) }}
                      </span>
                    </td>
                    <td class="pa-th-end">
                      <div class="flex items-center justify-end gap-1.5">
                        <template v-if="appt.status === 'pending'">
                          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" :disabled="pending(appt.id)"
                            @click="updateStatus(appt.id, 'confirmed')">
                            <v-icon size="14">mdi-check</v-icon>
                            {{ t('appointments.confirmAppointment') }}
                          </button>
                          <button type="button" class="asa-btn asa-btn--rose asa-btn--sm" :disabled="pending(appt.id)"
                            @click="askConfirm(appt, 'rejected')">
                            <v-icon size="14">mdi-close</v-icon>
                            {{ t('appointments.reject') }}
                          </button>
                        </template>
                        <template v-else-if="appt.status === 'confirmed'">
                          <button type="button" class="asa-btn pa-btn--green asa-btn--sm" :disabled="pending(appt.id)"
                            @click="updateStatus(appt.id, 'completed')">
                            <v-icon size="14">mdi-check-all</v-icon>
                            {{ t('appointments.markComplete') }}
                          </button>
                          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="pending(appt.id)"
                            @click="askConfirm(appt, 'cancelled')">
                            <v-icon size="14">mdi-close</v-icon>
                            {{ t('appointments.cancelAppointment') }}
                          </button>
                        </template>
                        <v-tooltip :text="t('appointments.sendSms')" location="top">
                          <template #activator="{ props }">
                            <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--teal"
                              :aria-label="t('appointments.sendSms')" @click="openSmsModal(appt)">
                              <ChatDots class="w-5! h-5! fill-current" />
                            </button>
                          </template>
                        </v-tooltip>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Tablet / mobile cards -->
        <div class="lg:hidden! mt-4! space-y-3!">
          <article v-for="appt in filteredAppointments" :key="`c-${appt.id}`" class="asa-card asa-pcard pa-pcard">
            <span class="asa-tint pa-avatar pa-avatar--lg" :class="tintOf(appt)">
              {{ initialsOf(appt) }}
            </span>
            <div class="asa-pcard__main">
              <p class="asa-pcard__name">
                {{ patientName(appt) }}
                <span class="asa-pill pa-status-pill pa-status-pill--inline" :class="statusPillClass(appt.status)">
                  {{ badgeLabel(appt.status) }}
                </span>
              </p>
              <p class="asa-pcard__meta">
                <span class="crm-ltr font-mono font-semibold!">&lrm;{{ timeRange(appt) }}</span>
                <span class="asa-dot-inline" aria-hidden="true" />
                <span class="flex items-center gap-1.5">
                  <span class="pa-vtype-dot" :style="{ backgroundColor: appt.visitTypeColor || '#00adb5' }" aria-hidden="true" />
                  {{ appt.visitTypeName || '—' }}
                </span>
              </p>
              <p class="asa-pcard__meta">
                <span class="crm-ltr font-mono">{{ appt.patientNationalId }}</span>
                <span class="asa-dot-inline" aria-hidden="true" />
                <span class="crm-ltr font-mono">{{ appt.patientPhone || '—' }}</span>
              </p>
            </div>
            <div class="pa-pcard__actions">
              <template v-if="appt.status === 'pending'">
                <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" :disabled="pending(appt.id)"
                  @click="updateStatus(appt.id, 'confirmed')">
                  <v-icon size="14">mdi-check</v-icon>
                  {{ t('appointments.confirmAppointment') }}
                </button>
                <button type="button" class="asa-btn asa-btn--rose asa-btn--sm" :disabled="pending(appt.id)"
                  @click="askConfirm(appt, 'rejected')">
                  <v-icon size="14">mdi-close</v-icon>
                  {{ t('appointments.reject') }}
                </button>
              </template>
              <template v-else-if="appt.status === 'confirmed'">
                <button type="button" class="asa-btn pa-btn--green asa-btn--sm" :disabled="pending(appt.id)"
                  @click="updateStatus(appt.id, 'completed')">
                  <v-icon size="14">mdi-check-all</v-icon>
                  {{ t('appointments.markComplete') }}
                </button>
                <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="pending(appt.id)"
                  @click="askConfirm(appt, 'cancelled')">
                  <v-icon size="14">mdi-close</v-icon>
                  {{ t('appointments.cancelAppointment') }}
                </button>
              </template>
              <button type="button" class="asa-icon-btn asa-icon-btn--teal" :aria-label="t('appointments.sendSms')"
                @click="openSmsModal(appt)">
                <ChatDots class="w-5! h-5! fill-current" />
              </button>
            </div>
          </article>
        </div>
      </template>
    </template>

    <!-- ─── Confirm destructive action dialog ─── -->
    <v-dialog v-model="confirmDialog" max-width="440">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint asa-tint--rose" aria-hidden="true">
              <v-icon size="20">mdi-alert-outline</v-icon>
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-xl!">{{ confirmTitle }}</h2>
              <span class="asa-dialog__sub">{{ confirmDesc }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="confirmDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="confirmTarget" class="asa-note">
            <span class="asa-tint asa-tint--sm asa-tint--rose" aria-hidden="true">
              <Calendar class="w-4! h-4! fill-current" />
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ patientName(confirmTarget) }}</p>
              <p class="asa-note__value truncate!">
                <span class="crm-ltr font-mono">&lrm;{{ timeRange(confirmTarget) }}</span>
                <span class="asa-dot-inline mx-1.5! inline-block align-middle!" aria-hidden="true" />
                <span>{{ formatJalaliDate(confirmTarget.appointmentDate) }}</span>
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="confirmDialog = false">{{ t('common.cancel') }}</button>
          <button class="asa-btn pa-btn--destructive" :disabled="pending(confirmTarget?.id)" @click="runConfirm">
            {{ confirmActionLabel }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── SMS dialog ─── -->
    <v-dialog v-model="smsDialog" max-width="520">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('appointments.smsTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('appointments.sendSms') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="smsDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="selectedSmsAppointment" class="asa-note">
            <span class="asa-tint asa-tint--teal asa-tint--sm" aria-hidden="true">
              <ChatDots class="w-4! h-4! fill-current" />
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ t('appointments.recipient') }}</p>
              <p class="asa-note__value truncate!">
                {{ patientName(selectedSmsAppointment) }}
                <span class="crm-ltr font-mono">&lrm;({{ selectedSmsAppointment.patientPhone }})</span>
              </p>
            </div>
          </div>

          <div class="mt-5!">
            <label class="asa-field-label">{{ t('appointments.messageText') }}</label>
            <textarea v-model="smsText" rows="4" maxlength="500" class="asa-textarea"
              :placeholder="t('appointments.smsPlaceholder')" />
            <div class="mt-1! flex items-center justify-between">
              <span class="text-xs! font-mono crm-ltr" style="color: var(--asa-label-3)">{{ smsText.length }}/500</span>
              <span v-if="smsText.length > 500" class="text-xs! font-bold" style="color: var(--asa-rose)">
                {{ t('appointments.smsCharLimit') }}
              </span>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="smsDialog = false">{{ t('common.cancel') }}</button>
          <button class="asa-btn asa-btn--primary" :disabled="!smsText.trim() || smsText.length > 500 || sendingSms" @click="sendSms">
            <v-icon v-if="sendingSms" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ sendingSms ? t('common.sending') : t('appointments.sendSmsBtn') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Calendar from '~/components/icons/Calendar.vue'
import Clock from '~/components/icons/Clock.vue'
import HeartPulse from '~/components/icons/HeartPulse.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import { useStatusBadge } from '~/composables/useStatusBadge'

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { formatJalaliDate, formatJalaliLong, toDateStr } = useFormatting()
const { badgeLabel } = useStatusBadge()

interface AppointmentItem {
  id: string
  doctorId?: string
  appointmentDate: string
  startTime?: string
  endTime?: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  visitTypeId?: string
  visitTypeName?: string
  visitTypeColor?: string
  patientFirstName?: string
  patientLastName?: string
  patientNationalId?: string
  patientPhone?: string
}

const appointments = ref<AppointmentItem[]>([])
const loading = ref(false)
const updatingId = ref<string | null>(null)
const currentDate = ref(new Date())

const navLabel = computed(() => formatJalaliLong(currentDate.value))
const dateStr = computed(() => toDateStr(currentDate.value))
const isToday = computed(() => dateStr.value === toDateStr(new Date()))

const pending = (id: string | undefined | null) => !!id && updatingId.value === id

function stepDay(offset: number) {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + offset)
  currentDate.value = d
  fetchAppointments()
}

function jumpToday() {
  currentDate.value = new Date()
  fetchAppointments()
}

async function fetchAppointments() {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: AppointmentItem[] }>(
      `/api/scheduling/appointments?date=${dateStr.value}`
    )
    if (res.success) appointments.value = res.data
  } catch {
    $toast.error(t('appointments.fetchError'))
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: string, status: string) {
  updatingId.value = id
  try {
    const res = await apiFetch<{ success: boolean; error?: string }>(`/api/scheduling/appointments/${id}/status`, {
      method: 'PUT',
      body: { status },
    })
    if (res.success) {
      $toast.success(t('appointments.statusUpdated'))
      await fetchAppointments()
    } else {
      $toast.error(res.error || t('appointments.statusUpdateError'))
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('appointments.statusUpdateError'))
  } finally {
    updatingId.value = null
  }
}

// ─── Summary metrics ───
const countBy = (status: string) => appointments.value.filter((a) => a.status === status).length

const metrics = computed(() => [
  {
    key: 'total', icon: Calendar, tint: 'asa-tint--teal', dot: 'pa-dot--teal',
    value: appointments.value.length, label: t('appointments.metricTotal'),
    foot: t('appointments.metricTotalFoot'),
  },
  {
    key: 'pending', icon: Clock, tint: 'asa-tint--amber', dot: 'pa-dot--amber',
    value: countBy('pending'), label: t('appointments.metricPending'),
    foot: t('appointments.metricPendingFoot'),
  },
  {
    key: 'confirmed', icon: HeartPulse, tint: 'asa-tint--indigo', dot: 'pa-dot--indigo',
    value: countBy('confirmed'), label: t('appointments.metricConfirmed'),
    foot: t('appointments.metricConfirmedFoot'),
  },
  {
    key: 'completed', icon: ClipboardCheck, tint: 'asa-tint--green', dot: 'pa-dot--green',
    value: countBy('completed'), label: t('appointments.metricCompleted'),
    foot: t('appointments.metricCompletedFoot'),
  },
])

// ─── Filters ───
const searchQuery = ref('')
const statusFilter = ref('all')
const visitTypeFilter = ref('all')

const statusOptions = computed(() => [
  { title: t('appointments.filterAllStatuses'), value: 'all' },
  ...['pending', 'confirmed', 'rejected', 'cancelled', 'completed'].map((s) => ({
    title: badgeLabel(s),
    value: s,
  })),
])

const visitTypeOptions = computed(() => {
  const names = [...new Set(appointments.value.map((a) => a.visitTypeName).filter(Boolean))] as string[]
  return [
    { title: t('appointments.filterAllVisitTypes'), value: 'all' },
    ...names.map((name) => ({ title: name, value: name })),
  ]
})

const hasActiveFilters = computed(
  () => searchQuery.value.trim() !== '' || statusFilter.value !== 'all' || visitTypeFilter.value !== 'all'
)

const filteredAppointments = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return appointments.value
    .slice()
    .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    .filter((a) => {
      if (statusFilter.value !== 'all' && a.status !== statusFilter.value) return false
      if (visitTypeFilter.value !== 'all' && a.visitTypeName !== visitTypeFilter.value) return false
      if (q) {
        const hay = `${a.patientFirstName || ''} ${a.patientLastName || ''} ${a.patientNationalId || ''} ${a.patientPhone || ''}`
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
})

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
  visitTypeFilter.value = 'all'
}

// ─── Helpers ───
const patientName = (appt: AppointmentItem | null | undefined) =>
  `${appt?.patientFirstName || ''} ${appt?.patientLastName || ''}`.trim() || '—'

const timeRange = (appt: AppointmentItem | null | undefined) =>
  `${appt?.startTime?.slice(0, 5) || '--:--'} – ${appt?.endTime?.slice(0, 5) || '--:--'}`

const statusPillClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'asa-pill--amber',
    confirmed: 'asa-pill--teal',
    completed: 'asa-pill--green',
    rejected: 'asa-pill--rose',
    cancelled: 'asa-pill--rose',
  }
  return map[status] || 'pa-pill--neutral'
}

const FULL_TINTS = ['asa-tint--teal', 'asa-tint--green', 'asa-tint--orange', 'asa-tint--rose', 'asa-tint--indigo']

const initialsOf = (appt: AppointmentItem | null | undefined) => {
  const initials = `${appt?.patientFirstName?.charAt(0) || ''}${appt?.patientLastName?.charAt(0) || ''}`.toUpperCase()
  return initials || '·'
}

const tintOf = (appt: AppointmentItem | null | undefined) => {
  const key = `${appt?.patientFirstName || ''}${appt?.patientLastName || ''}${appt?.patientNationalId || ''}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return FULL_TINTS[hash % FULL_TINTS.length]
}

// ─── Confirm destructive action ───
const confirmDialog = ref(false)
const confirmAction = ref<'rejected' | 'cancelled' | null>(null)
const confirmTarget = ref<AppointmentItem | null>(null)

const confirmTitle = computed(() =>
  confirmAction.value === 'rejected' ? t('appointments.confirmRejectTitle') : t('appointments.confirmCancelTitle')
)

const confirmDesc = computed(() =>
  confirmAction.value === 'rejected'
    ? t('appointments.confirmRejectDesc', { name: patientName(confirmTarget.value) })
    : t('appointments.confirmCancelDesc', { name: patientName(confirmTarget.value) })
)

const confirmActionLabel = computed(() =>
  confirmAction.value === 'rejected' ? t('appointments.reject') : t('appointments.cancelAppointment')
)

function askConfirm(appt: AppointmentItem, action: 'rejected' | 'cancelled') {
  confirmTarget.value = appt
  confirmAction.value = action
  confirmDialog.value = true
}

async function runConfirm() {
  if (!confirmTarget.value || !confirmAction.value) return
  const target = confirmTarget.value
  const action = confirmAction.value
  confirmDialog.value = false
  confirmTarget.value = null
  confirmAction.value = null
  await updateStatus(target.id, action)
}

// ─── SMS ───
const smsDialog = ref(false)
const selectedSmsAppointment = ref<AppointmentItem | null>(null)
const smsText = ref('')
const sendingSms = ref(false)

function openSmsModal(appt: AppointmentItem) {
  selectedSmsAppointment.value = appt
  smsText.value = ''
  smsDialog.value = true
}

async function sendSms() {
  if (!smsText.value.trim()) { $toast.error(t('appointments.smsEmptyError')); return }
  if (smsText.value.length > 500) { $toast.error(t('appointments.smsLimitError')); return }
  const appt = selectedSmsAppointment.value
  if (!appt) return

  sendingSms.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(`/api/scheduling/appointments/${appt.id}/send-sms`, {
      method: 'POST',
      body: { text: smsText.value },
    })
    if (res.success) {
      $toast.success(t('appointments.smsSentSuccess'))
      smsDialog.value = false
    }
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('appointments.smsSendError'))
  } finally {
    sendingSms.value = false
  }
}

onMounted(() => fetchAppointments())

useSeoMeta({ title: t('appointments.titleSeo') })
</script>

<style scoped>
/* ── Header date navigator ─────────────────────── */
.pa-head {
  margin-top: 0.25rem;
}

.pa-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.9rem;
  background: color-mix(in srgb, var(--asa-bg-card) 70%, transparent);
  -webkit-backdrop-filter: blur(14px) saturate(1.8);
  backdrop-filter: blur(14px) saturate(1.8);
  box-shadow: var(--asa-card-shadow);
}

.pa-nav__today {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  padding: 0 0.875rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.pa-nav__today:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.pa-nav__today--active {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .pa-nav__today--active {
  color: var(--asa-accent);
}

.pa-nav__sep {
  width: 1px;
  height: 1.375rem;
  background: var(--asa-sep);
  flex-shrink: 0;
}

.pa-nav__group {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  padding-inline: 0.1875rem;
}

.pa-nav__btn {
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
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.pa-nav__btn:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

/* In RTL the calendar advances to the left, so mirror the chevrons */
:dir(rtl) .pa-nav__btn--prev,
:dir(rtl) .pa-nav__btn--next {
  transform: scaleX(-1);
}

.pa-nav__label {
  min-width: 11rem;
  padding-inline: 0.5rem;
  text-align: center;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  user-select: none;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .pa-nav__label {
    min-width: 0;
  }
}

/* ── Frosted, sticky toolbar ───────────────────── */
.asa-toolbar {
  position: sticky;
  top: 0.75rem;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: 1.25rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-bg-card) 82%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.8);
  backdrop-filter: blur(18px) saturate(1.8);
  box-shadow: var(--asa-card-shadow);
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.asa-field--search {
  flex: 1 1 16rem;
  min-width: 13rem;
}

.asa-field--select {
  flex: 0 1 11.5rem;
  min-width: 10.5rem;
}

.asa-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.asa-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.asa-field :deep(.v-field__overlay) {
  background: transparent;
}

.asa-field :deep(.v-field__input),
.asa-field :deep(.v-field__input::placeholder),
.asa-field :deep(.v-select__selection),
.asa-field :deep(.v-label) {
  color: var(--asa-label);
}

.asa-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.asa-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.asa-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

/* ── Metrics grid ──────────────────────────────── */
.pa-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

@media (min-width: 560px) {
  .pa-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .pa-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

.pa-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 1.125rem 1.25rem;
}

.pa-metric__copy {
  min-width: 0;
  text-align: end;
}

.pa-metric__value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.pa-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.pa-metric__foot {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--asa-sep);
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.pa-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-label-3) 18%, transparent);
}

.pa-dot--teal {
  background: var(--asa-accent);
  box-shadow: 0 0 0 3px var(--asa-accent-soft);
}

.pa-dot--amber {
  background: var(--asa-amber);
  box-shadow: 0 0 0 3px var(--asa-amber-soft);
}

.pa-dot--indigo {
  background: var(--asa-indigo);
  box-shadow: 0 0 0 3px var(--asa-indigo-soft);
}

.pa-dot--green {
  background: var(--asa-green);
  box-shadow: 0 0 0 3px var(--asa-green-soft);
}

/* ── Skeleton blocks ───────────────────────────── */
.pa-metric-skel {
  height: 7.5rem;
  border-radius: 1.375rem;
}

.pa-table-skel {
  height: 24rem;
  margin-top: 1.25rem;
  border-radius: 1.375rem;
}

/* ── Avatar (initials, Apple tint) ─────────────── */
.pa-avatar {
  font-size: 0.875rem;
  font-weight: 700;
}

.pa-avatar--sm {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
}

.pa-avatar--lg {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  font-size: 1rem;
}

/* ── Compact icon buttons ──────────────────────── */
.asa-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.asa-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.dark .asa-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.asa-icon-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.asa-icon-btn--teal {
  color: var(--asa-accent-deep);
}

.dark .asa-icon-btn--teal {
  color: var(--asa-accent);
}

/* ── Desktop table ─────────────────────────────── */
.asa-table-card {
  padding: 0;
  overflow: hidden;
}

.asa-table-wrap {
  overflow-x: auto;
}

.asa-table {
  width: 100%;
  min-width: 52rem;
  border-collapse: collapse;
  text-align: start;
}

.asa-table thead th {
  padding: 0.875rem 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.asa-table tbody td {
  padding: 0.875rem 1rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-top: 1px solid var(--asa-sep);
  white-space: nowrap;
  vertical-align: middle;
}

.asa-table tbody tr {
  transition: background-color 150ms var(--ease-default);
}

.asa-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .asa-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.pa-th-end {
  text-align: end !important;
}

.pa-td-name {
  display: block;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pa-vtype-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}

/* ── Status pill ───────────────────────────────── */
.pa-status-pill {
  padding: 0.3125rem 0.625rem !important;
  font-weight: 600;
}

.pa-status-pill--inline {
  margin-inline-start: 0.375rem;
}

.pa-pill--neutral {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
}

/* ── Action button variants ────────────────────── */
.pa-btn--green {
  background: var(--asa-green);
  color: #ffffff;
}

.pa-btn--green:hover {
  background: color-mix(in srgb, var(--asa-green) 88%, #000);
}

.pa-btn--destructive {
  background: var(--asa-rose);
  color: #ffffff;
}

.pa-btn--destructive:hover {
  background: color-mix(in srgb, var(--asa-rose) 88%, #000);
}

/* ── Tablet / mobile cards ─────────────────────── */
.asa-pcard {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.9375rem 1rem;
}

.asa-pcard__main {
  min-width: 0;
  flex: 1 1 auto;
}

.asa-pcard__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-pcard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.asa-dot-inline {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

.pa-pcard__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.pa-pcard__actions .asa-icon-btn {
  width: 2rem;
  height: 2rem;
}

/* ── Empty state ───────────────────────────────── */
.asa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.asa-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-empty__sub {
  margin-top: -0.5rem;
  max-width: 26rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

/* ── Info note inside dialogs ──────────────────── */
.asa-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 1rem;
  background: var(--asa-accent-soft);
  color: var(--asa-label);
}

.asa-note__label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.asa-note__value {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

/* ── Textarea (SMS) ────────────────────────────── */
.asa-textarea {
  display: block;
  width: 100%;
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  border: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label);
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.asa-textarea:focus {
  outline: none;
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.asa-textarea::placeholder {
  color: var(--asa-label-3);
}

/* ── Responsive tuning ─────────────────────────── */
@media (max-width: 480px) {
  .asa-field--search,
  .asa-field--select {
    flex-basis: 100% !important;
  }

  .pa-pcard__actions {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>