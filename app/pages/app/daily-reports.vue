<template>
  <div class="worksheet-page">
    <section v-if="!canView" class="app-empty" role="status">
      <span class="app-empty__icon"><Icon name="lucide:shield-off" size="26" /></span>
      <p>{{ t('cashbook.accessDenied') }}</p>
      <NuxtLink to="/app" class="app-btn app-btn--ghost">{{ t('cashbook.backToDashboard') }}</NuxtLink>
    </section>
    <template v-else>
      <div v-if="optionsLoading" class="app-card app-pad worksheet-loading" role="status" aria-busy="true">
        <v-progress-circular indeterminate size="24" width="2" />
        <span>{{ t('dailyReports.sheet.loadingOptions') }}</span>
      </div>
      <section v-else-if="optionsError" class="app-card app-pad worksheet-error" role="alert">
        <Icon name="lucide:cloud-off" size="28" />
        <p>{{ t('dailyReports.sheet.optionsError') }}</p>
        <button type="button" class="app-btn app-btn--primary" @click="loadOptions">
          <Icon name="lucide:refresh-cw" size="18" />{{ t('dailyReports.sheet.retry') }}
        </button>
      </section>
      <DailyPaymentsSheet v-else-if="optionsReady" :patients="patients" :visit-types="visitTypes" />
    </template>
  </div>
</template>

<script setup lang="ts">
import DailyPaymentsSheet from '~/components/DailyPaymentsSheet.vue'
import type { PatientOption, DailyReportVisitType } from '~/types/report'

definePageMeta({
  layout: 'app',
  appTitleKey: 'dailyReports.sheet.title',
  appSubtitleKey: 'dailyReports.sheet.pwaSection',
  appBack: '/app/finance',
})

const { t } = useI18n()
const { user } = useAuth()
const { listPatients, listVisitTypes } = useDailyReports()
const canView = computed(() => ['admin_doctor', 'doctor'].includes(user.value?.role || ''))
const patients = ref<PatientOption[]>([])
const visitTypes = ref<DailyReportVisitType[]>([])
const optionsLoading = ref(false)
const optionsError = ref(false)
const optionsReady = ref(false)

async function loadOptions() {
  if (!canView.value || optionsLoading.value) return
  optionsLoading.value = true
  optionsError.value = false
  try {
    const [patientResult, typeResult] = await Promise.all([listPatients(), listVisitTypes()])
    if (!Array.isArray(patientResult.data) || !Array.isArray(typeResult.data)) throw new Error('Invalid options response')
    if (!canView.value) return
    patients.value = patientResult.data
    visitTypes.value = typeResult.data
    optionsReady.value = true
  } catch {
    optionsError.value = true
  } finally {
    optionsLoading.value = false
  }
}

// useAuth restores the user on mount; never fetch clinical data before role resolution.
watch(canView, (allowed) => {
  if (allowed) void loadOptions()
  else {
    patients.value = []
    visitTypes.value = []
    optionsReady.value = false
  }
}, { immediate: true })

useSeoMeta({ title: () => t('dailyReports.sheet.title') })
</script>

<style scoped>
.worksheet-page { min-width: 0; }
.worksheet-loading { display: flex; align-items: center; justify-content: center; gap: 1rem; min-height: 12rem; }
.worksheet-error { display: grid; justify-items: center; gap: 1rem; padding-block: 2rem; text-align: center; line-height: 1.7; }
</style>
