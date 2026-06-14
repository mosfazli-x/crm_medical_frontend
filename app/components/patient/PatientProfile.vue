<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-5xl mx-auto text-gray-800 font-sans">
    
    <div class="bg-slate-50 border-b border-gray-200 px-6 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
      
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xl font-bold shadow-inner">
          {{ patient.first_name?.[0] || '' }}{{ patient.last_name?.[0] || '' }}
        </div>
        
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ patient.first_name }} {{ patient.last_name }}</h2>
          <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>کد ملی: <span class="font-medium text-gray-700">{{ patient.national_id }}</span></span>
            <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>بیمه: <span class="font-medium text-gray-700">{{ patient.insurance_code || 'ندارد' }}</span></span>
          </div>
        </div>
      </div>

      <button 
        @click="
          mode = 'edit';
          patientId = patient.id;
          isOpen = true;
        "
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        ویرایش اطلاعات
      </button>
    </div>

    <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
          اطلاعات شخصی
        </h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <span class="block text-xs text-gray-500 mb-1">شماره تماس</span>
            <span class="text-sm font-medium text-gray-900">{{ patient.phone || '---' }}</span>
          </div>
          <div>
            <span class="block text-xs text-gray-500 mb-1">تاریخ تولد</span>
            <span class="text-sm font-medium text-gray-900">{{ patient.birth_date || '---' }}</span>
          </div>
          <div class="col-span-2">
            <span class="block text-xs text-gray-500 mb-1">آدرس</span>
            <span class="text-sm font-medium text-gray-900 leading-relaxed">{{ patient.address || '---' }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
          سوابق پزشکی و حساسیت‌ها
        </h3>
        
        <div>
          <span class="block text-xs text-gray-500 mb-2">حساسیت‌های دارویی/غذایی</span>
          <div v-if="patient.allergies?.length" class="flex flex-wrap gap-2">
            <span v-for="allergy in patient.allergies" :key="allergy.substance" class="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-xs font-medium border border-rose-100">
              {{ allergy.substance }} ({{ allergy.severity }})
            </span>
          </div>
          <span v-else class="text-sm text-gray-400">موردی ثبت نشده</span>
        </div>

        <div>
          <span class="block text-xs text-gray-500 mb-2">بیماری‌های زمینه‌ای</span>
          <div v-if="patient.diseases?.length" class="flex flex-wrap gap-2">
            <span v-for="disease in patient.diseases" :key="disease.name" class="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-100">
              {{ disease.name }}
            </span>
          </div>
          <span v-else class="text-sm text-gray-400">موردی ثبت نشده</span>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="text-sm font-bold text-teal-500 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
          پرونده جاری
        </h3>
        
        <div>
          <span class="block text-xs text-gray-500 mb-1">یادداشت پزشک / ویزیت</span>
          <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[80px] whitespace-pre-wrap">
            {{ patient.latest_visit?.pregnancy_notes || 'یادداشتی وجود ندارد.' }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { usePatientFormDialog } from '~/composables/usePatientFormDialog'

// دریافت اطلاعات بیمار به عنوان پراپ از کامپوننت والد (مثلاً لیست بیماران)
defineProps({
  patient: {
    type: Object,
    required: true,
    default: () => ({})
  }
})

// استفاده مستقیم از متغیرهای کامپوزبل برای مدیریت دیالوگ ویرایش
const { isOpen, mode, patientId } = usePatientFormDialog()
</script>