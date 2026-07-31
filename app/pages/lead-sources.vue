<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('leadSources.title')" :subtitle="$t('leadSources.subtitle')">
      <template #actions>
        <button class="crm-btn crm-btn-accent px-6! py-3!" @click="openCreateDialog">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          {{ $t('leadSources.addNew') }}
        </button>
      </template>
    </UiPageHeader>

    <UiContentCard>
      <div v-if="loading" class="flex flex-col items-center justify-center py-24!">
        <svg class="animate-spin h-8 w-8 text-electric-sapphire mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm text-slate-500 font-medium">{{ $t('leadSources.loading') }}</span>
      </div>

      <div v-else-if="!sources.length" class="flex flex-col items-center justify-center py-24 px-4 text-center my-3">
        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
          <svg class="w-8 h-8 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h18M3 12h18M3 19h18" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">{{ $t('leadSources.noSources') }}</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">{{ $t('leadSources.addFirst') }}</p>
      </div>

      <template v-else>
        <div class="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide">{{ $t('leadSources.sourceCount', { count: sources.length }) }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">{{ $t('leadSources.showInactive') }}</span>
            <v-switch v-model="showInactive" color="#4F46E5" hide-details density="compact" @update:model-value="fetchSources" />
          </div>
        </div>

        <div class="divide-y divide-slate-100/80">
          <div v-for="source in sources" :key="source.id"
            class="p-5 md:p-6 py-2 px-2 flex flex-col md:flex-row md:items-center gap-5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
            <div class="flex items-center gap-4 shrink-0 md:w-14">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border"
                :style="{ backgroundColor: source.color + '20', borderColor: source.color + '40' }">
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: source.color }"></div>
              </div>
            </div>

            <div class="flex-1 min-w-0 px-2">
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <h3 class="text-base font-bold text-slate-800 dark:text-slate-300">{{ source.name }}</h3>
                <span v-if="!source.isActive"
                  class="px-2 py-0.5 text-[11px] font-bold rounded-lg border bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                  {{ $t('leadSources.inactive') }}
                </span>
                <span class="px-2 py-0.5 text-[11px] font-bold rounded-lg border bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30">
                  {{ sourceTypeLabel(source.type) }}
                </span>
              </div>
              <p v-if="source.description" class="text-sm text-slate-500 mt-1 leading-relaxed">{{ source.description }}</p>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 font-medium">
                <div class="flex items-center gap-1">
                  <span :class="sourceCategoryClass(source.category)">{{ sourceCategoryLabel(source.category) }}</span>
                </div>
                <span class="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block"></span>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-slate-400">{{ $t('leadSources.sortOrder') }}</span>
                  <span class="text-xs text-slate-600 font-mono">{{ source.sortOrder }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end px-2">
              <v-btn icon variant="text" color="slate-500" size="small" @click="openEditDialog(source)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </v-btn>
              <v-btn icon variant="text" color="red" size="small" @click="confirmDeactivate(source)">
                <TrashBin class="w-5 h-5 fill-red-500" />
              </v-btn>
              <v-btn v-if="!source.isActive" variant="text" color="emerald" size="small" class="text-emerald-600! font-bold text-xs!" @click="reactivateSource(source)">
                {{ $t('leadSources.reactivate') }}
              </v-btn>
            </div>
          </div>
        </div>
      </template>
    </UiContentCard>

    <v-dialog v-model="dialog" max-width="580" :persistent="saving">
      <v-card class="rounded-2xl">
        <v-card-title class="text-lg font-bold! text-slate-800 dark:text-slate-100 px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-700">
          {{ editingId ? $t('leadSources.editSource') : $t('leadSources.addSource') }}
        </v-card-title>

        <v-card-text class="px-6 py-6">
          <v-form ref="formRef" @submit.prevent="saveSource">
            <v-row>
              <v-col cols="12" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">{{ $t('leadSources.name') }} <span class="text-red-500">*</span></label>
                <v-text-field v-model="form.name" variant="outlined" density="comfortable"
                  :placeholder="$t('leadSources.namePlaceholder')" hide-details="auto" bg-color="white" rounded="lg"
                  :rules="[v => !!v?.trim() || $t('leadSources.nameRequired')]" />
              </v-col>

              <v-col cols="12" md="6" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">{{ $t('leadSources.type') }} <span class="text-red-500">*</span></label>
                <v-select v-model="form.type" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="typeOptions" item-title="title" item-value="value" />
              </v-col>

              <v-col cols="12" md="6" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">{{ $t('leadSources.category') }}</label>
                <v-select v-model="form.category" variant="outlined" density="comfortable" hide-details="auto"
                  bg-color="white" rounded="lg" :items="categoryOptions" item-title="title" item-value="value" />
              </v-col>

              <v-col cols="12" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">{{ $t('leadSources.description') }}</label>
                <v-textarea v-model="form.description" variant="outlined" density="comfortable"
                  :placeholder="$t('leadSources.descriptionPlaceholder')" hide-details="auto" bg-color="white" rounded="lg"
                  rows="2" />
              </v-col>

              <v-col cols="12" md="6" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">{{ $t('leadSources.color') }}</label>
                <div class="flex flex-wrap gap-2.5">
                  <button v-for="c in colorPalette" :key="c"
                    type="button"
                    class="w-9 h-9 rounded-xl border-2 transition-all duration-150 shrink-0 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800"
                    :class="form.color === c
                      ? 'border-slate-800 dark:border-white ring-2 ring-slate-400 scale-110 shadow-md'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400'"
                    :style="{ backgroundColor: c }"
                    @click="form.color = c"
                  />
                </div>
                <input type="hidden" :value="form.color" />
              </v-col>

              <v-col cols="12" md="6" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">{{ $t('leadSources.sortOrder') }}</label>
                <v-text-field v-model.number="form.sortOrder" variant="outlined" density="comfortable" type="number"
                  min="0" hide-details="auto" bg-color="white" rounded="lg" />
              </v-col>

              <v-col cols="12" md="6" class="py-2 d-flex align-center">
                <v-switch v-model="form.isActive" color="#4F46E5" :label="$t('leadSources.active')" hide-details />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-2 border-t border-slate-100 gap-3">
          <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
            :disabled="saving" @click="dialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn variant="flat" color="#4F46E5" size="large" :loading="saving"
            class="px-8 font-bold rounded-lg shadow-md shadow-electric-sapphire/30 hover:bg-electric-sapphire/80!" @click="saveSource">
            {{ editingId ? $t('leadSources.saveChanges') : $t('leadSources.createSource') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="rounded-2xl text-center py-6">
        <v-card-text class="px-6">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrashBin class="w-8 h-8 fill-red-500" />
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">{{ $t('leadSources.deactivateTitle') }}</h3>
          <p class="text-sm text-slate-500">
            {{ $t('leadSources.deactivateConfirm', { name: deletingItem?.name }) }}
          </p>
        </v-card-text>

        <v-card-actions class="justify-center gap-3 px-6 pt-4">
          <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
            :disabled="saving" @click="deleteDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn variant="flat" color="red" size="large" :loading="saving"
            class="px-8 font-bold rounded-lg shadow-md shadow-red-500/30" @click="deactivateSource">
            {{ $t('leadSources.deactivate') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TrashBin from '~/components/icons/TrashBin.vue'
import { useLeads } from '~/composables/useLeads'
import { useEventBus } from '~/composables/useEventBus'
import { useStatusBadge } from '~/composables/useStatusBadge'
import { LEAD_SOURCE_CATEGORIES, LEAD_SOURCE_TYPES, type LeadSource } from '~/types/lead'

const { t } = useI18n()
const { listSources, createSource, updateSource, deactivateSource: deactivate } = useLeads()
const { emit } = useEventBus()
const { $toast } = useNuxtApp()
const { sourceTypeLabel, sourceCategoryClass, sourceCategoryLabel } = useStatusBadge()

const sources = ref<LeadSource[]>([])
const loading = ref(true)
const showInactive = ref(false)
const dialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const deletingItem = ref<LeadSource | null>(null)
const formRef = ref<any>(null)

const colorPalette = [
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#06B6D4', '#0EA5E9',
]

const typeOptions = LEAD_SOURCE_TYPES.map((type) => ({ value: type, title: sourceTypeLabel(type) }))
const categoryOptions = LEAD_SOURCE_CATEGORIES.map((c) => ({ value: c, title: sourceCategoryLabel(c) }))

const defaultForm = {
  name: '',
  type: 'other' as string,
  category: 'other' as string,
  description: '',
  color: '#3B82F6',
  sortOrder: 0,
  isActive: true,
}

const form = ref({ ...defaultForm })

function resetForm() {
  form.value = { ...defaultForm }
  editingId.value = null
}

function openCreateDialog() {
  resetForm()
  dialog.value = true
}

function openEditDialog(source: LeadSource) {
  editingId.value = source.id
  form.value = {
    name: source.name,
    type: source.type,
    category: source.category,
    description: source.description || '',
    color: source.color,
    sortOrder: source.sortOrder,
    isActive: source.isActive,
  }
  dialog.value = true
}

function confirmDeactivate(source: LeadSource) {
  deletingItem.value = source
  deleteDialog.value = true
}

async function fetchSources() {
  loading.value = true
  try {
    const res = await listSources(showInactive.value)
    if (res.success) {
      sources.value = [...res.data].sort((a, b) => a.sortOrder - b.sortOrder)
    }
  } catch {
    $toast.error(t('leadSources.fetchError'))
  } finally {
    loading.value = false
  }
}

async function reactivateSource(source: LeadSource) {
  saving.value = true
  try {
    await updateSource(source.id, { isActive: true })
    $toast.success(t('leadSources.reactivatedSuccess'))
    emit('lead-sources:changed')
    await fetchSources()
  } catch (err: any) {
    $toast.error(err.data?.error || t('leadSources.saveError'))
  } finally {
    saving.value = false
  }
}

async function saveSource() {
  const formEl = formRef.value
  if (formEl) {
    const { valid } = await formEl.validate()
    if (!valid) return
  }

  saving.value = true
  try {
    const body = {
      name: form.value.name.trim(),
      type: form.value.type,
      category: form.value.category,
      description: form.value.description.trim() || undefined,
      color: form.value.color,
      sortOrder: form.value.sortOrder,
      isActive: form.value.isActive,
    }

    if (editingId.value) {
      await updateSource(editingId.value, body)
      $toast.success(t('leadSources.updatedSuccess'))
    } else {
      await createSource(body)
      $toast.success(t('leadSources.createdSuccess'))
    }

    dialog.value = false
    emit('lead-sources:changed')
    await fetchSources()
  } catch (err: any) {
    $toast.error(err.data?.error || t('leadSources.saveError'))
  } finally {
    saving.value = false
  }
}

async function deactivateSource() {
  if (!deletingItem.value) return
  saving.value = true
  try {
    await deactivate(deletingItem.value.id)
    $toast.success(t('leadSources.deactivatedSuccess'))
    deleteDialog.value = false
    deletingItem.value = null
    emit('lead-sources:changed')
    await fetchSources()
  } catch (err: any) {
    $toast.error(err.data?.error || t('leadSources.deleteError'))
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchSources()
})

useSeoMeta({
  title: t('leadSources.titleSeo'),
})
</script>
