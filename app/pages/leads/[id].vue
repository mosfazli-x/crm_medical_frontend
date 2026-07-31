<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 pt-6 space-y-6">
    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <v-skeleton-loader type="heading" class="rounded-2xl" />
      <v-skeleton-loader type="image" class="rounded-2xl h-[400px]" />
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <v-icon icon="mdi-alert-circle-outline" size="x-large" class="text-red-400 mb-4" />
      <h2 class="text-xl font-bold text-slate-700 mb-2">{{ $t('leads.loadErrorTitle') }}</h2>
      <p class="text-slate-500 mb-6">{{ loadError }}</p>
      <v-btn variant="tonal" color="black" @click="fetchLead">تلاش مجدد</v-btn>
    </div>

    <template v-else-if="lead">
      <!-- Header -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-14 h-14 rounded-2xl bg-periwinkle text-electric-sapphire flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
              {{ lead.firstName?.charAt(0) }}{{ lead.lastName?.charAt(0) }}
            </div>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {{ lead.firstName }} {{ lead.lastName }}
                </h1>
                <span :class="badgeClass(lead.status)">{{ badgeLabel(lead.status) }}</span>
                <span :class="priorityClass(lead.priority)">{{ priorityLabel(lead.priority) }}</span>
              </div>
              <div class="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                <span v-if="lead.nationalId" class="font-mono tracking-wider">{{ lead.nationalId }}</span>
                <span v-if="lead.phone" class="w-1 h-1 bg-slate-300 rounded-full" />
                <span v-if="lead.phone" dir="ltr" class="font-mono">{{ lead.phone }}</span>
                <span v-if="lead.sourceName" class="w-1 h-1 bg-slate-300 rounded-full" />
                <span v-if="lead.sourceName" class="inline-flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: lead.sourceColor || '#CBD5E1' }"></span>
                  {{ lead.sourceName }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <v-btn variant="tonal" color="#4F46E5" size="small" class="rounded-lg" @click="openEditDialog">
              <v-icon size="16" class="mr-1">mdi-pencil-outline</v-icon>
              {{ $t('common.edit') }}
            </v-btn>

            <v-btn v-if="canConvert" variant="flat" color="#059669" size="small" class="rounded-lg" @click="openConvert">
              <v-icon size="16" class="mr-1">mdi-account-convert</v-icon>
              {{ $t('leads.convertAction') }}
            </v-btn>

            <v-btn v-if="canContact" variant="tonal" color="#3B82F6" size="small" class="rounded-lg" @click="openContact">
              <v-icon size="16" class="mr-1">mdi-phone-outline</v-icon>
              {{ $t('leads.contactAction') }}
            </v-btn>

            <v-menu v-if="transitionOptions.length" offset-y>
              <template #activator="{ props }">
                <v-btn v-bind="props" variant="tonal" color="#6B7280" size="small" class="rounded-lg">
                  <v-icon size="16" class="mr-1">mdi-swap-horizontal</v-icon>
                  {{ $t('leads.changeStatus') }}
                  <v-icon size="16">mdi-menu-down</v-icon>
                </v-btn>
              </template>
              <v-list density="compact" class="!py-1">
                <v-list-item v-for="s in transitionOptions" :key="s" @click="onTransition(s)">
                  <v-list-item-title>
                    <span :class="badgeClass(s)">{{ badgeLabel(s) }}</span>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

            <v-btn v-if="isAdmin" variant="tonal" color="red" size="small" class="rounded-lg" @click="confirmDelete">
              <v-icon size="16" class="mr-1">mdi-delete-outline</v-icon>
              {{ $t('common.delete') }}
            </v-btn>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400">
          <span class="flex items-center gap-1.5">
            <Clock class="w-4 h-4 fill-slate-400" />
            {{ $t('leads.lastActivityAt') }}: {{ formatJalaliDate(lead.lastActivityAt) }}
          </span>
          <span v-if="lead.nextFollowUpAt" class="flex items-center gap-1.5"
            :class="isFollowUpDue ? 'text-red-500 font-bold' : ''">
            <v-icon size="16">mdi-calendar-clock</v-icon>
            {{ $t('leads.nextFollowUpAt') }}: {{ formatJalaliDate(lead.nextFollowUpAt) }}
          </span>
          <span v-if="lead.convertedPatientId" class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <v-icon size="16">mdi-check-decagram</v-icon>
            {{ $t('leads.convertedLabel') }}: {{ formatJalaliDate(lead.conversionDate) }}
          </span>
          <span v-if="lead.status === 'lost'" class="flex items-center gap-1.5 text-red-500 font-bold">
            <v-icon size="16">mdi-close-octagon-outline</v-icon>
            {{ $t('leads.lostReasonLabel') }}: {{ lostReasonLabel(lead.lostReason || '') }}
          </span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
        <v-tabs v-model="activeTab" color="#4F46E5" bg-color="transparent" slider-color="#4F46E5">
          <v-tab value="info" class="text-sm font-medium tracking-wide">{{ $t('leads.tabs.info') }}</v-tab>
          <v-tab value="activities" class="text-sm font-medium tracking-wide">{{ $t('leads.tabs.activities') }}</v-tab>
          <v-tab value="notes" class="text-sm font-medium tracking-wide">{{ $t('leads.tabs.notes') }}</v-tab>
        </v-tabs>
        <v-divider />

        <div class="p-6">
          <v-window v-model="activeTab">
            <!-- Info -->
            <v-window-item value="info">
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="field in infoFields" :key="field.label" class="space-y-1">
                  <span class="crm-label mb-0!">{{ field.label }}</span>
                  <p class="text-slate-800 dark:text-slate-100 font-medium text-sm" :class="field.ltr ? 'crm-ltr text-left!' : ''">
                    {{ field.value }}
                  </p>
                </div>
              </div>
            </v-window-item>

            <!-- Activities -->
            <v-window-item value="activities">
              <div v-if="!lead.activities?.length" class="py-12 text-center text-slate-400 text-sm">
                {{ $t('leads.noActivities') }}
              </div>
              <div v-else class="relative space-y-0">
                <div v-for="(activity, i) in sortedActivities" :key="activity.id" class="relative flex gap-4 pb-8 last:pb-0">
                  <div class="flex flex-col items-center shrink-0">
                    <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0" :class="activityIconClass(activity.type)">
                      <v-icon size="18">{{ activityIcon(activity.type) }}</v-icon>
                    </div>
                    <div v-if="i < sortedActivities.length - 1" class="w-px flex-1 bg-slate-200 dark:bg-slate-600 my-2"></div>
                  </div>
                  <div class="pt-1 min-w-0">
                    <p class="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {{ activityLabel(activity.type) }}
                      <span v-if="activity.newStatus" class="mr-2">
                        <span :class="badgeClass(activity.newStatus)">{{ badgeLabel(activity.newStatus) }}</span>
                      </span>
                    </p>
                    <p v-if="activity.note" class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ activity.note }}</p>
                    <p class="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span>{{ formatJalaliDate(activity.createdAt) }}</span>
                      <span v-if="activity.performedByName">• {{ activity.performedByName }}</span>
                    </p>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- Notes -->
            <v-window-item value="notes">
              <div class="flex flex-col-reverse md:flex-row gap-8">
                <div class="flex-1 min-w-0">
                  <div v-if="!lead.notes?.length" class="py-12 text-center text-slate-400 text-sm">
                    {{ $t('leads.noNotes') }}
                  </div>
                  <div v-else class="space-y-5">
                    <div v-for="note in lead.notes" :key="note.id"
                      class="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-bold text-slate-500 dark:text-slate-400">{{ note.authorName || '-' }}</span>
                        <span class="text-xs text-slate-400">{{ formatJalaliDate(note.createdAt) }}</span>
                      </div>
                      <p class="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{{ note.body }}</p>
                    </div>
                  </div>
                </div>

                <div class="md:w-80 shrink-0">
                  <label class="crm-label">{{ $t('leads.addNoteTitle') }}</label>
                  <v-textarea v-model="newNote" variant="outlined" density="comfortable" rows="4"
                    :placeholder="$t('leads.notePlaceholder')" hide-details="auto" bg-color="white" rounded="lg" />
                  <div class="mt-3 flex justify-end">
                    <button class="crm-btn crm-btn-accent text-sm!" :disabled="noteSaving || !newNote.trim()"
                      @click="submitNote">
                      {{ noteSaving ? $t('common.saving') : $t('leads.addNote') }}
                    </button>
                  </div>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </div>
      </div>
    </template>

    <LeadFormDialog />
  </div>

  <!-- Lost dialog -->
  <v-dialog v-model="lostDialog" max-width="520">
    <v-card class="rounded-2xl">
      <v-card-title class="text-lg font-bold! text-slate-800 dark:text-slate-100 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        {{ $t('leads.lostDialogTitle') }}
      </v-card-title>
      <v-card-text class="px-6 py-6 space-y-4">
        <div>
          <label class="crm-label">{{ $t('leads.lostReason') }} <span class="text-red-500">*</span></label>
          <v-select v-model="lostReason" variant="outlined" density="comfortable" hide-details="auto" bg-color="white"
            rounded="lg" :items="lostReasonOptions" item-title="title" item-value="value" />
        </div>
        <div>
          <label class="crm-label">{{ $t('leads.note') }}</label>
          <v-textarea v-model="lostNote" variant="outlined" density="comfortable" rows="3"
            hide-details="auto" bg-color="white" rounded="lg" />
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700 gap-3">
        <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium" :disabled="actionSaving"
          @click="lostDialog = false">{{ $t('common.cancel') }}</v-btn>
        <v-spacer />
        <v-btn variant="flat" color="red" size="large" :loading="actionSaving" class="px-8 font-bold rounded-lg"
          @click="submitLost">{{ $t('leads.confirmLost') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Contact dialog -->
  <v-dialog v-model="contactDialog" max-width="520">
    <v-card class="rounded-2xl">
      <v-card-title class="text-lg font-bold! text-slate-800 dark:text-slate-100 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        {{ $t('leads.contactDialogTitle') }}
      </v-card-title>
      <v-card-text class="px-6 py-6">
        <label class="crm-label">{{ $t('leads.note') }}</label>
        <v-textarea v-model="contactNote" variant="outlined" density="comfortable" rows="3"
          :placeholder="$t('leads.contactNotePlaceholder')" hide-details="auto" bg-color="white" rounded="lg" />
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700 gap-3">
        <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium" :disabled="actionSaving"
          @click="contactDialog = false">{{ $t('common.cancel') }}</v-btn>
        <v-spacer />
        <v-btn variant="flat" color="#3B82F6" size="large" :loading="actionSaving" class="px-8 font-bold rounded-lg"
          @click="submitContact">{{ $t('leads.confirmContact') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Convert dialog -->
  <v-dialog v-model="convertDialog" max-width="640">
    <v-card class="rounded-2xl">
      <v-card-title class="text-lg font-bold! text-slate-800 dark:text-slate-100 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
        {{ $t('leads.convertDialogTitle') }}
      </v-card-title>
      <v-card-text class="px-6 py-6">
        <div class="crm-info-box mb-5">
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {{ $t('leads.convertDialogHint') }}
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="md:col-span-2">
            <label class="crm-label">{{ $t('leads.nationalId') }}</label>
            <v-text-field v-model="convertForm.nationalId" variant="outlined" density="comfortable" dir="ltr"
              class="text-left!" hide-details="auto" bg-color="white" rounded="lg"
              :rules="[v => !v || /^\d{10}$/.test(v) || t('leads.nationalIdDigits')]" />
          </div>
          <div>
            <label class="crm-label">{{ $t('leads.insuranceCode') }}</label>
            <v-text-field v-model="convertForm.insuranceCode" variant="outlined" density="comfortable" dir="ltr"
              class="text-left!" hide-details="auto" bg-color="white" rounded="lg" />
          </div>
          <div>
            <label class="crm-label">{{ $t('leads.insuranceType') }}</label>
            <v-text-field v-model="convertForm.insuranceType" variant="outlined" density="comfortable"
              hide-details="auto" bg-color="white" rounded="lg" />
          </div>
          <div>
            <label class="crm-label">{{ $t('leads.birthDate') }}</label>
            <v-text-field v-model="convertForm.birthDate" variant="outlined" density="comfortable" type="date"
              hide-details="auto" bg-color="white" rounded="lg" />
          </div>
          <div>
            <label class="crm-label">{{ $t('leads.maritalStatus') }}</label>
            <v-text-field v-model="convertForm.maritalStatus" variant="outlined" density="comfortable"
              hide-details="auto" bg-color="white" rounded="lg" />
          </div>
          <div class="md:col-span-2">
            <label class="crm-label">{{ $t('leads.address') }}</label>
            <v-textarea v-model="convertForm.address" variant="outlined" density="comfortable" rows="2"
              hide-details="auto" bg-color="white" rounded="lg" />
          </div>
          <div class="md:col-span-2">
            <label class="crm-label">{{ $t('leads.note') }}</label>
            <v-textarea v-model="convertForm.note" variant="outlined" density="comfortable" rows="2"
              hide-details="auto" bg-color="white" rounded="lg" />
          </div>
        </div>
      </v-card-text>
      <v-card-actions class="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700 gap-3">
        <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium" :disabled="actionSaving"
          @click="convertDialog = false">{{ $t('common.cancel') }}</v-btn>
        <v-spacer />
        <v-btn variant="flat" color="#059669" size="large" :loading="actionSaving" class="px-8 font-bold rounded-lg"
          @click="submitConvert">{{ $t('leads.confirmConvert') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import Clock from '~/components/icons/Clock.vue'
import LeadFormDialog from '~/components/LeadFormDialog.vue'
import { useLeads } from '~/composables/useLeads'
import { useLeadFormDialog } from '~/composables/useLeadFormDialog'
import { useEventBus } from '~/composables/useEventBus'
import { useStatusBadge } from '~/composables/useStatusBadge'
import { LEAD_LOST_REASONS, type LeadDetail, type LeadStatus } from '~/types/lead'

const { t } = useI18n()
const route = useRoute()
const { apiFetch } = useApi()
const { getLead, changeStatus, markLost, recordContact, addNote, convertLead, deleteLead } = useLeads()
const { openEdit: openDialogEdit } = useLeadFormDialog()
const { emit } = useEventBus()
const { $toast } = useNuxtApp()
const { user } = useAuth()
const { formatJalaliDate } = useFormatting()
const {
  badgeClass, badgeLabel, priorityClass, priorityLabel,
  lostReasonLabel, sourceTypeLabel,
} = useStatusBadge()

const leadId = computed(() => String(route.params.id))
const lead = ref<LeadDetail | null>(null)
const loading = ref(true)
const loadError = ref('')
const activeTab = ref('info')
const actionSaving = ref(false)
const noteSaving = ref(false)
const newNote = ref('')

const lostDialog = ref(false)
const lostReason = ref<string>('')
const lostNote = ref('')
const contactDialog = ref(false)
const contactNote = ref('')
const convertDialog = ref(false)

const convertForm = reactive({
  nationalId: '',
  insuranceCode: '',
  insuranceType: '',
  birthDate: '',
  address: '',
  maritalStatus: '',
  note: '',
})

const TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['qualified', 'lost'],
  qualified: ['appointment_booked', 'lost'],
  appointment_booked: ['visited', 'lost'],
  visited: ['lost'],
  lost: ['new', 'contacted', 'qualified', 'appointment_booked', 'visited'],
  converted: [],
}

const isAdmin = computed(() => {
  const role = user?.value?.role || (user as any)?.role
  return role === 'admin_doctor'
})

const transitionOptions = computed<LeadStatus[]>(() => {
  if (!lead.value) return []
  return TRANSITIONS[lead.value.status] || []
})

const canContact = computed(() => {
  if (!lead.value) return false
  return !['converted', 'lost'].includes(lead.value.status)
})

const canConvert = computed(() => {
  if (!lead.value) return false
  return lead.value.status === 'visited' || lead.value.status === 'appointment_booked'
})

const sortedActivities = computed(() => {
  if (!lead.value?.activities) return []
  return [...lead.value.activities].reverse()
})

const isFollowUpDue = computed(() => {
  if (!lead.value?.nextFollowUpAt) return false
  if (lead.value.status === 'converted' || lead.value.status === 'lost') return false
  return new Date(lead.value.nextFollowUpAt) < new Date()
})

const lostReasonOptions = LEAD_LOST_REASONS.map((r) => ({ value: r, title: lostReasonLabel(r) }))

const infoFields = computed(() => {
  if (!lead.value) return []
  const l = lead.value
  return [
    { label: t('leads.source'), value: l.sourceName || '-', ltr: false },
    { label: t('leads.sourceType'), value: l.sourceType ? sourceTypeLabel(l.sourceType) : '-', ltr: false },
    { label: t('leads.campaignName'), value: l.campaignName || '-', ltr: false },
    { label: t('leads.utmSource'), value: l.utmSource || '-', ltr: true },
    { label: t('leads.utmMedium'), value: l.utmMedium || '-', ltr: true },
    { label: t('leads.utmCampaign'), value: l.utmCampaign || '-', ltr: true },
    { label: t('leads.landingUrl'), value: l.landingUrl || '-', ltr: true },
    { label: t('leads.referrerUrl'), value: l.referrerUrl || '-', ltr: true },
    { label: t('leads.expectedService'), value: l.expectedServiceName || '-', ltr: false },
    { label: t('leads.expectedVisitType'), value: l.expectedVisitTypeName || '-', ltr: false },
    { label: t('leads.expectedValue'), value: l.expectedValue !== null && l.expectedValue !== undefined ? `${formatPriceValue(l.expectedValue)}` : '-', ltr: false },
    { label: t('leads.priority'), value: priorityLabel(l.priority), ltr: false },
    { label: t('leads.assignedStaff'), value: l.assignedStaffName || '-', ltr: false },
    { label: t('leads.assignedDoctor'), value: l.assignedDoctorName || '-', ltr: false },
    { label: t('leads.firstContactAt'), value: formatJalaliDate(l.firstContactAt), ltr: false },
    { label: t('leads.lastContactAt'), value: formatJalaliDate(l.lastContactAt), ltr: false },
    { label: t('leads.createdAt'), value: formatJalaliDate(l.createdAt), ltr: false },
    { label: t('leads.updatedAt'), value: formatJalaliDate(l.updatedAt), ltr: false },
    { label: t('leads.marketingConsent'), value: l.marketingConsent ? t('common.active') : t('common.inactive'), ltr: false },
    { label: t('leads.note'), value: l.note || '-', ltr: false },
  ]
})

function formatPriceValue(value: number | string) {
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (Number.isNaN(num)) return '0'
  return num.toLocaleString('fa-IR')
}

const activityMeta: Record<string, { icon: string; cls: string }> = {
  created: { icon: 'mdi-plus-circle-outline', cls: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20' },
  contacted: { icon: 'mdi-phone-outline', cls: 'bg-blue-50 text-blue-500 dark:bg-blue-500/20' },
  note_added: { icon: 'mdi-note-text-outline', cls: 'bg-slate-100 text-slate-500 dark:bg-slate-600/30' },
  status_changed: { icon: 'mdi-swap-horizontal', cls: 'bg-purple-50 text-purple-500 dark:bg-purple-500/20' },
  assigned: { icon: 'mdi-account-multiple-outline', cls: 'bg-teal-50 text-teal-500 dark:bg-teal-500/20' },
  qualified: { icon: 'mdi-star-outline', cls: 'bg-amber-50 text-amber-500 dark:bg-amber-500/20' },
  appointment_booked: { icon: 'mdi-calendar-check-outline', cls: 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20' },
  visit_completed: { icon: 'mdi-hospital-box-outline', cls: 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/20' },
  converted: { icon: 'mdi-check-decagram', cls: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20' },
  lost: { icon: 'mdi-close-octagon-outline', cls: 'bg-red-50 text-red-500 dark:bg-red-500/20' },
}

function activityIcon(type: string) {
  return activityMeta[type]?.icon || 'mdi-circle-small'
}

function activityIconClass(type: string) {
  return activityMeta[type]?.cls || 'bg-slate-100 text-slate-500'
}

function activityLabel(type: string) {
  const key = `leads.activityTypes.${type}`
  const translated = t(key)
  return translated !== key ? translated : type
}

async function fetchLead() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await getLead(leadId.value)
    if (res.success) {
      lead.value = res.data
      if (res.data.sourceId) {
        try {
          const src = await apiFetch<{ success: boolean; data: any[] }>('/api/lead-sources')
          if (src.success) {
            const found = src.data.find((s) => s.id === res.data.sourceId)
            if (found) lead.value = { ...res.data, sourceColor: found.color }
          }
        } catch {
          // silent
        }
      }
    } else {
      loadError.value = t('leads.loadError')
    }
  } catch {
    loadError.value = t('leads.loadError')
  } finally {
    loading.value = false
  }
}

function openEditDialog() {
  openDialogEdit(leadId.value, lead.value)
}

function openContact() {
  contactNote.value = ''
  contactDialog.value = true
}

async function onTransition(status: LeadStatus) {
  if (status === 'lost') {
    lostReason.value = ''
    lostNote.value = ''
    lostDialog.value = true
    return
  }
  actionSaving.value = true
  try {
    const res = await changeStatus(leadId.value, status)
    if (res.success) {
      $toast.success(t('leads.statusChanged'))
      await fetchLead()
      emit('lead:changed')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.actionError'))
  } finally {
    actionSaving.value = false
  }
}

async function submitLost() {
  if (!lostReason.value) {
    $toast.error(t('leads.lostReasonRequired'))
    return
  }
  actionSaving.value = true
  try {
    const res = await markLost(leadId.value, lostReason.value, lostNote.value.trim() || undefined)
    if (res.success) {
      $toast.success(t('leads.lostSuccess'))
      lostDialog.value = false
      await fetchLead()
      emit('lead:changed')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.actionError'))
  } finally {
    actionSaving.value = false
  }
}

async function submitContact() {
  actionSaving.value = true
  try {
    const res = await recordContact(leadId.value, contactNote.value.trim() || undefined)
    if (res.success) {
      $toast.success(t('leads.contactSuccess'))
      contactDialog.value = false
      await fetchLead()
      emit('lead:changed')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.actionError'))
  } finally {
    actionSaving.value = false
  }
}

async function submitNote() {
  if (!newNote.value.trim()) return
  noteSaving.value = true
  try {
    await addNote(leadId.value, newNote.value.trim())
    newNote.value = ''
    $toast.success(t('leads.noteAdded'))
    await fetchLead()
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.noteError'))
  } finally {
    noteSaving.value = false
  }
}

function openConvert() {
  convertForm.nationalId = lead.value?.nationalId || ''
  convertForm.insuranceCode = ''
  convertForm.insuranceType = ''
  convertForm.birthDate = ''
  convertForm.address = ''
  convertForm.maritalStatus = ''
  convertForm.note = ''
  convertDialog.value = true
}

async function submitConvert() {
  if (convertForm.nationalId && !/^\d{10}$/.test(convertForm.nationalId)) {
    $toast.error(t('leads.nationalIdDigits'))
    return
  }
  actionSaving.value = true
  try {
    const body: Record<string, unknown> = {}
    if (convertForm.nationalId) body.nationalId = convertForm.nationalId
    if (convertForm.insuranceCode) body.insuranceCode = convertForm.insuranceCode
    if (convertForm.insuranceType) body.insuranceType = convertForm.insuranceType
    if (convertForm.birthDate) body.birthDate = convertForm.birthDate
    if (convertForm.address) body.address = convertForm.address
    if (convertForm.maritalStatus) body.maritalStatus = convertForm.maritalStatus
    if (convertForm.note) body.note = convertForm.note

    const res = await convertLead(leadId.value, body)
    if (res.success) {
      $toast.success(res.data.patientCreated ? t('leads.convertSuccess') : t('leads.convertLinked'))
      convertDialog.value = false
      await fetchLead()
      emit('lead:changed')
      emit('patient:changed')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.convertError'))
  } finally {
    actionSaving.value = false
  }
}

async function confirmDelete() {
  if (!lead.value) return
  if (!confirm(t('leads.deleteConfirm', { name: `${lead.value.firstName} ${lead.value.lastName}` }))) return
  try {
    const res = await deleteLead(leadId.value)
    if (res.success) {
      $toast.success(t('leads.deleteSuccess'))
      emit('lead:changed')
      await navigateTo('/leads')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.deleteError'))
  }
}

onMounted(() => {
  fetchLead()
})

watch(
  () => route.params.id,
  () => fetchLead()
)

useSeoMeta({ title: () => lead.value ? `${lead.value.firstName} ${lead.value.lastName}` : t('leads.titleSeo') })
</script>
