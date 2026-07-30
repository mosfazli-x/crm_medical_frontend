<template>
  <div v-if="loading" class="space-y-4">
    <v-skeleton-loader type="list-item-two-line" v-for="i in 3" :key="i" />
  </div>
  <div v-else-if="!results?.length" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
    <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
    <p class="text-sm font-medium text-slate-500">{{ t('labResultsTab.noResults') }}</p>
  </div>
  <div v-else class="space-y-3">
    <div v-for="lab in results" :key="lab.id" 
         class="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
         @click="emit('showTrend', lab)">
      <div class="flex-1">
        <p class="font-medium text-slate-800 text-sm">{{ lab.test_name || '---' }}</p>
        <p class="text-xs text-slate-500 mt-1">
          {{ t('labResultsTab.resultLabel') }}: {{ lab.result || '---' }} ({{ t('labResultsTab.refRangeLabel') }}: {{ lab.reference_range || '---' }}) — {{ formatDate(lab.performed_date) }}
        </p>
      </div>
      <v-chip size="x-small" :color="lab.abnormal ? 'red' : 'green'" variant="tonal">
        {{ lab.abnormal ? t('labResultsTab.abnormal') : t('labResultsTab.normal') }}
      </v-chip>
    </div>
  </div>

  <!-- Quick Add Button (could be opened in dialog) -->
  <div class="mt-6 flex justify-end">
    <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="emit('create')">
      {{ t('labResultsTab.addNewResult') }}
    </v-btn>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{
  results?: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  create: []
  showTrend: [lab: any]
}>()

const formatDate = (date: string | null | undefined) => {
  if (!date) return '---'
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
  } catch {
    return date
  }
}
</script>