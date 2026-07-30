<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

definePageMeta({ layout: false })

const { lang, t: langT, toggleLang, isRtl, pn, services, doctors, testimonials, contactItems } = useLang()
const { t } = useI18n()

const showLoadingScreen = ref(true)
const isLoadingComplete = ref(false)

const pageTitle = computed(() => t('index.pageTitle'))
const pageDesc = computed(() => langT('landing.home.desc'))

useSeoMeta({
  title: pageTitle,
  description: pageDesc,
  ogTitle: pageTitle,
  ogDescription: pageDesc,
})

const router = useRouter()

function goToBooking() {
  router.push('/booking/')
}

const mobileMenuOpen = ref(false)

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

const { x: glowX, y: glowY, visible: glowVisible } = useCursorGlow()
const { mx: _pmx, my: _pmy, sx: psx, sy: psy } = useMouseParallax()

const parallaxLottie = computed(() => ({
  transform: `perspective(800px) rotateY(${-psx.value * 30}deg) rotateX(${psy.value * 30}deg)`,
}))

const { isLight, toggleTheme, initTheme: initLandingTheme } = useLandingTheme()

const { value: statDoctors, animate: animateDoctors } = useCounter(15, 1600)
const { value: statYears, animate: animateYears } = useCounter(10, 1400)
const { value: statSatisfaction, animate: animateSatisfaction } = useCounter(98, 1800)
const { value: statPatients, animate: animatePatients } = useCounter(12, 1200)
const statsAnimated = ref(false)

function animateStats() {
  if (statsAnimated.value) return
  statsAnimated.value = true
  animateDoctors()
  animateYears()
  animateSatisfaction()
  animatePatients()
}

const titleWords = computed(() => t('landing.home.title1').split(' '))
const titleAccentWords = computed(() => t('landing.home.title2').split(' '))
const titleRevealed = ref(false)

function revealTitle() {
  if (titleRevealed.value) return
  titleRevealed.value = true
}

const activeTestimonial = ref(0)
let testimonialInterval: ReturnType<typeof setInterval> | null = null

function startTestimonialRotation() {
  testimonialInterval = setInterval(() => {
    activeTestimonial.value = (activeTestimonial.value + 1) % testimonials.value.length
  }, 5000)
}

function setTestimonial(i: number) {
  activeTestimonial.value = i
  if (testimonialInterval) {
    clearInterval(testimonialInterval)
    startTestimonialRotation()
  }
}

const formSubmitted = ref(false)
const contactForm = ref({
  name: '',
  phone: '',
  service: '',
  message: '',
})
const submittingForm = ref(false)
const { $toast } = useNuxtApp()

function onSubmitForm() {
  if (!contactForm.value.name || !contactForm.value.phone) return
  submittingForm.value = true
  $toast.success(t('landing.contact.successTitle'))
  formSubmitted.value = true
  submittingForm.value = false
}

function resetForm() {
  formSubmitted.value = false
  contactForm.value = { name: '', phone: '', service: '', message: '' }
}

const activeSection = ref('home')
const scrollProgress = ref(0)
const sectionIds = ['home', 'services', 'doctors', 'contact']
const navScrolled = ref(false)

function updateScrollProgress() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0
}

function scrollToSection(id: string) {
  closeMobileMenu()
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function handleNavClick(id: string) {
  if (sectionIds.includes(id)) {
    scrollToSection(id)
  } else {
    router.push(`/${id}`)
  }
}

let observer: IntersectionObserver | null = null

function setupObserver() {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      }
    },
    { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
  )

  for (const id of sectionIds) {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  }
}

const prefersReducedMotion = ref(false)

function playIntro() {
  const { $gsap } = useNuxtApp()
  const gsap = $gsap as any
  if (!gsap || prefersReducedMotion.value) {
    revealTitle()
    animateStats()
    return
  }

  const tl = gsap.timeline()

  tl.fromTo('.imm-nav',
    { y: -72, opacity: 0 },
    { y: 0, opacity: 1, duration: 1.00, ease: 'power2.out' }
  )

  tl.fromTo('.imm-lottie-container',
    { scale: 1.04, filter: 'blur(4px)' },
    { scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' },
    '-=0.35'
  )

  tl.fromTo('.imm-home-content .scene-stagger',
    { y: 16 },
    { y: 0, stagger: 0.05, duration: 0.45, ease: 'power2.out' },
    '-=0.5'
  )

  tl.call(() => { revealTitle(); animateStats() }, null, '-=0.3')
}

function initTiltCards() {
  if (prefersReducedMotion.value) return
  let tiltRaf: number | null = null
  const container = document.querySelector<HTMLElement>('.imm-scroll-container')
  if (!container) return

  container.addEventListener('mousemove', (e) => {
    if (tiltRaf) cancelAnimationFrame(tiltRaf)
    tiltRaf = requestAnimationFrame(() => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('.imm-tilt-card')
      if (!card) return
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`
    })
  })

  container.addEventListener('mouseleave', () => {
    const cards = container.querySelectorAll<HTMLElement>('.imm-tilt-card')
    cards.forEach(card => {
      card.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1)'
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      setTimeout(() => { card.style.transition = '' }, 500)
    })
  })
}

const sectionInView = ref('home')

function onScroll() {
  updateScrollProgress()
  navScrolled.value = window.scrollY > 60
  const sections = sectionIds
  const scrollPos = window.scrollY + 120
  for (let i = sections.length - 1; i >= 0; i--) {
    const el = document.getElementById(sections[i])
    if (el && el.offsetTop <= scrollPos) {
      sectionInView.value = sections[i]
      break
    }
  }
}

onMounted(async () => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.documentElement.classList.add('imm-page')
  document.body.classList.add('imm-page')
  document.documentElement.dir = isRtl.value ? 'rtl' : 'ltr'
  document.documentElement.lang = lang.value
  initLandingTheme()

  setTimeout(() => {
    showLoadingScreen.value = false
  }, 2200)
})

watch(isLoadingComplete, async (isComplete) => {
  if (isComplete) {
    await nextTick()
    updateScrollProgress()
    setupObserver()
    const homeEl = document.getElementById('home')
    if (homeEl) homeEl.classList.add('active')
    playIntro()
    startTestimonialRotation()
    initTiltCards()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateScrollProgress)
  }
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove('imm-page')
  document.body.classList.remove('imm-page')
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', updateScrollProgress)
  if (observer) observer.disconnect()
  if (testimonialInterval) clearInterval(testimonialInterval)
})

const navItems = computed(() => [
  { id: 'home', label: t('landing.nav.home') },
  { id: 'education', label: t('landing.nav.education') },
  { id: 'blog', label: t('landing.nav.blog') },
  { id: 'aboutUs', label: t('landing.nav.aboutUs') },
  { id: 'contact', label: t('landing.nav.contact') },
])

const icons: Record<string, string> = {
  heart: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
  shield: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>',
  pulse: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
  flask: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16.5h10"/></svg>',
  clock: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  users: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  star: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  arrowFa: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',
  medical: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2a2 2 0 0 0-2 2v4H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v3a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-3h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-3V6a2 2 0 0 0-2-2z"/></svg>',
  lang: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  check: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
  moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
  hamburger: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>',
  close: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
}
</script>

<template>
  <LandingLoadingScreen
    :show="showLoadingScreen"
    @finished="isLoadingComplete = true"
  />

  <div v-if="isLoadingComplete" class="imm-viewport">

    <!-- Scroll Progress Bar -->
    <div class="imm-progress-bar" aria-hidden="true">
      <div class="imm-progress-bar-inner" :style="{ width: scrollProgress + '%' }" />
    </div>

    <!-- Background -->

    <!-- Cursor Glow -->
    <div
      class="imm-cursor-glow"
      :class="{ visible: glowVisible }"
      :style="{ '--glow-x': glowX + '%', '--glow-y': glowY + '%' }"
      aria-hidden="true"
    />

    <!-- Navigation -->
    <nav class="imm-nav" :class="{ scrolled: navScrolled }" role="navigation" aria-label="Main navigation">
      <a href="/" class="imm-nav-logo" :aria-label="t('landing.clinicName') + ' ' + t('landing.nav.home')">
        <div class="imm-nav-logo-icon bg-[#2563eb]" aria-hidden="true">
          <img src="~/assets/images/hastihoseinilogo.png" :alt="t('landing.clinicName')" class="imm-nav-logo-img" width="40" height="40" />
        </div>
        <span class="imm-nav-logo-text pt-2 hidden md:flex">{{ t('landing.clinicName') }}</span>
      </a>

      <div class="imm-nav-tabs" role="tablist" aria-label="Page sections">
        <button
          v-for="item in navItems"
          :key="item.id"
          role="tab"
          :aria-selected="activeSection === item.id"
          class="imm-nav-tab"
          :class="{ active: activeSection === item.id && sectionIds.includes(item.id) }"
          @click="handleNavClick(item.id)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="imm-nav-actions">
        <BackgroundMusic />
        <button
          class="imm-theme-toggle"
          :title="isLight ? t('landing.theme.dark') : t('landing.theme.light')"
          @click="toggleTheme"
        >
          <span v-if="isLight" v-html="icons.moon" aria-hidden="true" />
          <span v-else v-html="icons.sun" aria-hidden="true" />
        </button>
        <button class="imm-nav-lang" :title="t('index.langToggleTitle')" @click="toggleLang">
          <span v-html="icons.lang" aria-hidden="true" />
          <span>{{ t('landing.lang.toggle') }}</span>
        </button>
        <button v-dir class="imm-nav-cta imm-magnetic dir-ltr" @click="goToBooking">
          {{ t('landing.nav.book') }}
          <span v-html="isRtl ? icons.arrowFa : icons.arrow" aria-hidden="true" />
        </button>
      </div>

      <!-- Mobile Hamburger -->
      <button
        class="imm-nav-hamburger"
        :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="mobileMenuOpen"
        @click="toggleMobileMenu"
      >
        <span v-if="!mobileMenuOpen" v-html="icons.hamburger" aria-hidden="true" />
        <span v-else v-html="icons.close" aria-hidden="true" />
      </button>
    </nav>

    <!-- Mobile Menu Drawer -->
    <Transition name="imm-mobile-menu">
      <div
        v-if="mobileMenuOpen"
        class="imm-mobile-drawer"
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div class="imm-mobile-drawer-content">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="imm-mobile-drawer-tab"
            :class="{ active: activeSection === item.id && sectionIds.includes(item.id) }"
            @click="handleNavClick(item.id)"
          >
            {{ item.label }}
          </button>
          <div class="imm-mobile-drawer-divider" />
          <div class="imm-mobile-drawer-actions">
            <button class="imm-mobile-drawer-lang" @click="toggleLang">
              <span v-html="icons.lang" aria-hidden="true" />
              {{ t('landing.lang.toggle') }}
            </button>
            <button class="imm-mobile-drawer-theme" @click="toggleTheme">
              <span v-if="isLight" v-html="icons.moon" aria-hidden="true" />
              <span v-else v-html="icons.sun" aria-hidden="true" />
              {{ isLight ? t('landing.theme.dark') : t('landing.theme.light') }}
            </button>
          </div>
          <button class="imm-mobile-drawer-cta imm-magnetic" @click="goToBooking">
            {{ t('landing.nav.book') }}
            <span v-html="isRtl ? icons.arrowFa : icons.arrow" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Navigation Dots -->
    <div class="imm-nav-dots" role="navigation" aria-label="Section navigation">
      <button
        v-for="id in sectionIds"
        :key="id"
        class="imm-nav-dot"
        :class="{ active: sectionInView === id }"
        :aria-label="`Go to ${id} section`"
        @click="scrollToSection(id)"
      />
    </div>

    <!-- ═══ Sections ═══ -->
    <div class="imm-scroll-container">

      <!-- ── HOME ── -->
      <section id="home" class="imm-section imm-section--home" data-section="home">
        <div class="imm-home">
          <div v-dir class="imm-home-content">
            <div class="scene-stagger imm-home-badge">
              <span class="imm-home-badge-dot" />
              {{ t('landing.home.badge') }}
            </div>
            <h1 class="scene-stagger imm-home-title text-center">
              <span class="imm-reveal-text">
                <span
                  v-for="(word, i) in titleWords"
                  :key="'tw-' + i"
                  class="imm-reveal-word"
                  :class="{ revealed: titleRevealed }"
                  :style="{ transitionDelay: (i * 80) + 'ms' }"
                >{{ word }}&nbsp;</span>
              </span>
              <br />
              <span class="imm-reveal-text imm-home-title-accent">
                <span
                  v-for="(word, i) in titleAccentWords"
                  :key="'taw-' + i"
                  class="imm-reveal-word"
                  :class="{ revealed: titleRevealed }"
                  :style="{ transitionDelay: ((titleWords.length + i) * 80 + 100) + 'ms' }"
                >{{ word }}&nbsp;</span>
              </span>
            </h1>
            <div class="scene-stagger imm-title-rule w-full! justify-center align-middle" aria-hidden="true">
              <span class="imm-title-rule-line" />
              <span class="imm-title-rule-dot" />
              <span class="imm-title-rule-line" />
            </div>
            <p class="scene-stagger imm-home-desc w-full! text-center">
              {{ t('landing.home.desc') }}
            </p>
            <div class="scene-stagger imm-home-actions flex justify-center align-middle items-center">
              <button v-dir class="imm-btn-primary imm-magnetic dir-ltr" @click="goToBooking">
                {{ t('landing.home.cta.book') }}
                <span v-html="isRtl ? icons.arrowFa : icons.arrow" aria-hidden="true" />
              </button>
              <button class="imm-btn-secondary" @click="router.push('/auth/login')">
                {{ t('landing.home.cta.login') }}
              </button>
            </div>
            <div v-dir class="scene-stagger imm-home-stats flex justify-center align-middle items-center">
              <div class="imm-stat">
                <div class="imm-stat-value"><span>{{ pn(statDoctors) }}</span>+</div>
                <div class="imm-stat-label">{{ t('landing.home.stat.doctors') }}</div>
              </div>
              <div class="imm-stat">
                <div class="imm-stat-value"><span>{{ pn(statYears) }}</span> {{ t('index.years') }}</div>
                <div class="imm-stat-label">{{ t('landing.home.stat.experience') }}</div>
              </div>
              <div class="imm-stat">
                <div class="imm-stat-value"><span>{{ pn(statSatisfaction) }}</span>%</div>
                <div class="imm-stat-label">{{ t('landing.home.stat.satisfaction') }}</div>
              </div>
              <div class="imm-stat">
                <div class="imm-stat-value"><span>{{ pn(statPatients) }}K</span>+</div>
                <div class="imm-stat-label">{{ t('landing.home.stat.patients') }}</div>
              </div>
            </div>
          </div>
          <div class="imm-home-visual scene-stagger" aria-hidden="true">
            <div class="imm-lottie-container" :style="parallaxLottie">
              <LottiePlayer src="/lottie/health_insurance.json" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── OUR SERVICES ── -->
      <section id="services" class="imm-section imm-section--services" data-section="services">
        <div class="imm-services">
          <div class="scene-stagger imm-section-header">
            <div class="imm-section-badge">
              <span v-html="icons.medical" aria-hidden="true" />
              {{ t('landing.services.badge') }}
            </div>
            <h2 class="imm-section-title">
              {{ t('landing.services.title1') }} <span class="imm-section-title-accent">{{ t('landing.services.title2') }}</span>
            </h2>
          </div>
          <div class="imm-services-grid">
            <div
              v-for="(service, i) in services"
              :key="i"
              class="scene-stagger imm-service-card imm-tilt-card"
            >
              <div class="imm-service-icon" :class="`imm-service-icon--${service.colorClass}`">
                <span v-html="icons[service.icon]" />
              </div>
              <h3 class="imm-service-title">{{ t(service.titleKey) }}</h3>
              <p class="imm-service-desc">{{ t(service.descKey) }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ── DOCTORS ── -->
      <section id="doctors" class="imm-section imm-section--doctors" data-section="doctors">
        <div class="imm-doctors">
          <div class="scene-stagger imm-section-header">
            <div class="imm-section-badge">
              <span v-html="icons.users" aria-hidden="true" />
              {{ t('landing.doctors.badge') }}
            </div>
            <h2 class="imm-section-title">
              {{ t('landing.doctors.title1') }} <span class="imm-section-title-accent">{{ t('landing.doctors.title2') }}</span>
            </h2>
          </div>
          <div class="imm-doctors-grid">
            <div
              v-for="(doc, i) in doctors"
              :key="i"
              class="scene-stagger imm-doctor-card imm-tilt-card"
            >
              <div class="imm-doctor-img-wrap">
                <img
                  v-if="doc.img"
                  :src="doc.img"
                  :alt="lang === 'fa' ? doc.name : doc.nameEn"
                  class="imm-doctor-img"
                  loading="lazy"
                />
                <div v-else class="imm-doctor-img-placeholder" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>
              <div class="imm-doctor-info">
                <h3 class="imm-doctor-name">{{ lang === 'fa' ? doc.name : doc.nameEn }}</h3>
                <p class="imm-doctor-specialty">{{ lang === 'fa' ? doc.specialty : doc.specialtyEn }}</p>
                <div class="imm-doctor-stats">
                  <span class="imm-doctor-stat">
                    <span v-html="icons.clock" />
                    {{ lang === 'fa' ? doc.experience : doc.experienceEn }}
                  </span>
                  <span class="imm-doctor-stat">
                    <span v-html="icons.users" />
                    {{ lang === 'fa' ? doc.patients : doc.patientsEn }}
                  </span>
                  <span class="imm-doctor-stat" style="color: #fbbf24;">
                    <span v-html="icons.star" />
                    {{ doc.rating }}
                  </span>
                </div>
                <button class="imm-doctor-book-btn" @click="goToBooking">
                  {{ t('landing.doctors.book') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CONTACT US ── -->
      <section id="contact" class="imm-section imm-section--contact" data-section="contact">
        <div class="imm-contact">
          <div class="imm-contact-info">
            <div class="scene-stagger imm-section-badge" style="width: fit-content;">
              <span v-html="icons.phone" aria-hidden="true" />
              {{ t('landing.contact.badge') }}
            </div>
            <h2 class="scene-stagger imm-contact-title">
              {{ t('landing.contact.title') }}
            </h2>
            <p class="scene-stagger imm-contact-desc">
              {{ t('landing.contact.desc') }}
            </p>
            <div v-dir class="scene-stagger imm-contact-items dir-ltr">
              <div v-for="(item, i) in contactItems" :key="i" class="imm-contact-item">
                <div class="imm-contact-item-icon">
                  <span v-html="icons[item.icon]" />
                </div>
                <div>
                  <div class="imm-contact-item-label">{{ t(item.labelKey) }}</div>
                  <div class="imm-contact-item-value">{{ item.value }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="scene-stagger imm-contact-form-wrap">
            <Transition name="imm-form-fade" mode="out-in">
              <div v-if="formSubmitted" class="imm-form-success" key="success">
                <div class="imm-success-check">
                  <span v-html="icons.check" />
                </div>
                <div class="imm-success-title">
                  {{ t('landing.contact.successTitle') }}
                </div>
                <div class="imm-success-desc">
                  {{ t('landing.contact.successDesc') }}
                </div>
                <button class="imm-btn-secondary" style="margin-top: 0.5rem;" @click="resetForm">
                  {{ t('landing.contact.successBtn') }}
                </button>
              </div>
              <form v-else class="imm-form" key="form" @submit.prevent="onSubmitForm">
                <div class="imm-form-row">
                  <div class="imm-form-group">
                    <label class="imm-form-label" for="contact-name">{{ t('landing.contact.formName') }}</label>
                    <input id="contact-name" v-model="contactForm.name" class="imm-form-input" type="text" :placeholder="t('landing.contact.formNamePlaceholder')" required />
                  </div>
                  <div class="imm-form-group">
                    <label class="imm-form-label" for="contact-phone">{{ t('landing.contact.formPhone') }}</label>
                    <input id="contact-phone" v-model="contactForm.phone" class="imm-form-input" type="tel" :placeholder="t('landing.contact.formPhonePlaceholder')" required />
                  </div>
                </div>
                <div class="imm-form-group">
                  <label class="imm-form-label" for="contact-service">{{ t('landing.contact.formService') }}</label>
                  <select id="contact-service" v-model="contactForm.service" class="imm-form-select">
                    <option value="" disabled>{{ t('landing.contact.formServiceSelect') }}</option>
                    <option value="cardiology">{{ t('landing.services.cardiologyTitle') }}</option>
                    <option value="dermatology">{{ t('landing.services.dermatologyTitle') }}</option>
                    <option value="general">{{ t('landing.services.generalTitle') }}</option>
                    <option value="lab">{{ t('landing.services.labTitle') }}</option>
                    <option value="emergency">{{ t('landing.services.emergencyTitle') }}</option>
                    <option value="consult">{{ t('landing.services.consultTitle') }}</option>
                  </select>
                </div>
                <div class="imm-form-group">
                  <label class="imm-form-label" for="contact-msg">{{ t('landing.contact.formMessage') }}</label>
                  <textarea id="contact-msg" v-model="contactForm.message" class="imm-form-textarea" rows="3" :placeholder="t('landing.contact.formMessagePlaceholder')" />
                </div>
                <button type="submit" :disabled="submittingForm" class="imm-form-submit imm-magnetic flex justify-center align-middle items-center gap-1">
                  {{ submittingForm ? t('landing.contact.formSubmitting') || t('landing.contact.formSubmit') : t('landing.contact.formSubmit') }}
                  <span v-html="isRtl ? icons.arrowFa : icons.arrow" aria-hidden="true" style="display: inline-flex;" />
                </button>
              </form>
            </Transition>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>