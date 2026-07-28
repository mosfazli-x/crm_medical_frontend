<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('staff.title')" :subtitle="$t('staff.subtitle')">
      <template #actions>
        <v-btn variant="flat" class="crm-btn crm-btn-accent" @click="openCreateDialog">
          <v-icon start size="18">mdi-account-plus-outline</v-icon>
          {{ $t('staff.addNew') }}
        </v-btn>
      </template>
    </UiPageHeader>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <UiStatCard :label="$t('staff.totalStaff')" :value="staffList.length">
        <template #icon>
          <v-icon size="24" color="#4F46E5">mdi-account-group-outline</v-icon>
        </template>
      </UiStatCard>
      <UiStatCard :label="$t('staff.activeStaff')" :value="activeCount" valueClass="!text-emerald-600">
        <template #icon>
          <v-icon size="24" color="#059669">mdi-account-check-outline</v-icon>
        </template>
      </UiStatCard>
      <UiStatCard :label="$t('staff.inactiveStaff')" :value="inactiveCount" valueClass="!text-red-500">
        <template #icon>
          <v-icon size="24" color="#EF4444">mdi-account-cancel-outline</v-icon>
        </template>
      </UiStatCard>
      <UiStatCard :label="$t('staff.todayPresent')" :value="todayPresentCount" valueClass="!text-amber-600">
        <template #icon>
          <v-icon size="24" color="#D97706">mdi-clock-check-outline</v-icon>
        </template>
      </UiStatCard>
    </div>

    <UiContentCard>
      <div class="flex flex-wrap items-center gap-3 mb-4 px-3 py-3">
        <v-text-field
          v-model="searchQuery"
          variant="outlined"
          density="compact"
          :placeholder="$t('staff.searchPlaceholder')"
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="max-w-xs"
        />
        <v-select
          v-model="statusFilter"
          :items="statusFilterOptions"
          variant="outlined"
          density="compact"
          hide-details
          class="max-w-[160px]"
        />
      </div>

      <div class="crm-table-wrap">
        <table class="crm-table">
          <thead>
            <tr>
              <th>{{ $t('staff.name') }}</th>
              <th>{{ $t('staff.phone') }}</th>
              <th>{{ $t('staff.position') }}</th>
              <th>{{ $t('staff.hireDate') }}</th>
              <th>{{ $t('staff.status') }}</th>
              <th class="text-center!">{{ $t('staff.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="staff in filteredStaff"
              :key="staff.id"
              class="hover:bg-slate-50/80 dark:hover:bg-slate-700/60 transition-colors duration-150"
            >
              <td class="crm-table-primary">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-lg bg-[var(--crm-primary-light)] flex items-center justify-center shrink-0">
                    <span class="text-[var(--crm-text-accent)] font-bold text-sm">{{ (staff.fullName || '').charAt(0) }}</span>
                  </div>
                  <span class="text-sm font-semibold crm-text">{{ staff.fullName }}</span>
                </div>
              </td>
              <td class="font-mono tracking-wider" dir="ltr">{{ staff.phone }}</td>
              <td>
                <span class="crm-badge crm-badge-blue">{{ staff.position || '---' }}</span>
              </td>
              <td class="whitespace-nowrap">{{ formatJalaliDate(staff.employmentDate) }}</td>
              <td class="whitespace-nowrap">
                <span :class="staff.isActive !== false ? 'crm-badge crm-badge-completed' : 'crm-badge crm-badge-neutral'">
                  {{ staff.isActive !== false ? $t('staff.activeStaff') : $t('staff.inactiveStaff') }}
                </span>
              </td>
              <td class="text-center!">
                <div class="flex justify-center items-center gap-1">
                  <v-tooltip :text="$t('staff.viewProfile')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn" :to="`/staff/${staff.id}`">
                        <v-icon size="20">mdi-account-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip :text="$t('staff.edit')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn" @click="openEditDialog(staff)">
                        <v-icon size="20">mdi-pencil-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip :text="staff.isActive !== false ? $t('staff.deactivate') : $t('staff.activate')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small"
                        :class="staff.isActive !== false ? 'crm-icon-btn crm-icon-btn-danger' : 'crm-icon-btn'"
                        @click="toggleStatus(staff)">
                        <v-icon size="20">{{ staff.isActive !== false ? 'mdi-account-cancel-outline' : 'mdi-account-check-outline' }}</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                  <v-tooltip :text="$t('staff.delete')" location="top">
                    <template #activator="{ props }">
                      <v-btn v-bind="props" icon variant="text" size="small" class="crm-icon-btn crm-icon-btn-danger" @click="deleteStaff(staff)">
                        <v-icon size="20">mdi-delete-outline</v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="loading" class="crm-loading">
        <v-progress-circular indeterminate size="48" color="#4F46E5" />
        <p class="crm-loading-text">{{ $t('common.loading') }}</p>
      </div>

      <UiEmptyState v-if="!loading && filteredStaff.length === 0" :title="$t('staff.noStaff')" :description="$t('staff.noStaffDescription')">
        <template #icon>
          <v-icon size="48" color="#d1d5db">mdi-account-group-outline</v-icon>
        </template>
        <template #action>
          <v-btn variant="flat" class="crm-btn crm-btn-accent" @click="openCreateDialog">
            <v-icon start size="18">mdi-account-plus-outline</v-icon>
            {{ $t('staff.addNew') }}
          </v-btn>
        </template>
      </UiEmptyState>
    </UiContentCard>

    <StaffFormDialog v-model="formDialog" :staff="selectedStaff" :edit-mode="editMode" @saved="fetchStaff" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StaffFormDialog from '~/components/staff/StaffFormDialog.vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { formatJalaliDate } = useFormatting()
const { t } = useI18n()

const staffList = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const formDialog = ref(false)
const selectedStaff = ref<any>(null)
const editMode = ref(false)

const statusFilterOptions = computed(() => [
  { title: t('staff.filterAll'), value: 'all' },
  { title: t('staff.activeStaff'), value: 'active' },
  { title: t('staff.inactiveStaff'), value: 'inactive' },
])

const activeCount = computed(() => staffList.value.filter(s => s.isActive !== false).length)
const inactiveCount = computed(() => staffList.value.filter(s => s.isActive === false).length)
const todayPresentCount = ref(0)

const filteredStaff = computed(() => {
  let result = staffList.value
  if (statusFilter.value === 'active') result = result.filter(s => s.isActive !== false)
  if (statusFilter.value === 'inactive') result = result.filter(s => s.isActive === false)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(s => (s.fullName || '').toLowerCase().includes(q) || (s.phone || '').includes(q))
  }
  return result
})

const fetchStaff = async () => {
  loading.value = true
  try {
    const res = await apiFetch<any>('/api/staff')
    if (res.success) staffList.value = res.data
  } catch {
    $toast.error(t('staff.fetchError'))
  } finally {
    loading.value = false
  }
}

const fetchTodayCount = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const res = await apiFetch<any>(`/api/staff/attendance/report?startDate=${today}&endDate=${today}`)
    if (res.success && res.data?.summary) {
      todayPresentCount.value = res.data.summary.reduce((sum: number, s: any) => sum + (s.presentDays || 0) + (s.lateDays || 0), 0)
    }
  } catch { /* ignore */ }
}

const openCreateDialog = () => {
  selectedStaff.value = null
  editMode.value = false
  formDialog.value = true
}

const openEditDialog = (staff: any) => {
  selectedStaff.value = staff
  editMode.value = true
  formDialog.value = true
}

const toggleStatus = async (staff: any) => {
  const isActive = staff.isActive !== false
  const action = isActive ? t('staff.deactivate') : t('staff.activate')
  if (!confirm(t('staff.confirmToggle', { action, name: staff.fullName }))) return

  try {
    const endpoint = isActive ? 'deactivate' : 'activate'
    const res = await apiFetch<any>(`/api/staff/${staff.id}/${endpoint}`, { method: 'POST' })
    if (res.success) {
      $toast.success(t('staff.toggleSuccess', { action }))
      fetchStaff()
    }
  } catch {
    $toast.error(t('staff.statusChangeError'))
  }
}

const deleteStaff = async (staff: any) => {
  if (!confirm(t('staff.confirmDelete', { name: staff.fullName }))) return
  try {
    const res = await apiFetch<any>(`/api/staff/${staff.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success(t('staff.deleteSuccess'))
      fetchStaff()
    }
  } catch {
    $toast.error(t('staff.deleteError'))
  }
}

onMounted(() => {
  fetchStaff()
  fetchTodayCount()
})

useSeoMeta({ title: t('staff.titleSeo') })
</script>
