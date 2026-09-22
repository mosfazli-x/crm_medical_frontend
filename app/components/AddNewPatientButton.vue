<!-- components/AddNewPatientButton.vue -->
<template>
  <button
    type="button"
    class="asa-btn asa-btn--primary"
    :class="{ '!px-0! !w-10!': rail }"
    @click="openDialog"
  >
    <v-icon size="18">mdi-plus</v-icon>
    <span v-if="!rail" class="font-bold whitespace-nowrap">{{ $t('patientForm.addNewPatient') }}</span>
  </button>
</template>

<script setup lang="ts">
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'

defineProps<{ rail?: boolean }>()

const { openCreate } = usePatientFormDialog()
const openDialog = () => openCreate()
</script>