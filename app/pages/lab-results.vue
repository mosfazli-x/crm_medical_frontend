<template>
  <div class="mx-auto max-w-7xl px-4 py-10 md:px-8 min-h-screen bg-slate-50/50">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pb-1 border-b border-slate-100 mb-6">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">نتایج آزمایشگاه</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">مدیریت و مشاهده نتایج آزمایشگاهی و هورمونی بیماران</p>
      </div>
    </div>

    <v-card class="mb-6 rounded-2xl" variant="outlined">
      <v-card-text class="pa-6">
        <div class="flex flex-col md:flex-row gap-4">
          <v-text-field
            v-model="searchQuery"
            label="جستجوی بیمار (نام، نام خانوادگی، کد ملی)"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="flex-1"
            clearable
            @update:model-value="onSearchInput"
          />
          <v-btn
            variant="tonal"
            color="#5465ff"
            prepend-icon="mdi-account-search"
            :loading="searching"
            class="h-10 mt-1 shrink-0"
            @click="searchPatients"
          >
            جستجو
          </v-btn>
        </div>

        <div v-if="searchResults.length > 0" class="mt-5 border-t border-slate-100 pt-4">
          <p class="text-xs font-bold text-slate-400 mb-3">{{ searchResults.length }} بیمار یافت شد</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="patient in searchResults"
              :key="patient.id"
              :class="[
                'p-4 rounded-xl border cursor-pointer transition-all',
                selectedPatient?.id === patient.id
                  ? 'bg-light-cyan border-baby-blue-ice ring-2 ring-periwinkle'
                  : 'bg-white border-slate-200 hover:border-periwinkle hover:bg-light-cyan/30'
              ]"
              @click="selectPatient(patient)"
            >
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-periwinkle text-electric-sapphire flex items-center justify-center text-sm font-bold">
                  {{ patient.firstName?.charAt(0) }}{{ patient.lastName?.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ patient.firstName }} {{ patient.lastName }}</p>
                  <p class="text-xs text-slate-500 font-mono mt-0.5">{{ patient.nationalId }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="searchQuery && !searching && searchResults.length === 0 && searchTouched" class="mt-4 text-center py-6 text-slate-400 text-sm">
          هیچ بیماری با این مشخصات یافت نشد.
        </div>
      </v-card-text>
    </v-card>

    <template v-if="selectedPatient">
      <v-card class="mb-6 rounded-2xl bg-gradient-to-l from-electric-sapphire to-cornflower-blue" elevation="1">
        <v-card-text class="pa-6 text-white">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold shrink-0">
                {{ selectedPatient.firstName?.charAt(0) }}{{ selectedPatient.lastName?.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-bold">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</h2>
                <p class="text-periwinkle text-sm mt-1 font-mono inline-block" dir="ltr">{{ selectedPatient.nationalId }}</p>
              </div>
            </div>
            <v-btn
              variant="flat"
              color="white"
              class="text-electric-sapphire font-bold"
              prepend-icon="mdi-plus-circle-outline"
              @click="openAddDialog"
            >
              افزودن نتیجه
            </v-btn>
          </div>
        </v-card-text>
      </v-card>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
        <div
          v-for="(label, key) in categoryLabels"
          :key="key"
          :class="[
            'rounded-xl p-4 border cursor-pointer transition-all text-center',
              categoryFilter === key
                ? 'bg-light-cyan border-baby-blue-ice ring-1 ring-periwinkle'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          ]"
          @click="categoryFilter = key"
        >
          <p class="text-2xl font-bold text-slate-800">{{ categoryCounts[key] || 0 }}</p>
          <p class="text-xs text-slate-500 mt-1 font-medium">{{ label }}</p>
        </div>
      </div>

      <v-card class="rounded-2xl" variant="outlined">
        <div class="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 tracking-wide">{{ filteredResults.length }} نتیجه</span>
          <div class="flex items-center gap-2">
            <v-btn
              v-if="categoryFilter !== 'all'"
              variant="text"
              size="small"
              color="grey"
              @click="categoryFilter = 'all'"
            >
              پاک کردن فیلتر
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              color="red"
              @click="selectedPatient = null; results = []; searchQuery = ''; searchResults = []"
            >
              تغییر بیمار
            </v-btn>
          </div>
        </div>

        <div v-if="loadingResults" class="p-8 text-center">
          <v-progress-circular indeterminate color="#5465ff" size="40" />
        </div>

        <div v-else-if="filteredResults.length === 0" class="py-16 text-center">
          <div class="flex flex-col items-center">
            <div class="bg-slate-50 p-4 rounded-full mb-4">
              <v-icon icon="mdi-flask-outline" size="48" color="grey-lighten-1" />
            </div>
            <p class="text-slate-500 font-medium">نتیجه آزمایشگاهی برای این بیمار ثبت نشده است.</p>
          </div>
        </div>

        <div v-else class="overflow-x-auto">
          <v-table class="text-right">
            <thead>
              <tr>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap">تاریخ آزمایش</th>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap">دسته‌بندی</th>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap">نام آزمایش</th>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap">مقدار</th>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap">واحد</th>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap">محدوده مرجع</th>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap">وضعیت</th>
                <th class="text-xs font-bold text-slate-500 whitespace-nowrap text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="result in filteredResults"
                :key="result.id"
                class="hover:bg-slate-50/80 transition-colors group"
              >
                <td class="text-sm text-slate-700 whitespace-nowrap">{{ formatJalaliDate(result.test_date) }}</td>
                <td class="text-sm text-slate-600 whitespace-nowrap">
                  <span
                    :class="['px-2 py-0.5 rounded-md text-xs font-bold', categoryBadge(result.category)]"
                  >
                    {{ categoryLabels[result.category] || result.category }}
                  </span>
                </td>
                <td
                  class="text-sm font-semibold text-electric-sapphire cursor-pointer hover:text-electric-sapphire whitespace-nowrap"
                  @click="showTrend(result)"
                >
                  {{ result.test_name }}
                </td>
                <td class="text-sm text-slate-800 font-mono font-bold whitespace-nowrap">{{ result.value }}</td>
                <td class="text-sm text-slate-500 font-mono whitespace-nowrap">{{ result.unit || '---' }}</td>
                <td class="text-sm text-slate-500 font-mono whitespace-nowrap">{{ result.reference_range || '---' }}</td>
                <td class="whitespace-nowrap">
                  <span
                    v-if="result.abnormal_flag"
                    class="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold"
                  >
                    غیرطبیعی
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold"
                  >
                    طبیعی
                  </span>
                </td>
                <td class="text-center whitespace-nowrap">
                  <v-tooltip text="نمایش روند" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon
                        variant="text"
                        size="small"
                        color="#5465ff"
                        @click="showTrend(result)"
                      >
                        <v-icon size="18">mdi-chart-timeline-variant</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip text="حذف" location="top">
                    <template #activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon
                        variant="text"
                        size="small"
                        color="red"
                        @click="confirmDelete(result)"
                      >
                        <v-icon size="18">mdi-delete-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card>
    </template>

    <div v-if="!selectedPatient" class="text-center py-24">
      <div class="bg-slate-50 p-6 rounded-full inline-flex mb-6">
        <v-icon icon="mdi-flask-outline" size="64" color="grey-lighten-1" />
      </div>
      <h3 class="text-xl font-bold text-slate-600">بیماری را جستجو کنید</h3>
      <p class="text-slate-400 mt-2">برای مشاهده نتایج آزمایشگاهی، ابتدا نام یا کد ملی بیمار را جستجو کنید.</p>
    </div>

    <v-dialog v-model="addDialog" max-width="650" persistent class="backdrop-blur-sm">
      <v-card class="rounded-2xl">
        <div class="flex items-center justify-between px-6 pt-6 pb-0">
          <h3 class="text-xl font-bold text-slate-800">افزودن نتیجه آزمایش</h3>
          <v-btn icon variant="text" size="small" @click="addDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="pa-6">
          <v-form ref="formRef" @submit.prevent="submitResult">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <v-combobox
                v-model="form.test_name"
                label="نام آزمایش *"
                variant="outlined"
                density="compact"
                :items="commonTestNames"
                :rules="[v => !!v || 'نام آزمایش الزامی است']"
                hide-details="auto"
                class="md:col-span-2"
              />
              <v-select
                v-model="form.category"
                :items="categoryOptions"
                item-title="label"
                item-value="value"
                label="دسته‌بندی *"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'دسته‌بندی الزامی است']"
                hide-details="auto"
              />
              <v-text-field
                v-model="form.value"
                label="مقدار *"
                variant="outlined"
                density="compact"
                type="number"
                step="any"
                :rules="[v => !!v || 'مقدار الزامی است']"
                hide-details="auto"
              />
              <v-text-field
                v-model="form.unit"
                label="واحد"
                variant="outlined"
                density="compact"
                hide-details="auto"
              />
              <v-text-field
                v-model="form.reference_range"
                label="محدوده مرجع"
                variant="outlined"
                density="compact"
                hide-details="auto"
                placeholder="مثلاً 1.5 - 5.0"
              />
              <v-switch
                v-model="form.abnormal_flag"
                label="نتیجه غیرطبیعی"
                color="red"
                inset
                hide-details
                class="pt-2"
              />
              <div class="md:col-span-2">
                <label class="text-sm font-bold text-slate-700 mb-1 block">تاریخ آزمایش *</label>
                <PersianDatetimePicker
                  v-model="form.test_date"
                  format="YYYY-MM-DD"
                  placeholder="تاریخ آزمایش را انتخاب کنید"
                />
                <p v-if="formDateError" class="text-red-500 text-xs mt-1">{{ formDateError }}</p>
              </div>
              <div class="md:col-span-2">
                <v-textarea
                  v-model="form.notes"
                  label="یادداشت"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  hide-details
                />
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 flex justify-end gap-3">
          <v-btn variant="tonal" color="grey" @click="addDialog = false">انصراف</v-btn>
          <v-btn variant="tonal" color="#5465ff" :loading="submitting" @click="submitResult">ذخیره</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="trendDialog" max-width="850" class="backdrop-blur-sm">
      <v-card class="rounded-2xl" v-if="trendData.length > 0 || trendLoading">
        <div class="flex items-center justify-between px-6 pt-6 pb-0">
          <div>
            <h3 class="text-xl font-bold text-slate-800">روند {{ trendTestName }}</h3>
            <p class="text-sm text-slate-500 mt-1" v-if="trendUnit">واحد: {{ trendUnit }}</p>
          </div>
          <v-btn icon variant="text" size="small" @click="trendDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
        <v-card-text class="pa-6">
          <div v-if="trendLoading" class="flex justify-center py-12">
            <v-progress-circular indeterminate color="#5465ff" size="40" />
          </div>
          <template v-else>
            <div class="bg-white rounded-xl border border-slate-200 p-4 mb-6 overflow-x-auto">
              <svg
                :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
                class="w-full max-h-80"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="white" />

                <text :x="svgWidth / 2" :y="18" text-anchor="middle" class="text-xs fill-slate-500" font-size="11">
                  {{ trendTestName }} - روند تغییرات
                </text>

                <line
                  v-for="(g, gi) in yGridLines"
                  :key="'yg'+gi"
                  :x1="margin.left"
                  :y1="g.y"
                  :x2="svgWidth - margin.right"
                  :y2="g.y"
                  stroke="#e2e8f0"
                  stroke-width="1"
                />
                <text
                  v-for="(g, gi) in yGridLines"
                  :key="'yl'+gi"
                  :x="margin.left - 8"
                  :y="g.y + 4"
                  text-anchor="end"
                  class="text-xs fill-slate-400"
                  font-size="10"
                >
                  {{ g.label }}
                </text>

                <rect
                  v-if="refLow !== null && refHigh !== null"
                  :x="margin.left"
                  :y="scaleY(refHigh)"
                  :width="plotWidth"
                  :height="scaleY(refLow) - scaleY(refHigh)"
                  fill="#e0f2fe"
                  fill-opacity="0.4"
                  rx="2"
                />
                <line
                  v-if="refLow !== null"
                  :x1="margin.left"
                  :y1="scaleY(refLow)"
                  :x2="svgWidth - margin.right"
                  :y2="scaleY(refLow)"
                  stroke="#93c5fd"
                  stroke-width="1"
                  stroke-dasharray="4,3"
                />
                <line
                  v-if="refHigh !== null"
                  :x1="margin.left"
                  :y1="scaleY(refHigh)"
                  :x2="svgWidth - margin.right"
                  :y2="scaleY(refHigh)"
                  stroke="#93c5fd"
                  stroke-width="1"
                  stroke-dasharray="4,3"
                />

                <polyline
                  :points="linePoints"
                  fill="none"
                  stroke="#5465ff"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />

                <circle
                  v-for="(pt, pi) in trendDataSorted"
                  :key="'pt'+pi"
                  :cx="scaleX(pt.index)"
                  :cy="scaleY(Number(pt.value))"
                  r="4"
                  :fill="pt.abnormal_flag ? '#ef4444' : '#5465ff'"
                  stroke="white"
                  stroke-width="2"
                />

                <text
                  v-for="(pt, pi) in trendDataSorted"
                  :key="'xl'+pi"
                  :x="scaleX(pt.index)"
                  :y="svgHeight - margin.bottom + 16"
                  text-anchor="end"
                  transform="rotate(-35, scaleX(pt.index), svgHeight - margin.bottom + 16)"
                  class="text-xs fill-slate-400"
                  font-size="9"
                >
                  {{ formatShortDate(pt.test_date) }}
                </text>
              </svg>
            </div>

            <div class="overflow-x-auto">
              <v-table class="text-right">
                <thead>
                  <tr>
                    <th class="text-xs font-bold text-slate-500">تاریخ</th>
                    <th class="text-xs font-bold text-slate-500">مقدار</th>
                    <th class="text-xs font-bold text-slate-500">محدوده مرجع</th>
                    <th class="text-xs font-bold text-slate-500">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pt in trendDataSorted" :key="pt.id" class="hover:bg-slate-50/80">
                    <td class="text-sm text-slate-700">{{ formatJalaliDate(pt.test_date) }}</td>
                    <td class="text-sm font-mono font-bold text-slate-800">{{ pt.value }}</td>
                    <td class="text-sm font-mono text-slate-500">{{ pt.reference_range || '---' }}</td>
                    <td>
                      <span
                        v-if="pt.abnormal_flag"
                        class="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-xs font-bold"
                      >
                        غیرطبیعی
                      </span>
                      <span
                        v-else
                        class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-bold"
                      >
                        طبیعی
                      </span>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420" class="backdrop-blur-sm">
      <v-card class="rounded-2xl pa-6">
        <div class="text-center">
          <div class="bg-red-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            <v-icon icon="mdi-delete-outline" size="28" color="red" />
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">حذف نتیجه آزمایش</h3>
          <p class="text-slate-500 text-sm">آیا از حذف این نتیجه آزمایش اطمینان دارید؟ این عملیات قابل بازگشت نیست.</p>
        </div>
        <div class="flex justify-center gap-3 mt-6">
          <v-btn variant="tonal" color="grey" @click="deleteDialog = false">انصراف</v-btn>
          <v-btn variant="tonal" color="red" :loading="deleting" @click="deleteResult">حذف</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedPatient = ref<any>(null)
const searching = ref(false)
const searchTouched = ref(false)

const results = ref<any[]>([])
const loadingResults = ref(false)
const categoryFilter = ref('all')

const addDialog = ref(false)
const submitting = ref(false)
const formRef = ref<any>(null)
const formDateError = ref('')

const trendDialog = ref(false)
const trendData = ref<any[]>([])
const trendLoading = ref(false)
const trendTestName = ref('')
const trendUnit = ref('')

const deleteDialog = ref(false)
const deleting = ref(false)
const deleteTarget = ref<any>(null)

const categoryLabels: Record<string, string> = {
  hormone: 'هورمون‌ها',
  tumor_marker: 'مارکرهای توموری',
  cytology: 'سیتولوژی',
  pathology: 'پاتولوژی',
  microbiology: 'میکروبیولوژی',
  genetic: 'ژنتیک',
  other: 'سایر',
}

const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))

const commonTestNames = [
  'FSH', 'LH', 'Estradiol (E2)', 'Progesterone', 'Prolactin', 'AMH', 'TSH',
  'Testosterone', 'DHEA-S', 'SHBG', 'CA-125', 'HE4', 'ROMA', 'AFP', 'CEA',
  'CA 15-3', 'CA 19-9',
]

const form = ref({
  category: 'hormone',
  test_name: '',
  value: '',
  unit: '',
  reference_range: '',
  abnormal_flag: false,
  notes: '',
  test_date: '',
})

watch(addDialog, (val) => {
  if (!val) {
    form.value = { category: 'hormone', test_name: '', value: '', unit: '', reference_range: '', abnormal_flag: false, notes: '', test_date: '' }
    formDateError.value = ''
  }
})

function categoryBadge(cat: string) {
  const map: Record<string, string> = {
    hormone: 'bg-pink-50 text-pink-700 border border-pink-200',
    tumor_marker: 'bg-purple-50 text-purple-700 border border-purple-200',
    cytology: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    pathology: 'bg-amber-50 text-amber-700 border border-amber-200',
    microbiology: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    genetic: 'bg-light-cyan text-electric-sapphire border border-periwinkle',
    other: 'bg-slate-50 text-slate-600 border border-slate-200',
  }
  return map[cat] || map.other
}

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of results.value) {
    counts[r.category] = (counts[r.category] || 0) + 1
  }
  return counts
})

const filteredResults = computed(() => {
  if (categoryFilter.value === 'all') return results.value
  return results.value.filter(r => r.category === categoryFilter.value)
})

function formatJalaliDate(date: string | null) {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

function formatShortDate(date: string) {
  if (!date) return ''
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(date))
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  searchTouched.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchPatients(), 500)
}

async function searchPatients() {
  const q = searchQuery.value.trim()
  if (!q) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await apiFetch<any>(`/api/patients?search=${encodeURIComponent(q)}`)
    if (res.success) {
      searchResults.value = res.data || []
    } else {
      searchResults.value = []
    }
  } catch {
    searchResults.value = []
    $toast.error('خطا در جستجوی بیماران')
  } finally {
    searching.value = false
  }
}

async function selectPatient(patient: any) {
  selectedPatient.value = patient
  searchQuery.value = `${patient.firstName} ${patient.lastName}`
  categoryFilter.value = 'all'
  await fetchResults()
}

async function fetchResults() {
  if (!selectedPatient.value) return
  loadingResults.value = true
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${selectedPatient.value.id}`)
    if (res.success) {
      results.value = res.data || []
    } else {
      results.value = []
      $toast.error('خطا در دریافت نتایج آزمایشگاه')
    }
  } catch {
    results.value = []
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    loadingResults.value = false
  }
}

function openAddDialog() {
  form.value = { category: 'hormone', test_name: '', value: '', unit: '', reference_range: '', abnormal_flag: false, notes: '', test_date: '' }
  formDateError.value = ''
  addDialog.value = true
}

async function submitResult() {
  if (!form.value.test_date) {
    formDateError.value = 'تاریخ آزمایش الزامی است'
    return
  }
  formDateError.value = ''

  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  submitting.value = true
  try {
    const body = {
      patient_id: selectedPatient.value.id,
      category: form.value.category,
      test_name: form.value.test_name,
      value: parseFloat(form.value.value),
      unit: form.value.unit,
      reference_range: form.value.reference_range,
      abnormal_flag: form.value.abnormal_flag,
      notes: form.value.notes,
      test_date: form.value.test_date,
    }
    const res = await apiFetch<any>('/api/lab-results', {
      method: 'POST',
      body,
    })
    if (res.success) {
      $toast.success('نتیجه آزمایش با موفقیت ثبت شد')
      addDialog.value = false
      await fetchResults()
    } else {
      $toast.error(res.error || 'خطا در ثبت نتیجه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ثبت نتیجه آزمایش')
  } finally {
    submitting.value = false
  }
}

async function showTrend(result: any) {
  trendTestName.value = result.test_name
  trendUnit.value = result.unit || ''
  trendDialog.value = true
  trendLoading.value = true
  trendData.value = []
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${selectedPatient.value.id}/trend?testName=${encodeURIComponent(result.test_name)}`)
    if (res.success) {
      trendData.value = (res.data || []).sort(
        (a: any, b: any) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
      )
    } else {
      trendData.value = []
      $toast.error('خطا در دریافت داده‌های روند')
    }
  } catch {
    trendData.value = []
    $toast.error('خطا در دریافت روند آزمایش')
  } finally {
    trendLoading.value = false
  }
}

const trendDataSorted = computed(() => {
  return trendData.value.map((d: any, i: number) => ({ ...d, index: i }))
})

const margin = { top: 30, right: 20, bottom: 60, left: 55 }
const svgWidth = 750
const svgHeight = 320
const plotWidth = svgWidth - margin.left - margin.right
const plotHeight = svgHeight - margin.top - margin.bottom

function scaleX(index: number) {
  const count = trendDataSorted.value.length
  if (count <= 1) return margin.left + plotWidth / 2
  return margin.left + (index / (count - 1)) * plotWidth
}

function scaleY(value: number) {
  const vals = trendDataSorted.value.map(d => Number(d.value))
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  return margin.top + ((yMax - value) / (yMax - yMin)) * plotHeight
}

const refLow = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const range = trendDataSorted.value[0].reference_range
  if (!range) return null
  const parts = range.split('-').map((s: string) => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[0])) return parts[0]
  const match = range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (match) return parseFloat(match[1])
  return null
})

const refHigh = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const range = trendDataSorted.value[0].reference_range
  if (!range) return null
  const parts = range.split('-').map((s: string) => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[1])) return parts[1]
  const match = range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (match) return parseFloat(match[2])
  return null
})

const yGridLines = computed(() => {
  const vals = trendDataSorted.value.map(d => Number(d.value))
  if (vals.length === 0) return []
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  const steps = 5
  const lines = []
  for (let i = 0; i <= steps; i++) {
    const val = yMin + ((yMax - yMin) * i) / steps
    lines.push({
      y: margin.top + ((yMax - val) / (yMax - yMin)) * plotHeight,
      label: val.toFixed(1),
    })
  }
  return lines
})

const linePoints = computed(() => {
  return trendDataSorted.value
    .map((d: any) => `${scaleX(d.index)},${scaleY(Number(d.value))}`)
    .join(' ')
})

function confirmDelete(result: any) {
  deleteTarget.value = result
  deleteDialog.value = true
}

async function deleteResult() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await apiFetch<any>(`/api/lab-results/${deleteTarget.value.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success('نتیجه آزمایش با موفقیت حذف شد')
      deleteDialog.value = false
      deleteTarget.value = null
      await fetchResults()
    } else {
      $toast.error(res.error || 'خطا در حذف نتیجه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در حذف نتیجه آزمایش')
  } finally {
    deleting.value = false
  }
}

useSeoMeta({ title: 'نتایج آزمایشگاه | سیستم کلینیک' })
</script>
