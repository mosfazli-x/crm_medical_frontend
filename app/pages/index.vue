<template>
  <div class="ln-shell" :class="{ 'is-ready': loaderShown }" :dir="dir">
    <!-- Cinematic curtain loader — draws the logo, then parts to reveal the page -->
    <LandingCurtainLoader @finished="onLoaderFinished" />

    <!-- Time-of-day background video (shared with the aesthetic landing) -->
    <div class="ln-backdrop" aria-hidden="true">
      <LandingTimeOfDayBackground />
      <div class="ln-backdrop__veil" />
      <div class="ln-backdrop__glow" />
    </div>

    <header class="ln-header">
      <div class="ln-brand">
        <span class="ln-mark" aria-hidden="true">
        <img src="../assets/images/hastihoseinilogo.png" />
        </span>
        <span class="ln-wordmark font-bon font-semibold">{{ t('brand') }}</span>
      </div>
      <div class="ln-header-right">
        <button type="button" class="ln-lang" :aria-label="t('langLabel')" @click="toggleLang">
          <span class="ln-lang-globe" aria-hidden="true">
            <Icon name="lucide:globe" size="16" />
          </span>
          <span class="ln-lang-label">
            <span class="ln-lang-name">{{ locale === 'fa' ? 'English' : 'فارسی' }}</span>
            <span class="ln-lang-code">{{ locale === 'fa' ? 'EN' : 'FA' }}</span>
          </span>
          <span class="ln-lang-caret" aria-hidden="true">
            <Icon name="lucide:chevron-down" size="14" />
          </span>
        </button>
      </div>
    </header>

    <main class="ln-main">
      <section class="ln-copy">
        <p class="ln-eyebrow font-aria font-semibold">{{ t('eyebrow') }}</p>
        <h1 class="ln-title font-bon font-bold">{{ t('title') }}<br><span class="gradient-text">{{ t('titleGradient') }}</span></h1>
        <p class="ln-sub font-bon font-light">
          {{ t('sub') }}
        </p>
      </section>

      <nav class="ln-nav" aria-label="Main">
        <NuxtLink to="/appointments" class="ln-card ln-card--primary">
          <span class="ln-card-text">
            <span class="ln-card-title font-bon">{{ t('nav.appointments.title') }}</span>
            <span class="ln-card-sub">{{ t('nav.appointments.sub') }}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"
            dir class="ln-arrow rtl:rotate-180 ltr:rotate-0">
            <path d="M5 12h13M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </NuxtLink>

        <NuxtLink to="/auth/login" class="ln-card">
          <span class="ln-card-text">
            <span class="ln-card-title font-bon">{{ t('nav.account.title') }}</span>
            <span class="ln-card-sub">{{ t('nav.account.sub') }}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"
            dir class="ln-arrow rtl:rotate-180 ltr:rotate-0">
            <path d="M5 12h13M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </NuxtLink>

        <NuxtLink to="/blog" class="ln-card">
          <span class="ln-card-text">
            <span class="ln-card-title font-bon">{{ t('nav.blog.title') }}</span>
            <span class="ln-card-sub">{{ t('nav.blog.sub') }}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"
            dir class="ln-arrow rtl:rotate-180 ltr:rotate-0">
            <path d="M5 12h13M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </NuxtLink>

        <NuxtLink to="/training" class="ln-card">
          <span class="ln-card-text">
            <span class="ln-card-title font-bon">{{ t('nav.training.title') }}</span>
            <span class="ln-card-sub">{{ t('nav.training.sub') }}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"
            dir class="ln-arrow rtl:rotate-180 ltr:rotate-0">
            <path d="M5 12h13M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </NuxtLink>

        <NuxtLink to="/about" class="ln-card">
          <span class="ln-card-text">
            <span class="ln-card-title font-bon">{{ t('nav.about.title') }}</span>
            <span class="ln-card-sub">{{ t('nav.about.sub') }}</span>
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"
            dir class="ln-arrow rtl:rotate-180 ltr:rotate-0">
            <path d="M5 12h13M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </NuxtLink>
      </nav>
    </main>

    <footer class="ln-footer">
      <span>{{ t('brand') }}</span>
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
    eyebrow: "Women's care & learning",
    title: 'A New Experience',
    titleGradient: 'in Modern Medicine',
    sub: 'Appointments, training and trusted guidance — thoughtfully arranged, never overwhelming.',
    nav: {
      appointments: { title: 'Book an Appointment', sub: 'Choose a time that suits you' },
      account: { title: 'Login or Register', sub: 'Your personal space' },
      blog: { title: 'Blog', sub: 'Notes, guides & stories' },
      training: { title: 'Training', sub: 'Courses and workshops' },
      about: { title: 'About Us', sub: 'Who we are' },
    },
    footerTagline: 'Care · Learning · Community',
    langLabel: 'Switch language',
  },
  fa: {
    brand: 'کلینیک هستی حسینی',
    metaTitle: 'کلینیک هستی حسینی — تجربه‌ای نوین در طب مدرن',
    metaDescription: 'تجربه‌ای متفاوت از پزشکی زیبایی بانوان',
    est: 'تأسیس ۲۰۲۶',
    eyebrow: 'مراقبت و آموزش بانوان',
    title: 'تجربه‌ای نوین',
    titleGradient: 'در طب مدرن',
    sub: 'تجربه‌ای متفاوت از پزشکی زیبایی بانوان',
    nav: {
      appointments: { title: 'رزرو نوبت', sub: 'زمانی را انتخاب کنید که مناسب شماست' },
      account: { title: 'ورود یا ثبت‌نام', sub: 'فضای شخصی شما' },
      blog: { title: 'وبلاگ', sub: 'یادداشت‌ها، راهنماها و داستان‌ها' },
      training: { title: 'آموزش', sub: 'دوره‌ها و کارگاه‌ها' },
      about: { title: 'درباره ما', sub: 'اینکه ما چه کسی هستیم' },
    },
    footerTagline: 'مراقبت · آموزش · جامعه',
    langLabel: 'تغییر زبان',
  },
} as const

type Locale = keyof typeof messages

const stored = useCookie<string>('i18n_lang', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' })

const locale = ref<Locale>(stored.value === 'fa' ? 'fa' : 'en')

const loaderShown = ref(false)

function onLoaderFinished() {
  loaderShown.value = true
}

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

const t = (key: string): string => {
  const dict = messages[locale.value] as Record<string, unknown>
  return key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dict) as string ?? key
}

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
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    },
  ],
})
</script>

<style scoped>
/* ── LadiesNeeds landing — self-contained design (not tied to CRM tokens) ── */

/* Content stays hidden until the curtain loader hands over */
.ln-header,
.ln-main,
.ln-footer {
  opacity: 0;
  transform: translateY(12px);
  transition:
    opacity 0.8s ease 0.05s,
    transform 0.8s ease 0.05s;
}

.ln-shell.is-ready .ln-header,
.ln-shell.is-ready .ln-main,
.ln-shell.is-ready .ln-footer {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .ln-header,
  .ln-main,
  .ln-footer {
    transition: opacity 0.2s ease;
    transform: none;
  }
}

.ln-shell {
  --ln-background: #222831;
  --ln-foreground: #EEEEEE;

  --ln-primary: #00ADB5;
  --ln-primary-foreground: #222831;

  --ln-accent: #00ADB5;

  --ln-card: #393E46;
  --ln-muted-foreground: #B8BDC5;
  --ln-border: #4A505A;

  --ln-font-display: 'Fraunces', ui-serif, Georgia, serif;
  --ln-font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;

  display: flex;
  flex-direction: column;
  position: relative;
  isolation: isolate;
  height: 100dvh;
  overflow: hidden;

  color: var(--ln-foreground);

  background:
    radial-gradient(
      100% 80% at 85% 0%,
      rgba(0, 173, 181, 0.10) 0%,
      rgba(34, 40, 49, 0) 50%
    ),
    #0f151c;
}

/* ── Background video backdrop ── */
.ln-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.ln-backdrop__veil {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    color-mix(in oklab, var(--ln-background) 96%, transparent) 0%,
    color-mix(in oklab, var(--ln-background) 82%, transparent) 45%,
    color-mix(in oklab, var(--ln-background) 55%, transparent) 100%
  );
}

.ln-backdrop__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    110% 80% at 85% 0%,
    color-mix(in oklab, var(--ln-accent) 14%, transparent),
    transparent 60%
  );
}

.ln-shell[dir='rtl'] {
  --ln-font-display: 'bon', 'Vazirmatn', var(--ln-font-sans);
  --ln-font-sans: 'bon', 'Vazirmatn', 'Manrope', ui-sans-serif, system-ui, sans-serif;
}

/* Font stack for all sections styled with `.font-bon`.
   Persian (RTL) keeps the "bon" font via --ln-font-display,
   while English (LTR) uses a dedicated Latin font (Fraunces).
   `!important` overrides the global fonts.css `.font-bon { font-family: "bon" }`
   rule that otherwise forces the Persian font onto English text. */
.font-bon {
  font-family: var(--ln-font-display) !important;
}

.ln-shell ::selection {
  background: var(--ln-accent);
  color: var(--ln-primary-foreground);
}

/* ── Header ── */
.ln-header {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: max(1.25rem, 3vh) 5vw 0;
}

.ln-header-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.ln-brand {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.ln-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  color: var(--ln-accent);
}

.ln-mark-svg {
  width: 55%;
  height: 55%;
}

.ln-wordmark {
  font-size: 1rem;
  letter-spacing: -0.1em;
  color: var(--ln-foreground);
}

.ln-est {
  display: none;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--ln-muted-foreground);
}

.ln-lang {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem 0.4rem 0.5rem;
  border: 1px solid var(--ln-border);
  border-radius: 999px;
  background: color-mix(in oklab, var(--ln-card) 70%, transparent);
  color: var(--ln-foreground);
  cursor: pointer;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.ln-lang:hover {
  border-color: color-mix(in oklab, var(--ln-accent) 50%, var(--ln-border));
  color: var(--ln-accent);
  transform: translateY(-1px);
}

.ln-lang:active {
  transform: translateY(0);
}

.ln-lang:focus-visible {
  outline: 2px solid var(--ln-accent);
  outline-offset: 2px;
  border-radius: 999px;
}

.ln-lang-globe {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border-radius: 50%;
  background: color-mix(in oklab, var(--ln-accent) 14%, transparent);
  color: var(--ln-accent);
}

.ln-lang-label {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  line-height: 1.1;
}

.ln-lang-name {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--ln-foreground);
}

.ln-lang:hover .ln-lang-name {
  color: var(--ln-accent);
}

.ln-lang-code {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ln-muted-foreground);
}

.ln-lang-caret {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-inline-start: 0.1rem;
  color: var(--ln-muted-foreground);
  transition: transform 0.2s ease, color 0.15s ease;
}

.ln-lang:hover .ln-lang-caret {
  color: var(--ln-accent);
  transform: translateY(1px);
}

/* ── Main ── */
.ln-main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-height: 0;
  gap: 4vh;
  padding: 3vh 5vw;
}

.ln-copy {
  /* max-width: 45ch; */
}

.ln-eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.34em;
  color: var(--ln-accent);
  margin: 0;
}

.ln-title {
  margin: 0;
  margin-top: 3.5vh;
  font-size: clamp(2.1rem, 6.2vw, 3.4rem);
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--ln-foreground);
}

.ln-sub {
  margin: 0;
  margin-top: 1.8vh;
  display: none;
  font-size: 0.875rem;
  line-height: 1.625;
  color: var(--ln-muted-foreground);
}

/* ── Nav ── */
.ln-nav {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2vh;
}

.ln-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: max(0.85rem, 1.6vh) 1.25rem;
  border: 1px solid var(--ln-border);
  border-radius: 0.5rem;
  background: color-mix(in oklab, var(--ln-card) 70%, transparent);
  color: var(--ln-foreground);
  text-decoration: none;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.ln-card:hover {
  transform: translateY(-0.125rem);
  border-color: color-mix(in oklab, var(--ln-accent) 50%, var(--ln-border));
  box-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.2);
}

.ln-card--primary {
  background: var(--ln-primary);
  border-color: transparent;
  color: var(--ln-primary-foreground);
  grid-column: 1 / -1;
}

.ln-card-text {
  min-width: 0;
}

.ln-card-title {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 1.05rem;
  line-height: 1.25;
  color: inherit;
}

.ln-card--primary .ln-card-title {
  color: var(--ln-primary-foreground);
}

.ln-card-sub {
  display: none;
  margin-top: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.75rem;
  color: var(--ln-muted-foreground);
}

.ln-card--primary .ln-card-sub {
  color: color-mix(in oklab, var(--ln-primary-foreground) 70%, transparent);
}

.ln-arrow {
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.ln-card:hover .ln-arrow {
  transform: translateX(0.25rem);
}

.ln-shell[dir='rtl'] .ln-card:hover .ln-arrow {
  transform: translateX(0.5rem) ;
}

/* ── Footer ── */
.ln-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: max(1rem, 2.5vh) 5vw;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: var(--ln-muted-foreground);
}

.ln-footer span+span {
  display: none;
}

/* ── sm (>=640px) ── */
@media (min-width: 40rem) {

  .ln-est,
  .ln-sub,
  .ln-card-sub,
  .ln-footer span+span {
    display: block;
  }

  .ln-nav {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .ln-card--primary {
    grid-column: span 2;
  }
}

/* ── lg (>=1024px) ── */
@media (min-width: 64rem) {
  .ln-header {
    padding-top: max(1.25rem, 3vh);
  }

  .ln-main {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    align-items: center;
    gap: 5vw;
  }

  .ln-nav {
    gap: 1rem;
  }

  .ln-title {
    font-size: clamp(2.6rem, 4vw, 4.2rem);
  }

  .ln-sub {
    font-size: 1rem;
  }
}

/* ── 2xl (>=1536px) ── */
@media (min-width: 96rem) {
  .ln-mark {
    width: 4rem;
    height: 4rem;
  }

  .ln-wordmark {
    font-size: 1.875rem;
  }

  .ln-est {
    font-size: 1rem;
  }

  .ln-eyebrow {
    font-size: 1.125rem;
  }

  .ln-title {
    font-size: clamp(4rem, 4.4vw, 6.5rem);
  }

  .ln-sub {
    font-size: 1.5rem;
  }

  .ln-card {
    gap: 1.5rem;
    padding: 2rem 2.25rem;
  }

  .ln-card-title {
    font-size: 1.875rem;
  }

  .ln-card-sub {
    font-size: 1.125rem;
  }

  .ln-arrow {
    width: 1.75rem;
    height: 1.75rem;
  }

  .ln-footer {
    font-size: 0.875rem;
  }
}
</style>
