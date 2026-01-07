<template>
    <v-locale-provider rtl>
        <div class="min-h-screen grid grid-cols-1 md:grid-cols-2" dir="rtl">
            <!-- سمت چپ: Illustration پزشکی -->
            <div class="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-700 text-white p-12!">
                <div class="text-center max-w-lg">
                    <h1 class="text-5xl font-bold mb-6">سیستم مدیریت کلینیک</h1>
                    <p class="text-xl opacity-90">مدیریت هوشمند بیماران، ویزیت‌ها و پرونده‌های پزشکی</p>
                    <!-- لوگو کلینیک -->
                    <div class="mt-12">
                        <div class="bg-white/20 backdrop-blur rounded-3xl w-80 h-80 mx-auto p-6!">
                            <ClinicLogo class="w-full h-full" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- سمت راست: فرم ورود -->
            <div class="flex items-center justify-center bg-gray-50 px-6">
                <Transition name="fade">
                    <div class="bg-white rounded-3xl shadow-2xl p-10! max-w-md w-full">
                        <div class="text-center mb-10">
                            <h2 class="text-3xl font-bold text-slate-800">ورود به سیستم</h2>
                            <p class="text-slate-600 mt-3">اطلاعات خود را وارد کنید</p>
                        </div>

                        <v-form @submit.prevent="handleLogin" class="space-y-6">
                            <!-- فیلد شماره تلفن: LTR + تایپ عددی انگلیسی -->
                            <v-text-field v-model="phone" label="شماره تلفن" type="tel" variant="outlined" density="comfortable" placeholder="09123456789" class="ltr-field" prepend-inner-icon="mdi-phone-outline" required />

                            <!-- فیلد رمز عبور: LTR + نمایش/مخفی -->
                            <v-text-field v-model="password" label="رمز عبور" :type="showPassword ? 'text' : 'password'" variant="outlined" density="comfortable" class="ltr-field" prepend-inner-icon="mdi-lock-outline" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'" @click:append-inner="showPassword = !showPassword" required />

                            <v-btn type="submit" variant="elevated" color="primary" size="x-large" block :loading="loading" class="font-semibold tracking-normal!">
                                ورود
                            </v-btn>
                        </v-form>

                        <div class="text-center mt-8 text-sm text-slate-600">
                            اولین بار است؟
                            <nuxt-link to="/auth/register" class="text-blue-600 font-medium hover:underline">
                                ثبت‌نام اولیه
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
import { useAuth } from '~/composables/useAuth'

const { login } = useAuth()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
    loading.value = true
    await login({
        phone: phone.value,
        password: password.value,
    })
    loading.value = false
}

useSeoMeta({
    title: 'ورود به سیستم',
})
definePageMeta({
    layout: false,
})
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

/* تنظیمات LTR برای فیلدهای انگلیسی/عددی (تلفن و پسورد) */
:deep(.ltr-field .v-field__input) {
    text-align: left !important;
}

:deep(.ltr-field ::placeholder) {
    text-align: left !important;
    direction: ltr;
    opacity: 0.7;
}
</style>