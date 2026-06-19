<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="bg-white border border-slate-200 rounded p-5 shadow-sm col-span-1 md:col-span-2">
            <div class="flex justify-between items-center border-b border-slate-100 py-2 mb-3 px-2">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                    <v-icon icon="mdi-heart-pulse" color="red-darken-2" size="small" /> بیماری‌های زمینه‌ای
                </h3>
                <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" 
                    @click="form.diseases.push({ name: '', diagnosed_at: null })">افزودن</v-btn>
            </div>
            
            <div v-if="form.diseases.length === 0" class="text-sm text-slate-400 text-center py-2">موردی ثبت نشده است.</div>
            
            <div v-for="(disease, i) in form.diseases" :key="i" class="flex gap-4 mb-3 items-start">
                <v-text-field v-model="disease.name" label="عنوان بیماری" variant="outlined" density="compact" hide-details class="flex-1" />
                <div class="w-48">
                    <PersianDatetimePicker v-model="disease.diagnosed_at" type="date" placeholder="تاریخ تشخیص"
                        display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit custom-input 
                        class="w-full border border-slate-300 rounded-md px-3 h-[40px] text-sm" />
                </div>
                <v-btn icon variant="text" size="small" color="error" class="mt-1" @click="form.diseases.splice(i, 1)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </div>

        <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
            <div class="flex justify-between items-center border-b border-slate-100 py-2 mb-3 px-2">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                    <v-icon icon="mdi-pill" color="#5465ff" size="small" /> داروهای مصرفی
                </h3>
                <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" 
                    @click="form.medications.push({ name: '', dosage: '' })">افزودن</v-btn>
            </div>
            
            <div v-if="form.medications.length === 0" class="text-sm text-slate-400 text-center py-2">موردی ثبت نشده است.</div>

            <div v-for="(med, i) in form.medications" :key="i" class="flex gap-2 mb-3">
                <v-text-field v-model="med.name" label="نام دارو" variant="outlined" density="compact" hide-details class="flex-1" />
                <v-text-field v-model="med.dosage" label="دوز/دستور" variant="outlined" density="compact" hide-details class="w-1/3" />
                <v-btn icon variant="text" size="small" color="error" class="mt-1" @click="form.medications.splice(i, 1)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </div>

        <div class="bg-white border border-slate-200 rounded p-5 shadow-sm">
            <div class="flex justify-between items-center border-b border-slate-100 py-2 mb-3 px-2">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                    <v-icon icon="mdi-alert-circle-outline" color="amber-darken-4" size="small" /> حساسیت‌ها
                </h3>
                <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" 
                    @click="form.allergies.push({ substance: '', severity: 'متوسط' })">افزودن</v-btn>
            </div>

            <div v-if="form.allergies.length === 0" class="text-sm text-slate-400 text-center py-2">موردی ثبت نشده است.</div>

            <div v-for="(allergy, i) in form.allergies" :key="i" class="flex gap-2 mb-3">
                <v-text-field v-model="allergy.substance" label="ماده/دارو" variant="outlined" density="compact" hide-details class="flex-1" />
                <v-select v-model="allergy.severity" :items="['خفیف', 'متوسط', 'شدید']" label="شدت" variant="outlined" density="compact" hide-details class="w-1/3" />
                <v-btn icon variant="text" size="small" color="error" class="mt-1" @click="form.allergies.splice(i, 1)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const form = defineModel<any>({ required: true })
</script>