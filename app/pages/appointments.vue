<template>
  <div class="mx-auto max-w-7xl px-4 py-10 md:px-8 min-h-screen bg-slate-50/50">
    <!-- Header & Date Navigation -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">نوبت‌های بیماران</h1>
        <p class="text-sm font-medium text-slate-500 mt-2">مدیریت، تایید و بررسی وضعیت نوبت‌ها</p>
      </div>

      <!-- Modern Date Selector -->
      <div class="flex items-center py-1 px-1 bg-white border border-slate-200/80 rounded-xl gap-2 shadow-sm">
        <button @click="prevDay"
          class="px-2 py-2 rounded-full hover:bg-slate-100 transition-colors group focus:outline-none focus:ring-2 focus:ring-slate-200"
          aria-label="روز قبل">
          <AltArrowLeft
            class="w-5 h-5 text-slate-400 group-hover:text-slate-600 fill-current rotate-180 transition-colors" />
        </button>
        <span class="text-sm font-bold text-slate-700 min-w-[160px] text-center select-none">
          {{ displayDate }}
        </span>
        <button @click="nextDay"
          class="px-2 py-2 rounded-full hover:bg-slate-100 transition-colors group focus:outline-none focus:ring-2 focus:ring-slate-200"
          aria-label="روز بعد">
          <AltArrowLeft class="w-5 h-5 text-slate-400 group-hover:text-slate-600 fill-current transition-colors" />
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24">
        <svg class="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-sm text-slate-500 font-medium">در حال دریافت لیست نوبت‌ها...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!appointments.length" class="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 border border-slate-100">
          <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
            </path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-700">نوبتی برای این تاریخ ثبت نشده است</h3>
        <p class="text-sm text-slate-500 mt-2 max-w-sm">برای مشاهده نوبت‌های بیماران، از طریق تقویم بالا تاریخ دیگری را
          انتخاب کنید.</p>
      </div>

      <!-- List State -->
      <template v-else>
        <!-- List Header -->
        <div class="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 tracking-wide">
            {{ appointments.length }} نوبت ثبت شده
          </span>
        </div>

        <!-- Appointments List -->
        <div class="divide-y divide-slate-100/80">
          <div v-for="appt in appointments" :key="appt.id"
            class="p-5 md:p-6 py-1 flex flex-col md:flex-row md:items-center gap-5 hover:bg-slate-50/60 transition-colors group">

            <!-- Timeline / Time -->
            <div
              class="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center md:border-l border-slate-200/60 md:pl-6 shrink-0 md:w-32 px-2">
              <span class="text-lg font-black text-slate-800 tracking-tight">{{ appt.startTime?.slice(0, 5) }}</span>
              <span class="text-xs font-medium text-slate-400 mt-0.5">تا {{ appt.endTime?.slice(0, 5) }}</span>
            </div>

            <!-- Patient Details -->
            <div class="flex-1 min-w-0 px-2">
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <h3 class="text-base font-bold text-slate-800">{{ appt.patientFirstName }} {{ appt.patientLastName }}
                </h3>
                <span :class="['px-1 py-1 text-[11px] font-bold rounded-lg border', badgeStyle(appt.status)]">
                  {{ statusLabel(appt.status) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm text-slate-500 font-medium">
                <div class="flex items-center gap-1">
                  <span class="text-slate-400 text-xs">کد ملی:</span>
                  <span class="text-slate-700">{{ appt.patientNationalId }}</span>
                </div>
                <span class="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block"></span>
                <div class="flex items-center gap-1">
                  <span class="text-slate-400 text-xs">موبایل:</span>
                  <span class="text-slate-700 dir-ltr">{{ appt.patientPhone }}</span>
                </div>
                <span class="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block"></span>
                <div class="flex items-center gap-1">
                  <span class="text-slate-400 text-xs">تاریخ:</span>
                  <span class="text-slate-700">{{ formatDate(appt.appointmentDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 mt-4 md:mt-0 my-1 shrink-0 w-full md:w-auto justify-end px-2">

              <!-- Pending Actions -->
              <template v-if="appt.status === 'pending'">
                <button @click="updateStatus(appt.id, 'confirmed')"
                  class="px-4 py-2 bg-emerald-100 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs font-bold transition-colors focus:ring-2 focus:ring-emerald-200 focus:outline-none">
                  تایید نوبت
                </button>
                <button @click="updateStatus(appt.id, 'rejected')"
                  class="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-bold transition-colors focus:ring-2 focus:ring-rose-100 focus:outline-none">
                  رد
                </button>
              </template>

              <!-- Confirmed Actions -->
              <template v-else-if="appt.status === 'confirmed'">
                <button @click="updateStatus(appt.id, 'completed')"
                  class="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-xl text-xs font-bold transition-colors focus:ring-2 focus:ring-indigo-200 focus:outline-none">
                  تکمیل شد
                </button>
                <button @click="updateStatus(appt.id, 'cancelled')"
                  class="px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-bold transition-colors focus:ring-2 focus:ring-slate-200 focus:outline-none">
                  لغو نوبت
                </button>
              </template>

            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const appointments = ref<any[]>([])
const loading = ref(false)
const currentDate = ref(new Date())

const displayDate = computed(() => {
  const d = currentDate.value
  return d.toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const dateStr = computed(() => {
  const d = currentDate.value
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

function prevDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() - 1)
  currentDate.value = d
  fetchAppointments()
}

function nextDay() {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + 1)
  currentDate.value = d
  fetchAppointments()
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}

// جایگزین کردن استایل‌های Vuetify با کلاس‌های تیلویند برای Badge ها
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

async function fetchAppointments() {
  loading.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/appointments?date=${dateStr.value}`)
    if (res.success) {
      appointments.value = res.data
    }
  } catch (err) {
    $toast.error('خطا در دریافت نوبت‌ها')
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: string, status: string) {
  try {
    const res = await apiFetch<any>(`/api/scheduling/appointments/${id}/status`, {
      method: 'PUT',
      body: { status },
    })
    if (res.success) {
      $toast.success('وضعیت نوبت به‌روزرسانی شد')
      await fetchAppointments()
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در به‌روزرسانی وضعیت')
  }
}

onMounted(() => {
  fetchAppointments()
})

useSeoMeta({
  title: 'نوبت‌های بیماران | سیستم مدیریت',
})
</script>

<style scoped>
/* کلاسی برای جلوگیری از بهم ریختگی اعداد موبایل به خاطر جهت‌گیری راست‌به‌چپ */
.dir-ltr {
  direction: ltr;
  display: inline-block;
}
</style>