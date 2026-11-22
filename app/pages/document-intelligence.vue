<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('documentIntelligence.title') }}</h1>
        <p class="dash-head__date">{{ t('documentIntelligence.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="loading" @click="refreshAll">
          <v-icon size="16">mdi-refresh</v-icon>
          {{ t('documentIntelligence.refresh') }}
        </button>
        <button type="button" class="asa-btn asa-btn--primary" :disabled="!selectedIds.length || queueing"
          @click="queueSelected">
          <v-progress-circular v-if="queueing" indeterminate size="14" width="2" color="white" class="me-2" />
          <v-icon v-else size="16">mdi-play-circle-outline</v-icon>
          {{ t('documentIntelligence.queueSelected', { count: selectedIds.length }) }}
        </button>
      </div>
    </header>

    <!-- Overview metrics -->
    <section class="asa-sec">
      <p class="asa-sec__label">{{ t('documentIntelligence.statsLabel') }}</p>
      <div class="di-stats">
        <article v-for="card in statCards" :key="card.key" class="asa-card di-stat">
          <span class="asa-tint" :class="card.tint" aria-hidden="true">
            <component :is="card.icon" class="w-5! h-5! fill-current" />
          </span>
          <div class="min-w-0">
            <p class="di-stat__value">{{ card.value }}</p>
            <p class="di-stat__label">{{ card.label }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- Search + filters -->
    <section class="asa-sec">
      <div class="asa-card di-toolbar">
        <div class="di-search">
          <v-text-field v-model="search" variant="solo" density="comfortable" hide-details clearable
            :placeholder="t('documentIntelligence.searchPlaceholder')" prepend-inner-icon="mdi-magnify"
            :loading="loading" @update:model-value="onSearchInput" />
        </div>
        <div class="di-filters">
          <button v-for="filter in statusFilters" :key="filter.value" type="button" class="di-chip"
            :class="{ 'is-active': statusFilter === filter.value }" @click="setStatusFilter(filter.value)">
            {{ filter.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Patient list -->
    <section class="asa-sec">
      <div class="di-list-head">
        <p class="asa-sec__label">
          {{ t('documentIntelligence.patientsLabel', { count: patients.length }) }}
        </p>
        <label v-if="patients.length" class="di-select-all">
          <input type="checkbox" :checked="allSelected" @change="toggleSelectAll">
          {{ t('documentIntelligence.selectAll') }}
        </label>
      </div>

      <div v-if="loading" class="di-skeleton-list">
        <div v-for="n in 4" :key="n" class="asa-skel di-skeleton" />
      </div>

      <div v-else-if="!patients.length" class="asa-card di-empty">
        <span class="asa-tint asa-tint--indigo" aria-hidden="true">
          <FolderOpen class="w-7! h-7! fill-current" />
        </span>
        <p class="di-empty__title">
          {{ search || statusFilter !== 'all'
            ? t('documentIntelligence.noMatchTitle')
            : t('documentIntelligence.noDocumentsTitle') }}
        </p>
        <p class="di-empty__sub">
          {{ search || statusFilter !== 'all'
            ? t('documentIntelligence.noMatchDesc')
            : t('documentIntelligence.noDocumentsDesc') }}
        </p>
      </div>

      <div v-else class="di-patients">
        <article v-for="row in patients" :key="row.patient.id" class="asa-card di-patient"
          :class="{ 'is-selected': isSelected(row.patient.id) }">
          <label class="di-check" :title="t('documentIntelligence.selectPatient')">
            <input type="checkbox" :checked="isSelected(row.patient.id)"
              @change="toggleSelect(row.patient.id)">
          </label>

          <span class="asa-tint di-avatar" :class="tintFor(row.patient.id)" aria-hidden="true">
            {{ initials(row.patient) }}
          </span>

          <div class="di-patient__main">
            <div class="di-patient__title">
              <span class="di-patient__name">{{ row.patient.firstName }} {{ row.patient.lastName }}</span>
              <span v-if="pendingCount(row)" class="asa-pill asa-pill--amber">
                {{ t('documentIntelligence.status.pending') }} {{ pendingCount(row) }}
              </span>
              <span v-if="readyCount(row)" class="asa-pill asa-pill--teal">
                {{ t('documentIntelligence.status.completed') }} {{ readyCount(row) }}
              </span>
              <span v-if="failedCount(row)" class="asa-pill asa-pill--rose">
                {{ t('documentIntelligence.status.failed') }} {{ failedCount(row) }}
              </span>
            </div>

            <p class="di-patient__meta">
              <span v-if="row.patient.nationalId" class="crm-ltr font-mono">{{ row.patient.nationalId }}</span>
              <span v-if="row.patient.phone" class="crm-ltr font-mono">{{ row.patient.phone }}</span>
              <span v-if="row.lastUploadedAt">
                {{ t('documentIntelligence.lastUpload') }} {{ formatDate(row.lastUploadedAt) }}
              </span>
            </p>

            <div class="di-patient__types">
              <span v-for="type in row.documentTypes" :key="type.type" class="di-type-pill">
                {{ typeLabel(type.type) }} · {{ type.count }}
              </span>
            </div>
          </div>

          <div class="di-patient__side">
            <div class="di-count">
              <strong>{{ row.documentCount }}</strong>
              <span>{{ t('documentIntelligence.statDocuments') }}</span>
            </div>
            <div class="di-count">
              <strong>{{ row.extractedTestCount }}</strong>
              <span>{{ t('documentIntelligence.statTests') }}</span>
            </div>

            <div class="di-patient__actions">
              <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="openPatient(row)">
                <v-icon size="14">mdi-eye-outline</v-icon>
                {{ t('documentIntelligence.review') }}
              </button>
              <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm"
                :disabled="queueingId === row.patient.id || row.extractableCount === 0"
                @click="queuePatient(row)">
                <v-progress-circular v-if="queueingId === row.patient.id" indeterminate size="12" width="2"
                  class="me-1" />
                <v-icon v-else size="14">mdi-microscope</v-icon>
                {{ t('documentIntelligence.analyze') }}
              </button>
              <button type="button" class="asa-btn asa-btn--primary asa-btn--sm"
                :disabled="confirmingId === row.patient.id || readyCount(row) === 0"
                @click="confirmPatient(row)">
                <v-progress-circular v-if="confirmingId === row.patient.id" indeterminate size="12" width="2"
                  class="me-1" />
                <v-icon v-else size="14">mdi-check-circle-outline</v-icon>
                {{ t('documentIntelligence.record') }}
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Patient documents dialog -->
    <v-dialog v-model="detailOpen" max-width="980">
      <div class="asa-dialog di-dialog">
        <div class="asa-dialog__head">
          <div class="di-dialog__identity">
            <span class="asa-tint di-avatar" :class="detailPatient ? tintFor(detailPatient.id) : ''"
              aria-hidden="true">
              {{ detailPatient ? initials(detailPatient) : '?' }}
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title">
                {{ detailPatient ? `${detailPatient.firstName} ${detailPatient.lastName}` : '' }}
              </h2>
              <span class="asa-dialog__sub">
                {{ t('documentIntelligence.detail.subtitle', {
                  count: detailDocs.length,
                  tests: detailTests,
                }) }}
              </span>
            </div>
          </div>
          <button type="button" class="di-close" @click="detailOpen = false">
            <X class="w-4! h-4!" />
          </button>
        </div>

        <div class="asa-dialog__body di-dialog__body">
          <div class="di-dialog__toolbar">
            <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm"
              :disabled="!detailPatient || detailQueueing || detailDocs.length === 0"
              @click="queueDetailPatient">
              <v-progress-circular v-if="detailQueueing" indeterminate size="12" width="2" class="me-1" />
              <v-icon v-else size="14">mdi-microscope</v-icon>
              {{ t('documentIntelligence.detail.analyzeAll') }}
            </button>
            <button type="button" class="asa-btn asa-btn--primary asa-btn--sm"
              :disabled="detailConfirming || detailReadyCount === 0" @click="confirmDetailPatient">
              <v-progress-circular v-if="detailConfirming" indeterminate size="12" width="2" class="me-1" />
              <v-icon v-else size="14">mdi-check-circle-outline</v-icon>
              {{ t('documentIntelligence.detail.recordReady', { count: detailReadyCount }) }}
            </button>
          </div>

          <div v-if="detailLoading" class="di-skeleton-list">
            <div v-for="n in 3" :key="n" class="asa-skel di-skeleton di-skeleton--sm" />
          </div>

          <div v-else-if="!detailDocs.length" class="di-empty di-empty--inline">
            <span class="asa-tint asa-tint--indigo" aria-hidden="true">
              <FolderOpen class="w-6! h-6! fill-current" />
            </span>
            <p class="di-empty__title">{{ t('documentIntelligence.detail.noDocs') }}</p>
          </div>

          <div v-else class="di-doc-list">
            <article v-for="doc in detailDocs" :key="doc.id" class="di-doc">
              <span class="asa-tint asa-tint--sm" :class="docTint(doc)" aria-hidden="true">
                <FileText class="w-4! h-4! fill-current" />
              </span>

              <div class="di-doc__main">
                <p class="di-doc__name">{{ doc.fileName }}</p>
                <p class="di-doc__meta">
                  {{ t('documentIntelligence.detail.fileMeta', {
                    type: typeLabel(doc.fileType),
                    size: formatSize(doc.fileSize),
                  }) }}
                </p>
                <p class="di-doc__meta">
                  {{ t('documentIntelligence.detail.uploaded', { date: formatDate(doc.createdAt) }) }}
                </p>
                <p v-if="doc.error" class="di-doc__error">{{ doc.error }}</p>
              </div>

              <div class="di-doc__side">
                <span class="asa-pill" :class="statusClass(doc.status)">
                  {{ statusLabel(doc.status) }}
                </span>
                <span v-if="doc.status === 'completed' || doc.status === 'confirmed'" class="di-doc__tests">
                  {{ t('documentIntelligence.testsCount', { count: doc.testCount }) }}
                </span>

                <div class="di-doc__actions">
                  <button v-if="doc.status !== 'none'" type="button" class="asa-btn asa-btn--ghost asa-btn--sm"
                    @click="openExtraction(doc)">
                    <Eye class="w-3.5! h-3.5!" />
                    {{ t('documentIntelligence.detail.openReview') }}
                  </button>
                  <button v-if="doc.extractable && doc.status !== 'pending' && doc.status !== 'processing' && doc.status !== 'confirmed'"
                    type="button" class="asa-btn asa-btn--ghost asa-btn--sm"
                    :disabled="busyDocId === doc.id" @click="analyzeDocument(doc)">
                    <v-progress-circular v-if="busyDocId === doc.id" indeterminate size="12" width="2"
                      class="me-1" />
                    <Microscope v-else class="w-3.5! h-3.5!" />
                    {{ doc.status === 'none'
                      ? t('documentIntelligence.analyze')
                      : t('documentIntelligence.detail.reanalyze') }}
                  </button>
                  <button v-if="doc.status === 'completed'" type="button" class="asa-btn asa-btn--primary asa-btn--sm"
                    :disabled="busyDocId === doc.id" @click="recordDocument(doc)">
                    <v-progress-circular v-if="busyDocId === doc.id" indeterminate size="12" width="2"
                      class="me-1" />
                    <CheckCircle v-else class="w-3.5! h-3.5!" />
                    {{ t('documentIntelligence.record') }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>

        <div class="asa-dialog__foot di-dialog__foot">
          <button type="button" class="asa-btn asa-btn--ghost" @click="detailOpen = false">
            {{ t('documentIntelligence.detail.close') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <DocumentExtractionDialog v-model="extractionOpen" :patient-id="detailPatient?.id || ''"
      :attachment-id="extractionDoc?.id || null" :file-name="extractionDoc?.fileName || ''"
      @confirmed="onExtractionConfirmed" @updated="onExtractionUpdated" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import Microscope from '~/components/icons/Microscope.vue'
import FolderOpen from '~/components/icons/FolderOpen.vue'
import FileText from '~/components/icons/FileText.vue'
import Eye from '~/components/icons/Eye.vue'
import X from '~/components/icons/X.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import Clock from '~/components/icons/Clock.vue'
import Activity from '~/components/icons/Activity.vue'
import DocumentExtractionDialog from '~/components/lab/DocumentExtractionDialog.vue'

type OverviewStatus = 'none' | 'pending' | 'processing' | 'completed' | 'failed' | 'confirmed'

interface PatientOverview {
  patient: {
    id: string
    firstName: string
    lastName: string
    nationalId: string | null
    phone: string | null
  }
  documentCount: number
  extractableCount: number
  extractedTestCount: number
  documentTypes: Array<{ type: string; count: number }>
  statusCounts: Record<OverviewStatus, number>
  lastUploadedAt: string | null
  lastProcessedAt: string | null
}

interface OverviewStats {
  totalPatients: number
  totalDocuments: number
  pending: number
  processing: number
  completed: number
  failed: number
  confirmed: number
  extractedTests: number
}

interface OverviewResult {
  patients: PatientOverview[]
  stats: OverviewStats
  generatedAt: string
}

interface PatientDocument {
  id: string
  fileName: string
  fileType: string
  mimeType: string
  fileSize: number
  createdAt: string | null
  extractionId: string | null
  status: OverviewStatus
  documentType: string | null
  confidence: string | null
  processedAt: string | null
  error: string | null
  testCount: number
  extractable: boolean
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const { t, te, locale } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const TINTS = [
  'asa-tint--teal',
  'asa-tint--green',
  'asa-tint--orange',
  'asa-tint--amber',
  'asa-tint--rose',
  'asa-tint--indigo',
]

const patients = ref<PatientOverview[]>([])
const stats = ref<OverviewStats>({
  totalPatients: 0,
  totalDocuments: 0,
  pending: 0,
  processing: 0,
  completed: 0,
  failed: 0,
  confirmed: 0,
  extractedTests: 0,
})
const loading = ref(true)
const search = ref('')
const statusFilter = ref('all')
const selectedIds = ref<string[]>([])
const queueing = ref(false)
const queueingId = ref<string | null>(null)
const confirmingId = ref<string | null>(null)

const detailOpen = ref(false)
const detailPatient = ref<PatientOverview['patient'] | null>(null)
const detailDocs = ref<PatientDocument[]>([])
const detailLoading = ref(false)
const detailQueueing = ref(false)
const detailConfirming = ref(false)
const busyDocId = ref<string | null>(null)

const extractionOpen = ref(false)
const extractionDoc = ref<PatientDocument | null>(null)

const statusFilters = computed(() => [
  { value: 'all', label: t('documentIntelligence.filterAll') },
  { value: 'pending', label: t('documentIntelligence.filterPending') },
  { value: 'ready', label: t('documentIntelligence.filterReady') },
  { value: 'confirmed', label: t('documentIntelligence.filterConfirmed') },
  { value: 'failed', label: t('documentIntelligence.filterFailed') },
])

const statCards = computed(() => [
  {
    key: 'documents',
    value: stats.value.totalDocuments,
    label: t('documentIntelligence.statDocuments'),
    icon: FileText,
    tint: 'asa-tint--indigo',
  },
  {
    key: 'pending',
    value: stats.value.pending + stats.value.processing,
    label: t('documentIntelligence.statPending'),
    icon: Clock,
    tint: 'asa-tint--amber',
  },
  {
    key: 'ready',
    value: stats.value.completed,
    label: t('documentIntelligence.statReady'),
    icon: Microscope,
    tint: 'asa-tint--teal',
  },
  {
    key: 'confirmed',
    value: stats.value.confirmed,
    label: t('documentIntelligence.statConfirmed'),
    icon: CheckCircle,
    tint: 'asa-tint--green',
  },
  {
    key: 'failed',
    value: stats.value.failed,
    label: t('documentIntelligence.statFailed'),
    icon: CloseCircle,
    tint: 'asa-tint--rose',
  },
  {
    key: 'tests',
    value: stats.value.extractedTests,
    label: t('documentIntelligence.statTests'),
    icon: Activity,
    tint: 'asa-tint--teal',
  },
])

const allSelected = computed(
  () => patients.value.length > 0 && patients.value.every((row) => selectedIds.value.includes(row.patient.id)),
)

const detailTests = computed(() => detailDocs.value.reduce((total, doc) => total + doc.testCount, 0))
const detailReadyCount = computed(() => detailDocs.value.filter((doc) => doc.status === 'completed').length)

const hasActiveJobs = computed(
  () =>
    stats.value.pending + stats.value.processing > 0 ||
    (detailOpen.value &&
      detailDocs.value.some((doc) => doc.status === 'pending' || doc.status === 'processing')),
)

let searchTimer: ReturnType<typeof setTimeout> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function toggleSelect(id: string) {
  if (isSelected(id)) selectedIds.value = selectedIds.value.filter((value) => value !== id)
  else selectedIds.value = [...selectedIds.value, id]
}

function toggleSelectAll() {
  if (allSelected.value) selectedIds.value = []
  else selectedIds.value = patients.value.map((row) => row.patient.id)
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchOverview(), 350)
}

function setStatusFilter(value: string) {
  statusFilter.value = value
  fetchOverview()
}

async function fetchOverview(silent = false) {
  if (!silent) loading.value = true
  try {
    const params = new URLSearchParams()
    if (search.value.trim()) params.set('search', search.value.trim())
    if (statusFilter.value !== 'all') params.set('status', statusFilter.value)
    const query = params.toString()
    const res = await apiFetch<ApiResponse<OverviewResult>>(
      `/api/document-intelligence/overview${query ? `?${query}` : ''}`,
    )
    if (res.success) {
      patients.value = res.data.patients || []
      stats.value = res.data.stats
      const visible = new Set(patients.value.map((row) => row.patient.id))
      selectedIds.value = selectedIds.value.filter((id) => visible.has(id))
    }
  } catch {
    if (!silent) $toast.error(t('documentIntelligence.actionError'))
  } finally {
    if (!silent) loading.value = false
  }
}

async function refreshAll() {
  await fetchOverview()
  if (detailOpen.value) await fetchPatientDocuments()
}

async function queuePatients(patientIds: string[]) {
  if (!patientIds.length) return
  queueing.value = true
  try {
    const res = await apiFetch<ApiResponse<{ queued: number; skipped: number; patients: number }>>(
      '/api/document-intelligence/queue',
      { method: 'POST', body: { patientIds } },
    )
    if (res.data?.queued > 0) {
      $toast.success(t('documentIntelligence.queueSuccess', { count: res.data.queued }))
    } else {
      $toast.info(t('documentIntelligence.queueNone'))
    }
    selectedIds.value = []
    await fetchOverview(true)
    if (detailOpen.value) await fetchPatientDocuments(true)
  } catch (err) {
    handleActionError(err)
  } finally {
    queueing.value = false
  }
}

async function queueSelected() {
  await queuePatients(selectedIds.value)
}

async function queuePatient(row: PatientOverview) {
  queueingId.value = row.patient.id
  try {
    await queuePatients([row.patient.id])
  } finally {
    queueingId.value = null
  }
}

async function queueDetailPatient() {
  if (!detailPatient.value) return
  detailQueueing.value = true
  try {
    const res = await apiFetch<ApiResponse<{ queued: number; skipped: number; patients: number }>>(
      '/api/document-intelligence/queue',
      { method: 'POST', body: { patientIds: [detailPatient.value.id] } },
    )
    if (res.data?.queued > 0) {
      $toast.success(t('documentIntelligence.queueSuccess', { count: res.data.queued }))
    } else {
      $toast.info(t('documentIntelligence.queueNone'))
    }
    await Promise.all([fetchOverview(true), fetchPatientDocuments(true)])
  } catch (err) {
    handleActionError(err)
  } finally {
    detailQueueing.value = false
  }
}

async function confirmPatient(row: PatientOverview) {
  confirmingId.value = row.patient.id
  try {
    await confirmExtractions(row.patient.id)
  } finally {
    confirmingId.value = null
  }
}

async function confirmDetailPatient() {
  if (!detailPatient.value) return
  detailConfirming.value = true
  try {
    await confirmExtractions(detailPatient.value.id)
  } finally {
    detailConfirming.value = false
  }
}

async function confirmExtractions(patientId: string, attachmentIds?: string[]) {
  try {
    const res = await apiFetch<ApiResponse<{ confirmed: number; failed: number; skipped: number; errors: string[] }>>(
      `/api/document-intelligence/patients/${patientId}/confirm`,
      { method: 'POST', body: attachmentIds ? { attachmentIds } : {} },
    )
    if (res.data?.confirmed > 0) {
      $toast.success(t('documentIntelligence.confirmSuccess', { count: res.data.confirmed }))
    } else {
      $toast.info(t('documentIntelligence.confirmNone'))
    }
    if (res.data?.failed > 0) {
      $toast.warning(t('documentIntelligence.confirmPartial', { count: res.data.failed }))
    }
    await fetchOverview(true)
    if (detailOpen.value) await fetchPatientDocuments(true)
  } catch (err) {
    handleActionError(err)
  }
}

async function openPatient(row: PatientOverview) {
  detailPatient.value = row.patient
  detailDocs.value = []
  detailOpen.value = true
  await fetchPatientDocuments()
}

async function fetchPatientDocuments(silent = false) {
  const patientId = detailPatient.value?.id
  if (!patientId) return
  if (!silent) detailLoading.value = true
  try {
    const res = await apiFetch<ApiResponse<PatientDocument[]>>(
      `/api/document-intelligence/patients/${patientId}/documents`,
    )
    if (res.success) detailDocs.value = res.data || []
  } catch {
    if (!silent) $toast.error(t('documentIntelligence.actionError'))
  } finally {
    if (!silent) detailLoading.value = false
  }
}

async function analyzeDocument(doc: PatientDocument) {
  const patientId = detailPatient.value?.id
  if (!patientId) return
  busyDocId.value = doc.id
  try {
    await apiFetch(`/api/patients/${patientId}/attachments/${doc.id}/extraction/reprocess`, {
      method: 'POST',
    })
    $toast.success(t('documentIntelligence.queueSuccess', { count: 1 }))
    await Promise.all([fetchOverview(true), fetchPatientDocuments(true)])
  } catch (err) {
    handleActionError(err)
  } finally {
    busyDocId.value = null
  }
}

async function recordDocument(doc: PatientDocument) {
  const patientId = detailPatient.value?.id
  if (!patientId) return
  busyDocId.value = doc.id
  try {
    await confirmExtractions(patientId, [doc.id])
  } finally {
    busyDocId.value = null
  }
}

function openExtraction(doc: PatientDocument) {
  extractionDoc.value = doc
  extractionOpen.value = true
}

async function onExtractionConfirmed() {
  await Promise.all([fetchOverview(true), fetchPatientDocuments(true)])
}

async function onExtractionUpdated() {
  await Promise.all([fetchOverview(true), fetchPatientDocuments(true)])
}

function handleActionError(err: unknown) {
  const status =
    (err as { response?: { status?: number } })?.response?.status ??
    (err as { status?: number })?.status ??
    (err as { data?: { status?: number } })?.data?.status
  $toast.error(
    status === 503 ? t('documentIntelligence.disabled') : t('documentIntelligence.actionError'),
  )
}

function pendingCount(row: PatientOverview) {
  return row.statusCounts.pending + row.statusCounts.processing
}

function readyCount(row: PatientOverview) {
  return row.statusCounts.completed
}

function failedCount(row: PatientOverview) {
  return row.statusCounts.failed
}

function statusLabel(status: OverviewStatus) {
  return t(`documentIntelligence.status.${status}`)
}

function statusClass(status: OverviewStatus) {
  switch (status) {
    case 'pending':
      return 'asa-pill--amber'
    case 'processing':
      return 'asa-pill--indigo'
    case 'completed':
      return 'asa-pill--teal'
    case 'confirmed':
      return 'asa-pill--green'
    case 'failed':
      return 'asa-pill--rose'
    default:
      return 'di-pill--muted'
  }
}

function docTint(doc: PatientDocument) {
  switch (doc.status) {
    case 'confirmed':
      return 'asa-tint--green'
    case 'completed':
      return 'asa-tint--teal'
    case 'failed':
      return 'asa-tint--rose'
    case 'pending':
    case 'processing':
      return 'asa-tint--amber'
    default:
      return 'asa-tint--indigo'
  }
}

function typeLabel(type: string) {
  const key = `documentIntelligence.types.${type}`
  return te(key) ? t(key) : type
}

function tintFor(id: string) {
  let hash = 0
  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return TINTS[hash % TINTS.length]
}

function initials(patient: PatientOverview['patient']) {
  const first = patient.firstName?.trim()?.[0] ?? ''
  const last = patient.lastName?.trim()?.[0] ?? ''
  return `${first}${last}`.toUpperCase() || '?'
}

function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat(locale.value === 'fa' ? 'fa-IR' : 'en-US', {
    dateStyle: 'medium',
  }).format(date)
}

function formatSize(bytes: number) {
  if (!bytes) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

onMounted(() => {
  fetchOverview()
  pollTimer = setInterval(() => {
    if (!hasActiveJobs.value) return
    fetchOverview(true)
    if (detailOpen.value) fetchPatientDocuments(true)
  }, 5000)
})

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<style scoped>
.di-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.875rem;
}

.di-stat {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem;
}

.di-stat__value {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--asa-label);
}

.di-stat__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.di-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.di-search :deep(.v-field) {
  border-radius: 0.875rem;
}

.di-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.di-chip {
  border: 1px solid var(--asa-card-ring);
  background: transparent;
  color: var(--asa-label-2);
  border-radius: 9999px;
  padding: 0.375rem 0.875rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 180ms var(--ease-premium), color 180ms var(--ease-premium),
    border-color 180ms var(--ease-premium);
}

.di-chip:hover {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  color: var(--asa-label);
}

.di-chip.is-active {
  background: var(--asa-accent);
  border-color: transparent;
  color: #ffffff;
}

.di-list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.di-list-head .asa-sec__label {
  margin-bottom: 0;
}

.di-select-all {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label-2);
  cursor: pointer;
}

.di-select-all input,
.di-check input {
  width: 1.125rem;
  height: 1.125rem;
  accent-color: var(--asa-accent);
  cursor: pointer;
}

.di-patients {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.di-patient {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
}

.di-patient.is-selected {
  border-color: color-mix(in srgb, var(--asa-accent) 55%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--asa-accent) 40%, transparent);
}

.di-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.di-avatar {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.di-patient__main {
  flex: 1 1 260px;
  min-width: 0;
}

.di-patient__title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.di-patient__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--asa-label);
}

.di-patient__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.di-patient__types {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.di-type-pill {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label-2);
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
}

.di-patient__side {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-inline-start: auto;
}

.di-count {
  min-width: 2.5rem;
  text-align: center;
}

.di-count strong {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--asa-label);
}

.di-count span {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--asa-label-2);
}

.di-patient__actions,
.di-doc__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.di-pill--muted {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
}

.di-skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.di-skeleton {
  height: 4.5rem;
  border-radius: 1.25rem;
}

.di-skeleton--sm {
  height: 4rem;
}

.di-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.di-empty--inline {
  padding: 1.5rem 1rem;
}

.di-empty__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.di-empty__sub {
  max-width: 26rem;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.di-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 88vh;
  overflow: hidden;
  background: var(--asa-bg-card);
}

.di-dialog__identity {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.di-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
  color: var(--asa-label-2);
  transition: background 160ms var(--ease-premium), color 160ms var(--ease-premium);
}

.di-close:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.di-dialog__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.di-dialog__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.di-dialog__foot {
  display: flex;
  justify-content: flex-end;
}

.di-doc-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.di-doc {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  flex-wrap: wrap;
  padding: 0.875rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 2.5%, transparent);
}

.di-doc__main {
  flex: 1 1 220px;
  min-width: 0;
}

.di-doc__name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  word-break: break-word;
}

.di-doc__meta {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.di-doc__error {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  color: var(--asa-rose);
}

.di-doc__side {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-inline-start: auto;
}

.di-doc__tests {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

@media (max-width: 720px) {
  .di-patient__side {
    margin-inline-start: 0;
    width: 100%;
    justify-content: space-between;
  }

  .di-doc__side {
    margin-inline-start: 0;
    width: 100%;
  }
}
</style>
