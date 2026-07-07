<template>
    <v-dialog :model-value="isOpen" @update:model-value="val => !val && close()" max-width="1100" persistent scrollable
        transition="dialog-bottom-transition" @keydown.esc="close">
        <v-card class="crm-dialog overflow-hidden!" elevation="0">
            <div class="crm-dialog-header">
                <div>
                    <h2 class="crm-dialog-title text-xl!">
                        {{ mode === 'edit' ? 'پرونده پزشکی بیمار' : 'ثبت بیمار جدید' }}
                    </h2>
                    <span class="text-xs text-slate-500 dark:text-slate-400 mt-1 block font-normal">
                        {{ mode === 'edit' ? 'ویرایش اطلاعات و سوابق' : 'تکمیل اطلاعات اولیه و اولین ویزیت' }}
                    </span>
                </div>
                <v-btn icon variant="text" size="small" class="text-slate-400 hover:text-slate-800"
                    @click="close">
                    <CloseCircle class="w-6 h-6 fill-slate-600! dark:fill-slate-200!" />
                </v-btn>
            </div>

            <div class="px-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800!">
                <v-tabs v-model="activeTab" color="#5465ff" bg-color="transparent" height="56">
                    <v-tab value="basic" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">اطلاعات پایه</v-tab>
                    <v-tab value="medical" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">سابقه پزشکی</v-tab>
                    <v-tab value="pregnancy" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">زایمان و بارداری</v-tab>
                    <v-tab value="attachments" class="text-sm text-slate-700! dark:text-slate-300! focus:text-electric-sapphire! font-medium">مستندات</v-tab>
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

                    <v-window-item value="attachments" transition="fade-transition">
                        <PatientTabsAttachments v-model:attachments="attachments"
                            v-model:existingAttachments="existingAttachments" :patient-id="patientId" />
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-actions class="crm-dialog-footer">
                <v-spacer />
                <button class="crm-btn crm-btn-ghost" @click="close">انصراف</button>
                <button class="crm-btn crm-btn-accent" :disabled="loading" @click="submitForm">
                    {{ loading ? 'در حال ذخیره...' : (mode === 'edit' ? 'ذخیره تغییرات' : 'ثبت پرونده') }}
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
import PatientTabsAttachments from '~/components/patient/tabs/Attachments.vue'

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
    severity?: 'خفیف' | 'متوسط' | 'شدید'
}

const form = reactive({
    first_name: '',
    last_name: '',
    national_id: '',
    insurance_code: '',
    insurance_type: '',
    birth_date: null as string | null,
    phone: '',
    address: '',
    marital_status: '',
    diseases: [] as DiseaseItem[],
    medications: [] as MedicationItem[],
    allergies: [] as AllergyItem[],
})

const pregnancyRecords = ref<any[]>([])
const pregnancyGeneralNotes = ref('')

const attachments = reactive({
    ultrasound: [] as File[],
    lab: [] as File[],
    prescription: [] as File[],
})

const existingAttachments = reactive({
    ultrasound: [],
    lab: [],
    prescription: [],
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
                severity: a.severity || 'متوسط',
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
                severity: a.severity || 'متوسط',
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
                ? 'اطلاعات با موفقیت به‌روزرسانی شد'
                : form.phone
                    ? 'بیمار جدید با موفقیت ثبت شد. نام کاربری: شماره تماس، رمز عبور: کد ملی (تغییر در اولین ورود)'
                    : 'بیمار جدید با موفقیت ثبت شد (بدون حساب کاربری)'
        $toast.success(successMsg)
        emit('patient:changed')
        close()
    } catch (error: any) {
        const message = error?.data?.error || error?.message || 'خطا در ثبت اطلاعات'
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
    form.phone = ''
    form.address = ''
    form.marital_status = ''

    form.diseases = []
    form.medications = []
    form.allergies = []

    pregnancyRecords.value = []
    pregnancyGeneralNotes.value = ''

    attachments.ultrasound = []
    attachments.lab = []
    attachments.prescription = []

    existingAttachments.ultrasound = []
    existingAttachments.lab = []
    existingAttachments.prescription = []
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
        severity: a.severity ?? 'متوسط',
    }))

    pregnancyRecords.value = Array.isArray(data.obstetricHistory) ? [...data.obstetricHistory] : [...(data.obstetricHistory?.pregnancies ?? [])]

    existingAttachments.ultrasound = [...(data.attachments?.ultrasound ?? [])]
    existingAttachments.lab = [...(data.attachments?.lab ?? [])]
    existingAttachments.prescription = [...(data.attachments?.prescription ?? [])]
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