<template>
  <UiPageContainer class="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8" dir="rtl">

    <div class="!mb-8 flex flex-col md:flex-row md:!items-center justify-between !gap-6">
      <div>
        <h1 class="crm-page-title">{{ t('labResults.title') }}</h1>
        <p class="crm-page-subtitle">{{ t('labResults.subtitle') }}</p>
      </div>

      <div class="!relative !w-full md:!w-96 group">
        <div class="!absolute !inset-y-0 !right-0 !flex !items-center !pr-3.5 !pointer-events-none">
          <Search
            class="!w-4 !h-4 !text-zinc-400 group-focus-within:!text-zinc-900 !transition-colors" />
        </div>
        <input v-model="searchQuery" type="text"
          class="!w-full !bg-white !border !border-zinc-200/80 !text-zinc-900 !text-xs !rounded-xl focus:!ring-4 focus:!ring-zinc-900/5 focus:!border-zinc-900 !block !pr-10 !pl-12 !py-3 !transition-all !outline-none placeholder:!text-zinc-400 !shadow-sm"
          :placeholder="t('labResults.searchPlaceholder')" @input="onSearchInput" />
        <div class="!absolute !inset-y-0 !left-3 !flex !items-center">
          <v-progress-circular v-if="searching" indeterminate size="14" width="2" color="#18181b" />
          <button v-else-if="searchQuery" @click="clearSearch"
            class="!p-1 !text-zinc-400 hover:!text-zinc-900 !transition-colors !rounded-lg hover:!bg-zinc-100">
            <X class="!w-3.5 !h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="searchResults.length > 0 && !selectedPatient"
      class="!mb-8 !bg-white !border !border-zinc-200/80 !rounded-2xl !p-2 !shadow-[0_8px_30px_rgb(0,0,0,0.04)] !animate-in !fade-in !slide-in-from-top-2 !duration-200">
      <div class="!px-3 !py-2 !border-b !border-zinc-100 !mb-1.5">
        <p class="!text-[10px] !font-bold !text-zinc-400 !tracking-wider !flex !items-center !gap-2">
          <UsersStroke class="!w-3.5 !h-3.5" />
          {{ t('labResults.searchResultsTitle', { count: searchResults.length }) }}
        </p>
      </div>
      <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-1">
        <div v-for="patient in searchResults" :key="patient.id"
          class="!flex !items-center !gap-3.5 !p-3 !rounded-xl !cursor-pointer !transition-all !duration-200 !bg-white hover:!bg-zinc-50/80 !border !border-transparent hover:!border-zinc-200/60"
          @click="selectPatient(patient)">
          <div
            class="!w-9 !h-9 !rounded-lg !bg-zinc-100 !text-zinc-700 !flex !items-center !justify-center !text-xs !font-bold !border !border-zinc-200/40">
            {{ patient.firstName?.charAt(0) }}{{ patient.lastName?.charAt(0) }}
          </div>
          <div>
            <p class="!font-semibold !text-zinc-900 !text-xs !tracking-tight">{{ patient.firstName }} {{
              patient.lastName }}</p>
            <p class="!text-[10px] !text-zinc-400 !font-mono !mt-0.5 !tracking-wide">{{ patient.nationalId }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="searchQuery && !searching && searchResults.length === 0 && searchTouched && !selectedPatient"
      class="!mb-8 !bg-white !border !border-zinc-200/80 !rounded-2xl !py-10 !flex !flex-col !items-center !justify-center !text-center !shadow-sm">
      <div
        class="!w-10 !h-10 !bg-zinc-50 !rounded-xl !flex !items-center !justify-center !mb-3 !border !border-zinc-100">
        <UserX class="!w-4 !h-4 !text-zinc-400" />
      </div>
      <p class="!text-xs !font-semibold !text-zinc-900">{{ t('labResults.noRecords') }}</p>
      <p class="!text-[11px] !text-zinc-400 !mt-1">{{ t('labResults.noRecordsDesc') }}</p>
    </div>

    <template v-if="selectedPatient">

      <div
        class="!mb-8 !flex !flex-col sm:!flex-row !items-start sm:!items-center justify-between !gap-4 !p-5 !bg-white !border !border-zinc-200/80 !rounded-2xl !shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div class="!flex !items-center !gap-4">
          <div
            class="!w-11 !h-11 !rounded-xl !bg-zinc-900 !text-white !flex !items-center !justify-center !text-sm !font-bold">
            {{ selectedPatient.firstName?.charAt(0) }}{{ selectedPatient.lastName?.charAt(0) }}
          </div>
          <div>
            <div class="!flex !items-center !gap-2">
              <h2 class="!text-sm !font-bold !text-zinc-900 !tracking-tight">{{ selectedPatient.firstName }} {{
                selectedPatient.lastName }}</h2>
              <span class="!px-2 !py-0.5 !bg-zinc-100 !text-zinc-700 !rounded-md !text-[9px] !font-bold">{{
                t('labResults.activeFile') }}</span>
            </div>
            <div class="!flex !items-center !gap-1.5 !mt-1 !text-[11px] !text-zinc-400">
              <span>{{ t('labResults.nationalIdLabel') }}</span>
              <span class="!font-mono !tracking-wider !text-zinc-600" dir="ltr">{{ selectedPatient.nationalId }}</span>
            </div>
          </div>
        </div>
        <div class="!flex !items-center !gap-2 !w-full sm:!w-auto">
          <button
            class="!flex-1 sm:!flex-none !flex !items-center !justify-center !gap-1.5 !px-3.5 !py-2.5 !bg-white !border !border-zinc-200 hover:!border-zinc-300 !text-zinc-700 !text-xs !font-semibold !rounded-xl !transition-all !shadow-sm"
            @click="clearPatient">
            <ArrowRightLeft class="!w-3.5 !h-3.5 !text-zinc-400" />
            {{ t('labResults.changePatient') }}
          </button>
        </div>
      </div>

      <LabResultsSection :patient-id="selectedPatient.id" />
    </template>

    <div v-if="!selectedPatient && searchResults.length === 0 && !searchQuery"
      class="!mt-16 !text-center !flex !flex-col !items-center">
      <div
        class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
        <FolderHeart class="!w-6 !h-6 !text-zinc-300" />
      </div>
      <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ t('labResults.workstationTitle') }}</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">{{ t('labResults.workstationDesc') }}</p>
    </div>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Search from '~/components/icons/Search.vue'
import X from '~/components/icons/X.vue'
import UsersStroke from '~/components/icons/UsersStroke.vue'
import UserX from '~/components/icons/UserX.vue'
import ArrowRightLeft from '~/components/icons/ArrowRightLeft.vue'
import FolderHeart from '~/components/icons/FolderHeart.vue'

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedPatient = ref<any>(null)
const searching = ref(false)
const searchTouched = ref(false)

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  searchTouched.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchPatients(), 400)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

function clearPatient() {
  selectedPatient.value = null
  searchQuery.value = ''
  searchResults.value = []
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
    $toast.error(t('labResults.fetchSearchError'))
  } finally {
    searching.value = false
  }
}

async function selectPatient(patient: any) {
  selectedPatient.value = patient
  searchQuery.value = `${patient.firstName} ${patient.lastName}`
}

useSeoMeta({ title: t('labResults.titleSeo') })
</script>
