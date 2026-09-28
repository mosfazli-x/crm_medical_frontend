<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('calendar.title') }}</h1>
        <p class="dash-head__date">{{ todayLong }}</p>
      </div>
      <div class="dash-head__actions">
        <button type="button" class="cal-x" :disabled="calendarLoading" :aria-label="t('calendar.title')" @click="refreshCalendar">
          <v-icon :size="18" :class="{ 'animate-spin!': calendarLoading }">mdi-refresh</v-icon>
        </button>
        <button type="button" class="asa-btn asa-btn--primary" @click="openCreateDialog">
          <v-icon size="16">mdi-calendar-plus</v-icon>
          <span class="hidden sm:inline!">{{ t('calendar.newVisit') }}</span>
        </button>
      </div>
    </header>

    <!-- ─── Metrics ─── -->
    <div class="cal-metrics">
      <article class="asa-card cal-metric">
        <span class="asa-tint asa-tint--teal"><v-icon size="20">mdi-calendar-today</v-icon></span>
        <div class="cal-metric__copy">
          <p class="cal-metric__value">{{ pn(todayCount) }}</p>
          <p class="cal-metric__label">{{ t('calendar.todayVisits') }}</p>
        </div>
      </article>
      <article class="asa-card cal-metric" style="animation-delay: 80ms">
        <span class="asa-tint asa-tint--indigo"><v-icon size="20">mdi-calendar-week</v-icon></span>
        <div class="cal-metric__copy">
          <p class="cal-metric__value">{{ pn(weekCount) }}</p>
          <p class="cal-metric__label">{{ t('calendar.nextDays') }}</p>
        </div>
      </article>
      <article class="asa-card cal-metric" style="animation-delay: 160ms">
        <span class="asa-tint asa-tint--green"><v-icon size="20">mdi-calendar-clock</v-icon></span>
        <div class="cal-metric__copy">
          <p class="cal-metric__value cal-metric__value--md">{{ nextVisitLabel }}</p>
          <p class="cal-metric__label">{{ t('calendar.nextVisit') }}</p>
        </div>
      </article>
    </div>

    <!-- ─── Calendar card ─── -->
    <div class="asa-card cal-card">
      <div class="cal-toolbar">
        <div class="cal-nav">
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm cal-nav__ic" aria-label="previous" @click="calendarNav('prev')">
            <v-icon size="16">{{ isFa ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
          </button>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="calendarNav('today')">
            {{ t('calendar.buttonText.today') }}
          </button>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm cal-nav__ic" aria-label="next" @click="calendarNav('next')">
            <v-icon size="16">{{ isFa ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
          </button>
        </div>

        <div class="cal-range">
          <p class="cal-range__primary">{{ rangeTitle }}</p>
          <p class="cal-range__secondary" dir="ltr">{{ rangeTitleGreg }}</p>
        </div>

        <div class="asa-seg" role="tablist" :aria-label="t('calendar.title')">
          <button type="button" class="asa-seg__btn" :class="{ 'asa-seg__btn--on': viewType === 'timeGridWeek' }" @click="setView('timeGridWeek')">{{ t('calendar.buttonText.week') }}</button>
          <button type="button" class="asa-seg__btn" :class="{ 'asa-seg__btn--on': viewType === 'dayGridMonth' }" @click="setView('dayGridMonth')">{{ t('calendar.buttonText.month') }}</button>
          <button type="button" class="asa-seg__btn" :class="{ 'asa-seg__btn--on': viewType === 'timeGridDay' }" @click="setView('timeGridDay')">{{ t('calendar.buttonText.day') }}</button>
        </div>
      </div>

      <div v-if="!eventsLoadedOnce" class="cal-skel">
        <div class="asa-skel" style="height: 3.25rem; border-radius: 0.75rem" />
        <div class="asa-skel" style="height: 26rem; border-radius: 0.75rem" />
      </div>
      <FullCalendar v-else ref="calendarRef" :options="calendarOptions" />

      <div class="cal-legend">
        <p class="cal-legend__label">{{ t('calendar.legendTitle') }}</p>
        <div class="cal-legend__items">
          <span v-for="item in legend" :key="item.label" class="cal-legend__item">
            <i class="cal-legend__dot" :style="{ backgroundColor: item.color }" />
            <span>{{ item.label }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- ─── Visit dialog ─── -->
    <v-dialog v-model="visitDialog" persistent scrollable :fullscreen="isMobile" transition="dialog-bottom-transition" max-width="640px">
      <v-card class="asa-dialog">
        <div class="asa-dialog__head">
          <div class="min-w-0!">
            <h2 class="asa-dialog__title">{{ isEditMode ? t('calendar.editVisit') : t('calendar.newVisit') }}</h2>
            <span class="asa-dialog__sub">{{ dialogSubtitle }}</span>
          </div>
          <button type="button" class="cal-x" aria-label="close" @click="closeVisitDialog">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="pf-stack">
            <div class="pf-field">
              <span class="asa-field-label">{{ t('calendar.patient') }} <span class="text-red-500!">{{ t('calendar.required') }}</span></span>
              <v-autocomplete v-model="newVisit.patientId" :items="patients" item-title="fullName" item-value="id"
                :placeholder="t('calendar.searchPatient')" variant="solo" density="comfortable"
                prepend-inner-icon="mdi-account-search-outline" clearable hide-details="auto" :loading="patientsLoading">
                <template #no-data>
                  <div class="pa-4 text-center text-sm" style="color: var(--asa-label-2)">
                    {{ patientsLoading ? t('calendar.searching') : t('calendar.noPatientFound') }}
                  </div>
                </template>
              </v-autocomplete>
            </div>

            <div class="cal-grid2">
              <div class="pf-field">
                <span class="asa-field-label">{{ t('calendar.startTime') }} <span class="text-red-500!">{{ t('calendar.required') }}</span></span>
                <PersianDatetimePicker v-model="newVisit.start" type="datetime" display-format="jYYYY/jMM/jDD - HH:mm"
                  format="YYYY-MM-DD HH:mm:ss" color="#00ADB5" auto-submit custom-input class="w-full" />
              </div>

              <div class="pf-field">
                <span class="asa-field-label">{{ t('calendar.endTime') }}</span>
                <PersianDatetimePicker v-model="newVisit.end" type="datetime" display-format="jYYYY/jMM/jDD - HH:mm"
                  format="YYYY-MM-DD HH:mm:ss" color="#00ADB5" auto-submit custom-input class="w-full" />
              </div>

              <div class="pf-field">
                <span class="asa-field-label">{{ t('calendar.visitType') }}</span>
                <v-select v-model="newVisit.type" :items="visitTypes" variant="solo" density="comfortable" hide-details="auto" />
              </div>

              <div class="pf-field">
                <span class="asa-field-label">{{ t('common.status') }}</span>
                <v-select v-model="newVisit.status" :items="statusOptions" variant="solo" density="comfortable" hide-details="auto" />
              </div>
            </div>

            <div class="pf-field">
              <span class="asa-field-label">{{ t('calendar.doctorNotes') }}</span>
              <v-textarea v-model="newVisit.notes" :placeholder="t('calendar.notesPlaceholder')" variant="solo"
                density="comfortable" rows="3" hide-details="auto" append-inner-icon="mdi-draw-pen"
                @click:append-inner="openVisitNotesHw(t('calendar.doctorNotes'), (text) => (newVisit.notes = text))" />
            </div>

            <!-- ── Follow-up / return visit ── -->
            <div class="fu-section">
              <div class="fu-section__head">
                <v-icon size="18" color="#00ADB5">mdi-calendar-sync</v-icon>
                <span class="asa-field-label mb-0!">{{ t('followups.returnVisit') }}</span>
                <v-spacer />
                <v-btn size="small" variant="text" color="#00ADB5" class="text-none!"
                  :prepend-icon="newVisit.nextVisitDate ? 'mdi-close' : 'mdi-plus'"
                  @click="toggleReturnVisit">
                  {{ newVisit.nextVisitDate ? t('followups.remove') : t('followups.add') }}
                </v-btn>
              </div>

              <p v-if="!newVisit.nextVisitDate" class="fu-section__hint">
                {{ t('followups.returnVisitHint') }}
              </p>

              <div v-else class="cal-grid2">
                <div class="pf-field">
                  <span class="asa-field-label">{{ t('followups.nextVisitDate') }}</span>
                  <PersianDatetimePicker v-model="newVisit.nextVisitDate" type="date"
                    display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#00ADB5" auto-submit
                    custom-input class="w-full" clearable />
                </div>

                <div class="pf-field">
                  <span class="asa-field-label">{{ t('followups.remindDaysBefore') }}</span>
                  <v-text-field v-model.number="newVisit.reminderDaysBefore" type="number" min="0" max="90"
                    variant="solo" density="comfortable" hide-details="auto" :suffix="t('followups.daysUnit')"
                    :placeholder="t('followups.useClinicDefault', { days: defaultReminderDays })"
                    clearable @update:model-value="onReminderDaysInput" />
                </div>
              </div>

              <p
                v-if="newVisit.nextVisitDate && newVisit.reminderDaysBefore == null"
                class="fu-section__hint">
                {{ t('followups.usingClinicDefault', { days: defaultReminderDays }) }}
              </p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <div class="d-flex flex-column-reverse! md:flex-row! gap-2! w-full!">
            <button v-if="isEditMode" type="button" class="asa-btn asa-btn--rose" @click="openDeleteDialog">
              <v-icon size="16">mdi-trash-can-outline</v-icon>
              {{ t('calendar.deleteVisit') }}
            </button>
            <div class="flex-1! hidden! md:block!" />
            <button type="button" class="asa-btn asa-btn--ghost" @click="closeVisitDialog">{{ t('common.cancel') }}</button>
            <button type="button" class="asa-btn asa-btn--primary" :disabled="saving" @click="saveVisit">
              <v-progress-circular v-if="saving" indeterminate size="16" width="2" color="#ffffff" />
              <template v-else>{{ isEditMode ? t('calendar.saveChanges') : t('calendar.registerVisit') }}</template>
            </button>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Delete confirm dialog ─── -->
    <v-dialog v-model="deleteDialog" persistent max-width="420px" transition="dialog-top-transition">
      <v-card class="asa-dialog">
        <div class="asa-dialog__head">
          <div class="min-w-0!">
            <h2 class="asa-dialog__title">{{ t('calendar.deleteVisit') }}</h2>
          </div>
          <button type="button" class="cal-x" aria-label="close" @click="deleteDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div class="d-flex align-center! gap-3!">
            <span class="asa-tint asa-tint--rose asa-tint--sm"><v-icon size="18">mdi-alert-octagon-outline</v-icon></span>
            <p class="text-sm!" style="color: var(--asa-label)">{{ t('calendar.confirmDeleteVisit') }}</p>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <div class="d-flex gap-2! w-full! justify-end!">
            <button type="button" class="asa-btn asa-btn--ghost" @click="deleteDialog = false">{{ t('common.cancel') }}</button>
            <button type="button" class="asa-btn asa-btn--rose" :disabled="deleting" @click="confirmDeleteVisit">
              <v-progress-circular v-if="deleting" indeterminate size="16" width="2" color="#ffffff" />
              <template v-else>{{ t('calendar.deleteVisit') }}</template>
            </button>
          </div>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
  <HandwritingDialog v-model="visitNotesHwOpen" :label="visitNotesHwLabel" @insert="applyVisitNotesHw" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import faLocale from '@fullcalendar/core/locales/fa'
import enGbLocale from '@fullcalendar/core/locales/en-gb'
import moment from 'moment-jalaali'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const { t, tm, locale } = useI18n()
const { pn } = useLang()
const { formatJalaliLong } = useFormatting()

const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const isMobile = ref(false)

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const isFa = computed(() => locale.value === 'fa')
const todayLong = computed(() => formatJalaliLong(new Date()))

function resolveMsg(v: any): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object') {
    if (typeof v.source === 'string') return v.source
    if (v.body && typeof v.body.static === 'string') return v.body.static
    if (typeof v.value !== 'undefined') return String(v.value)
    return JSON.stringify(v)
  }
  return String(v)
}

function resolveMsgList(key: string): string[] {
  const raw = tm(key) as unknown
  if (Array.isArray(raw)) return raw.map(resolveMsg)
  if (raw && typeof raw === 'object') return Object.values(raw).map(resolveMsg)
  return []
}

// ── Visit form state ─────────────────────────────
/** The subset of a FullCalendar event the edit dialog reads. */
interface CalendarEventLike {
  id: string
  startStr?: string | null
  endStr?: string | null
  start?: string | null
  end?: string | null
  extendedProps?: {
    patientId?: string | null
    type?: string | null
    notes?: string | null
    nextVisitDate?: string | null
    reminderDaysBefore?: number | null
  }
}

/** Payload returned by `GET /api/visits/:id`. */
interface VisitDetail {
  id: string
  patientId: string
  visitDate: string
  visitType?: string | null
  status?: string | null
  notes?: string | null
  durationMinutes?: number | null
  nextVisitDate?: string | null
  reminderDaysBefore?: number | null
  reminderSentAt?: string | null
}

const patients = ref<any[]>([])
const patientsLoading = ref(false)
const visitDialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const isEditMode = ref(false)
const currentVisitId = ref<string | null>(null)
/** Snapshot of the follow-up fields on open, so edit only sends real changes. */
const editOriginal = ref<{ nextVisitDate: string; reminderDaysBefore: number | null }>({
  nextVisitDate: '',
  reminderDaysBefore: null,
})

const visitTypes = computed(() => resolveMsgList('calendar.visitTypes'))
const statusOptions = computed(() => resolveMsgList('calendar.statusOptions'))

const newVisit = ref<{
  start: string
  end: string
  patientId: string | null
  type: string
  status: string
  notes: string
  nextVisitDate: string
  reminderDaysBefore: number | null
}>(emptyVisit())

function emptyVisit() {
  return {
    start: '',
    end: '',
    patientId: null as string | null,
    type: '',
    status: '',
    notes: '',
    nextVisitDate: '',
    reminderDaysBefore: null as number | null,
  }
}

// Clinic-wide reminder lead time, shown as the placeholder/override baseline.
const defaultReminderDays = ref(3)
const followUpReminderDaysLoaded = ref(false)

const loadDefaultReminderDays = async () => {
  if (followUpReminderDaysLoaded.value) return
  try {
    const { data } = await useFollowUps().getSummary()
    if (typeof data?.defaultReminderDays === 'number') {
      defaultReminderDays.value = data.defaultReminderDays
    }
  } catch {
    // Non-fatal: the field simply falls back to the built-in default.
  } finally {
    followUpReminderDaysLoaded.value = true
  }
}

function toggleReturnVisit() {
  if (newVisit.value.nextVisitDate) {
    newVisit.value.nextVisitDate = ''
    newVisit.value.reminderDaysBefore = null
  } else {
    newVisit.value.nextVisitDate = moment().add(1, 'month').format('YYYY-MM-DD')
  }
}

/** Empty input means "use the clinic default", which the API models as null. */
function onReminderDaysInput(value: unknown) {
  const parsed = Number(value)
  newVisit.value.reminderDaysBefore =
    value === '' || value === null || value === undefined || Number.isNaN(parsed)
      ? null
      : parsed
}

// ── Calendar state ───────────────────────────────
const viewType = ref('timeGridWeek')
const calendarLoading = ref(false)
const eventsLoadedOnce = ref(false)
const loadedEvents = ref<any[]>([])
const gridStart = ref<Date | null>(null)
const gridEnd = ref<Date | null>(null)

// ── Metrics ──────────────────────────────────────
const todayCount = computed(() => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 86_400_000)
  return loadedEvents.value.filter((e) => {
    const d = new Date(e.start)
    return d >= start && d < end
  }).length
})

const weekCount = computed(() => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start.getTime() + 7 * 86_400_000)
  return loadedEvents.value.filter((e) => {
    const d = new Date(e.start)
    return d >= start && d < end
  }).length
})

const nextVisitLabel = computed(() => {
  const now = new Date()
  const next = loadedEvents.value
    .map((e) => ({ d: new Date(e.start), ev: e }))
    .filter((x) => x.d >= now)
    .sort((a, b) => a.d.getTime() - b.d.getTime())[0]
  if (!next) return t('calendar.noVisits')
  const m = moment(next.d)
  return `${pn(m.format('jMM/jDD'))} · ${pn(m.format('HH:mm'))}`
})

// ── Range title (Jalali primary + Gregorian detail) ──
const rangeTitle = computed(() => {
  if (!gridStart.value || !gridEnd.value) return ''
  const s = moment(gridStart.value)
  const e = moment(gridEnd.value)
  const same = s.format('jYYYY/jMM/jDD') === e.format('jYYYY/jMM/jDD')
  const raw = same ? s.format('jYYYY/jMM/jDD') : `${s.format('jYYYY/jMM/jDD')} — ${e.format('jYYYY/jMM/jDD')}`
  return pn(raw)
})

const rangeTitleGreg = computed(() => {
  if (!gridStart.value || !gridEnd.value) return ''
  const s = moment(gridStart.value)
  const e = moment(gridEnd.value)
  const same = s.format('YYYY/MM/DD') === e.format('YYYY/MM/DD')
  return same ? s.format('YYYY/MM/DD') : `${s.format('YYYY/MM/DD')} — ${e.format('YYYY/MM/DD')}`
})

const dialogSubtitle = computed(() => {
  const raw = newVisit.value.start || ''
  if (!raw) return ''
  const m = moment(raw.replace(' ', 'T'))
  if (!m.isValid()) return ''
  const date = isFa.value ? m.format('jDD jMMMM jYYYY') : m.format('jYYYY/jMM/jDD')
  return `${pn(date)} · ${pn(m.format('HH:mm'))}`
})

// ── Legend (mirrors the backend visit-type colors) ──
const visitTypeColors = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ef4444']

const legend = computed(() =>
  visitTypes.value.map((label, i) => ({ label, color: visitTypeColors[i] || '#6366f1' }))
)

// ── Handwriting dialog ───────────────────────────
const visitNotesHwOpen = ref(false)
const visitNotesHwLabel = ref('')
const visitNotesHwCallback = ref<((text: string) => void) | null>(null)

function openVisitNotesHw(label: string, callback: (text: string) => void) {
  visitNotesHwLabel.value = label
  visitNotesHwCallback.value = callback
  visitNotesHwOpen.value = true
}

function applyVisitNotesHw(text: string) {
  visitNotesHwCallback.value?.(text)
}

// ── Navigation & views ───────────────────────────
function calendarNav(action: 'prev' | 'today' | 'next') {
  const api = calendarRef.value?.getApi()
  if (!api) return
  if (action === 'prev') api.prev()
  else if (action === 'next') api.next()
  else api.today()
}

function setView(v: string) {
  viewType.value = v
  calendarRef.value?.getApi()?.changeView(v)
}

function refreshCalendar() {
  if (calendarLoading.value) return
  loadEvents()
  calendarRef.value?.getApi()?.refetchEvents()
}

async function loadEvents() {
  try {
    const events = await apiFetch('/api/visits')
    loadedEvents.value = events || []
    eventsLoadedOnce.value = true
  } catch (err) {
    eventsLoadedOnce.value = true
    $toast.error(t('calendar.calendarLoadError'))
  }
}

function handleResize() {
  const mobile = window.innerWidth < 768
  const wasMobile = isMobile.value
  isMobile.value = mobile
  const api = calendarRef.value?.getApi()
  if (!api) return
  if (mobile && !wasMobile && viewType.value === 'timeGridWeek') {
    viewType.value = 'timeGridDay'
    api.changeView('timeGridDay')
  } else if (!mobile && wasMobile && viewType.value === 'timeGridDay') {
    viewType.value = 'timeGridWeek'
    api.changeView('timeGridWeek')
  }
}

watch(eventsLoadedOnce, (v) => {
  if (v) handleResize()
})

// ── Dialog helpers ───────────────────────────────
const closeVisitDialog = () => {
  visitDialog.value = false
  isEditMode.value = false
  currentVisitId.value = null
  newVisit.value = emptyVisit()
}

function openCreateDialog() {
  newVisit.value = {
    ...emptyVisit(),
    start: moment().format('YYYY-MM-DD HH:mm'),
    type: visitTypes.value[0],
    status: statusOptions.value[0],
  }
  editOriginal.value = { nextVisitDate: '', reminderDaysBefore: null }
  isEditMode.value = false
  currentVisitId.value = null
  visitDialog.value = true
  loadDefaultReminderDays()
}

function openDeleteDialog() {
  deleteDialog.value = true
}

const fetchPatients = async () => {
  patientsLoading.value = true
  try {
    const response = await apiFetch('/api/visits/patients')
    if (response.success) {
      patients.value = response.data
    }
  } catch (err) {
    $toast.error(t('calendar.fetchPatientsError'))
  } finally {
    patientsLoading.value = false
  }
}

const saveVisit = async () => {
  if (!newVisit.value.patientId || !newVisit.value.start) {
    $toast.error(t('calendar.selectPatientError'))
    return
  }

  saving.value = true
  try {
    const startISO = new Date(newVisit.value.start.replace(' ', 'T') + ':00').toISOString()
    let durationMinutes = 30

    if (newVisit.value.end) {
      const endISO = new Date(newVisit.value.end.replace(' ', 'T') + ':00').toISOString()
      durationMinutes = Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000)
    }

    const payload = {
      patientId: newVisit.value.patientId,
      visitDate: startISO,
      visitType: newVisit.value.type,
      reason: null,
      notes: newVisit.value.notes || null,
      durationMinutes: durationMinutes > 0 ? durationMinutes : 30,
      // `null` clears the follow-up; omitted on edit so an untouched date is
      // never silently reset.
      ...(isEditMode.value
        ? {}
        : {
            nextVisitDate: newVisit.value.nextVisitDate || null,
            reminderDaysBefore: newVisit.value.reminderDaysBefore,
          }),
    }

    if (isEditMode.value) {
      const changed =
        newVisit.value.nextVisitDate !== editOriginal.value.nextVisitDate ||
        newVisit.value.reminderDaysBefore !== editOriginal.value.reminderDaysBefore
      if (changed) {
        payload.nextVisitDate = newVisit.value.nextVisitDate || null
        payload.reminderDaysBefore = newVisit.value.reminderDaysBefore
      }
    }

    const endpoint = isEditMode.value && currentVisitId.value ? `/api/visits/${currentVisitId.value}` : '/api/visits'
    const method = isEditMode.value && currentVisitId.value ? 'PUT' : 'POST'

    const response = await apiFetch(endpoint, { method, body: payload })

    if (response.success) {
      $toast.success(isEditMode.value ? t('calendar.visitSaved') : t('calendar.visitCreated'))
      closeVisitDialog()
      await loadEvents()
      calendarRef.value?.getApi()?.refetchEvents()
    } else {
      $toast.error(response.error || t('calendar.saveError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('calendar.serverError'))
  } finally {
    saving.value = false
  }
}

const confirmDeleteVisit = async () => {
  if (!currentVisitId.value) return
  deleting.value = true
  try {
    const response = await apiFetch(`/api/visits/${currentVisitId.value}`, { method: 'DELETE' })
    if (response.success) {
      $toast.success(t('calendar.visitDeleted'))
      deleteDialog.value = false
      closeVisitDialog()
      await loadEvents()
      calendarRef.value?.getApi()?.refetchEvents()
    } else {
      $toast.error(response.error || t('calendar.deleteError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('calendar.serverError'))
  } finally {
    deleting.value = false
  }
}

// ── Local event patching so metrics stay in sync ──
function patchLoadedEvent(id: string, patch: (e: any) => any) {
  loadedEvents.value = loadedEvents.value.map((e) => (e.id === id ? { ...patch(e) } : e))
}

// ── FullCalendar ─────────────────────────────────
const fcLocale = computed(() => {
  const months = resolveMsgList('calendar.month')
  const wdRaw = tm('calendar.weekday') as unknown as Record<string, unknown>
  const wd = Object.fromEntries(
    Object.entries(wdRaw ?? {}).map(([k, v]) => [k, resolveMsg(v)])
  ) as Record<string, string>
  return {
    ...faLocale,
    monthNames: months,
    monthNamesShort: months,
    dayNames: ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
    dayNamesShort: [wd.sun, wd.mon, wd.tue, wd.wed, wd.thu, wd.fri, wd.sat],
  }
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: viewType.value,
  headerToolbar: false,
  height: 'auto',
  locale: isFa.value ? fcLocale.value : enGbLocale,
  direction: isFa.value ? 'rtl' : 'ltr',
  firstDay: isFa.value ? 6 : 1,
  nowIndicator: true,
  editable: true,
  selectable: true,
  selectMirror: true,
  slotMinTime: '07:00:00',
  slotMaxTime: '22:00:00',
  slotDuration: '00:30:00',
  allDaySlot: false,
  expandRows: true,
  dayMaxEvents: 3,
  dayHeaderFormat: { weekday: 'short' },
  slotLabelFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
  eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },

  datesSet: (info: any) => {
    gridStart.value = info.start
    gridEnd.value = new Date(info.end.getTime() - 1)
  },

  loading: (isLoading: boolean) => {
    calendarLoading.value = isLoading
    if (!isLoading) eventsLoadedOnce.value = true
  },

  events: (fetchInfo: any, successCallback: Function) => {
    successCallback(loadedEvents.value)
  },

  eventDrop: async (info: any) => {
    try {
      await apiFetch(`/api/visits/${info.event.id}`, {
        method: 'PUT',
        body: { visitDate: info.event.start.toISOString() },
      })
      $toast.success(t('calendar.timeChanged'))
      const dur = new Date(info.oldEvent.end).getTime() - new Date(info.oldEvent.start).getTime()
      patchLoadedEvent(info.event.id, (e) => ({
        ...e,
        start: info.event.start.toISOString(),
        end: new Date(info.event.start.getTime() + dur).toISOString(),
      }))
    } catch {
      info.revert()
      $toast.error(t('calendar.timeChangeError'))
    }
  },

  eventResize: async (info: any) => {
    try {
      const diffMins = Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60000)
      await apiFetch(`/api/visits/${info.event.id}`, {
        method: 'PUT',
        body: {
          visitDate: info.event.start.toISOString(),
          durationMinutes: diffMins,
        },
      })
      $toast.success(t('calendar.durationChanged'))
      patchLoadedEvent(info.event.id, (e) => ({
        ...e,
        start: info.event.start.toISOString(),
        end: info.event.end.toISOString(),
      }))
    } catch {
      info.revert()
      $toast.error(t('calendar.timeChangeError'))
    }
  },

  select: (info: any) => {
    calendarRef.value?.getApi()?.unselect()
    newVisit.value = {
      ...emptyVisit(),
      start: info.startStr.slice(0, 16).replace('T', ' '),
      end: info.endStr ? info.endStr.slice(0, 16).replace('T', ' ') : '',
      type: visitTypes.value[0],
      status: statusOptions.value[0],
    }
    isEditMode.value = false
    currentVisitId.value = null
    visitDialog.value = true
  },

  eventClick: (info: any) => {
    const event = info.event
    // The calendar payload carries the follow-up fields so the dialog can
    // prefill without a second request.
    const nextVisitRaw = event.extendedProps.nextVisitDate as string | null
    const nextVisitDate = nextVisitRaw ? moment(nextVisitRaw).format('YYYY-MM-DD') : ''
    const reminderDaysBefore = event.extendedProps.reminderDaysBefore ?? null

    newVisit.value = {
      start: event.startStr.slice(0, 16).replace('T', ' '),
      end: event.endStr ? event.endStr.slice(0, 16).replace('T', ' ') : '',
      patientId: event.extendedProps.patientId || null,
      type: event.extendedProps.type || visitTypes.value[0],
      status: statusOptions.value[0],
      notes: event.extendedProps.notes || '',
      nextVisitDate,
      reminderDaysBefore,
    }
    editOriginal.value = { nextVisitDate, reminderDaysBefore }
    currentVisitId.value = event.id
    isEditMode.value = true
    visitDialog.value = true
    loadDefaultReminderDays()
  },
}))

onMounted(async () => {
  isMobile.value = window.innerWidth < 768
  fetchPatients()
  await loadEvents()
  window.addEventListener('resize', handleResize)
  openVisitFromQuery()
})

/**
 * The follow-ups page deep-links with `?visit=<id>`. Events are limited to the
 * visible range, so fall back to the visit detail endpoint when the id is not
 * among the loaded events.
 */
async function openVisitFromQuery() {
  const route = useRoute()
  const visitId = typeof route.query.visit === 'string' ? route.query.visit : null
  if (!visitId) return

  const openFrom = (event: CalendarEventLike) => {
    const nextVisitRaw = event.extendedProps?.nextVisitDate ?? null
    const nextVisitDate = nextVisitRaw ? moment(nextVisitRaw).format('YYYY-MM-DD') : ''
    const reminderDaysBefore = event.extendedProps?.reminderDaysBefore ?? null
    // FullCalendar events expose `startStr`/`endStr`; plain API events only `start`/`end`.
    const rawStart = event.startStr || event.start
    const rawEnd = event.endStr || event.end

    newVisit.value = {
      start: rawStart ? moment(rawStart).format('YYYY-MM-DD HH:mm') : '',
      end: rawEnd ? moment(rawEnd).format('YYYY-MM-DD HH:mm') : '',
      patientId: event.extendedProps?.patientId || null,
      type: event.extendedProps?.type || visitTypes.value[0],
      status: statusOptions.value[0],
      notes: event.extendedProps?.notes || '',
      nextVisitDate,
      reminderDaysBefore,
    }
    editOriginal.value = { nextVisitDate, reminderDaysBefore }
    currentVisitId.value = String(event.id)
    isEditMode.value = true
    visitDialog.value = true
    loadDefaultReminderDays()
  }

  const loaded = loadedEvents.value.find((e) => String(e.id) === visitId) as CalendarEventLike | undefined
  if (loaded) {
    openFrom(loaded)
    await navigateTo('/calendar', { replace: true })
    return
  }

  try {
    const res = await apiFetch<{ success: boolean; data: VisitDetail }>(`/api/visits/${visitId}`)
    if (res?.success && res.data) {
      const v = res.data
      const start = v.visitDate
      const nextVisitDate = v.nextVisitDate ? moment(v.nextVisitDate).format('YYYY-MM-DD') : ''
      const reminderDaysBefore = v.reminderDaysBefore ?? null
      newVisit.value = {
        start: start ? moment(start).format('YYYY-MM-DD HH:mm') : '',
        // Visits store a duration rather than an explicit end time.
        end: start
          ? moment(new Date(new Date(start).getTime() + (v.durationMinutes ?? 30) * 60000)).format('YYYY-MM-DD HH:mm')
          : '',
        patientId: v.patientId || null,
        type: v.visitType || visitTypes.value[0],
        status: v.status || statusOptions.value[0],
        notes: v.notes || '',
        nextVisitDate,
        reminderDaysBefore,
      }
      editOriginal.value = { nextVisitDate, reminderDaysBefore }
      currentVisitId.value = visitId
      isEditMode.value = true
      visitDialog.value = true
      loadDefaultReminderDays()
    }
  } catch (err: unknown) {
    $toast.error((err as { data?: { error?: string } } | null)?.data?.error || t('calendar.serverError'))
  }
  await navigateTo('/calendar', { replace: true })
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

useSeoMeta({
  title: t('calendar.titleSeo'),
})
</script>

<style scoped>
/* ── Metrics ───────────────────────────────────── */
.cal-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.875rem;
  margin-bottom: 1.375rem;
}

.cal-metric {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  border-radius: 1.125rem;
  min-width: 0;
}

.cal-metric__copy {
  min-width: 0;
}

.cal-metric__value {
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.cal-metric__value--md {
  font-size: 0.9375rem;
  letter-spacing: -0.01em;
}

.cal-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Calendar card ─────────────────────────────── */
.cal-card {
  padding: 0;
  overflow: hidden;
}

.cal-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.125rem;
  border-bottom: 1px solid var(--asa-sep);
}

.cal-nav {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.cal-nav__ic {
  padding-inline: 0.5rem !important;
}

.cal-range {
  flex: 1;
  min-width: 150px;
  text-align: center;
}

.cal-range__primary {
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
}

.cal-range__secondary {
  margin-top: 2px;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}

/* Segmented control (Apple style) */
.asa-seg {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  border-radius: 0.75rem;
}

.asa-seg__btn {
  height: 2rem;
  padding: 0 0.875rem;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label-2);
  cursor: pointer;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    box-shadow 150ms var(--ease-default);
}

.asa-seg__btn:hover {
  color: var(--asa-label);
}

.asa-seg__btn--on {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.1);
}

.dark .asa-seg__btn--on {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* Skeleton */
.cal-skel {
  display: grid;
  gap: 0.875rem;
  padding: 1.125rem;
}

/* Legend */
.cal-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 0.75rem 1.125rem;
  border-top: 1px solid var(--asa-sep);
}

.cal-legend__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--asa-label-2);
}

.cal-legend__items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem 0.875rem;
}

.cal-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.cal-legend__dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

/* ── Icon close button (local asa-icon-btn) ────── */
.cal-x {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default),
    transform 120ms var(--ease-default);
}

.cal-x:hover {
  background: color-mix(in srgb, var(--asa-label) 14%, transparent);
  color: var(--asa-label);
}

.cal-x:disabled {
  opacity: 0.5;
  cursor: default;
}

/* ── Form ──────────────────────────────────────── */
.pf-stack > * + * {
  margin-top: 1rem;
}

.cal-grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem 1rem;
}

/* ── Follow-up / return visit section ──────────── */
.fu-section {
  border: 1px dashed color-mix(in srgb, var(--asa-accent) 34%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-accent) 5%, transparent);
  padding: 0.75rem 0.875rem 0.875rem;
}

.fu-section__head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fu-section__hint {
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.pf-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.pf-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.pf-field :deep(.v-field__overlay) {
  background: transparent;
}

.pf-field :deep(.v-field__input),
.pf-field :deep(.v-field__input::placeholder),
.pf-field :deep(.v-label),
.pf-field :deep(.v-select__selection) {
  color: var(--asa-label);
}

.pf-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.pf-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.pf-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

/* Persian date/time picker input */
.pf-field :deep(.vpd-input-group) {
  display: block;
}

.pf-field :deep(.vpd-input-group input) {
  width: 100%;
  height: 46px;
  padding: 0 0.875rem;
  border: none;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label);
  font-size: 0.9375rem;
  font-weight: 500;
  outline: none;
  transition: background-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.pf-field :deep(.vpd-input-group input:focus) {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.pf-field :deep(.vpd-icon-btn) {
  display: none;
}

/* ── FullCalendar theming (token-based, auto dark) ── */
.cal-card :deep(.fc) {
  --fc-border-color: var(--asa-sep);
  --fc-page-bg-color: transparent;
  --fc-today-bg-color: color-mix(in srgb, var(--asa-accent) 9%, transparent);
  --fc-neutral-bg-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
  font-family: inherit;
  color: var(--asa-label);
  background: transparent;
}

.cal-card :deep(.fc-scrollgrid),
.cal-card :deep(.fc-theme-standard th),
.cal-card :deep(.fc-theme-standard td) {
  border-color: var(--asa-sep);
}

.cal-card :deep(.fc-col-header-cell) {
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  padding: 0.625rem 0;
}

.cal-card :deep(.fc-col-header-cell-cushion) {
  display: inline-flex;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.cal-card :deep(.fc-day-today .fc-col-header-cell-cushion) {
  color: var(--asa-accent-deep);
  font-weight: 700;
}

.cal-card :deep(.fc-daygrid-day-number) {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
  padding: 0.375rem 0.5rem;
}

.cal-card :deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  color: var(--asa-accent-deep);
  font-weight: 700;
}

.cal-card :deep(.fc-timegrid-axis-cushion) {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-3);
}

.cal-card :deep(.fc-timegrid-now-indicator-line),
.cal-card :deep(.fc-now-indicator-line) {
  border-color: var(--asa-rose);
}

.cal-card :deep(.fc-timegrid-now-indicator-arrow),
.cal-card :deep(.fc-now-indicator-arrow) {
  border-color: var(--asa-rose);
  background-color: var(--asa-rose);
}

.cal-card :deep(.fc-highlight) {
  background: color-mix(in srgb, var(--asa-accent) 16%, transparent);
}

.cal-card :deep(.fc-non-business) {
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

/* Event chips */
.cal-card :deep(.fc-event) {
  border-radius: 0.5rem;
  padding: 2px 6px;
  font-size: 0.75rem;
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.1);
  transition: transform 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.cal-card :deep(.fc-event:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px -4px rgba(17, 24, 39, 0.26);
}

.cal-card :deep(.fc-event-time),
.cal-card :deep(.fc-event-title) {
  font-weight: 600;
}

.cal-card :deep(.fc-daygrid-more-link) {
  color: var(--asa-accent-deep);
  font-weight: 600;
  font-size: 0.75rem;
  margin-inline: 4px;
}

.cal-card :deep(.fc-popover) {
  border-radius: 0.875rem;
  border-color: var(--asa-card-ring);
  box-shadow: var(--asa-card-shadow);
  overflow: hidden;
}

.cal-card :deep(.fc-popover-header) {
  background: var(--asa-bg-card);
}

.cal-card :deep(.fc-popover-title) {
  color: var(--asa-label);
  font-size: 0.875rem;
}

.cal-card :deep(.fc-scroller::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

.cal-card :deep(.fc-scroller::-webkit-scrollbar-track) {
  background: transparent;
}

.cal-card :deep(.fc-scroller::-webkit-scrollbar-thumb) {
  background: color-mix(in srgb, var(--asa-label) 22%, transparent);
  border-radius: 9999px;
}

.cal-card :deep(.fc-scroller::-webkit-scrollbar-thumb:hover) {
  background: color-mix(in srgb, var(--asa-label) 32%, transparent);
}

/* ── Responsive ────────────────────────────────── */
@media (max-width: 639px) {
  .cal-metrics {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.125rem;
  }

  .cal-metric {
    padding: 0.875rem 1rem;
  }

  .cal-toolbar {
    justify-content: center;
    gap: 0.625rem;
  }

  .cal-range {
    order: 3;
    width: 100%;
  }

  .cal-grid2 {
    grid-template-columns: 1fr;
  }
}
</style>