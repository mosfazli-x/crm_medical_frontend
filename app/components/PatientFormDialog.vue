<template>
    <v-dialog :model-value="isOpen" @update:model-value="val => !val && close()" max-width="1100" persistent scrollable
        transition="dialog-bottom-transition" @keydown.esc="close">
        <v-card class="crm-dialog overflow-hidden!" elevation="0">
            <div class="crm-dialog-header">
                <div>
                    <h2 class="crm-dialog-title text-xl!">
                        {{ mode === 'edit' ? t('patientForm.medicalRecord') : t('patientForm.newPatient') }}
                    </h2>
                    <span class="text-xs text-slate-500 dark:text-slate-400 mt-1 block font-normal">
                        {{ mode === 'edit' ? t('patientForm.editInfo') : t('patientForm.initialInfo') }}
                    </span>
                </div>
                <v-btn icon variant="text" size="small" class="text-slate-400 hover:text-slate-800"
                    @click="close">
                    <CloseCircle class="w-6 h-6 fill-slate-600! dark:fill-slate-200!" />
                </v-btn>
            </div>

            <div class="px-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800!">
                <v-tabs v-model="activeTab" color="#4F46E5" bg-color="transparent" height="56">
                    <v-tab value="basic" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">{{ t('patientForm.tabs.basic') }}</v-tab>
                    <v-tab value="medical" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">{{ t('patientForm.tabs.medical') }}</v-tab>
                    <v-tab value="pregnancy" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">{{ t('patientForm.tabs.pregnancy') }}</v-tab>
                    <v-tab value="vaccination" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">{{ t('patientForm.tabs.vaccination') }}</v-tab>
                    <v-tab value="attachments" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">{{ t('patientForm.tabs.attachments') }}</v-tab>
                </v-tabs>
            </div>

            <v-card-text class="p-8 bg-slate-50/30 dark:bg-slate-900/30">
                <v-window v-model="activeTab" class="overflow-visible">
                    <v-window-item value="basic" transition="fade-transition">
                        <PatientTabsBasicInfo v-model="form" />
                    </v-window-item>

                    <v-window-item value="medical" transition="fade-transition">
                        <PatientTabsMedicalHistory v-model="form" />
                    </v-window-item>

                    <v-window-item value="pregnancy" transition="fade-transition">
<PatientTabsPregnancyHistory v-model:records="pregnancyRecords"
    v-model:generalNotes="pregnancyGeneralNotes" />
                    </v-window-item>

                    <v-window-item value="vaccination" transition="fade-transition">
<PatientTabsVaccination v-model:records="vaccinationRecords" />
                    </v-window-item>

                    <v-window-item value="attachments" transition="fade-transition">
                        <PatientTabsAttachments v-model:attachments="attachments"
                            v-model:existingAttachments="existingAttachments" :patient-id="patientId" />
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-actions class="crm-dialog-footer">
                <v-spacer />
                <button class="crm-btn crm-btn-ghost" @click="close">{{ t('patientForm.cancel') }}</button>
                <button class="crm-btn crm-btn-accent" :disabled="loading" @click="submitForm">
                    {{ loading ? t('patientForm.saving') : (mode === 'edit' ? t('patientForm.saveChanges') : t('patientForm.registerRecord')) }}
                </button>
            </v-card-actions>

        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import { useEventBus } from '~/composables/useEventBus'
import { useApi } from '~/composables/useApi'

import PatientTabsBasicInfo from '~/components/patient/tabs/BasicInfo.vue'
import PatientTabsMedicalHistory from '~/components/patient/tabs/MedicalHistory.vue'
import PatientTabsPregnancyHistory from '~/components/patient/tabs/PregnancyHistory.vue'
import PatientTabsVaccination from '~/components/patient/tabs/VaccinationTab.vue'
import PatientTabsAttachments from '~/components/patient/tabs/Attachments.vue'

const { t } = useI18n()
const { emit } = useEventBus()
const {
    isOpen,
    mode,
    patientId,
    patientData,
    close: dialogClose,
} = usePatientFormDialog()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

const loading = ref(false)
const activeTab = ref('basic')

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

const form = reactive({
    first_name: '',
    last_name: '',
    national_id: '',
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

const pregnancyRecords = ref<any[]>([])
const pregnancyGeneralNotes = ref('')
const vaccinationRecords = ref<any[]>([])

const attachments = reactive({
    ultrasound: [] as File[],
    lab: [] as File[],
    prescription: [] as File[],
    patientFiles: [] as File[],
})

const existingAttachments = reactive({
    ultrasound: [] as any[],
    lab: [] as any[],
    prescription: [] as any[],
    patientFiles: [] as any[],
})

function pickExistingIds(items: { id?: string }[]): string[] {
    return items.filter((item) => item.id).map((item) => item.id!)
}

const submitForm = async () => {
    loading.value = true
    try {
        const formData = new FormData()

        const payload: Record<string, unknown> = {
            first_name: form.first_name || '',
            last_name: form.last_name || '',
            national_id: form.national_id || '',
            insurance_code: form.insurance_code || null,
            insurance_type: form.insurance_type || null,
            birth_date: form.birth_date || null,
            birth_date_exact: form.birth_date_exact ?? null,
            phone: form.phone || '',
            address: form.address || null,
            marital_status: form.marital_status || null,
        }

        if (mode.value === 'edit') {
            payload.diseases = form.diseases.map((d) => ({
                ...(d.id ? { id: d.id } : {}),
                name: d.name,
                diagnosed_at: d.diagnosed_at || null,
            }))
            payload.medications = form.medications.map((m) => ({
                ...(m.id ? { id: m.id } : {}),
                name: m.name,
                dosage: m.dosage || null,
            }))
            payload.allergies = form.allergies.map((a) => ({
                ...(a.id ? { id: a.id } : {}),
                substance: a.substance,
                severity: a.severity || t('patientForm.severity.moderate'),
            }))
            payload.pregnancies = pregnancyRecords.value.map((p) => ({
                ...(p.id ? { id: p.id } : {}),
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
            }))
            payload.vaccinations = vaccinationRecords.value.map((v) => ({
                ...(v.id ? { id: v.id } : {}),
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
            }))
        } else {
            payload.diseases = form.diseases.map((d) => ({
                name: d.name,
                diagnosed_at: d.diagnosed_at || null,
            }))
            payload.medications = form.medications.map((m) => ({
                name: m.name,
                dosage: m.dosage || null,
            }))
            payload.allergies = form.allergies.map((a) => ({
                substance: a.substance,
                severity: a.severity || t('patientForm.severity.moderate'),
            }))
            payload.pregnancies = pregnancyRecords.value.map((p) => ({
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
            }))
            payload.vaccinations = vaccinationRecords.value.map((v) => ({
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
            }))
        }

        formData.append('patient', JSON.stringify(payload))

        if (attachments.ultrasound?.length) {
            for (const file of attachments.ultrasound) {
                formData.append('ultrasound[]', file)
            }
        }
        if (attachments.lab?.length) {
            for (const file of attachments.lab) {
                formData.append('lab[]', file)
            }
        }
        if (attachments.prescription?.length) {
            for (const file of attachments.prescription) {
                formData.append('prescription[]', file)
            }
        }
        if (attachments.patientFiles?.length) {
            for (const file of attachments.patientFiles) {
                formData.append('patient_files[]', file)
            }
        }

        const endpoint =
            mode.value === 'edit'
                ? `/api/patients/${patientId.value}`
                : '/api/patients/register'

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
    } catch (error: any) {
        const message = error?.data?.error || error?.message || t('patientForm.submitError')
        $toast.error(message)
        console.error('Submit Error:', error)
    } finally {
        loading.value = false
    }
}

function resetForm() {
    form.first_name = ''
    form.last_name = ''
    form.national_id = ''
    form.insurance_code = ''
    form.insurance_type = ''
    form.birth_date = null
    form.birth_date_exact = null
    form.phone = ''
    form.address = ''
    form.marital_status = ''

    form.diseases = []
    form.medications = []
    form.allergies = []

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

function fillForm(data: any) {
    if (!data) return

    const info = data.basicInfo || data
    const medHistory = data.medicalHistory || {}

    form.first_name = info.firstName ?? info.first_name ?? ''
    form.last_name = info.lastName ?? info.last_name ?? ''
    form.national_id = info.nationalId ?? info.national_id ?? ''
    form.insurance_code = info.insuranceCode ?? info.insurance_code ?? ''
    form.insurance_type = info.insuranceType ?? info.insurance_type ?? ''
    form.birth_date = info.birthDate ?? info.birth_date ?? null
    form.birth_date_exact = info.birthDateExact ?? info.birth_date_exact ?? null
    form.phone = info.phone ?? ''
    form.address = info.address ?? ''
    form.marital_status = info.maritalStatus ?? info.marital_status ?? ''

    form.diseases = (medHistory.diseases || []).map((d: any) => ({
        id: d.id,
        name: d.name,
        diagnosed_at: d.diagnosedAt ?? d.diagnosed_at ?? null,
    }))

    form.medications = (medHistory.medications || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        dosage: m.dosage ?? '',
    }))

    form.allergies = (medHistory.allergies || []).map((a: any) => ({
        id: a.id,
        substance: a.substance,
        severity: a.severity ?? t('patientForm.severity.moderate'),
    }))

    const rawPregnancies = Array.isArray(data.obstetricHistory)
      ? data.obstetricHistory
      : (data.obstetricHistory?.pregnancies ?? data.obstetricHistory?.records ?? [])

    pregnancyRecords.value = rawPregnancies.map((p: any) => ({
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
      notes: p.notes || ''
    }))

    vaccinationRecords.value = (medHistory.vaccinations || []).map((v: any) => ({
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

    existingAttachments.ultrasound = [...(data.attachments?.ultrasound ?? [])]
    existingAttachments.lab = [...(data.attachments?.lab ?? [])]
    existingAttachments.prescription = [...(data.attachments?.prescription ?? [])]
    existingAttachments.patientFiles = [...(data.attachments?.patientFiles ?? [])]
}

watch(
    () => patientData.value,
    (data) => {
        if (mode.value === 'edit' && data) {
            fillForm(data)
        }
    },
    { immediate: true },
)
</script>