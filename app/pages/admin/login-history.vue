<template>
  <UiPageContainer>
    <UiPageHeader :title="t('loginHistory.title')" :subtitle="t('loginHistory.subtitle')" />

    <div class="!mb-6 !flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
      <div class="!flex !items-center !gap-3 !flex-wrap">
        <v-text-field v-model="userSearch" :label="t('loginHistory.searchUser')" variant="outlined" density="compact"
          clearable hide-details class="!max-w-[220px]" prepend-inner-icon="lucide:search" />
        <v-select v-model="eventFilter" :items="eventOptions" item-title="label" item-value="value"
          :label="t('loginHistory.eventType')" variant="outlined" density="compact" clearable hide-details
          class="!max-w-[180px]" />
      </div>
      <p class="!text-xs !text-zinc-400">
        {{ t('loginHistory.pageInfo', { page: currentPage, totalPages: totalPages, total: totalCount }) }}
      </p>
    </div>

    <div
      class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-sm !border !border-slate-200/60 dark:!border-slate-800/60 !overflow-hidden">
      <div class="!overflow-x-auto">
        <table class="!min-w-full !text-right !border-collapse">
          <thead
            class="!bg-slate-50/50 dark:!bg-slate-800/20 !border-b !border-slate-200/60 dark:!border-slate-800/60">
            <tr>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('loginHistory.timestamp') }}
              </th>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('loginHistory.user') }}
              </th>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('loginHistory.event') }}
              </th>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('loginHistory.browser') }}
              </th>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('loginHistory.os') }}
              </th>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('loginHistory.device') }}
              </th>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('loginHistory.ipAddress') }}
              </th>
              <th class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading">
              <tr v-for="i in 8" :key="`skeleton-${i}`">
                <td colspan="8">
                  <v-skeleton-loader type="list-item" class="bg-transparent!" />
                </td>
              </tr>
            </template>
            <tr v-else-if="sessions.length === 0">
              <td colspan="8">
                <UiEmptyState :title="t('loginHistory.noSessions')" :description="t('loginHistory.noSessionsDesc')">
                  <template #icon>
                    <Icon name="lucide:shield" class="!w-8 !h-8 !text-zinc-300" />
                  </template>
                </UiEmptyState>
              </td>
            </tr>
            <template v-else>
              <tr v-for="session in sessions" :key="session.id"
                class="!border-b !border-slate-100/60 dark:!border-slate-800/40 hover:!bg-slate-50/50 dark:hover:!bg-slate-800/20 !transition-colors">
              <td class="!px-6 !py-4 !text-xs !text-slate-600 dark:!text-slate-400 !whitespace-nowrap">
                {{ formatDateTime(session.createdAt) }}
              </td>
              <td class="!px-6 !py-4 !text-xs !text-slate-600 dark:!text-slate-400 !whitespace-nowrap">
                {{ session.userId ? session.userId.slice(0, 8) + '...' : '---' }}
              </td>
              <td class="!px-6 !py-4 !whitespace-nowrap">
                <span class="!px-2.5 !py-1 !rounded-lg !text-[10px] !font-bold !border"
                  :class="eventClass(session.event)">
                  {{ t(`loginHistory.events.${session.event}`, session.event) }}
                </span>
              </td>
              <td class="!px-6 !py-4 !text-xs !text-slate-600 dark:!text-slate-400 !whitespace-nowrap">
                {{ session.browser || '---' }}
                <span v-if="session.browserVersion" class="!text-slate-400"> {{ session.browserVersion }}</span>
              </td>
              <td class="!px-6 !py-4 !text-xs !text-slate-600 dark:!text-slate-400 !whitespace-nowrap">
                {{ session.os || '---' }}
                <span v-if="session.osVersion" class="!text-slate-400"> {{ session.osVersion }}</span>
              </td>
              <td class="!px-6 !py-4 !whitespace-nowrap">
                <span class="!px-2 !py-0.5 !rounded-md !text-[10px] !font-semibold"
                  :class="deviceTypeClass(session.deviceType)">
                  {{ session.device || '---' }}
                </span>
              </td>
              <td class="!px-6 !py-4 !text-xs !text-slate-500 dark:!text-slate-400 !font-mono !whitespace-nowrap">
                {{ session.ipAddress || '---' }}
              </td>
              <td class="!px-6 !py-4 !whitespace-nowrap">
                <button @click="openDetails(session)"
                  class="!p-1.5 !rounded-lg !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 dark:hover:!bg-slate-800 !transition-colors">
                  <Icon name="lucide:eye" class="!w-4 !h-4" />
                </button>
              </td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="totalPages > 1" class="!mt-6 !flex !justify-center">
      <v-pagination v-model="currentPage" :length="totalPages" :total-visible="7" density="comfortable"
        rounded="lg" />
    </div>

    <v-dialog v-model="detailsDialog" max-width="600">
      <div class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-2xl !overflow-hidden">
        <div class="!px-6 !py-4 !border-b !border-slate-100 dark:!border-slate-800 !flex !items-center !justify-between">
          <h3 class="!text-sm !font-bold !text-slate-900 dark:!text-white">{{ t('loginHistory.sessionDetails') }}</h3>
          <button @click="detailsDialog = false"
            class="!p-1 !rounded-lg !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div v-if="selectedSession" class="!px-6 !py-5 !space-y-4">
          <div class="!grid !grid-cols-2 !gap-4">
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.event') }}</p>
              <span class="!px-2.5 !py-1 !rounded-lg !text-[10px] !font-bold !border"
                :class="eventClass(selectedSession.event)">
                {{ t(`loginHistory.events.${selectedSession.event}`, selectedSession.event) }}
              </span>
            </div>
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.timestamp') }}</p>
              <p class="!text-xs !font-semibold !text-slate-700 dark:!text-slate-300">
                {{ formatDateTime(selectedSession.createdAt) }}
              </p>
            </div>
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.browser') }}</p>
              <p class="!text-xs !text-slate-600 dark:!text-slate-400">
                {{ selectedSession.browser || '---' }}
                <span v-if="selectedSession.browserVersion">{{ selectedSession.browserVersion }}</span>
              </p>
            </div>
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.os') }}</p>
              <p class="!text-xs !text-slate-600 dark:!text-slate-400">
                {{ selectedSession.os || '---' }}
                <span v-if="selectedSession.osVersion">{{ selectedSession.osVersion }}</span>
              </p>
            </div>
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.device') }}</p>
              <p class="!text-xs !text-slate-600 dark:!text-slate-400">{{ selectedSession.device || '---' }}</p>
            </div>
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.ipAddress') }}</p>
              <p class="!text-xs !text-slate-600 dark:!text-slate-400 !font-mono">{{ selectedSession.ipAddress || '---' }}</p>
            </div>
          </div>
          <div v-if="selectedSession.userId">
            <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.userId') }}</p>
            <p class="!text-xs !text-slate-600 dark:!text-slate-400 !font-mono break-all">{{ selectedSession.userId }}</p>
          </div>
          <div v-if="selectedSession.userAgent"
            class="!bg-slate-50 dark:!bg-slate-800/30 !rounded-xl !p-4">
            <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('loginHistory.userAgent') }}</p>
            <p class="!text-[11px] !text-slate-500 dark:!text-slate-400 !break-all !leading-relaxed">{{ selectedSession.userAgent }}</p>
          </div>
        </div>
        <div class="!px-6 !py-3 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end">
          <button @click="detailsDialog = false"
            class="!px-4 !py-2 !text-xs !font-semibold !text-slate-600 !bg-slate-100 hover:!bg-slate-200 !rounded-xl !transition-colors">{{ t('loginHistory.close') }}</button>
        </div>
      </div>
    </v-dialog>

  </UiPageContainer>
</template>

<script setup lang="ts">
definePageMeta({ roles: ['admin_doctor'] })

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const sessions = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const limit = 50

const userSearch = ref<string>('')
const eventFilter = ref<string | null>(null)

const detailsDialog = ref(false)
const selectedSession = ref<any>(null)

const eventOptions = computed(() => [
  { value: 'login', label: t('loginHistory.events.login') },
  { value: 'logout', label: t('loginHistory.events.logout') },
])

function formatDateTime(date: string | null) {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

function eventClass(event: string): string {
  const map: Record<string, string> = {
    login: '!bg-emerald-50 !text-emerald-700 !border-emerald-200',
    logout: '!bg-zinc-100 !text-zinc-600 !border-zinc-200',
  }
  return map[event] || '!bg-zinc-100 !text-zinc-600 !border-zinc-200'
}

function deviceTypeClass(deviceType: string | null): string {
  const map: Record<string, string> = {
    desktop: '!bg-blue-50 !text-blue-700',
    mobile: '!bg-purple-50 !text-purple-700',
    tablet: '!bg-amber-50 !text-amber-700',
    unknown: '!bg-slate-100 !text-slate-500',
  }
  return map[deviceType || 'unknown'] || '!bg-slate-100 !text-slate-500'
}

async function fetchSessions() {
  loading.value = true
  try {
    let url = `/api/login-history?page=${currentPage.value}&limit=${limit}`
    if (eventFilter.value) {
      url += `&event=${eventFilter.value}`
    }
    const res = await apiFetch<any>(url)
    if (res.success) {
      let data = res.data || []
      if (userSearch.value) {
        const q = userSearch.value.toLowerCase()
        data = data.filter((s: any) => s.userId && s.userId.toLowerCase().includes(q))
      }
      sessions.value = data
      totalPages.value = res.pagination?.totalPages || 1
      totalCount.value = res.pagination?.total || 0
    } else {
      sessions.value = []
      $toast.error(t('loginHistory.fetchError'))
    }
  } catch {
    sessions.value = []
    $toast.error(t('loginHistory.fetchError'))
  } finally {
    loading.value = false
  }
}

function openDetails(session: any) {
  selectedSession.value = session
  detailsDialog.value = true
}

watch(currentPage, () => { fetchSessions() })
watch(eventFilter, () => { currentPage.value = 1; fetchSessions() })
watch(userSearch, () => { currentPage.value = 1; fetchSessions() })

onMounted(() => { fetchSessions() })

useSeoMeta({ title: t('loginHistory.titleSeo') })
</script>
