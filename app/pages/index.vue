<template>
  <div class="ln-shell" :class="{ 'is-ready': loaderShown }" :dir="dir">
    <!-- Cinematic curtain loader — draws the logo, then parts to reveal the page -->
    <LandingCurtainLoader @finished="onLoaderFinished" />

    <!-- Time-of-day background video (shared with the aesthetic landing) -->
    <div class="ln-backdrop" aria-hidden="true">
      <LandingTimeOfDayBackground />
      <div class="ln-backdrop__veil" />
    </div>

    <header class="ln-header">
      <div class="ln-brand">
        <span class="ln-mark" aria-hidden="true">
          <img src="../assets/images/hastihoseinilogo.png" alt="" />
        </span>
        <span class="ln-wordmark font-bon">{{ t('brand') }}</span>
      </div>
      <div class="ln-header-right">
        <button type="button" class="ln-lang" :aria-label="t('langLabel')" @click="toggleLang">
          <span class="ln-lang-globe" aria-hidden="true">
            <Icon name="lucide:globe" size="15" />
          </span>
          <span class="ln-lang-label">
            <span class="ln-lang-name">{{ locale === 'fa' ? 'English' : 'فارسی' }}</span>
            <span class="ln-lang-code">{{ locale === 'fa' ? 'EN' : 'FA' }}</span>
          </span>
        </button>
      </div>
    </header>

    <main class="ln-main" />

    <footer class="ln-footer">
      <nav class="ln-actions" aria-label="Main">
        <NuxtLink
          v-for="entry in entries"
          :key="entry.to"
          :to="entry.to"
          class="ln-ghost font-bon"
          :class="{ 'ln-ghost--primary': entry.lead }"
        >{{ entry.label }}</NuxtLink>
      </nav>
    </footer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const messages = {
  en: {
    brand: 'Hasti Hoseini Clinic',
    metaTitle: 'Hasti Hoseini Clinic — A New Experience in Modern Medicine',
    metaDescription: 'Appointments, training and trusted guidance — thoughtfully arranged, never overwhelming.',
    est: 'Est. 2026',
    actions: {
      appointments: 'Book Appointment',
      account: 'Login/Sign Up',
      about: 'About Hasti Hosseini',
    },
    footerTagline: 'Care · Learning · Community',
    langLabel: 'Switch language',
  },
  fa: {
    brand: 'کلینیک هستی حسینی',
    metaTitle: 'کلینیک هستی حسینی — تجربه‌ای نوین در طب مدرن',
    metaDescription: 'تجربه‌ای متفاوت از پزشکی زیبایی بانوان',
    est: 'تأسیس ۲۰۲۶',
    actions: {
      appointments: 'رزرو نوبت',
      account: 'ورود',
      about: 'درباره هستی حسینی',
    },
    footerTagline: 'مراقبت · آموزش · جامعه',
    langLabel: 'تغییر زبان',
  },
} as const

type Locale = keyof typeof messages

const stored = useCookie<string>('i18n_lang', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' })

const locale = ref<Locale>(stored.value === 'en' ? 'en' : 'fa')

const loaderShown = ref(false)

function onLoaderFinished() {
  loaderShown.value = true
}

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

const t = (key: string): string => {
  const dict = messages[locale.value] as Record<string, unknown>
  return key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dict) as string ?? key
}

/** Three destinations, rendered as a ghost rail anchored to the viewport foot. */
const entries = computed(() => [
  { to: '/booking', label: t('actions.appointments'), lead: true },
  { to: '/landing', label: t('actions.account'), lead: false },
  { to: '/about', label: t('actions.about'), lead: false },
])

const metaTitle = computed(() => t('metaTitle'))
const metaDescription = computed(() => t('metaDescription'))
const ogTitle = computed(() => metaTitle.value)
const ogDescription = computed(() => metaDescription.value)

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle,
  ogDescription,
  ogType: 'website',
  ogImage: '/images/hero-poster.jpg',
})

function toggleLang() {
  const next: Locale = locale.value === 'fa' ? 'en' : 'fa'
  locale.value = next
  stored.value = next
  if (typeof document !== 'undefined') {
    document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }
}

useHead({
  htmlAttrs: { lang: locale, dir },
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossorigin: '',
    },
    {
      /* Cormorant Garamond for display, Karla for everything utilitarian —
         the pairing already used by the project's landing layout. */
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Karla:wght@300;400;500&display=swap',
    },
  ],
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════
   Hasti Hoseini Clinic — landing

   Direction: luxurious minimalism. The film is the subject; the interface
   is three outlines and a wordmark. No cards, no glass, no glow — hairlines,
   one champagne accent, and a print grain to bind the type to the image.

   The scrim is deliberately local, not global: protection is laid only
   under the header and the action rail so the centre of the frame stays
   clear. The video layer is lifted from its 0.5 default to near-full so the
   imagery actually reads.

   Accessibility contract
   • Text is protected by local gradients plus a text-shadow, never by a
     full-page wash (WCAG 1.4.3).
   • Focus rings are restyled, never removed (2.4.7); hover affordances are
     duplicated in :focus-visible.
   • Touch targets ≥ 44px (2.5.8).
   • prefers-reduced-motion and prefers-contrast: more both honoured.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Design tokens ──────────────────────────────────────────────────── */

.ln-shell {
  /* Ink — the field behind the film, warm-shifted a hair toward brass */
  --ink: oklch(17% 0.016 252);
  --ink-deep: oklch(10% 0.012 252);

  /* Paper — a warm off-white, never pure #fff */
  --paper: oklch(95% 0.008 85);
  --paper-muted: oklch(80% 0.012 250);
  --paper-faint: oklch(66% 0.012 250);

  /* Champagne — the single accent */
  --brass: #BDE0FE;
  --brass-wash: oklch(84% 0.075 84 / 0.12);

  /* Hairlines */
  --rule: oklch(100% 0 0 / 0.28);
  --rule-soft: oklch(100% 0 0 / 0.14);
  --rule-brass: #A2D2FF;

  /* Type */
  --display: 'Cormorant Garamond', ui-serif, Georgia, serif;
  --sans: 'Karla', ui-sans-serif, system-ui, sans-serif;

  /* Space — 8px scale */
  --gutter: clamp(1.5rem, 6vw, 7rem);
  --rail-gap: 0.75rem;

  /* Motion */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-soft: cubic-bezier(0.4, 0, 0.2, 1);

  /* Legibility shadow — the second half of the text-over-film strategy */
  --lift: 0 1px 2px oklch(var(--ink-deep) / 0.55), 0 2px 22px oklch(var(--ink-deep) / 0.45);

  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;

  color: var(--paper);
  color-scheme: dark;
  font-family: var(--sans);
  font-synthesis-weight: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  background: var(--ink);
}

.ln-shell[dir='rtl'] {
  --display: 'bon', 'Vazirmatn', ui-serif, Georgia, serif;
  --sans: 'bon', 'Vazirmatn', 'Karla', ui-sans-serif, system-ui, sans-serif;
}

/* Display face for every element tagged `.font-bon`.
   `!important` outranks the global fonts.css `.font-bon` rule so English gets
   Cormorant while Persian keeps "bon". */
.font-bon {
  font-family: var(--display) !important;
}

/* Tracked capitals are a Latin device; zero them for Arabic */
.ln-shell[dir='rtl'] :is(.ln-wordmark, .ln-footer-brand, .ln-lang-name, .ln-lang-code) {
  text-transform: none;
  letter-spacing: 0 !important;
}

.ln-shell ::selection {
  background: var(--brass);
  color: var(--ink-deep);
}

/* ── Backdrop ──────────────────────────────────────────────────────── */

.ln-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Lift the shared background player from its 0.5 default so the film is
   actually the subject. Scoped override — the component itself is untouched. */
.ln-backdrop :deep(.tod-bg__video--active) {
  opacity: 0.94;
}

/* Local protection only: a light cap under the header, a deeper pool under
   the action rail, and a whisper of ink to unify. The middle of the frame is
   left alone so the imagery reads. */
.ln-backdrop__veil {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      oklch(10% 0.012 252 / 0.60) 0%,
      oklch(10% 0.012 252 / 0.22) 16%,
      transparent 30%
    ),
    linear-gradient(
      0deg,
      oklch(10% 0.012 252 / 0.82) 0%,
      oklch(10% 0.012 252 / 0.52) 22%,
      transparent 46%
    ),
    linear-gradient(
      180deg,
      oklch(10% 0.012 252 / 0.16) 0%,
      oklch(10% 0.012 252 / 0.04) 45%,
      oklch(10% 0.012 252 / 0.24) 100%
    );
}

/* Print grain, its own layer so its weight stays independent of the scrim */
.ln-backdrop::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 240px 240px;
  opacity: 0.055;
  mix-blend-mode: overlay;
}

/* ── Reveal choreography ───────────────────────────────────────────── */

.ln-header,
.ln-footer {
  opacity: 0;
  transform: translate3d(0, 10px, 0);
  transition:
    opacity 1100ms var(--ease-soft) var(--ln-delay, 0ms),
    transform 1100ms var(--ease) var(--ln-delay, 0ms);
}

.ln-header {
  --ln-delay: 60ms;
}

.ln-footer {
  --ln-delay: 320ms;
}

.ln-shell.is-ready :is(.ln-header, .ln-footer) {
  opacity: 1;
  transform: none;
}

/* ── Header ────────────────────────────────────────────────────────── */

.ln-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: clamp(1.5rem, 4vh, 2.75rem) var(--gutter) clamp(1rem, 2.5vh, 1.5rem);
}

.ln-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ln-brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
}

/* The mark stands on its own — no tile, no container */
.ln-mark {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.15rem;
  height: 2.15rem;
}

.ln-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 1px 6px oklch(var(--ink-deep) / 0.55));
}

.ln-wordmark {
  font-size: clamp(0.95rem, 1.1vw, 1.1rem);
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-shadow: var(--lift);
}

/* ── Language switch ───────────────────────────────────────────────── */

.ln-lang {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-height: 2.75rem;
  padding: 0.25rem 0 0.35rem;
  border: 0;
  background: none;
  color: var(--paper);
  cursor: pointer;
}

/* A champagne rule sweeps in from the far edge on hover / focus */
.ln-lang::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: var(--brass);
  transform: scaleX(0);
  transform-origin: end;
  transition: transform 480ms var(--ease);
}

.ln-lang:hover::after,
.ln-lang:focus-visible::after {
  transform: scaleX(1);
}

.ln-lang-globe {
  display: inline-grid;
  place-items: center;
  color: var(--brass);
}

.ln-lang-label {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  line-height: 1.1;
  text-align: start;
}

.ln-lang-name {
  font-family: var(--sans);
  font-size: 0.82rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-shadow: var(--lift);
  transition: color 200ms linear;
}

.ln-lang:hover .ln-lang-name {
  color: var(--brass);
}

.ln-lang-code {
  font-family: var(--sans);
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--paper-faint);
  text-shadow: var(--lift);
}

/* ── Stage ─────────────────────────────────────────────────────────── */

/* Deliberately empty: the film owns the middle of the screen, and the rail
   stays anchored to the foot of the viewport. */
.ln-main {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 0;
}

/* ── Footer / ghost rail ───────────────────────────────────────────── */

.ln-footer {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 2.5vh, 1.6rem);
  padding: clamp(1.25rem, 3vh, 2rem) var(--gutter) clamp(1.75rem, 4vh, 3rem);
}

/* Hairline above the rail, dissolving at both ends */
.ln-footer::before {
  content: '';
  position: absolute;
  top: 0;
  inset-inline: var(--gutter);
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--rule-soft) 20%,
    var(--rule-soft) 80%,
    transparent
  );
}

/* Stacked on mobile; a single row once there's room to breathe (>= 768px) */
.ln-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
}

.ln-ghost {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  width: 100%;
  max-width: 20rem;
  min-height: 3rem;
  padding: 0.85rem 1.75rem;
  border-radius: 999px;
  background: transparent;
  color: var(--paper);
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-decoration: none;
  text-shadow: var(--lift);
  transition:
    border-color 260ms var(--ease-soft),
    background-color 260ms var(--ease-soft),
    color 260ms var(--ease-soft),
    transform 260ms var(--ease-soft);
}

.ln-ghost:hover,
.ln-ghost:focus-visible {
  border-color: var(--brass);
  background: var(--brass-wash);
  color: var(--brass);
  transform: translateY(-2px);
}

.ln-ghost:active {
  transform: translateY(0);
}

/* The primary is signalled by a champagne outline alone — still a ghost */
.ln-ghost--primary {
  border-color: var(--rule-brass);
  color: var(--brass);
}

.ln-ghost--primary:hover,
.ln-ghost--primary:focus-visible {
  border-color: var(--brass);
  background: oklch(84% 0.075 84 / 0.18);
}

/* Directional affordance — CSS-only chevron, no extra markup */
.ln-ghost::after {
  content: '';
  flex-shrink: 0;
  width: 0.4rem;
  height: 0.4rem;
  border-top: 1px solid currentColor;
  border-right: 1px solid currentColor;
  rotate: 45deg;
  translate: -0.2rem 0;
  opacity: 0.5;
  transition:
    translate 420ms var(--ease),
    opacity 260ms linear;
}

.ln-ghost:hover::after,
.ln-ghost:focus-visible::after {
  translate: 0 0;
  opacity: 1;
}

.ln-shell[dir='rtl'] .ln-ghost::after {
  rotate: -135deg;
  translate: 0.2rem 0;
}

.ln-shell[dir='rtl'] .ln-ghost:hover::after,
.ln-shell[dir='rtl'] .ln-ghost:focus-visible::after {
  translate: 0 0;
}

.ln-footer-brand {
  font-family: var(--sans);
  font-size: 0.66rem;
  font-weight: 400;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--paper-faint);
  text-shadow: var(--lift);
}

/* ── Focus — restyled, never removed ───────────────────────────────── */

.ln-shell :is(.ln-lang, .ln-ghost):focus-visible {
  outline: 1px solid var(--brass);
  outline-offset: 4px;
}

/* ── User preference overrides ─────────────────────────────────────── */

@media (prefers-contrast: more) {

  /* Without the film's midtones to lean on, protection goes back to global */
  .ln-backdrop :deep(.tod-bg__video--active) {
    opacity: 0.45;
  }

  .ln-backdrop__veil {
    background: linear-gradient(
      180deg,
      oklch(8% 0.012 252 / 0.9) 0%,
      oklch(8% 0.012 252 / 0.92) 100%
    );
  }

  .ln-ghost {
    border-color: oklch(100% 0 0 / 0.65);
  }

  .ln-ghost--primary {
    border-color: var(--brass);
  }

  .ln-wordmark,
  .ln-lang-name,
  .ln-lang-code,
  .ln-ghost,
  .ln-footer-brand {
    text-shadow: none;
  }
}

@media (prefers-reduced-motion: reduce) {

  .ln-header,
  .ln-footer {
    transition: opacity 200ms linear;
    transform: none;
  }

  .ln-ghost,
  .ln-ghost::after,
  .ln-lang::after {
    transition-duration: 1ms;
  }

  .ln-ghost:hover,
  .ln-ghost:focus-visible {
    transform: none;
  }
}

/* ── Responsive ────────────────────────────────────────────────────── */

/* Laptop and up — the rail runs horizontally along the foot of the screen */
@media (min-width: 48rem) {

  .ln-actions {
    flex-direction: row;
    justify-content: center;
    gap: var(--rail-gap);
  }

  .ln-ghost {
    width: auto;
    max-width: none;
    padding: 0.85rem 2rem;
  }
}

@media (min-width: 64rem) {

  .ln-mark {
    width: 2.5rem;
    height: 2.5rem;
  }

  .ln-ghost {
    padding: 1rem 2.4rem;
    font-size: 0.95rem;
  }
}

@media (min-width: 96rem) {

  .ln-wordmark {
    font-size: 1.3rem;
  }

  .ln-ghost {
    padding: 1.1rem 2.9rem;
    font-size: 1.05rem;
  }

  .ln-footer-brand {
    font-size: 0.75rem;
  }
}
</style>