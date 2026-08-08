<script setup lang="ts">
import { ref, computed } from 'vue'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  links?: { label: string; href: string }[]
}>(), {
  links: undefined
})

const defaultLinks = computed(() => [
  { label: t('footer.home'), href: '#hero' },
  { label: t('footer.about'), href: '#about' },
  { label: t('footer.services'), href: '#services' },
  { label: t('footer.doctors'), href: '#doctors' },
  { label: t('footer.blog'), href: '#blog' },
  { label: t('footer.contact'), href: '#appointment' }
])

const links = computed(() =>
  props.links && props.links.length ? props.links : defaultLinks.value
)

const socialLinks = computed(() => [
  { name: t('footer.telegram'), href: '#', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z' },
  { name: t('footer.instagram'), href: '#', icon: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z' },
  { name: t('footer.whatsapp'), href: '#', icon: 'M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2m.01 17.88c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a7.86 7.86 0 0 1-1.22-4.18c0-4.37 3.55-7.92 7.92-7.92 4.37 0 7.92 3.55 7.92 7.92 0 4.37-3.55 7.92-7.92 7.92m4.37-5.95c-.24-.12-1.41-.7-1.63-.78-.21-.08-.37-.12-.53.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.28-.72-1.75-.19-.47-.39-.41-.53-.41h-.45c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.24.98 2.4c.12.16 1.7 2.59 4.12 3.63.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.04.14-1.13-.06-.1-.22-.16-.46-.28z' },
])

const email = ref('')
const isSubscribed = ref(false)

function subscribe() {
  if (email.value) {
    isSubscribed.value = true
    email.value = ''
    setTimeout(() => { isSubscribed.value = false }, 3000)
  }
}
</script>

<template>
  <footer class="!relative !overflow-hidden !bg-ink !text-white/80 flex justify-center align-middle items-center px-6!">
    <!-- Top gradient line -->
    <div class="footer-gradient-line !absolute !top-0 !left-0 !right-0" />

    <!-- Animated background orbs -->
    <div class="!pointer-events-none !absolute !inset-0">
      <div class="!absolute !bottom-0 !left-1/2 !-translate-x-1/2 !h-64 !w-[500px] !rounded-full !bg-emerald/5 !blur-3xl animate-floaty-slow" />
      <div class="!absolute !top-0 !right-0 !h-48 !w-48 !rounded-full !bg-emerald-bright/3 !blur-3xl animate-float-gentle" />
    </div>

    <div class="!container !relative !z-10 !py-20">
      <!-- Top section: Logo + Newsletter -->
      <div class="!flex !flex-col lg:!flex-row !items-start !justify-between !gap-12 !pb-12 !border-b !border-white/10">
        <div class="!max-w-md">
          <div class="!flex !items-center !gap-3 !mb-5">
            <span class="!flex !h-11 !w-11 !items-center !justify-center !rounded-2xl !bg-white/10 !transition-all !duration-300 hover:!bg-white/15 hover:!shadow-[0_0_20px_rgba(62,232,168,0.2)]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 3c1.5 3 4 4.5 4 8a4 4 0 1 1-8 0c0-3.5 2.5-5 4-8Z" stroke="#3EE8A8" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="!font-display !text-xl !font-bold !tracking-tight !text-white">{{ t('footer.clinicName') }}</span>
          </div>
          <p class="!text-sm !leading-8 !text-white/50 !max-w-xs">
            {{ t('footer.description') }}
          </p>
          <!-- Social icons -->
          <div class="!flex !items-center !gap-3 !mt-6">
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.href"
              :aria-label="social.name"
              class="!flex !h-10 !w-10 !items-center !justify-center !rounded-xl !bg-white/5 !border !border-white/10 !transition-all !duration-300 hover:!bg-emerald/15 hover:!border-emerald/25 hover:!shadow-[0_0_16px_rgba(62,232,168,0.15)] hover:!scale-110"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path :d="social.icon" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Newsletter -->
        <div class="!max-w-sm !w-full">
          <h4 class="!font-display !font-bold !mb-3 !text-white !text-base">{{ t('footer.newsletterTitle') }}</h4>
          <p class="!text-sm !text-white/40 !mb-4">{{ t('footer.newsletterDesc') }}</p>
          <form class="!flex !gap-2" @submit.prevent="subscribe">
            <input
              v-model="email"
              type="email"
              :placeholder="t('footer.newsletterPlaceholder')"
              class="!flex-1 !rounded-xl !border !border-white/15 !bg-white/5 !px-4 !py-3 !text-sm !text-white !placeholder-white/30 !outline-none !transition-all !duration-300 focus:!border-emerald-bright focus:!bg-white/8 input-professional"
            />
            <button
              type="submit"
              class="!shrink-0 !rounded-xl !bg-emerald-deep !px-5 !py-3 !text-sm !font-medium !text-white !transition-all !duration-300 hover:!bg-emerald hover:!shadow-[0_0_20px_rgba(62,232,168,0.25)]"
            >
              {{ isSubscribed ? t('footer.subscribed') : t('footer.subscribe') }}
            </button>
          </form>
        </div>
      </div>

      <!-- Main links grid -->
      <div class="!grid !gap-12 !pt-12 md:!grid-cols-3">
        <div>
          <h4 class="!font-display !font-bold !mb-5 !text-white !text-base">{{ t('footer.quickLinks') }}</h4>
          <nav class="!flex !flex-col !gap-3">
            <a
              v-for="link in links"
              :key="link.href"
              :href="link.href"
              class="!text-sm !text-white/50 !transition-all !duration-300 hover:!text-emerald-bright hover:!translate-x-1 rtl:hover:!-translate-x-1 !group !flex !items-center !gap-2"
            >
              <span class="!h-1 !w-1 !rounded-full !bg-emerald/30 !transition-all !duration-300 group-hover:!bg-emerald-bright group-hover:!shadow-[0_0_8px_rgba(62,232,168,0.5)]" />
              {{ link.label }}
            </a>
          </nav>
        </div>

        <div>
          <h4 class="!font-display !font-bold !mb-5 !text-white !text-base">{{ t('footer.contactUs') }}</h4>
          <ul class="!flex !flex-col !gap-4 !text-sm !text-white/50">
            <li class="!flex !items-center !gap-3 !group">
              <span class="!flex !h-9 !w-9 !items-center !justify-center !rounded-xl !bg-white/5 !border !border-white/10 !shrink-0 !transition-all !duration-300 group-hover:!bg-emerald/10 group-hover:!border-emerald/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </span>
              <div>
                <p class="!text-xs !text-white/30 !mb-0.5">{{ t('footer.phone') }}</p>
                <p class="!text-white/70 group-hover:!text-emerald-bright !transition-colors !duration-300">{{ t('footer.phoneValue') }}</p>
              </div>
            </li>
            <li class="!flex !items-center !gap-3 !group">
              <span class="!flex !h-9 !w-9 !items-center !justify-center !rounded-xl !bg-white/5 !border !border-white/10 !shrink-0 !transition-all !duration-300 group-hover:!bg-emerald/10 group-hover:!border-emerald/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.6"/><path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </span>
              <div>
                <p class="!text-xs !text-white/30 !mb-0.5">{{ t('footer.email') }}</p>
                <p class="!text-white/70 group-hover:!text-emerald-bright !transition-colors !duration-300">info@lotus-clinic.ir</p>
              </div>
            </li>
            <li class="!flex !items-center !gap-3 !group">
              <span class="!flex !h-9 !w-9 !items-center !justify-center !rounded-xl !bg-white/5 !border !border-white/10 !shrink-0 !transition-all !duration-300 group-hover:!bg-emerald/10 group-hover:!border-emerald/20">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
              </span>
              <div>
                <p class="!text-xs !text-white/30 !mb-0.5">{{ t('footer.address') }}</p>
                <p class="!text-white/70 group-hover:!text-emerald-bright !transition-colors !duration-300">{{ t('footer.addressValue') }}</p>
              </div>
            </li>
          </ul>
        </div>

        <div>
          <h4 class="!font-display !font-bold !mb-5 !text-white !text-base">{{ t('footer.workingHours') }}</h4>
          <div class="!flex !flex-col !gap-3 !text-sm">
            <div class="!flex !justify-between !text-white/50">
              <span>{{ t('footer.satWed') }}</span>
              <span class="!text-white/70">{{ t('footer.hoursSatWed') }}</span>
            </div>
            <div class="!flex !justify-between !text-white/50">
              <span>{{ t('footer.thu') }}</span>
              <span class="!text-white/70">{{ t('footer.hoursThu') }}</span>
            </div>
            <div class="!flex !justify-between !text-white/50">
              <span>{{ t('footer.fri') }}</span>
              <span class="!text-red-400/80">{{ t('footer.closed') }}</span>
            </div>
            <div class="!mt-2 !h-px !bg-white/10" />
            <div class="!flex !justify-between !text-white/50">
              <span>{{ t('footer.emergency') }}</span>
              <span class="!text-emerald-bright !font-medium">{{ t('footer.hours24') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="!mt-14 !border-t !border-white/10 !pt-8 !flex !flex-col md:!flex-row !items-center !justify-between !gap-4">
        <p class="!text-xs !text-white/30">
          {{ t('footer.copyright', { year: new Date().getFullYear() }) }}
        </p>
        <div class="!flex !items-center !gap-4 !text-xs !text-white/20">
          <a href="#" class="!transition-colors !duration-300 hover:!text-emerald-bright">{{ t('footer.privacy') }}</a>
          <span>·</span>
          <a href="#" class="!transition-colors !duration-300 hover:!text-emerald-bright">{{ t('footer.terms') }}</a>
          <span>·</span>
          <a href="#" class="!transition-colors !duration-300 hover:!text-emerald-bright">{{ t('footer.sitemap') }}</a>
        </div>
      </div>
    </div>
  </footer>
</template>
