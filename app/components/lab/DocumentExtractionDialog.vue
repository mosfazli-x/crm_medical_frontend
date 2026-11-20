<template>
  <v-dialog :model-value="modelValue" max-width="1180" persistent class="backdrop-blur-sm"
    @update:model-value="emit('update:modelValue', $event)">
    <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden">
      <!-- Header -->
      <div class="!flex !items-center !justify-between !px-6 !py-4 !border-b !border-zinc-100">
        <div class="!flex !items-center !gap-2.5 !min-w-0">
          <div class="!w-8 !h-8 !rounded-lg !bg-zinc-50 !border !border-zinc-200/60 !flex !items-center !justify-center !shrink-0">
            <Microscope class="!w-4 !h-4 !text-zinc-500" />
          </div>
          <div class="!min-w-0">
            <h3 class="!text-xs !font-bold !text-zinc-900">{{ t('labResults.extraction.title') }}</h3>
            <p class="!text-[10px] !text-zinc-400 !truncate" :title="fileName">{{ fileName }}</p>
          </div>
        </div>
        <div class="!flex !items-center !gap-2">
          <span v-if="status" :class="['!px-2 !py-0.5 !rounded-md !text-[10px] !font-bold', statusClass(status)]">
            {{ statusLabel(status) }}
          </span>
          <button class="!text-zinc-400 hover:!text-zinc-900 !transition-colors" @click="close">
            <X class="!w-4 !h-4" />
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="!grid !grid-cols-1 lg:!grid-cols-5 !max-h-[76vh] !overflow-hidden">
        <!-- Preview -->
        <div class="lg:!col-span-2 !border-b lg:!border-b-0 lg:!border-l !border-zinc-100 !bg-zinc-50/40 !p-4 !overflow-auto">
          <p class="!text-[10px] !font-bold !text-zinc-400 !uppercase !tracking-wider !mb-2">
            {{ t('labResults.extraction.preview') }}
          </p>
          <div v-if="previewLoading" class="!flex !items-center !justify-center !py-16">
            <v-progress-circular indeterminate size="24" width="2" color="#18181b" />
          </div>
          <template v-else-if="previewUrl">
            <img v-if="isImage" :src="previewUrl" alt="document preview"
              class="!w-full !rounded-xl !border !border-zinc-200 !bg-white !object-contain" />
            <iframe v-else-if="isPdf" :src="previewUrl" class="!w-full !h-[58vh] !rounded-xl !border !border-zinc-200 !bg-white"
              title="document preview" />
            <a v-else :href="previewUrl" target="_blank" rel="noopener"
              class="!inline-flex !items-center !gap-1.5 !text-xs !font-semibold !text-blue-600 hover:!underline">
              <Eye class="!w-3.5 !h-3.5" />
              {{ t('labResults.viewDoc') }}
            </a>
          </template>
          <p v-else class="!text-[11px] !text-zinc-400 !py-10 !text-center">
            {{ t('labResults.extraction.previewUnavailable') }}
          </p>
        </div>

        <!-- Extracted data -->
        <div class="lg:!col-span-3 !p-5 !overflow-auto">
          <div v-if="loading" class="!flex !flex-col !items-center !justify-center !py-20">
            <v-progress-circular indeterminate size="26" width="2" color="#18181b" />
            <p class="!text-[11px] !text-zinc-400 !mt-3">{{ t('labResults.extraction.loading') }}</p>
          </div>

          <div v-else-if="loadError" class="!rounded-xl !border !border-red-100 !bg-red-50 !p-4 !text-[11px] !text-red-600">
            {{ loadError }}
          </div>

          <div v-else-if="!extraction" class="!rounded-xl !border !border-zinc-200 !bg-zinc-50 !p-5 !text-center">
            <p class="!text-xs !font-semibold !text-zinc-700">{{ t('labResults.extraction.notQueued') }}</p>
            <p class="!text-[11px] !text-zinc-400 !mt-1">{{ t('labResults.extraction.notQueuedDesc') }}</p>
            <button class="!mt-3 !px-3 !py-1.5 !text-[11px] !font-semibold !text-white !bg-zinc-900 hover:!bg-zinc-800 !rounded-lg"
              :disabled="reprocessing" @click="reprocess">
              {{ t('labResults.extraction.reprocess') }}
            </button>
          </div>

          <template v-else>
            <div class="!rounded-xl !border !border-amber-200/70 !bg-amber-50/60 !p-3 !mb-4">
              <p class="!text-[10px] !font-semibold !text-amber-800 !leading-relaxed">
                {{ t('labResults.extraction.aiNotice') }}
              </p>
            </div>

            <div v-if="status === 'failed' && extraction.error"
              class="!rounded-xl !border !border-red-100 !bg-red-50 !p-3 !mb-4 !text-[11px] !text-red-600">
              {{ extraction.error }}
            </div>

            <div v-if="status === 'pending' || status === 'processing'"
              class="!rounded-xl !border !border-blue-100 !bg-blue-50 !p-3 !mb-4 !flex !items-center !gap-2 !text-[11px] !text-blue-700">
              <v-progress-circular indeterminate size="14" width="2" color="#1d4ed8" />
              {{ t('labResults.extraction.processingHint') }}
            </div>

            <div v-if="data?.warnings?.length" class="!mb-4">
              <p class="!text-[10px] !font-bold !text-zinc-400 !uppercase !tracking-wider !mb-1">
                {{ t('labResults.extraction.warnings') }}
              </p>
              <ul class="!space-y-1">
                <li v-for="(warning, idx) in data.warnings" :key="idx"
                  class="!text-[11px] !text-amber-700 !bg-amber-50 !border !border-amber-100 !rounded-lg !px-2.5 !py-1.5">
                  {{ warning }}
                </li>
              </ul>
            </div>

            <div class="!grid !grid-cols-2 !gap-2 !mb-4">
              <div class="!rounded-lg !border !border-zinc-200 !px-3 !py-2">
                <p class="!text-[9px] !font-bold !text-zinc-400 !uppercase !tracking-wider">{{ t('labResults.extraction.documentType') }}</p>
                <p class="!text-[11px] !font-semibold !text-zinc-700 !mt-0.5">{{ data?.documentType || '---' }}</p>
              </div>
              <div class="!rounded-lg !border !border-zinc-200 !px-3 !py-2">
                <p class="!text-[9px] !font-bold !text-zinc-400 !uppercase !tracking-wider">{{ t('labResults.extraction.confidence') }}</p>
                <p class="!text-[11px] !font-semibold !text-zinc-700 !mt-0.5">{{ confidenceLabel(data?.confidence) }}</p>
              </div>
              <div class="!rounded-lg !border !border-zinc-200 !px-3 !py-2">
                <p class="!text-[9px] !font-bold !text-zinc-400 !uppercase !tracking-wider">{{ t('labResults.extraction.provider') }}</p>
                <p class="!text-[11px] !font-semibold !text-zinc-700 !mt-0.5">{{ data?.provider?.labName || data?.provider?.doctorName || '---' }}</p>
              </div>
              <div class="!rounded-lg !border !border-zinc-200 !px-3 !py-2">
                <p class="!text-[9px] !font-bold !text-zinc-400 !uppercase !tracking-wider">{{ t('labResults.extraction.reportDate') }}</p>
                <p class="!text-[11px] !font-semibold !text-zinc-700 !mt-0.5">{{ data?.provider?.reportDate || '---' }}</p>
              </div>
            </div>

            <div class="!flex !items-center !justify-between !mb-2">
              <p class="!text-[10px] !font-bold !text-zinc-400 !uppercase !tracking-wider">
                {{ t('labResults.extraction.tests') }} ({{ data?.tests?.length || 0 }})
              </p>
              <button v-if="canEdit" class="!inline-flex !items-center !gap-1 !text-[10px] !font-semibold !text-zinc-500 hover:!text-zinc-900"
                @click="addTest">
                <Plus class="!w-3 !h-3" />
                {{ t('labResults.extraction.addTest') }}
              </button>
            </div>

            <div v-if="!data?.tests?.length" class="!rounded-xl !border !border-dashed !border-zinc-200 !p-4 !text-center !text-[11px] !text-zinc-400">
              {{ t('labResults.extraction.noTests') }}
            </div>

            <div v-else class="!overflow-x-auto !border !border-zinc-200/70 !rounded-xl">
              <table class="!w-full !text-right !text-[10px]">
                <thead>
                  <tr class="!bg-zinc-50/60 !border-b !border-zinc-200/60 !text-zinc-400">
                    <th class="!px-2 !py-2 !font-bold !whitespace-nowrap">{{ t('labResults.extraction.name') }}</th>
                    <th class="!px-2 !py-2 !font-bold !whitespace-nowrap">{{ t('labResults.extraction.category') }}</th>
                    <th class="!px-2 !py-2 !font-bold !whitespace-nowrap">{{ t('labResults.extraction.value') }}</th>
                    <th class="!px-2 !py-2 !font-bold !whitespace-nowrap">{{ t('labResults.extraction.unit') }}</th>
                    <th class="!px-2 !py-2 !font-bold !whitespace-nowrap">{{ t('labResults.extraction.referenceLow') }}</th>
                    <th class="!px-2 !py-2 !font-bold !whitespace-nowrap">{{ t('labResults.extraction.referenceHigh') }}</th>
                    <th class="!px-2 !py-2 !font-bold !whitespace-nowrap">{{ t('labResults.extraction.abnormal') }}</th>
                    <th v-if="canEdit" class="!px-2 !py-2"></th>
                  </tr>
                </thead>
                <tbody class="!divide-y !divide-zinc-100">
                  <tr v-for="(test, idx) in data.tests" :key="idx" class="hover:!bg-zinc-50/40">
                    <td class="!px-2 !py-1.5 !min-w-[130px]">
                      <input v-model="test.name" :disabled="!canEdit"
                        class="!w-full !bg-transparent !border-0 !text-[10px] !font-semibold !text-zinc-800 focus:!outline-none focus:!ring-1 focus:!ring-zinc-300 !rounded !px-1 !py-1" />
                    </td>
                    <td class="!px-2 !py-1.5 !min-w-[110px]">
                      <select v-model="test.category" :disabled="!canEdit"
                        class="!w-full !bg-transparent !border-0 !text-[10px] !text-zinc-600 focus:!outline-none focus:!ring-1 focus:!ring-zinc-300 !rounded !px-1 !py-1">
                        <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                      </select>
                    </td>
                    <td class="!px-2 !py-1.5 !min-w-[70px]">
                      <input v-model="test.value" :disabled="!canEdit"
                        class="!w-full !bg-transparent !border-0 !text-[10px] !font-mono !text-zinc-800 focus:!outline-none focus:!ring-1 focus:!ring-zinc-300 !rounded !px-1 !py-1" />
                    </td>
                    <td class="!px-2 !py-1.5 !min-w-[70px]">
                      <input v-model="test.unit" :disabled="!canEdit"
                        class="!w-full !bg-transparent !border-0 !text-[10px] !font-mono !text-zinc-500 focus:!outline-none focus:!ring-1 focus:!ring-zinc-300 !rounded !px-1 !py-1" />
                    </td>
                    <td class="!px-2 !py-1.5 !min-w-[70px]">
                      <input v-model="test.referenceLow" :disabled="!canEdit"
                        class="!w-full !bg-transparent !border-0 !text-[10px] !font-mono !text-zinc-500 focus:!outline-none focus:!ring-1 focus:!ring-zinc-300 !rounded !px-1 !py-1" />
                    </td>
                    <td class="!px-2 !py-1.5 !min-w-[70px]">
                      <input v-model="test.referenceHigh" :disabled="!canEdit"
                        class="!w-full !bg-transparent !border-0 !text-[10px] !font-mono !text-zinc-500 focus:!outline-none focus:!ring-1 focus:!ring-zinc-300 !rounded !px-1 !py-1" />
                    </td>
                    <td class="!px-2 !py-1.5 !text-center">
                      <input v-model="test.abnormalFlag" type="checkbox" :disabled="!canEdit"
                        class="!w-3.5 !h-3.5 !accent-red-600" />
                    </td>
                    <td v-if="canEdit" class="!px-2 !py-1.5 !text-left">
                      <button class="!text-zinc-300 hover:!text-red-600 !transition-colors" @click="removeTest(idx)">
                        <Trash2 class="!w-3.5 !h-3.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="data?.notes" class="!mt-4">
              <p class="!text-[10px] !font-bold !text-zinc-400 !uppercase !tracking-wider !mb-1">
                {{ t('labResults.extraction.notes') }}
              </p>
              <p class="!text-[11px] !text-zinc-600 !leading-relaxed">{{ data.notes }}</p>
            </div>

            <details v-if="extraction.rawText" class="!mt-4 !border !border-zinc-200/70 !rounded-xl !overflow-hidden">
              <summary class="!cursor-pointer !px-3 !py-2 !text-[10px] !font-bold !text-zinc-500 !bg-zinc-50/60">
                {{ t('labResults.extraction.rawText') }}
              </summary>
              <pre class="!p-3 !text-[10px] !text-zinc-600 !whitespace-pre-wrap !font-mono !max-h-48 !overflow-auto">{{ extraction.rawText }}</pre>
            </details>
          </template>
        </div>
      </div>

      <!-- Footer -->
      <div class="!px-6 !py-4 !bg-white !border-t !border-zinc-100 !flex !flex-wrap !items-center !justify-between !gap-2">
        <div class="!flex !items-center !gap-2">
          <button v-if="extraction && status !== 'confirmed'"
            class="!px-3 !py-2 !text-[11px] !font-semibold !text-zinc-500 hover:!bg-zinc-100 !rounded-xl !transition-colors"
            :disabled="reprocessing" @click="reprocess">
            {{ t('labResults.extraction.reprocess') }}
          </button>
        </div>
        <div class="!flex !items-center !gap-2">
          <button class="!px-4 !py-2 !text-xs !font-semibold !text-zinc-500 hover:!bg-zinc-100 !rounded-xl !transition-colors"
            @click="close">{{ $t('common.cancel') }}</button>
          <button v-if="extraction && canEdit"
            class="!px-4 !py-2 !text-xs !font-semibold !text-zinc-700 !bg-zinc-100 hover:!bg-zinc-200 !rounded-xl !transition-colors !flex !items-center !gap-1.5"
            :disabled="saving" @click="save">
            <v-progress-circular v-if="saving" indeterminate size="12" width="2" color="#3f3f46" />
            {{ t('labResults.extraction.save') }}
          </button>
          <button v-if="extraction && canConfirm"
            class="!px-4 !py-2 !text-xs !font-semibold !text-white !bg-zinc-900 hover:!bg-zinc-800 !rounded-xl !transition-colors !shadow-sm !flex !items-center !gap-1.5"
            :disabled="confirming" @click="confirm">
            <v-progress-circular v-if="confirming" indeterminate size="12" width="2" color="white" />
            {{ t('labResults.extraction.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Microscope from '~/components/icons/Microscope.vue'
import X from '~/components/icons/X.vue'
import Eye from '~/components/icons/Eye.vue'
import Plus from '~/components/icons/Plus.vue'
import Trash2 from '~/components/icons/Trash2.vue'

interface ExtractedTest {
  name: string
  nameEn?: string | null
  category?: string | null
  value?: string | null
  unit?: string | null
  referenceLow?: string | null
  referenceHigh?: string | null
  abnormalFlag?: boolean | null
  confidence?: number | null
  page?: number | null
  notes?: string | null
}

interface ExtractedDocument {
  documentType?: string | null
  language?: string | null
  rawText?: string | null
  patient?: Record<string, unknown> | null
  provider?: { labName?: string | null; doctorName?: string | null; reportDate?: string | null } | null
  tests: ExtractedTest[]
  medications?: unknown[]
  diagnoses?: unknown[]
  notes?: string | null
  warnings?: string[]
  confidence?: number | null
}

interface ExtractionRecord {
  id: string
  status: string
  documentType?: string | null
  rawText?: string | null
  structuredData?: ExtractedDocument | null
  confidence?: string | number | null
  error?: string | null
  processedAt?: string | null
}

interface ExtractionResponse {
  attachment: {
    id: string
    fileName: string
    mimeType: string
  }
  extraction: ExtractionRecord | null
}

const props = defineProps<{
  modelValue: boolean
  patientId: string
  attachmentId: string | null
  fileName?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirmed: []
  updated: []
}>()

const { t } = useI18n()
const { apiFetch } = useApi()
const { token } = useAuth()
const { $toast } = useNuxtApp()
const apiBase = useRuntimeConfig().public.apiBase

const categories = [
  'hormone', 'hematology', 'biochemistry', 'tumor_marker', 'microbiology',
  'urinalysis', 'genetics', 'cytology', 'pathology', 'molecular', 'other',
]

const loading = ref(false)
const saving = ref(false)
const confirming = ref(false)
const reprocessing = ref(false)
const loadError = ref('')
const extraction = ref<ExtractionRecord | null>(null)
const data = ref<ExtractedDocument | null>(null)
const attachment = ref<ExtractionResponse['attachment'] | null>(null)
const previewUrl = ref<string | null>(null)
const previewLoading = ref(false)

let previewObjectUrl: string | null = null
let pollTimer: ReturnType<typeof setTimeout> | null = null

const status = computed(() => extraction.value?.status || '')
const canEdit = computed(() => status.value === 'completed')
const validTests = computed(() => (data.value?.tests ?? []).filter((test) => test.name?.trim()))
const canConfirm = computed(() => status.value === 'completed' && validTests.value.length > 0)
const isImage = computed(() => attachment.value?.mimeType?.startsWith('image/') ?? false)
const isPdf = computed(() => attachment.value?.mimeType === 'application/pdf')

function statusLabel(value: string): string {
  return t(`labResults.extraction.status.${value}`)
}

function statusClass(value: string): string {
  switch (value) {
    case 'completed':
      return '!bg-emerald-50 !text-emerald-700 !border !border-emerald-100'
    case 'confirmed':
      return '!bg-blue-50 !text-blue-700 !border !border-blue-100'
    case 'failed':
      return '!bg-red-50 !text-red-700 !border !border-red-100'
    case 'processing':
      return '!bg-amber-50 !text-amber-700 !border !border-amber-100'
    default:
      return '!bg-zinc-100 !text-zinc-500'
  }
}

function confidenceLabel(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '---'
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return '---'
  return `${Math.round(numeric * 100)}%`
}

function clearPreview() {
  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl)
    previewObjectUrl = null
  }
  previewUrl.value = null
}

async function loadPreview() {
  if (!props.attachmentId) return
  clearPreview()
  previewLoading.value = true
  try {
    try {
      const res = await apiFetch<{ success: boolean; data?: { downloadUrl?: string } }>(
        `/api/patients/${props.patientId}/attachments/${props.attachmentId}/download`,
      )
      if (res?.data?.downloadUrl) {
        previewUrl.value = res.data.downloadUrl
        return
      }
    } catch {
      // Local storage has no presigned URL; fall back to authenticated streaming.
    }

    const response = await fetch(
      `${apiBase}/api/patients/files/${props.attachmentId}`,
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    if (!response.ok) return

    const blob = await response.blob()
    previewObjectUrl = URL.createObjectURL(blob)
    previewUrl.value = previewObjectUrl
  } finally {
    previewLoading.value = false
  }
}

async function load() {
  if (!props.attachmentId || !props.patientId) return
  loading.value = !extraction.value
  loadError.value = ''

  try {
    const res = await apiFetch<{ success: boolean; data: ExtractionResponse }>(
      `/api/patients/${props.patientId}/attachments/${props.attachmentId}/extraction`,
    )
    attachment.value = res.data.attachment
    extraction.value = res.data.extraction
    data.value = res.data.extraction?.structuredData ?? null
    if (data.value && !Array.isArray(data.value.tests)) {
      data.value.tests = []
    }
    schedulePoll()
  } catch {
    loadError.value = t('labResults.extraction.loadError')
  } finally {
    loading.value = false
  }
}

function schedulePoll() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  if (!props.modelValue) return
  if (status.value === 'pending' || status.value === 'processing') {
    pollTimer = setTimeout(() => load(), 3000)
  }
}

function buildPayload(): ExtractedDocument | null {
  if (!data.value) return null
  return {
    ...data.value,
    tests: data.value.tests.filter((test) => test.name?.trim()),
  }
}

async function save() {
  const payload = buildPayload()
  if (!payload || !props.attachmentId) return
  saving.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(
      `/api/patients/${props.patientId}/attachments/${props.attachmentId}/extraction`,
      { method: 'PATCH', body: { structuredData: payload } },
    )
    if (res.success) {
      $toast.success(t('labResults.extraction.saved'))
      emit('updated')
    } else {
      $toast.error(t('labResults.extraction.saveError'))
    }
  } catch (err: any) {
    $toast.error(err?.data?.error || t('labResults.extraction.saveError'))
  } finally {
    saving.value = false
  }
}

async function confirm() {
  const payload = buildPayload()
  if (!payload || !props.attachmentId) return
  confirming.value = true
  try {
    const res = await apiFetch<{ success: boolean; error?: string }>(
      `/api/patients/${props.patientId}/attachments/${props.attachmentId}/extraction/confirm`,
      { method: 'POST', body: { structuredData: payload } },
    )
    if (res.success) {
      $toast.success(t('labResults.extraction.confirmed'))
      emit('confirmed')
      close()
    } else {
      $toast.error(res.error || t('labResults.extraction.confirmError'))
    }
  } catch (err: any) {
    $toast.error(err?.data?.error || t('labResults.extraction.confirmError'))
  } finally {
    confirming.value = false
  }
}

async function reprocess() {
  if (!props.attachmentId) return
  reprocessing.value = true
  try {
    const res = await apiFetch<{ success: boolean }>(
      `/api/patients/${props.patientId}/attachments/${props.attachmentId}/extraction/reprocess`,
      { method: 'POST' },
    )
    if (res.success) {
      $toast.success(t('labResults.extraction.reprocessQueued'))
      await load()
    } else {
      $toast.error(t('labResults.extraction.reprocessError'))
    }
  } catch (err: any) {
    $toast.error(err?.data?.error || t('labResults.extraction.reprocessError'))
  } finally {
    reprocessing.value = false
  }
}

function addTest() {
  if (!data.value) return
  data.value.tests.push({
    name: '',
    category: 'other',
    value: '',
    unit: '',
    referenceLow: '',
    referenceHigh: '',
    abnormalFlag: false,
    confidence: null,
    page: null,
    notes: null,
  })
}

function removeTest(index: number) {
  data.value?.tests.splice(index, 1)
}

function close() {
  emit('update:modelValue', false)
}

function reset() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
  clearPreview()
  extraction.value = null
  data.value = null
  attachment.value = null
  loadError.value = ''
  loading.value = false
}

watch(
  () => [props.modelValue, props.attachmentId] as const,
  async ([open, attachmentId], previous) => {
    const [wasOpen, previousAttachmentId] = previous ?? [false, null]
    if (!open) {
      reset()
      return
    }
    if (attachmentId && (attachmentId !== previousAttachmentId || !wasOpen)) {
      reset()
      await Promise.all([load(), loadPreview()])
    }
  },
  { immediate: true },
)

onBeforeUnmount(reset)
</script>
