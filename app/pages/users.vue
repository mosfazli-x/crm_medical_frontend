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
                                    <template v-if="user.role === 'doctor'">
                                        <v-tooltip :text="$t('users.editDoctorProfile')" location="top">
                                            <template v-slot:activator="{ props }">
                                                <v-btn v-bind="props" icon variant="text" size="small" class="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50" @click.stop="openDoctorProfileDialog(user)">
                                                    <v-icon size="20">mdi-doctor</v-icon>
                                                </v-btn>
                                            </template>
                                        </v-tooltip>
                                    </template>

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

        <v-dialog v-model="doctorProfileDialog" max-width="640" @update:model-value="onDoctorDialogClose">
            <v-card class="rounded-2xl">
                <v-card-title class="text-lg font-bold flex items-center justify-between px-6 pt-6">
                    <span>{{ $t('users.editDoctorProfile') }} — {{ doctorProfileUser?.fullName || '' }}</span>
                    <v-btn icon variant="text" size="small" @click="doctorProfileDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text class="px-6 pb-2 pt-2">
                    <p class="text-sm text-slate-500 dark:text-slate-300 mb-4">{{ $t('users.doctorProfileHint') }}</p>

                    <div class="space-y-4">
                        <v-text-field v-model="profileForm.specialty" :label="$t('users.specialty')"
                            :placeholder="$t('users.specialtyPlaceholder')" variant="outlined" density="comfortable" />
                        <v-textarea v-model="profileForm.bio" :label="$t('users.bio')"
                            :placeholder="$t('users.bioPlaceholder')" variant="outlined" density="comfortable"
                            rows="3" auto-grow />
                        <div class="grid grid-cols-2 gap-4">
                            <v-text-field v-model.number="profileForm.experienceYears"
                                :label="$t('users.experienceYears')" type="number" min="0" variant="outlined"
                                density="comfortable" />
                            <v-text-field v-model.number="profileForm.patientsCount"
                                :label="$t('users.patientsCount')" type="number" min="0" variant="outlined"
                                density="comfortable" />
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <v-text-field v-model.number="profileForm.rating" :label="$t('users.rating')"
                                type="number" min="0" max="5" step="0.1" variant="outlined"
                                density="comfortable" />
                            <v-text-field v-model.number="profileForm.sortOrder" :label="$t('users.sortOrder')"
                                type="number" variant="outlined" density="comfortable"
                                :hint="$t('users.sortOrderHint')" persistent-hint />
                        </div>
                        <v-switch v-model="profileForm.showOnLanding" color="#4F46E5"
                            :label="$t('users.showOnLanding')" :hint="$t('users.showOnLandingHint')"
                            persistent-hint inset />
                        <div class="flex items-center gap-4">
                            <div
                                class="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <img v-if="profilePhotoSrc" :src="profilePhotoSrc"
                                    alt="" class="w-full h-full object-cover" />
                                <v-icon v-else color="slate-400" size="32">mdi-account-circle-outline</v-icon>
                            </div>
                            <v-file-input :label="$t('users.uploadPhoto')"
                                accept="image/png,image/jpeg,image/webp,image/gif"
                                prepend-icon="mdi-camera-outline" variant="outlined" density="comfortable"
                                :loading="photoUploading" @update:model-value="onDoctorPhotoSelected" />
                        </div>
                    </div>
                </v-card-text>
                <v-card-actions class="px-6 pb-6 pt-2">
                    <v-btn variant="tonal" color="slate" @click="doctorProfileDialog = false">
                        {{ $t('common.cancel') }}
                    </v-btn>
                    <v-spacer />
                    <v-btn :loading="profileSaving" color="#4F46E5" @click="saveDoctorProfile">
                        <v-icon start>mdi-content-save-outline</v-icon>
                        {{ $t('users.saveProfile') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
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

const doctorProfileDialog = ref(false)
const doctorProfileUser = ref<any>(null)
const profileSaving = ref(false)
const photoUploading = ref(false)
const profileForm = ref({
    specialty: '',
    bio: '',
    experienceYears: null as number | null,
    patientsCount: null as number | null,
    rating: null as number | null,
    sortOrder: null as number | null,
    showOnLanding: true,
    photoUrl: null as string | null,
})
const profilePhotoPreview = ref<string | null>(null)
const profilePhotoFile = ref<File | null>(null)

const profilePhotoSrc = computed(() => {
  if (profilePhotoPreview.value) return profilePhotoPreview.value
  if (profileForm.value.photoUrl && doctorProfileUser.value?.id) {
    return `/api/doctor-profiles/${doctorProfileUser.value.id}/photo`
  }
  return null
})

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

const openDoctorProfileDialog = async (user: any) => {
    doctorProfileUser.value = user
    profileForm.value = {
        specialty: '',
        bio: '',
        experienceYears: null,
        patientsCount: null,
        rating: null,
        sortOrder: null,
        showOnLanding: true,
        photoUrl: null,
    }
    profilePhotoPreview.value = null
    profilePhotoFile.value = null
    doctorProfileDialog.value = true

    try {
        const response = await apiFetch(`/api/doctor-profiles/${user.id}`)
        if (response.success && response.data) {
            const p = response.data
            profileForm.value = {
                specialty: p.specialty || '',
                bio: p.bio || '',
                experienceYears: p.experienceYears ?? null,
                patientsCount: p.patientsCount ?? null,
                rating: p.rating != null ? Number(p.rating) : null,
                sortOrder: p.sortOrder ?? null,
                showOnLanding: p.showOnLanding ?? true,
                photoUrl: p.photoUrl || null,
            }
        }
    } catch {
        $toast.error(t('users.profileFetchError'))
    }
}

const onDoctorDialogClose = (open: boolean) => {
    if (!open) {
        profilePhotoFile.value = null
        profilePhotoPreview.value = null
    }
}

const onDoctorPhotoSelected = (file: File | null) => {
    profilePhotoFile.value = file ?? null
    profilePhotoPreview.value = file ? URL.createObjectURL(file) : null
}

const saveDoctorProfile = async () => {
    const user = doctorProfileUser.value
    if (!user) return

    profileSaving.value = true
    try {
        const payload: Record<string, string | number | boolean | null> = {}
        if (profileForm.value.specialty) payload.specialty = profileForm.value.specialty
        if (profileForm.value.bio) payload.bio = profileForm.value.bio
        if (profileForm.value.experienceYears != null) payload.experienceYears = profileForm.value.experienceYears
        if (profileForm.value.patientsCount != null) payload.patientsCount = profileForm.value.patientsCount
        if (profileForm.value.rating != null) payload.rating = profileForm.value.rating
        if (profileForm.value.sortOrder != null) payload.sortOrder = profileForm.value.sortOrder
        payload.showOnLanding = profileForm.value.showOnLanding

        const response = await apiFetch(`/api/doctor-profiles/${user.id}`, {
            method: 'PUT',
            body: payload,
        })
        if (!response.success) {
            $toast.error(t('users.profileSaveError'))
            return
        }

        if (profilePhotoFile.value) {
            const formData = new FormData()
            formData.append('photo', profilePhotoFile.value)
            const photoResponse = await apiFetch(`/api/doctor-profiles/${user.id}/photo`, {
                method: 'POST',
                body: formData,
            })
            if (!photoResponse.success) {
                $toast.error(t('users.photoUploadError'))
            } else {
                if (photoResponse.data?.photoUrl) {
                    profileForm.value.photoUrl = photoResponse.data.photoUrl
                }
                $toast.success(t('users.photoUploaded'))
            }
        }

        $toast.success(t('users.profileSaved'))
        doctorProfileDialog.value = false
        emit('user:changed')
    } catch {
        $toast.error(t('users.profileSaveError'))
    } finally {
        profileSaving.value = false
    }
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