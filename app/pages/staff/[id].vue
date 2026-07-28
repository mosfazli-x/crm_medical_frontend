<template>
  <UiPageContainer>
    <UiPageHeader :title="staff ? `پروفایل ${staff.fullName}` : 'پروفایل کارمند'" subtitle="مشاهده جزئیات و برنامه هفتگی کارمند">
      <template #actions>
        <v-btn variant="tonal" class="crm-btn" @click="$router.back()">
          <v-icon start size="18">mdi-arrow-right</v-icon>
          بازگشت
        </v-btn>
      </template>
    </UiPageHeader>

    <div v-if="loading" class="flex justify-center p-16">
      <v-progress-circular indeterminate size="48" color="#4F46E5" />
    </div>

    <template v-else-if="staff">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <UiContentCard title="اطلاعات شخصی" class="lg:col-span-1">
          <div class="space-y-4">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                <span class="text-indigo-600 dark:text-indigo-400 font-bold text-2xl">{{ (staff.fullName || '').charAt(0) }}</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">{{ staff.fullName }}</h3>
                <span :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold ring-1 ring-inset',
                  staff.isActive !== false
                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    : 'bg-slate-100 text-slate-600 ring-slate-500/20'
                ]">
                  {{ staff.isActive !== false ? 'فعال' : 'غیرفعال' }}
                </span>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span class="text-sm text-slate-500">شماره تلفن</span>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200 font-mono" dir="ltr">{{ staff.phone }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span class="text-sm text-slate-500">سمت شغلی</span>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ staff.position || '---' }}</span>
              </div>
              <div class="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                <span class="text-sm text-slate-500">تاریخ شروع</span>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{{ formatJalaliDate(staff.employmentDate) }}</span>
              </div>
              <div class="flex items-center justify-between py-2">
                <span class="text-sm text-slate-500">توضیحات</span>
                <span class="text-sm font-medium text-slate-800 dark:text-slate-200 text-left max-w-[200px]">{{ staff.notes || '---' }}</span>
              </div>
            </div>
          </div>
        </UiContentCard>

        <UiContentCard title="خلاصه حضور و غیاب" class="lg:col-span-2">
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <div class="text-2xl font-bold text-slate-800 dark:text-slate-200">{{ attendanceStats.total }}</div>
              <div class="text-xs text-slate-500 mt-1">روز کاری</div>
            </div>
            <div class="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-center">
              <div class="text-2xl font-bold text-indigo-600" dir="ltr">{{ formatWorkedHours(attendanceStats.totalWorkedMinutes) }}</div>
              <div class="text-xs text-indigo-600 mt-1">ساعات کاری</div>
            </div>
            <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <div class="text-2xl font-bold text-emerald-600">{{ attendanceStats.present }}</div>
              <div class="text-xs text-emerald-600 mt-1">حاضر</div>
            </div>
            <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
              <div class="text-2xl font-bold text-amber-600">{{ attendanceStats.late }}</div>
              <div class="text-xs text-amber-600 mt-1">تأخیر</div>
            </div>
            <div class="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
              <div class="text-2xl font-bold text-red-500">{{ attendanceStats.absent }}</div>
              <div class="text-xs text-red-500 mt-1">غایب</div>
            </div>
            <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ attendanceStats.leave }}</div>
              <div class="text-xs text-blue-600 mt-1">مرخصی</div>
            </div>
          </div>

          <div class="crm-table-wrap">
            <table class="crm-table">
              <thead>
                <tr>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">تاریخ</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">ساعات کاری</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">وضعیت</th>
                  <th class="px-4 py-3 text-sm font-bold whitespace-nowrap">مدت کار</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="record in attendanceRecords" :key="record.id" class="hover:bg-slate-50/80 transition-colors">
                  <td class="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{{ formatJalaliDate(record.date) }}</td>
                  <td class="px-4 py-3 text-sm whitespace-nowrap">
                    <div v-if="record.sessions?.length" class="flex flex-col gap-1">
                      <span v-for="(s, i) in record.sessions" :key="i" class="font-mono text-xs text-slate-600" dir="ltr">
                        {{ formatSessionTime(s.checkInTime) }} - {{ formatSessionTime(s.checkOutTime) || '...' }}
                      </span>
                    </div>
                    <span v-else class="text-xs text-slate-400">---</span>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="['px-2 py-0.5 rounded-full text-xs font-semibold', statusStyle(record.status)]">
                      {{ statusLabel(record.status) }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm font-mono text-indigo-600 font-semibold" dir="ltr">{{ formatWorkedHours(record.workedMinutes) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="attendanceRecords.length === 0" class="text-center py-8 text-sm text-slate-400">
              رکورد حضور و غیابی یافت نشد
            </div>
          </div>
        </UiContentCard>
      </div>

      <UiContentCard title="برنامه هفتگی">
        <div class="grid grid-cols-7 gap-2">
          <div v-for="(day, idx) in weekDays" :key="idx" class="text-center">
            <div class="text-xs font-semibold text-slate-500 mb-2">{{ day }}</div>
            <div
              v-if="getScheduleForDay(idx)"
              class="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800"
            >
              <div class="text-xs font-bold text-indigo-700 dark:text-indigo-300">{{ getScheduleForDay(idx)?.startTime }}</div>
              <div class="text-[10px] text-indigo-400 my-1">تا</div>
              <div class="text-xs font-bold text-indigo-700 dark:text-indigo-300">{{ getScheduleForDay(idx)?.endTime }}</div>
            </div>
            <div v-else class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div class="text-xs text-slate-400">تعطیل</div>
            </div>
          </div>
        </div>
      </UiContentCard>
    </template>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const route = useRoute()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { formatJalaliDate } = useFormatting()

const staff = ref<any>(null)
const attendanceRecords = ref<any[]>([])
const schedules = ref<any[]>([])
const loading = ref(true)

const weekDays = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']

const attendanceStats = computed(() => {
  const total = attendanceRecords.value.length
  const present = attendanceRecords.value.filter(r => r.status === 'present').length
  const late = attendanceRecords.value.filter(r => r.status === 'late').length
  const absent = attendanceRecords.value.filter(r => r.status === 'absent').length
  const leave = attendanceRecords.value.filter(r => r.status === 'leave').length
  const totalWorkedMinutes = attendanceRecords.value.reduce((sum: number, r: any) => sum + (r.workedMinutes || 0), 0)
  return { total, present, late, absent, leave, totalWorkedMinutes }
})

const formatWorkedHours = (minutes: number | null | undefined) => {
  if (minutes == null) return '--'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

const formatSessionTime = (ts: string | null) => {
  if (!ts) return '--:--'
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

const getScheduleForDay = (dayOfWeek: number) => {
  return schedules.value.find(s => s.dayOfWeek === dayOfWeek)
}

const statusLabel = (status: string) => {
  const map: Record<string, string> = { present: 'حاضر', absent: 'غایب', late: 'تأخیر', leave: 'مرخصی', holiday: 'تعطیل' }
  return map[status] || status
}

const statusStyle = (status: string) => {
  const map: Record<string, string> = {
    present: 'bg-emerald-50 text-emerald-700',
    absent: 'bg-red-50 text-red-600',
    late: 'bg-amber-50 text-amber-700',
    leave: 'bg-blue-50 text-blue-600',
    holiday: 'bg-purple-50 text-purple-600',
  }
  return map[status] || 'bg-slate-50 text-slate-600'
}

const fetchData = async () => {
  const id = route.params.id as string
  try {
    const [staffRes, attendanceRes, scheduleRes] = await Promise.all([
      apiFetch<any>(`/api/staff/${id}`),
      apiFetch<any>(`/api/staff/attendance/report?staffId=${id}&startDate=1300-01-01&endDate=1500-12-29`),
      apiFetch<any>(`/api/staff/schedules/${id}`),
    ])
    if (staffRes.success) staff.value = staffRes.data
    if (attendanceRes.success) attendanceRecords.value = attendanceRes.data.records || []
    if (scheduleRes.success) schedules.value = scheduleRes.data || []
  } catch {
    $toast.error('خطا در دریافت اطلاعات')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
useSeoMeta({ title: () => `پروفایل ${staff.value?.fullName || 'کارمند'} | سیستم یکپارچه` })
</script>
