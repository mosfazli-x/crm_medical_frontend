<template>
  <div v-if="loading" class="space-y-4">
    <v-skeleton-loader type="list-item-two-line" v-for="i in 3" :key="i" />
  </div>
  <div v-else class="space-y-8">
    <!-- Scheduled Screenings -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-bold text-slate-800">غربالگری‌های برنامه‌ریزی شده</h3>
        <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="emit('create')">ثبت غربالگری جدید</v-btn>
      </div>
      <div v-if="!schedules?.length" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
        <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
        <p class="text-sm font-medium text-slate-500">هیچ غربالگری برنامه‌ریزی نشده است.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="s in schedules" :key="s.id" class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-800 text-sm">{{ s.test_name || '---' }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ formatDate(s.scheduled_date) }}</p>
          </div>
          <v-chip size="x-small" :color="statusColor(s.status)" variant="tonal">
            {{ statusLabel(s.status) }}
          </v-chip>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- Results -->
    <div>
      <h3 class="text-base font-bold text-slate-800 mb-4">نتایج غربالگری</h3>
      <div v-if="!results?.length" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
        <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
        <p class="text-sm font-medium text-slate-500">نتیجه‌ای ثبت نشده است.</p>
      </div>
      <div v-else class="space-y-3">
        <div v-for="r in results" :key="r.id" class="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p class="font-medium text-slate-800 text-sm">{{ r.test_name || '---' }}</p>
            <p class="text-xs text-slate-500 mt-1">نتیجه: {{ r.result || '---' }} — {{ formatDate(r.test_date) }}</p>
          </div>
          <v-chip size="x-small" :color="r.normal ? 'green' : 'red'" variant="tonal">
            {{ r.normal ? 'نرمال' : 'غیرنرمال' }}
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Overdue -->
    <div v-if="overdue?.length">
      <v-divider />
      <h3 class="text-base font-bold text-red-600 mb-4">غربالگری‌های معوق</h3>
      <div v-for="s in overdue" :key="s.id" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-3 flex items-center justify-between">
        <div>
          <p class="font-medium text-red-800 text-sm">{{ s.test_name || '---' }}</p>
          <p class="text-xs text-red-500 mt-1">سررسید: {{ formatDate(s.scheduled_date) }}</p>
        </div>
        <v-chip size="x-small" color="red" variant="tonal">معوق</v-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  schedules?: any[]
  results?: any[]
  overdue?: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  create: []
  refresh: []
}>()

const formatDate = (date: string | null | undefined) => {
  if (!date) return '---'
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
  } catch {
    return date
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case 'done': return 'green'
    case 'overdue': return 'red'
    default: return 'amber'
  }
}

const statusLabel = (status: string) => {
  switch (status) {
    case 'done': return 'انجام شده'
    case 'overdue': return 'معوق'
    default: return 'در انتظار'
  }
}
</script>