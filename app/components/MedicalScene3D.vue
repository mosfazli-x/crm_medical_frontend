<script setup lang="ts">
/**
 * MedicalScene3D — Premium "Medical AI Core" hero visualization.
 *
 * A floating transparent glass sphere containing:
 *   - Neural network structures (nodes + connections)
 *   - Flowing data stream particles
 *   - Holographic orbital rings
 *   - Soft inner glow core
 *   - Outer atmospheric particles
 *
 * Three.js with bloom post-processing, mouse parallax, and floating animation.
 * Zero SSR — all code lazy-loaded client-side only.
 */
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'

const container = ref<HTMLElement | null>(null)
const renderer = shallowRef<any>(null)
const scene = shallowRef<any>(null)
const camera = shallowRef<any>(null)
const composer = shallowRef<any>(null)
const mouse = { x: 0, y: 0, tx: 0, ty: 0 }
const prefersReducedMotion = ref(false)
let animFrameId: number | null = null
let resizeObserver: ResizeObserver | null = null
let mouseHandler: ((e: MouseEvent) => void) | null = null

async function init() {
  if (!container.value || import.meta.server) return

  const THREE = await import('three')
  const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js')
  const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js')
  const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js')
  const { OutputPass } = await import('three/addons/postprocessing/OutputPass.js')

  const w = container.value.clientWidth
  const h = container.value.clientHeight

  /* ── Renderer ── */
  const rendererInstance = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  })
  rendererInstance.setSize(w, h)
  rendererInstance.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  rendererInstance.toneMapping = THREE.ACESFilmicToneMapping
  rendererInstance.toneMappingExposure = 1.1
  container.value.appendChild(rendererInstance.domElement)
  renderer.value = rendererInstance

  /* ── Scene ── */
  const sceneInstance = new THREE.Scene()
  scene.value = sceneInstance

  /* ── Camera ── */
  const cameraInstance = new THREE.PerspectiveCamera(40, w / h, 0.1, 100)
  cameraInstance.position.set(0, 0, 5.5)
  camera.value = cameraInstance

  /* ── Lighting ── */
  const ambient = new THREE.AmbientLight(0x1e3a5f, 0.6)
  sceneInstance.add(ambient)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
  keyLight.position.set(4, 5, 6)
  sceneInstance.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.6)
  fillLight.position.set(-4, 2, 4)
  sceneInstance.add(fillLight)

  const rimLight = new THREE.PointLight(0x22d3ee, 1.8, 20)
  rimLight.position.set(-3, 1, 4)
  sceneInstance.add(rimLight)

  const underLight = new THREE.PointLight(0x6366f1, 1.0, 15)
  underLight.position.set(2, -3, 2)
  sceneInstance.add(underLight)

  /* ═══════════════════════════════════════════
     A. Glass Sphere
     ═══════════════════════════════════════════ */
  const sphereRadius = 1.5
  const glassGeo = new THREE.SphereGeometry(sphereRadius, 64, 64)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    metalness: 0.0,
    roughness: 0.05,
    transmission: 0.92,
    thickness: 0.8,
    ior: 1.45,
    envMapIntensity: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.95,
    side: THREE.FrontSide,
  })
  const glassSphere = new THREE.Mesh(glassGeo, glassMat)
  sceneInstance.add(glassSphere)

  /* ── Subtle rim glow ring on sphere equator ── */
  const rimRingGeo = new THREE.TorusGeometry(sphereRadius + 0.01, 0.008, 16, 128)
  const rimRingMat = new THREE.MeshBasicMaterial({
    color: 0x22d3ee,
    transparent: true,
    opacity: 0.3,
  })
  const rimRing = new THREE.Mesh(rimRingGeo, rimRingMat)
  rimRing.rotation.x = Math.PI / 2
  sceneInstance.add(rimRing)

  /* ═══════════════════════════════════════════
     B. Inner Core — soft emissive heart
     ═══════════════════════════════════════════ */
  const coreGeo = new THREE.SphereGeometry(0.22, 32, 32)
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    emissive: 0x3b82f6,
    emissiveIntensity: 2.5,
    transparent: true,
    opacity: 0.7,
  })
  const core = new THREE.Mesh(coreGeo, coreMat)
  sceneInstance.add(core)

  /* Core outer halo */
  const haloGeo = new THREE.SphereGeometry(0.38, 32, 32)
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x60a5fa,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  })
  const halo = new THREE.Mesh(haloGeo, haloMat)
  sceneInstance.add(halo)

  /* ═══════════════════════════════════════════
     C. Neural Network — nodes inside the sphere
     ═══════════════════════════════════════════ */
  const neuralGroup = new THREE.Group()
  const neuralNodeCount = 40
  const neuralPositions: number[] = []
  const neuralColors: number[] = []
  const neuralSizes = new Float32Array(neuralNodeCount)

  const nodePositions: any[] = []

  for (let i = 0; i < neuralNodeCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = Math.pow(Math.random(), 0.5) * (sphereRadius * 0.82)
    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    neuralPositions.push(x, y, z)
    nodePositions.push(new THREE.Vector3(x, y, z))

    const t = i / neuralNodeCount
    const c = new THREE.Color().setHSL(0.55 + t * 0.12, 0.75, 0.6)
    neuralColors.push(c.r, c.g, c.b)
    neuralSizes[i] = 0.02 + Math.random() * 0.025
  }

  const neuralGeo = new THREE.BufferGeometry()
  neuralGeo.setAttribute('position', new THREE.Float32BufferAttribute(neuralPositions, 3))
  neuralGeo.setAttribute('color', new THREE.Float32BufferAttribute(neuralColors, 3))
  neuralGeo.setAttribute('size', new THREE.Float32BufferAttribute(neuralSizes, 1))

  const neuralMat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  neuralGroup.add(new THREE.Points(neuralGeo, neuralMat))

  /* Neural connections — links between nearby nodes */
  const connectionThreshold = 1.0
  const connectionPositions: number[] = []
  const connectionColors: number[] = []

  for (let i = 0; i < neuralNodeCount; i++) {
    for (let j = i + 1; j < neuralNodeCount; j++) {
      const dist = nodePositions[i]!.distanceTo(nodePositions[j]!)
      if (dist < connectionThreshold) {
        const p1 = nodePositions[i]!
        const p2 = nodePositions[j]!
        connectionPositions.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)

        const alpha = 1 - dist / connectionThreshold
        const c = new THREE.Color().setHSL(0.55, 0.6, 0.5 + alpha * 0.2)
        connectionColors.push(c.r, c.g, c.b, c.r, c.g, c.b)
      }
    }
  }

  if (connectionPositions.length > 0) {
    const connGeo = new THREE.BufferGeometry()
    connGeo.setAttribute('position', new THREE.Float32BufferAttribute(connectionPositions, 3))

    const connMat = new THREE.LineBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const connections = new THREE.LineSegments(connGeo, connMat)
    neuralGroup.add(connections)
  }

  sceneInstance.add(neuralGroup)

  /* ═══════════════════════════════════════════
     D. Data Streams — flowing particles along curves
     ═══════════════════════════════════════════ */
  const streamGroup = new THREE.Group()
  const streamCount = 8
  const trailLength = 60

  interface Stream {
    curve: any
    offsets: Float32Array
    speeds: Float32Array
    baseOffset: number
  }

  const streams: Stream[] = []

  for (let s = 0; s < streamCount; s++) {
    const pts: any[] = []
    const segCount = 8
    for (let i = 0; i <= segCount; i++) {
      const t = i / segCount
      const angle = t * Math.PI * 2 * (0.8 + Math.random() * 0.4) + s * 0.8
      const r = sphereRadius * (0.2 + t * 0.6) * (0.7 + Math.random() * 0.3)
      const y = (t - 0.5) * sphereRadius * 1.2
      pts.push(new THREE.Vector3(
        Math.cos(angle) * r,
        y + Math.sin(t * Math.PI) * 0.3,
        Math.sin(angle) * r,
      ))
    }

    const curve = new (THREE as any).CatmullRomCurve3(pts, false, 'centripetal', 0.5)
    const offsets = new Float32Array(trailLength)
    const speeds = new Float32Array(trailLength)

    for (let i = 0; i < trailLength; i++) {
      offsets[i] = i / trailLength
      speeds[i] = 0.001 + Math.random() * 0.001
    }

    const streamGeo = new THREE.BufferGeometry()
    const streamPos = new Float32Array(trailLength * 3)
    const streamAlpha = new Float32Array(trailLength)

    streamGeo.setAttribute('position', new THREE.Float32BufferAttribute(streamPos, 3))
    streamGeo.setAttribute('alpha', new THREE.Float32BufferAttribute(streamAlpha, 1))

    const streamMat = new THREE.PointsMaterial({
      size: 0.02,
      color: s % 2 === 0 ? 0x22d3ee : 0x818cf8,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const points = new THREE.Points(streamGeo, streamMat)
    streamGroup.add(points)

    streams.push({ curve, offsets, speeds, baseOffset: Math.random() })
  }

  sceneInstance.add(streamGroup)

  /* ═══════════════════════════════════════════
     E. Holographic Rings
     ═══════════════════════════════════════════ */
  const ringsGroup = new THREE.Group()

  const ringConfigs = [
    { radius: 1.9, tube: 0.006, color: 0x22d3ee, opacity: 0.25, rotX: 0.3, rotZ: 0.2 },
    { radius: 2.15, tube: 0.004, color: 0x3b82f6, opacity: 0.18, rotX: -0.4, rotZ: 0.5 },
    { radius: 2.4, tube: 0.003, color: 0x6366f1, opacity: 0.12, rotX: 0.6, rotZ: -0.3 },
  ]

  const rings: any[] = []

  for (const cfg of ringConfigs) {
    const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 128)
    const mat = new THREE.MeshBasicMaterial({
      color: cfg.color,
      transparent: true,
      opacity: cfg.opacity,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = cfg.rotX
    mesh.rotation.z = cfg.rotZ
    ringsGroup.add(mesh)
    rings.push(mesh)
  }

  sceneInstance.add(ringsGroup)

  /* ═══════════════════════════════════════════
     F. Outer Atmospheric Particles
     ═══════════════════════════════════════════ */
  const atmosphereCount = 120
  const atmGeo = new THREE.BufferGeometry()
  const atmPositions = new Float32Array(atmosphereCount * 3)
  const atmColors = new Float32Array(atmosphereCount * 3)

  for (let i = 0; i < atmosphereCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = sphereRadius * 1.4 + Math.random() * 1.8

    atmPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    atmPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    atmPositions[i * 3 + 2] = r * Math.cos(phi)

    const c = new THREE.Color().setHSL(0.55 + Math.random() * 0.1, 0.6, 0.5 + Math.random() * 0.2)
    atmColors[i * 3] = c.r
    atmColors[i * 3 + 1] = c.g
    atmColors[i * 3 + 2] = c.b
  }

  atmGeo.setAttribute('position', new THREE.Float32BufferAttribute(atmPositions, 3))
  atmGeo.setAttribute('color', new THREE.Float32BufferAttribute(atmColors, 3))

  const atmMat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })
  const atmosphere = new THREE.Points(atmGeo, atmMat)
  sceneInstance.add(atmosphere)

  /* ═══════════════════════════════════════════
     G. Energy Pulse Rings (expanding circles)
     ═══════════════════════════════════════════ */
  const pulseGroup = new THREE.Group()
  const pulseCount = 3
  const pulses: { mesh: any; baseScale: number; speed: number; phase: number }[] = []

  for (let i = 0; i < pulseCount; i++) {
    const geo = new THREE.RingGeometry(0.3, 0.32, 64)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(geo, mat)
    pulseGroup.add(mesh)
    pulses.push({
      mesh,
      baseScale: 0.6 + i * 0.3,
      speed: 0.3 + i * 0.1,
      phase: i * (Math.PI * 2) / pulseCount,
    })
  }

  sceneInstance.add(pulseGroup)

  /* ═══════════════════════════════════════════
     Post-processing
     ═══════════════════════════════════════════ */
  const composerInstance = new EffectComposer(rendererInstance)
  composerInstance.addPass(new RenderPass(sceneInstance, cameraInstance))
  composerInstance.addPass(new UnrealBloomPass(
    new THREE.Vector2(w, h), 0.7, 0.5, 0.75
  ))
  composerInstance.addPass(new OutputPass())
  composer.value = composerInstance

  /* ═══════════════════════════════════════════
     Mouse parallax
     ═══════════════════════════════════════════ */
  mouseHandler = (e: MouseEvent) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1
    mouse.ty = -(e.clientY / window.innerHeight) * 2 + 1
  }
  window.addEventListener('mousemove', mouseHandler, { passive: true })

  /* ═══════════════════════════════════════════
     Animation loop
     ═══════════════════════════════════════════ */
  const clock = new THREE.Clock()

  function animate() {
    animFrameId = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()

    /* Smooth mouse lerp */
    mouse.x += (mouse.tx - mouse.x) * 0.04
    mouse.y += (mouse.ty - mouse.y) * 0.04

    /* Sphere gentle rotation + float */
    glassSphere.rotation.y = t * 0.08
    glassSphere.rotation.x = Math.sin(t * 0.15) * 0.04
    glassSphere.position.y = Math.sin(t * 0.4) * 0.08

    /* Core pulse */
    const corePulse = 1.0 + Math.sin(t * 1.5) * 0.08
    core.scale.setScalar(corePulse)
    coreMat.emissiveIntensity = 2.0 + Math.sin(t * 1.2) * 0.5
    halo.scale.setScalar(1.0 + Math.sin(t * 0.8) * 0.06)

    /* Rim ring follows sphere */
    rimRing.position.y = glassSphere.position.y
    rimRing.rotation.z = t * 0.12

    /* Neural network slow rotation */
    neuralGroup.rotation.y = t * 0.06
    neuralGroup.rotation.x = Math.sin(t * 0.2) * 0.03

    /* Data streams — advance offsets */
    for (let s = 0; s < streams.length; s++) {
      const stream = streams[s]!
      const pts = stream.curve.getPoints(trailLength)
      const geo = (streamGroup.children[s] as any).geometry
      const posAttr = geo.getAttribute('position') as any

      for (let i = 0; i < trailLength; i++) {
        stream.offsets[i]! += stream.speeds[i]!
        if (stream.offsets[i]! > 1.0) stream.offsets[i]! -= 1.0

        const idx = Math.floor(stream.offsets[i]! * (pts.length - 1))
        const pt = pts[Math.min(idx, pts.length - 1)]
        posAttr.setXYZ(i, pt.x, pt.y, pt.z)
      }
      posAttr.needsUpdate = true
    }

    /* Holographic rings rotation */
    rings[0]!.rotation.z = t * 0.1
    rings[0]!.rotation.y = t * 0.05
    rings[1]!.rotation.z = -t * 0.08
    rings[1]!.rotation.x = t * 0.06
    rings[2]!.rotation.y = t * 0.04
    rings[2]!.rotation.z = t * 0.12

    /* Atmosphere drift */
    atmosphere.rotation.y = t * 0.02
    atmosphere.rotation.x = t * 0.01

    /* Energy pulses */
    for (const p of pulses) {
      const pt = (t * p.speed + p.phase) % (Math.PI * 2)
      const progress = pt / (Math.PI * 2)
      const scale = p.baseScale + progress * 1.5
      p.mesh.scale.setScalar(scale)
      ;(p.mesh.material as any).opacity = (1 - progress) * 0.12
      p.mesh.lookAt(cameraInstance.position)
    }

    /* Camera parallax */
    cameraInstance.position.x += (mouse.x * 0.35 - cameraInstance.position.x) * 0.025
    cameraInstance.position.y += (mouse.y * 0.25 - cameraInstance.position.y) * 0.025
    cameraInstance.lookAt(new (THREE as any).Vector3(0, glassSphere.position.y, 0))

    composerInstance.render()
  }

  if (!prefersReducedMotion.value) {
    animate()
  } else {
    composerInstance.render()
  }

  /* ── Resize ── */
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) continue
      cameraInstance.aspect = width / height
      cameraInstance.updateProjectionMatrix()
      rendererInstance.setSize(width, height)
      composerInstance.setSize(width, height)
    }
  })
  resizeObserver.observe(container.value)
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  init()
})

onBeforeUnmount(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (resizeObserver) resizeObserver.disconnect()
  if (mouseHandler) window.removeEventListener('mousemove', mouseHandler)
  if (renderer.value) {
    renderer.value.dispose()
    renderer.value.domElement?.remove()
  }
  if (scene.value) {
    scene.value.traverse((obj: any) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose())
        else obj.material.dispose()
      }
    })
  }
})
</script>

<template>
  <div ref="container" class="imm-3d-canvas" aria-hidden="true" />
</template>
