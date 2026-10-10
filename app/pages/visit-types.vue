<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head vt-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('visitTypes.title') }}</h1>
        <p class="dash-head__date">{{ t('visitTypes.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button type="button" class="asa-btn asa-btn--primary" @click="openCreateDialog">
          <v-icon size="16">mdi-plus</v-icon>
          {{ t('visitTypes.addNew') }}
        </button>
      </div>
    </header>

    <!-- ─── Loading skeletons ─── -->
    <div v-if="loading && !visitTypes.length">
      <div class="vt-metrics">
        <div v-for="n in 4" :key="`m-${n}`" class="asa-skel vt-metric-skel" />
      </div>
      <div class="asa-skel vt-list-skel" />
    </div>

    <template v-else>
      <!-- ─── Overview metrics ─── -->
      <section class="asa-sec">
        <p class="asa-sec__label">{{ t('visitTypes.overview') }}</p>
        <div class="vt-metrics">
          <article v-for="m in metrics" :key="m.key" class="asa-card vt-metric">
            <span class="asa-tint" :class="m.tint" aria-hidden="true">
              <component :is="m.icon" class="w-5! h-5! fill-current" />
            </span>
            <div class="vt-metric__copy">
              <p class="vt-metric__value">{{ m.value }}</p>
              <p class="vt-metric__label">{{ m.label }}</p>
            </div>
            <p class="vt-metric__foot">
              <span class="vt-dot" :class="m.dot" aria-hidden="true" />
              {{ m.foot }}
            </p>
          </article>
        </div>
      </section>

      <!-- ─── Frosted toolbar: search / count / refresh ─── -->
      <div class="asa-toolbar">
        <div class="asa-field asa-field--search">
          <v-text-field v-model="searchQuery" variant="solo" density="comfortable" hide-details clearable
            :placeholder="t('visitTypes.searchPlaceholder')" prepend-inner-icon="mdi-magnify" />
        </div>
        <div class="flex-1! min-w-0" />
        <span class="asa-pill asa-pill--teal whitespace-nowrap!">
          {{ t('visitTypes.typeCount', { count: filteredVisitTypes.length }) }}
        </span>
        <v-tooltip :text="t('visitTypes.refresh')" location="top">
          <template #activator="{ props }">
            <button v-bind="props" type="button" class="asa-icon-btn" :disabled="loading"
              :aria-label="t('visitTypes.refresh')" @click="fetchVisitTypes">
              <v-icon :size="18" :class="{ 'animate-spin!': loading }">mdi-refresh</v-icon>
            </button>
          </template>
        </v-tooltip>
      </div>

      <!-- ─── Empty: no match with active search ─── -->
      <div v-if="!filteredVisitTypes.length && hasQuery" class="asa-card asa-empty">
        <span class="asa-tint asa-tint--indigo" aria-hidden="true">
          <v-icon icon="mdi-filter-off-outline" size="32" />
        </span>
        <p class="asa-empty__title">{{ t('visitTypes.noResults') }}</p>
        <p class="asa-empty__sub">{{ t('visitTypes.noResultsDesc') }}</p>
        <button type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="searchQuery = ''">
          <v-icon size="14">mdi-filter-remove-outline</v-icon>
          {{ t('common.clear') }}
        </button>
      </div>

      <!-- ─── Empty: no visit types yet ─── -->
      <div v-else-if="!visitTypes.length" class="asa-card asa-empty">
        <span class="asa-tint asa-tint--teal" aria-hidden="true">
          <Grid class="w-8! h-8! fill-current" />
        </span>
        <p class="asa-empty__title">{{ t('visitTypes.noTypesDefined') }}</p>
        <p class="asa-empty__sub">{{ t('visitTypes.addFirst') }}</p>
        <button type="button" class="asa-btn asa-btn--primary asa-btn--sm" @click="openCreateDialog">
          <v-icon size="14">mdi-plus</v-icon>
          {{ t('visitTypes.addNew') }}
        </button>
      </div>

      <!-- ─── Visit type list ─── -->
      <template v-else>
        <!-- Desktop table (lg and up) -->
        <section class="asa-sec hidden! lg:block!">
          <div class="asa-card vt-table-card">
            <div class="vt-table-wrap">
              <table class="vt-table">
                <thead>
                  <tr>
                    <th>{{ t('visitTypes.colName') }}</th>
                    <th>{{ t('visitTypes.colDuration') }}</th>
                    <th>{{ t('visitTypes.colPrice') }}</th>
                    <th>{{ t('visitTypes.colStatus') }}</th>
                    <th class="vt-th-end">{{ t('common.actions') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="vt in filteredVisitTypes" :key="vt.id">
                    <td>
                      <div class="flex items-center gap-3 min-w-0">
                        <span class="vt-avatar vt-avatar--sm" :class="tintOf(vt)"
                          :style="avatarStyle(vt)">{{ firstLetter(vt.name) }}</span>
                        <span class="min-w-0">
                          <span class="vt-td-name block">{{ vt.name }}</span>
                          <span v-if="vt.description" class="vt-td-desc block">{{ vt.description }}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span class="flex items-center gap-1.5 whitespace-nowrap!">
                        <Clock class="w-4! h-4! fill-current opacity-60" />
                        {{ vt.durationMinutes }} {{ t('visitTypes.minutes') }}
                      </span>
                    </td>
                    <td>
                      <span class="vt-price whitespace-nowrap!">{{ priceLabel(vt) }}</span>
                    </td>
                    <td>
                      <span class="asa-pill" :class="vt.isActive ? 'asa-pill--teal' : 'vt-pill--neutral'">
                        {{ vt.isActive ? t('visitTypes.active') : t('visitTypes.inactive') }}
                      </span>
                    </td>
                    <td class="vt-th-end">
                      <div class="flex items-center justify-end gap-1.5">
                        <v-tooltip :text="t('visitTypes.edit')" location="top">
                          <template #activator="{ props }">
                            <button v-bind="props" type="button" class="asa-icon-btn" :aria-label="t('visitTypes.edit')"
                              @click="openEditDialog(vt)">
                              <v-icon size="17">mdi-pencil</v-icon>
                            </button>
                          </template>
                        </v-tooltip>
                        <v-tooltip :text="t('visitTypes.delete')" location="top">
                          <template #activator="{ props }">
                            <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--danger"
                              :aria-label="t('visitTypes.delete')" @click="confirmDelete(vt)">
                              <v-icon size="17">mdi-trash-can-outline</v-icon>
                            </button>
                          </template>
                        </v-tooltip>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <!-- Tablet / mobile cards -->
        <div class="lg:hidden! mt-4! space-y-3!">
          <article v-for="vt in filteredVisitTypes" :key="`c-${vt.id}`" class="asa-card asa-pcard vt-pcard">
            <span class="vt-avatar vt-avatar--lg" :class="tintOf(vt)" :style="avatarStyle(vt)">
              {{ firstLetter(vt.name) }}
            </span>
            <div class="asa-pcard__main">
              <p class="asa-pcard__name">
                {{ vt.name }}
                <span class="asa-pill vt-status-pill" :class="vt.isActive ? 'asa-pill--teal' : 'vt-pill--neutral'">
                  {{ vt.isActive ? t('visitTypes.active') : t('visitTypes.inactive') }}
                </span>
              </p>
              <p v-if="vt.description" class="asa-pcard__meta vt-desc-line">{{ vt.description }}</p>
              <p class="asa-pcard__meta">
                <span class="flex items-center gap-1.5">
                  <Clock class="w-4! h-4! fill-current opacity-60" />
                  {{ vt.durationMinutes }} {{ t('visitTypes.minutes') }}
                </span>
                <span class="asa-dot-inline" aria-hidden="true" />
                <span class="vt-price">{{ priceLabel(vt) }}</span>
              </p>
            </div>
            <div class="vt-pcard__actions">
              <button type="button" class="asa-icon-btn" :aria-label="t('visitTypes.edit')" @click="openEditDialog(vt)">
                <v-icon size="17">mdi-pencil</v-icon>
              </button>
              <button type="button" class="asa-icon-btn asa-icon-btn--danger" :aria-label="t('visitTypes.delete')"
                @click="confirmDelete(vt)">
                <v-icon size="17">mdi-trash-can-outline</v-icon>
              </button>
            </div>
          </article>
        </div>
      </template>
    </template>

    <!-- ─── Create / Edit dialog ─── -->
    <v-dialog v-model="dialog" max-width="560">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title text-xl!">{{ editingId ? t('visitTypes.editType') : t('visitTypes.addType') }}</h2>
            <span class="asa-dialog__sub">{{ t('visitTypes.subtitle') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="dialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <v-form ref="formRef" @submit.prevent="saveVisitType">
            <div class="space-y-5!">
              <div class="asa-field">
                <label class="asa-field-label">{{ t('visitTypes.typeName') }} <span class="vt-req">*</span></label>
                <v-text-field v-model="form.name" variant="solo" density="comfortable" hide-details
                  :placeholder="t('visitTypes.typeNameExample')"
                  :rules="[v => !!v?.trim() || t('visitTypes.typeNameRequired')]" />
              </div>

              <div class="asa-field">
                <label class="asa-field-label">{{ t('visitTypes.description') }}</label>
                <v-textarea v-model="form.description" variant="solo" density="comfortable" rows="2" auto-grow hide-details
                  :placeholder="t('visitTypes.descriptionPlaceholder')" />
              </div>

              <div class="grid grid-cols-1! gap-5! sm:grid-cols-2!">
                <div class="asa-field">
                  <label class="asa-field-label">{{ t('visitTypes.duration') }} <span class="vt-req">*</span></label>
                  <v-text-field v-model.number="form.durationMinutes" variant="solo" density="comfortable" type="number"
                    min="5" max="480" hide-details placeholder="30"
                    :rules="[v => v !== null && v !== undefined && v !== '' || t('visitTypes.durationRequired'), v => v === null || v === undefined || v === '' || v >= 5 || t('visitTypes.durationMin')]" />
                </div>

                <div class="asa-field">
                  <label class="asa-field-label">{{ t('visitTypes.price') }}</label>
                  <v-text-field v-model.number="form.price" variant="solo" density="comfortable" type="number"
                    min="0" hide-details placeholder="0"
                    :rules="[v => v === null || v === undefined || v === '' || v >= 0 || t('visitTypes.priceNegative')]" />
                </div>
              </div>

              <div>
                <label class="asa-field-label">{{ t('visitTypes.color') }} <span class="vt-req">*</span></label>
                <div class="vt-swatches">
                  <button v-for="c in colorPalette" :key="c" type="button" class="vt-swatch"
                    :class="{ 'vt-swatch--selected': form.color === c }"
                    :style="{ backgroundColor: c }" :aria-label="c" @click="form.color = c">
                    <span v-if="form.color === c" class="vt-swatch__check" aria-hidden="true">
                      <v-icon size="12" color="#ffffff">mdi-check</v-icon>
                    </span>
                  </button>
                </div>
              </div>

              <div class="asa-field">
                <v-switch v-model="form.isActive" color="rgba(0, 173, 181, 1)" hide-details
                  :label="t('visitTypes.active')" inset />
              </div>
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="saving" @click="dialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn asa-btn--primary" :disabled="saving" @click="saveVisitType">
            <v-icon v-if="saving" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ editingId ? t('visitTypes.saveChanges') : t('visitTypes.createType') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Delete confirmation dialog ─── -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint asa-tint--rose" aria-hidden="true">
              <v-icon size="20">mdi-trash-can-outline</v-icon>
            </span>
            <div class="min-w-0">
              <h2 class="asa-dialog__title text-lg!">{{ t('visitTypes.deleteTitle') }}</h2>
              <span class="asa-dialog__sub">{{ t('visitTypes.deleteConfirm', { name: deletingItem?.name }) }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="deleteDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button type="button" class="asa-btn asa-btn--ghost" :disabled="saving" @click="deleteDialog = false">
            {{ t('common.cancel') }}
          </button>
          <button type="button" class="asa-btn vt-btn--destructive" :disabled="saving" @click="deleteVisitType">
            <v-icon v-if="saving" size="15" class="animate-spin!">mdi-loading</v-icon>
            {{ t('common.delete') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Grid from '~/components/icons/Grid.vue'
import Clock from '~/components/icons/Clock.vue'
import Wallet from '~/components/icons/Wallet.vue'
import LineChart from '~/components/icons/LineChart.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'

interface VisitTypeItem {
  id: string
  doctorId?: string
  name: string
  description?: string
  durationMinutes: number
  price: number | null
  color: string
  isActive: boolean
}

interface VisitTypeForm {
  name: string
  description: string
  durationMinutes: number | null
  price: number | null
  color: string
  isActive: boolean
}

const { t } = useI18n()
const { apiFetch } = useApi()
const { user } = useAuth()
const { $toast } = useNuxtApp()
const { formatPrice, formatPriceDetail } = useFormatting()

const visitTypes = ref<VisitTypeItem[]>([])
const loading = ref(true)
const saving = ref(false)
const searchQuery = ref('')

const colorPalette = [
  '#3B82F6', '#A2D2FF', '#8B5CF6', '#A855F7',
  '#EC4899', '#EF4444', '#F97316', '#EAB308',
  '#22C55E', '#14B8A6', '#06B6D4', '#0EA5E9',
]

const defaultForm = (): VisitTypeForm => ({
  name: '',
  description: '',
  durationMinutes: 30,
  price: null,
  color: '#5f8feb',
  isActive: true,
})

const form = ref<VisitTypeForm>(defaultForm())
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)

const dialog = ref(false)
const deleteDialog = ref(false)
const editingId = ref<string | null>(null)
const deletingItem = ref<VisitTypeItem | null>(null)

// ─── Derived list ───
const hasQuery = computed(() => searchQuery.value.trim() !== '')

const filteredVisitTypes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return visitTypes.value
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((vt) => {
      if (!q) return true
      return `${vt.name} ${vt.description || ''}`.toLowerCase().includes(q)
    })
})

// ─── Overview metrics ───
const metrics = computed(() => {
  const list = visitTypes.value
  const total = list.length
  const avgMin = total
    ? Math.round(list.reduce((sum, vt) => sum + (vt.durationMinutes || 0), 0) / total)
    : 0
  const prices = list
    .map((vt) => vt.price)
    .filter((p): p is number => p !== null && p !== undefined && !Number.isNaN(p))
  const min = prices.length ? Math.min(...prices) : null
  const max = prices.length ? Math.max(...prices) : null
  const priceDigits = (p: number | null) =>
    p === null ? '—' : formatPriceDetail(p).digits

  return [
    {
      key: 'total', icon: Grid, tint: 'asa-tint--indigo', dot: 'vt-dot--indigo',
      value: total, label: t('visitTypes.metricTotal'),
      foot: t('visitTypes.metricTotalFoot'),
    },
    {
      key: 'avg', icon: Clock, tint: 'asa-tint--amber', dot: 'vt-dot--amber',
      value: avgMin, label: t('visitTypes.metricAvg'),
      foot: t('visitTypes.metricAvgFoot'),
    },
    {
      key: 'cheap', icon: Wallet, tint: 'asa-tint--green', dot: 'vt-dot--green',
      value: priceDigits(min), label: t('visitTypes.metricCheapest'),
      foot: t('visitTypes.metricCheapestFoot'),
    },
    {
      key: 'pricey', icon: LineChart, tint: 'asa-tint--rose', dot: 'vt-dot--rose',
      value: priceDigits(max), label: t('visitTypes.metricCostly'),
      foot: t('visitTypes.metricCostlyFoot'),
    },
  ]
})

// ─── Helpers ───
const firstLetter = (name: string) => (name?.trim()?.charAt(0) || '·').toUpperCase()

const tintOf = (vt: VisitTypeItem) => {
  const map: Record<string, string> = {
    '#3B82F6': 'vt-avatar--blue', '#A2D2FF': 'vt-avatar--blue',
    '#8B5CF6': 'vt-avatar--purple', '#A855F7': 'vt-avatar--purple',
    '#EC4899': 'vt-avatar--pink', '#EF4444': 'vt-avatar--red',
    '#F97316': 'vt-avatar--orange', '#EAB308': 'vt-avatar--amber',
    '#22C55E': 'vt-avatar--green', '#14B8A6': 'vt-avatar--teal',
    '#06B6D4': 'vt-avatar--cyan', '#0EA5E9': 'vt-avatar--blue',
  }
  return map[vt.color] || 'vt-avatar--default'
}

const avatarStyle = (vt: VisitTypeItem) => {
  const color = vt.color || '#5f8feb'
  return {
    backgroundColor: `color-mix(in srgb, ${color} 16%, transparent)`,
    color,
    borderColor: `color-mix(in srgb, ${color} 34%, transparent)`,
  }
}

const priceLabel = (vt: VisitTypeItem) =>
  vt.price !== null && vt.price !== undefined && !Number.isNaN(vt.price)
    ? formatPrice(vt.price)
    : '—'

// ─── Data ───
async function fetchVisitTypes() {
  const doctorId = user.value?.id
  if (!doctorId) return
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: VisitTypeItem[] }>(`/api/visit-types/${doctorId}`)
    if (res.success) {
      visitTypes.value = (res.data || []).map((vt) => ({
        id: vt.id,
        doctorId: vt.doctorId,
        name: vt.name,
        description: vt.description || undefined,
        durationMinutes: Number(vt.durationMinutes) || 30,
        price: vt.price !== null && vt.price !== undefined ? Number(vt.price) : null,
        color: vt.color || '#5f8feb',
        isActive: vt.isActive ?? true,
      }))
    }
  } catch {
    $toast.error(t('visitTypes.fetchError'))
  } finally {
    loading.value = false
  }
}

// ─── Form ───
function resetForm() {
  form.value = defaultForm()
  editingId.value = null
}

function openCreateDialog() {
  resetForm()
  dialog.value = true
}

function openEditDialog(vt: VisitTypeItem) {
  editingId.value = vt.id
  form.value = {
    name: vt.name,
    description: vt.description || '',
    durationMinutes: vt.durationMinutes,
    price: vt.price,
    color: vt.color,
    isActive: vt.isActive,
  }
  dialog.value = true
}

async function saveVisitType() {
  const formEl = formRef.value
  if (formEl) {
    const { valid } = await formEl.validate()
    if (!valid) return
  }

  saving.value = true
  try {
    const bodyBase = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      durationMinutes: form.value.durationMinutes ?? 30,
      price: form.value.price && form.value.price > 0 ? form.value.price : undefined,
      color: form.value.color,
    }

    if (editingId.value) {
      await apiFetch<{ success: boolean }>(`/api/visit-types/${editingId.value}`, {
        method: 'PUT',
        body: { ...bodyBase, isActive: form.value.isActive },
      })
      $toast.success(t('visitTypes.updatedSuccess'))
    } else {
      await apiFetch<{ success: boolean }>('/api/visit-types/', {
        method: 'POST',
        body: bodyBase,
      })
      $toast.success(t('visitTypes.createdSuccess'))
    }

    dialog.value = false
    await fetchVisitTypes()
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('visitTypes.saveError'))
  } finally {
    saving.value = false
  }
}

// ─── Delete ───
function confirmDelete(vt: VisitTypeItem) {
  deletingItem.value = vt
  deleteDialog.value = true
}

async function deleteVisitType() {
  if (!deletingItem.value) return
  const target = deletingItem.value
  saving.value = true
  try {
    await apiFetch<{ success: boolean }>(`/api/visit-types/${target.id}`, { method: 'DELETE' })
    $toast.success(t('visitTypes.deletedSuccess'))
    deleteDialog.value = false
    deletingItem.value = null
    await fetchVisitTypes()
  } catch (err) {
    const error = err as { data?: { error?: string } }
    $toast.error(error.data?.error || t('visitTypes.deleteError'))
  } finally {
    saving.value = false
  }
}

onMounted(() => fetchVisitTypes())

useSeoMeta({ title: t('visitTypes.titleSeo') })
</script>

<style scoped>
/* ── Top spacing ─────────────────────────────── */
.vt-head {
  margin-top: 0.25rem;
}

/* ── Frosted, sticky toolbar ─────────────────── */
.asa-toolbar {
  position: sticky;
  top: 0.75rem;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: 1.25rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-bg-card) 82%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.8);
  backdrop-filter: blur(18px) saturate(1.8);
  box-shadow: var(--asa-card-shadow);
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.asa-field--search {
  flex: 1 1 16rem;
  min-width: 13rem;
}

.asa-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.asa-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.asa-field :deep(.v-field__overlay) {
  background: transparent;
}

.asa-field :deep(.v-field__input),
.asa-field :deep(.v-field__input::placeholder),
.asa-field :deep(.v-label) {
  color: var(--asa-label);
}

.asa-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.asa-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.asa-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

.asa-field :deep(.v-messages) {
  display: none;
}

/* ── Compact icon buttons ─────────────────────── */
.asa-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.asa-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.dark .asa-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.asa-icon-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.asa-icon-btn--danger {
  color: var(--asa-label-2);
}

.asa-icon-btn--danger:hover {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

/* ── Metrics grid ─────────────────────────────── */
.vt-metrics {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.875rem;
}

@media (min-width: 560px) {
  .vt-metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1280px) {
  .vt-metrics {
    grid-template-columns: repeat(4, 1fr);
  }
}

.vt-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 1rem;
  padding: 1.125rem 1.25rem;
}

.vt-metric__copy {
  min-width: 0;
  text-align: end;
}

.vt-metric__value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vt-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.vt-metric__foot {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--asa-sep);
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.vt-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-label-3) 18%, transparent);
}

.vt-dot--indigo {
  background: var(--asa-indigo);
  box-shadow: 0 0 0 3px var(--asa-indigo-soft);
}

.vt-dot--amber {
  background: var(--asa-amber);
  box-shadow: 0 0 0 3px var(--asa-amber-soft);
}

.vt-dot--green {
  background: var(--asa-green);
  box-shadow: 0 0 0 3px var(--asa-green-soft);
}

.vt-dot--rose {
  background: var(--asa-rose);
  box-shadow: 0 0 0 3px var(--asa-rose-soft);
}

/* ── Skeleton blocks ──────────────────────────── */
.vt-metric-skel {
  height: 7.5rem;
  border-radius: 1.375rem;
}

.vt-list-skel {
  height: 22rem;
  margin-top: 1.25rem;
  border-radius: 1.375rem;
}

/* ── Color avatar (first letter on tint) ──────── */
.vt-avatar {
  display: grid;
  place-items: center;
  font-weight: 700;
  flex-shrink: 0;
  border: 1px solid transparent;
}

.vt-avatar--sm {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
}

.vt-avatar--lg {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  font-size: 1rem;
}

/* ── Desktop table ────────────────────────────── */
.vt-table-card {
  padding: 0;
  overflow: hidden;
}

.vt-table-wrap {
  overflow-x: auto;
}

.vt-table {
  width: 100%;
  min-width: 46rem;
  border-collapse: collapse;
  text-align: start;
}

.vt-table thead th {
  padding: 0.875rem 1.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.vt-table tbody td {
  padding: 0.875rem 1.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-top: 1px solid var(--asa-sep);
  white-space: nowrap;
  vertical-align: middle;
}

.vt-table tbody tr {
  transition: background-color 150ms var(--ease-default);
}

.vt-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .vt-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.vt-th-end {
  text-align: end !important;
}

.vt-td-name {
  display: block;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vt-td-desc {
  min-width: 0;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--asa-label-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vt-price {
  font-weight: 600;
  color: var(--asa-label);
}

/* ── Pill variants ────────────────────────────── */
.vt-pill--neutral {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
}

/* ── Tablet / mobile cards ────────────────────── */
.asa-pcard {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.9375rem 1rem;
}

.asa-pcard__main {
  min-width: 0;
  flex: 1 1 auto;
}

.asa-pcard__name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-pcard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.asa-dot-inline {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

.vt-status-pill {
  margin-inline-start: 0.25rem;
}

.vt-pcard__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.vt-pcard__actions .asa-icon-btn {
  width: 2rem;
  height: 2rem;
}

@media (min-width: 480px) {
  .vt-pcard__actions {
    flex-direction: row;
    align-items: center;
  }
}

/* ── Empty state ──────────────────────────────── */
.asa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.asa-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-empty__sub {
  margin-top: -0.5rem;
  max-width: 26rem;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

/* ── Create / edit dialog ─────────────────────── */
.vt-req {
  color: var(--asa-rose);
}

.vt-swatches {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(2.375rem, 1fr));
  gap: 0.225rem;
}

.vt-swatch {
  position: relative;
  aspect-ratio: 1;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: transform 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.vt-swatch:hover {
  transform: scale(1.06);
}

.vt-swatch--selected {
  box-shadow: 0 0 0 2px var(--asa-bg-card), 0 0 0 4px var(--asa-accent);
  transform: scale(1.08);
}

.vt-swatch__check {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
}

.vt-swatch__check .v-icon {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.35));
}

.vt-btn--destructive {
  background: var(--asa-rose);
  color: #ffffff;
}

.vt-btn--destructive:hover {
  background: color-mix(in srgb, var(--asa-rose) 88%, #000);
}

/* ── Responsive tuning ────────────────────────── */
@media (max-width: 480px) {
  .asa-field--search {
    flex-basis: 100% !important;
  }

  .vt-pcard__actions {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>