<template>
  <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600" persistent>
    <v-card class="rounded-2xl overflow-hidden">
      <div class="crm-dialog-header">
        <h3 class="crm-dialog-title">{{ editMode ? t('staffForm.editTitle') : t('staffForm.addTitle') }}</h3>
        <button @click="close" class="crm-dialog-close">
          <v-icon size="20">mdi-close</v-icon>
        </button>
      </div>

      <v-card-text class="crm-dialog-body">
        <v-form ref="formRef" @submit.prevent="submit">
          <div class="space-y-4">
            <div>
              <label class="crm-label">{{ t('staffForm.fullName') }} *</label>
              <v-text-field
                v-model="form.fullName"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || t('staffForm.fullNameRequired')]"
                hide-details="auto"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openHandwriting('fullName')"
              />
            </div>

            <div>
              <label class="crm-label">{{ t('staffForm.mobile') }} *</label>
              <v-text-field
                v-model="form.phone"
                variant="outlined"
                density="comfortable"
                dir="ltr"
                :rules="[
                  v => !!v || t('staffForm.mobileRequired'),
                  v => /^09\d{9}$/.test(v) || t('staffForm.mobileInvalid')
                ]"
                hide-details="auto"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openHandwriting('phone')"
              />
            </div>

            <div v-if="!editMode">
              <label class="crm-label">{{ t('staffForm.password') }} *</label>
              <v-text-field
                v-model="form.password"
                variant="outlined"
                density="comfortable"
                type="password"
                :rules="[v => !!v || t('staffForm.passwordRequired'), v => v?.length >= 6 || t('staffForm.passwordMin')]"
                hide-details="auto"
              />
            </div>

            <div>
              <label class="crm-label">{{ t('staffForm.position') }} *</label>
              <v-select
                v-model="form.position"
                :items="positionOptions"
                variant="outlined"
                density="comfortable"
                :rules="[v => !!v || t('staffForm.positionRequired')]"
                hide-details="auto"
              />
            </div>

            <div>
              <label class="crm-label">{{ t('staffForm.startDate') }}</label>
              <v-text-field
                v-model="form.employmentDate"
                variant="outlined"
                density="comfortable"
                type="date"
                hide-details="auto"
              />
            </div>

            <div>
              <label class="crm-label">{{ t('staffForm.notes') }}</label>
              <v-textarea
                v-model="form.notes"
                variant="outlined"
                density="comfortable"
                rows="2"
                hide-details="auto"
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openHandwriting('notes')"
              />
            </div>
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="crm-dialog-footer">
        <v-spacer />
        <v-btn variant="text" class="crm-btn crm-btn-ghost" @click="close">{{ t('staffForm.cancel') }}</v-btn>
        <v-btn
          variant="flat"
          class="crm-btn crm-btn-accent"
          :loading="loading"
          @click="submit"
        >
          {{ editMode ? t('staffForm.saveChanges') : t('staffForm.createStaff') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
</template>

<script setup lang="ts">
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  staff?: any
  editMode?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const loading = ref(false)
const formRef = ref<any>(null)

const positionOptions = computed(() => t('staffForm.positionOptions'))

const form = reactive({
  fullName: '',
  phone: '',
  password: '',
  position: '',
  employmentDate: '',
  notes: '',
})

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      fullName: t('staffForm.fullName'),
      phone: t('staffForm.mobile'),
      notes: t('staffForm.notes'),
    },
    target: form,
  })

watch(() => props.modelValue, (val) => {
  if (val && props.staff && props.editMode) {
    form.fullName = props.staff.fullName || ''
    form.phone = props.staff.phone || ''
    form.position = props.staff.position || ''
    form.employmentDate = props.staff.employmentDate || ''
    form.notes = props.staff.notes || ''
    form.password = ''
  } else if (val) {
    resetForm()
  }
})

const resetForm = () => {
  form.fullName = ''
  form.phone = ''
  form.password = ''
  form.position = ''
  form.employmentDate = ''
  form.notes = ''
}

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

const submit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  try {
    if (props.editMode && props.staff) {
      const res = await apiFetch<any>(`/api/staff/${props.staff.id}/profile`, {
        method: 'PUT',
        body: {
          position: form.position,
          employmentDate: form.employmentDate || null,
          notes: form.notes || null,
        },
      })
      if (res.success) {
        $toast.success(t('staffForm.editSuccess'))
        emit('saved')
        close()
      }
    } else {
      const res = await apiFetch<any>('/api/staff', {
        method: 'POST',
        body: {
          fullName: form.fullName,
          phone: form.phone,
          password: form.password,
          position: form.position,
          employmentDate: form.employmentDate || null,
          notes: form.notes || null,
        },
      })
      if (res.success) {
        $toast.success(t('staffForm.createSuccess'))
        emit('saved')
        close()
      }
    }
  } catch (err: any) {
    $toast.error(err?.data?.error || t('staffForm.error'))
  } finally {
    loading.value = false
  }
}
</script>
