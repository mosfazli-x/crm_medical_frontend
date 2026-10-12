<template>
  <v-dialog
    :model-value="isOpen"
    max-width="1080"
    persistent
    scrollable
    transition="dialog-bottom-transition"
    @update:model-value="(val: boolean) => !val && close()"
    @keydown.esc="close"
  >
    <v-card class="asa-dialog overflow-hidden! flex! flex-col!" elevation="0">
      <!-- ─── Header ─── -->
      <div class="asa-dialog__head">
        <div class="min-w-0!">
          <h2 class="asa-dialog__title">
            {{ mode === 'edit' ? t('patientForm.medicalRecord') : t('patientForm.newPatient') }}
          </h2>
          <span class="asa-dialog__sub">
            {{ mode === 'edit' ? t('patientForm.editInfo') : t('patientForm.initialInfo') }}
          </span>
        </div>
        <button class="pf-x" type="button" :aria-label="t('common.close')" @click="close">
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <!-- ─── Section navigation ─── -->
      <div class="pf-dialog-tabs">
        <div class="pf-seg" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            type="button"
            role="tab"
            class="pf-seg__btn"
            :class="{ 'pf-seg__btn--on': activeTab === tab.value }"
            :aria-selected="activeTab === tab.value"
            @click="activeTab = tab.value"
          >
            <v-icon size="15">{{ tab.icon }}</v-icon>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- ─── Body ─── -->
      <v-card-text class="asa-dialog__body pf-form-body">
        <section v-show="activeTab === 'basic'" role="tabpanel">
          <PatientTabsBasicInfo v-model="form" />
        </section>

        <section v-show="activeTab === 'medical'" role="tabpanel">
          <PatientTabsMedicalHistory v-model="form" />
        </section>

        <section v-show="activeTab === 'pregnancy'" role="tabpanel">
          <PatientTabsPregnancyHistory
            v-model:records="pregnancyRecords"
            v-model:general-notes="pregnancyGeneralNotes"
          />
        </section>

        <section v-show="activeTab === 'vaccination'" role="tabpanel">
          <PatientTabsVaccination v-model:records="vaccinationRecords" />
        </section>

        <section v-show="activeTab === 'attachments'" role="tabpanel">
          <PatientTabsAttachments
            v-model:attachments="attachments"
            v-model:existing-attachments="existingAttachments"
            :patient-id="patientId"
          />
        </section>
      </v-card-text>

      <!-- ─── Footer ─── -->
      <v-card-actions class="asa-dialog__foot">
        <span class="pf-foot-hint">
          {{ t('patientForm.step', { current: toPersianNum(tabIndex + 1), total: toPersianNum(tabs.length) }) }}
        </span>
        <v-spacer />
        <button class="asa-btn asa-btn--ghost" type="button" @click="close">
          {{ t('common.cancel') }}
        </button>
        <button class="asa-btn asa-btn--primary" type="button" :disabled="loading" @click="submitForm">
          <v-icon v-if="loading" size="16" class="pf-spin">mdi-loading</v-icon>
          {{ submitLabel }}
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import PatientTabsBasicInfo from '~/components/patient/tabs/BasicInfo.vue'
import PatientTabsMedicalHistory from '~/components/patient/tabs/MedicalHistory.vue'
import PatientTabsPregnancyHistory from '~/components/patient/tabs/PregnancyHistory.vue'
import PatientTabsVaccination from '~/components/patient/tabs/VaccinationTab.vue'
import PatientTabsAttachments from '~/components/patient/tabs/Attachments.vue'

const { t } = useI18n()
const { toPersianNum } = useLang()
const { emit } = useEventBus()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

const {
  isOpen,
  mode,
  patientId,
  patientData,
  close: dialogClose,
} = usePatientFormDialog()

type TabValue = 'basic' | 'medical' | 'pregnancy' | 'vaccination' | 'attachments'
type RawObject = Record<string, unknown>

interface RawDisease {
  id?: string
  name: string
  diagnosedAt?: string | null
  diagnosed_at?: string | null
}

interface RawMedication {
  id?: string
  name: string
  dosage?: string | null
}

interface RawAllergy {
  id?: string
  substance: string
  severity?: string | null
}

interface RawVaccination {
  id?: string
  vaccineName?: string
  vaccine_name?: string
  doseNumber?: string | number | null
  dose_number?: string | number | null
  dateAdministered?: string | null
  date_administered?: string | null
  lotNumber?: string | null
  lot_number?: string | null
  manufacturer?: string | null
  site?: string | null
  administeredBy?: string | null
  administered_by?: string | null
  nextDoseDate?: string | null
  next_dose_date?: string | null
  status?: string | null
  notes?: string | null
}

interface RawPregnancy {
  id?: string
  gravidaIndex?: number | null
  gravida_index?: number | null
  status?: string | null
  lmp?: string | null
  edd?: string | null
  gestationalAgeWeeks?: number | null
  gestational_age_weeks?: number | null
  gestationalAgeDays?: number | null
  gestational_age_days?: number | null
  endDate?: string | null
  end_date?: string | null
  outcome?: string | null
  deliveryMethod?: string | null
  delivery_method?: string | null
  anesthesiaType?: string | null
  anesthesia_type?: string | null
  maternalComplications?: unknown[]
  maternal_complications?: unknown[]
  prenatalScreenings?: RawObject
  prenatal_screenings?: RawObject
  newbornsDetails?: unknown[]
  newborns_details?: unknown[]
  notes?: string | null
}

interface AttachmentItem {
  id?: string
  [key: string]: unknown
}

interface MedHistory {
  diseases?: RawDisease[]
  medications?: RawMedication[]
  allergies?: RawAllergy[]
  vaccinations?: RawVaccination[]
}

interface PatientDialogData {
  basicInfo?: RawObject
  medicalHistory?: MedHistory
  obstetricHistory?: RawPregnancy[] | { pregnancies?: RawPregnancy[]; records?: RawPregnancy[] }
  attachments?: {
    ultrasound?: AttachmentItem[]
    lab?: AttachmentItem[]
    prescription?: AttachmentItem[]
    patientFiles?: AttachmentItem[]
  }
  [key: string]: unknown
}

interface DiseaseItem {
  id?: string
  name: string
  diagnosed_at: string | null
}

interface MedicationItem {
  id?: string
  name: string
  dosage?: string
}

interface AllergyItem {
  id?: string
  substance: string
  severity?: string
}

interface PregnancyRecord {
  id?: string
  gravida_index: number | null
  status: string
  lmp: string | null
  edd: string | null
  end_date: string | null
  gestational_age_weeks: number | null
  gestational_age_days: number | null
  outcome: string | null
  delivery_method: string | null
  anesthesia_type: string | null
  maternal_complications: unknown[]
  prenatal_screenings: RawObject
  newborns_details: unknown[]
  notes: string
  [key: string]: unknown
}

interface VaccinationRecord {
  id?: string
  vaccine_name: string
  dose_number: string | number | null
  date_administered: string | null
  lot_number: string
  manufacturer: string
  site: string
  administered_by: string
  next_dose_date: string | null
  status: string | null
  notes: string
  [key: string]: unknown
}

const loading = ref(false)
const activeTab = ref<TabValue>('basic')

const tabs = computed<{ value: TabValue; label: string; icon: string }[]>(() => [
  { value: 'basic', label: t('patientForm.tabs.basic'), icon: 'mdi-account-outline' },
  { value: 'medical', label: t('patientForm.tabs.medical'), icon: 'mdi-heart-pulse' },
  { value: 'pregnancy', label: t('patientForm.tabs.pregnancy'), icon: 'mdi-human-pregnant' },
  { value: 'vaccination', label: t('patientForm.tabs.vaccination'), icon: 'mdi-needle' },
  { value: 'attachments', label: t('patientForm.tabs.attachments'), icon: 'mdi-paperclip' },
])

const tabIndex = computed(() => tabs.value.findIndex((tab) => tab.value === activeTab.value))

const submitLabel = computed(() => {
  if (loading.value) return t('patientForm.saving')
  return mode.value === 'edit' ? t('patientForm.saveChanges') : t('patientForm.registerRecord')
})

const form = reactive({
  first_name: '',
  last_name: '',
  national_id: '',
  is_foreign: false,
  nationality: '',
  insurance_code: '',
  insurance_type: '',
  birth_date: null as string | null,
  birth_date_exact: null as boolean | null,
  phone: '',
  address: '',
  marital_status: '',
  diseases: [] as DiseaseItem[],
  medications: [] as MedicationItem[],
  allergies: [] as AllergyItem[],
})

const pregnancyRecords = ref<PregnancyRecord[]>([])
const pregnancyGeneralNotes = ref('')
const vaccinationRecords = ref<VaccinationRecord[]>([])

const attachments = reactive({
  ultrasound: [] as File[],
  lab: [] as File[],
  prescription: [] as File[],
  patientFiles: [] as File[],
})

const existingAttachments = reactive({
  ultrasound: [] as AttachmentItem[],
  lab: [] as AttachmentItem[],
  prescription: [] as AttachmentItem[],
  patientFiles: [] as AttachmentItem[],
})

function validateBasic(): boolean {
  if (form.first_name.trim().length < 2) {
    activeTab.value = 'basic'
    $toast.error(t('users.firstNameRequired'))
    return false
  }
  if (form.last_name.trim().length < 2) {
    activeTab.value = 'basic'
    $toast.error(t('users.lastNameRequired'))
    return false
  }
  if (!form.is_foreign && !/^\d{10}$/.test(form.national_id.trim())) {
    activeTab.value = 'basic'
    $toast.error(t('users.nationalIdInvalid'))
    return false
  }
  return true
}

function buildPayload() {
  const isEdit = mode.value === 'edit'
  const withId = <T extends { id?: string }>(item: T, rest: Record<string, unknown>) =>
    isEdit && item.id ? { id: item.id, ...rest } : rest

  return {
    first_name: form.first_name || '',
    last_name: form.last_name || '',
    national_id: form.national_id || '',
    is_foreign: form.is_foreign,
    nationality: form.is_foreign ? (form.nationality || null) : null,
    insurance_code: form.insurance_code || null,
    insurance_type: form.insurance_type || null,
    birth_date: form.birth_date || null,
    birth_date_exact: form.birth_date_exact ?? null,
    phone: form.phone || '',
    address: form.address || null,
    marital_status: form.marital_status || null,
    diseases: form.diseases.map((d) => withId(d, { name: d.name, diagnosed_at: d.diagnosed_at || null })),
    medications: form.medications.map((m) => withId(m, { name: m.name, dosage: m.dosage || null })),
    allergies: form.allergies.map((a) =>
      withId(a, { substance: a.substance, severity: a.severity || t('patientForm.severity.moderate') }),
    ),
    pregnancies: pregnancyRecords.value.map((p) => ({
      ...(isEdit && p.id ? { id: p.id } : {}),
      gravida_index: p.gravida_index ?? null,
      status: p.status || 'completed',
      lmp: p.lmp || null,
      edd: p.edd || null,
      end_date: p.end_date || null,
      gestational_age_weeks: p.gestational_age_weeks ?? null,
      gestational_age_days: p.gestational_age_days ?? null,
      outcome: p.outcome || null,
      delivery_method: p.delivery_method || null,
      anesthesia_type: p.anesthesia_type || null,
      maternal_complications: p.maternal_complications || [],
      prenatal_screenings: p.prenatal_screenings || {},
      newborns_details: p.newborns_details || [],
      notes: p.notes || null,
    })),
    vaccinations: vaccinationRecords.value.map((v) => ({
      ...(isEdit && v.id ? { id: v.id } : {}),
      vaccine_name: v.vaccine_name || '',
      dose_number: v.dose_number || null,
      date_administered: v.date_administered || null,
      lot_number: v.lot_number || null,
      manufacturer: v.manufacturer || null,
      site: v.site || null,
      administered_by: v.administered_by || null,
      next_dose_date: v.next_dose_date || null,
      status: v.status || null,
      notes: v.notes || null,
    })),
  }
}

async function submitForm() {
  if (!validateBasic()) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('patient', JSON.stringify(buildPayload()))

    const fileGroups: [File[], string][] = [
      [attachments.ultrasound, 'ultrasound[]'],
      [attachments.lab, 'lab[]'],
      [attachments.prescription, 'prescription[]'],
      [attachments.patientFiles, 'patient_files[]'],
    ]
    for (const [files, field] of fileGroups) {
      for (const file of files) formData.append(field, file)
    }

    const endpoint = mode.value === 'edit' ? `/api/patients/${patientId.value}` : '/api/patients/register'
    await apiFetch(endpoint, {
      method: mode.value === 'edit' ? 'PUT' : 'POST',
      body: formData,
    })

    const successMsg =
      mode.value === 'edit'
        ? t('patientForm.updateSuccess')
        : form.phone
          ? t('patientForm.createSuccessWithPhone')
          : t('patientForm.createSuccessNoAccount')
    $toast.success(successMsg)
    emit('patient:changed')
    close()
  } catch (error: unknown) {
    const err = error as { data?: { error?: string }; message?: string }
    $toast.error(err?.data?.error || err?.message || t('patientForm.submitError'))
    console.error('Submit Error:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    first_name: '',
    last_name: '',
    national_id: '',
    is_foreign: false,
    nationality: '',
    insurance_code: '',
    insurance_type: '',
    birth_date: null,
    birth_date_exact: null,
    phone: '',
    address: '',
    marital_status: '',
    diseases: [],
    medications: [],
    allergies: [],
  })

  pregnancyRecords.value = []
  pregnancyGeneralNotes.value = ''
  vaccinationRecords.value = []

  attachments.ultrasound = []
  attachments.lab = []
  attachments.prescription = []
  attachments.patientFiles = []

  existingAttachments.ultrasound = []
  existingAttachments.lab = []
  existingAttachments.prescription = []
  existingAttachments.patientFiles = []
}

function close() {
  resetForm()
  dialogClose()
}

function fillForm(data: PatientDialogData) {
  if (!data) return

  const info: RawObject = data.basicInfo || data
  const medHistory: MedHistory = data.medicalHistory ?? {}

  Object.assign(form, {
    first_name: info.firstName ?? info.first_name ?? '',
    last_name: info.lastName ?? info.last_name ?? '',
    national_id: info.nationalId ?? info.national_id ?? '',
    is_foreign: Boolean(info.is_foreign ?? info.isForeign ?? false),
    nationality: info.nationality ?? '',
    insurance_code: info.insuranceCode ?? info.insurance_code ?? '',
    insurance_type: info.insuranceType ?? info.insurance_type ?? '',
    birth_date: info.birthDate ?? info.birth_date ?? null,
    birth_date_exact: info.birthDateExact ?? info.birth_date_exact ?? null,
    phone: info.phone ?? '',
    address: info.address ?? '',
    marital_status: info.maritalStatus ?? info.marital_status ?? '',
    diseases: (medHistory.diseases || []).map((d) => ({
      id: d.id,
      name: d.name,
      diagnosed_at: d.diagnosedAt ?? d.diagnosed_at ?? null,
    })),
    medications: (medHistory.medications || []).map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage ?? '',
    })),
    allergies: (medHistory.allergies || []).map((a) => ({
      id: a.id,
      substance: a.substance,
      severity: a.severity ?? t('patientForm.severity.moderate'),
    })),
  })

  const rawPregnancies: RawPregnancy[] = Array.isArray(data.obstetricHistory)
    ? data.obstetricHistory
    : (data.obstetricHistory?.pregnancies ?? data.obstetricHistory?.records ?? [])

  pregnancyRecords.value = rawPregnancies.map((p) => ({
    id: p.id,
    gravida_index: p.gravidaIndex ?? p.gravida_index ?? null,
    status: p.status || 'completed',
    lmp: p.lmp || null,
    edd: p.edd || null,
    gestational_age_weeks: p.gestationalAgeWeeks ?? p.gestational_age_weeks ?? null,
    gestational_age_days: p.gestationalAgeDays ?? p.gestational_age_days ?? null,
    end_date: p.endDate ?? p.end_date ?? null,
    outcome: p.outcome ?? null,
    delivery_method: p.deliveryMethod ?? p.delivery_method ?? null,
    anesthesia_type: p.anesthesiaType ?? p.anesthesia_type ?? null,
    maternal_complications: p.maternalComplications ?? p.maternal_complications ?? [],
    prenatal_screenings: p.prenatalScreenings ?? p.prenatal_screenings ?? {},
    newborns_details: p.newbornsDetails ?? p.newborns_details ?? [],
    notes: p.notes || '',
  }))

  vaccinationRecords.value = (medHistory.vaccinations || []).map((v) => ({
    id: v.id,
    vaccine_name: v.vaccineName ?? v.vaccine_name ?? '',
    dose_number: v.doseNumber ?? v.dose_number ?? '',
    date_administered: v.dateAdministered ?? v.date_administered ?? null,
    lot_number: v.lotNumber ?? v.lot_number ?? '',
    manufacturer: v.manufacturer ?? '',
    site: v.site ?? '',
    administered_by: v.administeredBy ?? v.administered_by ?? '',
    next_dose_date: v.nextDoseDate ?? v.next_dose_date ?? null,
    status: v.status ?? 'completed',
    notes: v.notes ?? '',
  }))

  const attach = data.attachments ?? {}
  existingAttachments.ultrasound = [...(attach.ultrasound ?? [])]
  existingAttachments.lab = [...(attach.lab ?? [])]
  existingAttachments.prescription = [...(attach.prescription ?? [])]
  existingAttachments.patientFiles = [...(attach.patientFiles ?? [])]
}

watch(
  () => [isOpen.value, mode.value, patientData.value] as const,
  ([open]) => {
    if (!open) return
    activeTab.value = 'basic'
    if (mode.value === 'edit' && patientData.value) {
      fillForm(patientData.value as PatientDialogData)
    } else {
      resetForm()
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.pf-dialog-tabs {
  padding: 0 1.5rem 0.875rem;
  border-bottom: 1px solid var(--asa-sep);
}

.pf-dialog-tabs .pf-seg {
  max-width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
}

.pf-dialog-tabs .pf-seg::-webkit-scrollbar {
  display: none;
}

.pf-form-body {
  min-height: 22rem;
  padding-top: 1.25rem !important;
}

/* Harmonize the fields rendered by the tab children (Vuetify v-field) with
   the .asa-input / .asa-select surface used across the redesigned pages. */
.pf-form-body :deep(.v-field) {
  border-radius: 0.875rem !important;
}

.pf-form-body :deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-opacity: 0.16;
}

.pf-form-body :deep(.v-field--focused .v-field__outline) {
  --v-field-border-opacity: 0.5;
}

.pf-foot-hint {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label-3);
  font-variant-numeric: tabular-nums;
}
</style>
