<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('patients.title') }}</h1>
        <p class="dash-head__date">{{ t('patients.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <AddNewPatientButton />
        <PatientFormDialog />
      </div>
    </header>

    <!-- ─── Toolbar: search / filter / refresh ─── -->
    <div class="asa-toolbar">
      <div class="asa-field asa-field--search">
        <v-text-field v-model="searchQuery" variant="solo" density="comfortable" hide-details clearable
          :placeholder="t('patients.searchPlaceholder')" prepend-inner-icon="mdi-magnify" />
      </div>
      <div class="asa-field asa-field--select">
        <v-select v-model="maritalFilter" :items="maritalFilterOptions" item-title="title" item-value="value"
          variant="solo" density="comfortable" hide-details :label="t('patients.filterMaritalStatus')" />
      </div>
      <div class="asa-field asa-field--select">
        <v-select v-model="insuranceFilter" :items="insuranceTypeOptions" item-title="title" item-value="value"
          variant="solo" density="comfortable" hide-details :label="t('patients.filterInsuranceType')" />
      </div>
      <v-menu :close-on-content-click="false" location="bottom end">
        <template #activator="{ props }">
          <button v-bind="props" type="button" class="asa-btn asa-btn--ghost asa-btn--sm asa-btn--filters"
            :aria-label="t('patients.moreFilters')">
            <v-icon size="16">mdi-tune-variant</v-icon>
            {{ t('patients.moreFilters') }}
            <span v-if="advancedFilterCount" class="asa-pill asa-pill--teal asa-pill--dot">{{ advancedFilterCount }}</span>
          </button>
        </template>
        <div class="asa-filters-pop">
          <p class="asa-filters-pop__title">{{ t('patients.filterRegistrationDate') }}</p>
          <div class="flex gap-2!">
            <v-text-field v-model="createdFrom" type="date" variant="outlined" density="comfortable" hide-details
              :label="t('patients.filterDateFrom')" />
            <v-text-field v-model="createdTo" type="date" variant="outlined" density="comfortable" hide-details
              :label="t('patients.filterDateTo')" />
          </div>
          <p class="asa-filters-pop__title mt-3!">{{ t('patients.filterBirthDate') }}</p>
          <div class="flex gap-2!">
            <v-text-field v-model="birthFrom" type="date" variant="outlined" density="comfortable" hide-details
              :label="t('patients.filterDateFrom')" />
            <v-text-field v-model="birthTo" type="date" variant="outlined" density="comfortable" hide-details
              :label="t('patients.filterDateTo')" />
          </div>
        </div>
      </v-menu>
      <div class="flex-1! min-w-0" />
      <span class="asa-pill asa-pill--teal whitespace-nowrap!">
        {{ t('patients.resultsCount', { count: total }) }}
      </span>
      <button v-if="hasActiveFilters" type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearFilters">
        <v-icon size="14">mdi-filter-remove-outline</v-icon>
        {{ t('patients.clearFilters') }}
      </button>
      <v-tooltip :text="t('patients.refresh')" location="top">
        <template #activator="{ props }">
          <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loading"
            :aria-label="t('patients.refresh')" @click="fetchPatients">
            <v-icon :size="18" :class="{ 'animate-spin!': loading }">mdi-refresh</v-icon>
          </button>
        </template>
      </v-tooltip>
    </div>

    <!-- ─── Loading skeletons ─── -->
    <div v-if="loading && !patients.length" class="space-y-5!">
      <div class="grid! grid-cols-2! lg:grid-cols-4! gap-3! sm:gap-4!">
        <div v-for="n in 4" :key="`s-${n}`" class="asa-skel h-32! rounded-[22px]!" />
      </div>
      <div class="asa-skel h-80! rounded-[22px]!" />
    </div>

    <!-- ─── Empty: active filters ─── -->
    <div v-else-if="!patients.length && hasActiveFilters" class="asa-card asa-empty">
      <span class="asa-tint asa-tint--indigo" aria-hidden="true">
        <v-icon icon="mdi-filter-off-outline" size="32" />
      </span>
      <p class="asa-empty__title">{{ t('patients.noFilterResults') }}</p>
      <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearFilters">
        <v-icon size="14">mdi-filter-remove-outline</v-icon>
        {{ t('patients.clearFilters') }}
      </button>
    </div>

    <!-- ─── Empty: no patients ─── -->
    <div v-else-if="!patients.length" class="asa-card asa-empty">
      <span class="asa-tint asa-tint--green" aria-hidden="true">
        <v-icon icon="mdi-account-group-outline" size="32" />
      </span>
      <p class="asa-empty__title">{{ t('patients.noPatients') }}</p>
    </div>

    <!-- ─── Patient list ─── -->
    <template v-else>
      <!-- Desktop table (lg and up) -->
      <section class="asa-sec hidden! lg:block!">
        <div class="asa-card asa-table-card">
          <div class="asa-table-wrap">
            <table class="asa-table">
              <thead>
                <tr>
                  <th>
                    <button type="button" class="asa-th-sort" @click="toggleSort('fullName')">
                      {{ t('patients.fullName') }}
                      <v-icon size="14" class="asa-th-sort-icon">{{ sortIcon('fullName') }}</v-icon>
                    </button>
                  </th>
                  <th>
                    <button type="button" class="asa-th-sort" @click="toggleSort('nationalId')">
                      {{ t('patients.nationalId') }}
                      <v-icon size="14" class="asa-th-sort-icon">{{ sortIcon('nationalId') }}</v-icon>
                    </button>
                  </th>
                  <th>
                    <button type="button" class="asa-th-sort" @click="toggleSort('phone')">
                      {{ t('patients.phone') }}
                      <v-icon size="14" class="asa-th-sort-icon">{{ sortIcon('phone') }}</v-icon>
                    </button>
                  </th>
                  <th>
                    <button type="button" class="asa-th-sort" @click="toggleSort('birthDate')">
                      {{ t('patients.birthDate') }}
                      <v-icon size="14" class="asa-th-sort-icon">{{ sortIcon('birthDate') }}</v-icon>
                    </button>
                  </th>
                  <th>
                    <button type="button" class="asa-th-sort" @click="toggleSort('maritalStatus')">
                      {{ t('patients.maritalStatus') }}
                      <v-icon size="14" class="asa-th-sort-icon">{{ sortIcon('maritalStatus') }}</v-icon>
                    </button>
                  </th>
                  <th>
                    <button type="button" class="asa-th-sort" @click="toggleSort('createdAt')">
                      {{ t('patients.registrationDate') }}
                      <v-icon size="14" class="asa-th-sort-icon">{{ sortIcon('createdAt') }}</v-icon>
                    </button>
                  </th>
                  <th class="text-center!">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="patient in patients" :key="patient.id" class="asa-tr" @click="openPatientProfile(patient)">
                  <td>
                    <div class="flex items-center gap-3">
                      <span class="asa-tint asa-avatar asa-avatar--sm" :class="tintOf(patient)">
                        {{ initialsOf(patient) }}
                      </span>
                      <span class="asa-td-name">{{ patient.firstName }} {{ patient.lastName }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span class="crm-ltr font-mono text-[0.8125rem]! tracking-wider!">{{ patient.nationalId }}</span>
                      <span v-if="patient.isForeign" class="asa-pill asa-pill--teal !text-[10px] font-sans">
                        {{ countryName(patient.nationality, 'fa') || patient.nationality || 'خارجی' }}
                      </span>
                    </div>
                  </td>
                  <td class="crm-ltr font-mono text-[0.8125rem]! tracking-wider!">{{ patient.phone || '-' }}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <span>{{ formatGregorianDate(patient.birthDate) }}</span>
                      <span v-if="patient.birthDateExact === false" class="asa-pill asa-pill--amber !text-[10px]">
                        {{ t('patients.approxDob') }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span :class="maritalPillClass(patient.maritalStatus)">
                      {{ getMaritalLabel(patient.maritalStatus) || t('patients.unknown') }}
                    </span>
                  </td>
                  <td>{{ formatJalaliDate(patient.createdAt) }}</td>
                  <td class="text-center!">
                    <div class="flex items-center justify-center gap-0.5">
                      <v-tooltip :text="t('patients.fullRecord')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn"
                            :aria-label="t('patients.fullRecord')" @click.stop="navigateTo(`/patients/${patient.id}`)">
                            <v-icon size="18">mdi-file-document-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip :text="t('patients.printRecord')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--blue"
                            :aria-label="t('patients.printRecord')" @click.stop="openFullRecord(patient)">
                            <v-icon size="18">mdi-printer-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip :text="t('patients.sendSms')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--teal"
                            :aria-label="t('patients.sendSms')" @click.stop="openSmsModal(patient)">
                            <v-icon size="18">mdi-message-text-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip :text="t('patients.editInfo')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--green"
                            :aria-label="t('patients.editInfo')" @click.stop="openPatientForEdit(patient)">
                            <v-icon size="18">mdi-pencil-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip :text="t('patients.deleteRecord')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--rose"
                            :aria-label="t('patients.deleteRecord')" @click.stop="confirmDelete(patient)">
                            <TrashBin class="w-4.5! h-4.5! fill-current" />
                          </button>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tablet / mobile card list -->
      <div class="lg:hidden! mt-4! space-y-3!">
        <article v-for="patient in patients" :key="`c-${patient.id}`" class="asa-card asa-pcard"
          @click="openPatientProfile(patient)">
          <span class="asa-tint asa-avatar asa-avatar--lg" :class="tintOf(patient)">
            {{ initialsOf(patient) }}
          </span>
          <div class="asa-pcard__main">
            <p class="asa-pcard__name">
              <span class="truncate!">{{ patient.firstName }} {{ patient.lastName }}</span>
              <span v-if="patient.isForeign" class="asa-pill asa-pill--amber !text-[10px]">
                {{ countryName(patient.nationality, 'fa') || patient.nationality || 'خارجی' }}
              </span>
            </p>
            <p class="asa-pcard__meta">
              <span class="crm-ltr font-mono">{{ patient.nationalId }}</span>
              <span class="asa-dot-inline" aria-hidden="true" />
              <span>{{ formatGregorianDate(patient.birthDate) }}</span>
              <span v-if="patient.birthDateExact === false">{{ t('patients.approxDob') }}</span>
              <span class="asa-dot-inline" aria-hidden="true" />
              <span :class="maritalPillClass(patient.maritalStatus)">
                {{ getMaritalLabel(patient.maritalStatus) || t('patients.unknown') }}
              </span>
            </p>
          </div>
          <div class="asa-pcard__actions">
            <button type="button" class="asa-icon-btn" :aria-label="t('patients.fullRecord')"
              @click.stop="navigateTo(`/patients/${patient.id}`)">
              <v-icon size="18">mdi-file-document-outline</v-icon>
            </button>
            <button type="button" class="asa-icon-btn asa-icon-btn--teal" :aria-label="t('patients.sendSms')"
              @click.stop="openSmsModal(patient)">
              <v-icon size="18">mdi-message-text-outline</v-icon>
            </button>
            <button type="button" class="asa-icon-btn asa-icon-btn--green" :aria-label="t('patients.editInfo')"
              @click.stop="openPatientForEdit(patient)">
              <v-icon size="18">mdi-pencil-outline</v-icon>
            </button>
            <button type="button" class="asa-icon-btn asa-icon-btn--rose" :aria-label="t('patients.deleteRecord')"
              @click.stop="confirmDelete(patient)">
              <TrashBin class="w-4! h-4! fill-current" />
            </button>
          </div>
          <v-icon size="20" class="asa-pcard__chev">mdi-chevron-right</v-icon>
        </article>
      </div>

      <!-- Infinite scroll footer -->
      <div class="mt-4! flex flex-col items-center gap-2">
        <div ref="sentinelRef" class="h-px w-full" aria-hidden="true" />
        <div v-if="loadingMore" class="flex items-center gap-2 text-sm" style="color: var(--asa-label-2)">
          <v-progress-circular indeterminate size="18" width="2" />
          {{ t('patients.loadingMore') }}
        </div>
        <p v-else-if="!hasMore" class="text-sm" style="color: var(--asa-label-3)">
          {{ t('patients.endOfList') }}
        </p>
      </div>
    </template>

    <!-- ─── Profile Dialog ─── -->
    <v-dialog v-model="profileDialog" max-width="620">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-center gap-4 min-w-0">
            <span class="asa-tint asa-avatar asa-avatar--xl" :class="tintOf(selectedProfile)">
              {{ initialsOf(selectedProfile) }}
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-xl! truncate!">
                {{ selectedProfile.firstName }} {{ selectedProfile.lastName }}
              </h2>
              <span class="asa-dialog__sub crm-ltr font-mono">{{ selectedProfile.nationalId }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="profileDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="grid grid-cols-1! sm:grid-cols-2! gap-x-6! gap-y-5!">
            <div v-for="field in profileFields" :key="field.label" class="min-w-0">
              <p class="asa-info-label">{{ field.label }}</p>
              <p class="asa-info-value" :class="field.ltr ? 'crm-ltr' : ''">{{ field.value }}</p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="profileDialog = false">
            {{ t('common.close') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── SMS Dialog ─── -->
    <v-dialog v-model="smsDialog" max-width="520">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('patients.smsTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('patients.sendSms') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="smsDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="selectedSmsPatient" class="asa-note">
            <span class="asa-tint asa-tint--teal asa-tint--sm" aria-hidden="true">
              <v-icon size="16">mdi-account-outline</v-icon>
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ t('patients.recipient') }}</p>
              <p class="asa-note__value truncate!">
                {{ selectedSmsPatient.firstName }} {{ selectedSmsPatient.lastName }}
                <span class="crm-ltr font-mono">&lrm;({{ selectedSmsPatient.phone }})</span>
              </p>
            </div>
          </div>

          <div class="mt-5!">
            <label class="asa-field-label">{{ t('patients.messageText') }}</label>
            <textarea v-model="smsText" rows="4" class="asa-textarea" :placeholder="t('patients.smsPlaceholder')" />
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="smsDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button class="asa-btn asa-btn--primary" @click="sendSms">
            {{ t('patients.sendSmsBtn') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import PatientFormDialog from '~/components/PatientFormDialog.vue'
import { INSURANCE_TYPE_VALUES } from '~/types/insurance'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import { useEventBus } from '~/composables/useEventBus'
import type { PatientListItem, PatientProfile } from '~/types/patient'
import { countryName } from '~/composables/useCountries'

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

// ─── Avatar helpers (Apple tint palette) ───
const FULL_TINTS = [
  'asa-tint--teal',
  'asa-tint--green',
  'asa-tint--orange',
  'asa-tint--rose',
  'asa-tint--indigo',
]

const initialsOf = (p: PatientListItem | null) => {
  if (!p) return ''
  const initials = `${p.firstName?.charAt(0) || ''}${p.lastName?.charAt(0) || ''}`.toUpperCase()
  return initials || '·'
}

const tintOf = (p: PatientListItem | null) => {
  const key = `${p?.firstName || ''}${p?.lastName || ''}${p?.nationalId || ''}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return FULL_TINTS[hash % FULL_TINTS.length]
}

// ─── Search / Filter / Sort ───
const PAGE_LIMIT = 20

const searchQuery = ref('')
const maritalFilter = ref('all')
const insuranceFilter = ref('all')
const createdFrom = ref('')
const createdTo = ref('')
const birthFrom = ref('')
const birthTo = ref('')
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

const insuranceTypeOptions = computed(() => [
  { title: t('patients.filterAllInsuranceTypes'), value: 'all' },
  ...INSURANCE_TYPE_VALUES.map((item) => ({ title: item.label, value: item.key })),
])

const advancedFilterCount = computed(() =>
  [createdFrom.value, createdTo.value, birthFrom.value, birthTo.value].filter(Boolean).length
)

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' ||
  maritalFilter.value !== 'all' ||
  insuranceFilter.value !== 'all' ||
  advancedFilterCount.value > 0
)

const clearFilters = () => {
  searchQuery.value = ''
  maritalFilter.value = 'all'
  insuranceFilter.value = 'all'
  createdFrom.value = ''
  createdTo.value = ''
  birthFrom.value = ''
  birthTo.value = ''
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
      insuranceType: insuranceFilter.value,
      createdFrom: createdFrom.value || undefined,
      createdTo: createdTo.value || undefined,
      birthFrom: birthFrom.value || undefined,
      birthTo: birthTo.value || undefined,
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

const maritalPillClass = (status: string | null) => {
  const pillMap: Record<string, string> = {
    'متاهل': 'asa-pill asa-pill--green',
    'مجرد': 'asa-pill asa-pill--teal',
    'مطلقه': 'asa-pill asa-pill--amber',
    'بیوه': 'asa-pill asa-pill--neutral',
  }
  return (status && pillMap[status]) || 'asa-pill asa-pill--neutral'
}

const profileFields = computed(() => {
  if (!selectedProfile.value) return []
  const p = selectedProfile.value
  return [
    { label: t('patients.phoneLabel'), value: p.phone || t('patients.notRegistered'), ltr: true },
    { label: t('patients.nationalityLabel'), value: p.isForeign ? (countryName(p.nationality, 'fa') || p.nationality || '-') : '-', ltr: false },
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
  } catch (err: unknown) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('patients.smsSendError'))
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
  } catch (err: unknown) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('patients.serverError'))
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

watch([maritalFilter, insuranceFilter, createdFrom, createdTo, birthFrom, birthTo, sortKey, sortDir], () => fetchPatients())

onBeforeUnmount(() => {
  off('patient:changed')
  disconnectObserver()
  if (searchTimer) clearTimeout(searchTimer)
})

useSeoMeta({ title: () => t('patients.titleSeo'), ogTitle: () => t('patients.ogTitle') })
</script>

<style scoped>
/* ── Frosted, sticky toolbar ─────────────────── */
.asa-toolbar {
  position: sticky;
  top: 0.75rem;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: 1.25rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-bg-card) 82%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.8);
  backdrop-filter: blur(18px) saturate(1.8);
  box-shadow: var(--asa-card-shadow);
  margin-bottom: 1.25rem;
}

.asa-field--search {
  flex: 1 1 14rem;
  min-width: 12rem;
}

.asa-field--select {
  flex: 0 1 12.5rem;
  min-width: 11rem;
}

/* Apple-styled Vuetify solo fields */
.asa-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.asa-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.asa-field :deep(.v-field__overlay) {
  background: transparent;
}

.asa-field :deep(.v-field__input),
.asa-field :deep(.v-field__input::placeholder),
.asa-field :deep(.v-select__selection),
.asa-field :deep(.v-label) {
  color: var(--asa-label);
}

.asa-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.asa-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.asa-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

/* ── Avatar (initials, Apple tint) ───────────── */
.asa-avatar {
  font-size: 0.875rem;
  font-weight: 700;
}

.asa-avatar--sm {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
}

.asa-avatar--lg {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  font-size: 1rem;
}

.asa-avatar--xl {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1.125rem;
  font-size: 1.125rem;
}

/* ── Compact icon buttons ────────────────────── */
.asa-icon-btn {
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
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.asa-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.dark .asa-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.asa-icon-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.asa-icon-btn--teal {
  color: var(--asa-accent-deep);
}

.dark .asa-icon-btn--teal {
  color: var(--asa-accent);
}

.asa-icon-btn--blue {
  color: #0a84ff;
}

.asa-icon-btn--green {
  color: var(--asa-green);
}

.asa-icon-btn--rose {
  color: var(--asa-rose);
}

/* ── Desktop table ───────────────────────────── */
.asa-table-card {
  padding: 0;
  overflow: hidden;
}

.asa-table-wrap {
  overflow-x: auto;
}

.asa-table {
  width: 100%;
  min-width: 46rem;
  border-collapse: collapse;
  text-align: start;
}

.asa-table thead th {
  padding: 0.875rem 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.asa-th-sort {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  cursor: pointer;
  transition: color 150ms var(--ease-default);
}

.asa-th-sort:hover {
  color: var(--asa-label);
}

.asa-th-sort-icon {
  opacity: 0.6;
}

.asa-table tbody td {
  padding: 0.875rem 1rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-top: 1px solid var(--asa-sep);
  white-space: nowrap;
  vertical-align: middle;
}

.asa-table tbody tr {
  cursor: pointer;
  transition: background-color 150ms var(--ease-default);
}

.asa-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .asa-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.asa-td-name {
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Tablet / mobile cards ───────────────────── */
.asa-pcard {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  cursor: pointer;
}

.asa-pcard__main {
  min-width: 0;
  flex: 1 1 auto;
}

.asa-pcard__name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-pcard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.asa-dot-inline {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

.asa-pcard__actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
}

.asa-pcard__chev {
  color: var(--asa-label-3);
  flex-shrink: 0;
}

:dir(rtl) .asa-pcard__chev {
  transform: scaleX(-1);
}

/* ── Neutral pill / info row / empty / note ──── */
.asa-pill--neutral {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
}

.asa-pill--dot {
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.3125rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 700;
  justify-content: center;
}

.asa-btn--filters {
  gap: 0.375rem;
}

.asa-filters-pop {
  min-width: 22rem;
  padding: 1rem 1.125rem 1.125rem;
  background: var(--asa-surface, #fff);
  border: 1px solid var(--asa-border, rgba(0, 0, 0, 0.08));
  border-radius: 1rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.asa-filters-pop__title {
  margin-bottom: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--asa-label-2);
}

.asa-info-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--asa-label-2);
  margin-bottom: 0.375rem;
}

.asa-info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

.asa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.asa-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 1rem;
  background: var(--asa-accent-soft);
  color: var(--asa-label);
}

.asa-note__label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.asa-note__value {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-textarea {
  display: block;
  width: 100%;
  padding: 0.75rem 0.875rem;
  border-radius: 0.875rem;
  border: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label);
  font: inherit;
  font-size: 0.875rem;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.asa-textarea:focus {
  outline: none;
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.asa-textarea::placeholder {
  color: var(--asa-label-3);
}

@media (max-width: 480px) {

  .asa-field--search,
  .asa-field--select {
    flex-basis: 100% !important;
  }

  .asa-pcard__actions {
    gap: 0;
  }
}
</style>