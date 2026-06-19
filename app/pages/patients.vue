<template>
    <div class="max-w-7xl mx-auto p-4 md:p-8 pt-6 space-y-6">
        <div
            class="flex flex-col sm:flex-row justify-between items-center gap-4 pb-1 border-b border-slate-100">
            <div>
                <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">لیست بیماران</h1>
                <p class="text-sm text-slate-500 mt-1 font-medium">مدیریت و مشاهده پرونده بیماران کلینیک</p>
            </div>
            <div class="flex items-center gap-3 pb-4">
                <AddNewPatientButton />
                <PatientFormDialog />
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full text-right border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                نام و نام خانوادگی</th>
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                کد ملی</th>
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                شماره تماس</th>
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                تاریخ تولد</th>
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                وضعیت تأهل</th>
                            <th
                                class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                تاریخ ثبت</th>
                            <th
                                class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                عملیات</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-if="loading" v-for="i in 5" :key="`skeleton-${i}`">
                            <td colspan="7" class="p-4">
                                <v-skeleton-loader type="list-item" class="bg-transparent" />
                            </td>
                        </tr>

                        <tr v-else-if="patients.length === 0">
                            <td colspan="7" class="py-16 text-center">
                                <div class="flex flex-col items-center justify-center space-y-3">
                                    <div class="bg-slate-50 p-4 rounded-full">
                                        <v-icon icon="mdi-account-group-outline" size="48" color="slate-400" />
                                    </div>
                                    <p class="text-slate-500 font-medium text-lg">هیچ بیماری تا کنون ثبت نشده است.</p>
                                </div>
                            </td>
                        </tr>

                        <tr v-else v-for="patient in patients" :key="patient.id"
                            class="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                            @click="openPatientProfile(patient)">
                            <td class="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                                {{ patient.firstName }} {{ patient.lastName }}
                            </td>
                            <td class="px-6 py-4 text-sm text-slate-500 font-mono tracking-wider">{{ patient.nationalId
                                }}</td>
                            <td class="px-6 py-4 text-sm text-slate-500 font-mono tracking-wider" dir="ltr">{{
                                patient.phone || '-' }}</td>
                            <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{{
                                formatJalaliDate(patient.birthDate) }}</td>
                            <td class="px-6 py-4 text-sm whitespace-nowrap">
                                <span
                                    :class="['px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset', maritalStatusConfig[patient.maritalStatus]?.bg || 'bg-slate-50', maritalStatusConfig[patient.maritalStatus]?.text || 'text-slate-600', maritalStatusConfig[patient.maritalStatus]?.ring || 'ring-slate-500/20']">
                                    {{ patient.maritalStatus || 'نامشخص' }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{{
                                formatJalaliDate(patient.createdAt) }}</td>

                            <td class="px-6 py-4 text-center whitespace-nowrap">
                                <div
                                    class="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">

                            <v-tooltip text="پرونده کامل" location="top">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" icon variant="text" size="small"
                                        class="text-electric-sapphire hover:bg-light-cyan"
                                        @click.stop="navigateTo(`/patients/${patient.id}`)">
                                        <v-icon size="20">mdi-file-document-outline</v-icon>
                                    </v-btn>
                                </template>
                            </v-tooltip>

                            <v-tooltip text="ارسال پیامک" location="top">
                                <template v-slot:activator="{ props }">
                                    <v-btn v-bind="props" icon variant="text" size="small"
                                        class="text-cornflower-blue hover:bg-light-cyan"
                                        @click.stop="openSmsModal(patient)">
                                        <v-icon size="20">mdi-message-text-outline</v-icon>
                                    </v-btn>
                                </template>
                            </v-tooltip>

                                    <v-tooltip text="ویرایش اطلاعات" location="top">
                                        <template v-slot:activator="{ props }">
                                            <v-btn v-bind="props" icon variant="text" size="small"
                                                class="text-emerald-500 hover:bg-emerald-50"
                                                @click.stop="openPatientForEdit(patient)">
                                                <v-icon size="20">mdi-pencil-outline</v-icon>
                                            </v-btn>
                                        </template>
                                    </v-tooltip>

                                    <v-tooltip text="حذف پرونده" location="top">
                                        <template v-slot:activator="{ props }">
                                            <v-btn v-bind="props" icon variant="text" size="small"
                                                class="text-red-500 hover:bg-red-50"
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
        </div>

        <v-dialog v-model="profileDialog" max-width="650" class="backdrop-blur-sm">
            <div v-if="selectedProfile" class="bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div class="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-center gap-5">
                    <div
                        class="w-16 h-16 rounded-2xl bg-periwinkle text-electric-sapphire flex items-center justify-center text-2xl font-bold shadow-sm">
                        {{ selectedProfile.firstName?.charAt(0) }}{{ selectedProfile.lastName?.charAt(0) }}
                    </div>
                    <div>
                        <h2 class="text-2xl font-extrabold text-slate-800">{{ selectedProfile.firstName }} {{
                            selectedProfile.lastName }}</h2>
                        <p class="text-slate-500 font-mono mt-1 flex items-center gap-2">
                            {{ selectedProfile.nationalId }}
                        </p>
                    </div>
                </div>
                <div class="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 px-8 py-4">
                    <div class="space-y-1">
                        <span class="text-xs font-bold text-slate-400 uppercase">شماره تماس</span>
                        <p class="text-slate-800 font-mono font-medium" dir="ltr">{{ selectedProfile.phone || 'ثبت نشده'
                            }}</p>
                    </div>
                    <div class="space-y-1">
                        <span class="text-xs font-bold text-slate-400 uppercase">تاریخ تولد</span>
                        <p class="text-slate-800 font-medium">{{ formatJalaliDate(selectedProfile.birthDate) }}</p>
                    </div>
                    <div class="space-y-1">
                        <span class="text-xs font-bold text-slate-400 uppercase">وضعیت تأهل</span>
                        <p class="text-slate-800 font-medium">{{ selectedProfile.maritalStatus || 'نامشخص' }}</p>
                    </div>
                    <div class="space-y-1">
                        <span class="text-xs font-bold text-slate-400 uppercase">تاریخ تشکیل پرونده</span>
                        <p class="text-slate-800 font-medium">{{ formatJalaliDate(selectedProfile.createdAt) }}</p>
                    </div>
                </div>
                <div class="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button @click="profileDialog = false"
                        class="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded font-semibold hover:bg-slate-50 transition-colors">
                        بستن
                    </button>
                </div>
            </div>
        </v-dialog>

        <v-dialog v-model="smsDialog" max-width="500" class="backdrop-blur-sm">
            <div class="bg-white rounded shadow-2xl p-6">
                <div class="flex justify-between items-center my-4 px-4">
                    <h3 class="text-xl font-bold text-slate-800">ارسال پیامک</h3>
                    <v-btn icon variant="text" size="small" @click="smsDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </div>

                <div v-if="selectedSmsPatient" class="mb-4 bg-light-cyan/50 py-2 px-3 rounded border border-periwinkle">
                    <p class="text-sm text-slate-600">گیرنده:</p>
                    <p class="font-bold text-electric-sapphire mt-1">{{ selectedSmsPatient.firstName }} {{
                        selectedSmsPatient.lastName
                        }} <span class="font-mono text-cornflower-blue text-sm mr-2" dir="ltr">({{ selectedSmsPatient.phone
                            }})</span></p>
                </div>

                <div class="space-y-2 px-3">
                    <label class="text-sm font-bold text-slate-700 px-1">متن پیام</label>
                    <textarea v-model="smsText" rows="4"
                        class="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded focus:ring-2 focus:ring-electric-sapphire focus:border-electric-sapphire p-4 transition-all outline-none resize-none py-1 px-2"
                        placeholder="متن پیامک خود را اینجا بنویسید..."></textarea>
                </div>

                <div class="mt-6 mb-2 flex justify-end gap-3 px-2">
                    <v-btn variant="tonal" color="red" prepend-icon="mdi-close" class="rounded"
                        @click="smsDialog = false">انصراف</v-btn>
                    <v-btn variant="tonal" color="green" prepend-icon="mdi-send-variant" class="rounded"
                        @click="sendSms">ارسال
                        پیامک</v-btn>


                </div>
            </div>
        </v-dialog>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useApi } from '~/composables/useApi'
import PatientFormDialog from '~/components/PatientFormDialog.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import { useEventBus } from '~/composables/useEventBus'

const { openEdit } = usePatientFormDialog()
const { apiFetch } = useApi()
const { on, off, emit } = useEventBus()
const { $toast } = useNuxtApp()

const patients = ref<any[]>([])
const loading = ref(true)

// وضعیت‌های مربوط به نمایش پروفایل
const profileDialog = ref(false)
const selectedProfile = ref<any>(null)

// وضعیت‌های مربوط به ارسال پیامک
const smsDialog = ref(false)
const selectedSmsPatient = ref<any>(null)
const smsText = ref('')

// پیکربندی کلاس‌های وضعیت تأهل جهت خوانایی بالاتر (حذف switch-case)
const maritalStatusConfig: Record<string, { bg: string, text: string, ring: string }> = {
    'متاهل': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    'مجرد': { bg: 'bg-light-cyan', text: 'text-electric-sapphire', ring: 'ring-electric-sapphire/20' },
    'مطلقه': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
    'بیوه': { bg: 'bg-slate-100', text: 'text-slate-700', ring: 'ring-slate-500/20' }
}

const fetchPatients = async () => {
    loading.value = true
    try {
        const response = await apiFetch('/api/patients', {
            baseURL: useRuntimeConfig().public.apiBase,
        })
        if (response.success) {
            patients.value = response.data
        } else {
            $toast.error('خطا در دریافت لیست بیماران.')
        }
    } catch (err: any) {
        $toast.error('خطا در ارتباط با سرور.')
    } finally {
        loading.value = false
    }
}

// باز کردن مدال نمایش اطلاعات (اکشن کلیک روی سطر)
const openPatientProfile = (patient: any) => {
    selectedProfile.value = patient
    profileDialog.value = true
}

// باز کردن مدال ویرایش اطلاعات (اکشن کلیک روی آیکون مداد)
const openPatientForEdit = async (patient: any) => {
    try {
        const result = await apiFetch(`/api/patients/${patient.id}`)
        if (result.success && result.data) {
            openEdit(patient.id, result.data)
        } else {
            $toast.error('خطا در دریافت اطلاعات بیمار برای ویرایش.')
        }
    } catch (err) {
        $toast.error('خطا در ارتباط با سرور.')
    }
}

// باز کردن مدال پیامک و ارسال (اکشن کلیک روی آیکون پیام)
const openSmsModal = (patient: any) => {
    selectedSmsPatient.value = patient
    smsText.value = ''
    smsDialog.value = true
}

const sendSms = async () => {
    if (!smsText.value.trim()) {
        $toast.error('لطفاً متن پیامک را وارد کنید.')
        return
    }

    try {
        await apiFetch('/api/patients/send-sms', {
            method: 'POST',
            body: {
                phone: selectedSmsPatient.value.phone,
                text: smsText.value,
            },
        })
        $toast.success('پیامک با موفقیت در صف ارسال قرار گرفت.')
        smsDialog.value = false
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا در ارسال پیامک')
    }
}

// حذف بیمار
const confirmDelete = async (patient: any) => {
    if (!confirm(`آیا از حذف دائم پرونده "${patient.firstName} ${patient.lastName}" اطمینان دارید؟`)) return

    try {
        const response = await apiFetch(`/api/patients/${patient.id}`, { method: 'DELETE' })
        if (response.success) {
            $toast.success('پرونده بیمار با موفقیت حذف شد.')
            emit('patient:changed')
        } else {
            $toast.error(response.error || 'خطا در انجام عملیات حذف.')
        }
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا در ارتباط با سرور.')
    }
}

const formatJalaliDate = (date: string | null) => {
    if (!date) return '---'
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

onMounted(() => {
    fetchPatients()
    on('patient:changed', fetchPatients)
})

onBeforeUnmount(() => {
    off('patient:changed')
})

useSeoMeta({ title: 'لیست بیماران | سیستم کلینیک', ogTitle: 'مدیریت بیماران' })
</script>