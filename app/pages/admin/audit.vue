<template>
  <UiPageContainer>
    <UiPageHeader :title="t('auditLogs.title')" :subtitle="t('auditLogs.subtitle')" />

    <div class="!mb-6 !flex !flex-col sm:!flex-row !items-start sm:!items-center !justify-between !gap-4">
      <div class="!flex !items-center !gap-3 !flex-wrap">
        <v-select v-model="entityFilter" :items="entityTypeOptions" item-title="label" item-value="value"
          :label="t('auditLogs.entityType')" variant="outlined" density="compact" clearable hide-details
          class="!max-w-[220px]" />
      </div>
      <p class="!text-xs !text-zinc-400">
        {{ t('auditLogs.pageInfo', { page: currentPage, totalPages: totalPages, total: totalCount }) }}
      </p>
    </div>

    <div
      class="!bg-white dark:!bg-[#0f1115] !rounded-2xl !shadow-sm !border !border-slate-200/60 dark:!border-slate-800/60 !overflow-hidden">
      <div class="!overflow-x-auto">
        <table class="!min-w-full !text-right !border-collapse">
          <thead
            class="!bg-slate-50/50 dark:!bg-slate-800/20 !border-b !border-slate-200/60 dark:!border-slate-800/60">
            <tr>
              <th
                class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('auditLogs.timestamp') }}
              </th>
              <th
                class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('auditLogs.action') }}
              </th>
              <th
                class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('auditLogs.entityType') }}
              </th>
              <th
                class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('auditLogs.entityId') }}
              </th>
              <th
                class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('auditLogs.user') }}
              </th>
              <th
                class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
                {{ t('auditLogs.ipAddress') }}
              </th>
              <th
                class="!px-6 !py-4 !text-xs !font-bold !text-slate-500 dark:!text-slate-400 !uppercase !tracking-wider !whitespace-nowrap">
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 8" :key="`skeleton-${i}`">
              <td colspan="7">
                <v-skeleton-loader type="list-item" class="bg-transparent!" />
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="7">
                <UiEmptyState :title="t('auditLogs.noLogs')" :description="t('auditLogs.noLogsDesc')">
                  <template #icon>
                    <Icon name="lucide:scroll-text" class="!w-8 !h-8 !text-zinc-300" />
                  </template>
                </UiEmptyState>
              </td>
            </tr>
            <tr v-else v-for="log in logs" :key="log.id"
              class="!border-b !border-slate-100/60 dark:!border-slate-800/40 hover:!bg-slate-50/50 dark:hover:!bg-slate-800/20 !transition-colors">
              <td class="!px-6 !py-4 !text-xs !text-slate-600 dark:!text-slate-400 !whitespace-nowrap">
                {{ formatDateTime(log.createdAt) }}
              </td>
              <td class="!px-6 !py-4 !whitespace-nowrap">
                <span class="!px-2.5 !py-1 !rounded-lg !text-[10px] !font-bold !border"
                  :class="actionClass(log.action)">
                  {{ t(`auditLogs.actions.${log.action}`, log.action) }}
                </span>
              </td>
              <td class="!px-6 !py-4 !text-xs !font-semibold !text-slate-700 dark:!text-slate-300 !whitespace-nowrap">
                {{ t(`auditLogs.entityTypes.${log.entityType}`, log.entityType) }}
              </td>
              <td class="!px-6 !py-4 !text-xs !text-slate-500 dark:!text-slate-400 !font-mono !whitespace-nowrap">
                {{ log.entityId ? log.entityId.slice(0, 8) + '...' : '---' }}
              </td>
              <td class="!px-6 !py-4 !text-xs !text-slate-600 dark:!text-slate-400 !whitespace-nowrap">
                {{ log.userId ? log.userId.slice(0, 8) + '...' : '---' }}
              </td>
              <td class="!px-6 !py-4 !text-xs !text-slate-500 dark:!text-slate-400 !font-mono !whitespace-nowrap">
                {{ log.ipAddress || '---' }}
              </td>
              <td class="!px-6 !py-4 !whitespace-nowrap">
                <button @click="openDetails(log)"
                  class="!p-1.5 !rounded-lg !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 dark:hover:!bg-slate-800 !transition-colors">
                  <Icon name="lucide:eye" class="!w-4 !h-4" />
                </button>
              </td>
            </tr>
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
          <h3 class="!text-sm !font-bold !text-slate-900 dark:!text-white">{{ t('auditLogs.details') }}</h3>
          <button @click="detailsDialog = false"
            class="!p-1 !rounded-lg !text-slate-400 hover:!text-slate-700 hover:!bg-slate-100 !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div v-if="selectedLog" class="!px-6 !py-5 !space-y-4">
          <div class="!grid !grid-cols-2 !gap-4">
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('auditLogs.action') }}</p>
              <span class="!px-2.5 !py-1 !rounded-lg !text-[10px] !font-bold !border"
                :class="actionClass(selectedLog.action)">
                {{ t(`auditLogs.actions.${selectedLog.action}`, selectedLog.action) }}
              </span>
            </div>
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('auditLogs.entityType') }}</p>
              <p class="!text-xs !font-semibold !text-slate-700 dark:!text-slate-300">
                {{ t(`auditLogs.entityTypes.${selectedLog.entityType}`, selectedLog.entityType) }}
              </p>
            </div>
          </div>
          <div class="!grid !grid-cols-2 !gap-4">
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('auditLogs.entityId') }}</p>
              <p class="!text-xs !text-slate-600 dark:!text-slate-400 !font-mono break-all">{{ selectedLog.entityId || '---' }}</p>
            </div>
            <div>
              <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('auditLogs.user') }}</p>
              <p class="!text-xs !text-slate-600 dark:!text-slate-400 !font-mono break-all">{{ selectedLog.userId || '---' }}</p>
            </div>
          </div>
          <div>
            <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">{{ t('auditLogs.timestamp') }}</p>
            <p class="!text-xs !text-slate-600 dark:!text-slate-400">{{ formatDateTime(selectedLog.createdAt) }}</p>
          </div>

          <div v-if="selectedLog.oldValues || selectedLog.newValues"
            class="!bg-slate-50 dark:!bg-slate-800/30 !rounded-xl !p-4">
            <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-3">{{ t('auditLogs.change') }}</p>
            <div class="!space-y-2">
              <template v-if="selectedLog.oldValues && typeof selectedLog.oldValues === 'object'">
                <div v-for="(val, key) in selectedLog.oldValues" :key="`old-${key}`"
                  class="!flex !items-start !gap-2 !text-xs">
                  <span class="!font-semibold !text-slate-600 dark:!text-slate-400 !min-w-[80px]">{{ key }}:</span>
                  <span class="!text-red-600 dark:!text-red-400 line-through !break-all">{{ formatValue(val) }}</span>
                </div>
              </template>
              <template v-if="selectedLog.newValues && typeof selectedLog.newValues === 'object'">
                <div v-for="(val, key) in selectedLog.newValues" :key="`new-${key}`"
                  class="!flex !items-start !gap-2 !text-xs">
                  <span class="!font-semibold !text-slate-600 dark:!text-slate-400 !min-w-[80px]">{{ key }}:</span>
                  <span class="!text-emerald-600 dark:!text-emerald-400 !break-all">{{ formatValue(val) }}</span>
                </div>
              </template>
            </div>
          </div>

          <div v-if="selectedLog.userAgent"
            class="!bg-slate-50 dark:!bg-slate-800/30 !rounded-xl !p-4">
            <p class="!text-[10px] !font-bold !text-slate-400 !uppercase !tracking-wider !mb-1">User Agent</p>
            <p class="!text-[11px] !text-slate-500 dark:!text-slate-400 !break-all !leading-relaxed">{{ selectedLog.userAgent }}</p>
          </div>
        </div>
        <div class="!px-6 !py-3 !border-t !border-slate-100 dark:!border-slate-800 !flex !justify-end">
          <button @click="detailsDialog = false"
            class="!px-4 !py-2 !text-xs !font-semibold !text-slate-600 !bg-slate-100 hover:!bg-slate-200 !rounded-xl !transition-colors">{{ t('auditLogs.close') }}</button>
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

const logs = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const limit = 50

const entityFilter = ref<string | null>(null)

const detailsDialog = ref(false)
const selectedLog = ref<any>(null)

const entityTypeOptions = computed(() => {
  const types = ['patient', 'appointment', 'prescription', 'lab_result', 'billing_record', 'staff', 'user', 'visit', 'disease', 'medication', 'allergy', 'message']
  return types.map(type => ({
    value: type,
    label: t(`auditLogs.entityTypes.${type}`, type),
  }))
})

function formatDateTime(date: string | null) {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '---'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function actionClass(action: string): string {
  const map: Record<string, string> = {
    create: '!bg-emerald-50 !text-emerald-700 !border-emerald-200',
    update: '!bg-blue-50 !text-blue-700 !border-blue-200',
    delete: '!bg-red-50 !text-red-700 !border-red-200',
    login: '!bg-violet-50 !text-violet-700 !border-violet-200',
    logout: '!bg-zinc-100 !text-zinc-600 !border-zinc-200',
  }
  return map[action] || '!bg-zinc-100 !text-zinc-600 !border-zinc-200'
}

async function fetchLogs() {
  loading.value = true
  try {
    let url = `/api/audit?page=${currentPage.value}&limit=${limit}`
    const res = await apiFetch<any>(url)
    if (res.success) {
      let data = res.data || []
      if (entityFilter.value) {
        data = data.filter((log: any) => log.entityType === entityFilter.value)
      }
      logs.value = data
      totalPages.value = res.pagination?.totalPages || 1
      totalCount.value = res.pagination?.total || 0
    } else {
      logs.value = []
      $toast.error(t('auditLogs.fetchError'))
    }
  } catch {
    logs.value = []
    $toast.error(t('auditLogs.fetchError'))
  } finally {
    loading.value = false
  }
}

function openDetails(log: any) {
  selectedLog.value = log
  detailsDialog.value = true
}

watch(currentPage, () => { fetchLogs() })
watch(entityFilter, () => { currentPage.value = 1; fetchLogs() })

onMounted(() => { fetchLogs() })

useSeoMeta({ title: t('auditLogs.titleSeo') })
</script>
