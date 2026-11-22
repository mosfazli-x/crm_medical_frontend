<template>
  <section class="asa-card lab-panel" :aria-label="t('labResults.sectionTitle')">
    <!-- ─── Header ─── -->
    <header class="lab-head">
      <div class="lab-head__copy">
        <span class="lab-head__icon" aria-hidden="true">
          <Microscope class="w-4! h-4! fill-current" />
        </span>
        <div class="min-w-0">
          <div class="lab-head__titleline">
            <h2 class="lab-head__title">{{ t('labResults.sectionTitle') }}</h2>
            <span class="asa-pill asa-pill--teal">
              {{ t('labResults.resultsCount', { count: toPersianNum(results.length) }) }}
            </span>
            <span v-if="abnormalTotal" class="asa-pill asa-pill--rose">
              {{ t('labResults.abnormalCount', { count: toPersianNum(abnormalTotal) }) }}
            </span>
          </div>
          <p class="lab-head__sub">
            {{ t('labResults.summary', { count: toPersianNum(results.length), abnormal: toPersianNum(abnormalTotal) }) }}
          </p>
        </div>
      </div>

      <div class="lab-head__actions">
        <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="showDocuments">
          <FolderOpen class="w-4! h-4! fill-current" />
          <span class="lab-hide-sm">{{ t('labResults.tabDocuments') }}</span>
          <span class="lab-head__count">{{ toPersianNum(documents.length) }}</span>
        </button>
        <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="emit('add-result')">
          <Plus class="w-4! h-4! fill-current" />
          {{ t('labResults.addLabResult') }}
        </button>
      </div>
    </header>

    <!-- ─── Tabs + search + view toggle ─── -->
    <div class="lab-toolbar">
      <div class="lab-tabs" role="tablist" :aria-label="t('labResults.sectionTitle')">
        <button
          type="button"
          role="tab"
          class="lab-tab"
          :class="{ 'lab-tab--on': activeTab === 'results' }"
          :aria-selected="activeTab === 'results'"
          @click="activeTab = 'results'"
        >
          <Microscope class="w-3.5! h-3.5! fill-current" />
          {{ t('labResults.tabResults') }}
          <span class="lab-tab__count">{{ toPersianNum(results.length) }}</span>
        </button>
        <button
          type="button"
          role="tab"
          class="lab-tab"
          :class="{ 'lab-tab--on': activeTab === 'documents' }"
          :aria-selected="activeTab === 'documents'"
          @click="activeTab = 'documents'"
        >
          <FolderOpen class="w-3.5! h-3.5! fill-current" />
          {{ t('labResults.tabDocuments') }}
          <span class="lab-tab__count">{{ toPersianNum(documents.length) }}</span>
        </button>
      </div>

      <label class="lab-search">
        <v-icon size="15" aria-hidden="true">mdi-magnify</v-icon>
        <input
          v-model="query"
          type="search"
          class="lab-search__input"
          :placeholder="t('labResults.searchTests')"
          :aria-label="t('labResults.searchTests')"
        >
        <button
          v-if="query"
          type="button"
          class="lab-search__clear"
          :aria-label="t('common.clear')"
          @click="query = ''"
        >
          <X class="w-3.5! h-3.5! fill-current" />
        </button>
      </label>

      <div v-if="activeTab === 'results'" class="lab-seg" role="group" :aria-label="t('labResults.tabResults')">
        <button
          type="button"
          class="lab-seg__btn"
          :class="{ 'lab-seg__btn--on': latestOnly }"
          :aria-pressed="latestOnly"
          @click="latestOnly = true"
        >
          {{ t('labResults.latestOnly') }}
        </button>
        <button
          type="button"
          class="lab-seg__btn"
          :class="{ 'lab-seg__btn--on': !latestOnly }"
          :aria-pressed="!latestOnly"
          @click="latestOnly = false"
        >
          {{ t('labResults.allResults') }}
        </button>
      </div>
    </div>

    <!-- ─── Category filter chips ─── -->
    <div v-if="activeTab === 'results'" class="lab-chips" role="group" :aria-label="t('labResults.categories.all')">
      <button
        v-for="chip in categoryChips"
        :key="chip.key"
        type="button"
        class="lab-chip"
        :class="{ 'lab-chip--on': categoryFilter === chip.key }"
        :aria-pressed="categoryFilter === chip.key"
        @click="categoryFilter = chip.key"
      >
        <span v-if="chip.key !== 'all'" class="lab-chip__dot" :style="{ backgroundColor: chip.color }" aria-hidden="true" />
        {{ chip.label }}
        <span class="lab-chip__count">{{ toPersianNum(chip.count) }}</span>
      </button>
    </div>

    <!-- ─── Body ─── -->
    <div class="lab-body">
      <!-- RESULTS -->
      <template v-if="activeTab === 'results'">
        <div v-if="loading" class="lab-skel">
          <div v-for="i in 7" :key="`sk-${i}`" class="lab-skel__row">
            <div class="asa-skel h-3.5! w-1/3! rounded-md!" />
            <div class="asa-skel h-3.5! w-16! rounded-md!" />
            <div class="asa-skel h-3.5! w-24! rounded-md!" />
            <div class="asa-skel h-5! w-14! rounded-full!" />
          </div>
        </div>

        <div v-else-if="!results.length" class="lab-empty">
          <span class="asa-tint asa-tint--indigo" aria-hidden="true">
            <ClipboardX class="w-6! h-6! fill-current" />
          </span>
          <div class="min-w-0">
            <p class="lab-empty__title">{{ t('labResults.noResultsPatientTitle') }}</p>
            <p class="lab-empty__desc">{{ t('labResults.noResultsPatientDesc') }}</p>
          </div>
          <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="emit('add-result')">
            <Plus class="w-4! h-4! fill-current" />
            {{ t('labResults.addLabResult') }}
          </button>
        </div>

        <div v-else-if="!groups.length" class="lab-empty">
          <span class="asa-tint asa-tint--amber" aria-hidden="true">
            <v-icon size="24">mdi-filter-off-outline</v-icon>
          </span>
          <div class="min-w-0">
            <p class="lab-empty__title">{{ t('labResults.noSearchResults') }}</p>
            <p class="lab-empty__desc">{{ t('labResults.noSearchResultsDesc') }}</p>
          </div>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="resetFilters">
            {{ t('labResults.clearFilters') }}
          </button>
        </div>

        <template v-else>
          <div class="lab-cols" aria-hidden="true">
            <span>{{ t('labResults.biomarkerTest') }}</span>
            <span>{{ t('labResults.reportedValue') }}</span>
            <span>{{ t('labResults.referenceRange') }}</span>
            <span>{{ t('labResults.clinicalStatus') }}</span>
            <span />
          </div>

          <section v-for="group in groups" :key="group.key" class="lab-group">
            <header class="lab-group__head">
              <span class="lab-group__dot" :style="{ backgroundColor: group.color }" aria-hidden="true" />
              <h3 class="lab-group__name">{{ group.label }}</h3>
              <span class="lab-group__count">{{ toPersianNum(group.items.length) }}</span>
              <span v-if="group.abnormal" class="asa-pill asa-pill--rose">
                {{ t('labResults.abnormalShort', { count: toPersianNum(group.abnormal) }) }}
              </span>
            </header>

            <ul class="lab-rows">
              <li
                v-for="row in group.items"
                :key="row.id"
                class="lab-row"
                :class="`lab-row--${row._status}`"
              >
                <div class="lab-row__test">
                  <span class="lab-row__name">{{ row.testName }}</span>
                  <span class="lab-row__meta">
                    {{ formatJalaliDate(row.performedDate) }}
                    <template v-if="row.notes"> · {{ row.notes }}</template>
                  </span>
                </div>

                <div class="lab-row__value">
                  <span class="lab-row__num">{{ displayValue(row) }}</span>
                  <span v-if="row.unit" class="lab-row__unit">{{ row.unit }}</span>
                </div>

                <div class="lab-row__range">
                  <div
                    class="lab-range"
                    role="img"
                    :aria-label="`${t('labResults.referenceRange')}: ${row._range.label}`"
                  >
                    <span
                      v-if="row._range.lowPct !== null"
                      class="lab-range__band"
                      :style="{ insetInlineStart: `${row._range.lowPct}%`, width: `${row._range.highPct - row._range.lowPct}%` }"
                    />
                    <span
                      v-if="row._range.markerPct !== null"
                      class="lab-range__marker"
                      :class="`lab-range__marker--${row._status}`"
                      :style="{ insetInlineStart: `${row._range.markerPct}%` }"
                    />
                  </div>
                  <span class="lab-row__range-text">{{ row._range.label }}</span>
                </div>

                <div class="lab-row__status">
                  <span class="lab-badge" :class="`lab-badge--${row._status}`">{{ statusLabel(row._status) }}</span>
                  <span
                    v-if="row._history > 1"
                    class="lab-row__history"
                    :title="t('labResults.historyCount', { count: toPersianNum(row._history) })"
                  >
                    {{ toPersianNum(row._history) }}×
                  </span>
                </div>

                <div class="lab-row__actions">
                  <button
                    type="button"
                    class="lab-icon"
                    :aria-label="t('labResults.trendAnalysis')"
                    :title="t('labResults.trendAnalysis')"
                    @click="emit('trend', row)"
                  >
                    <LineChart class="w-4! h-4! fill-current" />
                  </button>
                  <button
                    type="button"
                    class="lab-icon lab-icon--danger"
                    :aria-label="t('labResults.deleteRecord')"
                    :title="t('labResults.deleteRecord')"
                    @click="emit('remove', row)"
                  >
                    <Trash2 class="w-4! h-4! fill-current" />
                  </button>
                </div>
              </li>
            </ul>
          </section>

          <p class="lab-foot-note">{{ t('labResults.footNote') }}</p>
        </template>
      </template>

      <!-- DOCUMENTS -->
      <template v-else>
        <div v-if="loadingDocs" class="lab-skel">
          <div v-for="i in 4" :key="`docsk-${i}`" class="lab-skel__row">
            <div class="asa-skel h-9! w-9! rounded-xl!" />
            <div class="asa-skel h-3.5! w-1/2! rounded-md!" />
            <div class="asa-skel h-5! w-14! rounded-full!" />
          </div>
        </div>

        <div v-else-if="!documents.length" class="lab-empty">
          <span class="asa-tint asa-tint--amber" aria-hidden="true">
            <FileUp class="w-6! h-6! fill-current" />
          </span>
          <div class="min-w-0">
            <p class="lab-empty__title">{{ t('labResults.documentsEmpty') }}</p>
            <p class="lab-empty__desc">{{ t('labResults.noDocsDesc') }}</p>
          </div>
          <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="emit('add-document')">
            <v-icon size="15">mdi-upload</v-icon>
            {{ t('labResults.uploadNewDocument') }}
          </button>
        </div>

        <template v-else>
          <div class="lab-docs-bar">
            <p class="lab-docs-bar__count">
              {{ t('labResults.documentsCount', { count: toPersianNum(filteredDocuments.length) }) }}
            </p>
            <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="emit('add-document')">
              <v-icon size="15">mdi-upload</v-icon>
              {{ t('labResults.uploadNewDocument') }}
            </button>
          </div>

          <ul v-if="filteredDocuments.length" class="lab-docs">
            <li v-for="doc in filteredDocuments" :key="doc.id" class="lab-doc">
              <span class="lab-doc__ic" aria-hidden="true">
                <FileText class="w-4! h-4! fill-current" />
              </span>

              <div class="lab-doc__body">
                <p class="lab-doc__name" :title="doc.fileName">{{ doc.fileName }}</p>
                <p class="lab-doc__meta">
                  <span class="asa-pill asa-pill--teal">{{ documentTypeLabel(doc.fileType) }}</span>
                  <span>{{ formatJalaliDate(doc.createdAt) }}</span>
                  <span v-if="doc.fileSize">{{ formatSize(doc.fileSize) }}</span>
                  <span
                    v-if="doc.extractionStatus"
                    class="asa-pill"
                    :class="extractionStatusPill(doc.extractionStatus)"
                  >
                    {{ extractionStatusLabel(doc.extractionStatus) }}
                  </span>
                </p>
              </div>

              <div class="lab-doc__acts">
                <button
                  v-if="isExtractableDocument(doc)"
                  type="button"
                  class="asa-btn asa-btn--ghost asa-btn--sm lab-doc__extract"
                  @click="emit('extract', doc)"
                >
                  <Microscope class="w-3.5! h-3.5! fill-current" />
                  {{ t('labResults.extraction.open') }}
                </button>
                <button type="button" class="lab-icon" :aria-label="t('labResults.viewDoc')" :title="t('labResults.viewDoc')" @click="emit('view', doc)">
                  <Eye class="w-4! h-4! fill-current" />
                </button>
                <button type="button" class="lab-icon" :aria-label="t('labResults.downloadDoc')" :title="t('labResults.downloadDoc')" @click="emit('download', doc)">
                  <Download class="w-4! h-4! fill-current" />
                </button>
                <button type="button" class="lab-icon lab-icon--danger" :aria-label="t('labResults.documentDeleteTitle')" :title="t('labResults.documentDeleteTitle')" @click="emit('remove-document', doc)">
                  <Trash2 class="w-4! h-4! fill-current" />
                </button>
              </div>
            </li>
          </ul>

          <div v-else class="lab-empty lab-empty--soft">
            <span class="asa-tint asa-tint--amber" aria-hidden="true">
              <v-icon size="22">mdi-file-search-outline</v-icon>
            </span>
            <div class="min-w-0">
              <p class="lab-empty__title">{{ t('labResults.noSearchResults') }}</p>
              <p class="lab-empty__desc">{{ t('labResults.noSearchResultsDesc') }}</p>
            </div>
          </div>
        </template>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Microscope from '~/components/icons/Microscope.vue'
import ClipboardX from '~/components/icons/ClipboardX.vue'
import Plus from '~/components/icons/Plus.vue'
import LineChart from '~/components/icons/LineChart.vue'
import Trash2 from '~/components/icons/Trash2.vue'
import FolderOpen from '~/components/icons/FolderOpen.vue'
import FileUp from '~/components/icons/FileUp.vue'
import FileText from '~/components/icons/FileText.vue'
import Eye from '~/components/icons/Eye.vue'
import Download from '~/components/icons/Download.vue'
import X from '~/components/icons/X.vue'

interface LabResultRow {
  id: string
  category?: string | null
  testName?: string | null
  testCode?: string | null
  value?: string | number | null
  unit?: string | null
  referenceRangeLow?: string | number | null
  referenceRangeHigh?: string | number | null
  reference_range_low?: string | number | null
  reference_range_high?: string | number | null
  isAbnormal?: boolean | null
  performedDate?: string | null
  notes?: string | null
}

interface AttachmentDoc {
  id: string
  fileName: string
  fileType: string
  fileSize?: number | null
  mimeType?: string | null
  createdAt?: string | null
  extractionStatus?: string | null
}

const props = defineProps<{
  results: LabResultRow[]
  documents: AttachmentDoc[]
  loading?: boolean
  loadingDocs?: boolean
}>()

const emit = defineEmits<{
  (e: 'add-result'): void
  (e: 'add-document'): void
  (e: 'trend', row: LabResultRow): void
  (e: 'remove', row: LabResultRow): void
  (e: 'view', doc: AttachmentDoc): void
  (e: 'download', doc: AttachmentDoc): void
  (e: 'remove-document', doc: AttachmentDoc): void
  (e: 'extract', doc: AttachmentDoc): void
}>()

const { t } = useI18n()
const { toPersianNum } = useLang()

type Status = 'normal' | 'low' | 'high' | 'abnormal' | 'unknown'

const activeTab = ref<'results' | 'documents'>('results')
const latestOnly = ref(true)
const query = ref('')
const categoryFilter = ref('all')

const CATEGORY_ORDER = [
  'hormone', 'hematology', 'biochemistry', 'tumor_marker',
  'microbiology', 'urinalysis', 'genetics', 'cytology',
  'pathology', 'molecular', 'other',
]

const CATEGORY_COLORS: Record<string, string> = {
  hormone: '#7f86d9',
  hematology: '#d97878',
  biochemistry: '#2aa7a0',
  tumor_marker: '#c9954d',
  microbiology: '#d98a4d',
  urinalysis: '#5fae7f',
  genetics: '#7f86d9',
  cytology: '#2aa7a0',
  pathology: '#d97878',
  molecular: '#5fae7f',
  other: '#94a3b8',
}

function num(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function lowOf(row: LabResultRow) {
  return num(row.referenceRangeLow ?? row.reference_range_low)
}

function highOf(row: LabResultRow) {
  return num(row.referenceRangeHigh ?? row.reference_range_high)
}

function resultStatus(row: LabResultRow): Status {
  const value = num(row.value)
  const low = lowOf(row)
  const high = highOf(row)

  if (value !== null) {
    if (low !== null && high !== null) {
      if (value < low) return 'low'
      if (value > high) return 'high'
      return 'normal'
    }
    if (low !== null) return value < low ? 'low' : 'normal'
    if (high !== null) return value > high ? 'high' : 'normal'
  }

  if (row.isAbnormal === true) return 'abnormal'
  if (row.isAbnormal === false) return 'normal'
  return 'unknown'
}

function isAbnormalStatus(status: Status): boolean {
  return status === 'low' || status === 'high' || status === 'abnormal'
}

function decorate(row: LabResultRow) {
  const key = String(row.testName || '').trim().toLowerCase()
  const value = num(row.value)
  const low = lowOf(row)
  const high = highOf(row)

  let lowPct: number | null = null
  let highPct: number | null = null
  let markerPct: number | null = null

  if (low !== null || high !== null) {
    const domainLow = low !== null && high !== null
      ? low - Math.max(high - low, Math.abs(high) * 0.1, 1) * 0.4
      : 0
    const domainHigh = high !== null && low !== null
      ? high + Math.max(high - low, Math.abs(high) * 0.1, 1) * 0.4
      : high !== null
        ? Math.max(high * 1.6, high + 1)
        : Math.max((low ?? 0) * 1.6, (low ?? 0) + 1)

    const span = domainHigh - domainLow || 1
    const toPct = (v: number) => Math.min(100, Math.max(0, ((v - domainLow) / span) * 100))

    lowPct = low !== null ? toPct(low) : 0
    highPct = high !== null ? toPct(high) : 100
    if (value !== null) markerPct = Math.min(97, Math.max(3, toPct(value)))
  }

  const rangeLabel = low !== null && high !== null
    ? `${low} – ${high}`
    : high !== null
      ? `≤ ${high}`
      : low !== null
        ? `≥ ${low}`
        : t('labResults.statusUnknown')

  return {
    ...row,
    _testKey: key,
    _status: resultStatus(row),
    _history: historyCounts.value.get(key) ?? 1,
    _range: {
      lowPct,
      highPct,
      markerPct,
      label: rangeLabel,
    },
  }
}

const historyCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const row of props.results) {
    const key = String(row.testName || '').trim().toLowerCase()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
})

const latestRows = computed<LabResultRow[]>(() => {
  const map = new Map<string, LabResultRow>()
  for (const row of props.results) {
    const key = String(row.testName || '').trim().toLowerCase()
    const existing = map.get(key)
    if (!existing) {
      map.set(key, row)
      continue
    }
    const a = new Date(row.performedDate || 0).getTime()
    const b = new Date(existing.performedDate || 0).getTime()
    if (a > b) map.set(key, row)
  }
  return [...map.values()]
})

const baseRows = computed(() => (latestOnly.value ? latestRows.value : props.results))

const abnormalTotal = computed(
  () => props.results.filter((row) => isAbnormalStatus(resultStatus(row))).length,
)

function categoryLabel(key: string | null | undefined): string {
  if (!key) return t('labResults.categories.other')
  const i18nKey = `labResults.categories.${key}`
  const label = t(i18nKey)
  return label === i18nKey ? key : label
}

const categoryChips = computed(() => {
  const counts = new Map<string, number>()
  for (const row of baseRows.value) {
    const key = row.category || 'other'
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const present = CATEGORY_ORDER.filter((key) => counts.has(key))
  for (const key of counts.keys()) {
    if (!present.includes(key)) present.push(key)
  }

  return [
    { key: 'all', label: t('labResults.categories.all'), count: baseRows.value.length, color: '' },
    ...present.map((key) => ({
      key,
      label: categoryLabel(key),
      count: counts.get(key) ?? 0,
      color: CATEGORY_COLORS[key] || '#94a3b8',
    })),
  ]
})

const searchTerm = computed(() => query.value.trim().toLowerCase())

const filteredRows = computed(() => {
  let rows = baseRows.value
  if (categoryFilter.value !== 'all') {
    rows = rows.filter((row) => (row.category || 'other') === categoryFilter.value)
  }
  if (searchTerm.value) {
    rows = rows.filter((row) => {
      const haystack = [row.testName, row.testCode, categoryLabel(row.category)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(searchTerm.value)
    })
  }
  return rows.map(decorate)
})

const groups = computed(() => {
  const buckets = new Map<string, typeof filteredRows.value>()
  for (const row of filteredRows.value) {
    const key = row.category || 'other'
    const list = buckets.get(key) ?? []
    list.push(row)
    buckets.set(key, list)
  }

  const order = [...CATEGORY_ORDER]
  for (const key of buckets.keys()) if (!order.includes(key)) order.push(key)

  return order
    .filter((key) => buckets.has(key))
    .map((key) => {
      const items = [...(buckets.get(key) ?? [])].sort((a, b) =>
        String(a.testName || '').localeCompare(String(b.testName || ''), 'fa'),
      )
      return {
        key,
        label: categoryLabel(key),
        color: CATEGORY_COLORS[key] || '#94a3b8',
        items,
        abnormal: items.filter((row) => isAbnormalStatus(row._status)).length,
      }
    })
})

const filteredDocuments = computed(() => {
  if (!searchTerm.value) return props.documents
  return props.documents.filter((doc) => {
    const haystack = [doc.fileName, documentTypeLabel(doc.fileType)].filter(Boolean).join(' ').toLowerCase()
    return haystack.includes(searchTerm.value)
  })
})

function resetFilters() {
  query.value = ''
  categoryFilter.value = 'all'
  latestOnly.value = true
}

function showDocuments() {
  activeTab.value = 'documents'
  query.value = ''
}

function displayValue(row: LabResultRow): string {
  if (row.value === null || row.value === undefined || row.value === '') return '—'
  return String(row.value)
}

function statusLabel(status: Status): string {
  const map: Record<Status, string> = {
    normal: 'labResults.statusNormal',
    low: 'labResults.statusLow',
    high: 'labResults.statusHigh',
    abnormal: 'labResults.statusAbnormal',
    unknown: 'labResults.statusUnknown',
  }
  return t(map[status])
}

function formatJalaliDate(date: string | null | undefined): string {
  if (!date) return '—'
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
  } catch {
    return '—'
  }
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return ''
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${sizes[i]}`
}

function documentTypeLabel(type: string | null | undefined): string {
  if (!type) return '—'
  const i18nKey = `labResults.docTypes.${type}`
  const label = t(i18nKey)
  if (label !== i18nKey) return label
  return categoryLabel(type)
}

function extractionStatusLabel(status: string): string {
  return t(`labResults.extraction.status.${status}`)
}

function extractionStatusPill(status: string): string {
  switch (status) {
    case 'completed':
      return 'asa-pill--green'
    case 'confirmed':
      return 'asa-pill--teal'
    case 'failed':
      return 'asa-pill--rose'
    case 'processing':
      return 'asa-pill--amber'
    default:
      return ''
  }
}

function isExtractableDocument(doc: AttachmentDoc): boolean {
  const mimeType = String(doc?.mimeType || '')
  const fileName = String(doc?.fileName || '').toLowerCase()
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    /\.(jpe?g|png|webp|gif|bmp|pdf)$/.test(fileName)
  )
}

watch(categoryChips, (chips) => {
  if (categoryFilter.value !== 'all' && !chips.some((chip) => chip.key === categoryFilter.value)) {
    categoryFilter.value = 'all'
  }
})

defineExpose({ showDocuments, showResults: () => (activeTab.value = 'results') })
</script>

<style scoped>
.lab-panel {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1 1 auto;
}

/* ─── Head ─── */
.lab-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem 0.875rem;
}

.lab-head__copy {
  display: flex;
  align-items: center;
  gap: 0.6875rem;
  min-width: 0;
}

.lab-head__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.375rem;
  height: 2.375rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.lab-head__titleline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.lab-head__title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
}

.lab-head__sub {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.lab-head__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.lab-head__count {
  padding: 0 0.3125rem;
  border-radius: 0.3125rem;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  font-family: ui-monospace, monospace;
  font-size: 0.625rem;
  font-weight: 700;
}

/* ─── Toolbar ─── */
.lab-toolbar {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  padding: 0.625rem 1.25rem;
  border-top: 1px solid var(--asa-sep);
  border-bottom: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 2.5%, transparent);
}

.lab-tabs {
  display: inline-flex;
  padding: 0.1875rem;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  gap: 0.125rem;
}

.lab-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.3125rem 0.625rem;
  border: none;
  border-radius: 0.4375rem;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms var(--ease-default), color 150ms var(--ease-default);
}

.lab-tab--on {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
}

.lab-tab__count {
  padding: 0 0.25rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  font-family: ui-monospace, monospace;
  font-size: 0.5625rem;
  font-weight: 700;
}

.lab-search {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex: 1 1 10rem;
  min-width: 7rem;
  max-width: 18rem;
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.5625rem;
  background: var(--asa-bg-card);
  color: var(--asa-label-3);
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.lab-search:focus-within {
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 3px var(--asa-accent-soft);
}

.lab-search__input {
  flex: 1 1 auto;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--asa-label);
  font-family: inherit;
  font-size: 0.75rem;
}

.lab-search__input::placeholder {
  color: var(--asa-label-3);
}

.lab-search__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--asa-label-3);
  cursor: pointer;
}

.lab-seg {
  display: inline-flex;
  margin-inline-start: auto;
  padding: 0.1875rem;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  gap: 0.125rem;
}

.lab-seg__btn {
  padding: 0.3125rem 0.625rem;
  border: none;
  border-radius: 0.4375rem;
  background: transparent;
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 150ms var(--ease-default), color 150ms var(--ease-default);
}

.lab-seg__btn--on {
  background: var(--asa-bg-card);
  color: var(--asa-label);
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
}

/* ─── Chips ─── */
.lab-chips {
  display: flex;
  gap: 0.375rem;
  padding: 0.5rem 1.25rem;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--asa-sep);
}

.lab-chips::-webkit-scrollbar {
  display: none;
}

.lab-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  flex-shrink: 0;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--asa-sep);
  border-radius: 0.5rem;
  background: var(--asa-bg-card);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 150ms var(--ease-default), background 150ms var(--ease-default), color 150ms var(--ease-default);
}

.lab-chip:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 40%, transparent);
  color: var(--asa-label);
}

.lab-chip--on {
  border-color: color-mix(in srgb, var(--asa-accent) 45%, transparent);
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.lab-chip__dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
}

.lab-chip__count {
  padding: 0 0.25rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  font-family: ui-monospace, monospace;
  font-size: 0.5625rem;
  font-weight: 700;
}

/* ─── Body ─── */
.lab-body {
  flex: 1 1 auto;
  min-height: 0;
  max-height: clamp(16rem, 44vh, 32rem);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.lab-cols,
.lab-row {
  display: grid;
  grid-template-columns: minmax(8rem, 1.5fr) 7rem minmax(8rem, 1.1fr) 6.5rem 4.25rem;
  align-items: center;
  gap: 0.75rem;
}

.lab-cols {
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid var(--asa-sep);
  background: var(--asa-bg-card);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--asa-label-3);
}

.lab-group__head {
  position: sticky;
  top: 2rem;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.4375rem;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 4%, var(--asa-bg-card));
}

.lab-group__dot {
  width: 0.4375rem;
  height: 0.4375rem;
  flex-shrink: 0;
  border-radius: 9999px;
}

.lab-group__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--asa-label);
}

.lab-group__count {
  padding: 0 0.3125rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  font-family: ui-monospace, monospace;
  font-size: 0.5625rem;
  font-weight: 700;
  color: var(--asa-label-2);
}

.lab-rows {
  list-style: none;
}

.lab-row {
  position: relative;
  padding: 0.5rem 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--asa-sep) 55%, transparent);
  transition: background 120ms var(--ease-default);
}

.lab-row:hover {
  background: color-mix(in srgb, var(--asa-accent) 4%, transparent);
}

.lab-row--low,
.lab-row--high,
.lab-row--abnormal {
  border-inline-start: 3px solid var(--asa-rose);
  background: color-mix(in srgb, var(--asa-rose) 5%, transparent);
}

.lab-row--low {
  border-inline-start-color: var(--asa-amber);
  background: color-mix(in srgb, var(--asa-amber) 5%, transparent);
}

.lab-row__test {
  min-width: 0;
}

.lab-row__name {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.lab-row__meta {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.625rem;
  color: var(--asa-label-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lab-row__value {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  min-width: 0;
}

.lab-row__num {
  font-family: ui-monospace, monospace;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.lab-row__unit {
  font-family: ui-monospace, monospace;
  font-size: 0.625rem;
  color: var(--asa-label-3);
}

.lab-row__range {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.lab-range {
  position: relative;
  width: 100%;
  height: 0.375rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-label) 9%, transparent);
}

.lab-range__band {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--asa-green) 42%, transparent);
}

.lab-range__marker {
  position: absolute;
  top: 50%;
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  background: var(--asa-label);
  box-shadow: 0 0 0 2px var(--asa-bg-card);
}

[dir='rtl'] .lab-range__marker {
  transform: translate(50%, -50%);
}

.lab-range__marker--high,
.lab-range__marker--abnormal {
  background: var(--asa-rose);
}

.lab-range__marker--low {
  background: var(--asa-amber);
}

.lab-range__marker--unknown {
  display: none;
}

.lab-row__range-text {
  font-family: ui-monospace, monospace;
  font-size: 0.625rem;
  color: var(--asa-label-3);
  white-space: nowrap;
}

.lab-row__status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

.lab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.1875rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.625rem;
  font-weight: 700;
  white-space: nowrap;
}

.lab-badge--normal {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.lab-badge--low {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.lab-badge--high,
.lab-badge--abnormal {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.lab-badge--unknown {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label-3);
}

.lab-row__history {
  font-family: ui-monospace, monospace;
  font-size: 0.5625rem;
  font-weight: 700;
  color: var(--asa-label-3);
}

.lab-row__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.125rem;
  opacity: 0;
  transition: opacity 120ms var(--ease-default);
}

.lab-row:hover .lab-row__actions,
.lab-row:focus-within .lab-row__actions {
  opacity: 1;
}

.lab-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 0.4375rem;
  background: transparent;
  color: var(--asa-label-3);
  cursor: pointer;
  transition: background 120ms var(--ease-default), color 120ms var(--ease-default);
}

.lab-icon:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.lab-icon--danger:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.lab-foot-note {
  padding: 0.625rem 1.25rem 0.875rem;
  font-size: 0.625rem;
  line-height: 1.6;
  color: var(--asa-label-3);
}

/* ─── Empty / skeleton ─── */
.lab-empty {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
}

.lab-empty--soft {
  padding: 1rem 1.25rem;
}

.lab-empty__title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--asa-label);
}

.lab-empty__desc {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.lab-empty > .asa-btn {
  margin-inline-start: auto;
  flex-shrink: 0;
}

.lab-skel {
  padding: 0.75rem 1.25rem;
}

.lab-skel__row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.lab-skel__row > :nth-child(2) {
  margin-inline-start: auto;
}

/* ─── Documents ─── */
.lab-docs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.625rem 1.25rem;
  border-bottom: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.lab-docs-bar__count {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.lab-docs {
  list-style: none;
}

.lab-doc {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--asa-sep) 55%, transparent);
  transition: background 120ms var(--ease-default);
}

.lab-doc:hover {
  background: color-mix(in srgb, var(--asa-accent) 4%, transparent);
}

.lab-doc__ic {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border-radius: 0.5rem;
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.lab-doc__body {
  flex: 1 1 auto;
  min-width: 0;
}

.lab-doc__name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lab-doc__meta {
  display: flex;
  align-items: center;
  gap: 0.4375rem;
  flex-wrap: wrap;
  margin-top: 0.1875rem;
  font-size: 0.625rem;
  color: var(--asa-label-3);
}

.lab-doc__acts {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
}

.lab-doc__extract {
  margin-inline-end: 0.25rem;
}

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .lab-cols {
    display: none;
  }

  .lab-row {
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-areas:
      'test status'
      'value range'
      'actions actions';
    gap: 0.25rem 0.75rem;
    padding: 0.625rem 1rem;
  }

  .lab-row__test {
    grid-area: test;
  }

  .lab-row__value {
    grid-area: value;
    align-self: end;
  }

  .lab-row__range {
    grid-area: range;
    align-self: end;
  }

  .lab-row__status {
    grid-area: status;
    justify-content: flex-end;
    align-self: start;
  }

  .lab-row__actions {
    grid-area: actions;
    opacity: 1;
    justify-content: flex-end;
    margin-top: 0.125rem;
  }

  .lab-group__head {
    top: 0;
  }

  .lab-row__range-text {
    text-align: end;
  }

  .lab-doc {
    flex-wrap: wrap;
  }

  .lab-doc__acts {
    width: 100%;
    justify-content: flex-end;
  }

  .lab-hide-sm {
    display: none;
  }
}

@media (max-width: 560px) {
  .lab-head,
  .lab-toolbar,
  .lab-chips,
  .lab-row,
  .lab-cols,
  .lab-group__head,
  .lab-docs-bar,
  .lab-doc,
  .lab-skel,
  .lab-empty,
  .lab-foot-note {
    padding-inline: 0.875rem;
  }

  .lab-seg {
    margin-inline-start: 0;
    width: 100%;
  }

  .lab-seg__btn {
    flex: 1;
  }

  .lab-search {
    max-width: none;
  }

  .lab-empty {
    flex-wrap: wrap;
  }

  .lab-empty > .asa-btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lab-tab,
  .lab-seg__btn,
  .lab-chip,
  .lab-row,
  .lab-doc,
  .lab-icon {
    transition: none;
  }
}
</style>
