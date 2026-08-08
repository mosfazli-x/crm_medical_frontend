<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('patients.title')" :subtitle="$t('patients.subtitle')">
      <template #actions>
        <AddNewPatientButton />
        <PatientFormDialog />
      </template>
    </UiPageHeader>

    <UiContentCard>
      <!-- Toolbar: search / filter / refresh -->
      <div class="flex flex-wrap items-center gap-3 mb-4 px-3 py-3">
        <v-text-field
          v-model="searchQuery"
          variant="outlined"
          density="compact"
          :placeholder="$t('patients.searchPlaceholder')"
          prepend-inner-icon="mdi-magnify"
          hide-details
          clearable
          class="max-w-xs"
        />
        <v-select
          v-model="maritalFilter"
          :items="maritalFilterOptions"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="compact"
          hide-details
          class="max-w-[180px]"
          :label="$t('patients.filterMaritalStatus')"
        />
        <div class="flex-1 min-w-[8rem]" />
        <span class="text-sm font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {{ t('patients.resultsCount', { count: total }) }}
        </span>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="crm-btn crm-btn-ghost !px-3 !py-1.5 !text-xs"
          @click="clearFilters"
        >
          <v-icon start size="14">mdi-filter-remove-outline</v-icon>
          {{ $t('patients.clearFilters') }}
        </button>
        <v-tooltip :text="$t('patients.refresh')" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn"
              :loading="loading" @click="fetchPatients">
              <v-icon size="20">mdi-refresh</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
      </div>

      <div class="crm-table-wrap">
        <table class="crm-table">
          <thead>
            <tr>
              <th>
                <button type="button" class="crm-th-sort" @click="toggleSort('fullName')">
                  {{ $t('patients.fullName') }}
                  <v-icon size="14" class="crm-th-sort-icon">{{ sortIcon('fullName') }}</v-icon>
                </button>
              </th>
              <th>
                <button type="button" class="crm-th-sort" @click="toggleSort('nationalId')">
                  {{ $t('patients.nationalId') }}
                  <v-icon size="14" class="crm-th-sort-icon">{{ sortIcon('nationalId') }}</v-icon>
                </button>
              </th>
              <th>
                <button type="button" class="crm-th-sort" @click="toggleSort('phone')">
                  {{ $t('patients.phone') }}
                  <v-icon size="14" class="crm-th-sort-icon">{{ sortIcon('phone') }}</v-icon>
                </button>
              </th>
              <th>
                <button type="button" class="crm-th-sort" @click="toggleSort('birthDate')">
                  {{ $t('patients.birthDate') }}
                  <v-icon size="14" class="crm-th-sort-icon">{{ sortIcon('birthDate') }}</v-icon>
                </button>
              </th>
              <th>
                <button type="button" class="crm-th-sort" @click="toggleSort('maritalStatus')">
                  {{ $t('patients.maritalStatus') }}
                  <v-icon size="14" class="crm-th-sort-icon">{{ sortIcon('maritalStatus') }}</v-icon>
                </button>
              </th>
              <th>
                <button type="button" class="crm-th-sort" @click="toggleSort('createdAt')">
                  {{ $t('patients.registrationDate') }}
                  <v-icon size="14" class="crm-th-sort-icon">{{ sortIcon('createdAt') }}</v-icon>
                </button>
              </th>
              <th class="text-center!">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="loading && !patients.length">
              <tr v-for="i in 5" :key="`skeleton-${i}`">
                <td colspan="7" class="p-4!">
                  <v-skeleton-loader type="list-item" class="bg-transparent!" />
                </td>
              </tr>
            </template>

            <tr v-else-if="!patients.length && hasActiveFilters">
              <td colspan="7">
                <UiEmptyState :title="$t('patients.noFilterResults')">
                  <template #icon>
                    <v-icon icon="mdi-filter-off-outline" size="32" color="slate-400" />
                  </template>
                  <template #action>
                    <button class="crm-btn crm-btn-ghost" @click="clearFilters">{{ $t('patients.clearFilters') }}</button>
                  </template>
                </UiEmptyState>
              </td>
            </tr>

            <tr v-else-if="!patients.length">
              <td colspan="7">
                <UiEmptyState :title="$t('patients.noPatients')">
                  <template #icon>
                    <v-icon icon="mdi-account-group-outline" size="32" color="slate-400" />
                  </template>
                </UiEmptyState>
              </td>
            </tr>

            <tr
              v-for="patient in patients"
              v-else
              :key="patient.id"
              class="cursor-pointer group"
              @click="openPatientProfile(patient)"
            >
              <td class="crm-table-primary">{{ patient.firstName }} {{ patient.lastName }}</td>
              <td class="font-mono tracking-wider">{{ patient.nationalId }}</td>
              <td class="font-mono tracking-wider crm-ltr">{{ patient.phone || '-' }}</td>
              <td>
                <div class="flex items-center gap-1.5">
                  <span>{{ formatGregorianDate(patient.birthDate) }}</span>
                  <span v-if="patient.birthDateExact === false" class="crm-badge crm-badge-amber !text-[10px]">
                    {{ $t('patients.approxDob') }}
                  </span>
                </div>
              </td>
              <td>
                <span :class="maritalBadgeClass(patient.maritalStatus)">
                  {{ getMaritalLabel(patient.maritalStatus) || $t('patients.unknown') }}
                </span>
              </td>
              <td>{{ formatJalaliDate(patient.createdAt) }}</td>
              <td class="text-center!">
                <div class="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <v-tooltip :text="$t('patients.fullRecord')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn"
                        @click.stop="navigateTo(`/patients/${patient.id}`)">
                        <v-icon size="20">mdi-file-document-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.printRecord')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn text-blue-500!"
                        @click.stop="openFullRecord(patient)">
                        <v-icon size="20">mdi-printer-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.sendSms')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn"
                        @click.stop="openSmsModal(patient)">
                        <v-icon size="20">mdi-message-text-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.editInfo')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn text-emerald-500!"
                        @click.stop="openPatientForEdit(patient)">
                        <v-icon size="20">mdi-pencil-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.deleteRecord')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn crm-icon-btn-danger"
                        @click.stop="confirmDelete(patient)">
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

      <div v-if="patients.length" class="px-3 pb-4 flex flex-col items-center gap-2">
        <div ref="sentinelRef" class="h-px w-full" aria-hidden="true" />
        <div v-if="loadingMore" class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <v-progress-circular indeterminate size="18" width="2" />
          {{ $t('patients.loadingMore') }}
        </div>
        <p v-else-if="!hasMore" class="text-sm text-slate-400 dark:text-slate-500">
          {{ $t('patients.endOfList') }}
        </p>
      </div>
    </UiContentCard>

    <!-- Profile Dialog -->
    <v-dialog v-model="profileDialog" max-width="650">
      <div v-if="selectedProfile" class="crm-dialog">
        <div class="crm-dialog-header bg-slate-50/50! dark:bg-slate-800/50!">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-periwinkle text-electric-sapphire flex items-center justify-center text-2xl font-bold">
              {{ selectedProfile.firstName?.charAt(0) }}{{ selectedProfile.lastName?.charAt(0) }}
            </div>
            <div>
              <h2 class="crm-dialog-title text-xl!">{{ selectedProfile.firstName }} {{ selectedProfile.lastName }}</h2>
              <p class="text-slate-500 font-mono mt-1">{{ selectedProfile.nationalId }}</p>
            </div>
          </div>
        </div>
        <div class="crm-dialog-body grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-for="field in profileFields" :key="field.label" class="space-y-1">
            <span class="crm-label mb-0!">{{ field.label }}</span>
            <p class="text-slate-800 dark:text-slate-100 font-medium" :class="field.ltr ? 'crm-ltr' : ''">{{ field.value }}</p>
          </div>
        </div>
        <div class="crm-dialog-footer">
          <button class="crm-btn crm-btn-ghost" @click="profileDialog = false">{{ $t('common.close') }}</button>
        </div>
      </div>
    </v-dialog>

    <!-- SMS Dialog -->
    <v-dialog v-model="smsDialog" max-width="500">
      <div class="crm-dialog">
        <div class="crm-dialog-header">
          <h3 class="crm-dialog-title">{{ $t('patients.smsTitle') }}</h3>
          <v-btn icon variant="text" size="small" @click="smsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="crm-dialog-body">
          <div v-if="selectedSmsPatient" class="crm-info-box">
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ $t('patients.recipient') }}</p>
            <p class="font-bold text-electric-sapphire mt-1">
              {{ selectedSmsPatient.firstName }} {{ selectedSmsPatient.lastName }}
              <span class="font-mono text-cornflower-blue text-sm mr-2 crm-ltr">({{ selectedSmsPatient.phone }})</span>
            </p>
          </div>

          <label class="crm-label">{{ $t('patients.messageText') }}</label>
          <textarea v-model="smsText" rows="4" class="crm-input crm-textarea"
            :placeholder="$t('patients.smsPlaceholder')" />
        </div>

        <div class="crm-dialog-footer">
          <button class="crm-btn crm-btn-danger" @click="smsDialog = false">{{ $t('common.cancel') }}</button>
          <button class="crm-btn crm-btn-accent" @click="sendSms">{{ $t('patients.sendSmsBtn') }}</button>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import PatientFormDialog from '~/components/PatientFormDialog.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import { useEventBus } from '~/composables/useEventBus'
import type { PatientListItem, PatientProfile } from '~/types/patient'

const { t } = useI18n()

const { openEdit } = usePatientFormDialog()
const { apiFetch } = useApi()
const { listPatients } = usePatients()
const { on, off, emit } = useEventBus()
const { $toast } = useNuxtApp()
const { formatJalaliDate, formatGregorianDate } = useFormatting()

const patients = ref<PatientListItem[]>([])
const loading = ref(true)
const profileDialog = ref(false)
const selectedProfile = ref<PatientListItem | null>(null)
const smsDialog = ref(false)
const selectedSmsPatient = ref<PatientListItem | null>(null)
const smsText = ref('')

// ─── Search / Filter / Sort ───
const PAGE_LIMIT = 20

const searchQuery = ref('')
const maritalFilter = ref('all')
const sortKey = ref('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const total = ref(0)
const loadingMore = ref(false)

const maritalFilterOptions = computed(() => [
  { title: t('patients.filterAllMaritalStatus'), value: 'all' },
  { title: t('patients.married'), value: 'متاهل' },
  { title: t('patients.single'), value: 'مجرد' },
  { title: t('patients.divorced'), value: 'مطلقه' },
  { title: t('patients.widowed'), value: 'بیوه' },
])

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' || maritalFilter.value !== 'all'
)

const clearFilters = () => {
  searchQuery.value = ''
  maritalFilter.value = 'all'
}

const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = key === 'createdAt' ? 'desc' : 'asc'
  }
}

const sortIcon = (key: string) => {
  if (sortKey.value !== key) return 'mdi-sort'
  return sortDir.value === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down'
}

const SORT_KEY_TO_PARAM: Record<string, string> = {
  fullName: 'full_name',
  nationalId: 'national_id',
  phone: 'phone',
  birthDate: 'birth_date',
  maritalStatus: 'marital_status',
  createdAt: 'created_at',
}

const hasMore = computed(() => patients.value.length < total.value)

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null
let requestSeq = 0
let searchTimer: ReturnType<typeof setTimeout> | null = null

const disconnectObserver = () => {
  observer?.disconnect()
  observer = null
}

const observeSentinel = () => {
  if (!sentinelRef.value) return
  disconnectObserver()
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (
        entry?.isIntersecting &&
        hasMore.value &&
        !loading.value &&
        !loadingMore.value
      ) {
        page.value += 1
        loadPage(page.value)
      }
    },
    { rootMargin: '200px 0px' }
  )
  observer.observe(sentinelRef.value)
}

const loadPage = async (pageNum: number) => {
  const seq = ++requestSeq
  if (pageNum === 1) loading.value = true
  else loadingMore.value = true
  try {
    const response = await listPatients({
      page: pageNum,
      limit: PAGE_LIMIT,
      q: searchQuery.value.trim(),
      maritalStatus: maritalFilter.value,
      sort: `${SORT_KEY_TO_PARAM[sortKey.value]}_${sortDir.value}`,
    })
    if (seq !== requestSeq) return
    if (!response.success) {
      $toast.error(t('patients.fetchError'))
      return
    }
    total.value = response.pagination?.total ?? response.data.length
    if (pageNum === 1) {
      patients.value = response.data
    } else {
      const existing = new Set(patients.value.map((p) => p.id))
      patients.value = [
        ...patients.value,
        ...response.data.filter((p) => !existing.has(p.id)),
      ]
    }
    await nextTick()
    observeSentinel()
  } catch {
    if (seq === requestSeq) $toast.error(t('patients.serverError'))
  } finally {
    if (seq === requestSeq) {
      loading.value = false
      loadingMore.value = false
    }
  }
}

const fetchPatients = () => {
  page.value = 1
  loadPage(1)
}

const maritalLabelMap = computed<Record<string, string>>(() => ({
  'متاهل': t('patients.married'),
  'مجرد': t('patients.single'),
  'مطلقه': t('patients.divorced'),
  'بیوه': t('patients.widowed'),
}))

const getMaritalLabel = (status: string | null) => status ? (maritalLabelMap.value[status] || status) : ''

const maritalBadgeClass = (status: string | null) => {
  const badgeMap: Record<string, string> = {
    'متاهل': 'crm-badge crm-badge-emerald',
    'مجرد': 'crm-badge crm-badge-blue',
    'مطلقه': 'crm-badge crm-badge-amber',
    'بیوه': 'crm-badge crm-badge-neutral',
  }
  return (status && badgeMap[status]) || 'crm-badge crm-badge-neutral'
}

const profileFields = computed(() => {
  if (!selectedProfile.value) return []
  const p = selectedProfile.value
  return [
    { label: t('patients.phoneLabel'), value: p.phone || t('patients.notRegistered'), ltr: true },
    { label: t('patients.birthDateLabel'), value: formatGregorianDate(p.birthDate) + (p.birthDateExact === false ? ` (${t('patients.approxDob')})` : '') },
    { label: t('patients.maritalStatusLabel'), value: getMaritalLabel(p.maritalStatus) || t('patients.unknown') },
    { label: t('patients.registrationDateLabel'), value: formatJalaliDate(p.createdAt) },
  ]
})

const openPatientProfile = (patient: PatientListItem) => {
  selectedProfile.value = patient
  profileDialog.value = true
}

const openFullRecord = async (patient: PatientListItem) => {
  try {
    const { token } = useAuth()
    const apiBase = useRuntimeConfig().public.apiBase || ''
    const url = `${apiBase}/api/patients/${patient.id}/full-record`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (!response.ok) throw new Error('Failed to fetch record')

    const html = await response.text()
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  } catch {
    $toast.error(t('patients.fetchFullRecordError'))
  }
}

const openPatientForEdit = async (patient: PatientListItem) => {
  try {
    const result = await apiFetch<{ success: boolean; data: PatientProfile }>(`/api/patients/${patient.id}/profile`)
    if (result.success && result.data) openEdit(patient.id, result.data)
    else $toast.error(t('patients.fetchForEditError'))
  } catch {
    $toast.error(t('patients.serverError'))
  }
}

const openSmsModal = (patient: PatientListItem) => {
  selectedSmsPatient.value = patient
  smsText.value = ''
  smsDialog.value = true
}

const sendSms = async () => {
  const patient = selectedSmsPatient.value
  if (!patient || !smsText.value.trim()) {
    $toast.error(t('patients.smsEmptyError'))
    return
  }
  try {
    await apiFetch('/api/patients/send-sms', {
      method: 'POST',
      body: { phone: patient.phone, text: smsText.value },
    })
    $toast.success(t('patients.smsSentSuccess'))
    smsDialog.value = false
  } catch (err: any) {
    $toast.error(err.data?.error || t('patients.smsSendError'))
  }
}

const confirmDelete = async (patient: PatientListItem) => {
  if (!confirm(t('patients.deleteConfirm', { name: `${patient.firstName} ${patient.lastName}` }))) return
  try {
    const response = await apiFetch<{ success: boolean; error?: string }>(`/api/patients/${patient.id}`, { method: 'DELETE' })
    if (response.success) {
      $toast.success(t('patients.deleteSuccess'))
      emit('patient:changed')
    } else {
      $toast.error(response.error || t('patients.deleteError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('patients.serverError'))
  }
}

onMounted(() => {
  fetchPatients()
  on('patient:changed', fetchPatients)
})

watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchPatients(), 400)
})

watch([maritalFilter, sortKey, sortDir], () => fetchPatients())

onBeforeUnmount(() => {
  off('patient:changed')
  disconnectObserver()
  if (searchTimer) clearTimeout(searchTimer)
})

useSeoMeta({ title: () => t('patients.titleSeo'), ogTitle: () => t('patients.ogTitle') })
</script>
