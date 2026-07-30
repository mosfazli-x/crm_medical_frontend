<template>
  <v-locale-provider rtl>
    <div class="crm-auth-page" dir="rtl">
      <div class="crm-auth-hero">
        <div class="text-center max-w-lg">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">{{ heroTitle }}</h1>
          <p class="text-xl opacity-90">{{ heroSubtitle }}</p>
          <div class="mt-12">
            <div class="bg-white/20 backdrop-blur rounded-3xl w-72 h-72 mx-auto p-6! flex items-center justify-center">
              <ClinicLogo class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div class="crm-auth-form-wrap">
        <Transition name="fade">
          <div class="crm-auth-card">
            <div class="text-center mb-8">
              <h2 class="crm-page-title text-2xl!">{{ title }}</h2>
              <p v-if="subtitle" class="crm-page-subtitle">{{ subtitle }}</p>
            </div>
            <slot />
          </div>
        </Transition>
      </div>
    </div>
  </v-locale-provider>
</template>

<script setup lang="ts">
import ClinicLogo from '~/components/icons/ClinicLogo.vue'

defineProps<{
  title: string
  subtitle?: string
  heroTitle?: string
  heroSubtitle?: string
}>()
</script>

<style scoped>
:deep(.ltr-field .v-field__input) {
  text-align: left !important;
}

:deep(.ltr-field ::placeholder) {
  text-align: left !important;
  direction: ltr;
  opacity: 0.7;
}
</style>
