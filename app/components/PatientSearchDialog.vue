<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="640" class="backdrop-blur-sm">
    <v-card class="rounded-2xl overflow-hidden" elevation="4">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-light-cyan flex items-center justify-center">
            <v-icon size="18" color="#5465ff">mdi-account-search</v-icon>
          </div>
          <h2 class="text-base font-bold text-slate-800">جستجوی بیمار</h2>
        </div>
        <v-btn icon variant="text" size="x-small" color="slate" @click="$emit('update:modelValue', false)">
          <v-icon size="18">mdi-close</v-icon>
        </v-btn>
      </div>

      <!-- Search Field -->
      <div class="px-6 pt-5 pb-3">
        <v-text-field
          v-model="query"
          placeholder="جستجو با نام، نام خانوادگی، شماره تلفن یا کد ملی..."
          variant="outlined"
          density="compact"
          hide-details
          prepend-inner-icon="mdi-magnify"
          clearable
          autofocus
          class="search-field"
          @keydown.enter="handleManualSearch"
        />
      </div>

      <!-- Content Area -->
      <div class="px-6 pb-5 min-h-[200px]">
        <!-- Loading State -->
        <div v-if="searching" class="flex flex-col items-center justify-center py-14">
          <v-progress-circular indeterminate size="28" width="3" color="#5465ff" />
          <p class="mt-4 text-xs font-medium text-slate-400">در حال جستجو...</p>
        </div>

        <!-- Results -->
        <div v-else-if="searchResults.length > 0" class="mt-1">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-medium text-slate-500">{{ searchResults.length }} نتیجه</p>
          </div>
          <div class="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
            <div
              v-for="patient in searchResults"
              :key="patient.id"
              class="group relative flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/60 hover:border-periwinkle hover:bg-light-cyan/40 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-y-hidden px-1 py-1"
              @click="selectPatient(patient)"
            >
              <!-- Avatar -->
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-light-cyan to-periwinkle flex items-center justify-center shrink-0 mt-0.5">
                <v-icon size="20" color="#5465ff">mdi-account</v-icon>
              </div>

              <!-- Patient Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-bold text-slate-800 truncate">{{ patient.firstName }} {{ patient.lastName }}</span>
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <div v-if="patient.nationalId" class="flex items-center gap-1.5 text-xs text-slate-500">
                    <v-icon size="13" color="slate-400">mdi-card-account-details-outline</v-icon>
                    <span dir="ltr" class="text-slate-600 font-medium">{{ patient.nationalId }}</span>
                  </div>
                  <div v-if="patient.phone" class="flex items-center gap-1.5 text-xs text-slate-500">
                    <v-icon size="13" color="slate-400">mdi-phone-outline</v-icon>
                    <span dir="ltr" class="text-slate-600 font-medium">{{ patient.phone }}</span>
                  </div>
                  <div v-if="patient.mobile" class="flex items-center gap-1.5 text-xs text-slate-500">
                    <v-icon size="13" color="slate-400">mdi-cellphone</v-icon>
                    <span dir="ltr" class="text-slate-600 font-medium">{{ patient.mobile }}</span>
                  </div>
                  <div v-if="patient.email" class="flex items-center gap-1.5 text-xs text-slate-500">
                    <v-icon size="13" color="slate-400">mdi-email-outline</v-icon>
                    <span class="text-slate-600 font-medium truncate max-w-[200px]">{{ patient.email }}</span>
                  </div>
                </div>
                <div v-if="patient.birthDate || patient.gender" class="flex items-center gap-3 mt-1.5">
                  <span v-if="patient.gender" class="text-[11px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                    {{ patient.gender === 'male' ? 'مرد' : patient.gender === 'female' ? 'زن' : patient.gender }}
                  </span>
                  <span v-if="patient.birthDate" class="text-[11px] text-slate-400">
                    {{ formatDate(patient.birthDate) }}
                  </span>
                </div>
              </div>

              <!-- Select Button (appears on hover) -->
              <div class="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                <v-btn variant="flat" color="#5465ff" size="x-small" class="font-bold text-xs px-3" elevation="0">
                  انتخاب
                </v-btn>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="searched" class="flex flex-col items-center justify-center py-14">
          <div class="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
            <v-icon size="28" color="slate-300">mdi-account-search-outline</v-icon>
          </div>
          <p class="text-sm font-bold text-slate-600">بیماری با این مشخصات یافت نشد</p>
          <p class="text-xs text-slate-400 mt-1.5">لطفاً عبارت دیگری را جستجو کنید</p>
        </div>

        <!-- Initial Hint -->
        <div v-else class="flex flex-col items-center justify-center py-14">
          <div class="w-14 h-14 rounded-2xl bg-light-cyan border border-periwinkle flex items-center justify-center mb-4">
            <v-icon size="28" color="#788bff">mdi-account-search-outline</v-icon>
          </div>
          <p class="text-sm font-bold text-slate-600">بیمار مورد نظر را پیدا کنید</p>
          <p class="text-xs text-slate-400 mt-1.5 text-center max-w-xs leading-relaxed">
            برای جستجو، نام، نام خانوادگی، شماره تلفن یا کد ملی بیمار را وارد کنید
          </p>
        </div>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [patient: any]
}>()

const query = ref('')
const searchResults = ref<any[]>([])
const searching = ref(false)
const searched = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(query, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!newVal.trim()) {
    searchResults.value = []
    searched.value = false
    return
  }
  debounceTimer = setTimeout(() => {
    searchPatients()
  }, 400)
})

function handleManualSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (query.value.trim()) {
    searchPatients()
  }
}

async function searchPatients() {
  const q = query.value.trim()
  if (!q) return

  searching.value = true
  searched.value = true
  try {
    const res = await apiFetch<any>(`/api/patients/search?q=${encodeURIComponent(q)}`)
    searchResults.value = res.success ? res.data : []
  } catch {
    $toast.error('خطا در جستجوی بیماران')
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

function selectPatient(patient: any) {
  emit('select', patient)
  emit('update:modelValue', false)
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.search-field :deep(.v-field) {
  border-radius: 10px;
}
.search-field :deep(.v-field--focused) {
  box-shadow: 0 0 0 2px rgba(84, 101, 255, 0.12);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
