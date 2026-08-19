<template>
  <UiPageContainer class="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8" dir="rtl">

    <div class="!mb-8 flex flex-col md:flex-row md:!items-center justify-between !gap-6">
      <div>
        <h1 class="crm-page-title">{{ t('prescriptions.title') }}</h1>
        <p class="crm-page-subtitle">{{ t('prescriptions.subtitle') }}</p>
      </div>

      <div class="!relative !w-full md:!w-96 group">
        <div class="!absolute !inset-y-0 !right-0 !flex !items-center !pr-3.5 !pointer-events-none">
          <Icon name="lucide:search"
            class="!w-4 !h-4 !text-zinc-400 group-focus-within:!text-zinc-900 !transition-colors" />
        </div>
        <input v-model="searchQuery" type="text"
          class="!w-full !bg-white !border !border-zinc-200/80 !text-zinc-900 !text-xs !rounded-xl focus:!ring-4 focus:!ring-zinc-900/5 focus:!border-zinc-900 !block !pr-10 !pl-12 !py-3 !transition-all !outline-none placeholder:!text-zinc-400 !shadow-sm"
          :placeholder="t('prescriptions.searchPlaceholder')" @input="onSearchInput" />
        <div class="!absolute !inset-y-0 !left-3 !flex !items-center">
          <v-progress-circular v-if="searching" indeterminate size="14" width="2" color="#18181b" />
          <button v-else-if="searchQuery" @click="clearSearch"
            class="!p-1 !text-zinc-400 hover:!text-zinc-900 !transition-colors !rounded-lg hover:!bg-zinc-100">
            <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="searchResults.length > 0 && !selectedPatient"
      class="!mb-8 !bg-white !border !border-zinc-200/80 !rounded-2xl !p-2 !shadow-[0_8px_30px_rgb(0,0,0,0.04)] !animate-in !fade-in !slide-in-from-top-2 !duration-200">
      <div class="!px-3 !py-2 !border-b !border-zinc-100 !mb-1.5">
        <p class="!text-[10px] !font-bold !text-zinc-400 !tracking-wider !flex !items-center !gap-2">
          <Icon name="lucide:users" class="!w-3.5 !h-3.5" />
          {{ t('prescriptions.searchResultsTitle', { count: searchResults.length }) }}
        </p>
      </div>
      <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-1">
        <div v-for="patient in searchResults" :key="patient.id"
          class="!flex !items-center !gap-3.5 !p-3 !rounded-xl !cursor-pointer !transition-all !duration-200 !bg-white hover:!bg-zinc-50/80 !border !border-transparent hover:!border-zinc-200/60"
          @click="selectPatient(patient)">
          <div
            class="!w-9 !h-9 !rounded-lg !bg-zinc-100 !text-zinc-700 !flex !items-center !justify-center !text-xs !font-bold !border !border-zinc-200/40">
            {{ patient.firstName?.charAt(0) }}{{ patient.lastName?.charAt(0) }}
          </div>
          <div>
            <p class="!font-semibold !text-zinc-900 !text-xs !tracking-tight">{{ patient.firstName }} {{
              patient.lastName }}</p>
            <p class="!text-[10px] !text-zinc-400 !font-mono !mt-0.5 !tracking-wide">{{ patient.nationalId }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="searchQuery && !searching && searchResults.length === 0 && searchTouched && !selectedPatient"
      class="!mb-8 !bg-white !border !border-zinc-200/80 !rounded-2xl !py-10 !flex !flex-col !items-center !justify-center !text-center !shadow-sm">
      <div
        class="!w-10 !h-10 !bg-zinc-50 !rounded-xl !flex !items-center !justify-center !mb-3 !border !border-zinc-100">
        <Icon name="lucide:user-x" class="!w-4 !h-4 !text-zinc-400" />
      </div>
      <p class="!text-xs !font-semibold !text-zinc-900">{{ t('prescriptions.noResults') }}</p>
      <p class="!text-[11px] !text-zinc-400 !mt-1">{{ t('prescriptions.noResultsDesc') }}</p>
    </div>

    <template v-if="selectedPatient">

      <div
        class="!mb-8 !flex !flex-col sm:!flex-row !items-start sm:!items-center justify-between !gap-4 !p-5 !bg-white !border !border-zinc-200/80 !rounded-2xl !shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div class="!flex !items-center !gap-4">
          <div
            class="!w-11 !h-11 !rounded-xl !bg-zinc-900 !text-white !flex !items-center !justify-center !text-sm !font-bold">
            {{ selectedPatient.firstName?.charAt(0) }}{{ selectedPatient.lastName?.charAt(0) }}
          </div>
          <div>
            <div class="!flex !items-center !gap-2">
              <h2 class="!text-sm !font-bold !text-zinc-900 !tracking-tight">{{ selectedPatient.firstName }} {{
                selectedPatient.lastName }}</h2>
              <span class="!px-2 !py-0.5 !bg-zinc-100 !text-zinc-700 !rounded-md !text-[9px] !font-bold">{{
                t('prescriptions.activeFile') }}</span>
            </div>
            <div class="!flex !items-center !gap-1.5 !mt-1 !text-[11px] !text-zinc-400">
              <span>{{ t('prescriptions.nationalIdLabel') }}</span>
              <span class="!font-mono !tracking-wider !text-zinc-600" dir="ltr">{{ selectedPatient.nationalId }}</span>
            </div>
          </div>
        </div>
        <div class="!flex !items-center !gap-2 !w-full sm:!w-auto">
          <button
            class="!flex-1 sm:!flex-none !flex !items-center !justify-center !gap-1.5 !px-3.5 !py-2.5 !bg-white !border !border-zinc-200 hover:!border-zinc-300 !text-zinc-700 !text-xs !font-semibold !rounded-xl !transition-all !shadow-sm"
            @click="clearPatient">
            <Icon name="lucide:arrow-right-left" class="!w-3.5 !h-3.5 !text-zinc-400" />
            {{ t('prescriptions.changePatient') }}
          </button>
          <button
            class="!flex-1 sm:!flex-none !flex !items-center !justify-center !gap-1.5 !px-4 !py-2.5 !bg-zinc-900 hover:!bg-zinc-800 !text-white !text-xs !font-semibold !rounded-xl !transition-all !shadow-sm"
            @click="openAddDialog">
            <Plus class="!w-3.5 !h-3.5" />
            {{ t('prescriptions.addPrescription') }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="!space-y-3">
        <div v-for="i in 5" :key="`skeleton-${i}`" class="!bg-white !border !border-zinc-200/80 !rounded-2xl !p-5">
          <v-skeleton-loader type="list-item" class="bg-transparent!" />
        </div>
      </div>

      <div v-else-if="prescriptions.length === 0"
        class="!bg-white !border !border-zinc-200/80 !rounded-2xl !py-16 !flex !flex-col !items-center !justify-center !text-center !shadow-sm">
        <div
          class="!w-14 !h-14 !bg-zinc-50 !rounded-2xl !flex !items-center !justify-center !mb-4 !border !border-zinc-100">
          <Icon name="lucide:pill" class="!w-6 !h-6 !text-zinc-300" />
        </div>
        <p class="!text-sm !font-bold !text-zinc-900 !mb-1">{{ t('prescriptions.noPrescriptions') }}</p>
        <p class="!text-xs !text-zinc-400">{{ t('prescriptions.noPrescriptionsDesc') }}</p>
      </div>

      <div v-else class="!space-y-3">
        <div v-for="rx in prescriptions" :key="rx.id"
          class="!bg-white !border !border-zinc-200/80 !rounded-2xl !p-5 !transition-all hover:!shadow-md !group">
          <div class="!flex !flex-col sm:!flex-row !items-start sm:!items-center justify-between !gap-3">
            <div class="!flex !items-start !gap-3.5">
              <div class="!w-10 !h-10 !rounded-xl !flex !items-center !justify-center !text-sm !shrink-0 !border"
                :class="rx.is_active ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200' : '!bg-zinc-50 !text-zinc-400 !border-zinc-200'">
                <Icon :name="rx.is_active ? 'lucide:pill' : 'lucide:x-circle'" class="!w-4.5 !h-4.5" />
              </div>
              <div class="!min-w-0">
                <div class="!flex !items-center !gap-2 !flex-wrap">
                  <h3 class="!text-sm !font-bold !text-zinc-900">{{ rx.medication_name }}</h3>
                  <span class="!px-2 !py-0.5 !rounded-md !text-[10px] !font-bold !border"
                    :class="rx.is_active ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200' : '!bg-zinc-100 !text-zinc-500 !border-zinc-200'">
                    {{ rx.is_active ? t('prescriptions.active') : t('prescriptions.inactive') }}
                  </span>
                </div>
                <div class="!flex !items-center !gap-3 !mt-1.5 !flex-wrap">
                  <span class="!text-[11px] !text-zinc-500">
                    <span class="!font-semibold !text-zinc-700">{{ t('prescriptions.dosage') }}:</span> {{ rx.dosage }}
                  </span>
                  <span v-if="rx.frequency" class="!text-[11px] !text-zinc-500">
                    <span class="!font-semibold !text-zinc-700">{{ t('prescriptions.frequency') }}:</span> {{
                    rx.frequency }}
                  </span>
                  <span v-if="rx.route" class="!text-[11px] !text-zinc-500">
                    <span class="!font-semibold !text-zinc-700">{{ t('prescriptions.route') }}:</span> {{ rx.route }}
                  </span>
                  <span v-if="rx.duration" class="!text-[11px] !text-zinc-500">
                    <span class="!font-semibold !text-zinc-700">{{ t('prescriptions.duration') }}:</span> {{ rx.duration
                    }}
                  </span>
                </div>
                <div v-if="rx.instructions" class="!mt-2 !text-[11px] !text-zinc-400 !leading-relaxed">
                  {{ rx.instructions }}
                </div>
              </div>
            </div>
            <div class="!flex !items-center !gap-1.5 !shrink-0">
              <span class="!text-[10px] !text-zinc-400 !hidden sm:!inline">{{ formatJalaliDate(rx.created_at) }}</span>
              <button v-if="rx.is_active" @click="openDiscontinueDialog(rx)"
                class="!p-1.5 !rounded-lg !text-amber-500 hover:!bg-amber-50 !transition-colors"
                :title="t('prescriptions.discontinue')">
                <Icon name="lucide:pause-circle" class="!w-4 !h-4" />
              </button>
              <button @click="openEditDialog(rx)"
                class="!p-1.5 !rounded-lg !text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-100 !transition-colors">
                <Icon name="lucide:pencil" class="!w-4 !h-4" />
              </button>
              <button @click="confirmDelete(rx)"
                class="!p-1.5 !rounded-lg !text-zinc-400 hover:!text-red-600 hover:!bg-red-50 !transition-colors">
                <Icon name="lucide:trash-2" class="!w-4 !h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <v-dialog v-model="formDialog" max-width="640" persistent>
      <div class="!bg-white !rounded-2xl !shadow-2xl !overflow-hidden">
        <div class="!px-6 !py-4 !border-b !border-zinc-100 !flex !items-center !justify-between">
          <h3 class="!text-sm !font-bold !text-zinc-900">
            {{ editingPrescription ? t('prescriptions.editPrescription') : t('prescriptions.newPrescription') }}
          </h3>
          <button @click="formDialog = false"
            class="!p-1 !rounded-lg !text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-100 !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>
        <div class="!px-6 !py-5 !space-y-4">
          <v-text-field v-model="form.medication_name" :label="t('prescriptions.form.medicationName')"
            :placeholder="t('prescriptions.form.medicationNamePlaceholder')" variant="outlined" density="compact"
            :rules="[v => !!v || '']" append-inner-icon="mdi-draw-pen"
            @click:append-inner="openHandwriting('medication_name')" />
          <div class="!grid !grid-cols-2 !gap-3">
            <v-text-field v-model="form.dosage" :label="t('prescriptions.dosage')"
              :placeholder="t('prescriptions.form.dosagePlaceholder')" variant="outlined" density="compact"
              :rules="[v => !!v || '']" append-inner-icon="mdi-draw-pen"
              @click:append-inner="openHandwriting('dosage')" />
            <v-text-field v-model="form.frequency" :label="t('prescriptions.frequency')"
              :placeholder="t('prescriptions.form.frequencyPlaceholder')" variant="outlined" density="compact"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('frequency')" />
          </div>
          <div class="!grid !grid-cols-2 !gap-3">
            <v-text-field v-model="form.route" :label="t('prescriptions.route')"
              :placeholder="t('prescriptions.form.routePlaceholder')" variant="outlined" density="compact"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('route')" />
            <v-text-field v-model="form.duration" :label="t('prescriptions.duration')"
              :placeholder="t('prescriptions.form.durationPlaceholder')" variant="outlined" density="compact"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('duration')" />
          </div>
          <div class="!grid !grid-cols-2 !gap-3">
            <v-text-field v-model="form.quantity" :label="t('prescriptions.quantity')"
              :placeholder="t('prescriptions.form.quantityPlaceholder')" variant="outlined" density="compact"
              type="number" />
            <v-text-field v-model="form.refills" :label="t('prescriptions.refills')"
              :placeholder="t('prescriptions.form.refillsPlaceholder')" variant="outlined" density="compact"
              type="number" />
          </div>
          <v-textarea v-model="form.instructions" :label="t('prescriptions.instructions')"
            :placeholder="t('prescriptions.form.instructionsPlaceholder')" variant="outlined" density="compact"
            rows="2" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('instructions')" />
          <div class="!grid !grid-cols-2 !gap-3">
            <v-text-field v-model="form.start_date" :label="t('prescriptions.startDate')" variant="outlined"
              density="compact" type="date" />
            <v-text-field v-model="form.end_date" :label="t('prescriptions.endDate')" variant="outlined"
              density="compact" type="date" />
          </div>
        </div>
        <div class="!px-6 !py-3 !border-t !border-zinc-100 !flex !justify-end !gap-2">
          <button @click="formDialog = false"
            class="!px-4 !py-2 !text-xs !font-semibold !text-zinc-600 !bg-zinc-100 hover:!bg-zinc-200 !rounded-xl !transition-colors">{{
              t('common.cancel') }}</button>
          <button @click="savePrescription" :disabled="saving"
            class="!px-5 !py-2 !text-xs !font-semibold !text-white !bg-zinc-900 hover:!bg-zinc-800 !rounded-xl !transition-colors !disabled:opacity-50 !flex !items-center !gap-2">
            <v-progress-circular v-if="saving" indeterminate size="12" width="2" color="white" />
            {{ t('common.save') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="discontinueDialog" max-width="440">
      <div class="!bg-white !rounded-2xl !shadow-2xl !p-6 !text-center">
        <div
          class="!w-11 !h-11 !rounded-xl !bg-amber-50 !flex !items-center !justify-center !mx-auto !mb-3.5 !border !border-amber-100">
          <Icon name="lucide:pause-circle" class="!w-5 !h-5 !text-amber-600" />
        </div>
        <h3 class="!text-xs !font-bold !text-zinc-900 !mb-1.5">{{ t('prescriptions.discontinueTitle') }}</h3>
        <p class="!text-zinc-400 !text-[11px] !leading-relaxed">{{ t('prescriptions.disconfirmMessage') }}</p>
        <v-textarea v-model="discontinueReason" :placeholder="t('prescriptions.discontinueReasonPlaceholder')"
          variant="outlined" density="compact" rows="2" class="!mt-4" append-inner-icon="mdi-draw-pen"
          @click:append-inner="discontinueReasonOpen = true" />
        <div class="!flex !justify-center !gap-2 !mt-4">
          <button @click="discontinueDialog = false"
            class="!flex-1 !px-4 !py-2 !bg-zinc-100 hover:!bg-zinc-200 !text-zinc-600 !text-xs !font-semibold !rounded-xl !transition-colors">{{
              t('common.cancel') }}</button>
          <button @click="executeDiscontinue" :disabled="discontinueLoading"
            class="!flex-1 !px-4 !py-2 !bg-amber-500 hover:!bg-amber-600 !text-white !text-xs !font-semibold !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center">
            <v-progress-circular v-if="discontinueLoading" indeterminate size="12" width="2" color="white"
              class="!mr-2" />
            {{ t('prescriptions.discontinue') }}
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="440">
      <div class="!bg-white !rounded-2xl !shadow-2xl !p-6 !text-center">
        <div
          class="!w-11 !h-11 !rounded-xl !bg-red-50 !flex !items-center !justify-center !mx-auto !mb-3.5 !border !border-red-100">
          <Icon name="lucide:trash-2" class="!w-4 !h-4 !text-red-600" />
        </div>
        <h3 class="!text-xs !font-bold !text-zinc-900 !mb-1.5">{{ t('prescriptions.deleteTitle') }}</h3>
        <p class="!text-zinc-400 !text-[11px] !leading-relaxed">{{ t('prescriptions.deleteConfirm') }}</p>
        <div class="!flex !justify-center !gap-2 !mt-5">
          <button @click="deleteDialog = false"
            class="!flex-1 !px-4 !py-2 !bg-zinc-100 hover:!bg-zinc-200 !text-zinc-600 !text-xs !font-semibold !rounded-xl !transition-colors">{{
              t('common.cancel') }}</button>
          <button @click="executeDelete" :disabled="deleting"
            class="!flex-1 !px-4 !py-2 !bg-red-600 hover:!bg-red-700 !text-white !text-xs !font-semibold !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center">
            <v-progress-circular v-if="deleting" indeterminate size="12" width="2" color="white" class="!mr-2" />
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
    </v-dialog>

  <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric"
    @insert="applyHandwriting" />
  <HandwritingDialog v-model="discontinueReasonOpen" :label="discontinueReasonLabel"
    @insert="(text) => discontinueReason = text" />
</UiPageContainer>
</template>

<script setup lang="ts">
import Plus from '~/components/icons/Plus.vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedPatient = ref<any>(null)
const searching = ref(false)
const searchTouched = ref(false)

const prescriptions = ref<any[]>([])
const loading = ref(false)

const formDialog = ref(false)
const editingPrescription = ref<any>(null)
const saving = ref(false)

const discontinueDialog = ref(false)
const discontinueTarget = ref<any>(null)
const discontinueReason = ref('')
const discontinueLoading = ref(false)

const deleteDialog = ref(false)
const deleteTarget = ref<any>(null)
const deleting = ref(false)

const form = ref({
  medication_name: '',
  dosage: '',
  frequency: '',
  route: '',
  duration: '',
  quantity: '',
  refills: '0',
  instructions: '',
  start_date: '',
  end_date: '',
})

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      medication_name: t('prescriptions.form.medicationName'),
      dosage: t('prescriptions.dosage'),
      frequency: t('prescriptions.frequency'),
      route: t('prescriptions.route'),
      duration: t('prescriptions.duration'),
      instructions: t('prescriptions.instructions'),
    },
    target: form,
  })

const discontinueReasonOpen = ref(false)
const discontinueReasonLabel = t('prescriptions.discontinueReasonPlaceholder')

function formatJalaliDate(date: string | null) {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  searchTouched.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchPatients(), 400)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

function clearPatient() {
  selectedPatient.value = null
  prescriptions.value = []
  searchQuery.value = ''
  searchResults.value = []
  searchTouched.value = false
}

async function searchPatients() {
  const q = searchQuery.value.trim()
  if (!q) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await apiFetch<any>(`/api/patients?search=${encodeURIComponent(q)}`)
    if (res.success) {
      searchResults.value = res.data || []
    } else {
      searchResults.value = []
    }
  } catch {
    searchResults.value = []
    $toast.error(t('prescriptions.fetchError'))
  } finally {
    searching.value = false
  }
}

async function selectPatient(patient: any) {
  selectedPatient.value = patient
  searchQuery.value = `${patient.firstName} ${patient.lastName}`
  await fetchPrescriptions()
}

async function fetchPrescriptions() {
  if (!selectedPatient.value) return
  loading.value = true
  try {
    const res = await apiFetch<any>(`/api/prescriptions/patient/${selectedPatient.value.id}`)
    if (res.success) {
      prescriptions.value = res.data || []
    } else {
      prescriptions.value = []
      $toast.error(t('prescriptions.fetchError'))
    }
  } catch {
    prescriptions.value = []
    $toast.error(t('prescriptions.fetchError'))
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  editingPrescription.value = null
  form.value = { medication_name: '', dosage: '', frequency: '', route: '', duration: '', quantity: '', refills: '0', instructions: '', start_date: '', end_date: '' }
  formDialog.value = true
}

function openEditDialog(rx: any) {
  editingPrescription.value = rx
  form.value = {
    medication_name: rx.medication_name || '',
    dosage: rx.dosage || '',
    frequency: rx.frequency || '',
    route: rx.route || '',
    duration: rx.duration || '',
    quantity: rx.quantity?.toString() || '',
    refills: rx.refills?.toString() || '0',
    instructions: rx.instructions || '',
    start_date: rx.start_date || '',
    end_date: rx.end_date || '',
  }
  formDialog.value = true
}

async function savePrescription() {
  if (!form.value.medication_name || !form.value.dosage) {
    $toast.error(t('prescriptions.saveError'))
    return
  }
  saving.value = true
  try {
    const body: any = {
      medication_name: form.value.medication_name,
      dosage: form.value.dosage,
      frequency: form.value.frequency || null,
      route: form.value.route || null,
      duration: form.value.duration || null,
      quantity: form.value.quantity ? Number(form.value.quantity) : null,
      refills: Number(form.value.refills) || 0,
      instructions: form.value.instructions || null,
      start_date: form.value.start_date || null,
      end_date: form.value.end_date || null,
    }

    if (editingPrescription.value) {
      const res = await apiFetch<any>(`/api/prescriptions/${editingPrescription.value.id}`, { method: 'PUT', body })
      if (res.success) {
        $toast.success(t('prescriptions.saveSuccess'))
        formDialog.value = false
        await fetchPrescriptions()
      }
    } else {
      body.patient_id = selectedPatient.value.id
      const res = await apiFetch<any>('/api/prescriptions', { method: 'POST', body })
      if (res.success) {
        $toast.success(t('prescriptions.saveSuccess'))
        formDialog.value = false
        await fetchPrescriptions()
      }
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('prescriptions.saveError'))
  } finally {
    saving.value = false
  }
}

function openDiscontinueDialog(rx: any) {
  discontinueTarget.value = rx
  discontinueReason.value = ''
  discontinueDialog.value = true
}

async function executeDiscontinue() {
  if (!discontinueTarget.value) return
  discontinueLoading.value = true
  try {
    const res = await apiFetch<any>(`/api/prescriptions/${discontinueTarget.value.id}/discontinue`, {
      method: 'POST',
      body: { reason: discontinueReason.value || undefined },
    })
    if (res.success) {
      $toast.success(t('prescriptions.discontinueSuccess'))
      discontinueDialog.value = false
      await fetchPrescriptions()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('prescriptions.discontinueError'))
  } finally {
    discontinueLoading.value = false
  }
}

function confirmDelete(rx: any) {
  deleteTarget.value = rx
  deleteDialog.value = true
}

async function executeDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await apiFetch<any>(`/api/prescriptions/${deleteTarget.value.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success(t('prescriptions.deleteSuccess'))
      deleteDialog.value = false
      await fetchPrescriptions()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('prescriptions.deleteError'))
  } finally {
    deleting.value = false
  }
}

useSeoMeta({ title: t('prescriptions.titleSeo') })
</script>
