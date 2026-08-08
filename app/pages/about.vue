<template>
  <main ref="stageRef" class="about-stage !relative !min-h-dvh !w-full !transition-colors !duration-1000">

    <!-- ==================== BACKDROP ==================== -->
    <div class="!pointer-events-none !fixed !inset-0 !z-0 !overflow-hidden" aria-hidden="true">
      <div class="anim-orb !absolute !-top-40 !-left-32 !h-[52vw] !w-[52vw] !rounded-full !blur-3xl" />
      <div class="anim-orb anim-orb--cool !absolute !bottom-[-14vw] !right-[-18vw] !h-[46vw] !w-[46vw] !rounded-full !blur-3xl" />
      <div class="!absolute !inset-0 shadow-[inset_0_0_260px_70px_var(--ink)]" />
      <!-- افزودن یک لایه نویز ملایم برای پریمیوم‌تر شدن بک‌گراند -->
      <div class="!absolute !inset-0 !opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>

    <!-- ==================== MASTHEAD ==================== -->
    <header class="!relative !z-20 !flex !items-center !justify-between !px-8 !py-8 sm:!px-16 sm:!py-10">
      <a href="/" class=" !text-lg !font-light !tracking-[0.32em] text-lightcyan !transition-opacity !duration-700 hover:!opacity-70">
        {{ t('aboutPage.masthead.brand') }}
      </a>
      <a href="/" class="about-back !text-[0.65rem] !tracking-[0.4em] text-periwinkle/60 !uppercase !transition-colors !duration-700 hover:text-lightcyan !flex !items-center !gap-3">
        <span class="about-back__arrow" aria-hidden="true">←</span>
        {{ t('aboutPage.masthead.back') }}
      </a>
    </header>

    <!-- ==================== HERO ==================== -->
    <section class="scene-3d !relative !z-10 !grid !grid-cols-1 !items-center !gap-12 lg:!gap-24 !px-8 !pt-16 !pb-32 sm:!px-16 lg:!grid-cols-[1fr_0.9fr] lg:!pt-24">
      <div class="!flex !flex-col !justify-center">
        <p class="about-eyebrow !mb-8 !flex !items-center !gap-4">
          <span class="!h-px !w-12 bg-iceblue/50" aria-hidden="true" />
          {{ t('aboutPage.hero.eyebrow') }}
        </p>
        <h1 class="about-hero-title  !font-light">
          <span class="!block !overflow-hidden">
            <span class="anim-line !block" style="animation-delay: 120ms">{{ t('aboutPage.hero.title.line1') }}</span>
          </span>
          <span class="!block !overflow-hidden">
            <span class="anim-line !block !italic text-iceblue/90" style="animation-delay: 260ms">{{ t('aboutPage.hero.title.line2') }}</span>
          </span>
        </h1>
        <p class="anim-soft !mt-10 !max-w-xl !text-sm lg:!text-base !leading-loose !tracking-[0.06em] text-periwinkle/80" style="animation-delay: 460ms">
          {{ t('aboutPage.hero.intro') }}
        </p>
        
        <!-- خط جداکننده ظریف برای زیبایی بیشتر -->
        <div class="anim-soft !w-full !h-px bg-gradient-to-r from-periwinkle/20 to-transparent !mt-12 !mb-10" style="animation-delay: 550ms" />

        <dl class="anim-soft !grid !max-w-lg !grid-cols-3 !gap-8" style="animation-delay: 620ms">
          <div v-for="stat in heroStats" :key="stat.key" class="!flex !flex-col !gap-2">
            <dt class=" !text-4xl lg:!text-5xl !font-light text-lightcyan !tabular-nums">{{ stat.value }}</dt>
            <dd class="!text-[0.6rem] !tracking-[0.28em] text-periwinkle/60 !uppercase">{{ stat.label }}</dd>
          </div>
        </dl>
      </div>

      <figure class="anim-float3d !m-0 !overflow-hidden !rounded-2xl !shadow-2xl shadow-ink/50 !relative group">
        <div class="!absolute !inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent !z-10" />
        <img class="!h-[70vh] lg:!h-[80vh] !w-full !object-cover !opacity-90 !transition-transform !duration-[2s] group-hover:!scale-105" src="/images/about/glass-sculpture.jpg" :alt="t('aboutPage.hero.figureAlt')" />
      </figure>
    </section>

    <!-- ==================== TEAM ==================== -->
    <section ref="teamRoot" class="scene-3d !relative !z-10 !px-8 !pb-32 sm:!px-16">
      <div class="reveal-in !flex !flex-col !items-start !gap-3">
        <div class="!flex !items-center !gap-4">
          <span class="font-sans !text-[0.65rem] !tracking-[0.3em] text-iceblue/70 !tabular-nums">{{ t('aboutPage.team.num') }}</span>
          <span class="!h-px !w-8 bg-periwinkle/30" />
          <span class="about-kicker !text-[0.6rem] !tracking-[0.4em] text-periwinkle/60 !uppercase">{{ t('aboutPage.team.kicker') }}</span>
        </div>
        <h2 class="about-section-title  !w-full !font-light !mt-2">{{ t('aboutPage.team.title') }}</h2>
      </div>

      <div class="!mt-16 !grid !grid-cols-1 !gap-8 sm:!grid-cols-2 xl:!grid-cols-4">
        <div v-for="member in team" :key="member.key" class="reveal-in !h-full">
          <article class="card-3d glass-panel group !h-full !overflow-hidden !rounded-xl !flex !flex-col">
            <div class="!relative !aspect-[4/5] !overflow-hidden">
              <img
                class="!h-full !w-full !object-cover !object-top !transition-transform !duration-[1200ms] ease-luxe group-hover:!scale-110"
                loading="lazy"
                :src="member.img"
                :alt="member.alt"
              />
              <div class="about-card__scrim !absolute !inset-0" aria-hidden="true" />
            </div>
            <div class="layer-3d !p-8 !flex !flex-col !flex-grow !justify-end !-mt-20 !relative !z-10">
              <h3 class=" !text-2xl !leading-none !font-light text-lightcyan">{{ member.name }}</h3>
              <p class="!mt-3 !text-[0.6rem] !tracking-[0.28em] text-iceblue/80 !uppercase">{{ member.role }}</p>
              <p class="!mt-5 !text-xs !leading-relaxed text-periwinkle/70 line-clamp-3">{{ member.bio }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================== SERVICES ==================== -->
    <section ref="servicesRoot" class="scene-3d !relative !z-10 !px-8 !pb-32 sm:!px-16">
      <div class="reveal-in !flex !flex-col !items-start !gap-3">
        <div class="!flex !items-center !gap-4">
          <span class="font-sans !text-[0.65rem] !tracking-[0.3em] text-iceblue/70 !tabular-nums">{{ t('aboutPage.services.num') }}</span>
          <span class="!h-px !w-8 bg-periwinkle/30" />
          <span class="about-kicker !text-[0.6rem] !tracking-[0.4em] text-periwinkle/60 !uppercase">{{ t('aboutPage.services.kicker') }}</span>
        </div>
        <h2 class="about-section-title  !w-full !font-light !mt-2">{{ t('aboutPage.services.title') }}</h2>
      </div>

      <div class="!mt-16 !grid !grid-cols-1 !gap-6 md:!grid-cols-2 xl:!grid-cols-3">
        <div v-for="service in services" :key="service.key" class="reveal-in !h-full">
          <article class="card-3d glass-panel group !h-full !rounded-xl !p-10 !flex !flex-col !justify-between">
            <div>
              <span class="font-sans !text-[0.7rem] !tracking-[0.3em] text-iceblue/50 !tabular-nums !transition-colors !duration-500 group-hover:text-iceblue">{{ service.num }}</span>
              <h3 class="layer-3d  !mt-6 !text-3xl !leading-none !font-light text-lightcyan">{{ service.title }}</h3>
            </div>
            <p class="!mt-8 !text-[0.65rem] !tracking-[0.24em] !leading-relaxed text-periwinkle/60 !uppercase">{{ service.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================== VISIT (Bento Box Style) ==================== -->
    <section ref="visitRoot" class="scene-3d !relative !z-10 !px-8 !pb-32 sm:!px-16">
      <div class="reveal-in !flex !flex-col !items-start !gap-3">
        <div class="!flex !items-center !gap-4">
          <span class="font-sans !text-[0.65rem] !tracking-[0.3em] text-iceblue/70 !tabular-nums">{{ t('aboutPage.visit.num') }}</span>
          <span class="!h-px !w-8 bg-periwinkle/30" />
          <span class="about-kicker !text-[0.6rem] !tracking-[0.4em] text-periwinkle/60 !uppercase">{{ t('aboutPage.visit.kicker') }}</span>
        </div>
        <h2 class="about-section-title  !w-full !font-light !mt-2">{{ t('aboutPage.visit.title') }}</h2>
      </div>

      <div class="!mt-16 !grid !grid-cols-1 !gap-6 lg:!grid-cols-12 lg:!grid-rows-2">
        <!-- Contact (Large Card) -->
        <div class="reveal-in !h-full lg:!col-span-7 lg:!row-span-2">
          <div class="card-3d glass-panel !h-full !rounded-xl !p-10 lg:!p-14">
            <h3 class="!text-[0.65rem] !tracking-[0.34em] text-iceblue/80 !uppercase !mb-10 !flex !items-center !gap-4">
              <span class="!w-2 !h-2 !rounded-full bg-iceblue/80 !animate-pulse" />
              {{ t('aboutPage.visit.contact.heading') }}
            </h3>
            <ul class="layer-3d !space-y-10">
              <li>
                <span class="!block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/50 !uppercase !mb-3">{{ t('aboutPage.visit.contact.phoneLabel') }}</span>
                <a href="tel:+982188004120" class=" !text-3xl lg:!text-4xl !font-light text-lightcyan !transition-colors !duration-700 hover:text-iceblue">{{ t('aboutPage.visit.contact.phone') }}</a>
              </li>
              <li>
                <span class="!block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/50 !uppercase !mb-3">{{ t('aboutPage.visit.contact.emailLabel') }}</span>
                <a href="mailto:care@hastihosseini.clinic" class=" !text-2xl lg:!text-3xl !font-light text-lightcyan !transition-colors !duration-700 hover:text-iceblue">{{ t('aboutPage.visit.contact.email') }}</a>
              </li>
              <li>
                <span class="!block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/50 !uppercase !mb-3">{{ t('aboutPage.visit.contact.addressLabel') }}</span>
                <address class=" !text-xl lg:!text-2xl !leading-relaxed !font-light text-lightcyan !not-italic">
                  {{ t('aboutPage.visit.contact.address1') }}<br />{{ t('aboutPage.visit.contact.address2') }}
                </address>
              </li>
            </ul>
          </div>
        </div>

        <!-- Hours (Top Right Card) -->
        <div class="reveal-in !h-full lg:!col-span-5 lg:!row-span-1">
          <div class="card-3d glass-panel !h-full !rounded-xl !p-8 lg:!p-10">
            <h3 class="!text-[0.6rem] !tracking-[0.34em] text-iceblue/80 !uppercase !mb-8">{{ t('aboutPage.visit.hours.heading') }}</h3>
            <ul class="layer-3d !space-y-6">
              <li v-for="row in hours" :key="row.key" class="!flex !justify-between !items-end !border-b !border-periwinkle/10 !pb-3">
                <span class="!block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/60 !uppercase">{{ row.label }}</span>
                <span class=" !text-xl !font-light text-lightcyan !tabular-nums">{{ row.value }}</span>
              </li>
            </ul>
            <p class="!mt-6 !text-[0.7rem] !leading-relaxed text-periwinkle/50">{{ t('aboutPage.visit.hours.note') }}</p>
          </div>
        </div>

        <!-- Social (Bottom Right Card) -->
        <div class="reveal-in !h-full lg:!col-span-5 lg:!row-span-1">
          <div class="card-3d glass-panel !h-full !rounded-xl !p-8 lg:!p-10">
            <h3 class="!text-[0.6rem] !tracking-[0.34em] text-iceblue/80 !uppercase !mb-6">{{ t('aboutPage.visit.social.heading') }}</h3>
            <ul class="!grid !grid-cols-2 !gap-4">
              <li v-for="item in social" :key="item.key">
                <a
                  :href="item.href"
                  target="_blank"
                  rel="noreferrer noopener"
                  class="glass-panel !flex !flex-col !items-start !gap-2 !p-5 !rounded-lg !transition-all !duration-500 hover:!bg-white/5 hover:!border-iceblue/30 group"
                >
                  <span class=" !text-lg !font-light text-lightcyan !transition-colors !duration-500 group-hover:text-iceblue">{{ item.name }}</span>
                  <span class="!text-[0.55rem] !tracking-[0.24em] text-periwinkle/50 !uppercase">{{ item.handle }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== FOOTER ==================== -->
    <footer class="!relative !z-10 !flex !flex-wrap !items-center !justify-between !gap-6 !px-8 !py-12 !border-t !border-white/5 !text-[0.6rem] !tracking-[0.35em] text-periwinkle/40 !uppercase sm:!px-16">
      <span>{{ t('aboutPage.footer.note') }}</span>
      <a href="/" class="!transition-colors !duration-700 hover:text-lightcyan">{{ t('aboutPage.footer.return') }}</a>
      <span>© {{ year }}</span>
    </footer>

  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useScrollReveal } from '../composables/Usescrollreveal'
import { useTilt } from '../composables/Usetilt'

definePageMeta({ layout: 'landing' })

const { t, isRtl, pn } = useLang()

const stageRef = ref<HTMLElement | null>(null)
const teamRoot = ref<HTMLElement | null>(null)
const servicesRoot = ref<HTMLElement | null>(null)
const visitRoot = ref<HTMLElement | null>(null)

useScrollReveal(teamRoot, { items: '.reveal-in', stagger: 0.1 })
useScrollReveal(servicesRoot, { items: '.reveal-in', stagger: 0.08 })
useScrollReveal(visitRoot, { items: '.reveal-in', stagger: 0.12 })

onMounted(() => {
  if (!stageRef.value) return
  stageRef.value.querySelectorAll('.card-3d').forEach((el) => {
    useTilt(el as HTMLElement, { max: 5, scale: 1.02 })
  })
})

const heroStats = computed(() => [
  { key: 'years', value: t('aboutPage.hero.stats.yearsValue'), label: t('aboutPage.hero.stats.yearsLabel') },
  { key: 'procedures', value: t('aboutPage.hero.stats.proceduresValue'), label: t('aboutPage.hero.stats.proceduresLabel') },
  { key: 'patients', value: t('aboutPage.hero.stats.patientsValue'), label: t('aboutPage.hero.stats.patientsLabel') },
])

const team = computed(() => [
  { key: 'hasti', img: '/images/about/dr-hosseini-cutout.png', alt: t('aboutPage.team.members.1.alt'), name: t('aboutPage.team.members.1.name'), role: t('aboutPage.team.members.1.role'), bio: t('aboutPage.team.members.1.bio') },
  { key: 'leyla', img: '/images/about/team-1.jpg', alt: t('aboutPage.team.members.2.alt'), name: t('aboutPage.team.members.2.name'), role: t('aboutPage.team.members.2.role'), bio: t('aboutPage.team.members.2.bio') },
  { key: 'nasrin', img: '/images/about/team-2.jpg', alt: t('aboutPage.team.members.3.alt'), name: t('aboutPage.team.members.3.name'), role: t('aboutPage.team.members.3.role'), bio: t('aboutPage.team.members.3.bio') },
  { key: 'sara', img: '/images/about/team-3.jpg', alt: t('aboutPage.team.members.4.alt'), name: t('aboutPage.team.members.4.name'), role: t('aboutPage.team.members.4.role'), bio: t('aboutPage.team.members.4.bio') },
])

const services = computed(() => [
  { key: 'facial', num: t('aboutPage.services.items.1.num'), title: t('aboutPage.services.items.1.title'), desc: t('aboutPage.services.items.1.desc') },
  { key: 'regenerative', num: t('aboutPage.services.items.2.num'), title: t('aboutPage.services.items.2.title'), desc: t('aboutPage.services.items.2.desc') },
  { key: 'laser', num: t('aboutPage.services.items.3.num'), title: t('aboutPage.services.items.3.title'), desc: t('aboutPage.services.items.3.desc') },
  { key: 'intimate', num: t('aboutPage.services.items.4.num'), title: t('aboutPage.services.items.4.title'), desc: t('aboutPage.services.items.4.desc') },
  { key: 'skincare', num: t('aboutPage.services.items.5.num'), title: t('aboutPage.services.items.5.title'), desc: t('aboutPage.services.items.5.desc') },
  { key: 'longevity', num: t('aboutPage.services.items.6.num'), title: t('aboutPage.services.items.6.title'), desc: t('aboutPage.services.items.6.desc') },
])

const hours = computed(() => [
  { key: 'satWed', label: t('aboutPage.visit.hours.satWedLabel'), value: t('aboutPage.visit.hours.satWedValue') },
  { key: 'thu', label: t('aboutPage.visit.hours.thuLabel'), value: t('aboutPage.visit.hours.thuValue') },
  { key: 'fri', label: t('aboutPage.visit.hours.friLabel'), value: t('aboutPage.visit.hours.friValue') },
])

const social = computed(() => [
  { key: 'instagram', name: t('aboutPage.visit.social.instagram.name'), handle: t('aboutPage.visit.social.instagram.handle'), href: 'https://instagram.com' },
  { key: 'linkedin', name: t('aboutPage.visit.social.linkedin.name'), handle: t('aboutPage.visit.social.linkedin.handle'), href: 'https://linkedin.com' },
  { key: 'telegram', name: t('aboutPage.visit.social.telegram.name'), handle: t('aboutPage.visit.social.telegram.handle'), href: 'https://telegram.org' },
  { key: 'whatsapp', name: t('aboutPage.visit.social.whatsapp.name'), handle: t('aboutPage.visit.social.whatsapp.handle'), href: 'https://wa.me/982188004120' },
])

const year = computed(() => (isRtl.value ? pn(new Date().getFullYear()) : new Date().getFullYear()))

const metaTitle = computed(() => t('aboutPage.seo.title'))
const metaDescription = computed(() => t('aboutPage.seo.desc'))

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle: metaTitle,
  ogDescription: metaDescription,
  ogType: 'website',
  ogImage: '/images/about/glass-sculpture.jpg',
})
</script>

<style scoped>
/* ==================== STAGE ==================== */

.about-stage {
  background: transparent;
  color: var(--lightcyan);
  color-scheme: dark;
  font-family: var(--font-sans);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a {
  color: inherit;
  text-decoration: none;
}

/* ==================== BACKDROP ORBS ==================== */

.anim-orb {
  background: radial-gradient(circle,
      color-mix(in oklab, var(--iceblue) 35%, transparent),
      transparent 70%);
  will-change: transform;
  animation: orb-float 26s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.anim-orb--cool {
  background: radial-gradient(circle,
      color-mix(in oklab, var(--periwinkle) 30%, transparent),
      transparent 70%);
  animation-delay: -13s;
}

@keyframes orb-float {
  0% {
    transform: translate(0) scale(1);
  }
  50% {
    transform: translate(3%, -4%) scale(1.1);
  }
  100% {
    transform: translate(0) scale(1);
  }
}

/* ==================== MASTHEAD ==================== */

.about-back__arrow {
  display: inline-block;
}

/* ==================== HERO ==================== */

.scene-3d {
  perspective: 1600px;
}

.about-eyebrow {
  font-size: 0.65rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--iceblue) 80%, transparent);
}

.about-hero-title {
  font-size: clamp(3rem, 6.5vw, 5.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--lightcyan);
}

.about-section-title {
  font-size: clamp(2.2rem, 4vw, 3.5rem);
  line-height: 1.1;
  color: var(--lightcyan);
}

.about-kicker {
  color: color-mix(in oklab, var(--periwinkle) 60%, transparent);
}

.anim-float3d {
  will-change: transform;
  animation: float-3d 16s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes float-3d {
  0% { transform: none; }
  50% { transform: translateY(-20px) rotateX(3deg) rotateY(-4deg); }
  100% { transform: none; }
}

/* ==================== ENTRANCE ANIMATIONS ==================== */

.anim-soft {
  will-change: transform, opacity;
  animation: 1.6s cubic-bezier(0.16, 1, 0.3, 1) both soft-in;
}

.anim-line {
  will-change: transform, opacity;
  animation: 1.6s cubic-bezier(0.16, 1, 0.3, 1) both line-rise;
}

@keyframes soft-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes line-rise {
  0% {
    opacity: 0;
    filter: blur(8px);
    transform: translateY(120%) rotate(3deg);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: translate(0) rotate(0);
  }
}

/* ==================== GLASS CARDS ==================== */

.glass-panel {
  border: 1px solid color-mix(in oklab, var(--periwinkle) 25%, transparent);
  background: linear-gradient(145deg, color-mix(in oklab, var(--ink) 40%, transparent), transparent);
  -webkit-backdrop-filter: blur(30px) saturate(1.4);
  backdrop-filter: blur(30px) saturate(1.4);
  transform-style: preserve-3d;
  transition: transform 0.9s var(--ease-luxe, cubic-bezier(0.22, 1, 0.36, 1)), 
              box-shadow 0.9s var(--ease-luxe, cubic-bezier(0.22, 1, 0.36, 1)), 
              border-color 0.9s ease;
}

.card-3d:hover {
  border-color: color-mix(in oklab, var(--iceblue) 40%, transparent);
  box-shadow:
    0 30px 60px -20px color-mix(in oklab, var(--ink) 95%, transparent),
    inset 0 1px 0 color-mix(in oklab, var(--lightcyan) 20%, transparent);
}

.layer-3d {
  transform: translateZ(50px);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.card-3d:hover .layer-3d {
  transform: translateZ(75px);
}

.about-card__scrim {
  background: linear-gradient(to top,
      var(--ink) 0%,
      color-mix(in oklab, var(--ink) 60%, transparent) 40%,
      transparent 100%);
}

/* ==================== REDUCED MOTION ==================== */

@media (prefers-reduced-motion: reduce) {
  .anim-soft,
  .anim-line,
  .anim-float3d,
  .anim-orb {
    animation: none !important;
    will-change: auto;
  }
}
</style>

<style>
/* ==================== RTL / PERSIAN TYPOGRAPHY ==================== */

.landing-shell[dir="rtl"] .about-stage .about-eyebrow,
.landing-shell[dir="rtl"] .about-stage .about-kicker,
.landing-shell[dir="rtl"] .about-stage [class*="tracking-"] {
  letter-spacing: 0 !important;
}

.landing-shell[dir="rtl"] .about-stage .about-hero-title {
  line-height: 1.35 !important;
  letter-spacing: 0 !important;
}

.landing-shell[dir="rtl"] .about-stage .about-section-title {
  line-height: 1.45 !important;
  letter-spacing: 0 !important;
}

.landing-shell[dir="rtl"] .about-stage .about-back__arrow {
  transform: rotate(180deg) !important;
}

.landing-shell[dir="rtl"] .about-stage .about-eyebrow {
  flex-direction: row-reverse !important;
}
</style>