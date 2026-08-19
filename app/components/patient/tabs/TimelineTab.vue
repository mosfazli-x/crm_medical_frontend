<template>
  <div class="space-y-5">
    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-2">
      <v-chip
        v-for="filter in typeFilters"
        :key="filter.value"
        :variant="activeTypes.includes(filter.value) ? 'flat' : 'outlined'"
        :color="activeTypes.includes(filter.value) ? filter.color : 'grey'"
        size="small"
        class="rounded-lg cursor-pointer transition-all"
        @click="toggleType(filter.value)"
      >
        {{ filter.label }}
      </v-chip>
      <v-chip
        v-if="activeTypes.length > 0"
        variant="text"
        color="red"
        size="small"
        class="rounded-lg cursor-pointer"
        @click="activeTypes = []"
      >
        پاک کردن فیلترها
      </v-chip>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <v-skeleton-loader v-for="i in 5" :key="i" type="list-item-three-line" class="rounded-xl" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-12">
      <v-icon icon="mdi-timeline-text-outline" size="64" class="text-slate-300 mb-4" />
      <p class="text-slate-500 text-sm">رویدادی یافت نشد</p>
    </div>

    <!-- Timeline -->
    <div v-else class="relative">
      <!-- Vertical line -->
      <div class="absolute right-5 top-0 bottom-0 w-0.5 bg-slate-200" />

      <div class="space-y-1">
        <div v-for="(event, idx) in filteredEvents" :key="event.id + '-' + idx" class="relative flex gap-4 group">
          <!-- Dot -->
          <div class="relative z-10 flex-shrink-0 mt-1">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border-2 border-white transition-transform group-hover:scale-110"
              :style="{ backgroundColor: event.color + '18', borderColor: event.color }"
            >
              <v-icon :icon="getEventIcon(event.type)" size="18" :color="event.color" />
            </div>
          </div>

          <!-- Card -->
          <div
            class="flex-1 bg-white border border-slate-100 rounded-xl p-4 mb-2 hover:shadow-md transition-all cursor-default group-hover:border-slate-200"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="inline-block w-2 h-2 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: event.color }"
                  />
                  <h4 class="text-sm font-bold text-slate-800 truncate">{{ event.title }}</h4>
                </div>
                <p v-if="event.summary" class="text-xs text-slate-500 leading-relaxed line-clamp-2">{{ event.summary }}</p>

                <!-- Details (expandable) -->
                <div v-if="event.details && Object.keys(event.details).length > 0" class="mt-2">
                  <v-btn
                    variant="text"
                    size="x-small"
                    color="grey"
                    class="!px-0 !text-xs"
                    @click="toggleDetails(event.id)"
                  >
                    {{ expandedIds.has(event.id) ? 'بستن' : 'جزئیات' }}
                  </v-btn>
                  <div v-if="expandedIds.has(event.id)" class="mt-2 bg-slate-50 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                    <div v-for="(val, key) in event.details" :key="key" class="flex gap-2">
                      <span class="font-medium text-slate-700 min-w-[80px]">{{ formatDetailKey(key) }}:</span>
                      <span>{{ formatDetailValue(val) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Date -->
              <div class="text-left flex-shrink-0">
                <span class="text-[11px] text-slate-400 whitespace-nowrap">{{ formatDate(event.date) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Note FAB -->
    <div class="flex justify-start pt-2">
      <v-btn
        color="#F97316"
        variant="flat"
        rounded="lg"
        size="small"
        class="!text-white shadow-md"
        @click="showNoteDialog = true"
      >
        <v-icon icon="mdi-plus" size="18" class="mr-1" />
        یادداشت جدید
      </v-btn>
    </div>

    <!-- Add Note Dialog -->
    <v-dialog v-model="showNoteDialog" max-width="500" persistent>
      <v-card class="rounded-2xl">
        <v-card-title class="text-sm font-bold pa-5 pb-2">یادداشت جدید</v-card-title>
        <v-card-text class="pa-5 pt-0">
          <v-textarea
            v-model="newNote.content"
            label="متن یادداشت"
            rows="4"
            variant="outlined"
            density="comfortable"
            class="rounded-xl"
          />
          <v-select
            v-model="newNote.eventType"
            :items="noteEventTypeOptions"
            item-title="label"
            item-value="value"
            label="نوع رویداد (اختیاری)"
            variant="outlined"
            density="comfortable"
            clearable
            class="rounded-xl mt-2"
          />
          <v-text-field
            v-model="newNote.eventDate"
            label="تاریخ رویداد (اختیاری)"
            type="date"
            variant="outlined"
            density="comfortable"
            class="rounded-xl mt-2"
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-0">
          <v-spacer />
          <v-btn variant="text" size="small" @click="showNoteDialog = false">لغو</v-btn>
          <v-btn
            color="#F97316"
            variant="flat"
            size="small"
            :loading="savingNote"
            :disabled="!newNote.content.trim()"
            @click="saveNote"
          >
            ذخیره
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface TimelineEvent {
  id: string
  type: string
  date: string | null
  title: string
  summary: string
  details: Record<string, any>
  color: string
  icon: string
}

const props = defineProps<{
  patientId: string
}>()

const { apiFetch } = useApi()
const { t } = useI18n()
const $toast = useNuxtApp().$toast

const loading = ref(true)
const events = ref<TimelineEvent[]>([])
const activeTypes = ref<string[]>([])
const expandedIds = ref<Set<string>>(new Set())
const showNoteDialog = ref(false)
const savingNote = ref(false)

const newNote = ref({
  content: '',
  eventType: null as string | null,
  eventDate: '',
})

const typeFilters = [
  { value: 'visit', label: 'ویزیت', color: '#4F46E5' },
  { value: 'appointment', label: 'نوبت', color: '#7C3AED' },
  { value: 'prescription', label: 'نسخه', color: '#059669' },
  { value: 'lab_result', label: 'آزمایش', color: '#2563EB' },
  { value: 'screening', label: 'غربالگری', color: '#D97706' },
  { value: 'vaccination', label: 'واکسن', color: '#10B981' },
  { value: 'pregnancy', label: 'بارداری', color: '#EC4899' },
  { value: 'assessment', label: 'ارزیابی', color: '#8B5CF6' },
  { value: 'billing', label: 'صورتحساب', color: '#F59E0B' },
  { value: 'vital_signs', label: 'علائم حیاتی', color: '#EF4444' },
  { value: 'note', label: 'یادداشت', color: '#F97316' },
  { value: 'daily_report', label: 'گزارش', color: '#374151' },
  { value: 'disease', label: 'بیماری', color: '#B91C1C' },
  { value: 'medication', label: 'دارو', color: '#15803D' },
  { value: 'allergy', label: 'آلرژی', color: '#DC2626' },
]

const noteEventTypeOptions = [
  { value: 'clinical_note', label: 'یادداشت بالینی' },
  { value: 'follow_up', label: 'پیگیری' },
  { value: 'observation', label: 'مشاهده' },
  { value: 'instruction', label: 'دستور' },
]

const filteredEvents = computed(() => {
  if (activeTypes.value.length === 0) return events.value
  return events.value.filter(e => activeTypes.value.includes(e.type))
})

function toggleType(type: string) {
  const idx = activeTypes.value.indexOf(type)
  if (idx >= 0) {
    activeTypes.value.splice(idx, 1)
  } else {
    activeTypes.value.push(type)
  }
}

function toggleDetails(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    visit: 'mdi-stethoscope',
    appointment: 'mdi-calendar-clock',
    prescription: 'mdi-pill',
    lab_result: 'mdi-flask',
    lab_order: 'mdi-clipboard-list',
    screening: 'mdi-shield-check',
    screening_result: 'mdi-clipboard-check',
    pregnancy: 'mdi-baby-face-outline',
    vaccination: 'mdi-needle',
    assessment: 'mdi-clipboard-search',
    billing: 'mdi-wallet-outline',
    message: 'mdi-chat-outline',
    daily_report: 'mdi-file-text-outline',
    vital_signs: 'mdi-heart-pulse',
    note: 'mdi-note-text-outline',
    disease: 'mdi-alert-circle-outline',
    medication: 'mdi-pill',
    allergy: 'mdi-alert-triangle-outline',
  }
  return icons[type] || 'mdi-circle-outline'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatDetailKey(key: string): string {
  const map: Record<string, string> = {
    visitType: 'نوع ویزیت', status: 'وضعیت', duration: 'مدت', nextVisit: 'ویزیت بعدی',
    dosage: 'دوز', frequency: 'تعداد', route: 'مسیر', instructions: 'دستورات',
    isActive: 'فعال', testName: 'نام آزمایش', value: 'مقدار', unit: 'واحد',
    referenceRangeLow: 'حد پایین', referenceRangeHigh: 'حد بالا', isAbnormal: 'غیرعادی',
    category: 'دسته', notes: 'یادداشت', screeningType: 'نوع غربالگری',
    gravidaIndex: 'شماره بارداری', outcome: 'نتیجه', deliveryMethod: 'نحوه زایمان',
    lmp: 'اولین روز آخرین قاعدگی', edd: 'تاریخ زایمان محتمل',
    vaccineName: 'نام واکسن', doseNumber: 'شماره دوز', manufacturer: 'سازنده',
    lotNumber: 'شماره لات', nextDoseDate: 'تاریخ دوز بعدی',
    assessmentType: 'نوع ارزیابی', result: 'نتیجه',
    amount: 'مبلغ', insuranceClaimAmount: 'مبلغ بیمه', patientPayAmount: 'مبلغ پرداختی',
    subject: 'موضوع', isRead: 'خوانده شده', isConfidential: 'محرمانه',
    visitTypes: 'انواع ویزیت', procedures: 'روش‌ها', feeCollected: 'هزینه دریافتی',
    paymentMethod: 'نحوه پرداخت',
    systolicBp: 'فشار سیستولیک', diastolicBp: 'فشار دیاستولیک',
    heartRate: 'ضربان قلب', respiratoryRate: 'تنفس', temperature: 'دمای بدن',
    oxygenSaturation: 'اکسیژن خون', weight: 'وزن', height: 'قد', bmi: 'شاخص توده بدنی',
    eventType: 'نوع رویداد', doctorName: 'نام پزشک',
    name: 'نام', substance: 'ماده', severity: 'شدت',
    dosage: 'دوز', resultDetails: 'جزئیات نتیجه', nextDueDate: 'تاریخ بعدی',
  }
  return map[key] || key
}

function formatDetailValue(val: any): string {
  if (val === null || val === undefined) return '-'
  if (typeof val === 'boolean') return val ? 'بله' : 'خیر'
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

async function fetchTimeline() {
  loading.value = true
  try {
    const res = await apiFetch(`/api/patients/${props.patientId}/timeline`)
    if (res.success) {
      events.value = res.data.events
    }
  } catch (err: any) {
    console.error('Failed to fetch timeline:', err)
  } finally {
    loading.value = false
  }
}

async function saveNote() {
  if (!newNote.value.content.trim()) return
  savingNote.value = true
  try {
    await apiFetch(`/api/patient-notes/patient/${props.patientId}`, {
      method: 'POST',
      body: {
        content: newNote.value.content,
        eventType: newNote.value.eventType || undefined,
        eventDate: newNote.value.eventDate || undefined,
      },
    })
    $toast.success('یادداشت ذخیره شد')
    showNoteDialog.value = false
    newNote.value = { content: '', eventType: null, eventDate: '' }
    await fetchTimeline()
  } catch (err: any) {
    $toast.error(err?.data?.error || 'خطا در ذخیره یادداشت')
  } finally {
    savingNote.value = false
  }
}

onMounted(() => {
  fetchTimeline()
})

watch(() => props.patientId, () => {
  if (props.patientId) fetchTimeline()
})
</script>
