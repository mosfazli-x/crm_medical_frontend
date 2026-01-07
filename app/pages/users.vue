<!-- pages/users/index.vue -->
<template>
  <div class="p-2! md:p-6! lg:p-8! pt-8">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div>
        <h1 class="text-4xl font-bold text-slate-800">مدیریت کاربران</h1>
        <p class="text-slate-600 mt-3 text-lg">تأیید، رد یا تغییر وضعیت دسترسی کاربران سیستم</p>
      </div>

      <!-- تب‌ها با ظاهر حرفه‌ای‌تر -->
      <v-tabs v-model="statusTab" color="cyan-600" bg-color="white" grow class="rounded-xl shadow-md overflow-hidden w-full md:w-auto">
        <v-tab value="all" class="text-base font-medium">همه ({{ users.length }})</v-tab>
        <v-tab value="pending" class="text-base font-medium">
          در انتظار تأیید <v-chip size="small" color="yellow-600" class="mr-2">{{ pendingCount }}</v-chip>
        </v-tab>
        <v-tab value="approved" class="text-base font-medium">تأییدشده</v-tab>
        <v-tab value="rejected" class="text-base font-medium">غیرفعال/ردشده</v-tab>
      </v-tabs>
    </div>

    <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
      <v-table class="min-w-full">
        <thead class="bg-gradient-to-r from-cyan-50 to-blue-50 border-b-2 border-cyan-200">
          <tr>
            <th class="px-8 py-5 text-right text-base font-bold text-slate-700">نام کامل</th>
            <th class="px-8 py-5 text-right text-base font-bold text-slate-700">شماره تلفن</th>
            <th class="px-8 py-5 text-right text-base font-bold text-slate-700">نقش</th>
            <th class="px-8 py-5 text-right text-base font-bold text-slate-700">سازمان</th>
            <th class="px-8 py-5 text-right text-base font-bold text-slate-700">وضعیت دسترسی</th>
            <th class="px-8 py-5 text-right text-base font-bold text-slate-700">تاریخ ثبت</th>
            <th class="px-8 py-5 text-center text-base font-bold text-slate-700">عملیات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-cyan-50/50 transition-all duration-200 border-b border-slate-100">
            <td class="px-8 py-5 text-base text-slate-800 font-medium">{{ user.fullName || '-' }}</td>
            <td class="px-8 py-5 text-base text-slate-600">{{ user.phone }}</td>
            <td class="px-8 py-5">
              <span class="px-4 py-2 rounded-full text-sm font-semibold shadow-sm" :class="roleClass(user.role)">
                {{ roleLabel(user.role) }}
              </span>
            </td>
            <td class="px-8 py-5 text-base text-slate-600">{{ user.organizationName || '-' }}</td>
            <td class="px-8 py-5">
              <span class="px-4 py-2 rounded-full text-sm font-semibold shadow-sm" :class="statusClass(user.status)">
                {{ statusLabel(user.status) }}
              </span>
            </td>
            <td class="px-8 py-5 text-base text-slate-600">{{ formatJalaliDate(user.createdAt) }}</td>
            <td class="px-8 py-5 text-center">
              <div class="flex justify-center items-center gap-3">
                <!-- pending -->
                <template v-if="user.status === 'pending'">
                  <v-tooltip v-if="user.role !== 'patient'" text="تأیید کاربر">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon size="large" color="green-600" variant="elevated" @click.stop="approveUser(user)">
                        <v-icon>mdi-check-bold</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip v-else v-bind="props" text="تأیید و ایجاد پرونده بیمار">
                    <template v-slot:activator="{ props }">
                      <v-btn  icon size="large" color="blue-600" variant="elevated" @click.stop="openApprovePatientDialog(user)">
                        <v-icon>mdi-account-check</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip text="رد درخواست">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon size="large" color="red-600" variant="elevated" @click.stop="rejectUser(user)">
                        <v-icon>mdi-close-thick</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>

                <!-- approved یا rejected -->
                <template v-else>
                  <v-tooltip :text="user.status === 'approved' ? 'غیرفعال کردن دسترسی' : 'فعال کردن مجدد دسترسی'">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon size="large" :color="user.status === 'approved' ? 'red-600' : 'green-600'" variant="elevated" @click.stop="toggleStatus(user)">
                        <v-icon>{{ user.status === 'approved' ? 'mdi-account-off' : 'mdi-account-check' }}</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- loading state -->
      <div v-if="loading" class="p-16 text-center">
        <v-progress-circular indeterminate size="64" color="cyan-600" />
        <p class="mt-6 text-xl text-slate-500">در حال بارگذاری کاربران...</p>
      </div>

      <!-- empty state -->
      <div v-if="!loading && filteredUsers.length === 0" class="p-16 text-center">
        <v-icon size="80" color="slate-300">mdi-account-multiple-off</v-icon>
        <p class="mt-6 text-xl text-slate-500">کاربری با این وضعیت یافت نشد.</p>
      </div>
    </div>

    <!-- modal تأیید بیمار -->
    <ApprovePatientDialog v-model="approvePatientDialog" :user="selectedUser" @approved="onUserApproved" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useEventBus } from '~/composables/useEventBus'

const { apiFetch } = useApi()
const { emit } = useEventBus()
const { $toast } = useNuxtApp()

const users = ref<any[]>([])
const loading = ref(true)
const statusTab = ref<'all' | 'pending' | 'approved' | 'rejected'>('pending')

const selectedUser = ref<any>(null)
const approvePatientDialog = ref(false)

// فیلتر کاربران
const filteredUsers = computed(() => {
  if (statusTab.value === 'all') return users.value
  return users.value.filter(u => u.status === statusTab.value)
})

// تعداد pending
const pendingCount = computed(() => users.value.filter(u => u.status === 'pending').length)

// fetch
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/api/users')
    if (response.success) {
      users.value = response.data
    } else {
      $toast.error('خطا در دریافت لیست کاربران')
    }
  } catch (err) {
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    loading.value = false
  }
}

// تأیید ساده
const approveUser = async (user: any) => {
  if (!confirm(`آیا از تأیید کاربر "${user.fullName}" (${roleLabel(user.role)}) مطمئن هستید؟`)) return

  try {
    const response = await apiFetch(`/api/users/approve/${user.id}`, { method: 'POST' })
    if (response.success) {
      $toast.success('کاربر با موفقیت تأیید شد')
      emit('user:changed')
    }
  } catch (err) {
    $toast.error('خطا در تأیید کاربر')
  }
}

// رد کاربر
const rejectUser = async (user: any) => {
  if (!confirm(`آیا از رد درخواست "${user.fullName}" مطمئن هستید؟`)) return

  try {
    const response = await apiFetch(`/api/users/reject/${user.id}`, { method: 'POST' })
    if (response.success) {
      $toast.success('کاربر با موفقیت رد و غیرفعال شد')
      emit('user:changed')
    }
  } catch (err) {
    $toast.error('خطا در رد کاربر')
  }
}

// تغییر وضعیت (غیرفعال/فعال)
const toggleStatus = async (user: any) => {
  const newStatus = user.status === 'approved' ? 'rejected' : 'approved'
  const action = newStatus === 'rejected' ? 'غیرفعال' : 'فعال'

  if (!confirm(`آیا از ${action} کردن دسترسی "${user.fullName}" مطمئن هستید؟`)) return

  const endpoint = newStatus === 'rejected' ? 'deactivate' : 'activate'

  try {
    const response = await apiFetch(`/api/users/${endpoint}/${user.id}`, { method: 'POST' })
    if (response.success) {
      $toast.success(`کاربر با موفقیت ${action} شد`)
      emit('user:changed')
    }
  } catch (err) {
    $toast.error('خطا در تغییر وضعیت دسترسی')
  }
}

// modal بیمار
const openApprovePatientDialog = (user: any) => {
  selectedUser.value = user
  approvePatientDialog.value = true
}

const onUserApproved = () => {
  $toast.success('بیمار با موفقیت تأیید و پرونده ایجاد شد')
  emit('user:changed')
  approvePatientDialog.value = false
}

// کلاس‌ها و لیبل‌ها
const roleClass = (role: string) => {
  switch (role) {
    case 'admin_doctor': return 'bg-red-100 text-red-900'
    case 'doctor': return 'bg-blue-100 text-blue-900'
    case 'lab': return 'bg-purple-100 text-purple-900'
    case 'pharmacy': return 'bg-green-100 text-green-900'
    case 'patient': return 'bg-orange-100 text-orange-900'
    default: return 'bg-gray-100 text-gray-900'
  }
}

const roleLabel = (role: string) => {
  switch (role) {
    case 'admin_doctor': return 'مدیر کلینیک'
    case 'doctor': return 'پزشک'
    case 'lab': return 'آزمایشگاه'
    case 'pharmacy': return 'داروخانه'
    case 'patient': return 'بیمار'
    default: return role
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-900'
    case 'approved': return 'bg-green-100 text-green-900'
    case 'rejected': return 'bg-red-100 text-red-900'
    default: return 'bg-gray-100 text-gray-900'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'در انتظار تأیید'
    case 'approved': return 'فعال'
    case 'rejected': return 'غیرفعال'
    default: return status
  }
}

const formatJalaliDate = (date: string | null) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('fa-IR').format(new Date(date))
}

onMounted(() => {
  fetchUsers()
})

watch(statusTab, fetchUsers) // اگر بخوای هر تب جدا fetch کنه، اما فعلاً همه رو یکجا

useEventBus().on('user:changed', () => {
  console.log('کاربر تغییر کرد — لیست به‌روزرسانی می‌شه')
  fetchUsers()
})

useSeoMeta({
  title: 'مدیریت کاربران',
})
</script>

<style scoped>
/* انیمیشن نرم‌تر برای hover جدول */
tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>