<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="920" persistent scrollable>
    <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden" dir="rtl">

      <div class="!flex !items-center justify-between !px-6 !py-4 !border-b !border-zinc-100 !bg-zinc-50/30">
        <div class="!flex !items-center !gap-2.5">
          <div class="!w-8 !h-8 !rounded-lg !bg-zinc-900 !flex !items-center !justify-center">
            <Icon :name="reportType === 'hpv_dna' ? 'lucide:shield-check' : 'lucide:microscope'" class="!w-4 !h-4 !text-white" />
          </div>
          <div>
            <h3 class="!text-xs !font-bold !text-zinc-900">{{ reportType === 'hpv_dna' ? t('labReport.hpvTitle') : t('labReport.papSmearTitle') }}</h3>
            <p class="!text-[10px] !text-zinc-400 !mt-0.5">{{ editData ? t('labReport.editingRecord') : t('labReport.newRecord') }}</p>
          </div>
        </div>
        <button class="!text-zinc-400 hover:!text-zinc-900 !transition-colors" @click="$emit('update:modelValue', false)">
          <Icon name="lucide:x" class="!w-4 !h-4" />
        </button>
      </div>

      <div class="!max-h-[70vh] !overflow-y-auto">
        <PapSmearFields v-if="reportType === 'pap_smear'" v-model="reportData" />
        <HpvDnaFields v-else-if="reportType === 'hpv_dna'" v-model="reportData" />

        <div class="!px-6 !py-5 !border-t !border-zinc-100">
          <div class="!flex !items-center !gap-2.5 !mb-3">
            <Icon name="lucide:message-square-text" class="!w-4 !h-4 !text-zinc-500" />
            <span class="!text-xs !font-bold !text-zinc-800">{{ t('labReport.notesAndComments') }}</span>
          </div>
          <v-textarea v-model="notes" variant="outlined" density="compact" rows="3" hide-details
            :placeholder="t('labReport.notesPlaceholder')" class="custom-v-input" color="#18181b" base-color="#e4e4e7" />
        </div>
      </div>

      <div class="!px-6 !py-4 !bg-white !border-t !border-zinc-100 !flex !justify-end !gap-2.5">
        <button
          class="!px-4 !py-2 !text-xs !font-semibold !text-zinc-500 hover:!bg-zinc-100 !rounded-xl !transition-colors"
          @click="$emit('update:modelValue', false)">{{ t('common.cancel') }}</button>
        <button
          class="!px-5 !py-2 !text-xs !font-semibold !text-white !bg-zinc-900 hover:!bg-zinc-800 !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center !min-w-[120px]"
          :disabled="submitting" @click="submit">
          <v-progress-circular v-if="submitting" indeterminate size="12" width="2" color="white" class="!ml-2" />
          {{ editData ? t('labReport.saveChanges') : t('labReport.submitResult') }}
        </button>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PapSmearFields from './report-fields/PapSmearFields.vue'
import HpvDnaFields from './report-fields/HpvDnaFields.vue'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  reportType: 'pap_smear' | 'hpv_dna'
  patientId: string
  editData?: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const submitting = ref(false)
const reportData = ref<Record<string, any>>({})
const notes = ref('')

watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.editData?.report_data) {
      reportData.value = { ...props.editData.report_data }
      notes.value = props.editData.notes || ''
    } else {
      reportData.value = {}
      notes.value = ''
    }
  }
})

async function submit() {
  const testName = props.reportType === 'hpv_dna' ? 'HPV DNA Genotyping' : 'Pap Smear Cervicovaginal'
  const category = props.reportType === 'hpv_dna' ? 'molecular' : 'cytology'

  submitting.value = true
  try {
    const payload = {
      patient_id: props.patientId,
      category,
      test_name: testName,
      report_type: props.reportType,
      report_data: { type: props.reportType, ...reportData.value },
      performed_date: new Date().toISOString(),
      notes: notes.value || null,
    }

    const endpoint = props.editData?.id ? `/api/lab-results/${props.editData.id}` : '/api/lab-results'
    const method = props.editData?.id ? 'PUT' : 'POST'

    const res = await apiFetch<any>(endpoint, { method, body: payload })
    if (res.success) {
      $toast.success(props.editData?.id ? t('labReport.reportUpdated') : t('labReport.reportSaved'))
      emit('update:modelValue', false)
      emit('saved')
    } else {
      $toast.error(res.error || t('labReport.saveError'))
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('labReport.saveError'))
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
:deep(.custom-v-input .v-field) {
  border-radius: 12px !important;
  font-size: 12px !important;
}
</style>
