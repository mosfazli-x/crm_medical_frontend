<template>
    <v-dialog :model-value="isOpen" @update:model-value="val => !val && close()" max-width="1100" persistent scrollable
        transition="dialog-bottom-transition" @keydown.esc="close">
        <v-card class="rounded-2xl shadow-2xl bg-slate-50 overflow-hidden" elevation="0">

            <v-card-title class="bg-white border-b border-slate-200 py-5 px-8">
                <div class="flex items-center justify-between w-full">
                    <div class="flex flex-col">
                        <h2 class="text-xl font-bold text-slate-800">
                            {{ mode === 'edit' ? 'پرونده پزشکی بیمار' : 'ثبت بیمار جدید' }}
                        </h2>
                        <span class="text-xs text-slate-500 mt-1 font-normal">
                            {{ mode === 'edit' ? 'ویرایش اطلاعات و سوابق' : 'تکمیل اطلاعات اولیه و اولین ویزیت' }}
                        </span>
                    </div>
                    <v-btn icon variant="text" size="small" class="text-slate-400 hover:text-slate-800 bg-slate-100"
                        @click="close">
                        <CloseCircle class="w-6 h-6" />
                    </v-btn>
                </div>
            </v-card-title>

            <div class="bg-white px-8 border-b border-slate-200">
                <v-tabs v-model="activeTab" color="black" bg-color="transparent" slider-color="black" height="56">
                    <v-tab value="basic" class="text-sm font-medium tracking-wide">اطلاعات پایه</v-tab>
                    <v-tab value="medical" class="text-sm font-medium tracking-wide">سابقه پزشکی</v-tab>
                    <v-tab value="pregnancy" class="text-sm font-medium tracking-wide">زایمان و بارداری</v-tab>
                    <v-tab value="attachments" class="text-sm font-medium tracking-wide">مستندات</v-tab>
                </v-tabs>
            </div>

            <v-card-text class="p-8">
                <v-window v-model="activeTab" class="overflow-visible">
                    <v-window-item value="basic" transition="fade-transition">
                        <PatientTabsBasicInfo v-model="form" />
                    </v-window-item>

                    <v-window-item value="medical" transition="fade-transition">
                        <PatientTabsMedicalHistory v-model="form" />
                    </v-window-item>

                    <v-window-item value="pregnancy" transition="fade-transition">
                        <PatientTabsPregnancyHistory v-model:records="pregnancyRecords"
                            v-model:generalNotes="form.pregnancy_notes" />
                    </v-window-item>

                    <v-window-item value="attachments" transition="fade-transition">
                        <PatientTabsAttachments v-model:attachments="attachments"
                            v-model:existingAttachments="existingAttachments" />
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-card-actions class="bg-white border-t border-slate-200 px-8 py-4 z-10">
                <v-spacer />
                <v-btn color="slate-600" variant="text" class="px-4 font-medium" @click="close">انصراف</v-btn>
                <v-btn color="black" variant="flat" class="px-8 font-medium rounded-lg" :loading="loading"
                    @click="submitForm">
                    {{ mode === 'edit' ? 'ذخیره تغییرات' : 'ثبت پرونده' }}
                </v-btn>
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

// Import Tabs Components
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
    close: dialogClose
} = usePatientFormDialog()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

const loading = ref(false)
const activeTab = ref('basic')

const form = reactive({
    first_name: '',
    last_name: '',
    national_id: '',
    insurance_code: '',
    birth_date: null as string | null,
    phone: '',
    address: '',
    marital_status: '',
    pregnancy_notes: '',
    diseases: [] as Array<{ name: string; diagnosed_at: string | null }>,
    medications: [] as Array<{ name: string; dosage?: string }>,
    allergies: [] as Array<{ substance: string; severity?: 'خفیف' | 'متوسط' | 'شدید' }>,
})

const pregnancyRecords = ref<any[]>([])

const attachments = reactive({
    ultrasound: [] as File[],
    lab: [] as File[],
    prescription: [] as File[]
})

const existingAttachments = reactive({
    ultrasound: [],
    lab: [],
    prescription: []
})

const submitForm = async () => {
    loading.value = true
    try {
        const formData = new FormData()

        // ۱. دسته‌بندی اطلاعات بیمار و ویزیت بر اساس انتظار بک‌اند
        const patientData = {
            first_name: form.first_name || '',
            last_name: form.last_name || '',
            national_id: form.national_id || '',
            insurance_code: form.insurance_code || '',
            birth_date: form.birth_date,
            phone: form.phone || '',
            address: form.address || '',
            marital_status: form.marital_status || '',
            diseases: form.diseases,
            medications: form.medications,
            allergies: form.allergies,
            pregnancy_notes: form.pregnancy_notes,
        }

        // در متد submitForm
        const visitData = {
            visit_date: new Date().toISOString(),
            visit_type: 'routine', // یا هر مقدار پیش‌فرض
            reason: 'ویزیت اولیه',
            notes: ''
        }

        const pregnancyData = pregnancyRecords.value.map(r => ({
            gravida_index: r.gravida_index,
            status: r.status,
            gestational_age_weeks: r.gestational_age_weeks,
            gestational_age_days: r.gestational_age_days,
            end_date: r.end_date,
            delivery_method: r.delivery_method,
            anesthesia_type: r.anesthesia_type,
            maternal_complications: r.maternal_complications,
            prenatal_screenings: r.prenatal_screenings,
            newborns_details: r.newborns_details,
            notes: r.notes
        }))

        // ۲. تبدیل آبجکت‌ها به String و افزودن به FormData
        formData.append('patient', JSON.stringify(patientData))
        formData.append('visit', JSON.stringify(visitData))
        formData.append('pregnancy', JSON.stringify(pregnancyData))

        // ۳. افزودن فایل‌ها (با حلقه روی آرایه فایل‌های Vuetify)
        if (attachments.ultrasound?.length) {
            for (let i = 0; i < attachments.ultrasound.length; i++) {
                formData.append('ultrasound[]', attachments.ultrasound[i])
            }
        }
        if (attachments.lab?.length) {
            for (let i = 0; i < attachments.lab.length; i++) {
                formData.append('lab[]', attachments.lab[i])
            }
        }
        if (attachments.prescription?.length) {
            for (let i = 0; i < attachments.prescription.length; i++) {
                formData.append('prescription[]', attachments.prescription[i])
            }
        }

        for (let pair of (formData as any).entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        // تنظیم مسیر و متد
        const endpoint = mode.value === 'edit' ? `/api/patients/${patientId.value}` : '/api/patients/register'

        if (mode.value === 'edit') {
            formData.append('_method', 'POST')
        }

        await apiFetch(endpoint, {
            method: 'POST',
            body: formData
        })

        $toast.success(mode.value === 'edit' ? 'اطلاعات با موفقیت به‌روزرسانی شد' : 'بیمار جدید با موفقیت ثبت شد')
        emit('patient:changed')
        close()
    } catch (error) {
        $toast.error('خطا در ثبت اطلاعات')
        console.error('Submit Error:', error)
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    form.first_name = ''
    form.last_name = ''
    form.national_id = ''
    form.insurance_code = ''
    form.birth_date = null
    form.phone = ''
    form.address = ''
    form.marital_status = ''
    form.pregnancy_notes = ''

    form.diseases = []
    form.medications = []
    form.allergies = []

    pregnancyRecords.value = []

    attachments.ultrasound = []
    attachments.lab = []
    attachments.prescription = []

    existingAttachments.ultrasound = []
    existingAttachments.lab = []
    existingAttachments.prescription = []
}

const close = () => {
    resetForm()
    dialogClose()
}


const fillForm = (data: any) => {
    if (!data) return

    form.first_name = data.firstName ?? ''
    form.last_name = data.lastName ?? ''
    form.national_id = data.nationalId ?? ''
    form.insurance_code = data.insuranceCode ?? ''

    form.birth_date = data.birth_date ?? null

    form.phone = data.phone ?? ''
    form.address = data.address ?? ''

    form.marital_status = data.maritalStatus ?? ''

    form.diseases = [...(data.diseases ?? [])]

    form.medications = [...(data.medications ?? [])]

    form.allergies = [...(data.allergies ?? [])]

    pregnancyRecords.value = [
        ...(data.obstetricHistory ?? [])
    ]

    existingAttachments.ultrasound = [
        ...(data.attachments?.ultrasound ?? [])
    ]

    existingAttachments.lab = [
        ...(data.attachments?.lab ?? [])
    ]

    existingAttachments.prescription = [
        ...(data.attachments?.prescription ?? [])
    ]
}


watch(
    () => patientData.value,
    (data) => {
        if (mode.value === 'edit' && data) {
            fillForm(data)
        }
    },
    { immediate: true }
)
</script>