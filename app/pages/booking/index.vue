<template>
  <BookingFlow />
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { t } = useI18n()

useSeoMeta({
  title: t('booking.titleSeoIndex'),
})
</script>
