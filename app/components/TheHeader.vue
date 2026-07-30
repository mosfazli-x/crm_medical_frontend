<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { useWindowScroll } from '@vueuse/core';

const { y } = useWindowScroll()
const isScrolled = computed(() => y.value > 24)
const mobileOpen = ref(false)
const activeSection = ref('#hero')
const scrollProgress = ref(0)
const { t } = useI18n()

const links = computed(() => [
  { label: t('header.home'), href: '#hero' },
  { label: t('header.about'), href: '#about' },
  { label: t('header.services'), href: '#services' },
  { label: t('header.doctors'), href: '#doctors' },
  { label: t('header.blog'), href: '#blog' },
  { label: t('header.contact'), href: '#appointment' }
])

function updateScrollProgress() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
}

function updateActiveSection() {
  const sections = ['hero', 'about', 'services', 'stats', 'doctors', 'blog', 'appointment']
  const scrollPos = window.scrollY + 150

  for (let i = sections.length - 1; i >= 0; i--) {
    const el = document.getElementById(sections[i])
    if (el && el.offsetTop <= scrollPos) {
      activeSection.value = '#' + sections[i]
      break
    }
  }
}

function onScroll() {
  updateScrollProgress()
  updateActiveSection()
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateScrollProgress()
  updateActiveSection()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <!-- Scroll progress bar -->
  <div
    class="scroll-progress"
    :style="{ width: scrollProgress + '%' }"
  />

  <header
    class="!fixed !inset-x-0 !top-0 !z-50 flex justify-center align-middle items-center px-4 sm:!px-6 md:!px-10"
    :class="isScrolled ? '!py-1.5 sm:!py-2' : '!py-2.5 sm:!py-3 md:!py-4'"
  >
    <div class="!container">
      <div
        class="!flex !items-center !justify-between !rounded-full !px-1 sm:!px-5 md:!px-7 !py-2.5 sm:!py-3 !transition-all !duration-700 !ease-out"
        :class="isScrolled ? 'glass-surface !shadow-soft' : '!bg-transparent'"
      >
        <!-- Logo -->
        <a href="#hero" class="!flex !items-center !gap-2 sm:!gap-2.5 !shrink-0 !group">
          <img src="../assets/images/logo.jpg" class="!flex !h-9 !w-9 sm:!h-10 sm:!w-10 !items-center !justify-center !rounded-xl sm:!rounded-2xl !bg-ink !transition-all !duration-300 group-hover:!shadow-[0_0_20px_rgba(62,232,168,0.3)] group-hover:!scale-105">
          <span class="!font-display !text-sm sm:!text-base md:!text-lg !font-bold !tracking-tight !truncate">{{ t('header.clinicName') }}</span>
        </a>

        <!-- Desktop nav -->
        <nav class="!hidden lg:!flex !items-center !gap-0.5">
          <a
            v-for="link in links"
            :key="link.href"
            :href="link.href"
            class="!relative !rounded-full !px-4 !py-2 !text-sm !font-medium !transition-all !duration-300"
            :class="activeSection === link.href
              ? 'nav-link-active'
              : '!text-ink/70 hover:!text-ink hover:!bg-ink/5'"
          >
            {{ link.label }}
            <span
              class="!absolute !bottom-0.5 !left-1/2 !-translate-x-1/2 !h-0.5 !rounded-full !transition-all !duration-300"
              :class="activeSection === link.href
                ? '!w-4 !bg-emerald'
                : '!w-0 group-hover:!w-2'"
            />
          </a>
        </nav>

        <div class="!flex !items-center !gap-2 sm:!gap-3">
          <MagneticButton as="a" href="#appointment" variant="solid" class="!hidden sm:!inline-flex !px-5 !py-2.5 md:!px-7 md:!py-3.5">
            {{ t('header.bookAppointment') }}
          </MagneticButton>

          <button
            class="!inline-flex !h-9 !w-9 sm:!h-10 sm:!w-10 !items-center !justify-center !rounded-xl !bg-ink/5 !transition-all !duration-300 hover:!bg-ink/10 lg:!hidden"
            :aria-label="t('header.openMenu')"
            @click="mobileOpen = !mobileOpen"
          >
            <svg v-if="!mobileOpen" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile nav -->
      <Transition
        enter-active-class="mobile-menu-enter-active"
        enter-from-class="mobile-menu-enter-from"
        enter-to-class="!opacity-100 !translate-y-0 !scale-100"
        leave-active-class="mobile-menu-leave-active"
        leave-from-class="!opacity-100 !translate-y-0 !scale-100"
        leave-to-class="mobile-menu-leave-to"
      >
        <nav v-if="mobileOpen" class="glass-surface !mt-2 sm:!mt-3 !flex !flex-col !gap-0.5 sm:!gap-1 !rounded-2xl sm:!rounded-3xl !p-2 sm:!p-3 !shadow-floaty lg:!hidden">
          <a
            v-for="(link, i) in links"
            :key="link.href"
            :href="link.href"
            class="!rounded-xl sm:!rounded-2xl !px-4 sm:!px-5 !py-3 sm:!py-3.5 !text-sm !font-medium !transition-all !duration-200"
            :class="activeSection === link.href
              ? '!bg-emerald-mist !text-emerald-deep'
              : '!text-ink/80 hover:!bg-ink/5 hover:!text-ink'"
            :style="{ animationDelay: (i * 50) + 'ms' }"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </a>
          <MagneticButton as="a" href="#appointment" variant="solid" class="!mt-1 sm:!mt-2 !justify-center !px-5 !py-3 md:!px-7 md:!py-3.5" @click="mobileOpen = false">
            {{ t('header.bookAppointment') }}
          </MagneticButton>
        </nav>
      </Transition>
    </div>
  </header>
</template>
