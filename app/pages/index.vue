<template>
  <div class="mx-auto max-w-7xl px-4 py-10 md:px-8 min-h-screen bg-slate-50/50">
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">داشبورد</h1>
        <p class="text-sm font-medium text-slate-500 mt-2">{{ todayPersian }}</p>
      </div>

      <div v-if="!isDoctor && !isLoading"
        class="px-4 py-2 bg-white rounded-full border border-slate-200/70 shadow-sm text-sm text-slate-600 font-medium">
        👋 به پنل مدیریت کلینیک خوش آمدید
      </div>
    </header>

    <div v-if="isDoctor" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
      <div
        class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 px-3 py-3">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm font-medium text-slate-500 mb-1">نوبت‌های امروز</div>
            <div class="text-3xl font-black text-slate-800">{{ todayAppointments.length }}</div>
          </div>
          <div class="p-3">
            <Calendar class="w-6 h-6 text-blue-600 fill-current" />
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 px-3 py-3">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm font-medium text-slate-500 mb-1">تکمیل شده</div>
            <div class="text-3xl font-black text-slate-800">{{ completedCount }}</div>
          </div>
          <div class="p-3">
            <UsersGroup class="w-6 h-6 text-emerald-600 fill-current" />
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 px-3 py-3">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm font-medium text-slate-500 mb-1">در انتظار تایید</div>
            <div class="text-3xl font-black text-slate-800">{{ pendingCount }}</div>
          </div>
          <div class="p-3">
            <Clock class="w-6 h-6 text-amber-600 fill-current" />
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 px-3 py-3">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-sm font-medium text-slate-500 mb-1">وقت خالی امروز</div>
            <div class="text-3xl font-black text-slate-800">{{ availableSlotsCount }}</div>
          </div>
          <div class="p-3">
            <Grid class="w-6 h-6 text-indigo-600 stroke-current" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="isDoctor" class="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
        <h2 class="text-lg font-bold text-slate-800">برنامه امروز شما</h2>
        <NuxtLink to="/appointments"
          class="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1">
          مشاهده همه
          <span aria-hidden="true">&larr;</span>
        </NuxtLink>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <svg class="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-sm text-slate-500 font-medium">در حال دریافت اطلاعات...</span>
      </div>

      <div v-else-if="!todayAppointments.length"
        class="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
          <Calendar class="w-8 h-8 text-slate-300 fill-current" />
        </div>
        <h3 class="text-lg font-bold text-slate-700">هیچ نوبتی برای امروز ثبت نشده است</h3>
        <p class="text-sm text-slate-500 mt-2 max-w-sm">برنامه امروز شما خالی است. می‌توانید به کارهای دیگر خود برسید یا
          استراحت کنید.</p>
      </div>

      <div v-else class="divide-y divide-slate-100/80">
        <div v-for="appt in todayAppointments" :key="appt.id"
          class="p-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:bg-slate-50/50 transition-colors group px-3 py-1">

          <div
            class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center sm:border-l border-slate-200/60 sm:pl-6 shrink-0 sm:w-28">
            <span class="text-lg font-black text-slate-800 tracking-tight">{{ appt.startTime?.slice(0, 5) }}</span>
            <span class="text-xs font-medium text-slate-400 mt-0.5">تا {{ appt.endTime?.slice(0, 5) }}</span>
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {{ appt.patientFirstName }} {{ appt.patientLastName }}
            </h4>
            <div class="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-slate-500 font-medium">
              <span>{{ appt.patientPhone }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block"></span>
              <span>کد ملی: {{ appt.patientNationalId }}</span>
            </div>
          </div>

          <div class="shrink-0 flex items-center mt-3 sm:mt-0">
            <span :class="['px-2 py-1 text-xs font-bold rounded-md border', badgeStyle(appt.status)]">
              {{ statusLabel(appt.status) }}
            </span>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Calendar from '~/components/icons/Calendar.vue'
import Clock from '~/components/icons/Clock.vue'
import Grid from '~/components/icons/Grid.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'

const { apiFetch } = useApi()
const { user } = useAuth()

const todayAppointments = ref<any[]>([])
const availableSlotsCount = ref(0)
const loading = ref(true)
const isLoading = ref(true)

const isDoctor = computed(() => {
  const role = user?.value?.role || user?.role
  return role === 'admin_doctor' || role === 'doctor'
})

const todayPersian = computed(() => {
  return new Date().toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const todayDateStr = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

const completedCount = computed(() =>
  todayAppointments.value.filter((a) => a.status === 'completed').length
)

const pendingCount = computed(() =>
  todayAppointments.value.filter((a) => a.status === 'pending').length
)

// Tailwind Badge Styles instead of vuetify colors
function badgeStyle(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200/60',
    rejected: 'bg-slate-100 text-slate-600 border-slate-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200/60',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  }
  return map[status] || 'bg-slate-50 text-slate-600 border-slate-200'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'در انتظار تایید',
    confirmed: 'تایید شده',
    rejected: 'رد شده',
    cancelled: 'لغو شده',
    completed: 'تکمیل شده',
  }
  return map[status] || status
}

async function fetchTodayAppointments() {
  if (!isDoctor.value) return
  loading.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/appointments?date=${todayDateStr.value}`)
    if (res.success) {
      todayAppointments.value = res.data
    }
  } catch {
    // silently fail
  } finally {
    loading.value = false
    isLoading.value = false
  }
}

async function fetchAvailableSlots() {
  if (!isDoctor.value) return
  const doctorId = user?.value?.id || (user as any)?.id
  if (!doctorId) return
  try {
    const res = await apiFetch<any>(`/api/scheduling/slots/${doctorId}?date=${todayDateStr.value}`)
    if (res.success) {
      availableSlotsCount.value = res.data.length
    }
  } catch {
    // silently fail
  }
}

onMounted(() => {
  fetchTodayAppointments()
  fetchAvailableSlots()
  setTimeout(() => { isLoading.value = false }, 500)
})

useSeoMeta({
  title: 'داشبورد | سیستم مدیریت',
  ogTitle: 'صفحه اصلی',
})
</script>