<template>
  <div class="mx-auto max-w-7xl px-4 py-10 md:px-8 min-h-screen">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
      <div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">انواع نوبت</h1>
        <p class="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">مدیریت انواع نوبت‌های خود را تنظیم کنید</p>
      </div>
      <v-btn variant="flat" color="#5465ff" size="large" class="font-bold rounded-xl shadow-md shadow-electric-sapphire/30 px-6 overflow-hidden"
        prepend-icon="mdi-plus" @click="openCreateDialog">
        افزودن نوع نوبت
      </v-btn>
    </header>

    <div class="bg-white dark:bg-blue-grey! rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-600! overflow-hidden">
      <div v-if="loading" class="flex flex-col items-center justify-center py-24!">
        <svg class="animate-spin h-8 w-8 text-electric-sapphire mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span class="text-sm text-slate-500 font-medium">در حال دریافت اطلاعات...</span>
      </div>

      <div v-else-if="!visitTypes.length" class="flex flex-col items-center justify-center py-24 px-4 text-center my-3">
        <div class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
          <svg class="w-8 h-8 text-slate-300 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">هیچ نوع نوبتی تعریف نشده است</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">برای شروع، یک نوع نوبت جدید اضافه کنید.</p>
      </div>

      <template v-else>
        <div class="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <span class="text-xs font-bold text-slate-500 tracking-wide">{{ visitTypes.length }} نوع نوبت</span>
        </div>

        <div class="divide-y divide-slate-100/80">
          <div v-for="vt in visitTypes" :key="vt.id"
            class="p-5 md:p-6 py-2 px-2 flex flex-col md:flex-row md:items-center gap-5 hover:bg-slate-50/60 transition-colors group">
            <div class="flex items-center gap-4 shrink-0 md:w-14">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border"
                :style="{ backgroundColor: vt.color + '20', borderColor: vt.color + '40' }">
                <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: vt.color }"></div>
              </div>
            </div>

            <div class="flex-1 min-w-0 px-2">
              <div class="flex flex-wrap items-center gap-3 mb-1">
                <h3 class="text-base font-bold text-slate-800">{{ vt.name }}</h3>
                <span v-if="!vt.isActive"
                  class="px-2 py-0.5 text-[11px] font-bold rounded-lg border bg-slate-100 text-slate-500 border-slate-200">
                  غیرفعال
                </span>
              </div>
              <p v-if="vt.description" class="text-sm text-slate-500 mt-1 leading-relaxed">{{ vt.description }}</p>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-500 font-medium">
                <div class="flex items-center gap-1">
                  <Clock class="w-4 h-4 fill-slate-400" />
                  <span>{{ vt.durationMinutes }} دقیقه</span>
                </div>
                <div class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{{ formatPrice(vt.price) }}</span>
                </div>
                <span class="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block"></span>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-slate-400">شناسه:</span>
                  <span class="text-xs text-slate-600 font-mono">{{ vt.id?.slice(0, 8) }}...</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end px-2">
              <v-btn icon variant="text" color="slate-500" size="small" @click="openEditDialog(vt)">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </v-btn>
              <v-btn icon variant="text" color="red" size="small" @click="confirmDelete(vt)">
                <TrashBin class="w-5 h-5 fill-red-500" />
              </v-btn>
            </div>
          </div>
        </div>
      </template>
    </div>

    <v-dialog v-model="dialog" max-width="580" :persistent="saving">
      <v-card class="rounded-2xl">
        <v-card-title class="text-lg font-bold! text-slate-800 dark:text-slate-100 px-6 pt-6 pb-4 border-b border-slate-100">
          {{ editingId ? 'ویرایش نوع نوبت' : 'افزودن نوع نوبت' }}
        </v-card-title>

        <v-card-text class="px-6 py-6">
          <v-form ref="formRef" @submit.prevent="saveVisitType">
            <v-row>
              <v-col cols="12" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">نام نوع نوبت <span class="text-red-500">*</span></label>
                <v-text-field v-model="form.name" variant="outlined" density="comfortable"
                  placeholder="مثال: ویزیت عمومی" hide-details="auto" bg-color="white" rounded="lg"
                  :rules="[v => !!v?.trim() || 'نام الزامی است']" />
              </v-col>

              <v-col cols="12" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">توضیحات</label>
                <v-textarea v-model="form.description" variant="outlined" density="comfortable"
                  placeholder="توضیحات کوتاه درباره این نوع نوبت" hide-details="auto" bg-color="white" rounded="lg"
                  rows="3" />
              </v-col>

              <v-col cols="12" md="6" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">مدت زمان (دقیقه) <span class="text-red-500">*</span></label>
                <v-text-field v-model.number="form.durationMinutes" variant="outlined" density="comfortable"
                  type="number" min="5" max="480" placeholder="۳۰" hide-details="auto" bg-color="white" rounded="lg"
                  :rules="[v => !!v || 'مدت زمان الزامی است', v => v >= 5 || 'حداقل ۵ دقیقه']" />
              </v-col>

              <v-col cols="12" md="6" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">قیمت (تومان) <span class="text-red-500">*</span></label>
                <v-text-field v-model.number="form.price" variant="outlined" density="comfortable"
                  type="number" min="0" placeholder="۱۰۰۰۰۰" hide-details="auto" bg-color="white" rounded="lg"
                  :rules="[v => v >= 0 || 'قیمت نمی‌تواند منفی باشد']" />
              </v-col>

              <v-col cols="12" md="6" class="py-2">
                <label class="text-sm font-semibold text-slate-700 mb-2 block dark:text-slate-200">رنگ <span class="text-red-500">*</span></label>
                <div class="flex items-center gap-3">
                  <v-text-field v-model="form.color" variant="outlined" density="comfortable"
                    placeholder="#3B82F6" maxlength="7" hide-details="auto" bg-color="white" rounded="lg"
                    :rules="[v => /^#[0-9A-Fa-f]{6}$/.test(v) || 'فرمت هگز معتبر نیست']" />
                  <div class="w-10 h-10 rounded-lg border-2 border-slate-200 shrink-0"
                    :style="{ backgroundColor: form.color }"></div>
                </div>
              </v-col>

              <v-col cols="12" md="6" class="py-2 d-flex align-center">
                <v-switch v-model="form.isActive" color="#5465ff" label="فعال" hide-details />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="px-6 pb-6 pt-2 border-t border-slate-100 gap-3">
          <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
            :disabled="saving" @click="dialog = false">
            انصراف
          </v-btn>
          <v-spacer />
          <v-btn variant="flat" color="#5465ff" size="large" :loading="saving"
            class="px-8 font-bold rounded-lg shadow-md shadow-electric-sapphire/30 hover:bg-electric-sapphire/80!" @click="saveVisitType">
            {{ editingId ? 'ذخیره تغییرات' : 'ایجاد نوع نوبت' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card class="rounded-2xl text-center py-6">
        <v-card-text class="px-6">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrashBin class="w-8 h-8 fill-red-500" />
          </div>
          <h3 class="text-lg font-bold text-slate-800 mb-2">حذف نوع نوبت</h3>
          <p class="text-sm text-slate-500">
            آیا از حذف <strong class="text-slate-700">{{ deletingItem?.name }}</strong> اطمینان دارید؟ این action قابل بازگشت نیست.
          </p>
        </v-card-text>

        <v-card-actions class="justify-center gap-3 px-6 pt-4">
          <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
            :disabled="saving" @click="deleteDialog = false">
            انصراف
          </v-btn>
          <v-btn variant="flat" color="red" size="large" :loading="saving"
            class="px-8 font-bold rounded-lg shadow-md shadow-red-500/30" @click="deleteVisitType">
            حذف
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Clock from '~/components/icons/Clock.vue'
import TrashBin from '~/components/icons/TrashBin.vue'

const { apiFetch } = useApi()
const { user } = useAuth()
const { $toast } = useNuxtApp()

interface VisitType {
  id: string
  doctorId?: string
  name: string
  description?: string
  durationMinutes: number
  price: number
  color: string
  isActive: boolean
}

const visitTypes = ref<VisitType[]>([])
const loading = ref(true)
const dialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const editingId = ref<string | null>(null)
const deletingItem = ref<VisitType | null>(null)
const formRef = ref<any>(null)

const defaultForm = {
  name: '',
  description: '',
  durationMinutes: 30,
  price: 0,
  color: '#3B82F6',
  isActive: true,
}

const form = ref({ ...defaultForm })

function resetForm() {
  form.value = { ...defaultForm }
  editingId.value = null
}

function openCreateDialog() {
  resetForm()
  dialog.value = true
}

function openEditDialog(vt: VisitType) {
  editingId.value = vt.id
  form.value = {
    name: vt.name,
    description: vt.description || '',
    durationMinutes: vt.durationMinutes,
    price: vt.price,
    color: vt.color,
    isActive: vt.isActive,
  }
  dialog.value = true
}

function confirmDelete(vt: VisitType) {
  deletingItem.value = vt
  deleteDialog.value = true
}

function formatPrice(price: number) {
  return price.toLocaleString('fa-IR') + ' تومان'
}

async function fetchVisitTypes() {
  const doctorId = user?.value?.id || (user as any)?.id
  if (!doctorId) return
  loading.value = true
  try {
    const res = await apiFetch<any>(`/api/visit-types/${doctorId}`)
    if (res.success) {
      visitTypes.value = (res.data || []).map((vt: any) => ({
        id: vt.id,
        doctorId: vt.doctor_id || vt.doctorId,
        name: vt.name,
        description: vt.description,
        durationMinutes: vt.duration_minutes ?? vt.durationMinutes ?? 30,
        price: vt.price ?? 0,
        color: vt.color || '#3B82F6',
        isActive: vt.is_active ?? vt.isActive ?? true,
      }))
    }
  } catch {
    $toast.error('خطا در دریافت انواع نوبت')
  } finally {
    loading.value = false
  }
}

async function saveVisitType() {
  const formEl = formRef.value
  if (formEl) {
    const { valid } = await formEl.validate()
    if (!valid) return
  }

  saving.value = true
  try {
    const body = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || undefined,
      durationMinutes: form.value.durationMinutes,
      price: form.value.price,
      color: form.value.color,
      isActive: form.value.isActive,
    }

    if (editingId.value) {
      await apiFetch(`/api/visit-types/${editingId.value}`, {
        method: 'PUT',
        body,
      })
      $toast.success('نوع نوبت با موفقیت به‌روزرسانی شد')
    } else {
      const doctorId = user?.value?.id || (user as any)?.id
      await apiFetch('/api/visit-types/', {
        method: 'POST',
        body: { ...body, doctorId },
      })
      $toast.success('نوع نوبت با موفقیت ایجاد شد')
    }

    dialog.value = false
    await fetchVisitTypes()
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ذخیره نوع نوبت')
  } finally {
    saving.value = false
  }
}

async function deleteVisitType() {
  if (!deletingItem.value) return
  saving.value = true
  try {
    await apiFetch(`/api/visit-types/${deletingItem.value.id}`, { method: 'DELETE' })
    $toast.success('نوع نوبت با موفقیت حذف شد')
    deleteDialog.value = false
    deletingItem.value = null
    await fetchVisitTypes()
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در حذف نوع نوبت')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchVisitTypes()
})

useSeoMeta({
  title: 'انواع نوبت | سیستم مدیریت',
})
</script>