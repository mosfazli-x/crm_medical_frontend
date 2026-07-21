<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTilt } from '../composables/Usetilt'
import { useScrollReveal } from '../composables/Usescrollreveal'

const root = ref<HTMLElement | null>(null)
const badgeCard = ref<HTMLElement | null>(null)
const statCard = ref<HTMLElement | null>(null)
const heroImage = ref<HTMLElement | null>(null)
const particlesContainer = ref<HTMLElement | null>(null)

useScrollReveal(root, { items: '.hero-reveal', stagger: 0.12, start: 'top 95%' })
useTilt(badgeCard, { max: 5, scale: 1.02 })
useTilt(statCard, { max: 5, scale: 1.02 })
useTilt(heroImage, { max: 4, scale: 1.01 })

let rafId: number | null = null
function onScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    const scrollY = window.scrollY
    if (particlesContainer.value) {
      particlesContainer.value.style.transform = `translateY(${scrollY * 0.15}px)`
    }
    rafId = null
  })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <section id="hero" ref="root" class="!relative !overflow-hidden !pb-12 !pt-20 sm:!pb-16 sm:!pt-32 md:!pb-20 md:!pt-36 lg:!pb-28 lg:!pt-44 flex justify-center align-middle items-center">
    <!-- Animated gradient background -->
    <div class="!pointer-events-none !absolute !inset-0 -z-10 hero-gradient-bg">
      <div class="!absolute !-top-32 !right-[-10%] !h-[20rem] !w-[20rem] sm:!h-[28rem] sm:!w-[28rem] md:!h-[36rem] md:!w-[36rem] !rounded-full !bg-emerald-mist !blur-3xl !opacity-70 animate-floaty-slow" />
      <div class="!absolute !bottom-0 !left-[-10%] !h-48 !w-48 sm:!h-64 sm:!w-64 md:!h-80 md:!w-80 !rounded-full !bg-emerald-bright/10 !blur-3xl animate-floaty" />
      <!-- Subtle grid pattern -->
      <div class="!absolute !inset-0 !opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 40px 40px;" />
    </div>

    <!-- Floating particles -->
    <div ref="particlesContainer" class="!pointer-events-none !absolute !inset-0 -z-5 overflow-hidden">
      <div class="hero-particle hero-particle--sm !top-[15%] !right-[12%] animate-floaty" />
      <div class="hero-particle hero-particle--md !top-[25%] !left-[8%] animate-floaty-slow" style="animation-delay: -2s;" />
      <div class="hero-particle hero-particle--lg !top-[60%] !right-[20%] animate-float-gentle" style="animation-delay: -4s;" />
      <div class="hero-particle hero-particle--sm !top-[40%] !left-[15%] animate-floaty" style="animation-delay: -1s;" />
      <div class="hero-particle hero-particle--md !top-[70%] !left-[25%] animate-floaty-slow" style="animation-delay: -3s;" />
      <div class="hero-particle hero-particle--sm !top-[10%] !left-[40%] animate-float-gentle" style="animation-delay: -5s;" />
      <div class="hero-particle hero-particle--lg !top-[80%] !right-[35%] animate-floaty" style="animation-delay: -2.5s;" />
      <div class="hero-particle hero-particle--sm !top-[50%] !right-[5%] animate-float-gentle" style="animation-delay: -1.5s;" />
    </div>

    <div class="!container !grid !grid-cols-1 lg:!grid-cols-2 !items-center !gap-8 sm:!gap-10 md:!gap-14 lg:!gap-10">
      <!-- Text column -->
      <div class="!relative !z-10 !order-2 lg:!order-1 px-6">
        <div class="hero-reveal !mb-4 sm:!mb-6 !inline-flex !items-center !gap-2 sm:!gap-2.5 !rounded-full !border !border-emerald/20 !bg-white/80 !px-4 sm:!px-5 !py-1.5 sm:!py-2 !text-xs sm:!text-sm !font-medium !text-emerald-deep !backdrop-blur-md !shadow-soft" style="animation: blur-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;">
          <span class="!relative !h-2 !w-2 !rounded-full !bg-emerald-bright">
            <span class="!absolute !inset-0 !rounded-full !bg-emerald-bright animate-pulse-ring" />
          </span>
          کلینیک خصوصی دکتر حسینی
        </div>

        <h1 class="hero-reveal !font-display !text-4xl sm:!text-5xl md:!text-display-xl !font-black !text-ink !tracking-tight" style="animation: hero-text 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;">
          مراقبت پزشکی
          <br />
          <span class="gradient-text">تخصصی</span> با رویکردی مدرن
        </h1>

        <p class="hero-reveal !mt-5 sm:!mt-7 !max-w-lg !text-sm sm:!text-base md:!text-lg !leading-7 sm:!leading-8 !text-muted !font-normal" style="animation: blur-in 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;">
          ارائه خدمات تشخیص، درمان و مشاوره توسط پزشکان متخصص، با بهره‌گیری از
          جدیدترین تجهیزات پزشکی و محیطی آرام و مطمئن برای شما و خانواده‌تان.
        </p>

        <div class="hero-reveal !mt-6 sm:!mt-10 !flex !flex-wrap !items-center align-middle justify-center !gap-3 sm:!gap-4" style="animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;">
          <MagneticButton as="a" href="#appointment" variant="solid" class="!px-5 !py-3 sm:!px-7 sm:!py-3.5">
            رزرو نوبت آنلاین
          </MagneticButton>
          <MagneticButton as="a" href="#about" variant="outline" :icon="false" class="!px-5 !py-3 sm:!px-7 sm:!py-3.5">
            مشاوره رایگان
          </MagneticButton>
        </div>

        <div class="hero-reveal !mt-8 sm:!mt-12 md:!mt-14 !flex align-middle justify-center !flex-wrap !items-center !gap-x-6 sm:!gap-x-8 md:!gap-x-12 !gap-y-4 sm:!gap-y-5" style="animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1s both;">
          <div class="counter-underline cursor-default group">
            <p class="!font-display !text-3xl sm:!text-4xl !font-black !text-ink !tabular-nums group-hover:!text-emerald-deep !transition-colors !duration-300">۱۵+</p>
            <p class="!text-xs sm:!text-sm !text-muted !mt-1">پزشک متخصص</p>
          </div>
          <div class="!h-8 sm:!h-10 !w-px !bg-gradient-to-b !from-transparent !via-ink/15 !to-transparent" />
          <div class="counter-underline cursor-default group">
            <p class="!font-display !text-3xl sm:!text-4xl !font-black !text-ink !tabular-nums group-hover:!text-emerald-deep !transition-colors !duration-300">۱۰ سال</p>
            <p class="!text-xs sm:!text-sm !text-muted !mt-1">تجربه بالینی</p>
          </div>
          <div class="!h-8 sm:!h-10 !w-px !bg-gradient-to-b !from-transparent !via-ink/15 !to-transparent !hidden sm:!block" />
          <div class="!hidden sm:!block counter-underline cursor-default group">
            <p class="!font-display !text-3xl sm:!text-4xl !font-black !text-ink !tabular-nums group-hover:!text-emerald-deep !transition-colors !duration-300">۹۸٪</p>
            <p class="!text-xs sm:!text-sm !text-muted !mt-1">رضایت بیماران</p>
          </div>
        </div>
      </div>

      <!-- Visual column -->
      <div class="hero-reveal !relative !mx-auto !aspect-[4/5] !w-full !max-w-[280px] sm:!max-w-sm md:!max-w-md lg:!max-w-md !order-1 lg:!order-2 tilt-perspective" style="animation: scale-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;">
        <!-- Main image -->
        <div ref="heroImage" class="!absolute !inset-3 sm:!inset-4 !overflow-hidden !rounded-3xl sm:!rounded-4xl md:!rounded-5xl !shadow-floaty image-reveal">
          <NuxtImg
            src="/images/dr_hasti_hosseini.jpg"
            alt="پزشک متخصص کلینیک دکتر حسینی در حال مشاوره با بیمار"
            class="!h-full !w-full !object-cover !transition-all !duration-700 hover:!scale-105"
            loading="eager"
            sizes="(max-width: 640px) 280px, (max-width: 768px) 384px, 480px"
          />
          <div class="!absolute !inset-0 !bg-gradient-to-t !from-ink/30 !via-ink/5 !to-transparent" />
          <div class="!absolute !inset-0 !bg-gradient-to-r !from-transparent !via-white/5 !to-transparent !opacity-0 hover:!opacity-100 !transition-opacity !duration-700" />
        </div>

        <!-- Floating badge: next appointment -->
        <div
          ref="badgeCard"
          class="glass-surface !absolute !-bottom-4 sm:!-bottom-6 !right-0 sm:!-right-4 md:!-right-10 !z-10 !w-52 sm:!w-56 md:!w-64 !rounded-3xl sm:!rounded-4xl !p-4 sm:!p-5 !hidden sm:!block card-glow card-shimmer-border floating-badge"
        >
          <div class="!flex !items-center !justify-between">
            <span class="!text-xs !font-semibold !text-muted !tracking-wide">نوبت بعدی</span>
            <span class="!relative !flex !h-7 !w-7 !items-center !justify-center !rounded-full !bg-emerald-mist">
              <span class="!absolute !inset-0 !rounded-full !bg-emerald/20 animate-pulse-ring" />
              <LottiePlayer class="!h-4 !w-4 !relative !z-10" />
            </span>
          </div>
          <p class="!mt-2 !font-display !text-lg sm:!text-xl !font-bold !text-ink">امروز، ساعت ۱۶:۰۰</p>
          <div class="!mt-3 !flex !items-center -!space-x-2 rtl:!space-x-reverse">
            <span
              v-for="n in 3"
              :key="n"
              class="!h-7 !w-7 sm:!h-8 sm:!w-8 !rounded-full !border-2 !border-white !bg-emerald-mist !shadow-sm !transition-transform !duration-300 hover:!scale-110 hover:!z-10"
            />
            <span class="!ms-2 sm:!ms-3 !text-xs !text-muted !font-medium">۳ پزشک آنلاین</span>
          </div>
        </div>

        <!-- Trust badge -->
        <div
          ref="statCard"
          class="glass-surface !absolute !-top-3 sm:!-top-4 !left-0 sm:!-left-4 md:!-left-10 !z-10 !flex !items-center !gap-2 sm:!gap-3 !rounded-3xl sm:!rounded-4xl !p-3 sm:!p-5 !hidden sm:!flex card-glow card-shimmer-border floating-badge"
          style="animation-delay: -2s;"
        >
          <span class="!font-display !text-2xl sm:!text-3xl !font-black !text-emerald-deep tabular-nums">۹۸٪</span>
          <span class="!max-w-[5rem] sm:!max-w-[6rem] !text-[10px] sm:!text-xs !leading-4 sm:!leading-5 !text-muted !font-medium">رضایت بیماران از کیفیت درمان</span>
        </div>

        <!-- Decorative rings -->
        <div class="!absolute !-inset-6 sm:!-inset-8 !rounded-full !border !border-emerald/5 !pointer-events-none !hidden lg:!block" />
        <div class="!absolute !-inset-10 sm:!-inset-16 !rounded-full !border !border-emerald/3 !pointer-events-none !hidden lg:!block" />
      </div>
    </div>
  </section>
</template>
