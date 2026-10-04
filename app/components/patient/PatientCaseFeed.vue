<template>
  <section class="pr-sec">
    <div class="pr-sec__head">
      <div class="pr-sec__copy">
        <h2 class="asa-card-title">{{ $t('patientRecord.caseSummary') }}</h2>
        <p class="asa-card-sub">{{ $t('patientRecord.caseSummaryDesc') }}</p>
      </div>
      <button
        class="asa-btn asa-btn--primary asa-btn--sm shrink-0!"
        :disabled="savingNote"
        @click="noteDialog = true"
      >
        <v-progress-circular v-if="savingNote" indeterminate size="15" width="2" color="#ffffff" />
        <Pencil v-else class="w-4! h-4! stroke-current" />
        <span>{{ $t('patientRecord.addNote') }}</span>
      </button>
    </div>

    <div class="asa-card pr-card">
      <!-- Toolbar: type filters -->
      <div class="pf-toolbar pr-toolbar">
        <div class="pf-toolbar__search">
          <span class="pf-toolbar__search-ic" aria-hidden="true">
            <v-icon size="17">mdi-filter-variant</v-icon>
          </span>
          <span class="pf-toolbar__count">{{ $t('patientRecord.feedFilterLabel') }}</span>
        </div>
        <div class="pf-toolbar__tail">
          <div class="pf-seg" role="group" :aria-label="$t('patientRecord.feedFilterLabel')">
            <button
              type="button"
              class="pf-seg__btn"
              :class="{ 'pf-seg__btn--on': activeTypes.length === 0 }"
              @click="activeTypes = []"
            >
              {{ $t('patientRecord.filterAll') }}
              <span class="pf-seg__count">{{ events.length }}</span>
            </button>
          </div>
        </div>
      </div>

      <div class="pr-filterbar" role="group" :aria-label="$t('patientRecord.feedFilterLabel')">
        <button
          v-for="filter in typeFilters"
          :key="filter.value"
          type="button"
          class="pr-chip"
          :class="{ 'pr-chip--on': activeTypes.includes(filter.value) }"
          :style="activeTypes.includes(filter.value)
            ? { '--pr-chip-accent': filter.color }
            : undefined"
          :aria-pressed="activeTypes.includes(filter.value)"
          @click="toggleType(filter.value)"
        >
          <span class="pr-chip__dot" :style="{ backgroundColor: filter.color }" aria-hidden="true" />
          <span>{{ $t(`patientRecord.eventTypes.${filter.value}`) }}</span>
          <span class="pr-chip__count">{{ countsByType[filter.value] || 0 }}</span>
        </button>
        <button v-if="activeTypes.length > 0" type="button" class="pr-chip pr-chip--clear" @click="activeTypes = []">
          {{ $t('patientRecord.clearFilters') }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="pf-skel pr-skel">
        <div v-for="i in 5" :key="`sk-${i}`" class="pr-skel__row">
          <div class="asa-skel h-9! w-9! rounded-xl!" />
          <div class="flex-1! space-y-2!">
            <div class="asa-skel h-3.5! w-1/3! rounded-md!" />
            <div class="asa-skel h-3! w-2/3! rounded-md!" />
          </div>
        </div>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="pf-empty pr-empty">
        <div class="asa-tint asa-tint--rose pf-tint-lg">
          <v-icon size="24">mdi-alert-circle-outline</v-icon>
        </div>
        <div>
          <p class="pf-empty__title">{{ $t('patientRecord.feedError') }}</p>
          <p class="pf-empty__desc">{{ error }}</p>
        </div>
        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="fetchFeed">
            <span>{{ $t('patientRecord.retry') }}</span>
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredEvents.length === 0" class="pf-empty pr-empty">
        <div class="asa-tint asa-tint--indigo pf-tint-lg">
          <DocumentText class="w-6! h-6! fill-current" />
        </div>
        <div>
          <p class="pf-empty__title">{{ $t('patientRecord.noEvents') }}</p>
          <p class="pf-empty__desc">{{ $t('patientRecord.noEventsDesc') }}</p>
        </div>
      </div>

      <!-- Feed -->
      <ol v-else class="pr-feed">
        <li v-for="event in filteredEvents" :key="`${event.id}-${event.type}`" class="pr-feed__item">
          <div
            class="pr-feed__marker"
            :style="{ '--pr-accent': event.color }"
            aria-hidden="true"
          >
            <v-icon size="17">{{ eventIcon(event.type) }}</v-icon>
          </div>

          <article class="pr-event" :class="{ 'pr-event--note': event.type === 'note' }">
            <header class="pr-event__head">
              <div class="pr-event__titlewrap">
                <span class="pr-event__type">{{ $t(`patientRecord.eventTypes.${event.type}`, event.type) }}</span>
                <h3 class="pr-event__title">{{ event.title }}</h3>
              </div>
              <time v-if="event.date" class="pr-event__date" :datetime="event.date">
                {{ formatDate(event.date) }}
              </time>
            </header>

            <!-- Doctor attribution -->
            <p v-if="event.doctorName" class="pr-event__doctor">
              <span class="asa-tint asa-tint--teal asa-tint--sm" aria-hidden="true">
                <UsersGroup class="w-3.5! h-3.5! fill-current" />
              </span>
              <span class="pr-event__doctor-name">{{ event.doctorName }}</span>
              <span v-if="event.doctorSpecialty" class="asa-pill asa-pill--teal">
                {{ event.doctorSpecialty }}
              </span>
              <span v-else class="pr-event__doctor-none">{{ $t('patientRecord.noSpecialty') }}</span>
            </p>

            <p v-if="event.summary" class="pr-event__summary">{{ event.summary }}</p>

            <button
              v-if="hasDetails(event)"
              type="button"
              class="pr-link pr-event__more"
              :aria-expanded="expandedIds.has(event.id)"
              @click="toggleDetails(event.id)"
            >
              <v-icon size="15">{{ expandedIds.has(event.id) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              <span>{{ expandedIds.has(event.id) ? $t('patientRecord.hideDetails') : $t('patientRecord.details') }}</span>
            </button>

            <dl v-if="expandedIds.has(event.id)" class="pf-info-grid pr-event__details">
              <div v-for="(val, key) in visibleDetails(event)" :key="key" class="pf-info-cell">
                <dt class="pf-info-label">{{ $t(`patientRecord.detailKeys.${key}`, key) }}</dt>
                <dd class="pf-info-value">{{ formatDetailValue(key, val) }}</dd>
              </div>
            </dl>
          </article>
        </li>
      </ol>

      <div v-if="filteredEvents.length > 0" class="pf-card-foot">
        <p class="pf-card-foot__info">
          {{ $t('patientRecord.showingCount', { shown: filteredEvents.length, total: events.length }) }}
        </p>
      </div>
    </div>

    <!-- â”€â”€â”€ Add note dialog â”€â”€â”€ -->
    <v-dialog v-model="noteDialog" max-width="540" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ $t('patientRecord.addNoteTitle') }}</h2>
            <span class="asa-dialog__sub">{{ patientName }}</span>
          </div>
          <button class="pf-x" :aria-label="$t('patientRecord.addNoteTitle')" @click="closeDialog">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="pr-stack">
            <v-textarea
              v-model="newNote.content"
              :label="$t('patientRecord.noteContent')"
              :placeholder="$t('patientRecord.noteContentHint')"
              rows="4"
              variant="solo"
              density="comfortable"
              dir="rtl"
              class="rounded-xl!"
            />
            <v-select
              v-model="newNote.eventType"
              :items="noteEventTypeOptions"
              item-title="label"
              item-value="value"
              :label="$t('patientRecord.noteEventType')"
              variant="solo"
              density="comfortable"
              dir="rtl"
              clearable
              class="rounded-xl!"
            />
            <v-text-field
              v-model="newNote.eventDate"
              :label="$t('patientRecord.noteEventDate')"
              type="date"
              variant="solo"
              density="comfortable"
              dir="ltr"
              class="ltr-field rounded-xl!"
            />
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="savingNote" @click="closeDialog">
            <span>{{ $t('common.cancel') }}</span>
          </button>
          <button
            class="asa-btn asa-btn--primary asa-btn--sm"
            :disabled="!newNote.content.trim() || savingNote"
            @click="saveNote"
          >
            <v-progress-circular v-if="savingNote" indeterminate size="15" width="2" color="#ffffff" />
            <CheckCircle v-else class="w-4! h-4! stroke-current" />
            <span>{{ $t('common.save') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Pencil from '~/components/icons/Pencil.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'

interface FeedEvent {
  id: string
  type: string
  date: string | null
  title: string
  summary: string
  details: Record<string, any>
  color: string
  icon: string
  doctorName?: string | null
  doctorSpecialty?: string | null
}

const props = defineProps<{
  patientId: string
  patientName?: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'stats', stats: { visits: number; prescriptions: number; notes: number; doctors: number }): void
}>()

const { t } = useI18n()
const { toPersianNum } = useLang()
const { apiFetch } = useApi()
const $toast = useNuxtApp().$toast

const loading = ref(true)
const error = ref('')
const events = ref<FeedEvent[]>([])
const activeTypes = ref<string[]>([])
const expandedIds = ref<Set<string>>(new Set())

const noteDialog = ref(false)
const savingNote = ref(false)
const newNote = ref({ content: '', eventType: null as string | null, eventDate: '' })

/** Only surface types the record actually contains, most common first. */
const TYPE_ORDER = [
  'note', 'visit', 'prescription', 'lab_result', 'lab_order', 'screening',
  'screening_result', 'appointment', 'assessment', 'vital_signs',
  'pregnancy', 'vaccination', 'disease', 'medication', 'allergy',
  'billing', 'message', 'daily_report',
]

const EVENT_COLORS: Record<string, string> = {
  visit: '#4F46E5',
  appointment: '#7C3AED',
  prescription: '#059669',
  lab_result: '#2563EB',
  lab_order: '#6366F1',
  screening: '#D97706',
  screening_result: '#0891B2',
  pregnancy: '#EC4899',
  vaccination: '#10B981',
  assessment: '#8B5CF6',
  billing: '#F59E0B',
  message: '#6B7280',
  daily_report: '#374151',
  vital_signs: '#EF4444',
  note: '#F97316',
  disease: '#B91C1C',
  medication: '#15803D',
  allergy: '#DC2626',
}

const EVENT_ICONS: Record<string, string> = {
  visit: 'mdi-stethoscope',
  appointment: 'mdi-calendar-clock',
  prescription: 'mdi-pill',
  lab_result: 'mdi-flask',
  lab_order: 'mdi-clipboard-list',
  screening: 'mdi-shield-check',
  screening_result: 'mdi-clipboard-check',
  pregnancy: 'mdi-baby-face-outline',
  vaccination: 'mdi-needle',
  assessment: 'mdi-clipboard-search',
  billing: 'mdi-wallet-outline',
  message: 'mdi-chat-outline',
  daily_report: 'mdi-file-text-outline',
  vital_signs: 'mdi-heart-pulse',
  note: 'mdi-note-text-outline',
  disease: 'mdi-alert-circle-outline',
  medication: 'mdi-pill',
  allergy: 'mdi-alert-triangle-outline',
}

const countsByType = computed(() => {
  const counts: Record<string, number> = {}
  for (const e of events.value) counts[e.type] = (counts[e.type] || 0) + 1
  return counts
})

const typeFilters = computed(() =>
  TYPE_ORDER
    .filter(type => countsByType.value[type])
    .map(value => ({ value, color: EVENT_COLORS[value] || '#64748B' })),
)

const filteredEvents = computed(() => {
  if (activeTypes.value.length === 0) return events.value
  return events.value.filter(e => activeTypes.value.includes(e.type))
})

const stats = computed(() => {
  const doctors = new Set<string>()
  for (const e of events.value) {
    if (e.doctorName) doctors.add(e.doctorName)
  }
  return {
    visits: countsByType.value.visit || 0,
    prescriptions: countsByType.value.prescription || 0,
    notes: countsByType.value.note || 0,
    doctors: doctors.size,
  }
})

const noteEventTypeOptions = computed(() => [
  { value: 'clinical_note', label: t('patientRecord.noteTypeClinical') },
  { value: 'follow_up', label: t('patientRecord.noteTypeFollowUp') },
  { value: 'observation', label: t('patientRecord.noteTypeObservation') },
  { value: 'instruction', label: t('patientRecord.noteTypeInstruction') },
])

function eventIcon(type: string): string {
  return EVENT_ICONS[type] || 'mdi-circle-outline'
}

function toggleType(type: string) {
  const idx = activeTypes.value.indexOf(type)
  if (idx >= 0) activeTypes.value.splice(idx, 1)
  else activeTypes.value.push(type)
}

function hasDetails(event: FeedEvent): boolean {
  return !!event.details && Object.values(event.details).some(v => v !== null && v !== undefined && v !== '')
}

function toggleDetails(id: string) {
  if (expandedIds.value.has(id)) expandedIds.value.delete(id)
  else expandedIds.value.add(id)
}

const NOTE_EVENT_TYPES = ['clinical_note', 'follow_up', 'observation', 'instruction']

/** Keys already surfaced in the card header/attribution row. */
const REDUNDANT_DETAIL_KEYS = ['doctorName']

function visibleDetails(event: FeedEvent): Record<string, any> {
  const entries = Object.entries(event.details || {})
    .filter(([key]) => !REDUNDANT_DETAIL_KEYS.includes(key))
    .filter(([, val]) => val !== null && val !== undefined && val !== '')
  return Object.fromEntries(entries)
}

function formatDetailValue(key: string, val: any): string {
  if (key === 'eventType' && typeof val === 'string' && NOTE_EVENT_TYPES.includes(val)) {
    const map: Record<string, string> = {
      clinical_note: 'noteTypeClinical',
      follow_up: 'noteTypeFollowUp',
      observation: 'noteTypeObservation',
      instruction: 'noteTypeInstruction',
    }
    return t(`patientRecord.${map[val]}`)
  }
  return formatValue(val)
}

function formatValue(val: any): string {
  if (val === null || val === undefined || val === '') return '---'
  if (typeof val === 'boolean') return val ? t('patientRecord.yes') : t('patientRecord.no')
  if (Array.isArray(val)) return val.join('ØŒ ')
  if (typeof val === 'object') return JSON.stringify(val)
  if (typeof val === 'number') return toPersianNum(val)
  const str = String(val)
  return /^\d{4}-\d{2}-\d{2}T/.test(str) ? formatDate(str) : str
}

function formatDate(value: string): string {
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
  } catch {
    return value
  }
}

function closeDialog() {
  if (savingNote.value) return
  noteDialog.value = false
}

async function fetchFeed() {
  if (!props.patientId) return
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<{ success: boolean; data: { events: FeedEvent[] } }>(
      `/api/patients/${props.patientId}/timeline`,
    )
    events.value = res.success ? res.data?.events ?? [] : []
    if (!res.success) error.value = ''
  } catch (err: any) {
    events.value = []
    error.value = err?.data?.error || ''
  } finally {
    loading.value = false
  }
}

async function saveNote() {
  const content = newNote.value.content.trim()
  if (!content || !props.patientId) return

  savingNote.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(
      `/api/patient-notes/patient/${props.patientId}`,
      {
        method: 'POST',
        body: {
          content,
          eventType: newNote.value.eventType || undefined,
          eventDate: newNote.value.eventDate || undefined,
        },
      },
    )

    if (res.success) {
      $toast.success(t('patientRecord.noteSaved'))
      noteDialog.value = false
      newNote.value = { content: '', eventType: null, eventDate: '' }
      await fetchFeed()
      emit('refresh')
    } else {
      $toast.error(t('patientRecord.noteSaveError'))
    }
  } catch (err: any) {
    $toast.error(err?.data?.error || t('patientRecord.noteSaveError'))
  } finally {
    savingNote.value = false
  }
}

onMounted(fetchFeed)

watch(() => props.patientId, fetchFeed)

watch(stats, value => emit('stats', value), { immediate: true })

defineExpose({ refresh: fetchFeed })
</script>

<style scoped>
.pr-sec {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2.25rem;
}

.pr-sec__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.pr-sec__copy {
  min-width: 0;
}

.pr-card {
  padding: 0;
  overflow: hidden;
}

.pr-toolbar {
  border-bottom: 1px solid var(--asa-sep);
}

.pr-filterbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.875rem 1.375rem;
  border-bottom: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label-3) 6%, transparent);
}

.pr-chip {
  --pr-chip-accent: var(--asa-label-3);
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.625rem;
  border-radius: 0.625rem;
  border: 1px solid var(--asa-sep);
  background: var(--asa-bg-card);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
  cursor: pointer;
  transition: color 180ms var(--ease-premium), border-color 180ms var(--ease-premium),
    background 180ms var(--ease-premium);
}

.pr-chip:hover {
  border-color: color-mix(in srgb, var(--pr-chip-accent) 45%, transparent);
  color: var(--asa-label);
}

.pr-chip--on {
  background: color-mix(in srgb, var(--pr-chip-accent) 14%, transparent);
  border-color: color-mix(in srgb, var(--pr-chip-accent) 42%, transparent);
  color: color-mix(in srgb, var(--pr-chip-accent) 72%, var(--asa-label));
}

.pr-chip__dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 9999px;
  flex-shrink: 0;
}

.pr-chip__count {
  padding: 0 0.3125rem;
  border-radius: 0.3125rem;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  font-family: ui-monospace, monospace;
  font-size: 0.625rem;
  font-weight: 700;
}

.pr-chip--clear {
  border-style: dashed;
  background: transparent;
  color: var(--asa-label-2);
}

.pr-skel {
  padding: 1.375rem;
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
  border: 0;
}

.pr-skel__row {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
}

.pr-feed {
  list-style: none;
  margin: 0;
  padding: 1.375rem 1.375rem 0.5rem;
  position: relative;
}

.pr-feed::before {
  content: '';
  position: absolute;
  inset-inline-start: 2.1875rem;
  top: 2.375rem;
  bottom: 1.875rem;
  width: 2px;
  border-radius: 2px;
  background: var(--asa-sep);
}

.pr-feed__item {
  position: relative;
  display: flex;
  gap: 0.875rem;
  padding-bottom: 1rem;
}

.pr-feed__marker {
  --pr-accent: var(--asa-label-3);
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.875rem;
  color: color-mix(in srgb, var(--pr-accent) 80%, var(--asa-label));
  background: color-mix(in srgb, var(--pr-accent) 16%, var(--asa-bg-card));
  border: 1px solid color-mix(in srgb, var(--pr-accent) 34%, transparent);
}

.pr-event {
  flex: 1;
  min-width: 0;
  padding: 0.9375rem 1.0625rem;
  border-radius: 1rem;
  border: 1px solid var(--asa-sep);
  background: var(--asa-bg-card);
  transition: border-color 180ms var(--ease-premium), box-shadow 180ms var(--ease-premium);
}

.pr-event:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 32%, transparent);
  box-shadow: var(--asa-card-shadow);
}

.pr-event--note {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, #f97316 7%, var(--asa-bg-card)),
    var(--asa-bg-card) 72%
  );
  border-color: color-mix(in srgb, #f97316 30%, transparent);
}

.pr-event__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.pr-event__titlewrap {
  min-width: 0;
}

.pr-event__type {
  display: block;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--asa-label-3);
}

.pr-event__title {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--asa-label);
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.pr-event__date {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 0.875rem;
}

.pr-event__doctor {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.6875rem;
}

.pr-event__doctor-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.pr-event__doctor-none {
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.pr-event__summary {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  line-height: 1.8;
  color: var(--asa-label-2);
  white-space: pre-line;
  overflow-wrap: anywhere;
}

.pr-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  background: none;
  color: var(--asa-accent-deep);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 180ms var(--ease-premium);
}

.pr-link:hover {
  opacity: 0.75;
}

.pr-event__more {
  margin-top: 0.5rem;
}

.pr-event__details {
  margin-top: 0.75rem;
  padding: 0.875rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label-3) 8%, transparent);
  border: 1px solid var(--asa-sep);
}

.pr-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-width: 560px) {
  .pr-feed {
    padding: 1.125rem 1rem 0.5rem;
  }

  .pr-feed::before {
    inset-inline-start: 1.8125rem;
  }

  .pr-feed__marker {
    width: 1.8125rem;
    height: 1.8125rem;
    border-radius: 0.625rem;
  }

  .pr-event {
    padding: 0.8125rem 0.9375rem;
  }

  .pr-event__date {
    padding-top: 0;
  }
}
</style>
