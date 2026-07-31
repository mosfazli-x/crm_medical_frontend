<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('leads.title')" :subtitle="$t('leads.subtitle')">
      <template #actions>
        <AddNewLeadButton />
        <LeadFormDialog />
      </template>
    </UiPageHeader>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('leads.stats.total') }}</span>
          <span class="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center">
            <v-icon size="18" color="#4F46E5">mdi-account-outline</v-icon>
          </span>
        </div>
        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ summary?.totalLeads ?? 0 }}</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('leads.stats.active') }}</span>
          <span class="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center">
            <v-icon size="18" color="#3B82F6">mdi-account-multiple-outline</v-icon>
          </span>
        </div>
        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ summary?.activeLeads ?? 0 }}</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('leads.stats.converted') }}</span>
          <span class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 flex items-center justify-center">
            <v-icon size="18" color="#059669">mdi-check-circle-outline</v-icon>
          </span>
        </div>
        <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{{ summary?.convertedLeads ?? 0 }}</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('leads.stats.lost') }}</span>
          <span class="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/20 flex items-center justify-center">
            <v-icon size="18" color="#EF4444">mdi-close-circle-outline</v-icon>
          </span>
        </div>
        <p class="text-2xl font-extrabold text-red-600 dark:text-red-400">{{ summary?.lostLeads ?? 0 }}</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('leads.stats.conversionRate') }}</span>
          <span class="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-500/20 flex items-center justify-center">
            <v-icon size="18" color="#F59E0B">mdi-percent-outline</v-icon>
          </span>
        </div>
        <p class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{{ summary?.conversionRate ?? 0 }}%</p>
      </div>

      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('leads.stats.expectedValue') }}</span>
          <span class="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center">
            <v-icon size="18" color="#8B5CF6">mdi-currency-usd</v-icon>
          </span>
        </div>
        <p class="text-xl font-extrabold text-slate-800 dark:text-slate-100 truncate">{{ formatPrice(summary?.expectedValue?.total) }}</p>
      </div>
    </div>

    <!-- Pipeline chips -->
    <UiContentCard v-if="summary?.pipeline?.length" class="mb-6">
      <div class="flex flex-wrap items-center gap-2 p-4">
        <button v-for="p in summary.pipeline" :key="p.status"
          class="px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
          :class="filters.status === p.status
            ? 'bg-indigo-600 text-white border-indigo-600'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50'"
          @click="togglePipelineFilter(p.status)">
          <span :class="badgeClass(p.status)" class="!text-[11px] mr-1">{{ badgeLabel(p.status) }}</span>
          <span>{{ p.count }}</span>
        </button>
      </div>
    </UiContentCard>

    <!-- Follow-up quick filters -->
    <UiContentCard class="mb-6">
      <div class="flex flex-wrap items-center gap-3 p-4">
        <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ $t('leads.followUps.title') }}</span>
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors"
          :class="filters.dueFollowUp === 'overdue'
            ? 'bg-red-600 text-white border-red-600'
            : 'text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20'"
          @click="toggleFollowUp('overdue')">
          {{ $t('leads.followUps.overdue') }} ({{ summary?.followUps?.overdue ?? 0 }})
        </button>
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors"
          :class="filters.dueFollowUp === 'today'
            ? 'bg-amber-600 text-white border-amber-600'
            : 'text-amber-600 border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20'"
          @click="toggleFollowUp('today')">
          {{ $t('leads.followUps.today') }} ({{ summary?.followUps?.today ?? 0 }})
        </button>
        <button
          class="px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors"
          :class="filters.dueFollowUp === 'upcoming'
            ? 'bg-emerald-600 text-white border-emerald-600'
            : 'text-emerald-600 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
          @click="toggleFollowUp('upcoming')">
          {{ $t('leads.followUps.upcoming') }} ({{ summary?.followUps?.upcoming ?? 0 }})
        </button>
      </div>
    </UiContentCard>

    <!-- Filters -->
    <UiContentCard class="mb-6">
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 p-5">
        <div class="col-span-2 md:col-span-1 xl:col-span-2">
          <v-text-field v-model="filters.q" variant="outlined" density="comfortable" hide-details="auto"
            bg-color="white" rounded="lg" :placeholder="$t('leads.searchPlaceholder')"
            @keydown.enter="applyFilters" prepend-inner-icon="mdi-magnify" />
        </div>
        <v-select v-model="filters.status" variant="outlined" density="comfortable" hide-details="auto" bg-color="white"
          rounded="lg" :items="statusOptions" item-title="title" item-value="value" :label="$t('leads.filterStatus')"
          clearable @update:model-value="applyFilters" />
        <v-select v-model="filters.priority" variant="outlined" density="comfortable" hide-details="auto"
          bg-color="white" rounded="lg" :items="priorityOptions" item-title="title" item-value="value"
          :label="$t('leads.filterPriority')" clearable @update:model-value="applyFilters" />
        <v-select v-model="filters.sourceId" variant="outlined" density="comfortable" hide-details="auto"
          bg-color="white" rounded="lg" :items="sourceOptions" item-title="title" item-value="id"
          :label="$t('leads.filterSource')" clearable @update:model-value="applyFilters" />
        <v-select v-model="filters.sort" variant="outlined" density="comfortable" hide-details="auto" bg-color="white"
          rounded="lg" :items="sortOptions" item-title="title" item-value="value" :label="$t('leads.sort')"
          @update:model-value="applyFilters" />
      </div>
    </UiContentCard>

    <UiContentCard>
      <div class="crm-table-wrap">
        <table class="crm-table">
          <thead>
            <tr>
              <th>{{ $t('leads.fullName') }}</th>
              <th>{{ $t('leads.phone') }}</th>
              <th>{{ $t('leads.source') }}</th>
              <th>{{ $t('leads.status') }}</th>
              <th>{{ $t('leads.priority') }}</th>
              <th>{{ $t('leads.expectedValue') }}</th>
              <th>{{ $t('leads.nextFollowUpAt') }}</th>
              <th class="text-center!">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 6" :key="`skeleton-${i}`">
              <td colspan="8" class="p-4!">
                <v-skeleton-loader type="list-item" class="bg-transparent!" />
              </td>
            </tr>

            <tr v-else-if="!leads.length">
              <td colspan="8">
                <UiEmptyState :title="$t('leads.noLeads')">
                  <template #icon>
                    <v-icon icon="mdi-account-plus-outline" size="32" color="slate-400" />
                  </template>
                </UiEmptyState>
              </td>
            </tr>

            <tr v-else v-for="lead in leads" :key="lead.id" class="cursor-pointer group"
              @click="navigateTo(`/leads/${lead.id}`)">
              <td class="crm-table-primary">
                {{ lead.firstName }} {{ lead.lastName }}
                <span v-if="lead.campaignName"
                  class="block text-[11px] font-normal text-slate-400 mt-0.5">{{ lead.campaignName }}</span>
              </td>
              <td class="font-mono tracking-wider crm-ltr">{{ lead.phone || '-' }}</td>
              <td>
                <span v-if="lead.sourceName" class="inline-flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: sourceColor(lead.sourceId) }"></span>
                  <span>{{ lead.sourceName }}</span>
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td>
                <span :class="badgeClass(lead.status)">{{ badgeLabel(lead.status) }}</span>
              </td>
              <td>
                <span :class="priorityClass(lead.priority)">{{ priorityLabel(lead.priority) }}</span>
              </td>
              <td class="font-mono text-sm">{{ lead.expectedValue !== null ? formatPrice(lead.expectedValue) : '-' }}</td>
              <td>
                <span v-if="lead.nextFollowUpAt" :class="followUpClass(lead)">
                  {{ formatJalaliDateShort(lead.nextFollowUpAt) }}
                </span>
                <span v-else class="text-slate-400">-</span>
              </td>
              <td class="text-center!">
                <div class="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <v-tooltip :text="$t('leads.viewLead')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn"
                        @click.stop="navigateTo(`/leads/${lead.id}`)">
                        <v-icon size="20">mdi-file-document-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip :text="$t('common.edit')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn text-emerald-500!"
                        @click.stop="openEdit(lead)">
                        <v-icon size="20">mdi-pencil-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip v-if="isAdmin" :text="$t('common.delete')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn crm-icon-btn-danger"
                        @click.stop="confirmDelete(lead)">
                        <TrashBin class="w-5 h-5 fill-current" />
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" class="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700">
        <span class="text-xs text-slate-500 font-medium">
          {{ $t('leads.showing', { from: (pagination.page - 1) * pagination.limit + 1, to: Math.min(pagination.page * pagination.limit, pagination.total), total: pagination.total }) }}
        </span>
        <v-pagination v-model="pagination.page" :length="pagination.totalPages" density="compact" color="#4F46E5"
          :total-visible="4" @update:model-value="fetchLeads" />
      </div>
    </UiContentCard>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import AddNewLeadButton from '~/components/AddNewLeadButton.vue'
import LeadFormDialog from '~/components/LeadFormDialog.vue'
import { useLeads } from '~/composables/useLeads'
import { useLeadFormDialog } from '~/composables/useLeadFormDialog'
import { useEventBus } from '~/composables/useEventBus'
import { useStatusBadge } from '~/composables/useStatusBadge'
import { LEAD_PRIORITIES, LEAD_STATUSES, type Lead, type LeadSource } from '~/types/lead'

const { t } = useI18n()
const { apiFetch } = useApi()
const { listLeads, getSummary, listSources, deleteLead } = useLeads()
const { openEdit: openDialogEdit } = useLeadFormDialog()
const { on, off, emit } = useEventBus()
const { $toast } = useNuxtApp()
const { user } = useAuth()
const { formatJalaliDateShort, formatPrice } = useFormatting()
const { badgeClass, badgeLabel, priorityClass, priorityLabel } = useStatusBadge()

const leads = ref<Lead[]>([])
const sources = ref<LeadSource[]>([])
const summary = ref<any>(null)
const loading = ref(true)
const pagination = reactive({ page: 1, limit: 20, total: 0, totalPages: 1 })

const isAdmin = computed(() => {
  const role = user?.value?.role || (user as any)?.role
  return role === 'admin_doctor'
})

const filters = reactive({
  q: '',
  status: '' as string,
  priority: '' as string,
  sourceId: '' as string,
  dueFollowUp: '' as string,
  sort: 'created_at_desc',
})

const statusOptions = LEAD_STATUSES.map((s) => ({ value: s, title: badgeLabel(s) }))
const priorityOptions = LEAD_PRIORITIES.map((p) => ({ value: p, title: priorityLabel(p) }))
const sourceOptions = computed(() =>
  sources.value
    .filter((s) => s.isActive)
    .map((s) => ({ id: s.id, title: s.name }))
)
const sortOptions = [
  { value: 'created_at_desc', title: t('leads.sortOptions.newest') },
  { value: 'created_at_asc', title: t('leads.sortOptions.oldest') },
  { value: 'last_activity_at_desc', title: t('leads.sortOptions.lastActivity') },
  { value: 'next_follow_up_at_asc', title: t('leads.sortOptions.nextFollowUp') },
  { value: 'expected_value_desc', title: t('leads.sortOptions.highestValue') },
]

const sourceColor = (sourceId: string | null) => {
  const source = sources.value.find((s) => s.id === sourceId)
  return source?.color || '#CBD5E1'
}

const followUpClass = (lead: Lead) => {
  if (!lead.nextFollowUpAt) return ''
  const now = new Date()
  const due = new Date(lead.nextFollowUpAt)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (lead.status === 'converted' || lead.status === 'lost') return 'text-slate-400 text-sm font-mono'
  if (due < now) return 'text-red-500 text-sm font-mono font-bold'
  if (due < startOfToday.getTime() + 86400000) return 'text-amber-500 text-sm font-mono font-bold'
  return 'text-slate-600 text-sm font-mono'
}

function togglePipelineFilter(status: string) {
  filters.status = filters.status === status ? '' : status
  pagination.page = 1
  fetchLeads()
}

function toggleFollowUp(due: 'overdue' | 'today' | 'upcoming') {
  filters.dueFollowUp = filters.dueFollowUp === due ? '' : due
  pagination.page = 1
  fetchLeads()
}

function applyFilters() {
  pagination.page = 1
  fetchLeads()
}

async function fetchLeads() {
  loading.value = true
  try {
    const res = await listLeads({
      page: pagination.page,
      limit: pagination.limit,
      status: filters.status as any,
      priority: filters.priority as any,
      sourceId: filters.sourceId as any,
      tag: undefined,
      q: filters.q,
      dueFollowUp: filters.dueFollowUp as any,
      sort: filters.sort,
    })
    if (res.success) {
      leads.value = res.data
      pagination.total = res.pagination.total
      pagination.totalPages = res.pagination.totalPages
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.fetchError'))
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try {
    const res = await getSummary()
    if (res.success) summary.value = res.data
  } catch {
    // silent – cards stay at 0
  }
}

async function fetchSources() {
  try {
    const res = await listSources()
    if (res.success) sources.value = res.data
  } catch {
    // silent
  }
}

function openEdit(lead: Lead) {
  openDialogEdit(lead.id, lead)
}

async function confirmDelete(lead: Lead) {
  if (!confirm(t('leads.deleteConfirm', { name: `${lead.firstName} ${lead.lastName}` }))) return
  try {
    const res = await deleteLead(lead.id)
    if (res.success) {
      $toast.success(t('leads.deleteSuccess'))
      fetchLeads()
      fetchSummary()
    } else {
      $toast.error(res.success ? '' : t('leads.deleteError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.deleteError'))
  }
}

onMounted(() => {
  fetchLeads()
  fetchSummary()
  fetchSources()
  on('lead:changed', () => {
    fetchLeads()
    fetchSummary()
  })
})

onBeforeUnmount(() => off('lead:changed'))

useSeoMeta({ title: () => t('leads.titleSeo') })
</script>
