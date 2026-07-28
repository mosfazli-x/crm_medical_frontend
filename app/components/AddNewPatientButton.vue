<!-- components/AddNewPatientButton.vue -->
<template>
  <button class="crm-btn crm-btn-ghost flex! items-center gap-2! px-4! py-2.5! text-sm!" @click="openDialog">
    <AddClipboard class="w-5 h-5 shrink-0 fill-slate-600! dark:fill-slate-400!" />
    <span v-if="!rail" class="font-bold whitespace-nowrap">{{ $t('patientForm.addNewPatient') }}</span>
  </button>
</template>

<script setup lang="ts">
import AddClipboard from '~/components/icons/AddClipboard.vue'
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'

defineProps<{ rail?: boolean }>()

const { openCreate } = usePatientFormDialog()
const openDialog = () => openCreate()
</script>
