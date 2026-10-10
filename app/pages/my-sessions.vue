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
          density="comfortable" color="#5f8feb" rounded="circle" :disabled="loading" />
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
