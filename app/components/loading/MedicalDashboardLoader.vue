<template>
  <Transition name="loader-exit" @after-leave="$emit('finished')">
    <div v-if="rendered" :dir="isRtl ? 'rtl' : 'ltr'"
      class="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden dark:bg-slate-950 bg-white"
      role="status" aria-live="polite" :aria-label="translatedStatuses[currentIndex]">
      <div ref="threeContainer" class="absolute inset-0 pointer-events-none"></div>
      <div
        class="absolute inset-0 bg-gradient-to-b dark:from-slate-950/50 dark:via-transparent dark:to-slate-950/90 from-white/40 via-transparent to-white/80">
      </div>
      <div
        class="absolute inset-0 bg-gradient-to-r dark:from-slate-950/30 dark:via-transparent dark:to-slate-950/30 from-white/20 via-transparent to-white/20">
      </div>
      <div ref="cardRef"
        class="relative z-10 flex flex-col w-[min(88vw,400px)] rounded-3xl border dark:border-white/[0.06] border-slate-200/80 dark:bg-slate-900/60 bg-white/80 shadow-2xl dark:shadow-indigo-500/10 shadow-indigo-200/50 overflow-hidden"
        style="backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);">
        <div class="flex flex-col items-center gap-8 w-full px-8 py-10">
          <div ref="logoRef" class="flex items-center gap-3">
            <div class="relative flex-shrink-0">
              <img src="../../assets/images/hastihoseinilogoBlack.png" class="h-11">
              <div class="absolute -inset-1 rounded-xl bg-indigo-500/10 blur-md -z-10"></div>
            </div>
            <span class="text-md font-bold tracking-tight dark:text-slate-100/90 text-slate-800">{{ resolvedClinicName
            }}</span>
          </div>

          <div class="w-full">
            <div ref="lottieRef" class="mx-auto w-3/4" style="aspect-ratio: 1/1; max-height: 150px;" />
          </div>

          <div ref="statusRef" class="flex flex-col items-center gap-1">
            <Transition name="status-fade" mode="out-in">
              <p :key="currentIndex" class="text-sm font-medium text-center dark:text-slate-300/90 text-slate-600">
                <span class="text-indigo-400">✦</span>
                {{ translatedStatuses[currentIndex] }}
              </p>
            </Transition>
            <div class="flex gap-1.5 mt-1" :class="isRtl ? 'flex-row-reverse' : ''">
              <span v-for="i in translatedStatuses.length" :key="i" class="h-1 rounded-full transition-all duration-500"
                :class="i - 1 === currentIndex
                  ? 'w-5 bg-indigo-400'
                  : i - 1 < currentIndex
                    ? 'w-1.5 bg-indigo-400/40'
                    : 'w-1.5 dark:bg-slate-600/50 bg-slate-300/70'" />
            </div>
          </div>
        </div>

        <div class="h-[3px] transition-all duration-500 ease-out" :style="{
          width: progress + '%',
          background: 'linear-gradient(90deg, #818cf8, #6366f1, #4F46E5)',
        }" />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import gsap from 'gsap'
import { useLoadingSequence } from '~/composables/useLoadingSequence'
import ClinicLogo from '~/components/icons/ClinicLogo.vue'

const props = withDefaults(defineProps<{
  show: boolean
  clinicName?: string
}>(), {
  clinicName: '',
})

const emit = defineEmits<{ (e: 'finished'): void }>()

const { t, locale } = useI18n()

const resolvedClinicName = computed(() => props.clinicName || t('landing.loading.clinicName'))
const { isDark } = useThemeMode()

const isRtl = computed(() => locale.value === 'fa')

const translatedStatuses = computed(() => [
  t('landing.loading.status1'),
  t('landing.loading.status2'),
  t('landing.loading.status3'),
  t('landing.loading.status4'),
  t('landing.loading.status5'),
  t('landing.loading.status6'),
])

const {
  currentIndex,
  progress,
  start: startSequence,
  stop: stopSequence,
  finish: finishSequence,
} = useLoadingSequence()

const rendered = ref(true)
const threeContainer = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
const logoRef = ref<HTMLElement | null>(null)
const lottieRef = ref<HTMLElement | null>(null)
const statusRef = ref<HTMLElement | null>(null)
let lottieAnim: any = null

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let dnaGroup: THREE.Group | null = null
let particleSystem: THREE.Points | null = null
let networkLines: THREE.LineSegments | null = null
let animId = 0
let finishTimer: ReturnType<typeof setTimeout> | null = null
let resizeObs: ResizeObserver | null = null
let mouseX = 0
let mouseY = 0

const COLORS = { primary: '#6366f1', secondary: '#818cf8', accent: '#4F46E5' }

function applyThemeToScene() {
  if (!scene) return
  const dark = isDark.value
  if (dnaGroup) {
    dnaGroup.children.forEach((child) => {
      if (child instanceof THREE.Points) {
        ; (child.material as THREE.Material).opacity = dark ? 0.9 : 0.7
      } else if (child instanceof THREE.LineSegments) {
        ; (child.material as THREE.Material).opacity = dark ? 0.25 : 0.35
      }
    })
  }
  if (particleSystem) {
    ; (particleSystem.material as THREE.Material).opacity = dark ? 0.4 : 0.35
  }
  if (networkLines) {
    ; (networkLines.material as THREE.Material).opacity = dark ? 0.06 : 0.12
  }
}

function createDNA(): THREE.Group {
  const group = new THREE.Group()
  const levels = 30
  const turns = 3
  const radius = 0.7
  const height = 2.8

  const strandPositions: number[] = []
  const rungPositions: number[] = []

  for (let i = 0; i < levels; i++) {
    const t = i / (levels - 1)
    const angle = t * Math.PI * 2 * turns
    const y = (t - 0.5) * height
    const x1 = Math.cos(angle) * radius
    const z1 = Math.sin(angle) * radius
    const x2 = Math.cos(angle + Math.PI) * radius
    const z2 = Math.sin(angle + Math.PI) * radius
    strandPositions.push(x1, y, z1)
    strandPositions.push(x2, y, z2)
    if (i < levels - 1) {
      rungPositions.push(x1, y, z1)
      rungPositions.push(x2, y, z2)
    }
  }

  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.Float32BufferAttribute(strandPositions, 3))
  const pMat = new THREE.PointsMaterial({
    color: COLORS.primary,
    size: 0.09,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
  })
  group.add(new THREE.Points(pGeo, pMat))

  const lGeo = new THREE.BufferGeometry()
  lGeo.setAttribute('position', new THREE.Float32BufferAttribute(rungPositions, 3))
  const lMat = new THREE.LineBasicMaterial({
    color: COLORS.secondary,
    transparent: true,
    opacity: 0.25,
  })
  group.add(new THREE.LineSegments(lGeo, lMat))

  return group
}

function createParticles(): { points: THREE.Points; lines: THREE.LineSegments } {
  const count = 120
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 10
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const pMat = new THREE.PointsMaterial({
    color: COLORS.secondary,
    size: 0.035,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.4,
  })
  const points = new THREE.Points(pGeo, pMat)

  const conn: number[] = []
  for (let i = 0; i < count; i++) {
    for (let j = i + 1; j < count; j++) {
      const i3 = i * 3
      const j3 = j * 3
      const dx = positions[i3]! - positions[j3]!
      const dy = positions[i3 + 1]! - positions[j3 + 1]!
      const dz = positions[i3 + 2]! - positions[j3 + 2]!
      if (dx * dx + dy * dy + dz * dz < 3.5) {
        conn.push(positions[i3]!, positions[i3 + 1]!, positions[i3 + 2]!)
        conn.push(positions[j3]!, positions[j3 + 1]!, positions[j3 + 2]!)
      }
    }
  }
  const lGeo = new THREE.BufferGeometry()
  lGeo.setAttribute('position', new THREE.Float32BufferAttribute(conn, 3))
  const lMat = new THREE.LineBasicMaterial({
    color: COLORS.accent,
    transparent: true,
    opacity: 0.06,
  })
  const lines = new THREE.LineSegments(lGeo, lMat)
  return { points, lines }
}

function initScene() {
  if (!threeContainer.value) return
  const c = threeContainer.value
  const w = c.clientWidth || window.innerWidth
  const h = c.clientHeight || window.innerHeight

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100)
  camera.position.set(0, 0.3, 5)

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.6
  c.appendChild(renderer.domElement)

  const ambient = new THREE.AmbientLight(0x4444aa, 0.4)
  scene.add(ambient)
  const key = new THREE.DirectionalLight(0xccddff, 1.5)
  key.position.set(2, 3, 4)
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x8888ff, 0.5)
  fill.position.set(-3, 1, -2)
  scene.add(fill)

  dnaGroup = createDNA()
  dnaGroup.position.y = 0.2
  scene.add(dnaGroup)

  const { points, lines } = createParticles()
  particleSystem = points
  networkLines = lines
  scene.add(points)
  scene.add(lines)
}

function animate() {
  if (!scene || !renderer || !camera || !dnaGroup) return
  const time = performance.now() * 0.001
  dnaGroup.rotation.x = Math.sin(time * 0.08) * 0.05
  dnaGroup.rotation.y = time * 0.15
  if (particleSystem) {
    particleSystem.rotation.y = time * 0.01
    particleSystem.rotation.x = Math.sin(time * 0.005) * 0.02
  }
  if (networkLines) {
    networkLines.rotation.y = time * 0.01
    networkLines.rotation.x = Math.sin(time * 0.005) * 0.02
  }
  if (mouseX || mouseY) {
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02
    camera.position.y += (mouseY * 0.2 + 0.3 - camera.position.y) * 0.02
    camera.lookAt(0, 0.2, 0)
  } else {
    camera.position.x += (0 - camera.position.x) * 0.02
    camera.position.y += (0.3 - camera.position.y) * 0.02
    camera.lookAt(0, 0.2, 0)
  }
  renderer.render(scene, camera)
  animId = requestAnimationFrame(animate)
}

function handleResize() {
  if (!threeContainer.value || !camera || !renderer) return
  const w = threeContainer.value.clientWidth || window.innerWidth
  const h = threeContainer.value.clientHeight || window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

function handleMouseMove(e: MouseEvent) {
  const w = window.innerWidth
  const h = window.innerHeight
  mouseX = (e.clientX / w - 0.5) * 2
  mouseY = (e.clientY / h - 0.5) * 2
}

function initAnimations() {
  if (!cardRef.value) return
  const mm = gsap.matchMedia()
  const reduced = '(prefers-reduced-motion: no-preference)'
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  mm.add(reduced, () => {
    gsap.set([cardRef.value, logoRef.value, lottieRef.value, statusRef.value], {
      opacity: 0, y: 24,
    })
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
    tl.to(cardRef.value, { opacity: 1, y: 0 })
    tl.to(logoRef.value, { opacity: 1, y: 0 }, '-=0.4')
    tl.to(lottieRef.value, { opacity: 1, y: 0 }, '-=0.35')
    tl.to(statusRef.value, { opacity: 1, y: 0 }, '-=0.3')

    if (logoRef.value) {
      gsap.to(logoRef.value, {
        y: -4,
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }
  })

  if (prefersReduced) {
    gsap.set([cardRef.value, logoRef.value, lottieRef.value, statusRef.value], {
      opacity: 1, y: 0,
    })
  }
}

watch(() => props.show, (isShowing) => {
  if (!isShowing) {
    stopSequence()
    progress.value = 100
    finishTimer = setTimeout(() => {
      rendered.value = false
    }, 500)
  }
})

onMounted(async () => {
  await nextTick()
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

  try {
    initScene()
    applyThemeToScene()
    if (!reduced) animate()
    else if (renderer && scene && camera) renderer.render(scene, camera)
  } catch {
    // fallback — scene stays dark, card still works
  }

  initAnimations()

  if (!reduced) {
    resizeObs = new ResizeObserver(() => handleResize())
    if (threeContainer.value) resizeObs.observe(threeContainer.value)
    window.addEventListener('mousemove', handleMouseMove)
  }

  startSequence()

  if (lottieRef.value) {
    const lottie = (await import('lottie-web')).default
    lottieAnim = lottie.loadAnimation({
      container: lottieRef.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/lottie/clone.json',
    })
  }
})

watch(isDark, () => {
  applyThemeToScene()
})

onBeforeUnmount(() => {
  stopSequence()
  if (finishTimer) clearTimeout(finishTimer)
  cancelAnimationFrame(animId)
  renderer?.dispose()
  scene?.clear()
  scene = null
  renderer = null
  dnaGroup = null
  particleSystem = null
  networkLines = null
  resizeObs?.disconnect()
  lottieAnim?.destroy()
  window.removeEventListener('mousemove', handleMouseMove)
  gsap.matchMedia().revert()
})
</script>

<style scoped>
.loader-exit-leave-active {
  transition: opacity 0.55s ease, filter 0.55s ease, transform 0.55s ease;
}

.loader-exit-leave-to {
  opacity: 0;
  filter: blur(10px);
  transform: scale(1.06);
}

.status-fade-enter-active,
.status-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.status-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.status-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .loader-exit-leave-active {
    transition: opacity 0.3s ease;
  }

  .loader-exit-leave-to {
    filter: none;
    transform: none;
  }
}
</style>
