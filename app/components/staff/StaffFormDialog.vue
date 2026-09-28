<template>
  <v-dialog
    :model-value="modelValue"
    max-width="620"
    persistent
    transition="dialog-bottom-transition"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-card class="asa-dialog overflow-hidden!" elevation="0">
      <div class="asa-dialog__head">
        <div class="stfd-head">
          <span class="asa-tint" :class="editMode ? 'asa-tint--teal' : 'asa-tint--green'">
            <component :is="editMode ? Pencil : UserPlus" class="w-4! h-4! stroke-current" />
          </span>
          <div class="stfd-head__copy">
            <h2 class="asa-dialog__title">
              {{ editMode ? t('staffForm.editTitle') : t('staffForm.addTitle') }}
            </h2>
            <span class="asa-dialog__sub">
              {{ editMode ? t('staffForm.editSubtitle') : t('staffForm.addSubtitle') }}
            </span>
          </div>
        </div>
        <button
          class="pf-x"
          type="button"
          :aria-label="t('common.close')"
          :disabled="loading"
          @click="close"
        >
          <v-icon size="18">mdi-close</v-icon>
        </button>
      </div>

      <v-card-text class="asa-dialog__body">
        <v-form ref="formRef" @submit.prevent="submit">
          <div class="stfd-grid">
            <!-- Full name -->
            <div class="stfd-field">
              <label class="asa-field-label" for="stf-fullName">{{ t('staffForm.fullName') }} *</label>
              <v-text-field
                id="stf-fullName"
                v-model="form.fullName"
                variant="solo"
                density="comfortable"
                clearable
                append-inner-icon="mdi-draw-pen"
                :rules="[v => !!v || t('staffForm.fullNameRequired'), v => !v || v.length >= 2 || t('staffForm.fullNameMin')]"
                @click:append-inner="openHandwriting('fullName')"
              />
            </div>

            <!-- Phone -->
            <div class="stfd-field">
              <label class="asa-field-label" for="stf-phone">{{ t('staffForm.mobile') }} *</label>
              <v-text-field
                id="stf-phone"
                v-model="form.phone"
                variant="solo"
                density="comfortable"
                dir="ltr"
                clearable
                maxlength="11"
                append-inner-icon="mdi-draw-pen"
                :rules="[
                  v => !!v || t('staffForm.mobileRequired'),
                  v => !v || /^09\d{9}$/.test(v) || t('staffForm.mobileInvalid'),
                ]"
                @click:append-inner="openHandwriting('phone')"
              />
            </div>

            <!-- Position -->
            <div class="stfd-field">
              <label class="asa-field-label">{{ t('staffForm.position') }} *</label>
              <v-select
                v-model="form.position"
                :items="positionItems"
                variant="solo"
                density="comfortable"
                :rules="[v => !!v || t('staffForm.positionRequired')]"
              />
            </div>

            <!-- Start date -->
            <div class="stfd-field">
              <label class="asa-field-label" for="stf-date">{{ t('staffForm.startDate') }}</label>
              <v-text-field
                id="stf-date"
                v-model="form.employmentDate"
                variant="solo"
                density="comfortable"
                type="date"
                dir="ltr"
              />
            </div>

            <!-- Password (create only) -->
            <div v-if="!editMode" class="stfd-field stfd-field--full">
              <label class="asa-field-label" for="stf-password">{{ t('staffForm.password') }} *</label>
              <v-text-field
                id="stf-password"
                v-model="form.password"
                variant="solo"
                density="comfortable"
                type="password"
                autocomplete="new-password"
                :append-inner="passwordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                :rules="[
                  v => !!v || t('staffForm.passwordRequired'),
                  v => !v || v.length >= 6 || t('staffForm.passwordMin'),
                ]"
                @click:append-inner="passwordVisible = !passwordVisible"
              />
              <p class="stfd-hint">{{ t('staffForm.passwordHint') }}</p>
            </div>

            <!-- Notes -->
            <div class="stfd-field stfd-field--full">
              <label class="asa-field-label" for="stf-notes">{{ t('staffForm.notes') }}</label>
              <v-textarea
                id="stf-notes"
                v-model="form.notes"
                variant="solo"
                density="comfortable"
                rows="2"
                auto-grow
                hide-details
                append-inner-icon="mdi-draw-pen"
                @click:append-inner="openHandwriting('notes')"
              />
            </div>
          </div>

          <!-- Edit-only: quick status switch -->
          <div v-if="editMode" class="stfd-switch">
            <div class="stfd-switch__copy">
              <p class="stfd-switch__title">{{ t('staffForm.activeToggle') }}</p>
              <p class="stfd-switch__desc">{{ t('staffForm.activeToggleDesc') }}</p>
            </div>
            <v-switch
              v-model="form.isActive"
              color="#00adb5"
              hide-details
              density="compact"
              inset
              :aria-label="t('staffForm.activeToggle')"
            />
          </div>
        </v-form>
      </v-card-text>

      <v-card-actions class="asa-dialog__foot">
        <v-spacer />
        <button class="asa-btn asa-btn--ghost asa-btn--sm" :disabled="loading" @click="close">
          <span>{{ t('common.cancel') }}</span>
        </button>
        <button class="asa-btn asa-btn--primary asa-btn--sm" :disabled="loading" @click="submit">
          <v-icon v-if="loading" size="15" class="pf-spin">mdi-loading</v-icon>
          <component :is="editMode ? Pencil : UserPlus" v-else class="w-4! h-4! stroke-current" />
          <span>{{ editMode ? t('staffForm.saveChanges') : t('staffForm.createStaff') }}</span>
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <HandwritingDialog
    v-model="handwritingOpen"
    :label="handwritingLabel"
    :numeric="handwritingNumeric"
    @insert="applyHandwriting"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Pencil from '~/components/icons/Pencil.vue'
import UserPlus from '~/components/icons/UserPlus.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'

interface StaffFormTarget {
  id: string
  fullName: string
  phone: string
  position: string | null
  employmentDate: string | null
  notes?: string | null
  isActive?: boolean | null
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  staff?: StaffFormTarget | null
  editMode?: boolean
}>(), {
  staff: null,
  editMode: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const { t } = useI18n()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const loading = ref(false)
const passwordVisible = ref(false)
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

const positionItems = computed(() => {
  const raw = t('staffForm.positionOptions') as unknown
  const list = Array.isArray(raw) ? raw.map(String) : []
  // Keep an unknown stored position selectable instead of silently dropping it.
  if (props.editMode && props.staff?.position && !list.includes(props.staff.position)) {
    return [props.staff.position, ...list]
  }
  return list
})

const form = reactive({
  fullName: '',
  phone: '',
  password: '',
  position: '',
  employmentDate: '',
  notes: '',
  isActive: true,
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

function reset() {
  form.fullName = ''
  form.phone = ''
  form.password = ''
  form.position = ''
  form.employmentDate = ''
  form.notes = ''
  form.isActive = true
  passwordVisible.value = false
}

function hydrate() {
  const member = props.staff
  if (!props.editMode || !member) {
    reset()
    return
  }
  form.fullName = member.fullName || ''
  form.phone = member.phone || ''
  form.password = ''
  form.position = member.position || ''
  form.employmentDate = member.employmentDate || ''
  form.notes = member.notes || ''
  form.isActive = member.isActive !== false
}

watch(() => props.modelValue, (open) => {
  if (open) hydrate()
})

function close() {
  if (loading.value) return
  emit('update:modelValue', false)
  reset()
}

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const data = (err as { data?: { error?: string; message?: string } }).data
    if (data?.error) return data.error
    if (data?.message) return data.message
  }
  return fallback
}

async function submit() {
  const result = await formRef.value?.validate()
  if (!result?.valid) return

  loading.value = true
  try {
    if (props.editMode && props.staff) {
      const res = await apiFetch<{ success: boolean }>(`/api/staff/${props.staff.id}/profile`, {
        method: 'PUT',
        body: {
          position: form.position,
          employmentDate: form.employmentDate || null,
          notes: form.notes || null,
          isActive: form.isActive,
        },
      })
      if (res.success) {
        $toast.success(t('staffForm.editSuccess'))
        emit('saved')
        emit('update:modelValue', false)
        reset()
      }
    } else {
      const res = await apiFetch<{ success: boolean }>('/api/staff', {
        method: 'POST',
        body: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          password: form.password,
          position: form.position,
          employmentDate: form.employmentDate || null,
          notes: form.notes || null,
        },
      })
      if (res.success) {
        $toast.success(t('staffForm.createSuccess'))
        emit('saved')
        emit('update:modelValue', false)
        reset()
      }
    }
  } catch (err: unknown) {
    $toast.error(errorMessage(err, t('staffForm.error')))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.stfd-head {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.stfd-head__copy {
  min-width: 0;
}

/* Two-column form, collapsing to one on narrow screens. */
.stfd-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.stfd-field {
  min-width: 0;
}

.stfd-field--full {
  grid-column: 1 / -1;
}

.stfd-hint {
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

/* Edit-only active switch */
.stfd-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.stfd-switch__title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.stfd-switch__desc {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

@media (max-width: 560px) {
  .stfd-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
