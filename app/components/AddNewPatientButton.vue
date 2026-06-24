<!-- components/AddNewPatientButton.vue -->
<template>
  <v-btn variant="outlined" :class="[rail ? 'min-w-0 w-12 h-12 rounded-2xl p-0' : 'px-3 rounded-2xl', 'border-slate-200 dark:border-slate-600 shadow-sm shadow-slate-900/5 transition-all duration-300 active:scale-95']" @click="openDialog">
    <div class="flex items-center justify-center" :class="!rail ? 'gap-2' : ''">
      <AddClipboard class="w-6 h-6 shrink-0" />
      <span v-if="!rail" class="text-sm font-bold pr-2 whitespace-nowrap text-slate-700 dark:text-slate-300">
        ثبت بیمار جدید
      </span>
    </div>
  </v-btn>
</template>

<script setup lang="ts">
import AddClipboard from '~/components/icons/AddClipboard.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'

defineProps<{
  rail?: boolean
}>()

const { openCreate } = usePatientFormDialog()
const openDialog = () => openCreate()
</script>