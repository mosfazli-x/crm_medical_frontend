<!-- pages/patients/index.vue -->
<template>
    <div class="p-2! md:p-6! lg:p-8! pt-8">
        <div class="flex justify-between items-center align-middle mb-3">
            <h1 class="text-3xl font-bold text-slate-800 truncate w-full">لیست بیماران</h1>
            <AddNewPatientButton />
            <PatientFormDialog />
        </div>

        <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
            <v-table class="min-w-full border">
                <thead class="bg-slate-200 border-b">
                    <tr>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-slate-700">نام و نام خانوادگی</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-slate-700">شماره ملی</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-slate-700">شماره تماس</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-slate-700">تاریخ تولد</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-slate-700">وضعیت تأهل</th>
                        <th class="px-6 py-4 text-right text-sm font-semibold text-slate-700">تاریخ ثبت</th>
                        <th class="px-6 py-4 text-center text-sm font-semibold text-slate-700">عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="patient in patients" :key="patient.id" class="hover:bg-slate-50 transition-colors cursor-pointer border-b" @click="openPatientForEdit(patient)">
                        <td class="px-6 py-4 text-sm text-slate-800">{{ patient.firstName }} {{ patient.lastName }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ patient.nationalId }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ patient.phone || '-' }}</td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ formatJalaliDate(patient.birthDate) }}</td>
                        <td class="px-6 py-4 text-sm">
                            <span class="px-3 py-1 rounded-full text-xs font-medium" :class="maritalStatusClass(patient.maritalStatus)">
                                {{ patient.maritalStatus || '-' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-slate-600">{{ formatJalaliDate(patient.createdAt) }}</td>
                        <td class="px-6 py-4 text-center">
                            <v-btn icon variant="text" size="small" @click.stop="confirmDelete(patient)">
                                <TrashBin class="w-5 h-5 fill-red-600" />
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>

            <div v-if="loading" class="p-12 text-center text-slate-500">
                <v-progress-circular indeterminate color="blue-600" />
                <p class="mt-4">در حال بارگذاری بیماران...</p>
            </div>

            <div v-if="!loading && patients.length === 0" class="p-12 text-center text-slate-500">
                <p>هنوز بیماری ثبت نشده است.</p>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import PatientFormDialog from '~/components/PatientFormDialog.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import { useEventBus } from '~/composables/useEventBus'

const { openEdit } = usePatientFormDialog()
const { apiFetch } = useApi()
const { on, off } = useEventBus()
const { emit } = useEventBus()
const { $toast } = useNuxtApp()

const patients = ref<any[]>([])
const loading = ref(true)

const fetchPatients = async () => {
    loading.value = true
    try {
        const response = await apiFetch('/api/patients', {
            baseURL: useRuntimeConfig().public.apiBase,
        })

        if (response.success) {
            patients.value = response.data
            console.log('لیست بیماران به‌روزرسانی شد:', patients.value.length, 'بیمار')
        } else {
            $toast.error('خطا در دریافت لیست')
        }
    } catch (err: any) {
        console.error('خطای شبکه:', err)
        $toast.error('خطا در ارتباط با سرور')
    } finally {
        loading.value = false
    }
}

const openPatientForEdit = async (patient: any) => {
    const result = await apiFetch(`/api/patients/${patient.id}`)
    openEdit(patient.id, result.data)
}

const confirmDelete = async (patient: any) => {
    if (!confirm(`آیا از حذف بیمار "${patient.firstName} ${patient.lastName}" مطمئن هستید؟\nاین عمل قابل بازیابی است.`)) {
        return
    }

    try {
        const response = await apiFetch(`/api/patients/${patient.id}`, {
            method: 'DELETE',
        })

        if (response.success) {
            $toast.success('بیمار با موفقیت حذف شد')
            // حذف از لیست محلی
            emit('patient:changed')
        } else {
            $toast.error(response.error || 'خطا در حذف')
        }
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
    }
}

const formatJalaliDate = (date: string | null) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('fa-IR').format(new Date(date))
}

const maritalStatusClass = (status: string | null) => {
    switch (status) {
        case 'متاهل': return 'bg-green-100 text-green-800'
        case 'مجرد': return 'bg-blue-100 text-blue-800'
        case 'مطلقه': return 'bg-orange-100 text-orange-800'
        case 'بیوه': return 'bg-gray-100 text-gray-800'
        default: return 'bg-gray-100 text-gray-600'
    }
}

onMounted(() => {
    fetchPatients()
    on('patient:changed', () => {
        console.log('بیمار تغییر کرد — لیست به‌روزرسانی می‌شه')
        fetchPatients()
    })
})

onBeforeUnmount(() => {
    off('patient:changed')
})

useSeoMeta({
    title: 'لیست بیماران',
    ogTitle: 'بیماران',
})

</script>