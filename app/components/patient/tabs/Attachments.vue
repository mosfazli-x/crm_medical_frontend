<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="bg-white p-6 shadow-sm rounded-2xl border border-slate-100">
      <h4 class="text-base font-bold text-slate-800 mb-6 flex items-center gap-2 py-3 px-2 border-b border-slate-100">
        <v-icon icon="mdi-folder-account-outline" class="text-electric-sapphire" />
        مدیریت مستندات و سوابق بیمار
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
        <div v-for="cat in categories" :key="cat.key" class="bg-slate-50/50 p-4 rounded border border-slate-200 flex flex-col h-full">
          
          <div class="flex items-center justify-between align-middle mb-1 py-2 px-2 border-b border-slate-200">
            <div class="flex items-center gap-2 font-semibold text-slate-700 text-sm">
              <v-icon :icon="cat.icon" :color="cat.color" size="small" />
              {{ cat.title }}
            </div>
            <v-chip size="x-small" color="slate-500" variant="flat">
              {{ (existingAttachments[cat.key]?.length || 0) + (attachments[cat.key]?.length || 0) }} فایل
            </v-chip>
          </div>

          <div class="flex-1 space-y-2 mb-4 overflow-y-auto max-h-60 px-1">
            
            <div v-for="(file, idx) in existingAttachments[cat.key]" :key="'old-'+idx"
                 class="flex items-center justify-between p-2 my-1 bg-white border border-slate-200 rounded-lg group hover:border-slate-300 transition-all gap-2">
              
              <div class="flex items-center gap-2 overflow-hidden flex-1 px-1">
                <v-icon icon="mdi-cloud-check-outline" size="small" class="text-emerald-500 shrink-0" />
                <div class="flex flex-col min-w-0 w-full">
                  <span class="text-xs text-slate-700 truncate dir-rtl text-right font-medium">{{ file.name || 'فایل ذخیره شده' }}</span>
                  <span v-if="file.fileName" class="text-[10px] text-slate-400 mt-0.5 font-normal">{{ file.fileName }}</span>
                </div>
              </div>

              <div class="flex items-center gap-0.5 shrink-0 px-1">
                <v-btn v-if="file.filePath" icon="mdi-eye-outline" variant="text" color="slate-500" density="compact" size="small"
                       :href="config.public.apiBase + file.filePath" target="_blank" title="مشاهده فایل" />
                       
                <v-btn v-if="file.filePath" icon="mdi-download-outline" variant="text" color="#5465ff" density="compact" size="small"
                       :href="config.public.apiBase + file.filePath" :download="file.name" title="دانلود فایل" />

                <v-btn icon="mdi-trash-can-outline" variant="text" color="error" density="compact" size="small"
                       @click="deleteExistingAttachment(cat.key, file, idx)"
                       :loading="deleting.has(file.id)"
                       :disabled="deleting.has(file.id)"
                       class="opacity-100 group-hover:opacity-100 transition-opacity" title="حذف" />
              </div>
            </div>

            <div v-for="(file, idx) in attachments[cat.key]" :key="'new-'+idx"
                 class="flex items-center justify-between p-2.5 my-1 bg-light-cyan/70 border border-periwinkle rounded-lg group hover:border-baby-blue-ice transition-all">
              <div class="flex items-center gap-2 overflow-hidden w-full">
                <v-icon icon="mdi-file-clock-outline" size="small" class="text-electric-sapphire shrink-0" />
                <div class="flex flex-col min-w-0 w-full">
                  <span class="text-xs text-electric-sapphire truncate dir-ltr text-left font-medium">{{ file.name }}</span>
                  <span class="text-[10px] text-cornflower-blue mt-0.5 font-normal">آماده آپلود</span>
                </div>
              </div>
              <v-btn icon="mdi-close" variant="text" color="error" density="compact" size="small"
                     @click="attachments[cat.key].splice(idx, 1)" class="shrink-0" />
            </div>

            <div v-if="!existingAttachments[cat.key]?.length && !attachments[cat.key]?.length"
                 class="text-center py-6 text-xs text-slate-400 font-medium bg-white/50 rounded-lg border border-dashed border-slate-200">
              مدرکی ثبت نشده است
            </div>
            
          </div>

          <div class="mt-auto pt-2">
            <label class="cursor-pointer flex flex-col items-center justify-center w-full py-3 bg-white border-2 border-dashed border-slate-300 hover:border-baby-blue-ice hover:bg-light-cyan rounded-lg transition-all group">
              <div class="flex items-center gap-2 text-slate-500 group-hover:text-electric-sapphire transition-colors">
                <v-icon icon="mdi-plus" size="small" />
                <span class="text-xs font-bold">افزودن فایل جدید</span>
              </div>
              <input type="file" class="hidden" :accept="cat.accept" multiple
                     @change="(e) => {
                       const files = (e.target as HTMLInputElement).files;
                       if (files?.length) {
                         attachments[cat.key] = [...(attachments[cat.key] || []), ...Array.from(files)];
                       }
                       (e.target as HTMLInputElement).value = '';
                     }" />
            </label>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApi } from '~/composables/useApi'

const config = useRuntimeConfig()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const props = defineProps<{ patientId: string | null }>()

const attachments = defineModel<any>('attachments', { required: true })
const existingAttachments = defineModel<any>('existingAttachments', { required: true })

const deleting = reactive(new Set<string>())

const categories = [
  { key: 'ultrasound', title: 'مدارک سونوگرافی', icon: 'mdi-camera-iris', color: 'purple-darken-1', accept: 'image/*,application/pdf' },
  { key: 'lab', title: 'گزارش‌های آزمایشگاه', icon: 'mdi-flask-outline', color: 'teal-darken-1', accept: '.pdf,.jpg,.jpeg,.png' },
  { key: 'prescription', title: 'نسخه‌های قبلی', icon: 'mdi-prescription', color: '#5465ff', accept: 'image/*,application/pdf' }
]

const deleteExistingAttachment = async (categoryKey: 'ultrasound' | 'lab' | 'prescription', file: any, index: number) => {
  if (!props.patientId || !file.id) return
  if (!confirm(`آیا از حذف این فایل اطمینان دارید؟ "${file.name || file.fileName}"`)) return

  deleting.add(file.id)
  try {
    const response = await apiFetch<{ success: boolean; error?: string }>(`/api/patients/${props.patientId}/attachments/${file.id}`, { method: 'DELETE' })
    if (response.success) {
      existingAttachments.value[categoryKey].splice(index, 1)
      $toast.success('فایل با موفقیت حذف شد.')
    } else {
      $toast.error(response.error || 'خطا در حذف فایل.')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارتباط با سرور.')
  } finally {
    deleting.delete(file.id)
  }
}

if (!attachments.value) attachments.value = { ultrasound: [], lab: [], prescription: [] }
if (!existingAttachments.value) existingAttachments.value = { ultrasound: [], lab: [], prescription: [] }
</script>