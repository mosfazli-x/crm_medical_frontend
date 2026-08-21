<template>
  <main class="stage" :class="stagePhaseClass">

    <LandingPreloader />

    <!-- ==================== HERO BACKDROP ==================== -->
    <div class="backdrop">
      <LandingTimeOfDayBackground />
      <div class="backdrop__veil" />
      <div class="backdrop__glow" />
      <div class="backdrop__orb" />
      <div class="backdrop__orb backdrop__orb--champagne" />
      <div class="backdrop__grain" />
      <div class="backdrop__vignette" />
    </div>

    <!-- ==================== HEADER ==================== -->
    <header class="masthead">
      <span class="masthead__brand anim-soft" style="animation-delay: 2400ms">
        <span class="masthead__name font-iran-sans">{{ t('aestheticLanding.brand.name') }}</span>
        <span class="masthead__subtitle">{{ t('aestheticLanding.brand.subtitle') }}</span>
      </span>
      <span class="masthead__actions anim-soft" style="animation-delay: 2500ms">
        <span class="masthead__tagline">{{ t('aestheticLanding.brand.tagline') }}</span>
        <button type="button" class="masthead__lang" :aria-label="t('aestheticLanding.langToggle')" @click="toggleLang">
          {{ t('aestheticLanding.langToggle') }}
        </button>
        <LandingMusicControl />
      </span>
    </header>

    <!-- <figure
      class="anim-portrait pointer-events-none absolute !start-[48%] bottom-5 z-[1] m-0 h-[62vh] opacity-95 sm:h-[74vh] lg:right-0 lg:h-[88vh] lg:opacity-100 lg:flex w-full">
      <img
src="../assets/images/dr-hosseini-cutout.png" alt="Dr. Hasti Hosseini, clinic director, in clinical whites"
        class="portrait-mask h-full w-auto object-contain object-bottom"
        style="filter:brightness(0.86) contrast(1.06) saturate(0.92) drop-shadow(0 40px 80px color-mix(in oklab, var(--ink) 70%, transparent))">
    </figure> -->

    <!-- ==================== CONTENT ==================== -->
    <div class="layout overflow-hidden">

      <section class="lead">

        <h1 class="headline">
          <span class="headline__line"><span class="headline__line-inner anim-line" style="animation-delay: 2550ms">{{
            t('aestheticLanding.headline.line1') }}</span></span>
          <span class="headline__line">
            <span class="headline__line-inner anim-line !bg-clip-text !text-transparent !bg-gradient-to-r !from-amber-100 !via-amber-300 !to-amber-100"
              :class="{ 'headline__line-inner--italic headline__line-inner--accent': !isRtl }"
              style="animation-delay: 2700ms">{{ t('aestheticLanding.headline.line2') }}</span></span>
        </h1>

        <p class="lead__text anim-soft font-iran-sans" style="animation-delay: 3100ms">{{ t('aestheticLanding.intro') }}
        </p>

        <div class="tags anim-soft" style="animation-delay: 3300ms">
          <span
            class="!px-4 !py-2 !rounded-full !border !border-white/10 !bg-white/5 !backdrop-blur-md !text-xs !tracking-widest !uppercase !text-slate-300 font-iran-sans">{{
              t('aestheticLanding.badges.certified') }}</span>
          <span class="tags__sep" />
          <span
            class="!px-4 !py-2 !rounded-full !border !border-white/10 !bg-white/5 !backdrop-blur-md !text-xs !tracking-widest !uppercase !text-slate-300 font-iran-sans">{{
              t('aestheticLanding.badges.privacy') }}</span>
          <span class="tags__sep" />
          <span
            class="!px-4 !py-2 !rounded-full !border !border-white/10 !bg-white/5 !backdrop-blur-md !text-xs !tracking-widest !uppercase !text-slate-300 font-iran-sans">{{
              t('aestheticLanding.badges.protocols') }}</span>
        </div>
      </section>

      <aside class="flex justify-center md:justify-end! align-middle items-center">
        <nav :aria-label="t('aestheticLanding.navLabel')" class="w-full lg:w-7/11">
          <ul class="rail">
            <li v-for="item in railItems" :key="item.key" class="rail__item">
              <a :href="item.href" class="rail__link anim-soft" :style="{ animationDelay: item.delay }"
                @click="onRailClick($event, item.href)">
                <span class="rail__num">{{ item.num }}</span>
                <span class="rail__body">
                  <span class="rail__title">{{ item.title }}</span>
                  <span class="rail__sub">{{ item.sub }}</span>
                </span>
                <span aria-hidden="true" class="rail__line" />
              </a>
            </li>
          </ul>
        </nav>
      </aside>

    </div>

    <!-- ==================== SITELINKS ==================== -->
    <LandingSitelinks />

    <!-- ==================== FOOTER ==================== -->
    <footer class="footer anim-soft" style="animation-delay: 3600ms">
      <span>{{ t('aestheticLanding.footer.consultations') }}</span>
      <span class="footer__year">© 2026</span>
    </footer>

  </main>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const { t, isRtl, toggleLang } = useLang()

const { phase } = useTimeOfDayBackground()

const stagePhaseClass = computed(() => (phase.value ? `stage--${phase.value}` : ''))

const railItems = computed(() => [
  { key: 'booking', href: '/booking', num: t('aestheticLanding.rail.booking.num'), title: t('aestheticLanding.rail.booking.title'), sub: t('aestheticLanding.rail.booking.sub'), delay: '2900ms' },
  { key: 'login', href: '/auth/login', num: t('aestheticLanding.rail.login.num'), title: t('aestheticLanding.rail.login.title'), sub: t('aestheticLanding.rail.login.sub'), delay: '3030ms' },
  { key: 'tutorials', href: '#', num: t('aestheticLanding.rail.tutorials.num'), title: t('aestheticLanding.rail.tutorials.title'), sub: t('aestheticLanding.rail.tutorials.sub'), delay: '3160ms' },
  { key: 'blog', href: '/blog', num: t('aestheticLanding.rail.blog.num'), title: t('aestheticLanding.rail.blog.title'), sub: t('aestheticLanding.rail.blog.sub'), delay: '3290ms' },
  { key: 'about', href: '/about', num: t('aestheticLanding.rail.about.num'), title: t('aestheticLanding.rail.about.title'), sub: t('aestheticLanding.rail.about.sub'), delay: '3420ms' },
])

function onRailClick(event: MouseEvent, href: string) {
  if (href === '#') {
    event.preventDefault()
    return
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
  event.preventDefault()
  navigateTo(href)
}

const metaTitle = computed(() => t('aestheticLanding.metaTitle'))
const metaDescription = computed(() => t('aestheticLanding.metaDescription'))
const ogTitle = computed(() => t('aestheticLanding.ogTitle'))
const ogDescription = computed(() => t('aestheticLanding.ogDescription'))

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle,
  ogDescription,
  ogType: 'website',
  ogImage: '/images/hero-poster.jpg',
})
</script>

<style scoped>
/* ==================== STAGE ==================== */

.stage {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  overflow-x: hidden;
  background: var(--ink);
  color: var(--lightcyan);
  color-scheme: dark;
  font-family: var(--font-sans);
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

/* Hairline matte frame — a quiet photographic edge around the whole stage */
.stage::before {
  content: "";
  position: absolute;
  inset: 0.75rem;
  z-index: 40;
  border: 1px solid var(--hairline);
  pointer-events: none;
}

a {
  color: inherit;
}

/* ==================== HERO BACKDROP ==================== */

.backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.backdrop__veil {
  position: absolute;
  inset: 0;
  opacity: 1;
  transition: opacity 1.6s var(--ease-luxe);
  background: linear-gradient(100deg,
      color-mix(in oklab, var(--ink) 94%, transparent) 0%,
      color-mix(in oklab, var(--ink) 70%, transparent) 42%,
      color-mix(in oklab, var(--ink) 40%, transparent) 100%);
}

/* Let the time-of-day video set the mood — brighter scenes lift the veil so
   more of the footage shows through, night keeps the full cinematic dark. */
.stage--morning .backdrop__veil {
  opacity: 0.72;
}

.stage--noon .backdrop__veil {
  opacity: 0.76;
}

.stage--midday .backdrop__veil {
  opacity: 0.84;
}

.stage--night .backdrop__veil {
  opacity: 1;
}

.backdrop__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(110% 80% at 18% 88%,
      color-mix(in oklab, var(--sapphire) 26%, transparent),
      transparent 65%);
}

.backdrop__orb {
  position: absolute;
  top: -10rem;
  right: -8rem;
  width: 46vw;
  height: 46vw;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(80px);
  background: radial-gradient(circle,
      color-mix(in oklab, var(--cornflower) 55%, transparent),
      transparent 70%);
  will-change: transform;
  animation: orb-float 22s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

/* Warm champagne counter-orb — the single gold foil to the cool blues */
.backdrop__orb--champagne {
  top: auto;
  right: auto;
  bottom: -14rem;
  left: -10rem;
  width: 42vw;
  height: 42vw;
  opacity: 0.14;
  filter: blur(100px);
  background: radial-gradient(circle, var(--champagne), transparent 70%);
  animation: orb-float 26s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse;
}

/* Fine film grain — keeps the photographic depth from feeling synthetic */
.backdrop__grain {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  pointer-events: none;
  mix-blend-mode: soft-light;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.backdrop__vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 260px 80px var(--ink);
}

/* ==================== HEADER ==================== */

.masthead {
  position: absolute;
  inset-inline: 0;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(to bottom,
      color-mix(in oklab, var(--ink) 45%, transparent),
      transparent);
}

.masthead__brand {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  line-height: 1;
}

.masthead__name {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 500;
  letter-spacing: 0.32em;
  color: var(--lightcyan);
}

.masthead__subtitle {
  font-size: 0.75rem;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--champagne) 60%, transparent);
}

.masthead__tagline {
  display: none;
  font-size: 0.6rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--periwinkle) 60%, transparent);
}

.masthead__actions {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.masthead__lang {
  position: relative;
  font-family: var(--font-sans);
  font-size: 0.6rem;
  letter-spacing: 0;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--periwinkle) 60%, transparent);
  background: none;
  border: 0;
  padding: 0.25rem 0;
  cursor: pointer;
  transition: color 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.masthead__lang::after {
  content: "";
  position: absolute;
  inset-inline: 0;
  bottom: -2px;
  height: 1px;
  background: var(--champagne);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.masthead__lang:hover {
  color: var(--champagne-bright);
}

.masthead__lang:hover::after,
.masthead__lang:focus-visible::after {
  transform: scaleX(1);
}

.masthead__lang:focus-visible {
  outline: 1px dashed color-mix(in oklab, var(--champagne) 60%, transparent);
  outline-offset: 4px;
}

/* ==================== LAYOUT ==================== */

.layout {
  position: relative;
  z-index: 10;
  flex: 1 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 2.5rem;
  padding: 6rem 1.5rem 5rem;
}

/* ==================== LEAD ==================== */

.lead {
  max-width: 50rem;
}

.eyebrow {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
  font-size: 0.6rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--iceblue) 70%, transparent);
}

.eyebrow__rule {
  height: 1px;
  width: 2.5rem;
  background: color-mix(in oklab, var(--iceblue) 50%, transparent);
}

.headline {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 5.4vw, 4.75rem);
  line-height: 0.98;
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--lightcyan);
}

.headline__line {
  display: block;
  overflow: hidden;
  font-weight: 700;
}

.headline__line-inner {
  display: block;
}

.headline__line-inner--italic {
  font-style: italic;
}

/* Champagne foil on the italic display line — the single warm accent */
.headline__line-inner--accent {
  background: linear-gradient(100deg,
      var(--champagne) 0%,
      var(--champagne-bright) 55%,
      var(--champagne) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.lead__text {
  margin-top: 1rem;
  max-width: 30rem;
  font-size: 0.9rem;
  line-height: 1.625;
  letter-spacing: 0.06em;
  color: color-mix(in oklab, var(--periwinkle) 85%, transparent);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  row-gap: 0.75rem;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.6rem;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--lightcyan) 60%, transparent);
}

.tags__sep {
  height: 1px;
  width: 1.5rem;
  background: var(--border);
}

/* ==================== INDEX RAIL ==================== */

.rail {
  list-style: none;
  background: linear-gradient(135deg,
      color-mix(in oklab, var(--lightcyan) 9%, transparent),
      transparent 60%);
  -webkit-backdrop-filter: blur(20px) saturate(1.4);
  backdrop-filter: blur(20px) saturate(1.4);
  border: 1px solid color-mix(in oklab, var(--border) 45%, transparent);
  border-radius: 10px;
  box-shadow:
    0 24px 60px -32px color-mix(in oklab, var(--ink) 90%, transparent),
    inset 0 1px 0 color-mix(in oklab, var(--lightcyan) 12%, transparent);
  padding: 0.5rem 1.25rem;
}

.rail__item {
  border-bottom: 1px solid color-mix(in oklab, var(--border) 60%, transparent);
}

.rail__item:last-child {
  border-bottom: 0;
}

.rail__link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.75rem 0;
  text-decoration: none;
  transition: padding-inline-start 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    color 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.rail__link:hover {
  padding-inline-start: 0.75rem;
}

.rail__link:focus-visible {
  outline: 1px dashed color-mix(in oklab, var(--champagne) 60%, transparent);
  outline-offset: 6px;
}

.rail__num {
  font-family: var(--font-sans);
  font-size: 0.6rem;
  letter-spacing: 0.3em;
  font-variant-numeric: tabular-nums;
  color: color-mix(in oklab, var(--iceblue) 60%, transparent);
  transition: color 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.rail__link:hover .rail__num {
  color: var(--champagne-bright);
}

.rail__body {
  flex: 1;
}

.rail__title {
  font-family: var(--font-display);
  display: block;
  font-size: 1.375rem;
  line-height: 1;
  font-weight: 300;
  letter-spacing: 0.025em;
  color: var(--lightcyan);
  transition: color 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.rail__link:hover .rail__title {
  color: var(--periwinkle);
}

.rail__sub {
  display: block;
  margin-top: 0.25rem;
  max-height: 0;
  overflow: hidden;
  font-size: 0.6rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--periwinkle) 50%, transparent);
  opacity: 0;
  transition: max-height 0.7s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.rail__link:hover .rail__sub {
  max-height: 1.5rem;
  opacity: 1;
}

.rail__line {
  width: 1.5rem;
  height: 1px;
  background: var(--iceblue);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.rail__link:hover .rail__line {
  transform: scaleX(1);
}

/* ==================== FOOTER ==================== */

.footer {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  font-size: 0.55rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: color-mix(in oklab, var(--periwinkle) 50%, transparent);
  background: linear-gradient(to top,
      color-mix(in oklab, var(--ink) 45%, transparent),
      transparent);
}

.footer__year {
  display: none;
}

/* ==================== ENTRANCE ANIMATIONS ==================== */

.anim-soft {
  will-change: transform, opacity;
  animation: 1.4s cubic-bezier(0.16, 1, 0.3, 1) both soft-in;
}

.anim-line {
  will-change: transform, opacity;
  animation: 1.5s cubic-bezier(0.16, 1, 0.3, 1) both line-rise;
}

.anim-rule {
  transform-origin: 0;
  will-change: transform;
  animation: 1.6s cubic-bezier(0.16, 1, 0.3, 1) forwards rule-draw;
}

@keyframes soft-in {
  0% {
    opacity: 0;
    transform: translateY(14px);
  }

  100% {
    opacity: 1;
    transform: none;
  }
}

@keyframes line-rise {
  0% {
    opacity: 0;
    filter: blur(6px);
    transform: translateY(110%) rotate(2deg);
  }

  100% {
    opacity: 1;
    filter: blur(0);
    transform: translate(0) rotate(0);
  }
}

@keyframes rule-draw {
  0% {
    transform: scaleX(0);
  }

  100% {
    transform: scaleX(1);
  }
}

@keyframes orb-float {
  0% {
    transform: translate(0) scale(1);
  }

  50% {
    transform: translate(2%, -3%) scale(1.08);
  }

  100% {
    transform: translate(0) scale(1);
  }
}

/* ==================== RESPONSIVE ==================== */

@media (min-width: 640px) {
  .masthead {
    padding: 2rem 3rem;
  }

  .masthead__tagline {
    display: block;
  }

  .layout {
    padding: 6rem 3rem 5rem;
  }

  .rail {
    padding: 0.75rem 2.75rem;
  }

  .rail__link {
    gap: 1.5rem;
    padding: 1rem 0;
  }

  .rail__title {
    font-size: 1.625rem;
  }

  .footer {
    padding: 1.25rem 3rem;
  }

  .footer__year {
    display: block;
  }
}

@media (min-width: 1024px) {
  .layout {
    grid-template-columns: 1.15fr 0.85fr;
    gap: 5rem;
    padding: 0 3rem;
  }

  .rail-wrap {
    padding-inline-start: 1.5rem;
  }
}

/* ==================== REDUCED MOTION ==================== */

@media (prefers-reduced-motion: reduce) {

  .anim-soft,
  .anim-line,
  .anim-rule,
  .backdrop__orb {
    animation: none !important;
    will-change: auto;
  }
}
</style>

<style>
/* ==================== RTL / PERSIAN TYPOGRAPHY ==================== */
/*
  Persian glyphs must not be letter-spaced (it breaks the joining script),
  and need a taller line-height than the English display sizes. The shell
  (.landing-shell) lives in the layout, so these global rules key off its
  dir attribute, scoped under .stage to beat the scoped base rules.
*/

.landing-shell[dir="rtl"] .stage .masthead__name,
.landing-shell[dir="rtl"] .stage .masthead__subtitle,
.landing-shell[dir="rtl"] .stage .masthead__tagline,
.landing-shell[dir="rtl"] .stage .eyebrow,
.landing-shell[dir="rtl"] .stage .lead__text,
.landing-shell[dir="rtl"] .stage .tags,
.landing-shell[dir="rtl"] .stage .rail__num,
.landing-shell[dir="rtl"] .stage .rail__sub,
.landing-shell[dir="rtl"] .stage .footer {
  letter-spacing: 0;
}

.landing-shell[dir="rtl"] .stage .masthead__lang::after {
  transform-origin: left;
}

.landing-shell[dir="rtl"] .stage .headline {
  line-height: 1.3;
  letter-spacing: 0;
}

.landing-shell[dir="rtl"] .stage .rail__title {
  line-height: 1.3;
  letter-spacing: 0;
}

.landing-shell[dir="rtl"] .stage .rail__line {
  transform-origin: left;
}

.landing-shell[dir="rtl"] .stage .eyebrow__rule {
  transform-origin: 100% 50%;
}

@media (max-width: 639px) {
  .landing-shell[dir="rtl"] .stage .rail__link {
    padding: 0.6rem 0;
  }

  .landing-shell[dir="rtl"] .stage .rail__title {
    font-size: 1.125rem;
    line-height: 1.25;
  }
}
</style>
