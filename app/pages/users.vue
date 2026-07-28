<template>
    <UiPageContainer>
        <UiPageHeader :title="$t('users.title')" :subtitle="$t('users.subtitle')">
            <template #actions>
                <v-tabs v-model="statusTab" color="#4F46E5" bg-color="transparent" class="w-full md:w-auto">
                <v-tab value="all" class="text-sm font-semibold tracking-wide">
                    {{ $t('users.all') }} ({{ users.length }})
                </v-tab>
                <v-tab value="pending" class="text-sm font-semibold tracking-wide">
                    {{ $t('users.pendingApproval') }}
                    <span v-if="pendingCount > 0" class="mr-2 inline-flex items-center justify-center bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        {{ pendingCount }}
                    </span>
                </v-tab>
                <v-tab value="approved" class="text-sm font-semibold tracking-wide">{{ $t('users.approved') }}</v-tab>
                <v-tab value="rejected" class="text-sm font-semibold tracking-wide">{{ $t('users.rejectedInactive') }}</v-tab>
            </v-tabs>
            </template>
        </UiPageHeader>

        <UiContentCard>
            <div class="crm-table-wrap">
                <table class="crm-table">
                    <thead>
                        <tr>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.fullName') }}</th>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.phone') }}</th>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.role') }}</th>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.organization') }}</th>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.status') }}</th>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.sms') }}</th>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.telegram') }}</th>
                            <th class="px-6 py-4 text-sm font-bold whitespace-nowrap">{{ $t('users.joinDate') }}</th>
                            <th class="px-6 py-4 text-sm font-bold text-center whitespace-nowrap">{{ $t('users.actions') }}</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr 
                            v-for="user in filteredUsers" 
                            :key="user.id" 
                            class="hover:bg-slate-50/80 dark:hover:bg-slate-700/60 transition-colors duration-150"
                        >
                            <td class="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                {{ user.fullName || $t('users.noName') }}
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-300 font-mono tracking-wider">
                                {{ user.phone }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="['px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset', roleConfig[user.role]?.bg || 'bg-slate-50', roleConfig[user.role]?.text || 'text-slate-600', roleConfig[user.role]?.ring || 'ring-slate-500/20']">
                                    {{ roleConfig[user.role]?.label || user.role }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-300 whitespace-nowrap">
                                {{ user.organizationName || '---' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="['px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset', statusConfig[user.status]?.bg || 'bg-slate-50', statusConfig[user.status]?.text || 'text-slate-600', statusConfig[user.status]?.ring || 'ring-slate-500/20']">
                                    {{ statusConfig[user.status]?.label || user.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <v-icon :color="user.smsEnabled ? 'success' : 'error'" size="20">
                                    {{ user.smsEnabled ? 'mdi-check-circle' : 'mdi-close-circle' }}
                                </v-icon>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <v-icon :color="user.telegramEnabled ? 'success' : 'error'" size="20">
                                    {{ user.telegramEnabled ? 'mdi-check-circle' : 'mdi-close-circle' }}
                                </v-icon>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-300 whitespace-nowrap">
                                {{ formatJalaliDate(user.createdAt) }}
                            </td>
                            <td class="px-6 py-4 text-center whitespace-nowrap">
                                <div class="flex justify-center items-center gap-1">
                                    <template v-if="user.status === 'pending'">
                                        <v-tooltip v-if="user.role !== 'patient'" :text="$t('users.approveUser')" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" class="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" @click.stop="approveUser(user)">
                                                    <v-icon size="20">mdi-check-circle-outline</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>

                                        <v-tooltip v-else :text="$t('users.approveAndCreate')" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" class="text-electric-sapphire hover:text-electric-sapphire hover:bg-light-cyan" @click.stop="openApprovePatientDialog(user)">
                                                    <v-icon size="20">mdi-account-plus-outline</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>

                                        <v-tooltip :text="$t('users.rejectRequest')" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" class="text-red-400 hover:text-red-600 hover:bg-red-50" @click.stop="rejectUser(user)">
                                                    <v-icon size="20">mdi-close-circle-outline</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>
                                    </template>

                                    <template v-else>
                                        <v-tooltip :text="user.status === 'approved' ? $t('users.temporaryBlock') : $t('users.restoreAccount')" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" :class="user.status === 'approved' ? 'text-red-600! dark:text-red-600/80! hover:text-red-500! hover:bg-red-50' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'" @click.stop="toggleStatus(user)">
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

            <div v-if="loading" class="flex flex-col items-center justify-center p-16!">
                <v-progress-circular indeterminate size="48" color="#4F46E5" />
                <p class="mt-4 text-sm font-medium text-slate-500 dark:text-slate-300">{{ $t('users.loading') }}</p>
            </div>

            <div v-if="!loading && filteredUsers.length === 0" class="flex flex-col items-center justify-center py-8">
                <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
                    <v-icon size="48" color="w-8 h-8 text-slate-300 dark:text-slate-500">mdi-account-search-outline</v-icon>
                </div>
                <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ $t('users.noUsersFound') }}</h3>
                <p class="mtext-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">{{ $t('users.noUsersInCategory') }}</p>
            </div>
        </UiContentCard>

        <ApprovePatientDialog v-model="approvePatientDialog" :user="selectedUser" @approved="onUserApproved" />
    </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import { useEventBus } from '~/composables/useEventBus'

const { t } = useI18n()
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
    admin_doctor: { label: t('users.roles.admin_doctor'), bg: 'bg-rose-50', text: 'text-rose-700', ring: 'ring-rose-600/20' },
    doctor: { label: t('users.roles.doctor'), bg: 'bg-light-cyan', text: 'text-electric-sapphire', ring: 'ring-electric-sapphire/20' },
    lab: { label: t('users.roles.lab'), bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-600/20' },
    pharmacy: { label: t('users.roles.pharmacy'), bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-600/20' },
    patient: { label: t('users.roles.patient'), bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-600/20' }
}

// نگاشت تنظیمات وضعیت‌ها
const statusConfig: Record<string, { label: string, bg: string, text: string, ring: string }> = {
    pending: { label: t('users.statuses.pending'), bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-600/20' },
    approved: { label: t('users.statuses.approved'), bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-600/20' },
    rejected: { label: t('users.statuses.rejected'), bg: 'bg-slate-100', text: 'text-slate-600', ring: 'ring-slate-500/20' }
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
            $toast.error(t('users.fetchError'))
        }
    } catch (err) {
        $toast.error(t('users.serverError'))
    } finally {
        loading.value = false
    }
}

const approveUser = async (user: any) => {
    const roleName = roleConfig[user.role]?.label || user.role
    if (!confirm(t('users.approveConfirm', { name: user.fullName, role: roleName }))) return

    try {
        const response = await apiFetch(`/api/users/approve/${user.id}`, { method: 'POST' })
        if (response.success) {
            $toast.success(t('users.approvedSuccess'))
            emit('user:changed')
        }
    } catch (err) {
        $toast.error(t('users.approveError'))
    }
}

const rejectUser = async (user: any) => {
    if (!confirm(t('users.rejectConfirm', { name: user.fullName }))) return

    try {
        const response = await apiFetch(`/api/users/reject/${user.id}`, { method: 'POST' })
        if (response.success) {
            $toast.success(t('users.rejectedSuccess'))
            emit('user:changed')
        }
    } catch (err) {
        $toast.error(t('users.rejectError'))
    }
}

const toggleStatus = async (user: any) => {
    const isApproved = user.status === 'approved'
    const actionName = isApproved ? t('common.inactive') : t('common.active')
    const endpoint = isApproved ? 'deactivate' : 'activate'

    if (!confirm(t('users.toggleConfirm', { action: actionName, name: user.fullName }))) return

    try {
        const response = await apiFetch(`/api/users/${endpoint}/${user.id}`, { method: 'POST' })
        if (response.success) {
            $toast.success(t('users.toggleSuccess', { action: actionName }))
            emit('user:changed')
        }
    } catch (err) {
        $toast.error(t('users.toggleError'))
    }
}

const openApprovePatientDialog = (user: any) => {
    selectedUser.value = user
    approvePatientDialog.value = true
}

const onUserApproved = () => {
    $toast.success(t('users.patientApproved'))
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

useSeoMeta({ title: t('users.titleSeo') })
</script>