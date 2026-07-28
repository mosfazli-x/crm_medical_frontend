<script setup lang="ts">
/**
 * ParticleBackground — Premium ambient particle field for healthcare SaaS.
 *
 * Layered depth particles with volumetric glow, light trails, organic Perlin-like
 * wave motion, gradient connection lines, soft ambient light pools, and gentle
 * mouse parallax. Canvas 2D — zero dependencies, GPU-accelerated at 60fps.
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

/* ── Theme ── */
const isDark = ref(true)
let themeObserver: MutationObserver | null = null

function syncTheme() {
  isDark.value = document.documentElement.getAttribute('data-theme') !== 'light'
}

/* ── Colors ── */
interface RGB { r: number; g: number; b: number }

interface Palette {
  bg: [number, number, number]
  layers: RGB[]
  connection: [number, number, number]
  glow: RGB[]
}

const PALETTE: { dark: Palette; light: Palette } = {
  dark: {
    bg: [6, 10, 19],
    layers: [
      { r: 59, g: 130, b: 246 },   // medical blue
      { r: 34, g: 211, b: 238 },   // cyan
      { r: 129, g: 140, b: 248 },  // soft purple
      { r: 99, g: 102, b: 241 },   // indigo
    ],
    connection: [59, 130, 246],
    glow: [
      { r: 37, g: 99, b: 235 },
      { r: 6, g: 182, b: 212 },
      { r: 139, g: 92, b: 246 },
    ],
  },
  light: {
    bg: [245, 247, 250],
    layers: [
      { r: 37, g: 99, b: 235 },
      { r: 6, g: 182, b: 212 },
      { r: 99, g: 102, b: 241 },
      { r: 124, g: 58, b: 237 },
    ],
    connection: [37, 99, 235],
    glow: [
      { r: 37, g: 99, b: 235 },
      { r: 6, g: 182, b: 212 },
      { r: 124, g: 58, b: 237 },
    ],
  },
}

/* ── Improved noise (smooth gradient noise) ── */
function hash21(px: number, py: number): [number, number] {
  let n = Math.sin(px * 127.1 + py * 311.7) * 43758.5453123
  const a = n - Math.floor(n)
  n = Math.sin(px * 269.5 + py * 183.3) * 43758.5453123
  return [a, n - Math.floor(n)]
}

function gradNoise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const ux = fx * fx * (3.0 - 2.0 * fx)
  const uy = fy * fy * (3.0 - 2.0 * fy)

  const [a0, b0] = hash21(ix, iy)
  const [a1, b1] = hash21(ix + 1, iy)
  const [a2, b2] = hash21(ix, iy + 1)
  const [a3, b3] = hash21(ix + 1, iy + 1)

  const gx0 = a0 * 2 - 1
  const gy0 = b0 * 2 - 1
  const gx1 = a1 * 2 - 1
  const gy1 = b1 * 2 - 1
  const gx2 = a2 * 2 - 1
  const gy2 = b2 * 2 - 1
  const gx3 = a3 * 2 - 1
  const gy3 = b3 * 2 - 1

  const d0 = gx0 * fx + gy0 * fy
  const d1 = gx1 * (fx - 1) + gy1 * fy
  const d2 = gx2 * fx + gy2 * (fy - 1)
  const d3 = gx3 * (fx - 1) + gy3 * (fy - 1)

  return d0 * (1 - ux) * (1 - uy) + d1 * ux * (1 - uy) + d2 * (1 - ux) * uy + d3 * ux * uy
}

function fbm(x: number, y: number, oct: number): number {
  let v = 0, a = 0.5, f = 1
  for (let i = 0; i < oct; i++) {
    v += a * gradNoise(x * f, y * f)
    a *= 0.5
    f *= 2.0
  }
  return v
}

/* ── State ── */
let ctx: CanvasRenderingContext2D | null = null
let rafId: number | null = null
let mouseX = -9999, mouseY = -9999
let smoothMX = 0, smoothMY = 0
let W = 0, H = 0, dpr = 1
let time = 0
let isActive = true

interface Particle {
  x: number; y: number
  baseX: number; baseY: number
  vx: number; vy: number
  size: number
  alpha: number; targetAlpha: number
  depth: number            // 0 = far, 1 = mid, 2 = near
  colorIdx: number
  phase: number
  speed: number
  drift: number
  pulseSpeed: number
  trail: { x: number; y: number; a: number }[]
}

let particles: Particle[] = []

/* ── Spatial hash for connections ── */
const CELL = 100
let grid: Map<string, number[]> = new Map()

function gridKey(x: number, y: number): string {
  return `${(x / CELL) | 0},${(y / CELL) | 0}`
}

function rebuildGrid() {
  grid.clear()
  for (let i = 0; i < particles.length; i++) {
    const k = gridKey(particles[i]!.x, particles[i]!.y)
    let c = grid.get(k)
    if (!c) { c = []; grid.set(k, c) }
    c.push(i)
  }
}

function neighbors(p: Particle): number[] {
  const cx = (p.x / CELL) | 0
  const cy = (p.y / CELL) | 0
  const out: number[] = []
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const c = grid.get(`${cx + dx},${cy + dy}`)
      if (c) {
        for (let k = 0; k < c.length; k++) out.push(c[k]!)
      }
    }
  }
  return out
}

/* ── Particle count (adaptive) ── */
function getCount(): number {
  const area = typeof window !== 'undefined' ? window.innerWidth * window.innerHeight : 1920 * 1080
  const base = Math.min(Math.floor(area / 3200), 380)
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.floor(base * 0.5) : base
}

/* ── Create particles ── */
function spawn() {
  const total = getCount()
  particles = []
  for (let i = 0; i < total; i++) {
    const depth = i < total * 0.45 ? 0 : i < total * 0.78 ? 1 : 2
    const s = [0.5, 0.85, 1.25][depth]!
    const maxTrail = depth === 2 ? 5 : depth === 1 ? 3 : 0
    const trail: { x: number; y: number; a: number }[] = []
    for (let t = 0; t < maxTrail; t++) trail.push({ x: 0, y: 0, a: 0 })

    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      baseX: Math.random() * W,
      baseY: Math.random() * H,
      vx: 0, vy: 0,
      size: (0.35 + Math.random() * 1.1) * s,
      alpha: 0,
      targetAlpha: (0.05 + Math.random() * 0.16) * s,
      depth,
      colorIdx: Math.floor(Math.random() * 4),
      phase: Math.random() * Math.PI * 2,
      speed: (0.12 + Math.random() * 0.28) * s,
      drift: (Math.random() - 0.5) * 0.25,
      pulseSpeed: 0.6 + Math.random() * 1.2,
      trail,
    })
  }
}

/* ── Canvas ── */
const canvas = ref<HTMLCanvasElement | null>(null)

function resize() {
  if (!canvas.value) return
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  W = window.innerWidth
  H = window.innerHeight
  canvas.value.width = W * dpr
  canvas.value.height = H * dpr
  canvas.value.style.width = W + 'px'
  canvas.value.style.height = H + 'px'
  ctx?.setTransform(dpr, 0, 0, dpr, 0, 0)
  for (const p of particles) {
    p.x = p.baseX = Math.random() * W
    p.y = p.baseY = Math.random() * H
  }
}

function onMove(e: MouseEvent) { mouseX = e.clientX; mouseY = e.clientY }
function onLeave() { mouseX = -9999; mouseY = -9999 }

/* ── Ambient light pools ── */
interface LightPool {
  baseX: number; baseY: number
  radius: number; colorIdx: number
  driftX: number; driftY: number
  phaseX: number; phaseY: number
  speedX: number; speedY: number
}

const lightPools: LightPool[] = [
  { baseX: 0.2, baseY: 0.25, radius: 380, colorIdx: 0, driftX: 80, driftY: 50, phaseX: 0, phaseY: 1.2, speedX: 0.18, speedY: 0.14 },
  { baseX: 0.8, baseY: 0.6, radius: 340, colorIdx: 1, driftX: 70, driftY: 60, phaseX: 2.1, phaseY: 0.8, speedX: 0.15, speedY: 0.2 },
  { baseX: 0.5, baseY: 0.85, radius: 300, colorIdx: 2, driftX: 50, driftY: 40, phaseX: 4.2, phaseY: 2.5, speedX: 0.12, speedY: 0.16 },
  { baseX: 0.15, baseY: 0.7, radius: 260, colorIdx: 0, driftX: 60, driftY: 45, phaseX: 1.5, phaseY: 3.8, speedX: 0.1, speedY: 0.13 },
]

/* ── Draw ── */
function frame() {
  if (!ctx || !isActive) return

  const pal = isDark.value ? PALETTE.dark : PALETTE.light
  time += 0.0025

  smoothMX += (mouseX - smoothMX) * 0.035
  smoothMY += (mouseY - smoothMY) * 0.035

  /* Background fill */
  ctx.fillStyle = `rgb(${pal.bg[0]},${pal.bg[1]},${pal.bg[2]})`
  ctx.fillRect(0, 0, W, H)

  /* Ambient light pools */
  drawLightPools(ctx, pal)

  /* Update + store old positions for trails */
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]!
    const ld = p.depth === 0 ? 0.35 : p.depth === 1 ? 0.65 : 1.0

    /* Noise-driven organic flow */
    const nx = fbm(p.x * 0.0008 + time * 0.25, p.y * 0.0008, 3)
    const ny = fbm(p.x * 0.0008, p.y * 0.0008 + time * 0.25, 3)
    const wy = Math.sin(p.x * 0.002 + time * p.speed + p.phase) * 0.25
    const wx = Math.cos(p.y * 0.0015 + time * p.speed * 0.6 + p.phase) * 0.12

    p.vx = nx * 0.35 * ld + wx + p.drift * 0.15
    p.vy = ny * 0.3 * ld + wy * 0.35

    /* Mouse interaction — per-depth parallax */
    const mStrength = [0.06, 0.12, 0.2][p.depth]!
    const mdx = smoothMX - p.x
    const mdy = smoothMY - p.y
    const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
    if (mDist < 280 && mDist > 1) {
      const mf = (1 - mDist / 280) * mStrength
      p.vx += (mdx / mDist) * mf * 0.12 + (-mdy / mDist) * mf * 0.06
      p.vy += (mdy / mDist) * mf * 0.12 + (mdx / mDist) * mf * 0.06
    }

    /* Store trail positions for near particles */
    if (p.depth === 2 && p.trail.length > 0) {
      for (let t = p.trail.length - 1; t > 0; t--) {
        p.trail[t]!.x = p.trail[t - 1]!.x
        p.trail[t]!.y = p.trail[t - 1]!.y
        p.trail[t]!.a = p.trail[t - 1]!.a * 0.7
      }
      p.trail[0]!.x = p.x
      p.trail[0]!.y = p.y
      p.trail[0]!.a = 0.4
    }

    p.x += p.vx * 0.7
    p.y += p.vy * 0.7

    /* Wrap */
    if (p.x < -60) p.x = W + 60
    if (p.x > W + 60) p.x = -60
    if (p.y < -60) p.y = H + 60
    if (p.y > H + 60) p.y = -60

    /* Fade in */
    p.alpha += (p.targetAlpha - p.alpha) * 0.018
  }

  /* Connections */
  drawConnections(ctx, pal)

  /* Particles */
  for (const p of particles) {
    const c = pal.layers[p.colorIdx]!
    const pulse = Math.sin(time * p.pulseSpeed + p.phase) * 0.025
    const a = Math.max(0, p.alpha + pulse)

    /* Light trails for near particles */
    if (p.depth === 2 && p.trail.length > 0) {
      for (let t = p.trail.length - 1; t >= 0; t--) {
        const tr = p.trail[t]!
        if (tr.a < 0.01) continue
        const ta = tr.a * a * 0.35
        const ts = p.size * 0.6
        ctx.beginPath()
        ctx.arc(tr.x, tr.y, ts, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${ta})`
        ctx.fill()
      }
    }

    /* Volumetric glow for mid/near */
    if (p.depth >= 1) {
      const gs = p.size * (p.depth === 2 ? 5 : 3.5)
      const gAlpha = a * (p.depth === 2 ? 0.5 : 0.25)
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gs)
      grad.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${gAlpha})`)
      grad.addColorStop(0.35, `rgba(${c.r},${c.g},${c.b},${gAlpha * 0.25})`)
      grad.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(p.x, p.y, gs, 0, Math.PI * 2)
      ctx.fill()
    }

    /* Core dot */
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${a})`
    ctx.fill()
  }

  /* Vignette */
  drawVignette(ctx)

  rafId = requestAnimationFrame(frame)
}

function drawLightPools(c: CanvasRenderingContext2D, pal: Palette) {
  for (const pool of lightPools) {
    const gc = pal.glow[pool.colorIdx]!
    const ox = Math.sin(time * pool.speedX + pool.phaseX) * pool.driftX
    const oy = Math.cos(time * pool.speedY + pool.phaseY) * pool.driftY
    const cx = pool.baseX * W + ox
    const cy = pool.baseY * H + oy
    const r = pool.radius

    const grad = c.createRadialGradient(cx, cy, 0, cx, cy, r)
    grad.addColorStop(0, `rgba(${gc.r},${gc.g},${gc.b},0.035)`)
    grad.addColorStop(0.5, `rgba(${gc.r},${gc.g},${gc.b},0.012)`)
    grad.addColorStop(1, `rgba(${gc.r},${gc.g},${gc.b},0)`)
    c.fillStyle = grad
    c.beginPath()
    c.arc(cx, cy, r, 0, Math.PI * 2)
    c.fill()
  }
}

function drawConnections(c: CanvasRenderingContext2D, pal: Palette) {
  const maxD = 110
  const maxD2 = maxD * maxD
  const [cr, cg, cb] = pal.connection
  c.lineWidth = 0.4

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]!
    if (p.depth > 1) continue

    const nbrs = neighbors(p)
    for (let n = 0; n < nbrs.length; n++) {
      const j = nbrs[n]!
      if (j <= i) continue
      const q = particles[j]
      if (!q || q.depth > 1) continue

      const dx = p.x - q.x
      const dy = p.y - q.y
      const d2 = dx * dx + dy * dy
      if (d2 > maxD2) continue

      const dist = Math.sqrt(d2)
      const fade = 1 - dist / maxD
      const pulse = Math.sin(time * 0.8 + (p.phase + q.phase) * 0.5) * 0.015
      const alpha = Math.max(0, (0.04 + pulse) * fade * Math.min(p.alpha, q.alpha) / 0.1)

      /* Gradient line: brighter at midpoint */
      const mx = (p.x + q.x) * 0.5
      const my = (p.y + q.y) * 0.5
      const grad = c.createLinearGradient(p.x, p.y, q.x, q.y)
      const a1 = alpha * 0.6
      const a2 = alpha
      grad.addColorStop(0, `rgba(${cr},${cg},${cb},${a1})`)
      grad.addColorStop(0.5, `rgba(${cr},${cg},${cb},${a2})`)
      grad.addColorStop(1, `rgba(${cr},${cg},${cb},${a1})`)
      c.strokeStyle = grad
      c.beginPath()
      c.moveTo(p.x, p.y)
      c.lineTo(q.x, q.y)
      c.stroke()
    }
  }
}

function drawVignette(c: CanvasRenderingContext2D) {
  const cx = W / 2, cy = H / 2
  const r = Math.max(W, H) * 0.72
  const grad = c.createRadialGradient(cx, cy, r * 0.25, cx, cy, r)
  grad.addColorStop(0, 'rgba(0,0,0,0)')
  grad.addColorStop(0.7, isDark.value ? 'rgba(6,10,19,0.15)' : 'rgba(245,247,250,0.1)')
  grad.addColorStop(1, isDark.value ? 'rgba(6,10,19,0.55)' : 'rgba(245,247,250,0.45)')
  c.fillStyle = grad
  c.fillRect(0, 0, W, H)
}

/* ── Lifecycle ── */
function onVisibility() {
  if (document.hidden) {
    isActive = false
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  } else {
    isActive = true
    rafId = requestAnimationFrame(frame)
  }
}

onMounted(() => {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d', { alpha: false })
  if (!ctx) return

  syncTheme()
  themeObserver = new MutationObserver(syncTheme)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

  resize()
  spawn()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMove, { passive: true })
  document.addEventListener('mouseleave', onLeave)
  document.addEventListener('visibilitychange', onVisibility)
  rafId = requestAnimationFrame(frame)
})

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
  themeObserver?.disconnect()
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <canvas
    ref="canvas"
    class="particle-bg"
    aria-hidden="true"
  />
</template>

<style scoped>
.particle-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  will-change: contents;
}
</style>
