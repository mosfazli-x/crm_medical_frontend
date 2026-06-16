<template>
    <div class="bg-white p-6 rounded-xl">
        <h3 class="text-base font-bold text-slate-800 mb-6 pb-3">هویت و اطلاعات تماس</h3>
        <v-row dense class="mt-2">
            <v-col cols="12" md="6">
                <v-text-field v-model="form.first_name" label="نام *" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-account-outline" bg-color="white" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.last_name" label="نام خانوادگی *" variant="outlined" density="comfortable"
                    bg-color="white" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.national_id" label="کد ملی *" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-card-account-details-outline" maxlength="10" bg-color="white"
                    inputmode="numeric" :rules="[nationalCodeRule]" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.insurance_code" label="کد بیمه" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-shield-check-outline" bg-color="white" />
            </v-col>
            <v-col cols="12" md="6">
                <v-select v-model="form.insurance_type" :items="insuranceOptions" item-title="title"
                    item-value="value" label="نوع بیمه" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-shield-account-outline" bg-color="white" clearable>
                    <template v-slot:selection="{ item }">
                        <div class="flex items-center gap-2">
                            <img v-if="item.raw" :src="item.raw.logo" alt="" class="w-5 h-5 object-contain" />
                            <span>{{ item.raw.title }}</span>
                        </div>
                    </template>
                    <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                            <template v-slot:prepend>
                                <img :src="item.raw.logo" alt="" class="w-5 h-5 object-contain" />
                            </template>
                            <template v-slot:title>
                                <span class="text-sm">{{ item.raw.title }}</span>
                            </template>
                        </v-list-item>
                    </template>
                </v-select>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field v-model="form.phone" label="شماره تماس" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-phone-outline" type="tel" dir="ltr" bg-color="white"
                    :rules="[iranMobileRule]" />
            </v-col>
            <v-col cols="12" md="4">
                <v-select v-model="form.marital_status" :items="['مجرد', 'متاهل', 'مطلقه', 'بیوه']" label="وضعیت تأهل"
                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-ring" bg-color="white" />
            </v-col>
            <v-col cols="12" md="4">
                <div class="relative">
                    <PersianDatetimePicker v-model="form.birth_date" type="date" placeholder="تاریخ تولد"
                        display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                        custom-input class="w-full !h-[48px] rounded-md px-3 bg-white" />
                </div>
            </v-col>
            <v-col cols="12">
                <v-textarea v-model="form.address" label="آدرس سکونت" variant="outlined" rows="2" density="comfortable"
                    prepend-inner-icon="mdi-map-marker-outline" bg-color="white" hide-details />
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { INSURANCE_TYPE_VALUES } from '~/types/insurance'

const form = defineModel<any>({ required: true })
const config = useRuntimeConfig()

const insuranceOptions = INSURANCE_TYPE_VALUES.map(item => ({
  title: item.label,
  value: item.key,
  logo: config.public.apiBase + item.logo,
}))

const iranMobileRule = (value: string) => {
    if (!value) return true

    const mobileRegex = /^09\d{9}$/

    return mobileRegex.test(value)
        ? true
        : 'شماره موبایل معتبر وارد کنید (مثال: 09123456789)'
}

const nationalCodeRule = (value: string) => {
    if (!value) return true

    const code = value.trim()

    // فقط 10 رقم
    if (!/^\d{10}$/.test(code)) {
        return 'کد ملی باید 10 رقم باشد'
    }

    // جلوگیری از اعداد تکراری
    if (/^(\d)\1{9}$/.test(code)) {
        return 'کد ملی معتبر نیست'
    }

    const check = Number(code[9])

    let sum = 0

    for (let i = 0; i < 9; i++) {
        sum += Number(code[i]) * (10 - i)
    }

    const remainder = sum % 11

    const isValid =
        (remainder < 2 && check === remainder) ||
        (remainder >= 2 && check === 11 - remainder)

    return isValid
        ? true
        : 'کد ملی معتبر نیست'
}
</script>

<style>
.vpd-input-group {
    height: 48px !important;
    position: absolute;
}
</style>