<template>
  <v-dialog
    :model-value="modelValue"
    max-width="680"
    persistent
    scrollable
    transition="dialog-bottom-transition"
    @update:model-value="onUpdate"
    @keydown.esc="close"
  >
    <v-card class="asa-dialog overflow-hidden!" elevation="0">
      <div class="asa-dialog__head">
        <div>
          <h2 class="asa-dialog__title">{{ $t('dashboard.customizeTitle') }}</h2>
          <span class="asa-dialog__sub">{{ $t('dashboard.customizeSubtitle') }}</span>
        </div>
        <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="close">
          <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
        </v-btn>
      </div>

      <v-card-text class="asa-dialog__body">
        <VueDraggable
          v-model="workingSections"
          :animation="240"
          handle=".cst-handle"
          :delay="60"
          ghost-class="cst-ghost"
          drag-class="cst-drag"
          class="cst-list"
        >
          <div
            v-for="sec in workingSections"
            :key="sec.id"
            class="cst-row"
            :class="{ 'cst-row--hidden': !sec.visible }"
          >
            <span
              class="cst-handle"
              role="button"
              :title="$t('dashboard.dragHandle')"
              :aria-label="$t('dashboard.dragHandle')"
            >
              <v-icon size="20">mdi-drag-vertical</v-icon>
            </span>

            <div class="cst-body">
              <div class="cst-headline">
                <span class="cst-dot" :class="`cst-dot--${sec.id}`" aria-hidden="true" />
                <p class="cst-name">{{ titleOf(sec) }}</p>
                <span v-if="sec.title && sec.title.trim()" class="cst-original">
                  {{ $t('dashboard.customSectionDefault', { label: defaultSectionTitles[sec.id] }) }}
                </span>
                <span v-if="!sec.visible" class="cst-badge">{{ $t('dashboard.sectionHidden') }}</span>
              </div>

              <v-text-field
                v-model="sec.title"
                :placeholder="defaultSectionTitles[sec.id]"
                :label="$t('dashboard.sectionTitleLabel')"
                variant="outlined"
                density="compact"
                hide-details
                clearable
                single-line
                class="cst-field"
                @click:clear="sec.title = null"
              />
            </div>

            <div v-if="isLocked(sec)" class="cst-lock">
              <v-icon size="16">mdi-lock-outline</v-icon>
              <span class="cst-lock__text">{{ $t('dashboard.scheduleRoleHint') }}</span>
            </div>

            <div v-else class="cst-controls">
              <v-btn-toggle
                v-model="sec.size"
                mandatory
                divided
                variant="outlined"
                density="compact"
                class="cst-size"
              >
                <v-btn v-for="opt in SIZE_OPTIONS" :key="opt.value" :value="opt.value" size="x-small">
                  {{ opt.label }}
                </v-btn>
              </v-btn-toggle>

              <v-switch v-model="sec.visible" color="primary" density="compact" hide-details :aria-label="sec.id" class="cst-switch" />
            </div>
          </div>
        </VueDraggable>
      </v-card-text>

      <v-card-actions class="asa-dialog__foot">
        <button class="asa-btn asa-btn--ghost" :disabled="saving" @click="reset">
          {{ $t('dashboard.resetDefault') }}
        </button>
        <v-spacer />
        <button class="asa-btn asa-btn--ghost" :disabled="saving" @click="close">
          {{ $t('common.cancel') }}
        </button>
        <button class="asa-btn asa-btn--primary" :disabled="saving" @click="save">
          {{ saving ? $t('common.saving') : $t('dashboard.saveChanges') }}
        </button>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import type { DashboardSectionConfig, DashboardSectionSize } from '~/types/dashboard-layout'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const { layout, defaultSectionTitles, sectionTitleOf, buildDefaultLayout, applyLayout, saveLayout } =
  useDashboardLayout()
const { user } = useAuth()
const { t } = useI18n()

const workingSections = ref<DashboardSectionConfig[]>([])
const saving = ref(false)

const SIZE_OPTIONS = computed(() => [
  { value: 'small' as DashboardSectionSize, label: t('dashboard.sizeSmall') },
  { value: 'medium' as DashboardSectionSize, label: t('dashboard.sizeMedium') },
  { value: 'large' as DashboardSectionSize, label: t('dashboard.sizeLarge') },
])

const scheduleEligible = computed(() => {
  const role = user.value?.role
  return role === 'admin_doctor' || role === 'doctor'
})

function cloneSections(sections: DashboardSectionConfig[]): DashboardSectionConfig[] {
  return sections.map((sec) => ({ ...sec, title: sec.title ?? null }))
}

function isLocked(sec: DashboardSectionConfig): boolean {
  return sec.id === 'schedule' && !scheduleEligible.value
}

function titleOf(sec: DashboardSectionConfig): string {
  return sectionTitleOf(sec)
}

function onUpdate(value: boolean) {
  emit('update:modelValue', value)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      workingSections.value = cloneSections(layout.value.sections)
    }
  }
)

function close() {
  emit('update:modelValue', false)
}

function reset() {
  workingSections.value = cloneSections(buildDefaultLayout().sections)
}

async function save() {
  applyLayout(workingSections.value)
  saving.value = true
  const ok = await saveLayout(user.value?.id ?? '')
  saving.value = false
  if (ok) {
    useNuxtApp().$toast.success(t('dashboard.layoutSaved'))
    close()
  } else {
    useNuxtApp().$toast.error(t('dashboard.layoutSaveError'))
  }
}
</script>

<style scoped>
/* ── Dialog chrome (matches the dashboard's edit-profile dialog) ── */

.asa-dialog {
  border-radius: 1.25rem !important;
  border: 1px solid var(--asa-card-ring);
}

.asa-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.375rem 1.5rem 0.75rem;
}

.asa-dialog__title {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--asa-label);
}

.asa-dialog__sub {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
}

.asa-dialog__body {
  padding: 1rem 1.5rem !important;
  background: transparent !important;
}

.asa-dialog__foot {
  padding: 0.875rem 1.5rem 1.25rem !important;
  border-top: 1px solid var(--asa-sep);
}

/* ── Section list ─────────────────────────────────── */

.cst-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cst-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem 0.875rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 1rem;
  background: var(--asa-bg-card);
}

.cst-row--hidden {
  opacity: 0.72;
}

.cst-handle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: grab;
  touch-action: none;
  color: var(--asa-label-3);
}

.cst-handle:active {
  cursor: grabbing;
}

.cst-body {
  flex: 1 1 15rem;
  min-width: 0;
}

.cst-headline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.cst-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.cst-original {
  font-size: 0.75rem;
  color: var(--asa-label-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cst-badge {
  margin-inline-start: auto;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
  background: var(--asa-track);
}

.cst-field {
  max-width: 22rem;
}

.cst-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.cst-switch {
  margin-top: 0 !important;
  padding-inline-start: 8px;
}

.cst-lock {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-inline-start: auto;
  font-size: 0.75rem;
  color: var(--asa-label-3);
}

.cst-lock__text {
  max-width: 10rem;
}

/* ── Drag feedback ────────────────────────────────── */

.cst-ghost {
  opacity: 0.45;
}

.cst-drag {
  box-shadow: 0 12px 28px -14px rgba(0, 0, 0, 0.35);
}

.cst-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.cst-dot--alerts {
  background: var(--asa-amber);
}

.cst-dot--quickActions {
  background: var(--asa-accent);
}

.cst-dot--keyMetrics {
  background: var(--asa-green);
}

.cst-dot--statistics {
  background: var(--asa-indigo);
}

.cst-dot--insights {
  background: var(--asa-indigo);
}

.cst-dot--dailyBreakdowns {
  background: #0a84ff;
}

.cst-dot--supplementary {
  background: #64d2ff;
}

.cst-dot--schedule {
  background: var(--asa-rose);
}
</style>