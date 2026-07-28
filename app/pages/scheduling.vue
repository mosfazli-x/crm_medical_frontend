<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('scheduling.title')">
      <template #actions>
        <div class="flex items-center gap-3 flex-wrap justify-end">
          <a :href="`/booking/${user?.id}`" target="_blank" class="crm-btn crm-btn-primary">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {{ $t('scheduling.viewBookingPage') }}
          </a>
          <span class="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline">{{ $t('scheduling.workingHours') }}</span>
        </div>
      </template>
    </UiPageHeader>

    <UiContentCard card-class="p-1 md:p-2!">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse select-none" style="min-width: 850px;">
          <thead>
            <tr>
              <th class="p-2 text-sm font-bold text-slate-500 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 sticky right-0 min-w-[70px]">
                {{ $t('scheduling.hour') }}
              </th>
              <th v-for="day in dayHeaders" :key="day.dayOfWeek"
                class="p-2 text-sm font-bold text-slate-600 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700 text-center min-w-[110px] py-1">
                <div class="flex items-center justify-center gap-1">
                  <span>{{ day.name }}</span>
                  <button @click="openAddRange(day.dayOfWeek)"
                    class="w-5 h-5 rounded-full bg-periwinkle dark:bg-indigo-600/20 hover:bg-baby-blue-ice dark:hover:bg-indigo-500/40 text-electric-sapphire dark:text-indigo-400 flex items-center justify-center text-xs font-bold transition-colors">
                    +
                  </button>
                </div>
                <div class="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">
                  {{ jalaliDates[day.dayOfWeek] }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="time in timeSlots" :key="time"
              class="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="p-1 text-xs text-slate-600 dark:text-slate-300 font-medium text-center sticky right-0 dark:bg-slate-900">
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

      <div class="mt-4 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 py-2 px-2">
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded bg-periwinkle dark:bg-indigo-600/30 border border-periwinkle/50 dark:border-indigo-500/40"></div>
          <span>{{ $t('scheduling.activeRange') }}</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-700/40"></div>
          <span>{{ $t('scheduling.selecting') }}</span>
        </div>
        <div class="flex items-center gap-1">
          <span>{{ $t('scheduling.clickInstruction') }}</span>
        </div>
      </div>
    </UiContentCard>

    <v-dialog v-model="addDialog" persistent max-width="450px">
      <v-card class="rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
        <v-card-title class="text-lg font-bold text-slate-800 dark:text-slate-100 px-6 pt-6">
          {{ $t('scheduling.addNewRange') }}
        </v-card-title>
        <v-card-text class="px-6 pb-2">
          <div class="text-sm text-slate-500 dark:text-slate-400 mb-4">{{ $t('scheduling.day') }} <span class="font-bold text-slate-700 dark:text-slate-200">{{ selectedDayName }}</span></div>
          <v-row>
            <v-col cols="6">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">{{ $t('scheduling.startTime') }}</label>
              <v-select v-model="newRangeStart" :items="timeSlots" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
            <v-col cols="6">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">{{ $t('scheduling.endTime') }}</label>
              <v-select v-model="newRangeEnd" :items="timeSlotsEnd" variant="outlined" density="comfortable" hide-details="auto" />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-2 flex gap-3 bg-white dark:bg-slate-800">
          <v-btn variant="text" color="slate-600" class="dark:text-slate-400" @click="closeAddDialog">{{ $t('common.cancel') }}</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="#4F46E5" :loading="saving" @click="submitNewRange">{{ $t('common.save') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { t } = useI18n()
const { apiFetch } = useApi()
const { user } = useAuth()
const { $toast } = useNuxtApp()

const dayHeaders = computed(() => [
  { name: t('scheduling.days.saturday'), dayOfWeek: 6 },
  { name: t('scheduling.days.sunday'), dayOfWeek: 0 },
  { name: t('scheduling.days.monday'), dayOfWeek: 1 },
  { name: t('scheduling.days.tuesday'), dayOfWeek: 2 },
  { name: t('scheduling.days.wednesday'), dayOfWeek: 3 },
  { name: t('scheduling.days.thursday'), dayOfWeek: 4 },
  { name: t('scheduling.days.friday'), dayOfWeek: 5 },
])

const jalaliDates = computed(() => {
  const today = new Date()
  const todayDay = today.getDay()
  const daysSinceSaturday = (todayDay + 1) % 7
  const saturday = new Date(today)
  saturday.setDate(today.getDate() - daysSinceSaturday)
  const result: Record<number, string> = {}
  dayHeaders.value.forEach((day, index) => {
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

const availability = ref<Availability[]>([])
const loading = ref(false)
const saving = ref(false)

const addDialog = ref(false)
const selectedDayForAdd = ref<number>(0)
const newRangeStart = ref<string | null>(null)
const newRangeEnd = ref<string | null>(null)

const selectedDayName = computed(() => {
  const day = dayHeaders.value.find(d => d.dayOfWeek === selectedDayForAdd.value)
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
    $toast.error(t('scheduling.selectTimeError'))
    return
  }
  if (newRangeStart.value >= newRangeEnd.value) {
    $toast.error(t('scheduling.timeOrderError'))
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
    $toast.success(t('scheduling.rangeAdded'))
    closeAddDialog()
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || t('scheduling.rangeSaveError'))
  } finally {
    saving.value = false
  }
}

function getCellClasses(dayOfWeek: number, time: string) {
  const inRange = isInRange(dayOfWeek, time)
  const isRangeStart = rangeStart.value?.day === dayOfWeek && rangeStart.value?.time === time
  const isSelected = rangeStart.value?.day === dayOfWeek

  if (inRange) {
    return 'bg-periwinkle dark:bg-indigo-600/30 hover:bg-baby-blue-ice dark:hover:bg-indigo-500/40 border border-periwinkle/50 dark:border-indigo-500/30'
  }
  if (isSelected && !inRange) {
    return 'bg-yellow-100 dark:bg-yellow-950/40 hover:bg-yellow-200 dark:hover:bg-yellow-900/40 border border-yellow-200/50 dark:border-yellow-700/30'
  }
  return 'hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
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
      $toast.success(t('scheduling.rangeDeleted'))
      await fetchAvailability()
    } catch (err: any) {
      $toast.error(err.data?.error || t('scheduling.rangeDeleteError'))
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
    $toast.success(t('scheduling.rangeAdded'))
    await fetchAvailability()
  } catch (err: any) {
    $toast.error(err.data?.error || t('scheduling.rangeSaveError'))
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
  title: t('scheduling.titleSeo'),
})
</script>