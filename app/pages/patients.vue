<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('patients.title')" :subtitle="$t('patients.subtitle')">
      <template #actions>
        <AddNewPatientButton />
        <PatientFormDialog />
      </template>
    </UiPageHeader>

    <UiContentCard>
      <div class="crm-table-wrap">
        <table class="crm-table">
          <thead>
            <tr>
              <th>{{ $t('patients.fullName') }}</th>
              <th>{{ $t('patients.nationalId') }}</th>
              <th>{{ $t('patients.phone') }}</th>
              <th>{{ $t('patients.birthDate') }}</th>
              <th>{{ $t('patients.maritalStatus') }}</th>
              <th>{{ $t('patients.registrationDate') }}</th>
              <th class="text-center!">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading" v-for="i in 5" :key="`skeleton-${i}`">
              <td colspan="7" class="p-4!">
                <v-skeleton-loader type="list-item" class="bg-transparent!" />
              </td>
            </tr>

            <tr v-else-if="!patients.length">
              <td colspan="7">
                <UiEmptyState :title="$t('patients.noPatients')">
                  <template #icon>
                    <v-icon icon="mdi-account-group-outline" size="32" color="slate-400" />
                  </template>
                </UiEmptyState>
              </td>
            </tr>

            <tr
              v-else
              v-for="patient in patients"
              :key="patient.id"
              class="cursor-pointer group"
              @click="openPatientProfile(patient)"
            >
              <td class="crm-table-primary">{{ patient.firstName }} {{ patient.lastName }}</td>
              <td class="font-mono tracking-wider">{{ patient.nationalId }}</td>
              <td class="font-mono tracking-wider crm-ltr">{{ patient.phone || '-' }}</td>
              <td>{{ formatJalaliDate(patient.birthDate) }}</td>
              <td>
                <span :class="maritalBadgeClass(patient.maritalStatus)">
                  {{ patient.maritalStatus || $t('patients.unknown') }}
                </span>
              </td>
              <td>{{ formatJalaliDate(patient.createdAt) }}</td>
              <td class="text-center!">
                <div class="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <v-tooltip :text="$t('patients.fullRecord')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn"
                        @click.stop="navigateTo(`/patients/${patient.id}`)">
                        <v-icon size="20">mdi-file-document-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.printRecord')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn text-blue-500!"
                        @click.stop="openFullRecord(patient)">
                        <v-icon size="20">mdi-printer-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.sendSms')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn"
                        @click.stop="openSmsModal(patient)">
                        <v-icon size="20">mdi-message-text-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.editInfo')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn text-emerald-500!"
                        @click.stop="openPatientForEdit(patient)">
                        <v-icon size="20">mdi-pencil-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>

                  <v-tooltip :text="$t('patients.deleteRecord')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn crm-icon-btn-danger"
                        @click.stop="confirmDelete(patient)">
                        <TrashBin class="w-5 h-5 fill-current" />
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UiContentCard>

    <!-- Profile Dialog -->
    <v-dialog v-model="profileDialog" max-width="650">
      <div v-if="selectedProfile" class="crm-dialog">
        <div class="crm-dialog-header bg-slate-50/50! dark:bg-slate-800/50!">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-2xl bg-periwinkle text-electric-sapphire flex items-center justify-center text-2xl font-bold">
              {{ selectedProfile.firstName?.charAt(0) }}{{ selectedProfile.lastName?.charAt(0) }}
            </div>
            <div>
              <h2 class="crm-dialog-title text-xl!">{{ selectedProfile.firstName }} {{ selectedProfile.lastName }}</h2>
              <p class="text-slate-500 font-mono mt-1">{{ selectedProfile.nationalId }}</p>
            </div>
          </div>
        </div>
        <div class="crm-dialog-body grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-for="field in profileFields" :key="field.label" class="space-y-1">
            <span class="crm-label mb-0!">{{ field.label }}</span>
            <p class="text-slate-800 dark:text-slate-100 font-medium" :class="field.ltr ? 'crm-ltr' : ''">{{ field.value }}</p>
          </div>
        </div>
        <div class="crm-dialog-footer">
          <button class="crm-btn crm-btn-ghost" @click="profileDialog = false">{{ $t('common.close') }}</button>
        </div>
      </div>
    </v-dialog>

    <!-- SMS Dialog -->
    <v-dialog v-model="smsDialog" max-width="500">
      <div class="crm-dialog">
        <div class="crm-dialog-header">
          <h3 class="crm-dialog-title">{{ $t('patients.smsTitle') }}</h3>
          <v-btn icon variant="text" size="small" @click="smsDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="crm-dialog-body">
          <div v-if="selectedSmsPatient" class="crm-info-box">
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ $t('patients.recipient') }}</p>
            <p class="font-bold text-electric-sapphire mt-1">
              {{ selectedSmsPatient.firstName }} {{ selectedSmsPatient.lastName }}
              <span class="font-mono text-cornflower-blue text-sm mr-2 crm-ltr">({{ selectedSmsPatient.phone }})</span>
            </p>
          </div>

          <label class="crm-label">{{ $t('patients.messageText') }}</label>
          <textarea v-model="smsText" rows="4" class="crm-input crm-textarea"
            :placeholder="$t('patients.smsPlaceholder')" />
        </div>

        <div class="crm-dialog-footer">
          <button class="crm-btn crm-btn-danger" @click="smsDialog = false">{{ $t('common.cancel') }}</button>
          <button class="crm-btn crm-btn-accent" @click="sendSms">{{ $t('patients.sendSmsBtn') }}</button>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
const { t } = useI18n()
import PatientFormDialog from '~/components/PatientFormDialog.vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'
import { useEventBus } from '~/composables/useEventBus'

const { openEdit } = usePatientFormDialog()
const { apiFetch } = useApi()
const { on, off, emit } = useEventBus()
const { $toast } = useNuxtApp()
const { formatJalaliDate } = useFormatting()

const patients = ref<any[]>([])
const loading = ref(true)
const profileDialog = ref(false)
const selectedProfile = ref<any>(null)
const smsDialog = ref(false)
const selectedSmsPatient = ref<any>(null)
const smsText = ref('')

const maritalMap: Record<string, string> = {
  'متاهل': 'crm-badge crm-badge-emerald',
  'مجرد': 'crm-badge crm-badge-blue',
  'مطلقه': 'crm-badge crm-badge-amber',
  'بیوه': 'crm-badge crm-badge-neutral',
}

const maritalBadgeClass = (status: string) => maritalMap[status] || 'crm-badge crm-badge-neutral'

const profileFields = computed(() => {
  if (!selectedProfile.value) return []
  const p = selectedProfile.value
  return [
    { label: t('patients.phoneLabel'), value: p.phone || t('patients.notRegistered'), ltr: true },
    { label: t('patients.birthDateLabel'), value: formatJalaliDate(p.birthDate) },
    { label: t('patients.maritalStatusLabel'), value: p.maritalStatus || t('patients.unknown') },
    { label: t('patients.registrationDateLabel'), value: formatJalaliDate(p.createdAt) },
  ]
})

const fetchPatients = async () => {
  loading.value = true
  try {
    const response = await apiFetch('/api/patients', { baseURL: useRuntimeConfig().public.apiBase })
    if (response.success) patients.value = response.data
    else $toast.error(t('patients.fetchError'))
  } catch {
    $toast.error(t('patients.serverError'))
  } finally {
    loading.value = false
  }
}

const openPatientProfile = (patient: any) => {
  selectedProfile.value = patient
  profileDialog.value = true
}

const openFullRecord = async (patient: any) => {
  try {
    const { token } = useAuth()
    const apiBase = useRuntimeConfig().public.apiBase || ''
    const url = `${apiBase}/api/patients/${patient.id}/full-record`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.value}` },
    })

    if (!response.ok) throw new Error('Failed to fetch record')

    const html = await response.text()
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    window.open(blobUrl, '_blank')
  } catch {
    $toast.error(t('patients.fetchFullRecordError'))
  }
}

const openPatientForEdit = async (patient: any) => {
  try {
    const result = await apiFetch(`/api/patients/${patient.id}/profile`)
    if (result.success && result.data) openEdit(patient.id, result.data)
    else $toast.error(t('patients.fetchForEditError'))
  } catch {
    $toast.error(t('patients.serverError'))
  }
}

const openSmsModal = (patient: any) => {
  selectedSmsPatient.value = patient
  smsText.value = ''
  smsDialog.value = true
}

const sendSms = async () => {
  if (!smsText.value.trim()) {
    $toast.error(t('patients.smsEmptyError'))
    return
  }
  try {
    await apiFetch('/api/patients/send-sms', {
      method: 'POST',
      body: { phone: selectedSmsPatient.value.phone, text: smsText.value },
    })
    $toast.success(t('patients.smsSentSuccess'))
    smsDialog.value = false
  } catch (err: any) {
    $toast.error(err.data?.error || t('patients.smsSendError'))
  }
}

const confirmDelete = async (patient: any) => {
  if (!confirm(t('patients.deleteConfirm', { name: `${patient.firstName} ${patient.lastName}` }))) return
  try {
    const response = await apiFetch(`/api/patients/${patient.id}`, { method: 'DELETE' })
    if (response.success) {
      $toast.success(t('patients.deleteSuccess'))
      emit('patient:changed')
    } else {
      $toast.error(response.error || t('patients.deleteError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('patients.serverError'))
  }
}

onMounted(() => {
  fetchPatients()
  on('patient:changed', fetchPatients)
})

onBeforeUnmount(() => off('patient:changed'))

useSeoMeta({ title: () => t('patients.titleSeo'), ogTitle: () => t('patients.ogTitle') })
</script>
