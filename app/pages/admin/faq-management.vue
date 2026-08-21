<template>
  <div>
    <UiPageContainer>
      <template #header>
        <UiPageHeader :title="t('support.admin.title')">
          <template #actions>
            <v-btn color="primary" @click="openCreateDialog">
              <v-icon start>mdi-plus</v-icon>
              {{ t('support.admin.createFaq') }}
            </v-btn>
          </template>
        </UiPageHeader>
      </template>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <UiStatCard :title="t('support.admin.totalTickets')" :value="stats.total" icon="mdi-ticket" color="primary" />
        <UiStatCard :title="t('support.admin.resolvedTickets')" :value="stats.resolved" icon="mdi-check-circle" color="success" />
        <UiStatCard :title="t('support.admin.pendingTickets')" :value="stats.pending" icon="mdi-clock-outline" color="warning" />
        <UiStatCard :title="t('support.admin.escalatedTickets')" :value="stats.escalated" icon="mdi-alert" color="error" />
      </div>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="mb-4">
        <v-tab value="faq">{{ t('support.admin.allFaq') }}</v-tab>
        <v-tab value="pending">
          {{ t('support.admin.pendingApprovals') }}
          <v-badge v-if="pendingCount > 0" :model-value="true" :content="pendingCount" color="warning" inline class="ms-2" />
        </v-tab>
      </v-tabs>

      <v-tabs-window v-model="activeTab">
        <!-- FAQ List Tab -->
        <v-tabs-window-item value="faq">
          <UiContentCard>
            <!-- Category filter -->
            <div class="mb-4 flex flex-wrap gap-2">
              <v-chip
                v-for="cat in categories"
                :key="cat.value"
                :variant="selectedCategory === cat.value ? 'flat' : 'outlined'"
                :color="selectedCategory === cat.value ? 'primary' : undefined"
                size="small"
                @click="selectedCategory = selectedCategory === cat.value ? '' : cat.value"
              >
                {{ cat.label }}
              </v-chip>
            </div>

            <!-- FAQ Table -->
            <v-data-table
              :headers="faqHeaders"
              :items="faqList"
              :loading="loadingFaq"
              :items-per-page="20"
              hover
            >
              <template #item.questionFa="{ item }">
                <div class="max-w-xs truncate font-medium">{{ item.questionFa }}</div>
              </template>
              <template #item.category="{ item }">
                <v-chip size="x-small" variant="tonal">{{ item.category }}</v-chip>
              </template>
              <template #item.source="{ item }">
                <v-chip size="x-small" :color="sourceColor(item.source)" variant="flat">
                  {{ item.source }}
                </v-chip>
              </template>
              <template #item.usageCount="{ item }">
                <span class="text-gray-500">{{ item.usageCount || 0 }}</span>
              </template>
              <template #item.actions="{ item }">
                <div class="flex gap-1">
                  <v-btn icon size="x-small" variant="text" @click="openEditDialog(item)">
                    <v-icon size="18">mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="x-small" variant="text" color="error" @click="confirmDelete(item)">
                    <v-icon size="18">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </UiContentCard>
        </v-tabs-window-item>

        <!-- Pending Approvals Tab -->
        <v-tabs-window-item value="pending">
          <UiContentCard>
            <div v-if="pendingList.length === 0" class="py-12 text-center text-gray-400">
              {{ t('common.noResults') }}
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="item in pendingList"
                :key="item.id"
                class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
              >
                <div class="mb-3 flex items-start justify-between">
                  <div>
                    <span class="text-xs font-medium text-gray-500">{{ item.category }}</span>
                    <span class="mx-2 text-gray-300">|</span>
                    <span class="text-xs text-gray-400">{{ formatDate(item.createdAt) }}</span>
                  </div>
                  <v-chip size="x-small" color="warning" variant="flat">
                    {{ item.source }}
                  </v-chip>
                </div>

                <h4 class="mb-2 font-semibold text-gray-900 dark:text-white">{{ item.questionFa }}</h4>
                <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">{{ item.answerFa }}</p>

                <div class="flex gap-2">
                  <v-btn size="small" color="success" variant="flat" @click="approveFaqEntry(item.id)">
                    <v-icon start size="16">mdi-check</v-icon>
                    {{ t('support.admin.approve') }}
                  </v-btn>
                  <v-btn size="small" color="error" variant="outlined" @click="deleteFaqEntry(item.id)">
                    <v-icon start size="16">mdi-close</v-icon>
                    {{ t('support.admin.reject') }}
                  </v-btn>
                  <v-btn size="small" variant="text" @click="openEditDialog(item)">
                    <v-icon start size="16">mdi-pencil</v-icon>
                    {{ t('support.admin.edit') }}
                  </v-btn>
                </div>
              </div>
            </div>
          </UiContentCard>
        </v-tabs-window-item>
      </v-tabs-window>

      <!-- Create/Edit Dialog -->
      <v-dialog v-model="dialogOpen" max-width="680" persistent>
        <v-card>
          <v-card-title class="text-lg font-bold">
            {{ editingFaq ? t('support.admin.editFaq') : t('support.admin.createFaq') }}
          </v-card-title>
          <v-card-text>
            <v-textarea
              v-model="form.question_fa"
              :label="t('support.admin.questionFa')"
              rows="2"
              auto-grow
              class="mb-3"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('question_fa')"
            />
            <v-textarea
              v-model="form.answer_fa"
              :label="t('support.admin.answerFa')"
              rows="3"
              auto-grow
              class="mb-3"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('answer_fa')"
            />
            <v-textarea
              v-model="form.question_en"
              :label="t('support.admin.questionEn')"
              rows="2"
              auto-grow
              class="mb-3"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('question_en')"
            />
            <v-textarea
              v-model="form.answer_en"
              :label="t('support.admin.answerEn')"
              rows="3"
              auto-grow
              class="mb-3"
              append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('answer_en')"
            />
            <v-select
              v-model="form.category"
              :items="categories"
              item-title="label"
              item-value="value"
              :label="t('support.admin.category')"
              class="mb-3"
            />
            <v-text-field
              v-model="tagsInput"
              :label="t('support.admin.tags')"
              hint="Comma separated"
              persistent-hint
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="dialogOpen = false">{{ t('support.admin.cancel') }}</v-btn>
            <v-btn color="primary" variant="flat" :loading="saving" @click="saveFaq">
              {{ t('support.admin.save') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation -->
      <v-dialog v-model="deleteDialogOpen" max-width="400">
        <v-card>
          <v-card-title class="text-lg">{{ t('support.admin.confirmDelete') }}</v-card-title>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" @click="deleteDialogOpen = false">{{ t('support.admin.cancel') }}</v-btn>
            <v-btn color="error" variant="flat" :loading="deleting" @click="deleteFaqEntry(deletingId!)">
              {{ t('support.admin.delete') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
    </UiPageContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const { listFaq, createFaq, updateFaq, approveFaq, deleteFaq, getPendingApprovals } = useFaq()
const { apiFetch } = useApi()
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
const nuxtApp = useNuxtApp()

const activeTab = ref('faq')
const selectedCategory = ref('')
const loadingFaq = ref(false)
const saving = ref(false)
const deleting = ref(false)

const faqList = ref<any[]>([])
const pendingList = ref<any[]>([])
const pendingCount = ref(0)
const stats = ref({ total: 0, resolved: 0, pending: 0, escalated: 0, avgResponseTime: 0 })

const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const editingFaq = ref<any>(null)
const deletingId = ref<string | null>(null)
const tagsInput = ref('')

const form = ref({
  question_fa: '',
  answer_fa: '',
  question_en: '',
  answer_en: '',
  category: 'general',
})

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      question_fa: t('support.admin.questionFa'),
      answer_fa: t('support.admin.answerFa'),
      question_en: t('support.admin.questionEn'),
      answer_en: t('support.admin.answerEn'),
    },
    target: form,
  })

const categories = [
  { value: 'general', label: 'عمومی' },
  { value: 'billing', label: 'صورتحساب' },
  { value: 'scheduling', label: 'نوبت‌دهی' },
  { value: 'clinical', label: 'بالینی' },
  { value: 'patients', label: 'بیماران' },
  { value: 'prescriptions', label: 'نسخه‌ها' },
  { value: 'lab_results', label: 'نتایج آزمایش' },
  { value: 'inventory', label: 'انبار' },
  { value: 'accounting', label: 'حسابداری' },
  { value: 'staff', label: 'کارکنان' },
  { value: 'settings', label: 'تنظیمات' },
  { value: 'other', label: 'سایر' },
]

const faqHeaders = [
  { title: t('support.admin.questionFa'), key: 'questionFa', sortable: true },
  { title: t('support.admin.category'), key: 'category', sortable: true },
  { title: t('support.admin.source'), key: 'source', sortable: true },
  { title: 'Usage', key: 'usageCount', sortable: true },
  { title: t('common.actions'), key: 'actions', sortable: false, align: 'end' as const },
]

const sourceColor = (source: string) => {
  switch (source) {
    case 'manual': return 'blue'
    case 'gemini': return 'purple'
    case 'groq': return 'indigo'
    case 'user_confirmed': return 'green'
    case 'approved': return 'teal'
    default: return 'grey'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR')
}

const loadData = async () => {
  loadingFaq.value = true
  try {
    const [faqResult, pendingResult, statsResult] = await Promise.all([
      listFaq('fa', selectedCategory.value || undefined),
      getPendingApprovals(),
      apiFetch<{ success: true; data: any }>('/api/support/stats').catch(() => ({ success: true as const, data: { total: 0, resolved: 0, pending: 0, escalated: 0, avgResponseTime: 0 } })),
    ])
    faqList.value = faqResult.data
    pendingList.value = pendingResult.data
    pendingCount.value = pendingResult.pagination.total
    stats.value = statsResult.data
  } finally {
    loadingFaq.value = false
  }
}

const openCreateDialog = () => {
  editingFaq.value = null
  form.value = { question_fa: '', answer_fa: '', question_en: '', answer_en: '', category: 'general' }
  tagsInput.value = ''
  dialogOpen.value = true
}

const openEditDialog = (item: any) => {
  editingFaq.value = item
  form.value = {
    question_fa: item.questionFa,
    answer_fa: item.answerFa,
    question_en: item.questionEn || '',
    answer_en: item.answerEn || '',
    category: item.category,
  }
  tagsInput.value = item.tags?.join(', ') || ''
  dialogOpen.value = true
}

const saveFaq = async () => {
  saving.value = true
  try {
    const dto = {
      ...form.value,
      tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    }
    if (editingFaq.value) {
      await updateFaq(editingFaq.value.id, dto)
    } else {
      await createFaq(dto)
    }
    nuxtApp.$toast.success(t('support.admin.savedSuccess'))
    dialogOpen.value = false
    await loadData()
  } catch {
    nuxtApp.$toast.error('Error')
  } finally {
    saving.value = false
  }
}

const approveFaqEntry = async (id: string) => {
  try {
    await approveFaq(id)
    nuxtApp.$toast.success(t('support.admin.approvedSuccess'))
    await loadData()
  } catch {
    nuxtApp.$toast.error('Error')
  }
}

const confirmDelete = (item: any) => {
  deletingId.value = item.id
  deleteDialogOpen.value = true
}

const deleteFaqEntry = async (id: string) => {
  deleting.value = true
  try {
    await deleteFaq(id)
    nuxtApp.$toast.success(t('support.admin.deletedSuccess'))
    deleteDialogOpen.value = false
    await loadData()
  } catch {
    nuxtApp.$toast.error('Error')
  } finally {
    deleting.value = false
  }
}

watch(selectedCategory, () => loadData())

onMounted(() => loadData())
</script>
