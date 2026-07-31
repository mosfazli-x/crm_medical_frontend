import { ref, readonly } from 'vue'

const isOpen = ref(false)
const mode = ref<'create' | 'edit'>('create')
const leadId = ref<string | null>(null)
const leadData = ref<any>(null)

export const useLeadFormDialog = () => {
  const openCreate = () => {
    mode.value = 'create'
    leadId.value = null
    leadData.value = null
    isOpen.value = true
  }

  const openEdit = (id: string, data: any) => {
    mode.value = 'edit'
    leadId.value = id
    leadData.value = data
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen: readonly(isOpen),
    mode: readonly(mode),
    leadId: readonly(leadId),
    leadData: readonly(leadData),
    openCreate,
    openEdit,
    close,
  }
}
