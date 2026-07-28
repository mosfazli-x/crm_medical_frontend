<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '../composables/Usescrollreveal'

definePageMeta({
  layout: false,
})

useClinicSeo()

const aboutRoot = ref<HTMLElement | null>(null)
const servicesRoot = ref<HTMLElement | null>(null)
const statsRoot = ref<HTMLElement | null>(null)
const doctorsRoot = ref<HTMLElement | null>(null)
const blogRoot = ref<HTMLElement | null>(null)
const appointmentRoot = ref<HTMLElement | null>(null)

useScrollReveal(aboutRoot, { items: '.about-reveal', stagger: 0.12 })
useScrollReveal(servicesRoot, { items: '.service-reveal', stagger: 0.08 })
useScrollReveal(statsRoot, { items: '.stat-reveal', stagger: 0.12 })
useScrollReveal(doctorsRoot, { items: '.doctor-reveal', stagger: 0.1 })
useScrollReveal(blogRoot, { items: '.blog-reveal', stagger: 0.1 })
useScrollReveal(appointmentRoot, { items: '.appt-reveal', stagger: 0.12 })

const services = [
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92L12 22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.57 3.25 3.92" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    title: 'قلب و عروق',
    desc: 'تشخیص و درمان بیماری‌های قلبی با پیشرفته‌ترین تجهیزات اکوکاردیوگرافی و نوار قلب.',
    color: 'from-rose-500/10 to-pink-500/10',
    iconBg: '!bg-rose-50 !text-rose-600',
    number: '۰۱'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M3 21v-2a7 7 0 0 1 14 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    title: 'پوست و زیبایی',
    desc: 'لیزر درمانی، میکرونیدلینگ، بوتاکس و جوانسازی پوست توسط متخصصان مجرب.',
    color: 'from-violet-500/10 to-purple-500/10',
    iconBg: '!bg-violet-50 !text-violet-600',
    number: '۰۲'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M9 12h6M12 9v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/></svg>`,
    title: 'طب عمومی',
    desc: 'ویزیت عمومی، چکاپ سالانه، واکسیناسیون و مراقبت‌های پیشگیرانه برای تمام سنین.',
    color: 'from-emerald-500/10 to-teal-500/10',
    iconBg: '!bg-emerald-50 !text-emerald-600',
    number: '۰۳'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4.5 12.5l3-3 3 3 5-5 3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 21h18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    title: 'آزمایشگاه',
    desc: 'انجام کلیه آزمایش‌های خون، هورمونی و تخصصی با نتایج دقیق و سریع.',
    color: 'from-amber-500/10 to-orange-500/10',
    iconBg: '!bg-amber-50 !text-amber-600',
    number: '۰۴'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" stroke-width="1.6"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    title: 'اورژانس',
    desc: 'بخش اورژانس ۲۴ ساعته با تیم پزشکی آماده و تجهیزات احیای پیشرفته.',
    color: 'from-red-500/10 to-rose-500/10',
    iconBg: '!bg-red-50 !text-red-600',
    number: '۰۵'
  },
  {
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.6"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    title: 'مشاوره تخصصی',
    desc: 'مشاوره آنلاین و حضوری با پزشکان متخصص بدون نیاز به مراجعه حضوری.',
    color: 'from-sky-500/10 to-blue-500/10',
    iconBg: '!bg-sky-50 !text-sky-600',
    number: '۰۶'
  }
]

const doctors = [
  {
    name: 'دکتر هستی حسینی',
    specialty: 'متخصص زنان',
    img: '/images/dr_hosseini_2.webp'
  }
]

const blogPosts = [
  {
    title: '۵ نکته طلایی برای سلامت قلب در زمستان',
    excerpt: 'سرمای زمستان می‌تواند تأثیر مستقیمی بر سلامت قلب و عروق داشته باشد. در این مقاله با راهکارهای پیشگیرانه آشنا شوید.',
    img: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=600&auto=format&fit=crop',
    date: '۱۵ دی ۱۴۰۴',
    readTime: '۵ دقیقه',
    category: 'سلامت قلب'
  },
  {
    title: 'مزایای چکاپ سالانه و پیشگیری از بیماری‌ها',
    excerpt: 'انجام آزمایش‌های دوره‌ای بهترین روش برای شناسایی زودهنگام بیماری‌ها و حفظ سلامت عمومی است.',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop',
    date: '۳ دی ۱۴۰۴',
    readTime: '۴ دقیقه',
    category: 'پیشگیری'
  },
  {
    title: 'جوانسازی پوست با روش‌های نوین غیرتهاجمی',
    excerpt: 'با پیشرفت تکنولوژی، روش‌های جدیدی برای جوانسازی پوست بدون نیاز به جراحی ارائه شده است.',
    img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600&auto=format&fit=crop',
    date: '۲۵ آذر ۱۴۰۴',
    readTime: '۶ دقیقه',
    category: 'زیبایی'
  }
]

const features = [
  { icon: '⏰', title: 'ساعات طولانی', desc: 'شنبه تا چهارشنبه از ۸ صبح تا ۸ شب' },
  { icon: '📞', title: 'مشاوره تلفنی', desc: 'مشاوره رایگان با پزشکان متخصص' },
  { icon: '🏥', title: 'تجهیزات مدرن', desc: 'پیشرفته‌ترین دستگاه‌های پزشکی' },
  { icon: '💊', title: 'داروخانه اختصاصی', desc: 'داروخانه مجهز در محل کلینیک' },
]
</script>

<template>
  <div>
    <TheHeader />

    <!-- ════════════════ HERO ════════════════ -->
    <HeroSection />

    <!-- ════════════════ FEATURES MARQUEE ════════════════ -->
    <section class="!relative !py-2 sm:!py-4 !overflow-hidden !bg-sand-100/80 !border-y !border-ink/5">
      <div class="marquee-track !py-2 sm:!py-3">
        <div v-for="(f, i) in [...features, ...features]" :key="i" class="!flex !items-center !gap-2 sm:!gap-3 !shrink-0 !px-4 sm:!px-6">
          <span class="!text-base sm:!text-lg">{{ f.icon }}</span>
          <span class="!text-xs sm:!text-sm !font-semibold !text-ink/70">{{ f.title }}</span>
          <span class="!text-xs !text-muted hidden sm:inline">—</span>
          <span class="!text-xs sm:!text-sm !text-muted">{{ f.desc }}</span>
        </div>
      </div>
    </section>

    <!-- ════════════════ ABOUT ════════════════ -->
    <section id="about" ref="aboutRoot" class="!py-16 sm:!py-20 md:!py-24 lg:!py-32 flex justify-center align-middle items-center px-6!">
      <div class="!container !grid !grid-cols-1 lg:!grid-cols-2 !items-center !gap-10 sm:!gap-14 md:!gap-16 lg:!gap-20">
        <div class="about-reveal">
          <span class="!inline-flex !items-center !gap-2 !rounded-full !border !border-emerald/20 !bg-emerald-mist/60 !px-4 sm:!px-5 !py-1.5 sm:!py-2 !text-xs !font-semibold !text-emerald-deep !tracking-wide">
            <span class="!h-1.5 !w-1.5 !rounded-full !bg-emerald-bright animate-pulseDot" />
            درباره کلینیک دکتر حسینی
          </span>
          <h2 class="!mt-5 sm:!mt-6 !font-display !text-2xl sm:!text-3xl md:!text-display-lg !font-black !text-ink !tracking-tight">
            تجربه‌ای متفاوت از
            <span class="gradient-text">مراقبت پزشکی</span>
          </h2>
          <p class="!mt-4 sm:!mt-6 !text-sm sm:!text-base md:!text-lg !leading-7 sm:!leading-8 !text-muted !max-w-lg">
            کلینیک دکتر حسینی با هدف ارائه خدمات پزشکی در سطح بین‌المللی تأسیس شده است. ما باور داریم که هر بیمار حق دارد در محیطی آرام، مدرن و حرفه‌ای تحت درمان قرار گیرد.
          </p>
          <p class="!mt-3 sm:!mt-4 !text-sm sm:!text-base !leading-7 !text-muted !max-w-lg">
            تیم پزشکی ما متشکل از برترین متخصصان هر رشته است که با بهره‌گیری از جدیدترین پروتکل‌های درمانی، بهترین نتیجه ممکن را برای شما تضمین می‌کنند.
          </p>

          <!-- Feature list -->
          <div class="!mt-6 sm:!mt-8 !grid !grid-cols-1 sm:!grid-cols-2 !gap-3 sm:!gap-4">
            <div v-for="(f, i) in features.slice(0, 4)" :key="i" class="!flex !items-center !gap-3 !rounded-2xl !bg-sand-100/80 !px-3 sm:!px-4 !py-2.5 sm:!py-3">
              <span class!text-base sm:!text-lg>{{ f.icon }}</span>
              <span class="!text-xs sm:!text-sm !font-medium !text-ink/80">{{ f.title }}</span>
            </div>
          </div>

          <div class="!mt-8 sm:!mt-10 !flex !flex-wrap !gap-3 sm:!gap-4 justify-center align-middle items-center">
            <MagneticButton as="a" href="#services" variant="outline" :icon="false">
              مشاهده خدمات
            </MagneticButton>
            <MagneticButton as="a" href="#appointment" variant="solid" :icon="false">
              رزرو مشاوره
            </MagneticButton>
          </div>
        </div>

        <div class="about-reveal !relative">
          <div class="!overflow-hidden !rounded-3xl sm:!rounded-4xl !shadow-floaty image-reveal image-professional">
            <NuxtImg
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop"
              alt="محیط داخلی کلینیک دکتر حسینی"
              class="!h-full !w-full !object-cover !aspect-[4/3] !transition-transform !duration-700 hover:!scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
            />
          </div>
          <!-- Floating experience badge -->
          <div class="glass-surface !absolute !-bottom-6 sm:!-bottom-8 !left-4 sm:!left-auto sm:!right-[-1rem] md:!right-[-2rem] lg:!right-[-2rem] !z-10 !rounded-2xl sm:!rounded-3xl !p-4 sm:!p-6 !card-glow card-shimmer-border floating-badge">
            <div class="!flex !items-center !gap-2 sm:!gap-3">
              <span class="!flex !h-10 !w-10 sm:!h-12 sm:!w-12 !items-center !justify-center !rounded-xl sm:!rounded-2xl !bg-emerald-mist">
                <span class="!font-display !text-lg sm:!text-xl !font-black !text-emerald-deep">+</span>
              </span>
              <div>
                <p class="!font-display !text-xl sm:!text-2xl !font-black !text-emerald-deep tabular-nums">۱۰</p>
                <p class="!text-[10px] sm:!text-xs !text-muted !font-medium">سال تجربه درخشان</p>
              </div>
            </div>
          </div>
          <!-- Decorative dots -->
          <div class="!absolute !-top-6 !-left-6 !hidden lg:!grid !grid-cols-3 !gap-2">
            <span v-for="n in 9" :key="n" class="!h-2 !w-2 !rounded-full !bg-emerald/10" />
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════ SECTION DIVIDER ════════════════ -->
    <div class="!container"><div class="section-divider-animated" /></div>

    <!-- ════════════════ SERVICES ════════════════ -->
    <section id="services" ref="servicesRoot" class="!py-16 sm:!py-20 md:!py-24 lg:!py-32 flex justify-center align-middle items-center !bg-sand-100">
      <div class="!container">
        <div class="service-reveal !text-center !max-w-2xl !mx-auto !mb-10 sm:!mb-12 md:!mb-16">
          <span class="!inline-flex !items-center !gap-2 !rounded-full !border !border-ink/10 !bg-white/80 !px-4 sm:!px-5 !py-1.5 sm:!py-2 !text-xs !font-semibold !text-emerald-deep !tracking-wide">
            <span class="!h-1.5 !w-1.5 !rounded-full !bg-emerald-bright animate-pulseDot" />
            خدمات ما
          </span>
          <h2 class="!mt-5 sm:!mt-6 !font-display !text-2xl sm:!text-3xl md:!text-display-lg !font-black !text-ink !tracking-tight">
            طیف گسترده‌ای از خدمات
            <span class="gradient-text">تخصصی</span>
          </h2>
          <p class="!mt-4 sm:!mt-5 !text-sm sm:!text-base md:!text-lg !text-muted !leading-7 sm:!leading-8">
            کلینیک دکتر حسینی مجموعه کاملی از خدمات پزشکی، تشخیصی و درمانی را در محیطی مدرن و آرام ارائه می‌دهد.
          </p>
        </div>

        <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4 sm:!gap-5 md:!gap-6 px-6!">
          <GlassCard
            v-for="(service, i) in services"
            :key="i"
            tilt
            padding="!p-0"
            class="service-reveal !overflow-hidden card-shimmer-border"
          >
            <div class="!p-5 sm:!p-6 md:!p-7">
              <div class="!flex !items-center !justify-between !mb-4 sm:!mb-5">
                <div class="!flex !h-11 !w-11 sm:!h-12 sm:!w-12 md:!h-14 md:!w-14 !items-center !justify-center !rounded-xl sm:!rounded-2xl !transition-all !duration-300 hover:!scale-110 hover:!shadow-lg" :class="service.iconBg">
                  <span v-html="service.icon" />
                </div>
                <span class="!font-display !text-xs !font-bold !text-ink/15 !tracking-wider">{{ service.number }}</span>
              </div>
              <h3 class="!font-display !text-base sm:!text-lg !font-bold !text-ink">{{ service.title }}</h3>
              <p class="!mt-2 sm:!mt-2.5 !text-xs sm:!text-sm !leading-6 sm:!leading-7 !text-muted">{{ service.desc }}</p>
            </div>
            <div class="!h-1 !w-full !bg-gradient-to-r !to-transparent !transition-all !duration-500" :class="service.color" />
          </GlassCard>
        </div>
      </div>
    </section>

    <!-- ════════════════ STATS ════════════════ -->
    <section id="stats" ref="statsRoot" class="!py-16 sm:!py-20 md:!py-24 lg:!py-32 flex justify-center align-middle items-center !overflow-hidden">
      <div class="!container">
        <div class="stat-reveal !text-center !max-w-2xl !mx-auto !mb-10 sm:!mb-12 md:!mb-16">
          <span class="!inline-flex !items-center !gap-2 !rounded-full !border !border-emerald/20 !bg-emerald-mist/60 !px-4 sm:!px-5 !py-1.5 sm:!py-2 !text-xs !font-semibold !text-emerald-deep !tracking-wide">
            اعداد و ارقام
          </span>
          <h2 class="!mt-5 sm:!mt-6 !font-display !text-2xl sm:!text-3xl md:!text-display-lg !font-black !text-ink !tracking-tight">
            آمار <span class="gradient-text">عملکرد</span> ما
          </h2>
        </div>

        <div class="!grid !grid-cols-2 md:!grid-cols-4 !gap-6 sm:!gap-8 md:!gap-10 lg:!gap-16">
          <div class="stat-reveal">
            <AnimatedCounter :end="15" suffix="+" label="پزشک متخصص" />
          </div>
          <div class="stat-reveal">
            <AnimatedCounter :end="10" suffix=" سال" label="تجربه بالینی" />
          </div>
          <div class="stat-reveal">
            <AnimatedCounter :end="98" suffix="٪" label="رضایت بیماران" />
          </div>
          <div class="stat-reveal">
            <AnimatedCounter :end="12000" suffix="+" label="بیمار موفق" />
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════ SECTION DIVIDER ════════════════ -->
    <div class="!container"><div class="section-divider-animated" /></div>

    <!-- ════════════════ DOCTORS ════════════════ -->
    <section id="doctors" ref="doctorsRoot" class="!py-16 sm:!py-20 md:!py-24 lg:!py-32 flex justify-center align-middle items-center !bg-sand-100 px-6!">
      <div class="!container">
        <div class="doctor-reveal !text-center !max-w-2xl !mx-auto !mb-10 sm:!mb-12 md:!mb-16">
          <span class="!inline-flex !items-center !gap-2 !rounded-full !border !border-ink/10 !bg-white/80 !px-4 sm:!px-5 !py-1.5 sm:!py-2 !text-xs !font-semibold !text-emerald-deep !tracking-wide">
            <span class="!h-1.5 !w-1.5 !rounded-full !bg-emerald-bright animate-pulseDot" />
            تیم پزشکی
          </span>
          <h2 class="!mt-5 sm:!mt-6 !font-display !text-2xl sm:!text-3xl md:!text-display-lg !font-black !text-ink !tracking-tight">
            پزشکان
            <span class="gradient-text">متخصص</span> ما
          </h2>
          <p class="!mt-4 sm:!mt-5 !text-sm sm:!text-base md:!text-lg !text-muted !leading-7 sm:!leading-8">
            تیم حرفه‌ای و مجرب کلینیک دکتر حسینی با سال‌ها تجربه در خدمت سلامت شما هستند.
          </p>
        </div>

        <div class="!grid !grid-cols-2 sm:!grid-cols-2 lg:!grid-cols-4 !gap-3 sm:!gap-4 md:!gap-6">
          <GlassCard
            v-for="(doc, i) in doctors"
            :key="i"
            tilt
            padding="!p-0"
            class="doctor-reveal !overflow-hidden card-shimmer-border"
          >
            <div class="!aspect-[3/4] !overflow-hidden !relative">
              <NuxtImg
                :src="doc.img"
                :alt="doc.name"
                class="!h-full !w-full !object-cover !transition-all !duration-700 hover:!scale-110"
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 300px"
              />
              <!-- Overlay: always visible on touch, hover on desktop -->
              <div class="!absolute !inset-0 !bg-gradient-to-t !from-ink/60 !via-ink/10 !to-transparent !opacity-100 lg:!opacity-0 lg:group-hover:!opacity-100 !transition-opacity !duration-500 !flex !items-end !p-3 sm:!p-4 md:!p-5">
                <span class="!text-xs sm:!text-sm !text-white !font-medium !transition-opacity !duration-500 !delay-100">مشاهده پروفایل</span>
              </div>
            </div>
            <div class="!p-3 sm:!p-4 md:!p-5">
              <h3 class="!font-display !text-xs sm:!text-sm md:!text-base !font-bold !text-ink">{{ doc.name }}</h3>
              <p class="!mt-1 !text-[10px] sm:!text-xs md:!text-sm !text-emerald-deep !font-medium">{{ doc.specialty }}</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>

    <!-- ════════════════ BLOG ════════════════ -->
    <section id="blog" ref="blogRoot" class="!py-16 sm:!py-20 md:!py-24 lg:!py-32 flex justify-center align-middle items-center px-6!">
      <div class="!container">
        <div class="blog-reveal !text-center !max-w-2xl !mx-auto !mb-10 sm:!mb-12 md:!mb-16">
          <span class="!inline-flex !items-center !gap-2 !rounded-full !border !border-emerald/20 !bg-emerald-mist/60 !px-4 sm:!px-5 !py-1.5 sm:!py-2 !text-xs !font-semibold !text-emerald-deep !tracking-wide">
            <span class="!h-1.5 !w-1.5 !rounded-full !bg-emerald-bright animate-pulseDot" />
            مقالات و اخبار
          </span>
          <h2 class="!mt-5 sm:!mt-6 !font-display !text-2xl sm:!text-3xl md:!text-display-lg !font-black !text-ink !tracking-tight">
            آخرین <span class="gradient-text">مقالات</span> پزشکی
          </h2>
          <p class="!mt-4 sm:!mt-5 !text-sm sm:!text-base md:!text-lg !text-muted !leading-7 sm:!leading-8">
            مقالات آموزشی و بهداشتی توسط تیم پزشکی کلینیک دکتر حسینی برای افزایش آگاهی سلامت شما.
          </p>
        </div>

        <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-4 sm:!gap-5 md:!gap-6">
          <GlassCard
            v-for="(post, i) in blogPosts"
            :key="i"
            tilt
            padding="!p-0"
            class="blog-reveal !overflow-hidden card-shimmer-border"
          >
            <div class="!aspect-[16/10] !overflow-hidden !relative">
              <NuxtImg
                :src="post.img"
                :alt="post.title"
                class="!h-full !w-full !object-cover !transition-all !duration-700 hover:!scale-110"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
              <span class="!absolute !top-3 sm:!top-4 !right-3 sm:!right-4 !rounded-full !bg-white/90 !backdrop-blur-sm !px-2.5 sm:!px-3 !py-0.5 sm:!py-1 !text-[10px] sm:!text-xs !font-semibold !text-emerald-deep !shadow-soft">
                {{ post.category }}
              </span>
            </div>
            <div class="!p-4 sm:!p-5 md:!p-6">
              <div class="!flex !items-center !gap-2 sm:!gap-3 !mb-2 sm:!mb-3">
                <span class="!text-[10px] sm:!text-xs !text-muted !font-medium">{{ post.date }}</span>
                <span class="!h-1 !w-1 !rounded-full !bg-emerald-bright" />
                <span class="!text-[10px] sm:!text-xs !text-emerald-deep !font-medium">{{ post.readTime }}</span>
              </div>
              <h3 class="!font-display !text-sm sm:!text-base !font-bold !text-ink !leading-6 sm:!leading-7">{{ post.title }}</h3>
              <p class="!mt-2 !text-xs sm:!text-sm !leading-6 sm:!leading-7 !text-muted">{{ post.excerpt }}</p>
              <MagneticButton as="a" href="#" variant="ghost" class="!mt-3 sm:!mt-5 !px-4 sm:!px-5 !py-2 sm:!py-2.5 !text-xs sm:!text-sm">
                ادامه مطلب
              </MagneticButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>

    <!-- ════════════════ APPOINTMENT ════════════════ -->
    <section id="appointment" ref="appointmentRoot" class="!relative !py-16 sm:!py-20 md:!py-24 lg:!py-32 flex justify-center align-middle items-center !bg-ink !text-white !overflow-hidden px-6!">
      <!-- Animated gradient background -->
      <div class="!pointer-events-none !absolute !inset-0">
        <div class="!absolute !top-0 !right-0 !h-48 !w-48 sm:!h-64 sm:!w-64 md:!h-96 md:!w-96 !rounded-full !bg-emerald/5 !blur-3xl animate-floaty-slow" />
        <div class="!absolute !bottom-0 !left-0 !h-40 !w-40 sm:!h-52 sm:!w-52 md:!h-64 md:!w-64 !rounded-full !bg-emerald-bright/5 !blur-3xl animate-floaty" />
        <div class="!absolute !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2 !h-[250px] !w-[250px] sm:!h-[350px] sm:!w-[350px] md:!h-[500px] md:!w-[500px] !rounded-full !bg-emerald/3 !blur-3xl animate-float-gentle" />
        <div class="!absolute !inset-0 !opacity-[0.03]" style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0); background-size: 40px 40px;" />
      </div>

      <div class="!container !grid !grid-cols-1 lg:!grid-cols-2 !items-center !gap-10 sm:!gap-12 md:!gap-16 !relative !z-10">
        <div class="appt-reveal">
          <span class="!inline-flex !items-center !gap-2 !rounded-full !border !border-white/15 !bg-white/5 !px-4 sm:!px-5 !py-1.5 sm:!py-2 !text-xs !font-semibold !text-emerald-bright !tracking-wide !backdrop-blur">
            <span class="!relative !h-2 !w-2 !rounded-full !bg-emerald-bright">
              <span class="!absolute !inset-0 !rounded-full !bg-emerald-bright animate-pulse-ring" />
            </span>
            رزرو نوبت
          </span>
          <h2 class="!mt-5 sm:!mt-6 !font-display !text-2xl sm:!text-3xl md:!text-display-lg !font-black !text-white !leading-[1.05] sm:!leading-[1.02] !tracking-tight">
            نوبت خود را
            <span class="!text-emerald-bright">آنلاین</span> رزرو کنید
          </h2>
          <p class="!mt-4 sm:!mt-6 !text-sm sm:!text-base md:!text-lg !leading-7 sm:!leading-8 !text-white/50 !max-w-lg">
            در کمتر از ۶۰ ثانیه نوبت خود را رزرو کنید. تیم ما در اسرع وقت با شما تماس خواهد گرفت تا وقت مناسب را هماهنگ کند.
          </p>

          <div class="!mt-8 sm:!mt-10 !flex !flex-col !gap-4 sm:!gap-5">
            <div class="!flex !items-center !gap-3 sm:!gap-4 !group">
              <span class="!flex !h-10 !w-10 sm:!h-12 sm:!w-12 !items-center !justify-center !rounded-xl sm:!rounded-2xl !bg-white/5 !border !border-white/10 !shrink-0 !transition-all !duration-300 group-hover:!bg-emerald/10 group-hover:!border-emerald/20 group-hover:!shadow-[0_0_20px_rgba(62,232,168,0.15)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="sm:!w-[18px] sm:!h-[18px]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <div>
                <p class="!text-[10px] sm:!text-sm !text-white/40 !font-medium">تلفن تماس</p>
                <p class="!text-sm sm:!text-base !font-semibold !text-white !transition-colors !duration-300 group-hover:!text-emerald-bright">۰۲۱-۱۲۳۴۵۶۷۸</p>
              </div>
            </div>
            <div class="!flex !items-center !gap-3 sm:!gap-4 !group">
              <span class="!flex !h-10 !w-10 sm:!h-12 sm:!w-12 !items-center !justify-center !rounded-xl sm:!rounded-2xl !bg-white/5 !border !border-white/10 !shrink-0 !transition-all !duration-300 group-hover:!bg-emerald/10 group-hover:!border-emerald/20 group-hover:!shadow-[0_0_20px_rgba(62,232,168,0.15)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="sm:!w-[18px] sm:!h-[18px]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.6"/></svg>
              </span>
              <div>
                <p class="!text-[10px] sm:!text-sm !text-white/40 !font-medium">آدرس</p>
                <p class="!text-sm sm:!text-base !font-semibold !text-white !transition-colors !duration-300 group-hover:!text-emerald-bright">تهران، خیابان ولیعصر، بین چهارراه پارک‌وی و جردن</p>
              </div>
            </div>
            <div class="!flex !items-center !gap-3 sm:!gap-4 !group">
              <span class="!flex !h-10 !w-10 sm:!h-12 sm:!w-12 !items-center !justify-center !rounded-xl sm:!rounded-2xl !bg-white/5 !border !border-white/10 !shrink-0 !transition-all !duration-300 group-hover:!bg-emerald/10 group-hover:!border-emerald/20 group-hover:!shadow-[0_0_20px_rgba(62,232,168,0.15)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="sm:!w-[18px] sm:!h-[18px]"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6"/><path d="M12 6v6l4 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
              </span>
              <div>
                <p class="!text-[10px] sm:!text-sm !text-white/40 !font-medium">ساعات کاری</p>
                <p class="!text-sm sm:!text-base !font-semibold !text-white !transition-colors !duration-300 group-hover:!text-emerald-bright">شنبه تا چهارشنبه ۸ صبح تا ۸ شب</p>
              </div>
            </div>
          </div>
        </div>

        <div class="appt-reveal">
          <div class="form-glass !rounded-2xl sm:!rounded-3xl !p-5 sm:!p-6 md:!p-8">
            <form class="!flex !flex-col !gap-4 sm:!gap-5" @submit.prevent>
              <div>
                <label class="!mb-1.5 sm:!mb-2 !block !text-xs sm:!text-sm !text-white/60 !font-medium">نام و نام خانوادگی</label>
                <input
                  type="text"
                  placeholder="نام خود را وارد کنید"
                  class="input-professional !w-full !rounded-xl !border !border-white/15 !bg-white/5 !px-3.5 sm:!px-4 !py-3 sm:!py-3.5 !text-sm !text-white !placeholder-white/30 !outline-none !transition-all !duration-300 focus:!border-emerald-bright focus:!bg-white/8"
                />
              </div>
              <div>
                <label class="!mb-1.5 sm:!mb-2 !block !text-xs sm:!text-sm !text-white/60 !font-medium">شماره تماس</label>
                <input
                  type="tel"
                  placeholder="۰۹۱۲XXXXXXX"
                  class="input-professional !w-full !rounded-xl !border !border-white/15 !bg-white/5 !px-3.5 sm:!px-4 !py-3 sm:!py-3.5 !text-sm !text-white !placeholder-white/30 !outline-none !transition-all !duration-300 focus:!border-emerald-bright focus:!bg-white/8"
                />
              </div>
              <div>
                <label class="!mb-1.5 sm:!mb-2 !block !text-xs sm:!text-sm !text-white/60 !font-medium">خدمت مورد نظر</label>
                <select class="input-professional !w-full !rounded-xl !border !border-white/15 !bg-white/5 !px-3.5 sm:!px-4 !py-3 sm:!py-3.5 !text-sm !text-white !outline-none !transition-all !duration-300 focus:!border-emerald-bright focus:!bg-white/8">
                  <option value="" disabled selected class="!text-ink">انتخاب کنید</option>
                  <option value="cardiology" class="!text-ink">قلب و عروق</option>
                  <option value="dermatology" class="!text-ink">پوست و زیبایی</option>
                  <option value="general" class="!text-ink">طب عمومی</option>
                  <option value="lab" class="!text-ink">آزمایشگاه</option>
                  <option value="emergency" class="!text-ink">اورژانس</option>
                  <option value="consult" class="!text-ink">مشاوره تخصصی</option>
                </select>
              </div>
              <div>
                <label class="!mb-1.5 sm:!mb-2 !block !text-xs sm:!text-sm !text-white/60 !font-medium">توضیحات (اختیاری)</label>
                <textarea
                  rows="3"
                  placeholder="توضیحات خود را بنویسید..."
                  class="input-professional !w-full !rounded-xl !border !border-white/15 !bg-white/5 !px-3.5 sm:!px-4 !py-3 sm:!py-3.5 !text-sm !text-white !placeholder-white/30 !outline-none !transition-all !duration-300 focus:!border-emerald-bright focus:!bg-white/8 !resize-none"
                />
              </div>
              <MagneticButton as="button" variant="solid" class="!justify-center !bg-emerald-deep hover:!bg-emerald !w-full !py-3.5 sm:!py-4 !text-sm sm:!text-base !font-bold !shadow-[0_8px_24px_-4px_rgba(15,92,67,0.4)] hover:!shadow-[0_12px_32px_-4px_rgba(15,92,67,0.5)]">
                ارسال درخواست
              </MagneticButton>
            </form>
          </div>
        </div>
      </div>
    </section>

    <TheFooter />
  </div>
</template>
