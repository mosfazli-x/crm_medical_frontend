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
                <span class="flex items-center gap-1.5">
                  <span>{{ formatDate(basicInfo.birth_date ?? basicInfo.birthDate) }}</span>
                  <span v-if="(basicInfo.birth_date_exact ?? basicInfo.birthDateExact) === false" class="text-[10px] font-medium text-amber-700 bg-amber-100 rounded-full px-1.5 py-0.5">{{ $t('patients.approxDob') }}</span>
                </span>
              </div>
            </div>
          </div>
          <v-btn variant="tonal" color="#4F46E5" size="small" class="rounded-lg" @click="refreshProfile">بروزرسانی</v-btn>
        </div>
      </div>

      <!-- Tabbed Content -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200">
        <v-tabs v-model="activeTab" color="black" bg-color="transparent" slider-color="black">
          <v-tab value="reproductive" class="text-sm font-medium tracking-wide">سابقه باروری</v-tab>
          <v-tab value="pregnancy" class="text-sm font-medium tracking-wide">بارداری و زایمان</v-tab>
          <v-tab value="lifestyle" class="text-sm font-medium tracking-wide">سبک زندگی</v-tab>
          <v-tab value="screening" class="text-sm font-medium tracking-wide">غربالگری</v-tab>
          <v-tab value="lab" class="text-sm font-medium tracking-wide">آزمایشات</v-tab>
          <v-tab value="consent" class="text-sm font-medium tracking-wide">رضایت‌نامه</v-tab>
          <v-tab value="attachments" class="text-sm font-medium tracking-wide">مستندات</v-tab>
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

            <!-- Pregnancy History Tab -->
            <v-window-item value="pregnancy">
              <PregnancyHistoryTab
                v-model:records="pregnancyRecords"
                v-model:general-notes="pregnancyGeneralNotes"
              />
              <div class="flex justify-end mt-4">
                <v-btn variant="flat" color="#4F46E5" size="small" class="rounded-lg px-8"
                       :loading="pregnancySaving" @click="savePregnancyHistory">
                  ذخیره تاریخچه بارداری
                </v-btn>
              </div>
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
              <LabResultsSection :patient-id="patientId" />
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

            <!-- Attachments Tab -->
            <v-window-item value="attachments">
              <AttachmentsTab
                :patient-id="patientId"
                v-model:attachments="newAttachments"
                v-model:existing-attachments="existingAttachmentsModel"
              />
            </v-window-item>
          </v-window>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { usePatientProfile } from '~/composables/usePatientProfile'
import { useRoute } from 'vue-router'
import AttachmentsTab from '~/components/patient/tabs/Attachments.vue'
import PregnancyHistoryTab from '~/components/patient/tabs/PregnancyHistory.vue'

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

// Attachments tab
const newAttachments = ref({ ultrasound: [], lab: [], prescription: [], patientFiles: [] })
const existingAttachmentsModel = computed({
  get: () => profile.value?.attachments || { ultrasound: [], lab: [], prescription: [], patientFiles: [] },
  set: (val) => { if (profile.value) (profile.value as any).attachments = val },
})

// Pregnancy tab
const pregnancyRecords = computed({
  get: () => obstetricHistory.value?.records ?? [],
  set: (val) => { if (obstetricHistory.value) obstetricHistory.value.records = val },
})
const pregnancyGeneralNotes = computed({
  get: () => obstetricHistory.value?.general_notes ?? '',
  set: (val) => { if (obstetricHistory.value) obstetricHistory.value.general_notes = val },
})
const pregnancySaving = ref(false)

// Screening tab
const screeningsLoading = ref(false)

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

const savePregnancyHistory = async () => {
  if (!patientId.value) return
  pregnancySaving.value = true
  try {
    const { apiFetch } = useApi()
    const { $toast } = useNuxtApp()
    const config = useRuntimeConfig()

    const payload = {
      pregnancies: pregnancyRecords.value.map((p: any) => ({
        ...(p.id ? { id: p.id } : {}),
        gravida_index: p.gravida_index ?? null,
        status: p.status || 'completed',
        lmp: p.lmp || null,
        edd: p.edd || null,
        end_date: p.end_date || null,
        gestational_age_weeks: p.gestational_age_weeks ?? null,
        gestational_age_days: p.gestational_age_days ?? null,
        outcome: p.outcome || null,
        delivery_method: p.delivery_method || null,
        anesthesia_type: p.anesthesia_type || null,
        maternal_complications: p.maternal_complications || [],
        prenatal_screenings: p.prenatal_screenings || {},
        newborns_details: p.newborns_details || [],
        notes: p.notes || null,
      }))
    }

    const formData = new FormData()
    formData.append('patient', JSON.stringify(payload))

    const res = await apiFetch<any>(`/api/patients/${patientId.value}`, {
      method: 'PUT',
      body: formData,
      baseURL: config.public.apiBase
    })

    if (res.success) {
      $toast.success('تاریخچه بارداری با موفقیت ذخیره شد')
      await refreshProfile()
    } else {
      $toast.error(res.error || 'خطا در ذخیره تاریخچه بارداری')
    }
  } catch (err: any) {
    useNuxtApp().$toast.error(err.data?.error || 'خطا در ارتباط با سرور')
  } finally {
    pregnancySaving.value = false
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
  if (activeTab.value === 'consent') fetchConsents()
})

useSeoMeta({ title: 'پرونده بیمار | سیستم کلینیک' })
</script>