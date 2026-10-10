<template>
  <div class="ln-shell" :dir="dir">
    <header class="ln-header">
      <NuxtLink to="/" class="ln-brand">
        <span class="ln-mark" aria-hidden="true">
          <img src="../assets/images/hastihoseinilogo.png" />
        </span>
        <span class="ln-wordmark font-bon font-medium">{{ t('brand') }}</span>
      </NuxtLink>
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

    <main class="ln-main ln-main--center">
      <section class="ln-copy">
        <p class="ln-eyebrow font-aria font-semibold">{{ t('eyebrow') }}</p>
        <h1 class="ln-title font-bon font-bold">{{ t('title') }}</h1>
        <p class="ln-sub font-bon font-light">{{ t('sub') }}</p>
        <NuxtLink to="/" class="ln-back font-bon font-medium">{{ t('back') }}</NuxtLink>
      </section>
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
    metaTitle: 'Training — Hasti Hoseini Clinic',
    metaDescription: 'Courses and workshops from Hasti Hoseini Clinic.',
    eyebrow: 'Training',
    title: 'Courses & Workshops',
    sub: 'Hands-on learning, beautiful practice — coming soon.',
    back: 'Back to home',
    langLabel: 'Switch language',
  },
  fa: {
    brand: 'کلینیک هستی حسینی',
    metaTitle: 'آموزش — کلینیک هستی حسینی',
    metaDescription: 'دوره‌ها و کارگاه‌های کلینیک هستی حسینی.',
    eyebrow: 'آموزش',
    title: 'دوره‌ها و کارگاه‌ها',
    sub: 'یادگیری عملی، تمرینی زیبا — به‌زودی',
    back: 'بازگشت به خانه',
    langLabel: 'تغییر زبان',
  },
} as const

type Locale = keyof typeof messages

const stored = useCookie<string>('i18n_lang', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' })

const locale = ref<Locale>(stored.value === 'en' ? 'en' : 'fa')

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

const t = (key: string): string => {
  const dict = messages[locale.value] as Record<string, unknown>
  return key.split('.').reduce<unknown>((acc, part) => (acc as Record<string, unknown>)?.[part], dict) as string ?? key
}

const metaTitle = computed(() => t('metaTitle'))
const metaDescription = computed(() => t('metaDescription'))

useSeoMeta({
  title: metaTitle,
  description: metaDescription,
  ogTitle: metaTitle,
  ogDescription: metaDescription,
  ogType: 'website',
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
})
</script>

<style scoped>
.ln-shell {
  --ln-background: #222831;
  --ln-foreground: #EEEEEE;
  --ln-primary: #5f8feb;
  --ln-accent: #5f8feb;
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
  background:
    radial-gradient(60rem 40rem at 85% -10%, color-mix(in oklab, var(--ln-primary) 14%, transparent), transparent 60%),
    var(--ln-background);
  color: var(--ln-foreground);
  font-family: var(--ln-font-display);
}

.ln-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.6rem clamp(1.25rem, 4vw, 3.5rem);
}

.ln-brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  text-decoration: none;
  color: inherit;
}

.ln-mark {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border: 1px solid color-mix(in oklab, var(--ln-primary) 40%, transparent);
  border-radius: 0.65rem;
  background: color-mix(in oklab, var(--ln-primary) 12%, transparent);
  overflow: hidden;
}

.ln-mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.ln-wordmark {
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.ln-header-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ln-lang {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--ln-border);
  border-radius: 999px;
  background: color-mix(in oklab, var(--ln-card) 60%, transparent);
  color: var(--ln-foreground);
  cursor: pointer;
  transition: border-color 0.3s, background 0.3s;
}

.ln-lang:hover {
  border-color: color-mix(in oklab, var(--ln-primary) 60%, transparent);
}

.ln-lang-globe {
  display: grid;
  place-items: center;
  color: var(--ln-primary);
}

.ln-lang-name {
  font-size: 0.8rem;
}

.ln-lang-code {
  font-size: 0.62rem;
  color: var(--ln-muted-foreground);
}

.ln-lang-caret {
  color: var(--ln-muted-foreground);
}

.ln-main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(2.5rem, 6vw, 5rem);
  padding: 2rem clamp(1.25rem, 5vw, 5.5rem);
}

.ln-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.42em;
  text-transform: uppercase;
  color: var(--ln-primary);
}

.ln-title {
  font-size: clamp(3rem, 7vw, 6rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
  margin: 0;
}

.ln-sub {
  max-width: 34ch;
  font-size: clamp(1rem, 1.4vw, 1.2rem);
  line-height: 1.6;
  color: var(--ln-muted-foreground);
}

.ln-back {
  display: inline-flex;
  width: fit-content;
  margin-top: 0.5rem;
  padding: 0.7rem 1.4rem;
  border: 1px solid var(--ln-border);
  border-radius: 999px;
  background: color-mix(in oklab, var(--ln-primary) 12%, transparent);
  color: var(--ln-foreground);
  text-decoration: none;
  transition: border-color 0.3s, background 0.3s;
}

.ln-back:hover {
  border-color: var(--ln-primary);
  background: color-mix(in oklab, var(--ln-primary) 24%, transparent);
}

.ln-footer {
  position: relative;
  z-index: 2;
  padding: 1.4rem clamp(1.25rem, 4vw, 3.5rem);
  border-top: 1px solid var(--ln-border);
  font-size: 0.8rem;
  color: var(--ln-muted-foreground);
}
</style>