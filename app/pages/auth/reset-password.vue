<template>
    <v-locale-provider rtl>
        <div class="min-h-screen grid grid-cols-1 md:grid-cols-2" dir="rtl">
            <div
                class="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-electric-sapphire to-cornflower-blue text-white p-12!">
                <div class="text-center max-w-lg">
                    <h1 class="text-5xl font-bold mb-6">تغییر رمز عبور</h1>
                    <p class="text-xl opacity-90">کد تایید و رمز جدید را وارد کنید</p>
                    <div class="mt-12">
                        <div class="bg-white/20 backdrop-blur rounded-3xl w-80 h-80 mx-auto p-6!">
                            <ClinicLogo class="w-full h-full" />
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-center bg-gray-50 px-4!">
                <Transition name="fade">
                    <div class="bg-white rounded-3xl shadow-2xl p-6! max-w-md w-full">
                        <div class="text-center mb-6">
                            <h2 class="text-3xl font-bold text-slate-800">تغییر رمز عبور</h2>
                            <p class="text-slate-600 mt-3">کد تایید و رمز جدید را وارد کنید</p>
                        </div>

                        <v-form ref="formRef" @submit.prevent="handleResetPassword" class="space-y-6">
                            <v-text-field v-model="phone" label="شماره تلفن" variant="outlined"
                                density="comfortable" class="ltr-field" prepend-inner-icon="mdi-phone-outline"
                                readonly disabled />

                            <div class="text-center pb-4">
                                <p class="text-slate-600 mb-3 text-sm font-medium">کد تایید ۵ رقمی</p>
                                <div class="flex justify-center gap-3" dir="ltr">
                                    <input v-for="i in 5" :key="i"
                                        :ref="(el: any) => { if (el) otpRefs[i - 1] = el }"
                                        v-model="otp[i - 1]" type="text" inputmode="numeric" maxlength="1"
                                        class="otp-box"
                                        @input="onOtpInput(i - 1)"
                                        @keydown.backspace="onOtpBackspace(i - 1)"
                                        @paste="onOtpPaste" />
                                </div>
                                <p v-if="otpError" class="text-red-500 text-xs mt-2">{{ otpError }}</p>
                            </div>

                            <v-text-field v-model="password" label="رمز عبور جدید"
                                :type="showPassword ? 'text' : 'password'" variant="outlined"
                                density="comfortable" class="ltr-field"
                                prepend-inner-icon="mdi-lock-outline"
                                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showPassword = !showPassword"
                                :rules="passwordRules" required />

                            <v-text-field v-model="confirmPassword" label="تکرار رمز عبور"
                                :type="showConfirm ? 'text' : 'password'" variant="outlined"
                                density="comfortable" class="ltr-field"
                                prepend-inner-icon="mdi-lock-outline"
                                :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                                @click:append-inner="showConfirm = !showConfirm"
                                :rules="[v => v === password || 'رمز عبور همسان نیست']" required />

                            <div class="text-center text-sm">
                                <template v-if="timer > 0">
                                    <span class="text-slate-500">کد تا </span>
                                    <span class="text-red-500 font-bold" dir="ltr">
                                        {{ String(Math.floor(timer / 60)).padStart(2, '0') }}:{{ String(timer % 60).padStart(2, '0') }}
                                    </span>
                                    <span class="text-slate-500">  اعتبار دارد</span>
                                </template>
                                <template v-else>
                                    <span class="text-red-500">کد منقضی شده است</span>
                                </template>
                            </div>

                            <v-btn v-if="timer === 0" variant="text" color="primary"
                                :loading="resending" @click="resendCode" class="text-sm" block>
                                ارسال مجدد کد
                            </v-btn>

                            <v-btn type="submit" variant="elevated" color="primary" size="x-large" block
                                :loading="loading" :disabled="timer <= 0"
                                class="font-semibold tracking-normal! mt-2">
                                تغییر رمز عبور
                            </v-btn>
                        </v-form>

                        <div class="text-center mt-8 text-sm text-slate-600">
                            <nuxt-link to="/auth/login" class="text-electric-sapphire font-medium hover:underline">
                                بازگشت به ورود
                            </nuxt-link>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
    </v-locale-provider>
</template>

<script setup lang="ts">
import ClinicLogo from '~/components/icons/ClinicLogo.vue'

const route = useRoute()
const formRef = ref<any>(null)

const phone = ref(route.query.phone as string || '')
const otp = ref(['', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const otpError = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const resending = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const timer = ref(300)

let timerInterval: ReturnType<typeof setInterval> | null = null

const passwordRules = [
    (v: string) => (v && v.length >= 8) || 'حداقل ۸ کاراکتر',
]

if (!phone.value) {
    navigateTo('/auth/forgot-password')
}

const startTimer = () => {
    timer.value = 300
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
        if (timer.value > 0) timer.value--
        else if (timerInterval) clearInterval(timerInterval)
    }, 1000)
}

const onOtpInput = (index: number) => {
    otpError.value = ''
    const val = otp.value[index]
    if (val && !/^\d$/.test(val)) {
        otp.value[index] = ''
        return
    }
    if (val && index < 4) {
        otpRefs.value[index + 1]?.focus()
    }
}

const onOtpBackspace = (index: number) => {
    if (!otp.value[index] && index > 0) {
        otpRefs.value[index - 1]?.focus()
    }
}

const onOtpPaste = (e: ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData?.getData('text') || ''
    const digits = pasted.replace(/\D/g, '').slice(0, 5)
    for (let i = 0; i < digits.length; i++) {
        otp.value[i] = digits[i]
    }
    const focusIdx = Math.min(digits.length, 4)
    setTimeout(() => otpRefs.value[focusIdx]?.focus(), 0)
    otpError.value = ''
}

const handleResetPassword = async () => {
    if (!formRef.value) return
    const { valid } = await formRef.value.validate()
    if (!valid) return

    const code = otp.value.join('')
    if (code.length !== 5) {
        otpError.value = 'کد تایید باید ۵ رقم باشد'
        return
    }

    loading.value = true
    try {
        await $fetch('/api/auth/reset-password', {
            method: 'POST',
            body: {
                phone: phone.value,
                code,
                password: password.value,
            },
            baseURL: useRuntimeConfig().public.apiBase,
        })
        useNuxtApp().$toast.success('رمز عبور با موفقیت تغییر یافت.')
        await navigateTo('/auth/login')
    } catch (err: any) {
        const status = err?.response?.status
        if (status === 401) {
            otpError.value = 'کد نامعتبر یا منقضی شده است'
            otp.value = ['', '', '', '', '']
            otpRefs.value[0]?.focus()
        } else if (status === 429) {
            useNuxtApp().$toast.error('تعداد تلاش‌های ناموفق بیش از حد مجاز است. مجدداً درخواست کد کنید')
            await navigateTo('/auth/forgot-password')
        } else if (status === 400) {
            useNuxtApp().$toast.error('اطلاعات وارد شده معتبر نیست')
        } else {
            useNuxtApp().$toast.error('خطا در تغییر رمز عبور. بعداً تلاش کنید')
        }
    } finally {
        loading.value = false
    }
}

const resendCode = async () => {
    resending.value = true
    try {
        await $fetch('/api/auth/forgot-password', {
            method: 'POST',
            body: { phone: phone.value },
            baseURL: useRuntimeConfig().public.apiBase,
        })
        useNuxtApp().$toast.success('کد جدید ارسال شد')
        otp.value = ['', '', '', '', '']
        otpError.value = ''
        startTimer()
        otpRefs.value[0]?.focus()
    } catch (err: any) {
        const status = err?.response?.status
        if (status === 429) {
            useNuxtApp().$toast.error('تعداد درخواست‌ها بیش از حد مجاز است')
        } else {
            useNuxtApp().$toast.error('خطا در ارسال کد')
        }
    } finally {
        resending.value = false
    }
}

onMounted(() => {
    startTimer()
    nextTick(() => otpRefs.value[0]?.focus())
})

onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
})

useSeoMeta({ title: 'تغییر رمز عبور' })
definePageMeta({ layout: false })
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
:deep(.ltr-field .v-field__input) {
    text-align: left !important;
}
:deep(.ltr-field ::placeholder) {
    text-align: left !important;
    direction: ltr;
    opacity: 0.7;
}
.otp-box {
    width: 48px;
    height: 56px;
    text-align: center;
    font-size: 1.5rem;
    font-weight: 700;
    border: 2px solid #cbd5e1;
    border-radius: 12px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    background: #fff;
    color: #1e293b;
    font-family: inherit;
}
.otp-box:focus {
    border-color: #5465ff;
    box-shadow: 0 0 0 3px rgba(84, 101, 255, 0.15);
}
</style>
