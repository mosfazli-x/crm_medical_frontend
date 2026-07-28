<template>
  <div v-if="loading" class="space-y-4">
    <v-skeleton-loader type="list-item-two-line" v-for="i in 3" :key="i" />
  </div>
  <div v-else>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-bold text-slate-800">{{ t('consent.title') }}</h3>
      <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="emit('create')">{{ t('consent.addNew') }}</v-btn>
    </div>
    
    <div v-if="!records?.length" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
      <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
      <p class="text-sm font-medium text-slate-500">{{ t('consent.noRecords') }}</p>
    </div>
    
    <div v-else class="space-y-3">
      <div v-for="c in records" :key="c.id" class="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
        <div class="flex-1">
          <p class="font-medium text-slate-800 text-sm">{{ c.type || c.consent_type || '---' }}</p>
          <p class="text-xs text-slate-500 mt-1">{{ t('consent.datePrefix') }} {{ formatDate(c.date || c.created_at) }}</p>
          <p v-if="c.revoked_at || c.revokedAt" class="text-xs text-red-500 mt-0.5">{{ t('consent.revokedAt') }} {{ formatDate(c.revoked_at || c.revokedAt) }}</p>
        </div>
        <div class="flex items-center gap-2">
          <v-chip size="x-small" :color="c.revoked_at || c.revokedAt ? 'red' : 'green'" variant="tonal">
            {{ c.revoked_at || c.revokedAt ? t('consent.revoked') : t('consent.active') }}
          </v-chip>
          <v-btn 
            v-if="!c.revoked_at && !c.revokedAt" 
            variant="text" 
            color="red" 
            size="x-small" 
            :loading="revokingId === c.id" 
            @click="emit('revoke', c)"
          >
            {{ t('consent.revoke') }}
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

const props = defineProps<{
  records?: any[]
  loading: boolean
  revokingId?: string
}>()

const emit = defineEmits<{
  create: []
  revoke: [consent: any]
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
