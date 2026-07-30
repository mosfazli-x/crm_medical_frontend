<template>
    <div class="p-6 rounded-xl">
        <h3 class="text-base font-bold text-slate-800! dark:text-slate-300! mb-6 pb-3">{{ $t('basicInfo.title') }}</h3>
        <v-row dense class="mt-2">
            <v-col cols="12" md="6">
                <v-text-field v-model="form.first_name" :label="$t('basicInfo.firstName') + ' *'" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-account-outline" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.last_name" :label="$t('basicInfo.lastName') + ' *'" variant="outlined"
                    density="comfortable" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.national_id" :label="$t('basicInfo.nationalId') + ' *'" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-card-account-details-outline" maxlength="10" inputmode="numeric"
                    :rules="[nationalCodeRule]" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.insurance_code" :label="$t('basicInfo.insuranceCode')" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-shield-check-outline" />
            </v-col>
            <v-col cols="12" md="6">
                <v-select v-model="form.insurance_type" :items="insuranceOptions" item-title="title" item-value="value"
                    :label="$t('basicInfo.insuranceType')" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-shield-account-outline" clearable>
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
                <v-text-field v-model="form.phone" :label="$t('basicInfo.phone')" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-phone-outline" type="tel" dir="ltr" :rules="[iranMobileRule]" />
            </v-col>
            <v-col cols="12" md="4">
                <v-select v-model="form.marital_status" :items="maritalStatusOptions" :label="$t('basicInfo.maritalStatus')"
                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-ring" />
            </v-col>
            <v-col cols="12" md="4">
                <div class="relative h-[48px] border rounded overflow-hidden">
                    <PersianDatetimePicker v-model="form.birth_date" type="date" :placeholder="$t('basicInfo.birthDate')"
                        display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                        custom-input class="w-full !h-[48px] rounded-md px-3 bg-white" />
                </div>
            </v-col>
            <v-col cols="12">
                <v-textarea v-model="form.address" :label="$t('basicInfo.address')" variant="outlined" rows="2" density="comfortable"
                    prepend-inner-icon="mdi-map-marker-outline" hide-details />
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { INSURANCE_TYPE_VALUES } from '~/types/insurance'
const { t } = useI18n()

const form = defineModel<any>({ required: true })
const config = useRuntimeConfig()

const insuranceOptions = INSURANCE_TYPE_VALUES.map(item => ({
    title: item.label,
    value: item.key,
    logo: config.public.apiBase + item.logo,
}))

const maritalStatusOptions = computed(() => [
    t('basicInfo.single'),
    t('basicInfo.married'),
    t('basicInfo.divorced'),
    t('basicInfo.widowed'),
])

const iranMobileRule = (value: string) => {
    if (!value) return true

    const mobileRegex = /^09\d{9}$/

    return mobileRegex.test(value)
        ? true
        : t('basicInfo.invalidPhone')
}

const nationalCodeRule = (value: string) => {
    if (!value) return true

    const code = value.trim()

    if (!/^\d{10}$/.test(code)) {
        return t('basicInfo.nationalIdMustBe10Digits')
    }

    if (/^(\d)\1{9}$/.test(code)) {
        return t('basicInfo.invalidNationalId')
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
        : t('basicInfo.invalidNationalId')
}
</script>

<style>
.vpd-input-group {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 1px;
}
</style>