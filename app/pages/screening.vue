<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:px-8 min-h-screen space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">غربالگری و مراقبت پیشگیرانه</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">مدیریت برنامه‌های غربالگری و نتایج آزمایشات</p>
      </div>
      <div class="flex items-center gap-3">
        <v-btn variant="flat" color="black" prepend-icon="mdi-plus" class="rounded-lg font-medium" @click="openAddSchedule">
          غربالگری جدید
        </v-btn>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-light-cyan text-electric-sapphire flex items-center justify-center shrink-0">
          <v-icon size="28">mdi-clipboard-list-outline</v-icon>
        </div>
        <div>
          <p class="text-2xl font-extrabold text-slate-800">{{ stats.total }}</p>
          <p class="text-sm text-slate-500 font-medium">کل برنامه‌ها</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <v-icon size="28">mdi-alert-circle-outline</v-icon>
        </div>
        <div>
          <p class="text-2xl font-extrabold text-slate-800">{{ stats.overdue }}</p>
          <p class="text-sm text-slate-500 font-medium">معوق</p>
        </div>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <v-icon size="28">mdi-check-circle-outline</v-icon>
        </div>
        <div>
          <p class="text-2xl font-extrabold text-slate-800">{{ stats.completedThisMonth }}</p>
          <p class="text-sm text-slate-500 font-medium">تکمیل شده (این ماه)</p>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Tabs & Search -->
      <div class="border-b border-slate-200">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between px-6">
          <v-tabs v-model="activeTab" color="black" bg-color="transparent" slider-color="black" height="56" class="pointer-events-auto">
            <v-tab value="all" class="text-sm font-medium tracking-wide">همه برنامه‌ها</v-tab>
            <v-tab value="overdue" class="text-sm font-medium tracking-wide">معوق</v-tab>
            <v-tab value="upcoming" class="text-sm font-medium tracking-wide">پیش‌رو (۳۰ روز)</v-tab>
            <v-tab value="results" class="text-sm font-medium tracking-wide">نتایج</v-tab>
          </v-tabs>
          <div class="pb-3 sm:pb-0 sm:pt-0">
            <v-text-field v-if="activeTab !== 'results'" v-model="searchQuery" prepend-inner-icon="mdi-magnify" placeholder="جستجو..." variant="outlined" density="compact" hide-details class="max-w-[240px]" bg-color="white" single-line clearable @click:clear="searchQuery = ''" />
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div>
        <!-- Loading -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24">
          <svg class="animate-spin h-8 w-8 text-electric-sapphire mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span class="text-sm text-slate-500 font-medium">در حال دریافت اطلاعات...</span>
        </div>

        <!-- All Schedules Tab -->
        <template v-else-if="activeTab === 'all'">
          <div class="overflow-x-auto">
            <table class="min-w-full text-right border-collapse">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">بیمار</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">نوع غربالگری</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">تاریخ سررسید</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">سطح خطر</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">وضعیت</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="filteredSchedules.length === 0">
                  <td colspan="6" class="py-16 text-center">
                    <div class="flex flex-col items-center justify-center space-y-3">
                      <div class="bg-slate-50 p-4 rounded-full">
                        <v-icon icon="mdi-clipboard-text-off-outline" size="48" color="slate-400" />
                      </div>
                      <p class="text-slate-500 font-medium text-lg">برنامه غربالگری ثبت نشده است.</p>
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="schedule in filteredSchedules" :key="schedule.id" class="hover:bg-slate-50/80 transition-colors group">
                  <td class="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{{ schedule.patient_name || schedule.patientFirstName + ' ' + schedule.patientLastName || '---' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{{ screeningTypeLabel(schedule.screening_type || schedule.screeningType) }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{{ formatJalaliDate(schedule.due_date || schedule.dueDate) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="riskBadge(schedule.risk_level || schedule.riskLevel)">{{ riskLabel(schedule.risk_level || schedule.riskLevel) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="statusBadge(schedule.status)">{{ statusLabel(schedule.status) }}</span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <v-tooltip text="حذف برنامه" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" icon variant="text" size="small" class="text-red-500 hover:bg-red-50" @click="confirmDelete(schedule)">
                            <v-icon size="20">mdi-delete-outline</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- Overdue Tab -->
        <template v-else-if="activeTab === 'overdue'">
          <div class="overflow-x-auto">
            <table class="min-w-full text-right border-collapse">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">بیمار</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">نوع غربالگری</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">تاریخ سررسید</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">سطح خطر</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">وضعیت</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="overdueSchedules.length === 0">
                  <td colspan="6" class="py-16 text-center">
                    <div class="flex flex-col items-center justify-center space-y-3">
                      <div class="bg-slate-50 p-4 rounded-full">
                        <v-icon icon="mdi-check-circle-outline" size="48" color="slate-400" />
                      </div>
                      <p class="text-slate-500 font-medium text-lg">برنامه معوقی وجود ندارد.</p>
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="schedule in overdueSchedules" :key="schedule.id" class="hover:bg-slate-50/80 transition-colors group">
                  <td class="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{{ schedule.patient_name || schedule.patientFirstName + ' ' + schedule.patientLastName || '---' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{{ screeningTypeLabel(schedule.screening_type || schedule.screeningType) }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{{ formatJalaliDate(schedule.due_date || schedule.dueDate) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="riskBadge(schedule.risk_level || schedule.riskLevel)">{{ riskLabel(schedule.risk_level || schedule.riskLevel) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="statusBadge(schedule.status)">{{ statusLabel(schedule.status) }}</span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <v-tooltip text="حذف برنامه" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" icon variant="text" size="small" class="text-red-500 hover:bg-red-50" @click="confirmDelete(schedule)">
                            <v-icon size="20">mdi-delete-outline</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- Upcoming Tab -->
        <template v-else-if="activeTab === 'upcoming'">
          <div class="overflow-x-auto">
            <table class="min-w-full text-right border-collapse">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">بیمار</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">نوع غربالگری</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">تاریخ سررسید</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">سطح خطر</th>
                  <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">وضعیت</th>
                  <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">عملیات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="upcomingSchedules.length === 0">
                  <td colspan="6" class="py-16 text-center">
                    <div class="flex flex-col items-center justify-center space-y-3">
                      <div class="bg-slate-50 p-4 rounded-full">
                        <v-icon icon="mdi-calendar-check-outline" size="48" color="slate-400" />
                      </div>
                      <p class="text-slate-500 font-medium text-lg">برنامه پیش‌رویی در ۳۰ روز آینده وجود ندارد.</p>
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="schedule in upcomingSchedules" :key="schedule.id" class="hover:bg-slate-50/80 transition-colors group">
                  <td class="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{{ schedule.patient_name || schedule.patientFirstName + ' ' + schedule.patientLastName || '---' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{{ screeningTypeLabel(schedule.screening_type || schedule.screeningType) }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{{ formatJalaliDate(schedule.due_date || schedule.dueDate) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="riskBadge(schedule.risk_level || schedule.riskLevel)">{{ riskLabel(schedule.risk_level || schedule.riskLevel) }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="statusBadge(schedule.status)">{{ statusLabel(schedule.status) }}</span>
                  </td>
                  <td class="px-6 py-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <v-tooltip text="حذف برنامه" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" icon variant="text" size="small" class="text-red-500 hover:bg-red-50" @click="confirmDelete(schedule)">
                            <v-icon size="20">mdi-delete-outline</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>

        <!-- Results Tab -->
        <template v-else-if="activeTab === 'results'">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm font-bold text-slate-500">{{ results.length }} نتیجه ثبت شده</span>
              <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="openAddResult">
                ثبت نتیجه جدید
              </v-btn>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-right border-collapse">
                <thead class="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">بیمار</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">نوع غربالگری</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">نتیجه</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">تاریخ</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">وضعیت</th>
                    <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">یادداشت</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="results.length === 0">
                    <td colspan="6" class="py-16 text-center">
                      <div class="flex flex-col items-center justify-center space-y-3">
                        <div class="bg-slate-50 p-4 rounded-full">
                          <v-icon icon="mdi-clipboard-text-off-outline" size="48" color="slate-400" />
                        </div>
                        <p class="text-slate-500 font-medium text-lg">نتیجه غربالگری ثبت نشده است.</p>
                      </div>
                    </td>
                  </tr>
                  <tr v-else v-for="result in results" :key="result.id" class="hover:bg-slate-50/80 transition-colors">
                    <td class="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">{{ result.patient_name || result.patientFirstName + ' ' + result.patientLastName || '---' }}</td>
                    <td class="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">{{ screeningTypeLabel(result.screening_type || result.screeningType) }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{{ result.result || '---' }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{{ formatJalaliDate(result.test_date || result.testDate || result.created_at || result.createdAt) }}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span :class="resultBadge(result.is_abnormal || result.abnormal)">{{ result.is_abnormal || result.abnormal ? 'غیرنرمال' : 'نرمال' }}</span>
                    </td>
                    <td class="px-6 py-4 text-center whitespace-nowrap">
                      <v-tooltip :text="result.notes || 'بدون یادداشت'" location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn v-bind="props" icon variant="text" size="small" class="text-slate-400 hover:text-slate-600">
                            <v-icon size="20">mdi-note-text-outline</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Add Schedule Dialog -->
    <v-dialog v-model="addScheduleDialog" max-width="550" persistent class="backdrop-blur-sm">
      <v-card class="rounded-2xl shadow-2xl">
        <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6 pb-4 flex items-center justify-between">
          <span>برنامه غربالگری جدید</span>
          <v-btn icon variant="text" size="small" class="text-slate-400" @click="addScheduleDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 pb-2 space-y-5">
          <v-text-field v-model="scheduleForm.patient_id" label="شناسه بیمار" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" placeholder="آیدی بیمار را وارد کنید" />
          <v-select v-model="scheduleForm.screening_type" :items="screeningTypeOptions" item-title="title" item-value="value" label="نوع غربالگری" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" />
          <div class="relative">
            <PersianDatetimePicker v-model="scheduleForm.due_date" type="date" placeholder="تاریخ سررسید"
              display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
              custom-input class="w-full !h-[44px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
          </div>
          <v-select v-model="scheduleForm.risk_level" :items="riskOptions" item-title="title" item-value="value" label="سطح خطر" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" />
          <v-textarea v-model="scheduleForm.notes" label="یادداشت" variant="outlined" density="comfortable" rows="3" hide-details="auto" bg-color="white" />
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-2 flex gap-3">
          <v-btn variant="text" color="slate-600" @click="addScheduleDialog = false">انصراف</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="black" :loading="savingSchedule" class="rounded-lg font-medium" @click="submitSchedule">ثبت برنامه</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Result Dialog -->
    <v-dialog v-model="addResultDialog" max-width="550" persistent class="backdrop-blur-sm">
      <v-card class="rounded-2xl shadow-2xl">
        <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6 pb-4 flex items-center justify-between">
          <span>ثبت نتیجه غربالگری</span>
          <v-btn icon variant="text" size="small" class="text-slate-400" @click="addResultDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="px-6 pb-2 space-y-5">
          <v-text-field v-model="resultForm.patient_id" label="شناسه بیمار" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" placeholder="آیدی بیمار را وارد کنید" />
          <v-select v-model="resultForm.screening_type" :items="screeningTypeOptions" item-title="title" item-value="value" label="نوع غربالگری" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" />
          <v-text-field v-model="resultForm.result" label="نتیجه" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" placeholder="متن نتیجه" />
          <div class="relative">
            <PersianDatetimePicker v-model="resultForm.test_date" type="date" placeholder="تاریخ آزمایش"
              display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
              custom-input class="w-full !h-[44px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
          </div>
          <v-select v-model="resultForm.is_abnormal" :items="[{ title: 'نرمال', value: false }, { title: 'غیرنرمال', value: true }]" item-title="title" item-value="value" label="وضعیت" variant="outlined" density="comfortable" hide-details="auto" bg-color="white" />
          <v-textarea v-model="resultForm.notes" label="یادداشت" variant="outlined" density="comfortable" rows="3" hide-details="auto" bg-color="white" />
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-2 flex gap-3">
          <v-btn variant="text" color="slate-600" @click="addResultDialog = false">انصراف</v-btn>
          <v-spacer />
          <v-btn variant="flat" color="black" :loading="savingResult" class="rounded-lg font-medium" @click="submitResult">ثبت نتیجه</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const activeTab = ref('all')
const searchQuery = ref('')
const loading = ref(true)

// Stats
const stats = ref({ total: 0, overdue: 0, completedThisMonth: 0 })

// Schedules
const schedules = ref<any[]>([])
const overdueSchedules = ref<any[]>([])
const upcomingSchedules = ref<any[]>([])

// Results
const results = ref<any[]>([])

// Dialog states
const addScheduleDialog = ref(false)
const addResultDialog = ref(false)
const savingSchedule = ref(false)
const savingResult = ref(false)

// Form data
const scheduleForm = ref({
  patient_id: '',
  screening_type: '',
  due_date: null as string | null,
  risk_level: '',
  notes: '',
})

const resultForm = ref({
  patient_id: '',
  screening_type: '',
  result: '',
  test_date: null as string | null,
  is_abnormal: false,
  notes: '',
})

// Options
const screeningTypeOptions = [
  { title: 'آزمایش پاپ اسمیر', value: 'pap_smear' },
  { title: 'تست HPV', value: 'hpv' },
  { title: 'ماموگرافی', value: 'mammography' },
  { title: 'تراکم استخوان (DEXA)', value: 'dexa' },
  { title: 'غربالگری STI', value: 'sti' },
  { title: 'کولپوسکوپی', value: 'colposcopy' },
]

const riskOptions = [
  { title: 'کم', value: 'low' },
  { title: 'متوسط', value: 'moderate' },
  { title: 'زیاد', value: 'high' },
]

const screeningTypeMap: Record<string, string> = {
  pap_smear: 'آزمایش پاپ اسمیر',
  hpv: 'تست HPV',
  mammography: 'ماموگرافی',
  dexa: 'تراکم استخوان (DEXA)',
  sti: 'غربالگری STI',
  colposcopy: 'کولپوسکوپی',
}

const riskMap: Record<string, string> = {
  low: 'کم',
  moderate: 'متوسط',
  high: 'زیاد',
}

const statusMap: Record<string, string> = {
  pending: 'در انتظار',
  completed: 'تکمیل شده',
  overdue: 'معوق',
  cancelled: 'لغو شده',
}

function screeningTypeLabel(type: string): string {
  return screeningTypeMap[type] || type
}

function riskLabel(level: string): string {
  return riskMap[level] || level
}

function statusLabel(status: string): string {
  return statusMap[status] || status
}

function riskBadge(level: string): string {
  const map: Record<string, string> = {
    low: 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    moderate: 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    high: 'px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  }
  return map[level] || 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20'
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    pending: 'px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    completed: 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    overdue: 'px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
    cancelled: 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20',
  }
  return map[status] || 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20'
}

function resultBadge(abnormal: boolean): string {
  return abnormal
    ? 'px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
    : 'px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
}

// Filtered schedules
const filteredSchedules = computed(() => {
  if (!searchQuery.value.trim()) return schedules.value
  const q = searchQuery.value.trim().toLowerCase()
  return schedules.value.filter((s: any) => {
    const name = (s.patient_name || s.patientFirstName + ' ' + s.patientLastName || '').toLowerCase()
    const type = screeningTypeLabel(s.screening_type || s.screeningType).toLowerCase()
    return name.includes(q) || type.includes(q)
  })
})

// Format date
function formatJalaliDate(date: string | null): string {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

// API calls
async function fetchAll() {
  loading.value = true
  try {
    const [schedulesRes, overdueRes, upcomingRes, resultsRes] = await Promise.all([
      apiFetch<any>('/api/screening/schedules'),
      apiFetch<any>('/api/screening/schedules/overdue'),
      apiFetch<any>('/api/screening/schedules/upcoming?days=30'),
      apiFetch<any>('/api/screening/results'),
    ])

    if (schedulesRes.success) {
      schedules.value = schedulesRes.data
    }
    if (overdueRes.success) {
      overdueSchedules.value = overdueRes.data
    }
    if (upcomingRes.success) {
      upcomingSchedules.value = upcomingRes.data
    }
    if (resultsRes.success) {
      results.value = resultsRes.data
    }

    computeStats()
  } catch (err: any) {
    $toast.error('خطا در دریافت اطلاعات')
  } finally {
    loading.value = false
  }
}

function computeStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  stats.value = {
    total: schedules.value.length,
    overdue: overdueSchedules.value.length || schedules.value.filter((s: any) => s.status === 'overdue').length,
    completedThisMonth: results.value.filter((r: any) => {
      const d = new Date(r.test_date || r.testDate || r.created_at || r.createdAt)
      return d >= startOfMonth
    }).length,
  }
}

// Delete schedule
async function confirmDelete(schedule: any) {
  if (!confirm(`آیا از حذف این برنامه غربالگری اطمینان دارید؟`)) return
  try {
    const res = await apiFetch(`/api/screening/schedules/${schedule.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success('برنامه غربالگری حذف شد')
      await fetchAll()
    } else {
      $toast.error(res.error || 'خطا در حذف برنامه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
  }
}

// Open add schedule dialog
function openAddSchedule() {
  scheduleForm.value = { patient_id: '', screening_type: '', due_date: null, risk_level: '', notes: '' }
  addScheduleDialog.value = true
}

// Submit schedule
async function submitSchedule() {
  if (!scheduleForm.value.patient_id || !scheduleForm.value.screening_type || !scheduleForm.value.due_date) {
    $toast.error('لطفاً فیلدهای ضروری (بیمار، نوع غربالگری، تاریخ سررسید) را پر کنید')
    return
  }
  savingSchedule.value = true
  try {
    const res = await apiFetch('/api/screening/schedules', {
      method: 'POST',
      body: {
        patient_id: Number(scheduleForm.value.patient_id),
        screening_type: scheduleForm.value.screening_type,
        due_date: scheduleForm.value.due_date,
        risk_level: scheduleForm.value.risk_level || undefined,
        notes: scheduleForm.value.notes || undefined,
      },
    })
    if (res.success) {
      $toast.success('برنامه غربالگری با موفقیت ثبت شد')
      addScheduleDialog.value = false
      await fetchAll()
    } else {
      $toast.error(res.error || 'خطا در ثبت برنامه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
  } finally {
    savingSchedule.value = false
  }
}

// Open add result dialog
function openAddResult() {
  resultForm.value = { patient_id: '', screening_type: '', result: '', test_date: null, is_abnormal: false, notes: '' }
  addResultDialog.value = true
}

// Submit result
async function submitResult() {
  if (!resultForm.value.patient_id || !resultForm.value.screening_type || !resultForm.value.result) {
    $toast.error('لطفاً فیلدهای ضروری (بیمار، نوع غربالگری، نتیجه) را پر کنید')
    return
  }
  savingResult.value = true
  try {
    const res = await apiFetch('/api/screening/results', {
      method: 'POST',
      body: {
        patient_id: Number(resultForm.value.patient_id),
        screening_type: resultForm.value.screening_type,
        result: resultForm.value.result,
        test_date: resultForm.value.test_date || undefined,
        is_abnormal: resultForm.value.is_abnormal,
        notes: resultForm.value.notes || undefined,
      },
    })
    if (res.success) {
      $toast.success('نتیجه غربالگری با موفقیت ثبت شد')
      addResultDialog.value = false
      await fetchAll()
    } else {
      $toast.error(res.error || 'خطا در ثبت نتیجه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
  } finally {
    savingResult.value = false
  }
}

// Re-fetch when tab changes
watch(activeTab, () => {
  if (activeTab.value === 'results' && results.value.length === 0) {
    fetchAll()
  }
})

onMounted(() => {
  fetchAll()
})

useSeoMeta({ title: 'غربالگری و مراقبت پیشگیرانه | سیستم کلینیک' })
</script>
