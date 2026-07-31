<template>
  <BookingFlow :initial-doctor-id="doctorId" :initial-visit-type-id="visitTypeId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

definePageMeta({ layout: false })

const route = useRoute()
const { t } = useI18n()

const doctorId = computed(() => route.params.doctorId as string)
const visitTypeId = computed(() => route.query.visitTypeId as string | undefined)

useSeoMeta({
  title: t('booking.titleSeo'),
})
</script>
