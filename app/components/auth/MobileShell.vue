<script setup lang="ts">
/**
 * Mobile auth shell — the shared canvas for the mobile login and sign-up
 * screens: ambient navy/teal background, a compact top bar (brand + language +
 * home), a hero, a login/sign-up segmented control and the glass form sheet.
 */
const props = defineProps<{
  variant: 'login' | 'register'
  eyebrow: string
  title: string
  subtitle?: string
}>()

const { t, locale } = useI18n()
const { toggleLang } = useLang()

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))
const nextLangLabel = computed(() => (locale.value === 'fa' ? 'EN' : 'FA'))

const tabs = computed(() => [
  { to: '/auth/login', label: t('auth.mobile.tabLogin'), active: props.variant === 'login' },
  { to: '/auth/register', label: t('auth.mobile.tabSignup'), active: props.variant === 'register' },
])
</script>

<template>
  <div class="ma-shell" :dir="dir">
    <div class="ma-bg" aria-hidden="true">
      <span class="ma-bg__grid" />
      <span class="ma-orb ma-orb--1" />
      <span class="ma-orb ma-orb--2" />
      <span class="ma-orb ma-orb--3" />
      <span class="ma-bg__vignette" />
    </div>

    <header class="ma-bar">
      <NuxtLink to="/" class="ma-brand">
        <span class="ma-brand__mark">
          <img src="../../assets/images/hastihoseinilogo.png" class="ma-brand__img" alt="" />
        </span>
        <span class="ma-brand__copy">
          <b class="ma-brand__name">{{ t('auth.hero.title') }}</b>
          <span class="ma-brand__tag">{{ t('auth.hero.tagline') }}</span>
        </span>
      </NuxtLink>

      <div class="ma-bar__actions">
        <button
          type="button"
          class="ma-lang"
          :aria-label="t('auth.mobile.switchLang')"
          @click="toggleLang"
        >
          <Icon name="lucide:languages" size="16" />
          <span>{{ nextLangLabel }}</span>
        </button>
        <NuxtLink to="/" class="ma-iconbtn" :aria-label="t('auth.backToHome')">
          <Icon name="lucide:house" size="18" />
        </NuxtLink>
      </div>
    </header>

    <div class="ma-scroll">
      <section class="ma-hero">
        <p class="ma-hero__eyebrow">{{ eyebrow }}</p>
        <h1 class="ma-hero__title">{{ title }}</h1>
        <p v-if="subtitle" class="ma-hero__sub">{{ subtitle }}</p>
      </section>

      <section class="ma-sheet">
        <nav class="ma-tabs" role="tablist">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.to"
            :to="tab.to"
            class="ma-tab"
            :class="{ 'is-active': tab.active }"
            role="tab"
            :aria-selected="tab.active"
          >
            {{ tab.label }}
          </NuxtLink>
        </nav>

        <slot />
      </section>

      <p class="ma-footnote">
        <Icon name="lucide:shield-check" size="15" />
        <span>{{ t('auth.mobile.secure') }}</span>
      </p>
    </div>
  </div>
</template>
