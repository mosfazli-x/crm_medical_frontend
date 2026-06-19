<template>
    <div class="mx-auto max-w-7xl px-4 py-8 md:px-8 min-h-screen">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
                <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">مدیریت کاربران</h1>
                <p class="text-slate-500 mt-2 text-sm md:text-base font-medium">تأیید، رد یا تغییر وضعیت دسترسی کاربران سیستم</p>
            </div>

            <v-tabs v-model="statusTab" color="#5465ff" bg-color="transparent" class="w-full md:w-auto border-b border-slate-200">
                <v-tab value="all" class="text-sm font-semibold tracking-wide">
                    همه ({{ users.length }})
                </v-tab>
                <v-tab value="pending" class="text-sm font-semibold tracking-wide">
                    در انتظار تأیید
                    <span v-if="pendingCount > 0" class="mr-2 inline-flex items-center justify-center bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {{ pendingCount }}
                    </span>
                </v-tab>
                <v-tab value="approved" class="text-sm font-semibold tracking-wide">تأییدشده</v-tab>
                <v-tab value="rejected" class="text-sm font-semibold tracking-wide">غیرفعال/ردشده</v-tab>
            </v-tabs>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-right border-collapse">
                    <thead class="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="px-6 py-4 text-sm font-bold text-slate-600 whitespace-nowrap">نام کامل</th>
                            <th class="px-6 py-4 text-sm font-bold text-slate-600 whitespace-nowrap">شماره تلفن</th>
                            <th class="px-6 py-4 text-sm font-bold text-slate-600 whitespace-nowrap">نقش سیستم</th>
                            <th class="px-6 py-4 text-sm font-bold text-slate-600 whitespace-nowrap">سازمان / مرکز</th>
                            <th class="px-6 py-4 text-sm font-bold text-slate-600 whitespace-nowrap">وضعیت</th>
                            <th class="px-6 py-4 text-sm font-bold text-slate-600 whitespace-nowrap">تاریخ عضویت</th>
                            <th class="px-6 py-4 text-sm font-bold text-slate-600 text-center whitespace-nowrap">عملیات</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr 
                            v-for="user in filteredUsers" 
                            :key="user.id" 
                            class="hover:bg-slate-50/80 transition-colors duration-150"
                        >
                            <td class="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                                {{ user.fullName || 'کاربر بی‌نام' }}
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-slate-500 font-mono tracking-wider">
                                {{ user.phone }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="['px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset', roleConfig[user.role]?.bg || 'bg-slate-50', roleConfig[user.role]?.text || 'text-slate-600', roleConfig[user.role]?.ring || 'ring-slate-500/20']">
                                    {{ roleConfig[user.role]?.label || user.role }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                                {{ user.organizationName || '---' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="['px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset', statusConfig[user.status]?.bg || 'bg-slate-50', statusConfig[user.status]?.text || 'text-slate-600', statusConfig[user.status]?.ring || 'ring-slate-500/20']">
                                    {{ statusConfig[user.status]?.label || user.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                                {{ formatJalaliDate(user.createdAt) }}
                            </td>
                            <td class="px-6 py-4 text-center whitespace-nowrap">
                                <div class="flex justify-center items-center gap-1">
                                    <template v-if="user.status === 'pending'">
                                        <v-tooltip v-if="user.role !== 'patient'" text="تأیید کاربر" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" class="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" @click.stop="approveUser(user)">
                                                    <v-icon size="20">mdi-check-circle-outline</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>

                                        <v-tooltip v-else text="تأیید و ایجاد پرونده بیمار" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" class="text-electric-sapphire hover:text-electric-sapphire hover:bg-light-cyan" @click.stop="openApprovePatientDialog(user)">
                                                    <v-icon size="20">mdi-account-plus-outline</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>

                                        <v-tooltip text="رد درخواست" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" class="text-red-400 hover:text-red-600 hover:bg-red-50" @click.stop="rejectUser(user)">
                                                    <v-icon size="20">mdi-close-circle-outline</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>
                                    </template>

                                    <template v-else>
                                        <v-tooltip :text="user.status === 'approved' ? 'مسدودسازی موقت' : 'بازگردانی حساب'" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" :class="user.status === 'approved' ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'" @click.stop="toggleStatus(user)">
                                                    <v-icon size="20">{{ user.status === 'approved' ? 'mdi-account-cancel-outline' : 'mdi-account-check-outline' }}</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>
                                    </template>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-if="loading" class="flex flex-col items-center justify-center p-16">
                <v-progress-circular indeterminate size="48" color="#5465ff" />
                <p class="mt-4 text-sm font-medium text-slate-500">در حال دریافت اطلاعات...</p>
            </div>

            <div v-if="!loading && filteredUsers.length === 0" class="flex flex-col items-center justify-center py-8">
                <div class="bg-slate-50 p-6 rounded-full mb-4">
                    <v-icon size="48" color="slate-300">mdi-account-search-outline</v-icon>
                </div>
                <h3 class="text-lg font-bold text-slate-700">کاربری یافت نشد</h3>
                <p class="mt-1 text-sm text-slate-500">در این دسته‌بندی هیچ کاربری برای نمایش وجود ندارد.</p>
            </div>
        </div>

        <ApprovePatientDialog v-model="approvePatientDialog" :user="selectedUser" @approved="onUserApproved" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useEventBus } from '~/composables/useEventBus'

const { apiFetch } = useApi()
const { emit, on: onEventBus } = useEventBus()
const { $toast } = useNuxtApp()

const users = ref<any[]>([])
const loading = ref(true)
const statusTab = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')
const selectedUser = ref<any>(null)
const approvePatientDialog = ref(false)

// نگاشت تنظیمات نقش‌ها برای خوانایی بهتر کد
const roleConfig: Record<string, { label: string, bg: string, text: string, ring: string }> = {
    admin_doctor: { label: 'مدیر کلینیک', bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
    doctor: { label: 'پزشک', bg: 'bg-light-cyan', text: 'text-electric-sapphire', ring: 'ring-electric-sapphire/20' },
    lab: { label: 'آزمایشگاه', bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' },
    pharmacy: { label: 'داروخانه', bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-600/20' },
    patient: { label: 'بیمار', bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-600/20' }
}

// نگاشت تنظیمات وضعیت‌ها
const statusConfig: Record<string, { label: string, bg: string, text: string, ring: string }> = {
    pending: { label: 'در انتظار بررسی', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
    approved: { label: 'فعال', bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    rejected: { label: 'غیرفعال شده', bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-500/20' }
}

const filteredUsers = computed(() => {
    if (statusTab.value === 'all') return users.value
    return users.value.filter(u => u.status === statusTab.value)
})

const pendingCount = computed(() => users.value.filter(u => u.status === 'pending').length)

const fetchUsers = async () => {
    loading.value = true
    try {
        const response = await apiFetch('/api/users')
        if (response.success) {
            users.value = response.data
        } else {
            $toast.error('خطا در دریافت لیست کاربران.')
        }
    } catch (err) {
        $toast.error('خطا در ارتباط با سرور.')
    } finally {
        loading.value = false
    }
}

const approveUser = async (user: any) => {
    const roleName = roleConfig[user.role]?.label || user.role
    if (!confirm(`آیا از تأیید دسترسی حساب "${user.fullName}" (${roleName}) اطمینان دارید؟`)) return

    try {
        const response = await apiFetch(`/api/users/approve/${user.id}`, { method: 'POST' })
        if (response.success) {
            $toast.success('کاربر با موفقیت فعال شد.')
            emit('user:changed')
        }
    } catch (err) {
        $toast.error('خطا در انجام عملیات تأیید.')
    }
}

const rejectUser = async (user: any) => {
    if (!confirm(`آیا از رد درخواست حساب "${user.fullName}" اطمینان دارید؟`)) return

    try {
        const response = await apiFetch(`/api/users/reject/${user.id}`, { method: 'POST' })
        if (response.success) {
            $toast.success('درخواست کاربر رد شد.')
            emit('user:changed')
        }
    } catch (err) {
        $toast.error('خطا در انجام عملیات رد کاربر.')
    }
}

const toggleStatus = async (user: any) => {
    const isApproved = user.status === 'approved'
    const actionName = isApproved ? 'مسدود' : 'فعال'
    const endpoint = isApproved ? 'deactivate' : 'activate'

    if (!confirm(`آیا از ${actionName} کردن موقت حساب "${user.fullName}" اطمینان دارید؟`)) return

    try {
        const response = await apiFetch(`/api/users/${endpoint}/${user.id}`, { method: 'POST' })
        if (response.success) {
            $toast.success(`حساب کاربری با موفقیت ${actionName} شد.`)
            emit('user:changed')
        }
    } catch (err) {
        $toast.error('خطا در تغییر وضعیت سیستم.')
    }
}

const openApprovePatientDialog = (user: any) => {
    selectedUser.value = user
    approvePatientDialog.value = true
}

const onUserApproved = () => {
    $toast.success('پرونده بیمار ایجاد و حساب کاربری فعال شد.')
    emit('user:changed')
    approvePatientDialog.value = false
}

const formatJalaliDate = (date: string | null) => {
    if (!date) return '---'
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

onMounted(() => {
    fetchUsers()
})

onEventBus('user:changed', () => {
    fetchUsers()
})

useSeoMeta({ title: 'مدیریت کاربران | سیستم یکپارچه' })
</script>