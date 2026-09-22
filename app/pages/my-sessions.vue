<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('mySessions.title') }}</h1>
        <p class="dash-head__date">{{ t('mySessions.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button class="asa-btn asa-btn--ghost" :disabled="loading" :aria-label="t('mySessions.title')"
          @click="refreshAll">
          <v-icon size="16" :class="{ 'pf-spin': loading }">mdi-refresh</v-icon>
        </button>
      </div>
    </header>

    <!-- ─── Summary metrics ─── -->
    <div v-if="!summary" class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
      <div v-for="i in 3" :key="`ms-${i}`" class="asa-skel rounded-[22px]! h-28!" />
    </div>
    <div v-else class="grid! grid-cols-1! min-[520px]:grid-cols-3! gap-3! sm:gap-4!">
      <div class="asa-card pf-metric">
        <div class="asa-tint asa-tint--teal">
          <Clock class="w-5! h-5! fill-current" />
        </div>
        <div class="pf-metric__copy">
          <p class="pf-metric__value">{{ summary.totalLogins || 0 }}</p>
          <p class="pf-metric__label">{{ t('mySessions.totalLogins') }}</p>
        </div>
      </div>

      <div class="asa-card pf-metric">
        <div class="asa-tint asa-tint--green">
          <Activity class="w-5! h-5! fill-current" />
        </div>
        <div class="pf-metric__copy">
          <p class="pf-metric__value asa-green">{{ summary.activeSessions || 0 }}</p>
          <p class="pf-metric__label">{{ t('mySessions.activeSessions') }}</p>
        </div>
      </div>

      <div class="asa-card pf-metric">
        <div class="asa-tint asa-tint--amber">
          <Calendar class="w-5! h-5! fill-current" />
        </div>
        <div class="pf-metric__copy">
          <p class="pf-metric__value pf-metric__value--sm">{{ summary.lastLogin ? formatDateTime(summary.lastLogin) :
            '---' }}
          </p>
          <p class="pf-metric__label">{{ t('mySessions.lastLogin') }}</p>
        </div>
      </div>
    </div>

    <!-- ─── Sessions table card ─── -->
    <div class="asa-card pf-table-card mt-5!">
      <div v-if="loading" class="pf-skel">
        <div v-for="i in 6" :key="`sk-${i}`" class="pf-skel__row">
          <div class="asa-skel h-4! w-32! rounded-md!" />
          <div class="asa-skel h-4! w-44! rounded-md!" />
          <div class="asa-skel h-4! w-24! rounded-md!" />
        </div>
      </div>

      <div v-else-if="sessions.length === 0" class="pf-empty">
        <div class="asa-tint asa-tint--indigo pf-tint-lg">
          <ShieldCheck class="w-6! h-6! fill-current" />
        </div>
        <div>
          <p class="pf-empty__title">{{ t('mySessions.noSessions') }}</p>
          <p class="pf-empty__desc">{{ t('mySessions.noSessionsDesc') }}</p>
        </div>
      </div>

      <div v-else class="asa-table-wrap">
        <table class="asa-table pf-table">
          <thead>
            <tr>
              <th class="pf-pl0"></th>
              <th v-for="col in sortableColumns" :key="col.key" :aria-sort="sortAria(col.key)">
                <button type="button" class="pf-th-btn" :class="{ 'pf-th-btn--active': sortKey === col.key }"
                  @click="toggleSort(col.key)">
                  <span>{{ col.label }}</span>
                  <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === col.key }]">
                    {{ sortIndicator(col.key) }}
                  </v-icon>
                </button>
              </th>
              <th class="pf-ta-end"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="session in sortedSessions" :key="session.id" class="pf-row-tr"
              :class="{ 'pf-row-tr--current': isCurrentSession(session) }">
              <td class="pf-pl0 flex justify-center align-middle items-center">
                <span v-if="isCurrentSession(session)" class="asa-pill asa-pill--green pf-live">
                  <span class="pf-pulse" />
                  {{ t('mySessions.currentSession') }}
                </span>
              </td>
              <td class="pf-dt">
                <div class="pf-dt__date">{{ formatDate(session.createdAt) }}</div>
                <div class="pf-dt__time">{{ formatTime(session.createdAt) }}</div>
              </td>
              <td>
                <span class="asa-pill" :class="eventPillClass(session.event)">
                  {{ t(`mySessions.events.${session.event}`, session.event) }}
                </span>
              </td>
              <td class="pf-sub">
                {{ session.browser || '---' }}
                <span v-if="session.browserVersion" class="pf-tiny">{{ session.browserVersion }}</span>
              </td>
              <td class="pf-sub">
                {{ session.os || '---' }}
                <span v-if="session.osVersion" class="pf-tiny">{{ session.osVersion }}</span>
              </td>
              <td>
                <span class="asa-pill" :class="devicePillClass(session.deviceType)">
                  {{ session.device || '---' }}
                </span>
              </td>
              <td class="pf-ip">{{ session.ipAddress || '---' }}</td>
              <td class="pf-ta-end">
                <button class="pf-icon-btn" :aria-label="t('mySessions.sessionDetails')" @click="openDetails(session)">
                  <Eye class="w-4! h-4! stroke-current" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalCount" class="pf-card-foot">
        <p class="pf-card-foot__info">
          {{ t('mySessions.pageInfo', { page: currentPage, totalPages, total: totalCount }) }}
        </p>
        <v-pagination v-if="totalPages > 1" v-model="currentPage" :length="totalPages" :total-visible="5"
          density="comfortable" color="#00adb5" rounded="circle" :disabled="loading" />
      </div>
    </div>

    <!-- ─── Session details dialog ─── -->
    <v-dialog v-model="detailsDialog" max-width="560" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('mySessions.sessionDetails') }}</h2>
            <span class="asa-dialog__sub">
              {{ selectedSession ? formatDateTime(selectedSession.createdAt) : '' }}
            </span>
          </div>
          <button class="pf-x" aria-label="close" @click="detailsDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div v-if="selectedSession" class="pf-info-grid">
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('mySessions.event') }}</p>
              <span class="asa-pill" :class="eventPillClass(selectedSession.event)">
                {{ t(`mySessions.events.${selectedSession.event}`, selectedSession.event) }}
              </span>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('mySessions.device') }}</p>
              <p class="pf-info-value">{{ selectedSession.device || '---' }}</p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('mySessions.browser') }}</p>
              <p class="pf-info-value">
                {{ selectedSession.browser || '---' }}
                <span v-if="selectedSession.browserVersion">{{ selectedSession.browserVersion }}</span>
              </p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('mySessions.os') }}</p>
              <p class="pf-info-value">
                {{ selectedSession.os || '---' }}
                <span v-if="selectedSession.osVersion">{{ selectedSession.osVersion }}</span>
              </p>
            </div>
            <div class="pf-info-cell">
              <p class="pf-info-label">{{ t('mySessions.ipAddress') }}</p>
              <p class="pf-info-value pf-ip">{{ selectedSession.ipAddress || '---' }}</p>
            </div>
            <div v-if="selectedSession.userAgent" class="pf-info-cell pf-info-cell--full">
              <p class="pf-info-label">{{ t('mySessions.userAgent') }}</p>
              <div class="pf-ua">{{ selectedSession.userAgent }}</div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="detailsDialog = false">
            <span>{{ t('mySessions.close') }}</span>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import Clock from '~/components/icons/Clock.vue'
import Activity from '~/components/icons/Activity.vue'
import Calendar from '~/components/icons/Calendar.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'
import Eye from '~/components/icons/Eye.vue'
import moment from 'moment-jalaali'

definePageMeta({})

const { t, locale } = useI18n()
const { toPersianNum } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
useAuth()

const sessions = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const limit = 50

const summary = ref<any>(null)

const detailsDialog = ref(false)
const selectedSession = ref<any>(null)

function isCurrentSession(session: any): boolean {
  if (!process.client) return false
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) return false
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sessionId === session.id
  } catch {
    return false
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) return '---'
  const m = moment(date)
  return locale.value === 'fa' ? toPersianNum(m.format('jDD jMMMM jYYYY')) : m.format('jYYYY/jMM/jDD')
}

function formatTime(date: string | null | undefined) {
  if (!date) return '---'
  const m = moment(date)
  return locale.value === 'fa' ? toPersianNum(m.format('HH:mm')) : m.format('HH:mm')
}

function formatDateTime(date: string | null | undefined) {
  if (!date) return '---'
  const m = moment(date)
  return locale.value === 'fa' ? toPersianNum(m.format('jDD jMMMM jYYYY - HH:mm')) : m.format('jYYYY/jMM/jDD - HH:mm')
}

function eventPillClass(event: string): string {
  const map: Record<string, string> = {
    login: 'asa-pill--green',
    logout: 'pf-pill--neutral',
  }
  return map[event] || 'pf-pill--neutral'
}

function devicePillClass(deviceType: string | null): string {
  const map: Record<string, string> = {
    desktop: 'asa-pill--teal',
    mobile: 'asa-pill--indigo',
    tablet: 'asa-pill--amber',
    unknown: 'pf-pill--neutral',
  }
  return map[deviceType || 'unknown'] || 'pf-pill--neutral'
}

async function fetchSessions() {
  loading.value = true
  try {
    const url = `/api/login-history/me?page=${currentPage.value}&limit=${limit}`
    const res = await apiFetch<any>(url)
    if (res.success) {
      sessions.value = res.data || []
      totalPages.value = res.pagination?.totalPages || 1
      totalCount.value = res.pagination?.total || 0
    } else {
      sessions.value = []
      $toast.error(t('mySessions.fetchError'))
    }
  } catch {
    sessions.value = []
    $toast.error(t('mySessions.fetchError'))
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    const res = await apiFetch<any>('/api/login-history/me/summary')
    if (res.success) {
      summary.value = res.summary
    }
  } catch {
    // Silently fail
  }
}

function refreshAll() {
  currentPage.value = 1
  fetchSessions()
  fetchSummary()
}

const sortableColumns = computed(() => [
  { key: 'createdAt', label: t('mySessions.timestamp') },
  { key: 'event', label: t('mySessions.event') },
  { key: 'browser', label: t('mySessions.browser') },
  { key: 'os', label: t('mySessions.os') },
  { key: 'device', label: t('mySessions.device') },
  { key: 'ipAddress', label: t('mySessions.ipAddress') },
])

type SortKey = 'createdAt' | 'event' | 'browser' | 'os' | 'device' | 'ipAddress'

const sortKey = ref<SortKey>('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'createdAt' ? 'desc' : 'asc'
  }
}

function sortAria(key: SortKey): string {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

function sortIndicator(key: SortKey): string {
  if (sortKey.value !== key) return 'mdi-sort'
  return sortDir.value === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'
}

const sortedSessions = computed(() => {
  const key = sortKey.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...sessions.value].sort((a, b) => {
    const va = key === 'createdAt' ? (a[key] ?? '').toString() : (a[key] ?? '').toString().toLowerCase().trim()
    const vb = key === 'createdAt' ? (b[key] ?? '').toString() : (b[key] ?? '').toString().toLowerCase().trim()
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return 0
  })
})

function openDetails(session: any) {
  selectedSession.value = session
  detailsDialog.value = true
}

watch(currentPage, () => { fetchSessions() })

onMounted(() => {
  fetchSessions()
  fetchSummary()
})

useSeoMeta({ title: t('mySessions.titleSeo') })
</script>

<style scoped>
/* ── Header refresh spinner ────────────────────── */
.pf-spin {
  animation: pf-spin 800ms linear infinite;
}

@keyframes pf-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Metric cards ──────────────────────────────── */
.pf-metric {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem 1.25rem;
}

.pf-metric__copy {
  min-width: 0;
}

.pf-metric__value {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.pf-metric__value--sm {
  font-size: 1.0625rem;
  line-height: 1.3;
}

.pf-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

/* ── Table shell ───────────────────────────────── */
.pf-table-card {
  padding: 0;
  overflow: hidden;
}

.asa-table-wrap {
  overflow-x: auto;
}

.pf-table {
  width: 100%;
  min-width: 48rem;
  border-collapse: collapse;
  text-align: start;
}

.pf-table thead th {
  padding: 0.875rem 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.pf-th-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: color 150ms var(--ease-default);
}

.pf-th-btn:hover {
  color: var(--asa-label);
}

.pf-th-btn--active {
  color: var(--asa-accent);
}

.dark .pf-th-btn--active {
  color: var(--asa-dark);
}

.pf-th-ic {
  opacity: 0.4;
  transition: opacity 150ms var(--ease-default);
}

.pf-th-btn:hover .pf-th-ic,
.pf-th-ic--on {
  opacity: 1;
}

.pf-table tbody td {
  padding: 0.875rem 1rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  white-space: nowrap;
  border-top: 1px solid var(--asa-sep);
  vertical-align: middle;
}

.pf-table tbody tr {
  transition: background-color 150ms var(--ease-default);
}

.pf-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .pf-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.pf-table tbody tr:nth-child(even):not(.pf-row-tr--current) {
  background: color-mix(in srgb, var(--asa-label) 2%, transparent);
}

.dark .pf-table tbody tr:nth-child(even):not(.pf-row-tr--current) {
  background: rgba(255, 255, 255, 0.025);
}

.pf-row-tr--current {
  background: color-mix(in srgb, var(--asa-green) 6%, transparent);
}

.pf-pl0 {
  padding-inline-start: 0 !important;
  height: 100%;
}

.pf-ta-end {
  text-align: end !important;
}

.pf-sub {
  color: var(--asa-label-2);
}

.pf-tiny {
  color: var(--asa-label-3);
  font-size: 0.6875rem;
}

.pf-dt {
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.pf-dt__date {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--asa-label);
}

.pf-dt__time {
  margin-top: 0.1875rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}

.pf-ip {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  color: var(--asa-label-2);
  font-variant-numeric: tabular-nums;
}

.pf-pill--neutral {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
}

/* Live "current session" pill */
.pf-live {
  border: 1px solid color-mix(in srgb, var(--asa-green) 30%, transparent);
}

.pf-pulse {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--asa-green);
  animation: pf-pulse 2s ease-in-out infinite;
}

@keyframes pf-pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.35;
  }
}

/* ── Icon button (row actions) ─────────────────── */
.pf-icon-btn {
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
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.pf-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.dark .pf-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

/* ── Loading skeletons ─────────────────────────── */
.pf-skel {
  padding: 0.875rem 0;
}

.pf-skel__row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
}

.pf-skel__row+.pf-skel__row {
  border-top: 1px solid var(--asa-sep);
}

/* ── Empty state ───────────────────────────────── */
.pf-tint-lg {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.25rem;
}

.pf-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.pf-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.pf-empty__desc {
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
}

/* ── Table footer (info + pagination) ──────────── */
.pf-card-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

.pf-card-foot__info {
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* ── Details dialog ────────────────────────────── */
.pf-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: var(--asa-label-2);
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.pf-x:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

.pf-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.125rem 1rem;
}

.pf-info-cell {
  min-width: 0;
}

.pf-info-cell--full {
  grid-column: 1 / -1;
}

.pf-info-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--asa-label-2);
  margin-bottom: 0.375rem;
}

.pf-info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

.pf-ua {
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  border: 1px solid var(--asa-card-ring);
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--asa-label-2);
  overflow-wrap: anywhere;
}

@media (prefers-reduced-motion: reduce) {

  .pf-spin,
  .pf-pulse {
    animation: none;
  }
}
</style>