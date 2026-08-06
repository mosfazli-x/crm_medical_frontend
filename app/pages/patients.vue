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
          {{ t('patients.resultsCount', { count: filteredPatients.length }) }}
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
            <tr v-if="loading" v-for="i in 5" :key="`skeleton-${i}`">
              <td colspan="7" class="p-4!">
                <v-skeleton-loader type="list-item" class="bg-transparent!" />
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

            <tr v-else-if="!filteredPatients.length">
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

            <tr
              v-else
              v-for="patient in filteredPatients"
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const { t } = useI18n()
import PatientFormDialog from '~/components/PatientFormDialog.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import { useEventBus } from '~/composables/useEventBus'

const { openEdit } = usePatientFormDialog()
const { apiFetch } = useApi()
const { on, off, emit } = useEventBus()
const { $toast } = useNuxtApp()
const { formatJalaliDate, formatGregorianDate } = useFormatting()

const patients = ref<any[]>([])
const loading = ref(true)
const profileDialog = ref(false)
const selectedProfile = ref<any>(null)
const smsDialog = ref(false)
const selectedSmsPatient = ref<any>(null)
const smsText = ref('')

// ─── Search / Filter / Sort ───
const searchQuery = ref('')
const maritalFilter = ref('all')
const sortKey = ref('createdAt')
const sortDir = ref<'asc' | 'desc'>('desc')

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

const sortValue = (p: any, key: string) => {
  switch (key) {
    case 'fullName': return `${p.firstName || ''} ${p.lastName || ''}`
    case 'maritalStatus': return getMaritalLabel(p.maritalStatus) || ''
    default: return p[key] || ''
  }
}

const filteredPatients = computed(() => {
  let result = patients.value
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter((p) => {
      const fullName = `${p.firstName || ''} ${p.lastName || ''}`
      const reversed = `${p.lastName || ''} ${p.firstName || ''}`
      return (
        fullName.toLowerCase().includes(q) ||
        reversed.toLowerCase().includes(q) ||
        (p.nationalId || '').toLowerCase().includes(q) ||
        (p.phone || '').toLowerCase().includes(q)
      )
    })
  }
  if (maritalFilter.value !== 'all') {
    result = result.filter((p) => p.maritalStatus === maritalFilter.value)
  }
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...result].sort((a, b) => {
    const va = sortValue(a, sortKey.value)
    const vb = sortValue(b, sortKey.value)
    return String(va).localeCompare(String(vb), 'fa', { numeric: true }) * dir
  })
})

const maritalLabelMap = computed<Record<string, string>>(() => ({
  'متاهل': t('patients.married'),
  'مجرد': t('patients.single'),
  'مطلقه': t('patients.divorced'),
  'بیوه': t('patients.widowed'),
}))

const getMaritalLabel = (status: string) => status ? (maritalLabelMap.value[status] || status) : ''

const maritalBadgeClass = (status: string) => {
  const badgeMap: Record<string, string> = {
    'متاهل': 'crm-badge crm-badge-emerald',
    'مجرد': 'crm-badge crm-badge-blue',
    'مطلقه': 'crm-badge crm-badge-amber',
    'بیوه': 'crm-badge crm-badge-neutral',
  }
  return badgeMap[status] || 'crm-badge crm-badge-neutral'
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

const fetchPatients = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/api/patients', { baseURL: useRuntimeConfig().public.apiBase })
    if (response.success) patients.value = response.data
    else $toast.error(t('patients.fetchError'))
  } catch {
    $toast.error(t('patients.serverError'))
  } finally {
    loading.value = false
  }
}

const openPatientProfile = (patient: any) => {
  selectedProfile.value = patient
  profileDialog.value = true
}

const openFullRecord = async (patient: any) => {
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

const openPatientForEdit = async (patient: any) => {
  try {
    const result = await apiFetch(`/api/patients/${patient.id}/profile`)
    if (result.success && result.data) openEdit(patient.id, result.data)
    else $toast.error(t('patients.fetchForEditError'))
  } catch {
    $toast.error(t('patients.serverError'))
  }
}

const openSmsModal = (patient: any) => {
  selectedSmsPatient.value = patient
  smsText.value = ''
  smsDialog.value = true
}

const sendSms = async () => {
  if (!smsText.value.trim()) {
    $toast.error(t('patients.smsEmptyError'))
    return
  }
  try {
    await apiFetch('/api/patients/send-sms', {
      method: 'POST',
      body: { phone: selectedSmsPatient.value.phone, text: smsText.value },
    })
    $toast.success(t('patients.smsSentSuccess'))
    smsDialog.value = false
  } catch (err: any) {
    $toast.error(err.data?.error || t('patients.smsSendError'))
  }
}

const confirmDelete = async (patient: any) => {
  if (!confirm(t('patients.deleteConfirm', { name: `${patient.firstName} ${patient.lastName}` }))) return
  try {
    const response = await apiFetch(`/api/patients/${patient.id}`, { method: 'DELETE' })
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

onBeforeUnmount(() => off('patient:changed'))

useSeoMeta({ title: () => t('patients.titleSeo'), ogTitle: () => t('patients.ogTitle') })
</script>
