<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('scheduling.title') }}</h1>
        <p class="dash-head__date">{{ t('scheduling.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button class="asa-btn asa-btn--ghost" :disabled="loading || saving" :aria-label="t('scheduling.refresh')"
          @click="refreshAll">
          <v-icon size="16" :class="{ 'sc-spin': loading }">mdi-refresh</v-icon>
        </button>
        <a class="asa-btn asa-btn--primary" :href="bookingUrl" target="_blank" rel="noopener">
          <v-icon size="15">mdi-open-in-new</v-icon>
          <span class="hidden sm:inline!">{{ t('scheduling.viewBookingPage') }}</span>
        </a>
      </div>
    </header>

    <!-- ─── Summary metrics ─── -->
    <div v-if="!loaded" class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
      <div v-for="i in 3" :key="`ms-${i}`" class="asa-skel rounded-[22px]! h-28!" />
    </div>
    <div v-else class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
      <div class="asa-card sc-metric">
        <div class="asa-tint asa-tint--teal">
          <Calendar class="w-5! h-5! fill-current" />
        </div>
        <div class="sc-metric__copy">
          <p class="sc-metric__value">{{ pn(activeDays) }}</p>
          <p class="sc-metric__label">{{ t('scheduling.metricDays') }}</p>
        </div>
      </div>

      <div class="asa-card sc-metric">
        <div class="asa-tint asa-tint--indigo">
          <Clock class="w-5! h-5! fill-current" />
        </div>
        <div class="sc-metric__copy">
          <p class="sc-metric__value">{{ pn(availability.length) }}</p>
          <p class="sc-metric__label">{{ t('scheduling.metricRanges') }}</p>
        </div>
      </div>

      <div class="asa-card sc-metric">
        <div class="asa-tint asa-tint--orange">
          <Activity class="w-5! h-5! stroke-current" />
        </div>
        <div class="sc-metric__copy">
          <p class="sc-metric__value">{{ weeklyHours }}</p>
          <p class="sc-metric__label">{{ t('scheduling.metricHours') }}</p>
        </div>
      </div>
    </div>

    <!-- ─── Weekly grid card ─── -->
    <div class="asa-card sc-card mt-5!">
      <div class="sc-card__head">
        <div class="sc-card__head-copy">
          <h2 class="asa-card-title">{{ t('scheduling.gridTitle') }}</h2>
          <p class="asa-card-sub">{{ t('scheduling.workingHours') }}</p>
        </div>
        <button class="asa-btn asa-btn--primary asa-btn--sm" @click="openAdd()">
          <v-icon size="14">mdi-plus</v-icon>
          <span>{{ t('scheduling.addNewRange') }}</span>
        </button>
      </div>

      <div v-if="loading" class="sc-skel">
        <div v-for="i in 8" :key="`sk-${i}`" class="sc-skel__row">
          <div class="asa-skel h-5! w-16! rounded-md!" />
          <div class="asa-skel h-5! flex-1! rounded-md!" />
        </div>
      </div>

      <template v-else>
        <div v-if="availability.length === 0" class="sc-empty">
          <div class="asa-tint asa-tint--indigo sc-empty__tint">
            <Calendar class="w-6! h-6! fill-current" />
          </div>
          <div>
            <p class="sc-empty__title">{{ t('scheduling.emptyTitle') }}</p>
            <p class="sc-empty__desc">{{ t('scheduling.emptyDesc') }}</p>
          </div>
        </div>

        <div class="sc-scroll">
          <table class="sc-table">
            <thead>
              <tr>
                <th class="sc-th sc-th--corner">
                  <span>{{ t('scheduling.hour') }}</span>
                </th>
                <th v-for="day in dayHeaders" :key="day.dayOfWeek" class="sc-th"
                  :class="{ 'sc-th--today': day.dayOfWeek === todayDow }">
                  <div class="sc-th__main">
                    <span class="sc-th__name">{{ day.name }}</span>
                    <button type="button" class="sc-th__add" :aria-label="t('scheduling.addNewRange')"
                      @click="openAdd(day.dayOfWeek)">
                      <v-icon size="12">mdi-plus</v-icon>
                    </button>
                  </div>
                  <div class="sc-th__date">{{ jalaliDates[day.dayOfWeek] }}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="time in timeSlots" :key="time" class="sc-tr">
                <td class="sc-td sc-td--time">{{ pn(time) }}</td>
                <td v-for="day in dayHeaders" :key="`${day.dayOfWeek}-${time}`" class="sc-td"
                  :class="cellCls(day.dayOfWeek, time)" @click="onCellClick(day.dayOfWeek, time)">
                  <div class="sc-cell"></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- Legend / hint footer -->
      <div class="sc-legend">
        <div class="sc-legend__item">
          <span class="sc-dot sc-dot--range" />
          <span>{{ t('scheduling.activeRange') }}</span>
        </div>
        <div class="sc-legend__item">
          <span class="sc-dot sc-dot--selecting" />
          <span>{{ t('scheduling.selecting') }}</span>
        </div>
        <div class="sc-legend__hint">{{ selectionHint }}</div>
      </div>
    </div>

    <!-- ─── Add time range dialog ─── -->
    <v-dialog v-model="addDialog" max-width="440" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('scheduling.addNewRange') }}</h2>
            <span class="asa-dialog__sub">{{ t('scheduling.workingHours') }}</span>
          </div>
          <button class="sc-x" aria-label="close" @click="addDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div class="sc-fields">
            <div class="sc-field">
              <span class="asa-field-label">{{ t('scheduling.day') }}</span>
              <v-select v-model="newRangeDay" :items="dayOptions" item-title="title" item-value="value"
                variant="solo" density="comfortable" hide-details="auto" />
            </div>
            <div class="sc-field sc-field--row">
              <div class="sc-field">
                <span class="asa-field-label">{{ t('scheduling.startTime') }}</span>
                <v-select v-model="newRangeStart" :items="timeSlots" variant="solo" density="comfortable"
                  hide-details="auto" />
              </div>
              <div class="sc-field">
                <span class="asa-field-label">{{ t('scheduling.endTime') }}</span>
                <v-select v-model="newRangeEnd" :items="timeSlotsEnd" variant="solo" density="comfortable"
                  hide-details="auto" />
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="addDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving" @click="submitNewRange">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-check</v-icon>
              <span>{{ t('common.save') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Edit time range dialog ─── -->
    <v-dialog v-model="editDialog" max-width="440" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('scheduling.editTitle') }}</h2>
            <span class="asa-dialog__sub">{{ editDayName }}</span>
          </div>
          <button class="sc-x" aria-label="close" @click="editDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div class="sc-fields">
            <div class="sc-field">
              <span class="asa-field-label">{{ t('scheduling.day') }}</span>
              <v-select v-model="editRangeDay" :items="dayOptions" item-title="title" item-value="value"
                variant="solo" density="comfortable" hide-details="auto" />
            </div>
            <div class="sc-field sc-field--row">
              <div class="sc-field">
                <span class="asa-field-label">{{ t('scheduling.startTime') }}</span>
                <v-select v-model="editRangeStart" :items="timeSlots" variant="solo" density="comfortable"
                  hide-details="auto" />
              </div>
              <div class="sc-field">
                <span class="asa-field-label">{{ t('scheduling.endTime') }}</span>
                <v-select v-model="editRangeEnd" :items="timeSlotsEnd" variant="solo" density="comfortable"
                  hide-details="auto" />
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--rose asa-btn--sm" :disabled="saving" @click="deleteDialog = true">
            <v-icon size="14">mdi-trash-can-outline</v-icon>
            <span>{{ t('common.delete') }}</span>
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="editDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="saving" @click="submitEditRange">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-check</v-icon>
              <span>{{ t('common.save') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Delete confirm dialog ─── -->
    <v-dialog v-model="deleteDialog" max-width="400" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('scheduling.deleteTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('scheduling.deleteConfirm') }}</span>
          </div>
          <button class="sc-x" aria-label="close" @click="deleteDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-actions class="asa-dialog__foot">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="deleteDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <v-spacer />
          <button class="asa-btn asa-btn--rose asa-btn--sm" :disabled="saving" @click="confirmDeleteRange">
            <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="14">mdi-trash-can-outline</v-icon>
              <span>{{ t('common.delete') }}</span>
            </template>
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
import Activity from '~/components/icons/Activity.vue'
import moment from 'moment-jalaali'

const { t, locale } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { user } = useAuth()
const { $toast } = useNuxtApp()

const bookingUrl = computed(() => `/booking/${user.value?.id}`)

const todayDow = new Date().getDay()

definePageMeta({})

const dayHeaders = computed(() => [
  { name: t('scheduling.days.saturday'), dayOfWeek: 6 },
  { name: t('scheduling.days.sunday'), dayOfWeek: 0 },
  { name: t('scheduling.days.monday'), dayOfWeek: 1 },
  { name: t('scheduling.days.tuesday'), dayOfWeek: 2 },
  { name: t('scheduling.days.wednesday'), dayOfWeek: 3 },
  { name: t('scheduling.days.thursday'), dayOfWeek: 4 },
  { name: t('scheduling.days.friday'), dayOfWeek: 5 },
])

const dayOptions = computed(() => dayHeaders.value.map(d => ({ title: d.name, value: d.dayOfWeek })))

const jalaliDates = computed(() => {
  const today = new Date()
  const todayDay = today.getDay()
  const daysSinceSaturday = (todayDay + 1) % 7
  const saturday = new Date(today)
  saturday.setDate(today.getDate() - daysSinceSaturday)
  const result: Record<number, string> = {}
  dayHeaders.value.forEach((day, index) => {
    const d = new Date(saturday)
    d.setDate(saturday.getDate() + index)
    const m = moment(d)
    const label = m.format('jD jMMMM')
    result[day.dayOfWeek] = locale.value === 'fa' ? pn(label) : label
  })
  return result
})

const timeSlots = computed(() => {
  const slots: string[] = []
  for (let h = 7; h < 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})

const timeSlotsEnd = computed(() => {
  const slots: string[] = []
  for (let h = 7; h <= 22; h++) {
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const availability = ref<Availability[]>([])
const loading = ref(false)
const saving = ref(false)
const loaded = ref(false)

const rangeStart = ref<{ day: number; time: string } | null>(null)

const addDialog = ref(false)
const editDialog = ref(false)
const deleteDialog = ref(false)

const newRangeDay = ref(0)
const newRangeStart = ref<string | null>(null)
const newRangeEnd = ref<string | null>(null)

const editingAvailability = ref<Availability | null>(null)
const editRangeDay = ref(0)
const editRangeStart = ref<string | null>(null)
const editRangeEnd = ref<string | null>(null)

const editDayName = computed(() => {
  const day = dayHeaders.value.find(d => d.dayOfWeek === editRangeDay.value)
  return day?.name || ''
})

const activeDays = computed(() => {
  const days = new Set(availability.value.map(a => a.dayOfWeek))
  return days.size
})

const weeklyHours = computed(() => {
  const totalMinutes = availability.value.reduce((sum, a) => {
    return sum + Math.max(0, timeToMinutes(a.endTime) - timeToMinutes(a.startTime))
  }, 0)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const label = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  return locale.value === 'fa' ? pn(label) : label
})

const selectionHint = computed(() => {
  if (!rangeStart.value) return t('scheduling.clickInstruction')
  const day = dayHeaders.value.find(d => d.dayOfWeek === rangeStart.value?.day)
  const time = locale.value === 'fa' ? pn(rangeStart.value.time) : rangeStart.value.time
  return `${t('scheduling.selecting')} · ${day?.name || ''} ${time}`
})

function openAdd(dayOfWeek?: number) {
  newRangeDay.value = dayOfWeek ?? todayDow
  newRangeStart.value = null
  newRangeEnd.value = null
  addDialog.value = true
}

function openEdit(times: Availability) {
  editingAvailability.value = times
  editRangeDay.value = times.dayOfWeek
  editRangeStart.value = times.startTime
  editRangeEnd.value = times.endTime
  deleteDialog.value = false
  editDialog.value = true
}

async function submitNewRange() {
  if (!newRangeStart.value || !newRangeEnd.value) {
    $toast.error(t('scheduling.selectTimeError'))
    return
  }
  if (newRangeStart.value >= newRangeEnd.value) {
    $toast.error(t('scheduling.timeOrderError'))
    return
  }
  saving.value = true
  try {
    await apiFetch('/api/scheduling/availability', {
      method: 'POST',
      body: {
        dayOfWeek: newRangeDay.value,
        startTime: newRangeStart.value,
        endTime: newRangeEnd.value,
      },
    })
    $toast.success(t('scheduling.rangeAdded'))
    addDialog.value = false
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || t('scheduling.rangeSaveError'))
  } finally {
    saving.value = false
  }
}

async function submitEditRange() {
  if (!editRangeStart.value || !editRangeEnd.value) {
    $toast.error(t('scheduling.selectTimeError'))
    return
  }
  if (editRangeStart.value >= editRangeEnd.value) {
    $toast.error(t('scheduling.timeOrderError'))
    return
  }
  if (!editingAvailability.value) return
  saving.value = true
  try {
    await apiFetch(`/api/scheduling/availability/${editingAvailability.value.id}`, {
      method: 'PUT',
      body: {
        dayOfWeek: editRangeDay.value,
        startTime: editRangeStart.value,
        endTime: editRangeEnd.value,
      },
    })
    $toast.success(t('scheduling.rangeUpdated'))
    editDialog.value = false
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || t('scheduling.rangeUpdateError'))
  } finally {
    saving.value = false
  }
}

async function confirmDeleteRange() {
  if (!editingAvailability.value) return
  saving.value = true
  try {
    await apiFetch(`/api/scheduling/availability/${editingAvailability.value.id}`, { method: 'DELETE' })
    $toast.success(t('scheduling.rangeDeleted'))
    deleteDialog.value = false
    editDialog.value = false
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || t('scheduling.rangeDeleteError'))
  } finally {
    saving.value = false
  }
}

function cellCls(dayOfWeek: number, time: string): string {
  if (isInRange(dayOfWeek, time)) return 'sc-td--range'
  if (rangeStart.value?.day === dayOfWeek && rangeStart.value?.time === time) return 'sc-td--anchor'
  if (rangeStart.value?.day === dayOfWeek) return 'sc-td--selday'
  return ''
}

function isInRange(dayOfWeek: number, time: string): boolean {
  return availability.value.some(a => {
    if (a.dayOfWeek !== dayOfWeek) return false
    const startMinutes = timeToMinutes(a.startTime)
    const endMinutes = timeToMinutes(a.endTime)
    const currentMinutes = timeToMinutes(time)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  })
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function findAvailabilityAt(dayOfWeek: number, time: string): Availability | null {
  const currentMinutes = timeToMinutes(time)
  return availability.value.find(a => {
    if (a.dayOfWeek !== dayOfWeek) return false
    const startMinutes = timeToMinutes(a.startTime)
    const endMinutes = timeToMinutes(a.endTime)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }) || null
}

async function onCellClick(dayOfWeek: number, time: string) {
  const existingBlock = findAvailabilityAt(dayOfWeek, time)

  if (existingBlock) {
    openEdit(existingBlock)
    return
  }

  if (!rangeStart.value) {
    rangeStart.value = { day: dayOfWeek, time }
    return
  }

  if (rangeStart.value.day !== dayOfWeek) {
    rangeStart.value = { day: dayOfWeek, time }
    return
  }

  if (rangeStart.value.time === time) {
    rangeStart.value = null
    return
  }

  const startTime = rangeStart.value.time < time ? rangeStart.value.time : time
  const endTime = rangeStart.value.time < time ? time : rangeStart.value.time

  rangeStart.value = null

  saving.value = true
  try {
    await apiFetch('/api/scheduling/availability', {
      method: 'POST',
      body: { dayOfWeek, startTime, endTime },
    })
    $toast.success(t('scheduling.rangeAdded'))
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || t('scheduling.rangeSaveError'))
  } finally {
    saving.value = false
  }
}

async function fetchAvailability() {
  const doctorId = user.value?.id
  if (!doctorId) return
  loading.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/availability/${doctorId}`)
    if (res.success) {
      availability.value = res.data
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
    loaded.value = true
  }
}

function refreshAll() {
  fetchAvailability()
}

onMounted(() => {
  fetchAvailability()
})

useSeoMeta({
  title: t('scheduling.titleSeo'),
})
</script>

<style scoped>
/* ── Header refresh spinner ────────────────────── */
.sc-spin {
  animation: sc-spin 800ms linear infinite;
}

@keyframes sc-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Metric cards ──────────────────────────────── */
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

/* ── Grid card ─────────────────────────────────── */
.sc-card {
  padding: 0;
  /* overflow: hidden; */
  z-index: 5;
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

/* Loading skeleton rows */
.sc-skel {
  padding: 0.875rem 1.5rem;
}

.sc-skel__row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.sc-skel__row+.sc-skel__row {
  border-top: 1px solid var(--asa-sep);
}

/* Empty state */
.sc-empty {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2.25rem 1.5rem;
  border-bottom: 1px solid var(--asa-sep);
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

/* ── Grid table ────────────────────────────────── */
.sc-scroll {
  overflow-x: auto;
}

.sc-table {
  width: 100%;
  min-width: 60rem;
  border-collapse: separate;
  border-spacing: 0;
}

.sc-th {
  padding: 0.875rem 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
  background: var(--asa-bg-card);
}

.sc-th__main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.sc-th__name {
  color: var(--asa-label);
}

.sc-th--today .sc-th__name {
  color: var(--asa-accent-deep);
}

.dark .sc-th--today .sc-th__name {
  color: var(--asa-accent);
}

.sc-th__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border: none;
  border-radius: 9999px;
  background: var(--asa-track);
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    transform 120ms var(--ease-default);
}

.sc-th__add:hover {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .sc-th__add:hover {
  color: var(--asa-accent);
}

.sc-th__add:active {
  transform: scale(0.9);
}

.sc-th__date {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 400;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}

.sc-td {
  position: relative;
  padding: 0;
  height: 2.125rem;
  cursor: pointer;
  border-bottom: 1px solid color-mix(in srgb, var(--asa-sep) 55%, transparent);
}

.sc-td--time {
  position: sticky;
  inset-inline-start: 0;
  z-index: 2;
  min-width: 3.75rem;
  padding: 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 500;
  text-align: center;
  color: var(--asa-label-2);
  background: var(--asa-bg-card);
  font-variant-numeric: tabular-nums;
  cursor: default;
}

.sc-cell {
  position: absolute;
  inset: 0.1875rem;
  border-radius: 0.625rem;
  transition: background-color 120ms var(--ease-default), box-shadow 120ms var(--ease-default);
}

.sc-td:hover:not(.sc-td--range):not(.sc-td--anchor):not(.sc-td--selday) .sc-cell {
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .sc-td:hover:not(.sc-td--range):not(.sc-td--anchor):not(.sc-td--selday) .sc-cell {
  background: rgba(255, 255, 255, 0.05);
}

.sc-td--range .sc-cell {
  background: var(--asa-accent-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--asa-accent) 28%, transparent);
}

.sc-td--anchor .sc-cell {
  background: var(--asa-amber-soft);
  box-shadow: inset 0 0 0 1.5px var(--asa-amber);
}

.sc-td--selday .sc-cell {
  background: color-mix(in srgb, var(--asa-amber-soft) 55%, transparent);
}

/* ── Legend / hint footer ──────────────────────── */
.sc-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  padding: 0.875rem 1.5rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 2.5%, transparent);
}

.sc-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.4375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.sc-dot {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.375rem;
  flex-shrink: 0;
}

.sc-dot--range {
  background: var(--asa-accent-soft);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--asa-accent) 28%, transparent);
}

.sc-dot--selecting {
  background: var(--asa-amber-soft);
  box-shadow: inset 0 0 0 1.5px var(--asa-amber);
}

.sc-legend__hint {
  margin-inline-start: auto;
  font-size: 0.75rem;
  color: var(--asa-label-3);
}

/* ── Dialog helpers ────────────────────────────── */
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

.sc-field--row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 479px) {
  .sc-field--row {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sc-spin {
    animation: none;
  }
}
</style>