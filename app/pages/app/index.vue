<template>
  <div class="app-stagger">
    <!-- Greeting hero -->
    <section class="app-hero">
      <p class="app-hero__eyebrow">{{ todayLabel }}</p>
      <h1 class="app-hero__title">
        خوش آمدید{{ firstName ? `، ${firstName}` : '' }} 👋
      </h1>
      <div class="app-hero__meta">
        <span class="app-hero__chip">
          <Icon name="lucide:badge-check" size="15" />
          {{ roleLabel }}
        </span>
        <span class="app-hero__chip">
          <Icon name="lucide:smartphone" size="15" />
          نسخهٔ همراه
        </span>
      </div>
    </section>

    <!-- Feature shortcuts -->
    <div class="app-section">
      <h2>دسترسی سریع</h2>
    </div>

    <section class="app-tiles">
      <AppFeatureTile
        to="/app/patients"
        title="لیست بیماران"
        description="جستجو و مشاهدهٔ پرونده بیماران"
        icon="lucide:users"
        tint="green"
      />
      <AppFeatureTile
        to="/app/attendance"
        title="حضور و غیاب"
        description="ثبت ورود و خروج و گزارش حضور"
        icon="lucide:clock"
        tint="indigo"
      />
      <AppFeatureTile
        to="/app/finance"
        title="مالی"
        description="درآمد، هزینه و وضعیت صندوق"
        icon="lucide:wallet"
        tint="amber"
      />
      <AppFeatureTile
        to="/app/schedule"
        title="برنامه کاری"
        description="وظایف و برنامهٔ روزانهٔ کلینیک"
        icon="lucide:calendar-days"
        tint="rose"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'

definePageMeta({ layout: 'app', appTitle: 'خانه' })

const { user } = useAuth()

const firstName = computed(() => (user.value?.fullName || '').trim().split(/\s+/)[0] || '')
const roleLabel = computed(() => {
  const map: Record<string, string> = {
    admin_doctor: 'مدیر کلینیک',
    doctor: 'پزشک',
    lab: 'آزمایشگاه',
    pharmacy: 'داروخانه',
    patient: 'بیمار',
  }
  return map[user.value?.role || ''] || 'کاربر'
})

const todayLabel = computed(() => moment().format('dddd jD jMMMM jYYYY'))
</script>
