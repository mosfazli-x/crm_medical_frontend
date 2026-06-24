<template>
    <v-locale-provider rtl>
        <div class="min-h-screen grid grid-cols-1 md:grid-cols-2" dir="rtl">
            <div
                class="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-electric-sapphire to-cornflower-blue text-white p-12!">
                <div class="text-center max-w-lg">
                    <h1 class="text-5xl font-bold mb-6">بازیابی رمز عبور</h1>
                    <p class="text-xl opacity-90">کد تایید به شماره شما ارسال خواهد شد</p>
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
                        <div class="text-center mb-10">
                            <h2 class="text-3xl font-bold text-slate-800">فراموشی رمز عبور</h2>
                            <p class="text-slate-600 mt-3">شماره تلفن خود را وارد کنید</p>
                        </div>

                        <v-form @submit.prevent="handleForgotPassword" class="space-y-6">
                            <v-text-field v-model="phone" label="شماره تلفن" type="tel" variant="outlined"
                                density="comfortable" placeholder="09123456789" class="ltr-field"
                                prepend-inner-icon="mdi-phone-outline"
                                :rules="phoneRules" required />

                            <v-btn type="submit" variant="elevated" color="primary" size="x-large" block
                                :loading="loading" class="font-semibold tracking-normal! my-2!">
                                ارسال کد تایید
                            </v-btn>
                        </v-form>

                        <div class="text-center mt-8 text-sm text-slate-600">
                            رمز عبور خود را به یاد دارید؟
                            <nuxt-link to="/auth/login" class="text-electric-sapphire font-medium hover:underline">
                                ورود
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

const phone = ref('')
const loading = ref(false)
const phoneRules = [
    (v: string) => /^09\d{9}$/.test(v) || 'شماره تلفن معتبر نیست (مثال: 09123456789)',
]

const handleForgotPassword = async () => {
    loading.value = true
    try {
        await $fetch('/api/auth/forgot-password', {
            method: 'POST',
            body: { phone: phone.value },
            baseURL: useRuntimeConfig().public.apiBase,
        })
        useNuxtApp().$toast.success('در صورت وجود حساب، کد تایید ارسال شد.')
        await navigateTo(`/auth/reset-password?phone=${encodeURIComponent(phone.value)}`)
    } catch (err: any) {
        const status = err?.response?.status
        if (status === 429) {
            useNuxtApp().$toast.error('تعداد درخواست‌ها بیش از حد مجاز است. ۱۰ دقیقه بعد تلاش کنید')
        } else {
            useNuxtApp().$toast.error('خطا در ارسال کد. بعداً تلاش کنید')
        }
    } finally {
        loading.value = false
    }
}

useSeoMeta({ title: 'فراموشی رمز عبور' })
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
</style>
