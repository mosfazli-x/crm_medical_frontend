// composables/usePatientFormDialog.ts
import { ref } from 'vue'

const isOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const patientId = ref<string | null>(null)
const patientData = ref<any>(null) // تمام داده‌های دریافتی از بک‌اند

export const usePatientFormDialog = () => {
  const openCreate = () => {
    mode.value = 'create'
    patientId.value = null
    patientData.value = null
    isOpen.value = true
  }

  const openEdit = (id: string, data: any) => {
    mode.value = 'edit'
    patientId.value = id
    patientData.value = data
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen: readonly(isOpen),
    mode: readonly(mode),
    patientId: readonly(patientId),
    patientData: readonly(patientData),
    openCreate,
    openEdit,
    close,
  }
}