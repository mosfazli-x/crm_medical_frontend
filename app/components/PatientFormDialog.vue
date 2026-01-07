<template>
    <v-dialog :model-value="isOpen" @update:model-value="val => !val && close()" max-width="1200" persistent scrollable transition="dialog-bottom-transition" @keydown.esc="close">
        <v-card class="rounded-3xl shadow-2xl overflow-hidden border border-black/40!" elevation="24">
            <!-- هدر -->
            <v-card-title class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-8">
                <div class="flex items-center justify-between w-full">
                    <h2 class="text-2xl font-bold tracking-tight">
                        {{ mode === 'edit' ? 'ویرایش اطلاعات بیمار' : 'ثبت بیمار جدید و اولین ویزیت' }}
                    </h2>
                    <v-btn icon variant="text" size="medium" class="fill-white hover:fill-red-200" @click="close">
                        <CloseCircle class="w-7 h-7" />
                    </v-btn>
                </div>
            </v-card-title>

            <v-card-text class="pt-2 pb-0 px-8">
                <!-- تب‌ها -->
                <v-tabs v-model="activeTab" color="blue-700" bg-color="transparent" grow class="" slider-color="blue-600" height="50">
                    <v-tab value="basic" class="text-base font-medium">اطلاعات پایه</v-tab>
                    <v-tab value="medical" class="text-base font-medium">سابقه پزشکی</v-tab>
                    <v-tab value="pregnancy" class="text-base font-medium">بارداری و زایمان</v-tab>
                    <!--<v-tab value="visit" class="text-base font-medium">ویزیت فعلی</v-tab>-->
                    <v-tab value="attachments" class="text-base font-medium">مستندات و فایل‌ها</v-tab>
                </v-tabs>

                <v-window v-model="activeTab" class="pt-4">
                    <!-- تب اطلاعات پایه -->
                    <v-window-item value="basic">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.first_name" label="نام *" variant="outlined" density="comfortable" ref="firstField" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.last_name" label="نام خانوادگی *" variant="outlined" density="comfortable" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.national_id" label="شماره ملی *" variant="outlined" maxlength="10" density="comfortable" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.insurance_code" label="کد بیمه" variant="outlined" density="comfortable" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field v-model="form.phone" label="شماره تماس" variant="outlined" type="tel" density="comfortable" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <PersianDatetimePicker v-model="form.birth_date" type="date" placeholder="انتخاب تاریخ تولد" display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#2563eb" auto-submit clearable custom-input class="w-full" />
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="form.address" label="آدرس" variant="outlined" rows="2" density="comfortable" />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select v-model="form.marital_status" :items="['مجرد', 'متاهل', 'مطلقه', 'بیوه']" label="وضعیت تأهل" variant="outlined" density="comfortable" />
                            </v-col>
                        </v-row>
                    </v-window-item>

                    <!-- تب سابقه پزشکی -->
                    <v-window-item value="medical">
                        <div class="space-y-6">
                            <div>
                                <div class="flex justify-between align-middle items-center">
                                    <h3 class="text-lg font-semibold mb-4">بیماری‌های مزمن</h3>
                                    <v-btn color="blue-600" variant="outlined" @click="form.diseases.push({ name: '', diagnosed_at: null })">
                                        افزودن بیماری
                                    </v-btn>
                                </div>
                                <div v-for="(disease, i) in form.diseases" :key="i" class="flex gap-3 mb-4 items-center">
                                    <v-text-field v-model="disease.name" label="نام بیماری" variant="outlined" class="flex-1" density="comfortable" />
                                    <div class="w-64">
                                        <PersianDatetimePicker v-model="disease.diagnosed_at" type="date" placeholder="تاریخ تشخیص" display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#2563eb" auto-submit clearable custom-input />
                                    </div>
                                    <v-btn icon variant="text" size="small" @click="form.diseases.splice(i, 1)">
                                        <TrashBin class="w-5 h-5 fill-red-600" />
                                    </v-btn>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between align-middle items-center">
                                    <h3 class="text-lg font-semibold mb-4">داروهای مصرفی</h3>
                                    <v-btn color="blue-600" variant="outlined" @click="form.medications.push({ name: '', dosage: '' })">
                                        افزودن دارو
                                    </v-btn>
                                </div>
                                <div v-for="(med, i) in form.medications" :key="i" class="flex gap-3 mb-4 items-center justify-center align-middle">
                                    <v-text-field v-model="med.name" label="نام دارو" variant="outlined" class="flex-1" density="comfortable" />
                                    <v-text-field v-model="med.dosage" label="دوز" variant="outlined" density="comfortable" />
                                    <v-btn icon variant="text" size="small" @click="form.medications.splice(i, 1)">
                                        <TrashBin class="w-5 h-5 fill-red-600" />
                                    </v-btn>
                                </div>
                            </div>

                            <div>
                                <div class="flex justify-between align-middle items-center">
                                    <h3 class="text-lg font-semibold mb-4">آلرژی و حساسیت</h3>
                                    <v-btn color="blue-600" variant="outlined" @click="form.allergies.push({ substance: '', severity: 'متوسط' })">
                                        افزودن حساسیت
                                    </v-btn>
                                </div>
                                <div v-for="(allergy, i) in form.allergies" :key="i" class="flex gap-3 mb-4 items-center">
                                    <v-text-field v-model="allergy.substance" label="ماده حساسیت‌زا" variant="outlined" class="flex-1" density="comfortable" />
                                    <v-select v-model="allergy.severity" :items="['خفیف', 'متوسط', 'شدید']" label="شدت" variant="outlined" density="comfortable" />
                                    <v-btn icon variant="text" size="small" @click="form.allergies.splice(i, 1)">
                                        <TrashBin class="w-5 h-5 fill-red-600" />
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </v-window-item>

                    <!-- تب بارداری -->
                    <v-window-item value="pregnancy">
                        <div class="space-y-6 flex flex-col gap-4">
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="pregnancySummary.live" label="تعداد زایمان زنده" type="number" variant="outlined" density="comfortable" />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="pregnancySummary.abortion" label="تعداد سقط" type="number" variant="outlined" density="comfortable" />
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="pregnancySummary.current" label="بارداری فعلی (هفته)" type="number" variant="outlined" density="comfortable" />
                                </v-col>
                            </v-row>
                            <v-textarea v-model="form.pregnancy_notes" label="یادداشت‌های بارداری" variant="outlined" rows="4" density="comfortable" />
                        </div>
                    </v-window-item>

                    <!-- تب ویزیت فعلی -->
                    <!--
                    <v-window-item value="visit">
                        <v-row>
                            <v-col cols="12" md="8">
                                <PersianDatetimePicker v-model="visit.visit_date" type="datetime" placeholder="انتخاب تاریخ و ساعت ویزیت" display-format="jYYYY/jMM/jDD - HH:mm" format="YYYY-MM-DD HH:mm" color="#2563eb" auto-submit clearable custom-input class="w-full" />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-select v-model="visit.visit_type" :items="['ویزیت اولیه', 'پیگیری', 'چکاپ دوره‌ای', 'اورژانسی']" label="نوع ویزیت" variant="outlined" density="comfortable" />
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="visit.reason" label="علت مراجعه" variant="outlined" rows="3" density="comfortable" />
                            </v-col>
                            <v-col cols="12">
                                <v-textarea v-model="visit.notes" label="یادداشت پزشک" variant="outlined" rows="6" density="comfortable" />
                            </v-col>
                        </v-row>
                    </v-window-item>
                    -->
                    
                    <!-- تب فایل‌ها -->
                    <v-window-item value="attachments">
                        <div class="space-y-8 py-4">
                            <div>
                                <h4 class="text-lg font-semibold text-slate-800 mb-4">آپلود فایل‌ها</h4>
                                <v-file-input v-model="attachments.ultrasound" label="سونوگرافی" variant="outlined" accept="image/*,application/pdf" multiple show-size chips density="comfortable" prepend-icon="mdi-sun-wireless" class="mb-6" />
                                <v-file-input v-model="attachments.lab" label="گزارش آزمایش" variant="outlined" accept=".pdf,.jpg,.jpeg,.png" multiple show-size chips density="comfortable" prepend-icon="mdi-flask" class="mb-6" />
                                <v-file-input v-model="attachments.prescription" label="نسخه قبلی" variant="outlined" accept="image/*,application/pdf" multiple show-size chips density="comfortable" prepend-icon="mdi-prescription" />
                            </div>
                        </div>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <!-- دکمه‌های پایین ثابت -->
            <v-card-actions class="sticky bottom-0 bg-white border-t border-slate-200 px-8 py-5 shadow-lg z-10">
                <v-spacer />
                <v-btn color="grey-darken-1" variant="text" size="large" @click="close">
                    انصراف
                </v-btn>
                <v-btn color="blue-darken-1" variant="elevated" size="large" class="px-8 shadow-lg" :loading="loading" @click="submitForm" @keydown.enter.prevent="submitForm">
                    {{ mode === 'edit' ? 'به‌روزرسانی بیمار' : 'ثبت بیمار و ویزیت' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { useEventBus } from '~/composables/useEventBus'

const { emit } = useEventBus()
const { isOpen, mode, patientId, patientData, close } = usePatientFormDialog()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

const loading = ref(false)
const activeTab = ref('basic')
const firstField = ref<any>(null)

// فرم‌ها
const form = reactive({
    first_name: '',
    last_name: '',
    national_id: '',
    insurance_code: '',
    birth_date: null as string | null,
    phone: '',
    address: '',
    marital_status: '',
    diseases: [] as Array<{ name: string; diagnosed_at: string | null }>,
    medications: [] as Array<{ name: string; dosage?: string }>,
    allergies: [] as Array<{ substance: string; severity?: 'خفیف' | 'متوسط' | 'شدید' }>,
    pregnancy_notes: '',
})

const pregnancySummary = reactive({
    live: 0,
    abortion: 0,
    current: null as number | null,
})

const visit = reactive({
    visit_date: new Date().toISOString().slice(0, 16),
    visit_type: 'ویزیت اولیه',
    reason: '',
    notes: '',
})

const attachments = reactive({
    ultrasound: [] as File[],
    lab: [] as File[],
    prescription: [] as File[],
})

// پر کردن فرم هنگام باز شدن
watch(patientData, (data) => {
    if (!data) {
        // حالت ثبت جدید
        Object.assign(form, {
            first_name: '',
            last_name: '',
            national_id: '',
            insurance_code: '',
            birth_date: null,
            phone: '',
            address: '',
            marital_status: '',
            diseases: [],
            medications: [],
            allergies: [],
            pregnancy_notes: '',
        })
        pregnancySummary.live = 0
        pregnancySummary.abortion = 0
        pregnancySummary.current = null
        visit.visit_date = new Date().toISOString().slice(0, 16)
        visit.visit_type = 'ویزیت اولیه'
        visit.reason = ''
        visit.notes = ''
        attachments.ultrasound = []
        attachments.lab = []
        attachments.prescription = []
        return
    }

    // حالت ویرایش
    form.first_name = data.firstName || ''
    form.last_name = data.lastName || ''
    form.national_id = data.nationalId || ''
    form.insurance_code = data.insuranceCode || ''
    form.birth_date = data.birthDate || null
    form.phone = data.phone || ''
    form.address = data.address || ''
    form.marital_status = data.maritalStatus || ''
    form.pregnancy_notes = data.pregnancyNotes || ''

    form.diseases = (data.diseases || []).map((d: any) => ({
        name: d.name || '',
        diagnosed_at: d.diagnosed_at || null,
    }))

    form.medications = (data.medications || []).map((m: any) => ({
        name: m.name || '',
        dosage: m.dosage || '',
    }))

    form.allergies = (data.allergies || []).map((a: any) => ({
        substance: a.substance || '',
        severity: a.severity || 'متوسط',
    }))

    if (data.pregnancy) {
        pregnancySummary.live = data.pregnancy.liveBirths ?? 0
        pregnancySummary.abortion = data.pregnancy.abortions ?? 0
        pregnancySummary.current = data.pregnancy.currentWeek ?? null
    } else {
        pregnancySummary.live = 0
        pregnancySummary.abortion = 0
        pregnancySummary.current = null
    }

    if (data.firstVisit) {
        visit.visit_date = data.firstVisit.visitDate
        visit.visit_type = data.firstVisit.visitType || 'ویزیت اولیه'
        visit.reason = data.firstVisit.visitReason || ''
        visit.notes = data.firstVisit.notes || ''
    } else {
        visit.visit_date = new Date().toISOString().slice(0, 16)
        visit.visit_type = 'ویزیت اولیه'
        visit.reason = ''
        visit.notes = ''
    }
}, { immediate: true })

// فوکوس روی اولین فیلد
watch(isOpen, async (val) => {
    if (val) {
        activeTab.value = 'basic'
        await nextTick()
        firstField.value?.focus()
    }
})

// تابع ثبت/به‌روزرسانی (همون کد قبلی‌ت رو اینجا بذار)
const submitForm = async () => {
    if (loading.value) return
    loading.value = true

    try {
        // ساخت payload دقیقاً مثل ثبت جدید
        const cleanedDiseases = form.diseases.filter(d => d.name.trim())
        const cleanedMedications = form.medications.filter(m => m.name.trim())
        const cleanedAllergies = form.allergies.filter(a => a.substance.trim())

        const payload = {
            patient: {
                ...form,
                birth_date: form.birth_date || null,
                diseases: cleanedDiseases.map(d => ({
                    name: d.name,
                    diagnosed_at: d.diagnosed_at || null,
                })),
                medications: cleanedMedications,
                allergies: cleanedAllergies,
                pregnancy_notes: form.pregnancy_notes || null,
            },
            pregnancy: pregnancySummary.current !== null || pregnancySummary.live > 0 || pregnancySummary.abortion > 0
                ? {
                    live: pregnancySummary.live,
                    abortion: pregnancySummary.abortion,
                    current: pregnancySummary.current,
                }
                : undefined,
            visit: {
                ...visit,
                visit_date: visit.visit_date.replace('T', ' '),
            },
        }

        let response
        if (mode.value === 'edit') {
            response = await apiFetch(`/api/patients/${patientId.value}`, {
                method: 'PUT',
                body: payload,
            })
        } else {
            response = await apiFetch('/api/patients/register', {
                method: 'POST',
                body: payload,
            })
        }

        if (response.success) {
            $toast.success(mode.value === 'edit' ? 'اطلاعات بیمار به‌روزرسانی شد' : 'بیمار با موفقیت ثبت شد')
            emit('patient:changed')
            console.log('Event emitted: patient:changed')
            close()
        } else {
            $toast.error(response.error || 'خطایی رخ داد')
        }
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
:deep(.vpd-input-group) {
    width: 100%;
}

:deep(.vpd-input-group input) {
    border: 1px solid #ABABAB;
    border-radius: 4px;
    height: 49px;
    padding: 0 16px;
    font-size: 1rem;
    background: white;
    transition: all 0.2s;
}

:deep(.vpd-input-group input:focus) {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}

.v-card {
    border: 1px solid rgba(0, 0, 0, 0.08);
}

:deep(.vpd-icon-btn) {
    display: none;
}

:deep(.v-input__details) {
    display: none;
}
</style>