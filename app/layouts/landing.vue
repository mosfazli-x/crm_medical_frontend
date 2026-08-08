<template>
  <div class="landing-shell" :dir="dir">
    <slot />
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

const dir = computed(() => (locale.value === 'fa' ? 'rtl' : 'ltr'))

useHead({
  htmlAttrs: {
    lang: computed(() => locale.value),
    dir: computed(() => dir.value),
  },
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Karla:wght@300;400;500&display=swap',
    },
  ],
})
</script>

<style>
/*
  Landing shell — full-viewport stage for the clinic landing page.
  Design tokens are declared here so every landing page inherits them.
  The shell direction follows the active locale (rtl for Persian).
*/
.landing-shell {
  --ink: oklch(18% 0.014 268);
  --ink-soft: oklch(24% 0.012 268);
  --sapphire: oklch(51% 0.23 277);
  --cornflower: oklch(58.5% 0.203 277);
  --iceblue: oklch(70% 0.15 277);
  --periwinkle: oklch(87% 0.06 277);
  --lightcyan: oklch(93% 0.03 277);
  --border: oklch(100% 0 0 / 0.12);
  --hairline: oklch(100% 0 0 / 0.12);

  /* Champagne accent — the single warm foil to the cool midnight palette */
  --champagne: oklch(80% 0.08 90);
  --champagne-bright: oklch(90% 0.08 92);

  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Karla", ui-sans-serif, system-ui, sans-serif;

  --ease-luxe: cubic-bezier(0.16, 1, 0.3, 1);

  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  overflow-x: hidden;
  /* overscroll-behavior: none; */
  background: var(--ink);
}

.landing-shell[dir="rtl"] {
  --font-display: "Bon", "Vazirmatn", ui-sans-serif, sans-serif;
  --font-sans: "Bon", "Vazirmatn", ui-sans-serif, sans-serif;
}

/* Quiet-luxury selection: champagne ink over ice, not the browser default */
.landing-shell ::selection {
  background: var(--champagne-bright);
  color: var(--ink);
}
</style>
