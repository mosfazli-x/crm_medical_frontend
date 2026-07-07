<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 pt-6 space-y-6">
    <!-- Loading State -->
    <div v-if="profileLoading" class="space-y-6">
      <v-skeleton-loader type="card-heading" class="rounded-2xl" />
      <v-skeleton-loader type="image" class="rounded-2xl h-[400px]" />
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <v-icon icon="mdi-alert-circle-outline" size="x-large" class="text-red-400 mb-4" />
      <h2 class="text-xl font-bold text-slate-700 mb-2">خطا در دریافت اطلاعات بیمار</h2>
      <p class="text-slate-500 mb-6">{{ loadError }}</p>
      <v-btn variant="tonal" color="black" @click="fetchProfile">تلاش مجدد</v-btn>
    </div>

    <!-- Main Content -->
    <template v-else-if="basicInfo">
      <!-- Patient Header Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-periwinkle text-electric-sapphire flex items-center justify-center text-xl font-bold shadow-sm">
              {{ basicInfo.first_name?.charAt(0) }}{{ basicInfo.last_name?.charAt(0) }}
            </div>
            <div>
              <h1 class="text-2xl font-extrabold text-slate-800">{{ basicInfo.first_name }} {{ basicInfo.last_name }}</h1>
              <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                <span class="font-mono tracking-wider">{{ basicInfo.national_id }}</span>
                <span class="w-1 h-1 bg-slate-300 rounded-full" />
                <span dir="ltr">{{ basicInfo.phone || '---' }}</span>
                <span class="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{{ formatDate(basicInfo.birth_date) }}</span>
              </div>
            </div>
          </div>
          <v-btn variant="tonal" color="#5465ff" size="small" class="rounded-lg" @click="refreshProfile">بروزرسانی</v-btn>
        </div>
      </div>

      <!-- Tabbed Content -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200">
        <v-tabs v-model="activeTab" color="black" bg-color="transparent" slider-color="black">
          <v-tab value="reproductive" class="text-sm font-medium tracking-wide">سابقه باروری</v-tab>
          <v-tab value="lifestyle" class="text-sm font-medium tracking-wide">سبک زندگی</v-tab>
          <v-tab value="screening" class="text-sm font-medium tracking-wide">غربالگری</v-tab>
          <v-tab value="lab" class="text-sm font-medium tracking-wide">آزمایشات</v-tab>
          <v-tab value="consent" class="text-sm font-medium tracking-wide">رضایت‌نامه</v-tab>
        </v-tabs>

        <v-divider />

        <div class="p-6">
          <v-window v-model="activeTab">
            <!-- Reproductive History Tab -->
            <v-window-item value="reproductive">
              <ReproductiveTab
                :repro-form="reproForm"
                :saving="reproSaving"
                :flow-volume-options="flowVolumeOptions"
                :yes-no-options="yesNoOptions"
                :yes-no-unknown-options="yesNoUnknownOptions"
                @save="saveReproSection"
              />
            </v-window-item>

            <!-- Lifestyle Tab -->
            <v-window-item value="lifestyle">
              <div class="max-w-2xl space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <v-select
                    v-model="lifestyleForm.smoking"
                    :items="yesNoOptions"
                    label="استعمال دخانیات"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    bg-color="white"
                  />
                  <v-text-field
                    v-model.number="lifestyleForm.bmi"
                    label="BMI"
                    type="number"
                    step="0.1"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    bg-color="white"
                  />
                  <v-text-field
                    v-model="lifestyleForm.exercise"
                    label="فعالیت ورزشی"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    bg-color="white"
                  />
                  <v-select
                    v-model="lifestyleForm.alcohol"
                    :items="yesNoOptions"
                    label="مصرف الکل"
                    variant="outlined"
                    density="compact"
                    hide-details="auto"
                    bg-color="white"
                  />
                </div>
                <div class="flex justify-end">
                  <v-btn
                    variant="flat"
                    color="black"
                    size="small"
                    class="rounded-lg px-8"
                    :loading="lifestyleSaving"
                    @click="saveLifestyle"
                  >
                    ذخیره تغییرات
                  </v-btn>
                </div>
              </div>
            </v-window-item>

            <!-- Screening Tab -->
            <v-window-item value="screening">
              <ScreeningTab
                :schedules="screenings?.schedules"
                :results="screenings?.results"
                :overdue="screenings?.overdue"
                :loading="screeningsLoading"
                @create="createScreening"
                @refresh="fetchScreenings"
              />
            </v-window-item>

            <!-- Lab Results Tab -->
            <v-window-item value="lab">
              <LabResultsTab
                :results="labResults?.results"
                :loading="labLoading"
                @create="createLabResult"
                @show-trend="showLabTrend"
              />
            </v-window-item>

            <!-- Consent Tab -->
            <v-window-item value="consent">
              <ConsentTab
                :records="consents?.records"
                :loading="consentsLoading"
                @create="createConsent"
                @revoke="revokeConsent"
              />
            </v-window-item>
          </v-window>
        </div>
      </div>

      <!-- Lab Trend Dialog -->
      <v-dialog v-model="labTrendDialog" max-width="700" v-if="selectedLabTest">
        <v-card class="rounded-2xl">
          <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6 pb-4 flex items-center gap-3">
            <span>روند {{ selectedLabTest.test_name }}</span>
            <v-btn icon variant="text" size="small" class="text-slate-400" @click="labTrendDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="px-6 pb-6">
            <div v-if="labTrendLoading" class="text-center py-8">
              <v-progress-circular indeterminate color="black" size="40" />
            </div>
            <div v-else-if="labTrendData.length === 0" class="text-center py-8 text-sm text-slate-500">
              داده کافی برای نمایش روند وجود ندارد.
            </div>
            <div v-else class="space-y-3">
              <div v-for="t in labTrendData" :key="t.id" class="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <span class="font-medium text-slate-800 text-sm">{{ t.result }}</span>
                  <span class="text-xs text-slate-500 mr-2">{{ formatDate(t.performed_date) }}</span>
                </div>
                <v-chip size="x-small" :color="t.abnormal ? 'red' : 'green'" variant="tonal">
                  {{ t.abnormal ? 'غیرنرمال' : 'نرمال' }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { usePatientProfile } from '~/composables/usePatientProfile'
import { useRoute } from 'vue-router'

// Initialize composable - unified entry point
const route = useRoute()
const patientId = computed(() => route.params.id as string)

const {
  profile,
  basicInfo,
  medicalHistory,
  reproductiveHealth,
  obstetricHistory,
  screenings,
  labResults,
  consents,
  attachments,
  loading: profileLoading,
  error: profileError,
  lifestyleForm,
  reproForm,
  fetchProfile,
  saveLifestyle,
  saveReproductiveSection,
  refresh: refreshProfile,
  reset
} = usePatientProfile({
  patientId: patientId.value,
  autoFetch: true
})

// Watch for route changes
watch(patientId, (newId) => {
  if (newId) {
    reset()
    // Update composable with new patient ID
    fetchProfile()
  }
})

// ─────────────────────────────────────────────────────────────
// Legacy State (for gradual migration)
// ─────────────────────────────────────────────────────────────
const activeTab = ref('reproductive')

// Loading states
const reproSaving = ref(false)
const lifestyleSaving = ref(false)

// Screening tab
const screeningsLoading = ref(false)

// Lab tab
const labLoading = ref(false)
const labTrendDialog = ref(false)
const labTrendLoading = ref(false)
const labTrendData = ref<any[]>([])
const selectedLabTest = ref<any>(null)

// Consent tab
const consentsLoading = ref(false)

// ─────────────────────────────────────────────────────────────
// Computed aliases for clarity
// ─────────────────────────────────────────────────────────────
const loadError = computed(() => profileError.value)
const screeningSchedules = computed(() => screenings.value?.schedules || [])
const screeningResults = computed(() => screenings.value?.results || [])
const overdueSchedules = computed(() => screenings.value?.overdue || [])

// ─────────────────────────────────────────────────────────────
// Form Options
// ─────────────────────────────────────────────────────────────
const flowVolumeOptions = ['کم', 'متوسط', 'زیاد', 'خیلی زیاد']
const yesNoOptions = ['بله', 'خیر']
const yesNoUnknownOptions = ['بله', 'خیر', 'نامشخص']

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────
const formatDate = (date: string | null | undefined) => {
  if (!date) return '---'
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
  } catch {
    return date
  }
}

// ─────────────────────────────────────────────────────────────
// Save Handlers
// ─────────────────────────────────────────────────────────────
const saveLifestyleHandler = async () => {
  lifestyleSaving.value = true
  try {
    await saveLifestyle()
  } finally {
    lifestyleSaving.value = false
  }
}

const saveReproSection = async (section: string) => {
  reproSaving.value = true
  try {
    await saveReproductiveSection(section, section === 'surgeries' ? reproForm.surgeries :
      section === 'contraceptives' ? reproForm.contraceptives :
      section === 'family_history' ? reproForm.family_history :
      section === 'summary' ? reproForm.summary :
      section === 'menstrual' ? reproForm.menstrual :
      section === 'sexual' ? reproForm.sexual : null)
  } finally {
    reproSaving.value = false
  }
}

// ─────────────────────────────────────────────────────────────
// Screening Functions
// ─────────────────────────────────────────────────────────────
const fetchScreenings = async () => {
  if (!patientId.value) return
  screeningsLoading.value = true
  try {
    // This will be replaced by unified endpoint
    const { apiFetch } = useApi()
    const { $toast } = useNuxtApp()
    const config = useRuntimeConfig()

    const [schedulesRes, resultsRes, overdueRes] = await Promise.all([
      apiFetch<any>(`/api/screening/schedules?patientId=${patientId.value}`, {
        baseURL: config.public.apiBase
      }),
      apiFetch<any>(`/api/screening/results?patientId=${patientId.value}`, {
        baseURL: config.public.apiBase
      }),
      apiFetch<any>(`/api/screening/schedules/overdue?patientId=${patientId.value}`, {
        baseURL: config.public.apiBase
      })
    ])

    // Update reactive state directly (bypass composable for now)
    if (screenings.value) {
      screenings.value.schedules = schedulesRes.success ? schedulesRes.data : []
      screenings.value.results = resultsRes.success ? resultsRes.data : []
      screenings.value.overdue = overdueRes.success ? overdueRes.data : []
    }
  } catch (err: any) {
    useNuxtApp().$toast.error('خطا در دریافت اطلاعات غربالگری')
  } finally {
    screeningsLoading.value = false
  }
}

const createScreening = async (formData: any) => {
  if (!patientId.value) return
  try {
    const { apiFetch } = useApi()
    const config = useRuntimeConfig()
    const { $toast } = useNuxtApp()

    const res = await apiFetch<any>('/api/screening/schedules', {
      method: 'POST',
      body: {
        patientId: patientId.value,
        test_name: formData.test_name,
        scheduled_date: formData.scheduled_date,
        notes: formData.notes
      },
      baseURL: config.public.apiBase
    })

    if (res.success) {
      $toast.success('غربالگری با موفقیت ثبت شد')
      fetchScreenings()
    } else {
      $toast.error(res.error || 'خطا در ثبت غربالگری')
    }
  } catch (err: any) {
    useNuxtApp().$toast.error(err.data?.error || 'خطا در ثبت غربالگری')
  }
}

// ─────────────────────────────────────────────────────────────
// Lab Results Functions
// ─────────────────────────────────────────────────────────────
const fetchLabResults = async () => {
  if (!patientId.value) return
  labLoading.value = true
  try {
    const { apiFetch } = useApi()
    const config = useRuntimeConfig()

    const res = await apiFetch<any>(`/api/lab-results/patient/${patientId.value}`, {
      baseURL: config.public.apiBase
    })

    if (labResults.value) {
      labResults.value.results = res.success ? res.data : []
    }
  } catch (err: any) {
    useNuxtApp().$toast.error('خطا در دریافت نتایج آزمایشات')
  } finally {
    labLoading.value = false
  }
}

const createLabResult = async (formData: any) => {
  if (!patientId.value) return
  try {
    const { apiFetch } = useApi()
    const config = useRuntimeConfig()
    const { $toast } = useNuxtApp()

    const res = await apiFetch<any>('/api/lab-results', {
      method: 'POST',
      body: {
        patientId: patientId.value,
        test_name: formData.test_name,
        result: formData.result,
        reference_range: formData.reference_range,
        abnormal: formData.abnormal,
        performed_date: formData.performed_date,
        notes: formData.notes
      },
      baseURL: config.public.apiBase
    })

    if (res.success) {
      $toast.success('نتیجه آزمایش با موفقیت ثبت شد')
      fetchLabResults()
    } else {
      $toast.error(res.error || 'خطا در ثبت نتیجه آزمایش')
    }
  } catch (err: any) {
    useNuxtApp().$toast.error(err.data?.error || 'خطا در ثبت نتیجه آزمایش')
  }
}

const showLabTrend = async (lab: any) => {
  if (!patientId.value) return
  selectedLabTest.value = lab
  labTrendDialog.value = true
  labTrendLoading.value = true
  labTrendData.value = []

  try {
    const { apiFetch } = useApi()
    const config = useRuntimeConfig()

    const res = await apiFetch<any>(`/api/lab-results/patient/${patientId.value}/trend?testName=${encodeURIComponent(lab.test_name || lab.testName)}`, {
      baseURL: config.public.apiBase
    })

    if (res.success) labTrendData.value = res.data ?? []
  } catch {
    labTrendData.value = []
  } finally {
    labTrendLoading.value = false
  }
}

// ─────────────────────────────────────────────────────────────
// Consent Functions
// ─────────────────────────────────────────────────────────────
const fetchConsents = async () => {
  if (!patientId.value) return
  consentsLoading.value = true
  try {
    const { apiFetch } = useApi()
    const config = useRuntimeConfig()

    const res = await apiFetch<any>(`/api/consent/patient/${patientId.value}`, {
      baseURL: config.public.apiBase
    })

    if (consents.value) {
      consents.value.records = res.success ? res.data : []
    }
  } catch (err: any) {
    useNuxtApp().$toast.error('خطا در دریافت رضایت‌نامه‌ها')
  } finally {
    consentsLoading.value = false
  }
}

const createConsent = async (formData: any) => {
  if (!patientId.value) return
  try {
    const { apiFetch } = useApi()
    const config = useRuntimeConfig()
    const { $toast } = useNuxtApp()

    const res = await apiFetch<any>(`/api/consent/patient/${patientId.value}`, {
      method: 'POST',
      body: {
        type: formData.type,
        description: formData.description
      },
      baseURL: config.public.apiBase
    })

    if (res.success) {
      $toast.success('رضایت‌نامه با موفقیت ثبت شد')
      fetchConsents()
    } else {
      $toast.error(res.error || 'خطا در ثبت رضایت‌نامه')
    }
  } catch (err: any) {
    useNuxtApp().$toast.error(err.data?.error || 'خطا در ثبت رضایت‌نامه')
  }
}

const revokeConsent = async (c: any) => {
  try {
    const { apiFetch } = useApi()
    const { $toast } = useNuxtApp()

    const res = await apiFetch<any>(`/api/consent/${c.id}/revoke`, {
      method: 'PATCH',
      baseURL: useRuntimeConfig().public.apiBase
    })

    if (res.success) {
      $toast.success('رضایت‌نامه با موفقیت لغو شد')
      fetchConsents()
    } else {
      $toast.error(res.error || 'خطا در لغو رضایت‌نامه')
    }
  } catch (err: any) {
    useNuxtApp().$toast.error(err.data?.error || 'خطا در لغو رضایت‌نامه')
  }
}

// ─────────────────────────────────────────────────────────────
// Watch for tab changes to lazy-load data
// ─────────────────────────────────────────────────────────────
watch(activeTab, (tab) => {
  if (tab === 'screening' && !screenings.value?.schedules?.length && !screeningsLoading.value) {
    fetchScreenings()
  }
  if (tab === 'lab' && !labResults.value?.results?.length && !labLoading.value) {
    fetchLabResults()
  }
  if (tab === 'consent' && !consents.value?.records?.length && !consentsLoading.value) {
    fetchConsents()
  }
})

// ─────────────────────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────────────────────
onMounted(() => {
  // Primary data already fetched by composable
  // Lazy-load secondary data based on initial tab
  if (activeTab.value === 'screening') fetchScreenings()
  if (activeTab.value === 'lab') fetchLabResults()
  if (activeTab.value === 'consent') fetchConsents()
})

useSeoMeta({ title: 'پرونده بیمار | سیستم کلینیک' })
</script>