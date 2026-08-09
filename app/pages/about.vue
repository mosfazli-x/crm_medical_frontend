<template>
  <main ref="stageRef" class="about-stage !relative !min-h-dvh !w-full !transition-colors !duration-1000">

    <!-- ==================== BACKDROP ==================== -->
    <div class="!pointer-events-none !fixed !inset-0 !z-0 !overflow-hidden" aria-hidden="true">
      <div class="anim-orb !absolute !-top-40 !-left-32 !h-[52vw] !w-[52vw] !rounded-full !blur-3xl" />
      <div
        class="anim-orb anim-orb--cool !absolute !bottom-[-14vw] !right-[-18vw] !h-[46vw] !w-[46vw] !rounded-full !blur-3xl" />
      <div class="!absolute !inset-0 shadow-[inset_0_0_260px_70px_var(--ink)]" />
      <div class="!absolute !inset-0 !opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>

    <!-- ==================== MASTHEAD ==================== -->
    <header class="!relative !z-20 !flex !items-center !justify-between !px-8 !py-8 sm:!px-16 sm:!py-10">
      <a href="/"
        class="!text-lg !font-light !tracking-[0.32em] text-lightcyan !transition-opacity !duration-700 hover:!opacity-70">
        {{ t('aboutPage.masthead.brand') }}
      </a>
      <a href="/"
        class="about-back !flex !items-center !gap-3 !text-[0.65rem] !tracking-[0.4em] text-periwinkle/60 !uppercase !transition-colors !duration-700 hover:text-lightcyan">
        <span class="about-back__arrow" aria-hidden="true">←</span>
        {{ t('aboutPage.masthead.back') }}
      </a>
    </header>

    <!-- ==================== HERO ==================== -->
    <section
      class="scene-3d !relative !z-10 !grid !grid-cols-1 !items-center !gap-12 !px-8 !pt-16 !pb-32 sm:!px-16 lg:!grid-cols-[1fr_0.9fr] lg:!gap-24 lg:!pt-24">
      <div class="!flex !flex-col !justify-center">
        <p class="about-eyebrow !mb-8 !flex !items-center !gap-4">
          <span class="!h-px !w-12 bg-[#FFD543]/50" aria-hidden="true" />
          {{ t('aboutPage.hero.eyebrow') }}
        </p>
        <h1 class="about-hero-title !font-bold font-bon">
          <span class="!block !overflow-hidden">
            <span class="anim-line !block" style="animation-delay: 120ms">{{ t('aboutPage.hero.title.line1') }}</span>
          </span>
          <span class="!block !overflow-hidden">
            <span class="anim-line !block text-[#FFD543]" style="animation-delay: 260ms">{{
              t('aboutPage.hero.title.line2') }}</span>
          </span>
        </h1>
        <p class="anim-soft font-iran-sans !mt-10 !max-w-xl !text-sm !leading-loose !tracking-[0.06em] text-periwinkle/80 lg:!text-base"
          style="animation-delay: 460ms">
          {{ t('aboutPage.hero.intro') }}
        </p>

        <div class="anim-soft !mt-14 !border-t !border-periwinkle/15 !pt-8" style="animation-delay: 560ms">
          <dl class="!grid !max-w-lg !grid-cols-3 !gap-8">
            <div v-for="stat in heroStats" :key="stat.key" class="!flex !flex-col !gap-2">
              <dt class="!text-4xl !font-light text-lightcyan lg:!text-5xl">{{ stat.value }}</dt>
              <dd class="!text-[0.6rem] !tracking-[0.28em] text-periwinkle/60 !uppercase">{{ stat.label }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <figure class="anim-float3d group !relative !m-0 !overflow-hidden !rounded-2xl !shadow-2xl shadow-ink/50">
        <div class="!absolute !inset-0 !z-10 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent"
          aria-hidden="true" />
        <img
          class="!h-[58vh] !w-full !object-cover !opacity-90 !transition-transform !duration-[2s] group-hover:!scale-105 sm:!h-[70vh] lg:!h-[78vh]"
          src="../assets/images/dr_hosseini.webp" :alt="t('aboutPage.hero.figureAlt')" />
        <div
          class="hero-credential glass-panel anim-soft !absolute !bottom-6 !left-6 !z-20 !max-w-[15rem] !rounded-xl !px-6 !py-5 sm:!bottom-10 sm:!left-10"
          style="animation-delay: 900ms">
          <p class="!mb-2 !text-[0.55rem] !tracking-[0.26em] text-periwinkle/55 !uppercase">
            {{ t('aboutPage.hero.credential.label', 'اعتبار و مجوز') }}
          </p>
          <p class="!text-sm !font-light !leading-relaxed text-lightcyan">
            {{ t('aboutPage.hero.credential.text', 'دارای مجوز رسمی وزارت بهداشت، درمان و آموزش پزشکی') }}
          </p>
        </div>
      </figure>
    </section>

    <!-- ==================== TEAM ==================== -->
    <section ref="teamRoot" class="scene-3d !relative !z-10 !px-8 !pb-32 sm:!px-16">
      <div class="vital-divider !relative !mx-auto !mb-14 !h-6 !w-full !max-w-[220px]" aria-hidden="true">
        <svg viewBox="0 0 220 24" class="!h-6 !w-full" preserveAspectRatio="none">
          <path class="vital-divider__path" d="M0 12H70L82 4L94 20L106 12H220" fill="none" stroke="currentColor"
            stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
          <circle class="vital-divider__dot" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <div class="reveal-in !flex !flex-col !items-start !gap-3">
        <div class="!flex !items-center !gap-4">
          <span class="font-sans !text-[0.65rem] !tracking-[0.3em] text-[#FFD543]/70 !tabular-nums">{{
            t('aboutPage.team.num') }}</span>
          <span class="!h-px !w-8 bg-periwinkle/30" />
          <span class="about-kicker !text-[0.6rem] !tracking-[0.4em] text-periwinkle/60 !uppercase">{{
            t('aboutPage.team.kicker') }}</span>
        </div>
        <h2 class="about-section-title !mt-2 !w-full !font-bold">{{ t('aboutPage.team.title') }}</h2>
      </div>

      <div class="!mt-16 !grid !grid-cols-1 !gap-8 sm:!grid-cols-2 xl:!grid-cols-4">
        <div v-for="member in team" :key="member.key" class="reveal-in !h-full">
          <article class="card-3d glass-panel group !flex !h-full !flex-col !overflow-hidden !rounded-xl">
            <div class="!relative !aspect-[4/5] !overflow-hidden">
              <img
                class="!h-full !w-full !object-cover !object-top !transition-transform !duration-[1200ms] ease-luxe group-hover:!scale-110"
                loading="lazy" :src="member.img" :alt="member.alt" />
              <div class="about-card__scrim !absolute !inset-0" aria-hidden="true" />
            </div>
            <div class="layer-3d !relative !-mt-20 !z-10 !flex !flex-grow !flex-col !justify-end !p-8">
              <span
                class="!mb-3 !inline-block !w-fit !rounded-full !border !border-[#FFD543]/30 !px-3 !py-1 !text-[0.55rem] !tracking-[0.24em] text-[#FFD543]/80 !uppercase">
                {{ member.role }}
              </span>
              <h3 class="!text-2xl !font-light !leading-none text-lightcyan">{{ member.name }}</h3>
              <p class="!mt-4 !text-sm !leading-relaxed text-periwinkle/70 line-clamp-2">{{ member.bio }}</p>
              <span
                class="!mt-5 !block !h-px !w-8 !bg-[#FFD543]/40 !transition-all !duration-500 group-hover:!w-16 group-hover:!bg-[#FFD543]/80"
                aria-hidden="true" />
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================== SERVICES ==================== -->
    <section ref="servicesRoot" class="scene-3d !relative !z-10 !px-8 !pb-32 sm:!px-16">
      <div class="vital-divider !relative !mx-auto !mb-14 !h-6 !w-full !max-w-[220px]" aria-hidden="true">
        <svg viewBox="0 0 220 24" class="!h-6 !w-full" preserveAspectRatio="none">
          <path class="vital-divider__path" d="M0 12H70L82 4L94 20L106 12H220" fill="none" stroke="currentColor"
            stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
          <circle class="vital-divider__dot" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <div class="reveal-in !flex !flex-col !items-start !gap-3">
        <div class="!flex !items-center !gap-4">
          <span class="font-sans !text-[0.65rem] !tracking-[0.3em] text-[#FFD543]/70 !tabular-nums">{{
            t('aboutPage.services.num') }}</span>
          <span class="!h-px !w-8 bg-periwinkle/30" />
          <span class="about-kicker !text-[0.6rem] !tracking-[0.4em] text-periwinkle/60 !uppercase">{{
            t('aboutPage.services.kicker') }}</span>
        </div>
        <h2 class="about-section-title !mt-2 !w-full !font-bold">{{ t('aboutPage.services.title') }}</h2>
      </div>

      <div class="!mt-16 !grid !grid-cols-1 !gap-6 md:!grid-cols-2 xl:!grid-cols-3">
        <div v-for="service in services" :key="service.key" class="reveal-in !h-full">
          <article class="card-3d glass-panel group !flex !h-full !flex-col !justify-between !rounded-xl !p-10">
            <div>
              <div
                class="!mb-7 !flex !h-12 !w-12 !items-center !justify-center !rounded-full !border !border-[#FFD543]/25 !transition-colors !duration-500 group-hover:!border-[#FFD543]/60">
                <svg viewBox="0 0 24 24"
                  class="!h-5 !w-5 text-[#FFD543]/80 !transition-colors !duration-500 group-hover:text-[#FFD543]"
                  fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path v-for="(d, i) in serviceIcon(service.key)" :key="i" :d="d" />
                </svg>
              </div>
              <h3 class="layer-3d !text-3xl !font-light !leading-none text-lightcyan">{{ service.title }}</h3>
            </div>
            <p class="!mt-8 !text-[0.75rem] !leading-relaxed !tracking-[0.24em] text-periwinkle/60 !uppercase">{{
              service.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ==================== VISIT (Bento Box Style) ==================== -->
    <section ref="visitRoot" class="scene-3d !relative !z-10 !px-8 !pb-32 sm:!px-16">
      <div class="vital-divider !relative !mx-auto !mb-14 !h-6 !w-full !max-w-[220px]" aria-hidden="true">
        <svg viewBox="0 0 220 24" class="!h-6 !w-full" preserveAspectRatio="none">
          <path class="vital-divider__path" d="M0 12H70L82 4L94 20L106 12H220" fill="none" stroke="currentColor"
            stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" />
          <circle class="vital-divider__dot" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <div class="reveal-in !flex !flex-col !items-start !gap-3">
        <div class="!flex !items-center !gap-4">
          <span class="font-sans !text-[0.65rem] !tracking-[0.3em] text-[#FFD543]/70 !tabular-nums">{{
            t('aboutPage.visit.num') }}</span>
          <span class="!h-px !w-8 bg-periwinkle/30" />
          <span class="about-kicker !text-[0.6rem] !tracking-[0.4em] text-periwinkle/60 !uppercase">{{
            t('aboutPage.visit.kicker') }}</span>
        </div>
        <h2 class="about-section-title !mt-2 !w-full !font-bold">{{ t('aboutPage.visit.title') }}</h2>
      </div>

      <div class="!mt-16 !grid !grid-cols-1 !gap-6 lg:!grid-cols-12 lg:!grid-rows-2">
        <!-- Contact (Large Card) -->
        <div class="reveal-in !h-full lg:!col-span-7 lg:!row-span-2">
          <div class="card-3d glass-panel !h-full !rounded-xl !p-10 lg:!p-14">
            <h3 class="!mb-10 !flex !items-center !gap-4 !text-[0.65rem] !tracking-[0.34em] text-[#FFD543]/80 !uppercase">
              <span class="!h-2 !w-2 !animate-pulse !rounded-full bg-[#FFD543]/80" />
              {{ t('aboutPage.visit.contact.heading') }}
            </h3>
            <ul class="layer-3d !space-y-10">
              <li class="!flex !items-start !gap-4">
                <span
                  class="!mt-1 !flex !h-9 !w-9 !flex-shrink-0 !items-center !justify-center !rounded-full !border !border-[#FFD543]/25 text-[#FFD543]/70"
                  aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="!h-4 !w-4" fill="none" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="17" r="1.3" />
                    <path d="M8 13.5a5.5 5.5 0 0 1 8 0" />
                    <path d="M5 10a10 10 0 0 1 14 0" />
                  </svg>
                </span>
                <div>
                  <span class="!mb-3 !block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/50 !uppercase">{{
                    t('aboutPage.visit.contact.phoneLabel') }}</span>
                  <a href="tel:+982188004120" v-dir
                    class="!text-3xl !font-light text-lightcyan !transition-colors !duration-700 hover:text-[#FFD543] lg:!text-4xl">{{
                      t('aboutPage.visit.contact.phone') }}</a>
                </div>
              </li>
              <li class="!flex !items-start !gap-4">
                <span
                  class="!mt-1 !flex !h-9 !w-9 !flex-shrink-0 !items-center !justify-center !rounded-full !border !border-[#FFD543]/25 text-[#FFD543]/70"
                  aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="!h-4 !w-4" fill="none" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="M4 7.5 12 13 20 7.5" />
                  </svg>
                </span>
                <div>
                  <span class="!mb-3 !block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/50 !uppercase">{{
                    t('aboutPage.visit.contact.emailLabel') }}</span>
                  <a href="mailto:care@hastihosseini.clinic"
                    class="!text-2xl !font-light text-lightcyan !transition-colors !duration-700 hover:text-[#FFD543] lg:!text-3xl">{{
                      t('aboutPage.visit.contact.email') }}</a>
                </div>
              </li>
              <li class="!flex !items-start !gap-4">
                <span
                  class="!mt-1 !flex !h-9 !w-9 !flex-shrink-0 !items-center !justify-center !rounded-full !border !border-[#FFD543]/25 text-[#FFD543]/70"
                  aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="!h-4 !w-4" fill="none" stroke="currentColor" stroke-width="1.5"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path
                      d="M12 21s-6.5-5.8-6.5-10.5A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.5C18.5 15.2 12 21 12 21Z" />
                    <circle cx="12" cy="10.5" r="2.1" />
                  </svg>
                </span>
                <div>
                  <span class="!mb-3 !block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/50 !uppercase">{{
                    t('aboutPage.visit.contact.addressLabel') }}</span>
                  <address class="!text-xl !font-light !leading-relaxed text-lightcyan !not-italic lg:!text-2xl">
                    {{ t('aboutPage.visit.contact.address1') }}<br />{{ t('aboutPage.visit.contact.address2') }}
                  </address>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Hours (Top Right Card) -->
        <div class="reveal-in !h-full lg:!col-span-5 lg:!row-span-1">
          <div class="card-3d glass-panel !h-full !rounded-xl !p-8 lg:!p-10">
            <h3 class="!mb-8 !text-[0.6rem] !tracking-[0.34em] text-[#FFD543]/80 !uppercase">{{
              t('aboutPage.visit.hours.heading') }}</h3>
            <ul class="layer-3d !space-y-6">
              <li v-for="row in hours" :key="row.key"
                class="!flex !items-end !justify-between !border-b !border-periwinkle/10 !pb-3">
                <span class="!block !text-[0.6rem] !tracking-[0.28em] text-periwinkle/60 !uppercase">{{ row.label
                }}</span>
                <span class="!text-xl !font-light text-lightcyan !tabular-nums">{{ row.value }}</span>
              </li>
            </ul>
            <p class="!mt-6 !text-[0.7rem] !leading-relaxed text-periwinkle/50">{{ t('aboutPage.visit.hours.note') }}
            </p>
          </div>
        </div>

        <!-- Social (Bottom Right Card) -->
        <div class="reveal-in !h-full lg:!col-span-5 lg:!row-span-1">
          <div class="card-3d glass-panel !h-full !rounded-xl !p-8 lg:!p-10">
            <h3 class="!mb-6 !text-[0.6rem] !tracking-[0.34em] text-[#FFD543]/80 !uppercase">{{
              t('aboutPage.visit.social.heading') }}</h3>
            <ul class="!grid !grid-cols-2 !gap-4">
              <li v-for="item in social" :key="item.key">
                <a :href="item.href" target="_blank" rel="noreferrer noopener"
                  class="glass-panel group !flex !flex-col !items-start !gap-2 !rounded-lg !p-5 !transition-all !duration-500 hover:!border-[#FFD543]/30 hover:!bg-white/5">
                  <span
                    class="!text-lg !font-light text-lightcyan !transition-colors !duration-500 group-hover:text-[#FFD543]">{{
                      item.name }}</span>
                  <span class="!text-[0.55rem] !tracking-[0.24em] text-periwinkle/50 !uppercase">{{ item.handle
                  }}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== FOOTER ==================== -->
    <footer
      class="about-footer !relative !z-10 !flex !flex-wrap !items-center !justify-between !gap-6 !px-8 !py-12 !text-[0.6rem] !tracking-[0.35em] text-periwinkle/40 !uppercase sm:!px-16">
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
    useTilt(el as HTMLElement, { max: 4, scale: 1.015 })
  })
})

const heroStats = computed(() => [
  { key: 'years', value: t('aboutPage.hero.stats.yearsValue'), label: t('aboutPage.hero.stats.yearsLabel') },
  { key: 'procedures', value: t('aboutPage.hero.stats.proceduresValue'), label: t('aboutPage.hero.stats.proceduresLabel') },
  { key: 'patients', value: t('aboutPage.hero.stats.patientsValue'), label: t('aboutPage.hero.stats.patientsLabel') },
])

const team = computed(() => [
  { key: 'hasti', img: '/images/about/dr-hosseini-cutout.png', alt: t('aboutPage.team.members.1.alt'), name: t('aboutPage.team.members.1.name'), role: t('aboutPage.team.members.1.role'), bio: t('aboutPage.team.members.1.bio') },
  { key: 'leyla', img: '/images/about/default_profile.png', alt: t('aboutPage.team.members.2.alt'), name: t('aboutPage.team.members.2.name'), role: t('aboutPage.team.members.2.role'), bio: t('aboutPage.team.members.2.bio') },
  { key: 'nasrin', img: '/images/about/default_profile.png', alt: t('aboutPage.team.members.3.alt'), name: t('aboutPage.team.members.3.name'), role: t('aboutPage.team.members.3.role'), bio: t('aboutPage.team.members.3.bio') },
  { key: 'sara', img: '/images/about/default_profile.png', alt: t('aboutPage.team.members.4.alt'), name: t('aboutPage.team.members.4.name'), role: t('aboutPage.team.members.4.role'), bio: t('aboutPage.team.members.4.bio') },
])

const services = computed(() => [
  { key: 'facial', title: t('aboutPage.services.items.1.title'), desc: t('aboutPage.services.items.1.desc') },
  { key: 'regenerative', title: t('aboutPage.services.items.2.title'), desc: t('aboutPage.services.items.2.desc') },
  { key: 'laser', title: t('aboutPage.services.items.3.title'), desc: t('aboutPage.services.items.3.desc') },
  { key: 'intimate', title: t('aboutPage.services.items.4.title'), desc: t('aboutPage.services.items.4.desc') },
  { key: 'skincare', title: t('aboutPage.services.items.5.title'), desc: t('aboutPage.services.items.5.desc') },
  { key: 'longevity', title: t('aboutPage.services.items.6.title'), desc: t('aboutPage.services.items.6.desc') },
])

/** Simple line-icon paths per service, drawn with primitive shapes (no external icon library). */
function serviceIcon(key: string): string[] {
  const icons: Record<string, string[]> = {
    facial: ['M12 3v6M12 15v6M3 12h6M15 12h6'],
    regenerative: [
      'M4 12a8 8 0 0 1 8-8c2.2 0 4.2.9 5.7 2.3',
      'M17 2v4.5H12.5',
      'M20 12a8 8 0 0 1-8 8c-2.2 0-4.2-.9-5.7-2.3',
      'M7 22v-4.5h4.5',
    ],
    laser: ['M4 20 16 8', 'M11 8h5v5'],
    intimate: ['M12 4c4 3 6 6.5 6 10a6 6 0 0 1-12 0c0-3.5 2-7 6-10Z', 'M12 8v9'],
    skincare: ['M12 3c3.2 4.2 5.5 7.6 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 10.6 8.8 7.2 12 3Z'],
    longevity: [
      'M6.5 15c-1.7 0-3-1.3-3-3s1.3-3 3-3c2.2 0 3.7 2 5.5 3.8',
      'M17.5 9c1.7 0 3 1.3 3 3s-1.3 3-3 3c-2.2 0-3.7-2-5.5-3.8',
    ],
  }
  return icons[key] ?? []
}

const hours = computed(() => [
  { key: 'satWed', label: t('aboutPage.visit.hours.satWedLabel'), value: t('aboutPage.visit.hours.satWedValue') },
  { key: 'thu', label: t('aboutPage.visit.hours.thuLabel'), value: t('aboutPage.visit.hours.thuValue') },
  { key: 'fri', label: t('aboutPage.visit.hours.friLabel'), value: t('aboutPage.visit.hours.friValue') },
])

const social = computed(() => [
  { key: 'instagram', name: t('aboutPage.visit.social.instagram.name'), handle: t('aboutPage.visit.social.instagram.handle'), href: 'https://www.instagram.com/hastihoseiniclinic' },
  { key: 'linkedin', name: t('aboutPage.visit.social.linkedin.name'), handle: t('aboutPage.visit.social.linkedin.handle'), href: 'https://linkedin.com' },
  { key: 'telegram', name: t('aboutPage.visit.social.telegram.name'), handle: t('aboutPage.visit.social.telegram.handle'), href: 'https://telegram.org' },
  { key: 'whatsapp', name: t('aboutPage.visit.social.whatsapp.name'), handle: t('aboutPage.visit.social.whatsapp.handle'), href: 'https://wa.me/989379412491' },
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
  ogImage: '../assets/images/dr_hosseini.webp',
})
</script>

<style scoped>
/* ==================== STAGE ==================== */

.about-stage {
  background: transparent;
  color: var(--lightcyan);
  color-scheme: dark;
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
      color-mix(in oklab, var(--[#FFD543]) 35%, transparent),
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
  color: color-mix(in oklab, var(--[#FFD543]) 80%, transparent);
}

.about-hero-title {
  font-size: clamp(3rem, 6.5vw, 5.5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--lightcyan);
}

.about-section-title {
  font-size: clamp(2.3rem, 4.1vw, 3.6rem);
  line-height: 1.1;
  color: var(--lightcyan);
  font-family: "bon";
}

.about-kicker {
  color: color-mix(in oklab, var(--periwinkle) 60%, transparent);
}

.hero-credential {
  box-shadow: 0 20px 45px -20px color-mix(in oklab, var(--ink) 95%, transparent);
}

.anim-float3d {
  will-change: transform;
  animation: float-3d 16s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

@keyframes float-3d {
  0% {
    transform: none;
  }

  50% {
    transform: translateY(-20px) rotateX(3deg) rotateY(-4deg);
  }

  100% {
    transform: none;
  }
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

/* ==================== SIGNATURE: VITAL DIVIDER ==================== */
/* A quiet monitor-line motif that threads between sections — echoes the
   clinical precision of the brand without leaning on decorative gradients. */

.vital-divider {
  color: color-mix(in oklab, var(--[#FFD543]) 55%, transparent);
}

.vital-divider__path {
  stroke-dasharray: 320;
  stroke-dashoffset: 320;
  animation: vital-draw 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: 0.1s;
}

.vital-divider__dot {
  offset-path: path("M0 12H70L82 4L94 20L106 12H220");
  offset-rotate: 0deg;
  animation: vital-run 6s linear infinite;
  animation-delay: 1.8s;
  opacity: 0.9;
}

@keyframes vital-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes vital-run {
  from {
    offset-distance: 0%;
  }

  to {
    offset-distance: 100%;
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
  border-color: color-mix(in oklab, var(--[#FFD543]) 40%, transparent);
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

/* ==================== FOOTER ==================== */

.about-footer {
  border-top: 1px solid color-mix(in oklab, var(--periwinkle) 12%, transparent);
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

  .vital-divider__path {
    stroke-dashoffset: 0;
    animation: none;
  }

  .vital-divider__dot {
    animation: none;
    offset-distance: 50%;
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