<template>
    <div class="p-6 rounded-xl">
        <h3 class="text-base font-bold text-slate-800! dark:text-slate-300! mb-6 pb-3">{{ $t('basicInfo.title') }}</h3>
        <v-row dense class="mt-2">
            <v-col cols="12" md="6">
                <v-text-field v-model="form.first_name" :label="$t('basicInfo.firstName') + ' *'" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-account-outline" append-inner-icon="mdi-draw-pen"
                    @click:append-inner="openHandwriting('first_name')" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.last_name" :label="$t('basicInfo.lastName') + ' *'" variant="outlined"
                    density="comfortable" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('last_name')" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.national_id" :label="$t('basicInfo.nationalId') + ' *'" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-card-account-details-outline" append-inner-icon="mdi-draw-pen" maxlength="10" inputmode="numeric"
                    :rules="[nationalCodeRule]" @click:append-inner="openHandwriting('national_id', true)" />
            </v-col>
            <v-col cols="12" md="6">
                <v-text-field v-model="form.insurance_code" :label="$t('basicInfo.insuranceCode')" variant="outlined" density="comfortable"
                    prepend-inner-icon="mdi-shield-check-outline" append-inner-icon="mdi-draw-pen"
                    @click:append-inner="openHandwriting('insurance_code', true)" />
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
                    prepend-inner-icon="mdi-phone-outline" append-inner-icon="mdi-draw-pen" type="tel" dir="ltr"
                    :rules="[iranMobileRule]" @click:append-inner="openHandwriting('phone', true)" />
            </v-col>
            <v-col cols="12" md="4">
                <v-select v-model="form.marital_status" :items="maritalStatusOptions" :label="$t('basicInfo.maritalStatus')"
                    variant="outlined" density="comfortable" prepend-inner-icon="mdi-ring" />
            </v-col>
            <v-col cols="12" md="4">
                <v-checkbox v-model="ageOnly" :label="$t('basicInfo.birthDateApprox')" density="compact"
                    color="#4F46E5" hide-details class="!mt-0 mb-1" />
                <div v-if="ageOnly" class="relative">
                    <v-text-field v-model="ageInput" :label="$t('basicInfo.age') + ' *'" variant="outlined"
                        density="comfortable" type="number" min="1" max="120" inputmode="numeric"
                        prepend-inner-icon="mdi-calendar-heart" :rules="[ageRule]" />
                </div>
                <template v-else>
                    <div class="relative h-[48px] border rounded overflow-hidden">
                        <PersianDatetimePicker v-model="form.birth_date" type="date" :placeholder="$t('basicInfo.birthDate')"
                            display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                            custom-input class="w-full !h-[48px] rounded-md px-3 bg-white" />
                    </div>
                    <div v-if="computedAge != null" class="text-xs text-slate-400 mt-1.5">
                        {{ $t('basicInfo.calculatedAge') }}:
                        <span class="font-semibold text-slate-600 dark:text-slate-300">{{ formattedAge }} {{ $t('basicInfo.years') }}</span>
                    </div>
                </template>
            </v-col>
            <v-col cols="12">
                <v-textarea v-model="form.address" :label="$t('basicInfo.address')" variant="outlined" rows="2" density="comfortable"
                    prepend-inner-icon="mdi-map-marker-outline" append-inner-icon="mdi-draw-pen" hide-details
                    @click:append-inner="openHandwriting('address')" />
            </v-col>
        </v-row>

        <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric"
            @insert="applyHandwriting" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import { INSURANCE_TYPE_VALUES } from '~/types/insurance'
import HandwritingDialog from '~/components/HandwritingDialog.vue'
const { t } = useI18n()

const form = defineModel<Record<string, unknown>>({ required: true })
const config = useRuntimeConfig()

const handwritingOpen = ref(false)
const handwritingTarget = ref<string | null>(null)
const handwritingNumeric = ref(false)

const HANDWRITING_LABEL_KEYS: Record<string, string> = {
    first_name: 'basicInfo.firstName',
    last_name: 'basicInfo.lastName',
    national_id: 'basicInfo.nationalId',
    insurance_code: 'basicInfo.insuranceCode',
    phone: 'basicInfo.phone',
    address: 'basicInfo.address',
}

const handwritingLabel = computed(() =>
    handwritingTarget.value ? t(HANDWRITING_LABEL_KEYS[handwritingTarget.value]) : '',
)

function openHandwriting(field: string, numeric = false) {
    handwritingTarget.value = field
    handwritingNumeric.value = numeric
    handwritingOpen.value = true
}

function applyHandwriting(text: string) {
    if (!handwritingTarget.value) return
    form.value[handwritingTarget.value] = text
}

function calcAge(birthDate: string | null | undefined): number | null {
    if (!birthDate) return null
    const b = moment(birthDate, 'YYYY-MM-DD')
    if (!b.isValid()) return null
    const now = moment()
    let age = now.jYear() - b.jYear()
    const monthDiff = now.jMonth() - b.jMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.jDate() < b.jDate())) age--
    return age >= 0 ? age : null
}

function approxDobFromAge(age: number): string {
    const birthYear = moment().jYear() - age
    return moment(`${birthYear}/1/1`, 'jYYYY/jM/jD').format('YYYY-MM-DD')
}

const ageInput = ref<number | '' | null>(null)

const ageOnly = computed({
    get: () => form.value.birth_date_exact === false,
    set: (val: boolean) => {
        if (val) {
            form.value.birth_date_exact = false
            if (ageInput.value == null && form.value.birth_date) {
                ageInput.value = calcAge(form.value.birth_date as string)
            }
            const n = Number(ageInput.value)
            if (Number.isFinite(n) && n >= 1 && n <= 120) {
                form.value.birth_date = approxDobFromAge(n)
            } else {
                form.value.birth_date = null
            }
        } else {
            form.value.birth_date_exact = null
        }
    },
})

watch(ageInput, (val) => {
    if (!ageOnly.value) return
    const n = Number(val)
    if (Number.isFinite(n) && n >= 1 && n <= 120) {
        form.value.birth_date = approxDobFromAge(n)
    } else if (val === null || val === '' || val === undefined) {
        form.value.birth_date = null
    }
})

watch(
    () => form.value.birth_date,
    (val) => {
        if (!ageOnly.value && val) {
            form.value.birth_date_exact = true
        }
    },
)

watch(
    () => [form.value.birth_date_exact, form.value.birth_date],
    () => {
        if (ageOnly.value) {
            ageInput.value = calcAge(form.value.birth_date as string)
        } else {
            ageInput.value = null
        }
    },
    { immediate: true },
)

const computedAge = computed(() => (ageOnly.value ? null : calcAge(form.value.birth_date as string)))

const formattedAge = computed(() => {
    if (computedAge.value == null) return ''
    return new Intl.NumberFormat('fa-IR').format(computedAge.value)
})

const ageRule = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === '') return t('basicInfo.ageRequired')
    const n = Number(value)
    if (!Number.isFinite(n) || n < 1 || n > 120) return t('basicInfo.ageInvalid')
    return true
}

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