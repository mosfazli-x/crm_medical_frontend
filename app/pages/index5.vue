<template>
    <main class="stage !relative !flex !flex-col !min-h-screen !w-full !overflow-hidden !bg-slate-950 !text-slate-50"
        :class="stagePhaseClass">

        <LandingPreloader />

        <!-- ==================== HERO BACKDROP ==================== -->
        <div class="backdrop !absolute !inset-0 !overflow-hidden !pointer-events-none">
            <LandingTimeOfDayBackground />
            <div class="backdrop__veil !absolute !inset-0 !transition-opacity !duration-1000" />
            <div class="backdrop__glow !absolute !inset-0" />
            <div class="backdrop__orb" />
            <div class="backdrop__orb backdrop__orb--champagne" />
            <div class="backdrop__grain !absolute !inset-0 !opacity-5 !mix-blend-soft-light" />
            <div class="backdrop__vignette !absolute !inset-0" />
        </div>

        <!-- ==================== HEADER ==================== -->
        <header
            class="masthead !absolute !top-0 !w-full !z-50 !flex !justify-between !items-center !px-6 md:!px-12 !py-6 lg:!py-8 !backdrop-blur-sm !bg-slate-950/10 !border-b !border-white/5">
            <div class="masthead__brand anim-soft !flex !flex-col !gap-1" style="animation-delay: 2400ms">
                <span class="masthead__name !text-xl !font-light !tracking-[0.2em] !text-white uppercase">{{
                    t('aestheticLanding.brand.name') }}</span>
                <span class="masthead__subtitle !text-[0.65rem] !tracking-[0.3em] !text-amber-200/70 uppercase">{{
                    t('aestheticLanding.brand.subtitle') }}</span>
            </div>

            <div class="masthead__actions anim-soft !flex !items-center !gap-6 lg:!gap-10"
                style="animation-delay: 2500ms">
                <span
                    class="masthead__tagline !hidden md:!block !text-xs !tracking-[0.3em] !text-blue-200/60 uppercase">{{
                        t('aestheticLanding.brand.tagline') }}</span>
                <button type="button"
                    class="masthead__lang !relative !text-xs !font-medium !tracking-widest !uppercase !text-slate-300 hover:!text-amber-200 !transition-colors !duration-500 !py-2"
                    :aria-label="t('aestheticLanding.langToggle')" @click="toggleLang">
                    {{ t('aestheticLanding.langToggle') }}
                    <span
                        class="!absolute !bottom-0 !left-0 !w-full !h-[1px] !bg-amber-200/50 !scale-x-0 hover:!scale-x-100 !transition-transform !duration-500 !origin-right"></span>
                </button>
                <LandingMusicControl class="!scale-90 lg:!scale-100" />
            </div>
        </header>

        <!-- ==================== CONTENT ==================== -->
        <div
            class="layout !relative !z-10 !flex-1 !flex !flex-col lg:!flex-row !items-center !justify-between !gap-12 lg:!gap-24 !px-6 md:!px-12 lg:!px-24 !pt-32 pb-16 lg:!py-0">

            <!-- --- LEAD SECTION --- -->
            <section class="lead !w-full lg:!w-1/2 !flex !flex-col !justify-center !mt-12 lg:!mt-0">

                <div class="eyebrow anim-soft !flex !items-center !gap-4 !mb-6 lg:!mb-8"
                    style="animation-delay: 2500ms">
                    <span class="!h-[1px] !w-12 !bg-blue-300/40"></span>
                    <span class="!text-xs !tracking-[0.4em] !text-blue-200/70 !uppercase">{{
                        t('aestheticLanding.brand.tagline') }}</span>
                </div>

                <h1 class="headline !text-4xl sm:!text-5xl lg:!text-7xl !font-light !leading-[1.1] !text-white !mb-6">
                    <span class="!block !overflow-hidden !pb-2"><span class="!block anim-line"
                            style="animation-delay: 2550ms">{{ t('aestheticLanding.headline.line1') }}</span></span>
                    <span class="!block !overflow-hidden !pb-2">
                        <span
                            class="!block anim-line !bg-clip-text !text-transparent !bg-gradient-to-r !from-amber-100 !via-amber-300 !to-amber-100"
                            :class="{ '!italic': !isRtl }" style="animation-delay: 2700ms">
                            {{ t('aestheticLanding.headline.line2') }}
                        </span>
                    </span>
                    <span class="!block !overflow-hidden !pb-2"><span class="!block anim-line"
                            style="animation-delay: 2850ms">{{ t('aestheticLanding.headline.line3') }}</span></span>
                </h1>

                <p class="lead__text anim-soft !text-base lg:!text-lg !leading-relaxed !text-slate-400 !max-w-xl !font-light"
                    style="animation-delay: 3100ms">
                    {{ t('aestheticLanding.intro') }}
                </p>

                <div class="tags anim-soft !flex !flex-wrap !items-center !gap-3 lg:!gap-4 !mt-8 lg:!mt-10"
                    style="animation-delay: 3300ms">
                    <span
                        class="!px-4 !py-2 !rounded-full !border !border-white/10 !bg-white/5 !backdrop-blur-md !text-xs !tracking-widest !uppercase !text-slate-300">{{
                            t('aestheticLanding.badges.certified') }}</span>
                    <span
                        class="!px-4 !py-2 !rounded-full !border !border-white/10 !bg-white/5 !backdrop-blur-md !text-xs !tracking-widest !uppercase !text-slate-300">{{
                            t('aestheticLanding.badges.privacy') }}</span>
                    <span
                        class="!px-4 !py-2 !rounded-full !border !border-amber-200/20 !bg-amber-900/20 !backdrop-blur-md !text-xs !tracking-widest !uppercase !text-amber-200/90">{{
                            t('aestheticLanding.badges.protocols') }}</span>
                </div>
            </section>

            <!-- --- NAVIGATION RAIL --- -->
            <aside class="!w-full lg:!w-[45%] !max-w-md lg:!max-w-lg !flex !flex-col !justify-center">
                <nav :aria-label="t('aestheticLanding.navLabel')" class="!w-full">
                    <ul class="!flex !flex-col !gap-3 lg:!gap-4">
                        <li v-for="item in railItems" :key="item.key">
                            <a :href="item.href"
                                class="rail__link group anim-soft !relative !flex !items-center !justify-between !p-5 lg:!p-6 !rounded-2xl !bg-white/[0.03] !border !border-white/10 !backdrop-blur-lg hover:!bg-white/[0.08] hover:!border-white/20 !transition-all !duration-500 !overflow-hidden"
                                :style="{ animationDelay: item.delay }" @click="onRailClick($event, item.href)">
                                <!-- Hover Glow Effect -->
                                <div
                                    class="!absolute !inset-0 !bg-gradient-to-r !from-amber-200/0 !via-amber-200/5 !to-amber-200/0 !opacity-0 group-hover:!opacity-100 !translate-x-[-100%] group-hover:!translate-x-[100%] !transition-all !duration-1000 !pointer-events-none">
                                </div>

                                <div class="!flex !items-start !gap-5 lg:!gap-6 !relative !z-10">
                                    <span
                                        class="rail__num !text-sm lg:!text-base !font-mono !text-slate-500 group-hover:!text-amber-300/80 !transition-colors !duration-300 !pt-1">{{
                                        item.num }}</span>
                                    <div class="!flex !flex-col !gap-1 lg:!gap-2">
                                        <span
                                            class="rail__title !text-xl lg:!text-2xl !font-light !text-slate-200 group-hover:!text-white !transition-colors !duration-300">{{
                                            item.title }}</span>
                                        <span
                                            class="rail__sub !text-xs !tracking-widest !uppercase !text-slate-500 group-hover:!text-slate-400 !transition-colors !duration-300">{{
                                            item.sub }}</span>
                                    </div>
                                </div>

                                <!-- Arrow Icon -->
                                <div class="!relative !z-10 !flex !items-center !justify-center !w-10 !h-10 !rounded-full !border !border-white/10 !bg-white/5 group-hover:!bg-amber-200/10 group-hover:!border-amber-200/30 !transition-all !duration-500"
                                    :class="isRtl ? '!rotate-180 group-hover:!-translate-x-1' : 'group-hover:!translate-x-1'">
                                    <svg xmlns="http://www.w3.org/2000/svg"
                                        class="!w-4 !h-4 !text-slate-400 group-hover:!text-amber-200" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </a>
                        </li>
                    </ul>
                </nav>
            </aside>

        </div>

        <!-- ==================== FOOTER ==================== -->
        <footer
            class="footer anim-soft !absolute !bottom-0 !w-full !flex !items-center !justify-between !px-6 md:!px-12 !py-6 !z-20 !text-[0.6rem] !tracking-[0.3em] !uppercase !text-slate-500 !bg-gradient-to-t !from-slate-950 !to-transparent"
            style="animation-delay: 3600ms">
            <span>{{ t('aestheticLanding.footer.consultations') }}</span>
            <span class="!hidden md:!block">© 2026 AESTHETIC</span>
        </footer>

    </main>
</template>

<script setup lang="ts">
// (بخش اسکریپت دقیقا همان کدهای شماست و نیازی به تغییر ندارد)
definePageMeta({ layout: 'landing' })

const { t, isRtl, toggleLang } = useLang()
const { phase } = useTimeOfDayBackground()

const stagePhaseClass = computed(() => (phase.value ? `stage--${phase.value}` : ''))

const railItems = computed(() => [
    { key: 'booking', href: '/booking', num: t('aestheticLanding.rail.booking.num'), title: t('aestheticLanding.rail.booking.title'), sub: t('aestheticLanding.rail.booking.sub'), delay: '2900ms' },
    { key: 'login', href: '/auth/login', num: t('aestheticLanding.rail.login.num'), title: t('aestheticLanding.rail.login.title'), sub: t('aestheticLanding.rail.login.sub'), delay: '3030ms' },
    { key: 'tutorials', href: '#', num: t('aestheticLanding.rail.tutorials.num'), title: t('aestheticLanding.rail.tutorials.title'), sub: t('aestheticLanding.rail.tutorials.sub'), delay: '3160ms' },
    { key: 'blog', href: '#', num: t('aestheticLanding.rail.blog.num'), title: t('aestheticLanding.rail.blog.title'), sub: t('aestheticLanding.rail.blog.sub'), delay: '3290ms' },
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
/* ==================== CORE CSS & ANIMATIONS ==================== */
/* کلاس‌های CSS پایه که مربوط به افکت‌های بک‌گراند و انیمیشن‌ها هستند در اینجا حفظ شده‌اند */

.backdrop__veil {
    background: linear-gradient(100deg,
            color-mix(in oklab, #020617 94%, transparent) 0%,
            color-mix(in oklab, #020617 70%, transparent) 42%,
            color-mix(in oklab, #020617 40%, transparent) 100%);
}

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
    background: radial-gradient(110% 80% at 18% 88%,
            color-mix(in oklab, #1e3a8a 20%, transparent),
            transparent 65%);
}

.backdrop__orb {
    position: absolute;
    top: -10rem;
    right: -8rem;
    width: 46vw;
    height: 46vw;
    border-radius: 50%;
    opacity: 0.4;
    filter: blur(90px);
    background: radial-gradient(circle, color-mix(in oklab, #3b82f6 40%, transparent), transparent 70%);
    will-change: transform;
    animation: orb-float 22s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

.backdrop__orb--champagne {
    top: auto;
    right: auto;
    bottom: -14rem;
    left: -10rem;
    width: 42vw;
    height: 42vw;
    opacity: 0.15;
    background: radial-gradient(circle, #fde68a, transparent 70%);
    animation: orb-float 26s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse;
}

.backdrop__grain {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.backdrop__vignette {
    box-shadow: inset 0 0 200px 50px #020617;
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

@keyframes soft-in {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes line-rise {
    0% {
        opacity: 0;
        filter: blur(10px);
        transform: translateY(100%) rotate(3deg);
    }

    100% {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0) rotate(0);
    }
}

@keyframes orb-float {
    0% {
        transform: translate(0) scale(1);
    }

    50% {
        transform: translate(3%, -4%) scale(1.05);
    }

    100% {
        transform: translate(0) scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {

    .anim-soft,
    .anim-line,
    .backdrop__orb {
        animation: none !important;
        will-change: auto;
    }
}
</style>

<style>
/* ==================== RTL / PERSIAN TYPOGRAPHY ==================== */
.landing-shell[dir="rtl"] .stage .masthead__name,
.landing-shell[dir="rtl"] .stage .masthead__subtitle,
.landing-shell[dir="rtl"] .stage .masthead__tagline,
.landing-shell[dir="rtl"] .stage .eyebrow,
.landing-shell[dir="rtl"] .stage .lead__text,
.landing-shell[dir="rtl"] .stage .tags,
.landing-shell[dir="rtl"] .stage .rail__num,
.landing-shell[dir="rtl"] .stage .rail__sub,
.landing-shell[dir="rtl"] .stage .footer {
    letter-spacing: 0 !important;
}

.landing-shell[dir="rtl"] .stage .masthead__lang span {
    transform-origin: right !important;
}

.landing-shell[dir="rtl"] .stage .headline {
    line-height: 1.4 !important;
    letter-spacing: 0 !important;
}

.landing-shell[dir="rtl"] .stage .rail__title {
    line-height: 1.3 !important;
    letter-spacing: 0 !important;
}
</style>