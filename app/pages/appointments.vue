<template>
  <div class="mx-auto max-w-7xl px-4 py-10 md:px-8 min-h-screen">
    <!-- Header & Date Navigation -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">نوبت‌های بیماران</h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">مدیریت، تایید و بررسی وضعیت نوبت‌ها</p>
      </div>

      <!-- Modern Date Selector -->
      <div class="flex items-center py-1 px-1 bg-white dark:bg-slate-800! border border-slate-200/80 dark:border-slate-700! rounded-xl gap-2 shadow-sm">
        <button @click="prevDay"
          class="px-2 py-2 rounded-full hover:bg-slate-100! dark:hover:bg-slate-700! transition-colors group focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600"
          aria-label="روز قبل">
          <AltArrowLeft
            class="w-5 h-5 text-slate-300 dark:text-slate-400! dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 fill-current rotate-180 transition-colors" />
        </button>
        <span class="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[160px] text-center select-none">
          {{ displayDate }}
        </span>
        <button @click="nextDay"
          class="px-2 py-2 rounded-full hover:bg-slate-100! dark:hover:bg-slate-700! transition-colors group focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600"
          aria-label="روز بعد">
          <AltArrowLeft class="w-5 h-5 text-slate-300 dark:text-slate-400! group-hover:text-slate-600 dark:group-hover:text-slate-400 fill-current transition-colors" />
        </button>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="bg-white dark:bg-blue-grey! rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-600! overflow-hidden">

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-12!">
        <svg class="animate-spin h-8 w-8 text-electric-sapphire mb-4" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-sm text-slate-500 dark:text-slate-400 font-medium">در حال دریافت لیست نوبت‌ها...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!appointments.length" class="flex flex-col items-center justify-center py-24 px-4 text-center my-3">
        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
          <svg class="w-8 h-8 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01">
            </path>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">نوبتی برای این تاریخ ثبت نشده است</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">برای مشاهده نوبت‌های بیماران، از طریق تقویم بالا تاریخ دیگری را
          انتخاب کنید.</p>
      </div>

      <!-- List State -->
      <template v-else>
        <!-- List Header -->
        <div class="px-6 py-4 bg-slate-50/50 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-300 tracking-wide">
            {{ appointments.length }} نوبت ثبت شده
          </span>
        </div>

        <!-- Appointments List -->
        <div class="divide-y divide-slate-100/80 dark:divide-slate-700">
          <div v-for="appt in appointments" :key="appt.id"
            class="p-5 md:p-6 py-1 flex flex-col md:flex-row md:items-center gap-5 hover:bg-slate-50/60 dark:bg-slate-600 dark:hover:bg-slate-700 transition-colors group">

            <!-- Timeline / Time -->
            <div
              class="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center md:border-l border-slate-200/60 dark:border-slate-700 md:pl-6 shrink-0 md:w-32 px-2">
              <span class="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">{{ appt.startTime?.slice(0, 5) }}</span>
              <span class="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">تا {{ appt.endTime?.slice(0, 5) }}</span>
            </div>

            <!-- Patient Details -->
            <div class="flex-1 min-w-0 px-2">
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">{{ appt.patientFirstName }} {{ appt.patientLastName }}
                </h3>
                <span :class="['px-1 py-1 text-[11px] font-bold rounded-lg border', badgeStyle(appt.status)]">
                  {{ statusLabel(appt.status) }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                <div v-if="appt.visitTypeName" class="flex items-center gap-1.5">
                  <div class="w-2.5 h-2.5 rounded-full shrink-0"
                    :style="{ backgroundColor: appt.visitTypeColor || '#3B82F6' }"></div>
                  <span class="text-slate-700 dark:text-slate-300 font-medium">{{ appt.visitTypeName }}</span>
                </div>
                <span v-if="appt.visitTypeName" class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline-block"></span>
                <div class="flex items-center gap-1">
                  <span class="text-slate-400 dark:text-slate-500 text-xs">کد ملی:</span>
                  <span class="text-slate-700 dark:text-slate-300">{{ appt.patientNationalId }}</span>
                </div>
                <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline-block"></span>
                <div class="flex items-center gap-1">
                  <span class="text-slate-400 dark:text-slate-500 text-xs">موبایل:</span>
                  <span class="text-slate-700 dark:text-slate-300 dir-ltr">{{ appt.patientPhone }}</span>
                </div>
                <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline-block"></span>
                <div class="flex items-center gap-1">
                  <span class="text-slate-400 dark:text-slate-500 text-xs">تاریخ:</span>
                  <span class="text-slate-700 dark:text-slate-300">{{ formatDate(appt.appointmentDate) }}</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 mt-4 md:mt-0 my-1 shrink-0 w-full md:w-auto justify-end px-2">

              <!-- Pending Actions -->
              <template v-if="appt.status === 'pending'">
                <button @click="updateStatus(appt.id, 'confirmed')"
                  class="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/40 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-lg text-xs font-bold transition-colors focus:ring-2 focus:ring-emerald-200 focus:outline-none">
                  تایید نوبت
                </button>
                <button @click="updateStatus(appt.id, 'rejected')"
                  class="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-rose-50 text-rose-600 border border-slate-200 dark:border-slate-600 hover:border-rose-200 rounded-lg text-xs font-bold transition-colors focus:ring-2 focus:ring-rose-100 focus:outline-none">
                  رد
                </button>
              </template>

              <!-- Confirmed Actions -->
              <template v-else-if="appt.status === 'confirmed'">
                <button @click="updateStatus(appt.id, 'completed')"
                  class="px-4 py-2 bg-light-cyan! hover:bg-periwinkle text-electric-sapphire border border-periwinkle/60 rounded-xl text-xs font-bold transition-colors focus:ring-2 focus:ring-periwinkle focus:outline-none">
                  تکمیل شد
                </button>
                <button @click="updateStatus(appt.id, 'cancelled')"
                  class="px-4 py-2 bg-white! dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold transition-colors focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 focus:outline-none">
                  لغو نوبت
                </button>
              </template>

              <button @click.stop="openSmsModal(appt)"
                class="px-3 py-2 bg-white! dark:bg-slate-800 hover:bg-light-cyan text-electric-sapphire border border-periwinkle/60 rounded-xl text-xs font-bold transition-colors focus:ring-2 focus:ring-periwinkle focus:outline-none shrink-0 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                ارسال پیامک
              </button>

            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <!-- Send SMS Dialog -->
  <v-dialog v-model="smsDialog" max-width="500" class="backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6!">
      <div class="flex justify-between items-center mb-5 px-2">
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">ارسال پیامک به بیمار</h3>
        <v-btn icon variant="text" size="small" @click="smsDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div v-if="selectedSmsAppointment" class="mb-5 bg-light-cyan/40 dark:bg-electric-sapphire/20 py-3 px-4 rounded-xl border border-periwinkle/50">
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">گیرنده:</p>
        <p class="font-bold text-electric-sapphire text-sm">{{ selectedSmsAppointment.patientFirstName }} {{ selectedSmsAppointment.patientLastName }}</p>
        <div class="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span dir="ltr" class="font-mono">{{ selectedSmsAppointment.patientPhone }}</span>
          <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
          <span>{{ formatDate(selectedSmsAppointment.appointmentDate) }} — {{ selectedSmsAppointment.startTime?.slice(0, 5) }}</span>
        </div>
      </div>

      <div class="space-y-2 px-1">
        <label class="text-sm font-bold text-slate-700 dark:text-slate-300 px-1 py-1">متن پیام</label>
        <textarea v-model="smsText" rows="4"
          class="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-periwinkle focus:border-periwinkle/60 transition-all resize-none"
          placeholder="متن پیامک خود را اینجا بنویسید..."></textarea>
        <div class="flex justify-between items-center px-1">
          <span class="text-xs text-slate-400 dark:text-slate-500">{{ smsText.length }}/500</span>
          <span v-if="smsText.length > 500" class="text-xs text-red-500 font-bold">متن پیامک نباید بیشتر از 500 کاراکتر باشد</span>
        </div>
      </div>

      <div class="mt-6 mb-1 flex justify-end gap-3 px-1">
        <v-btn variant="tonal" color="red" prepend-icon="mdi-close" class="rounded-xl" @click="smsDialog = false">
          انصراف
        </v-btn>
        <v-btn variant="tonal" color="green" prepend-icon="mdi-send-variant" class="rounded-xl" :loading="sendingSms" :disabled="!smsText.trim() || smsText.length > 500" @click="sendSms">
          ارسال پیامک
        </v-btn>
      </div>
    </div>
  </v-dialog>
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
    pending: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-700/50',
    confirmed: 'bg-light-cyan dark:bg-electric-sapphire/20 text-electric-sapphire dark:text-cornflower-blue border-periwinkle/60 dark:border-electric-sapphire/50',
    rejected: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600',
    cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200/60 dark:border-red-700/50',
    completed: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-700/50',
  }
  return map[status] || 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600'
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

const smsDialog = ref(false)
const selectedSmsAppointment = ref<any>(null)
const smsText = ref('')
const sendingSms = ref(false)

function openSmsModal(appt: any) {
  selectedSmsAppointment.value = appt
  smsText.value = ''
  smsDialog.value = true
}

async function sendSms() {
  if (!smsText.value.trim()) {
    $toast.error('لطفاً متن پیامک را وارد کنید')
    return
  }
  if (smsText.value.length > 500) {
    $toast.error('متن پیامک نباید بیشتر از 500 کاراکتر باشد')
    return
  }
  const appt = selectedSmsAppointment.value
  if (!appt) return

  sendingSms.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/appointments/${appt.id}/send-sms`, {
      method: 'POST',
      body: { text: smsText.value },
    })
    if (res.success) {
      $toast.success('پیامک با موفقیت ارسال شد')
      smsDialog.value = false
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارسال پیامک')
  } finally {
    sendingSms.value = false
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