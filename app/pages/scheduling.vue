<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:px-8 min-h-screen">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">تنظیم زمانبندی رزروها</h1>
      <div class="flex items-center gap-3">
        <a :href="`/booking/${user?.id}`" target="_blank"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-600! border border-slate-200 hover:border-white/60 hover:bg-light-cyan/80! dark:text-white! dark:hover:bg-slate-500! rounded-xl text-sm font-bold text-electric-sapphire transition-all duration-200 shadow-sm">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span>مشاهده صفحه رزرو</span>
        </a>
        <div class="text-sm text-slate-500 dark:text-slate-300 hidden sm:block">ساعات کاری: ۰۷:۰۰ تا ۲۲:۰۰</div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-4 md:p-6">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse select-none" style="min-width: 850px;">
          <thead>
            <tr>
              <th class="p-2 text-sm font-bold text-slate-500 border-b-2 border-slate-200 sticky right-0 bg-white min-w-[70px]">
                ساعت
              </th>
              <th v-for="day in dayHeaders" :key="day.dayOfWeek"
                class="p-2 text-sm font-bold text-slate-600 border-b-2 border-slate-200 text-center min-w-[110px] py-1">
                <div class="flex items-center justify-center gap-1">
                  <span>{{ day.name }}</span>
                  <button @click="openAddRange(day.dayOfWeek)"
                    class="w-5 h-5 rounded-full bg-periwinkle hover:bg-baby-blue-ice text-electric-sapphire flex items-center justify-center text-xs font-bold transition-colors">
                    +
                  </button>
                </div>
                <div class="text-[10px] text-slate-400 font-normal leading-tight">
                  {{ jalaliDates[day.dayOfWeek] }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="time in timeSlots" :key="time"
              class="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td class="p-1 text-xs text-slate-400 font-medium text-center sticky right-0 bg-white">
                {{ time }}
              </td>
              <td v-for="day in dayHeaders" :key="day.dayOfWeek"
                class="p-0 relative cursor-pointer"
                :class="getCellClasses(day.dayOfWeek, time)"
                @click="onCellClick(day.dayOfWeek, time)">
                <div class="w-full h-7"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center gap-4 text-xs text-slate-400 py-2 px-2">
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded bg-periwinkle border border-periwinkle"></div>
          <span>بازه فعال</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded bg-yellow-200 border border-yellow-300"></div>
          <span>در حال انتخاب</span>
        </div>
        <div class="flex items-center gap-1">
          <span>روی دو نقطه در یک روز کلیک کنید تا بازه زمانی ایجاد شود</span>
        </div>
      </div>
    </div>

    <v-dialog v-model="addDialog" persistent max-width="450px">
      <v-card class="rounded-2xl">
        <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6">
          افزودن بازه زمانی جدید
        </v-card-title>
        <v-card-text class="px-6 pb-2">
          <div class="text-sm text-slate-500 mb-4">روز: <span class="font-bold text-slate-700">{{ selectedDayName }}</span></div>
          <v-row>
            <v-col cols="6">
              <label class="text-sm font-semibold text-slate-700 mb-2 block">زمان شروع</label>
              <v-select v-model="newRangeStart" :items="timeSlots" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" />
            </v-col>
            <v-col cols="6">
              <label class="text-sm font-semibold text-slate-700 mb-2 block">زمان پایان</label>
              <v-select v-model="newRangeEnd" :items="timeSlotsEnd" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-2 flex gap-3">
          <v-btn variant="text" color="slate-600" @click="closeAddDialog">انصراف</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="#5465ff" :loading="saving" @click="submitNewRange">ذخیره</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { apiFetch } = useApi()
const { user } = useAuth()
const { $toast } = useNuxtApp()

const dayHeaders = [
  { name: 'شنبه', dayOfWeek: 6 },
  { name: 'یکشنبه', dayOfWeek: 0 },
  { name: 'دوشنبه', dayOfWeek: 1 },
  { name: 'سه‌شنبه', dayOfWeek: 2 },
  { name: 'چهارشنبه', dayOfWeek: 3 },
  { name: 'پنج‌شنبه', dayOfWeek: 4 },
  { name: 'جمعه', dayOfWeek: 5 },
]

const jalaliDates = computed(() => {
  const today = new Date()
  const todayDay = today.getDay()
  const daysSinceSaturday = (todayDay + 1) % 7
  const saturday = new Date(today)
  saturday.setDate(today.getDate() - daysSinceSaturday)
  const result: Record<number, string> = {}
  dayHeaders.forEach((day, index) => {
    const d = new Date(saturday)
    d.setDate(saturday.getDate() + index)
    result[day.dayOfWeek] = d.toLocaleDateString('fa-IR', { day: 'numeric', month: 'long' })
  })
  return result
})

const timeSlots = computed(() => {
  const slots: string[] = []
  for (let h = 7; h < 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})

const timeSlotsEnd = computed(() => {
  const slots: string[] = []
  for (let h = 7; h <= 22; h++) {
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
})

interface Availability {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface Range {
  startTime: string
  endTime: string
}

const availability = ref<Availability[]>([])
const loading = ref(false)
const saving = ref(false)

const addDialog = ref(false)
const selectedDayForAdd = ref<number>(0)
const newRangeStart = ref<string | null>(null)
const newRangeEnd = ref<string | null>(null)

const selectedDayName = computed(() => {
  const day = dayHeaders.find(d => d.dayOfWeek === selectedDayForAdd.value)
  return day?.name || ''
})

const rangeStart = ref<{ day: number; time: string } | null>(null)

function openAddRange(dayOfWeek: number) {
  selectedDayForAdd.value = dayOfWeek
  newRangeStart.value = null
  newRangeEnd.value = null
  addDialog.value = true
}

function closeAddDialog() {
  addDialog.value = false
  newRangeStart.value = null
  newRangeEnd.value = null
}

async function submitNewRange() {
  if (!newRangeStart.value || !newRangeEnd.value) {
    $toast.error('لطفاً زمان شروع و پایان را انتخاب کنید')
    return
  }
  if (newRangeStart.value >= newRangeEnd.value) {
    $toast.error('زمان شروع باید قبل از زمان پایان باشد')
    return
  }
  saving.value = true
  try {
    await apiFetch('/api/scheduling/availability', {
      method: 'POST',
      body: {
        dayOfWeek: selectedDayForAdd.value,
        startTime: newRangeStart.value,
        endTime: newRangeEnd.value,
      },
    })
    $toast.success('بازه زمانی با موفقیت اضافه شد')
    closeAddDialog()
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ذخیره بازه زمانی')
  } finally {
    saving.value = false
  }
}

function getCellClasses(dayOfWeek: number, time: string) {
  const inRange = isInRange(dayOfWeek, time)
  const isRangeStart = rangeStart.value?.day === dayOfWeek && rangeStart.value?.time === time
  const isSelected = rangeStart.value?.day === dayOfWeek

  if (inRange) return 'bg-periwinkle hover:bg-baby-blue-ice border border-periwinkle/50'
  if (isSelected && !inRange) return 'bg-yellow-100 hover:bg-yellow-200 border border-yellow-200/50'
  return 'hover:bg-slate-100 border border-transparent'
}

function isInRange(dayOfWeek: number, time: string): boolean {
  return availability.value.some(a => {
    if (a.dayOfWeek !== dayOfWeek) return false
    const startMinutes = timeToMinutes(a.startTime)
    const endMinutes = timeToMinutes(a.endTime)
    const currentMinutes = timeToMinutes(time)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  })
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function findAvailabilityAt(dayOfWeek: number, time: string): Availability | null {
  const currentMinutes = timeToMinutes(time)
  return availability.value.find(a => {
    if (a.dayOfWeek !== dayOfWeek) return false
    const startMinutes = timeToMinutes(a.startTime)
    const endMinutes = timeToMinutes(a.endTime)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes
  }) || null
}

async function onCellClick(dayOfWeek: number, time: string) {
  const existingBlock = findAvailabilityAt(dayOfWeek, time)

  if (existingBlock) {
    try {
      await apiFetch(`/api/scheduling/availability/${existingBlock.id}`, { method: 'DELETE' })
      $toast.success('بازه زمانی حذف شد')
      await fetchAvailability()
    } catch (err: any) {
      $toast.error(err.data?.error || 'خطا در حذف بازه زمانی')
    }
    return
  }

  if (!rangeStart.value) {
    rangeStart.value = { day: dayOfWeek, time }
    return
  }

  if (rangeStart.value.day !== dayOfWeek) {
    rangeStart.value = { day: dayOfWeek, time }
    return
  }

  if (rangeStart.value.time === time) {
    rangeStart.value = null
    return
  }

  const startTime = rangeStart.value.time < time ? rangeStart.value.time : time
  const endTime = rangeStart.value.time < time ? time : rangeStart.value.time

  rangeStart.value = null

  saving.value = true
  try {
    await apiFetch('/api/scheduling/availability', {
      method: 'POST',
      body: { dayOfWeek, startTime, endTime },
    })
    $toast.success('بازه زمانی با موفقیت اضافه شد')
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ذخیره بازه زمانی')
  } finally {
    saving.value = false
  }
}

async function fetchAvailability() {
  const doctorId = user.value?.id
  if (!doctorId) return
  loading.value = true
  try {
    const res = await apiFetch<any>(`/api/scheduling/availability/${doctorId}`)
    if (res.success) {
      availability.value = res.data
    }
  } catch (err) {
    // silently fail
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAvailability()
})

useSeoMeta({
  title: 'تنظیم زمانبندی رزروها | سیستم مدیریت',
})
</script>
