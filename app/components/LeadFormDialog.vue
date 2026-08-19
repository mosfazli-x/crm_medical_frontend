<template>
  <v-dialog :model-value="isOpen" @update:model-value="val => !val && close()" max-width="900" persistent scrollable
    transition="dialog-bottom-transition" @keydown.esc="close">
    <v-card class="crm-dialog overflow-hidden!" elevation="0">
      <div class="crm-dialog-header">
        <div>
          <h2 class="crm-dialog-title text-xl!">
            {{ mode === 'edit' ? t('leads.editLead') : t('leads.newLead') }}
          </h2>
          <span class="text-xs text-slate-500 dark:text-slate-400 mt-1 block font-normal">
            {{ t('leads.dialogSubtitle') }}
          </span>
        </div>
        <v-btn icon variant="text" size="small" class="text-slate-400 hover:text-slate-800" @click="close">
          <CloseCircle class="w-6 h-6 fill-slate-600! dark:fill-slate-200!" />
        </v-btn>
      </div>

      <div class="px-8 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800!">
        <v-tabs v-model="activeTab" color="#4F46E5" bg-color="transparent" height="56">
          <v-tab value="basic" class="text-sm text-slate-700! dark:text-slate-300! font-medium">{{ t('leads.tabs.basic') }}</v-tab>
          <v-tab value="attribution" class="text-sm text-slate-700! dark:text-slate-300! font-medium">{{ t('leads.tabs.attribution') }}</v-tab>
          <v-tab value="details" class="text-sm text-slate-700! dark:text-slate-300! font-medium">{{ t('leads.tabs.details') }}</v-tab>
        </v-tabs>
      </div>

      <v-card-text class="p-8 bg-slate-50/30 dark:bg-slate-900/30">
        <v-window v-model="activeTab" class="overflow-visible">
          <v-window-item value="basic" transition="fade-transition">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="crm-label">{{ t('leads.firstName') }} <span class="text-red-500">*</span></label>
                <v-text-field v-model="form.firstName" variant="outlined" density="comfortable"
                  :placeholder="t('leads.firstNamePlaceholder')" hide-details="auto" bg-color="white" rounded="lg"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('firstName')"
                  :rules="[v => !!v?.trim() || t('leads.firstNameRequired')]" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.lastName') }} <span class="text-red-500">*</span></label>
                <v-text-field v-model="form.lastName" variant="outlined" density="comfortable"
                  :placeholder="t('leads.lastNamePlaceholder')" hide-details="auto" bg-color="white" rounded="lg"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('lastName')"
                  :rules="[v => !!v?.trim() || t('leads.lastNameRequired')]" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.phone') }}</label>
                <v-text-field v-model="form.phone" variant="outlined" density="comfortable" dir="ltr"
                  class="text-left!" hide-details="auto" bg-color="white" rounded="lg"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('phone')"
                  :rules="[v => !v || v.length <= 20 || t('leads.phoneMax')]" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.nationalId') }}</label>
                <v-text-field v-model="form.nationalId" variant="outlined" density="comfortable" dir="ltr"
                  class="text-left!" hide-details="auto" bg-color="white" rounded="lg"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('nationalId', true)"
                  :rules="[v => !v || v.length <= 10 || t('leads.nationalIdMax')]" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.source') }}</label>
                <v-select v-model="form.sourceId" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="sourceOptions" item-title="title" item-value="id" clearable
                  :placeholder="t('leads.sourcePlaceholder')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.campaignName') }}</label>
                <v-text-field v-model="form.campaignName" variant="outlined" density="comfortable"
                  :placeholder="t('leads.campaignPlaceholder')" hide-details="auto" bg-color="white" rounded="lg"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('campaignName')" />
              </div>
              <div class="md:col-span-2">
                <label class="crm-label">{{ t('leads.note') }}</label>
                <v-textarea v-model="form.note" variant="outlined" density="comfortable" rows="3"
                  :placeholder="t('leads.notePlaceholder')" hide-details="auto" bg-color="white" rounded="lg"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('note')" />
              </div>
            </div>
          </v-window-item>

          <v-window-item value="attribution" transition="fade-transition">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="crm-label">{{ t('leads.utmSource') }}</label>
                <v-text-field v-model="form.utmSource" variant="outlined" density="comfortable" dir="ltr"
                  class="text-left!" hide-details="auto" bg-color="white" rounded="lg" placeholder="google / instagram"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('utmSource')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.utmMedium') }}</label>
                <v-text-field v-model="form.utmMedium" variant="outlined" density="comfortable" dir="ltr"
                  class="text-left!" hide-details="auto" bg-color="white" rounded="lg" placeholder="cpc / organic"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('utmMedium')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.utmCampaign') }}</label>
                <v-text-field v-model="form.utmCampaign" variant="outlined" density="comfortable" dir="ltr"
                  class="text-left!" hide-details="auto" bg-color="white" rounded="lg" placeholder="summer-sale"
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('utmCampaign')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.landingUrl') }}</label>
                <v-text-field v-model="form.landingUrl" variant="outlined" density="comfortable" dir="ltr"
                  class="text-left!" hide-details="auto" bg-color="white" rounded="lg" placeholder="https://..."
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('landingUrl')" />
              </div>
              <div class="md:col-span-2">
                <label class="crm-label">{{ t('leads.referrerUrl') }}</label>
                <v-text-field v-model="form.referrerUrl" variant="outlined" density="comfortable" dir="ltr"
                  class="text-left!" hide-details="auto" bg-color="white" rounded="lg" placeholder="https://..."
                  append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('referrerUrl')" />
              </div>
              <div class="md:col-span-2">
                <v-switch v-model="form.marketingConsent" color="#4F46E5" :label="t('leads.marketingConsent')"
                  hide-details />
              </div>
            </div>
          </v-window-item>

          <v-window-item value="details" transition="fade-transition">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="crm-label">{{ t('leads.expectedService') }}</label>
                <v-select v-model="form.expectedServiceId" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="serviceOptions" item-title="title" item-value="id" clearable
                  :placeholder="t('leads.expectedServicePlaceholder')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.expectedVisitType') }}</label>
                <v-select v-model="form.expectedVisitTypeId" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="visitTypeOptions" item-title="title" item-value="id" clearable
                  :placeholder="t('leads.expectedVisitTypePlaceholder')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.expectedValue') }}</label>
                <v-text-field v-model.number="form.expectedValue" variant="outlined" density="comfortable" type="number"
                  min="0" hide-details="auto" bg-color="white" rounded="lg"
                  :rules="[v => v === null || v === '' || v >= 0 || t('leads.expectedValueNegative')]" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.priority') }}</label>
                <v-select v-model="form.priority" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="priorityOptions" item-title="title" item-value="value" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.assignedStaff') }}</label>
                <v-select v-model="form.assignedStaffId" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="staffOptions" item-title="title" item-value="id" clearable
                  :placeholder="t('leads.assignedStaffPlaceholder')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.assignedDoctor') }}</label>
                <v-select v-model="form.assignedDoctorId" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="doctorOptions" item-title="title" item-value="id" clearable
                  :placeholder="t('leads.assignedDoctorPlaceholder')" />
              </div>
              <div>
                <label class="crm-label">{{ t('leads.nextFollowUpAt') }}</label>
                <v-text-field v-model="form.nextFollowUpAt" variant="outlined" density="comfortable" type="datetime-local"
                  hide-details="auto" bg-color="white" rounded="lg" />
              </div>
              <div class="md:col-span-2">
                <label class="crm-label">{{ t('leads.tags') }}</label>
                <v-text-field v-model="tagInput" variant="outlined" density="comfortable"
                  :placeholder="t('leads.tagsPlaceholder')" hide-details="auto" bg-color="white" rounded="lg"
                  @keydown="onTagKeydown">
                  <template #append-inner>
                    <v-btn icon size="small" variant="text" color="#4F46E5" @click="addTag">
                      <Plus class="w-4 h-4" />
                    </v-btn>
                  </template>
                </v-text-field>
                <div v-if="form.tags.length" class="flex flex-wrap gap-2 mt-3">
                  <span v-for="(tag, i) in form.tags" :key="tag"
                    class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                    {{ tag }}
                    <button type="button" class="hover:text-red-500 transition-colors" @click="removeTag(i)">
                      <v-icon size="14">mdi-close</v-icon>
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <v-card-actions class="crm-dialog-footer">
        <v-spacer />
        <button class="crm-btn crm-btn-ghost" @click="close">{{ t('common.cancel') }}</button>
        <button class="crm-btn crm-btn-accent" :disabled="loading" @click="submitForm">
          {{ loading ? t('common.saving') : (mode === 'edit' ? t('common.save') : t('leads.createLead')) }}
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric"
    @insert="applyHandwriting" />
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import Plus from '~/components/icons/Plus.vue'
import { useLeadFormDialog } from '~/composables/useLeadFormDialog'
import { useLeads } from '~/composables/useLeads'
import { useEventBus } from '~/composables/useEventBus'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import { LEAD_PRIORITIES } from '~/types/lead'

const { t } = useI18n()
const { isOpen, mode, leadId, leadData, close } = useLeadFormDialog()
const { $toast } = useNuxtApp()
const { createLead, updateLead, listSources } = useLeads()
const { emit } = useEventBus()
const { user } = useAuth()
const { apiFetch } = useApi()

const loading = ref(false)
const activeTab = ref('basic')
const tagInput = ref('')

const sources = ref<any[]>([])
const services = ref<any[]>([])
const visitTypes = ref<any[]>([])
const staff = ref<any[]>([])
const doctors = ref<any[]>([])

const sourceOptions = computed(() =>
  sources.value
    .filter((s) => s.isActive)
    .map((s) => ({ id: s.id, title: s.name }))
)
const serviceOptions = computed(() =>
  services.value.map((s) => ({ id: s.id, title: `${s.code} - ${s.description}` }))
)
const visitTypeOptions = computed(() =>
  visitTypes.value.map((v) => ({ id: v.id, title: v.name }))
)
const staffOptions = computed(() =>
  staff.value.map((s) => ({ id: s.id, title: s.fullName }))
)
const doctorOptions = computed(() =>
  doctors.value.map((d) => ({ id: d.id, title: d.fullName }))
)
const priorityOptions = LEAD_PRIORITIES.map((p) => ({
  value: p,
  title: t(`leadPriorities.${p}`),
}))

const defaultForm = () => ({
  firstName: '',
  lastName: '',
  phone: '',
  nationalId: '',
  sourceId: null as string | null,
  campaignName: '',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
  referrerUrl: '',
  landingUrl: '',
  priority: 'medium',
  tags: [] as string[],
  expectedServiceId: null as string | null,
  expectedVisitTypeId: null as string | null,
  expectedValue: null as number | null,
  assignedStaffId: null as string | null,
  assignedDoctorId: null as string | null,
  nextFollowUpAt: '',
  note: '',
  marketingConsent: false,
})

const form = reactive(defaultForm())

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      firstName: t('leads.firstName'),
      lastName: t('leads.lastName'),
      phone: t('leads.phone'),
      nationalId: t('leads.nationalId'),
      campaignName: t('leads.campaignName'),
      note: t('leads.note'),
      utmSource: t('leads.utmSource'),
      utmMedium: t('leads.utmMedium'),
      utmCampaign: t('leads.utmCampaign'),
      landingUrl: t('leads.landingUrl'),
      referrerUrl: t('leads.referrerUrl'),
    },
    target: form,
  })

const isAdmin = computed(() => {
  const role = user?.value?.role || (user as any)?.role
  return role === 'admin_doctor'
})

const userId = computed(() => user?.value?.id || (user as any)?.id)

function resetForm() {
  Object.assign(form, defaultForm())
  tagInput.value = ''
  activeTab.value = 'basic'
}

function addTag() {
  const tag = tagInput.value.trim()
  if (!tag) return
  if (form.tags.length >= 20) {
    $toast.error(t('leads.tagsMax'))
    return
  }
  if (!form.tags.includes(tag)) form.tags.push(tag)
  tagInput.value = ''
}

function removeTag(index: number) {
  form.tags.splice(index, 1)
}

function removeLastTag() {
  if (!tagInput.value && form.tags.length) form.tags.pop()
}

function onTagKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === 'Tab') {
    e.preventDefault()
    addTag()
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    removeLastTag()
  }
}

async function loadOptions() {
  try {
    const [sourcesRes, servicesRes, doctorsRes] = await Promise.all([
      listSources(),
      apiFetch<{ success: boolean; data: any[] }>('/api/billing/procedure-codes'),
      apiFetch<{ success: boolean; data: any[] }>('/api/users/doctors'),
    ])
    if (sourcesRes.success) sources.value = sourcesRes.data
    if (servicesRes.success) services.value = servicesRes.data
    if (doctorsRes.success) doctors.value = doctorsRes.data
  } catch {
    // silent – selects will simply be empty
  }

  if (userId.value) {
    try {
      const vtRes = await apiFetch<{ success: boolean; data: any[] }>(`/api/visit-types/${userId.value}`)
      if (vtRes.success) visitTypes.value = vtRes.data
    } catch {
      // silent
    }
  }

  if (isAdmin.value) {
    try {
      const staffRes = await apiFetch<{ success: boolean; data: any[] }>('/api/staff')
      if (staffRes.success) staff.value = staffRes.data
    } catch {
      // silent – staff select will be empty for non-admin
    }
  }
}

function fillEditData(data: any) {
  form.firstName = data.firstName || ''
  form.lastName = data.lastName || ''
  form.phone = data.phone || ''
  form.nationalId = data.nationalId || ''
  form.sourceId = data.sourceId || null
  form.campaignName = data.campaignName || ''
  form.utmSource = data.utmSource || ''
  form.utmMedium = data.utmMedium || ''
  form.utmCampaign = data.utmCampaign || ''
  form.referrerUrl = data.referrerUrl || ''
  form.landingUrl = data.landingUrl || ''
  form.priority = data.priority || 'medium'
  form.tags = Array.isArray(data.tags) ? [...data.tags] : []
  form.expectedServiceId = data.expectedServiceId || null
  form.expectedVisitTypeId = data.expectedVisitTypeId || null
  form.expectedValue = data.expectedValue !== null && data.expectedValue !== undefined
    ? Number(data.expectedValue)
    : null
  form.assignedStaffId = data.assignedStaffId || null
  form.assignedDoctorId = data.assignedDoctorId || null
  form.nextFollowUpAt = data.nextFollowUpAt ? toLocalInput(data.nextFollowUpAt) : ''
  form.note = data.note || ''
  form.marketingConsent = !!data.marketingConsent
}

function toLocalInput(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(isOpen, (open) => {
  if (open) {
    resetForm()
    loadOptions()
    if (mode.value === 'edit' && leadData.value) fillEditData(leadData.value)
  }
})

async function submitForm() {
  if (!form.firstName.trim() || !form.lastName.trim()) {
    $toast.error(t('leads.requiredFieldsError'))
    activeTab.value = 'basic'
    return
  }

  loading.value = true
  try {
    const body: Record<string, unknown> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
      nationalId: form.nationalId.trim() || undefined,
      sourceId: form.sourceId || undefined,
      campaignName: form.campaignName.trim() || undefined,
      utmSource: form.utmSource.trim() || undefined,
      utmMedium: form.utmMedium.trim() || undefined,
      utmCampaign: form.utmCampaign.trim() || undefined,
      referrerUrl: form.referrerUrl.trim() || undefined,
      landingUrl: form.landingUrl.trim() || undefined,
      priority: form.priority,
      tags: form.tags.length ? form.tags : undefined,
      expectedServiceId: form.expectedServiceId || undefined,
      expectedVisitTypeId: form.expectedVisitTypeId || undefined,
      expectedValue: form.expectedValue !== null ? form.expectedValue : undefined,
      assignedStaffId: form.assignedStaffId || undefined,
      assignedDoctorId: form.assignedDoctorId || undefined,
      nextFollowUpAt: form.nextFollowUpAt || undefined,
      note: form.note.trim() || undefined,
      marketingConsent: form.marketingConsent,
    }

    if (mode.value === 'edit' && leadId.value) {
      await updateLead(leadId.value, body)
      $toast.success(t('leads.updatedSuccess'))
    } else {
      await createLead(body)
      $toast.success(t('leads.createdSuccess'))
    }

    close()
    emit('lead:changed')
  } catch (err: any) {
    $toast.error(err.data?.error || t('leads.saveError'))
  } finally {
    loading.value = false
  }
}
</script>
