<template>
    <v-dialog
        :model-value="isOpen" max-width="560" persistent transition="dialog-bottom-transition"
        @update:model-value="val => !val && close()">
        <v-card class="crm-dialog overflow-hidden!" elevation="0">
            <div class="crm-dialog-header">
                <div>
                    <h2 class="crm-dialog-title text-xl!">{{ $t('handwriting.title') }}</h2>
                    <span class="text-xs text-slate-500 dark:text-slate-400 mt-1 block font-normal">
                        {{ label }} — {{ $t('handwriting.subtitle') }}
                    </span>
                </div>
                <v-btn icon variant="text" size="small" class="text-slate-400 hover:text-slate-800" @click="close">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>

            <v-card-text class="p-6 bg-slate-50/30 dark:bg-slate-900/30">
                <div class="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div class="bg-white dark:bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                        <span class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <v-icon size="16">mdi-draw-pen</v-icon>
                            {{ $t('handwriting.writeHere') }}
                        </span>
                        <button
                            v-if="hasInk" class="text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1"
                            @click="clearCanvas">
                            <v-icon size="15">mdi-delete-outline</v-icon>
                            {{ $t('handwriting.clear') }}
                        </button>
                    </div>
                    <canvas
                        ref="canvasRef" class="block w-full cursor-crosshair touch-none select-none"
                        style="height: 260px" @pointerdown="onPointerDown" @pointermove="onPointerMove"
                        @pointerup="onPointerUp" @pointercancel="onPointerUp"/>
                </div>

                <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                    <v-icon size="13">mdi-information-outline</v-icon>
                    {{ $t('handwriting.latinNote') }}
                </p>

                <div v-if="isModelLoading" class="mt-4">
                    <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-1.5">
                        <v-progress-circular indeterminate size="18" width="2" color="#4F46E5" />
                        <span>{{ $t('handwriting.loadingModel') }}</span>
                    </div>
                    <v-progress-linear
                        :model-value="loadProgress" color="#4F46E5" height="6" rounded
                        :label="loadProgress + '%'" />
                </div>

                <div v-if="converting" class="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <v-progress-circular indeterminate size="18" width="2" color="#4F46E5" />
                    <span>{{ $t('handwriting.converting') }}</span>
                </div>

                <div v-if="status === 'error'" class="mt-4 text-sm text-rose-600 flex items-center gap-1.5">
                    <v-icon size="17">mdi-alert-circle-outline</v-icon>
                    {{ $t('handwriting.error') }}
                </div>

                <div v-if="status === 'empty'" class="mt-4 text-sm text-amber-600 flex items-center gap-1.5">
                    <v-icon size="17">mdi-text-box-remove-outline</v-icon>
                    {{ $t('handwriting.emptyResult') }}
                </div>

                <div v-if="resultText" class="mt-4">
                    <label class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                        {{ $t('handwriting.resultLabel') }} <span v-if="numeric" class="ml-1">({{ $t('handwriting.digitsOnly') }})</span>
                    </label>
                    <v-textarea v-model="resultText" variant="outlined" rows="2" hide-details density="comfortable" />
                </div>
            </v-card-text>

            <v-card-actions class="crm-dialog-footer">
                <v-spacer />
                <button class="crm-btn crm-btn-ghost" @click="close">{{ $t('handwriting.close') }}</button>
                <button v-if="hasInk && !converting && !isModelLoading" class="crm-btn crm-btn-ghost" @click="convert">
                    {{ $t('handwriting.convert') }}
                </button>
                <button
                    class="crm-btn crm-btn-accent" :disabled="!resultText || converting || isModelLoading"
                    @click="insertText">
                    {{ $t('handwriting.insert') }}
                </button>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useHandwritingOcr } from '~/composables/useHandwritingOcr'

const props = defineProps<{
    label: string
    numeric?: boolean
}>()

const emit = defineEmits<{
    insert: [text: string]
}>()

const isOpen = defineModel<boolean>({ default: false })

const { recognizeLine, isModelLoading, loadProgress } = useHandwritingOcr()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const strokes = ref<Array<Array<{ x: number; y: number }>>>([])
const drawing = ref(false)
const resultText = ref('')
const converting = ref(false)
const status = ref<'idle' | 'done' | 'empty' | 'error'>('idle')

const hasInk = () => strokes.value.some((s) => s.length > 0)

let convertTimer: ReturnType<typeof setTimeout> | null = null
let resizeObserver: ResizeObserver | null = null

const GUIDE_STEP = 48

function toLocal(event: PointerEvent): { x: number; y: number } {
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
}

function drawCanvas() {
    const canvas = canvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.round(rect.width * dpr))
    canvas.height = Math.max(1, Math.round(rect.height * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
    ctx.lineWidth = 1
    for (let y = GUIDE_STEP; y < rect.height; y += GUIDE_STEP) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()
    }

    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const stroke of strokes.value) {
        if (stroke.length < 2) continue
        ctx.beginPath()
        ctx.moveTo(stroke[0].x, stroke[0].y)
        for (let i = 1; i < stroke.length; i++) {
            ctx.lineTo(stroke[i].x, stroke[i].y)
        }
        ctx.stroke()
    }
}

function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.setPointerCapture(event.pointerId)
    drawing.value = true
    strokes.value.push([toLocal(event)])
    drawCanvas()
}

function onPointerMove(event: PointerEvent) {
    if (!drawing.value) return
    const stroke = strokes.value[strokes.value.length - 1]
    if (stroke) stroke.push(toLocal(event))
    drawCanvas()
}

function onPointerUp(event: PointerEvent) {
    if (!drawing.value) return
    drawing.value = false
    const canvas = canvasRef.value
    if (canvas?.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId)
    if (convertTimer) clearTimeout(convertTimer)
    convertTimer = setTimeout(convert, 700)
}

function clearCanvas() {
    strokes.value = []
    resultText.value = ''
    status.value = 'idle'
    drawCanvas()
}

function close() {
    if (convertTimer) clearTimeout(convertTimer)
    isOpen.value = false
    strokes.value = []
    resultText.value = ''
    status.value = 'idle'
}

function sanitizeNumeric(text: string): string {
    return text.replace(/[^\d]/g, '')
}

function insertText() {
    if (!resultText.value) return
    const text = props.numeric ? sanitizeNumeric(resultText.value) : resultText.value.trim()
    if (!text) return
    emit('insert', text)
    close()
}

async function convert() {
    if (!hasInk() || converting.value) return
    if (convertTimer) clearTimeout(convertTimer)
    converting.value = true
    status.value = 'idle'
    try {
        const lines = await renderLines()
        if (lines.length === 0) {
            status.value = 'empty'
            return
        }
        const parts: string[] = []
        for (const line of lines) {
            const text = await recognizeLine(line)
            if (text) parts.push(text)
        }
        const joined = parts.join(' ').trim()
        resultText.value = joined
        status.value = joined ? 'done' : 'empty'
    } catch (error) {
        console.error('Handwriting OCR error:', error)
        status.value = 'error'
    } finally {
        converting.value = false
    }
}

async function renderLines(): Promise<Blob[]> {
    const canvas = canvasRef.value
    if (!canvas) return []
    const ctx = canvas.getContext('2d')
    if (!ctx) return []
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    const all = strokes.value.flat()
    if (all.length === 0) return []
    const pad = 10 * dpr
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const p of all) {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
    }
    const bbox = {
        x0: Math.max(0, Math.floor(minX - pad / dpr)),
        y0: Math.max(0, Math.floor(minY - pad / dpr)),
        x1: Math.min(rect.width, Math.ceil(maxX + pad / dpr)),
        y1: Math.min(rect.height, Math.ceil(maxY + pad / dpr)),
    }
    if (bbox.x1 <= bbox.x0 || bbox.y1 <= bbox.y0) return []

    const bw = Math.round((bbox.x1 - bbox.x0) * dpr)
    const bh = Math.round((bbox.y1 - bbox.y0) * dpr)
    const off = document.createElement('canvas')
    off.width = Math.max(1, bw)
    off.height = Math.max(1, bh)
    const offCtx = off.getContext('2d')
    if (!offCtx) return []
    offCtx.fillStyle = '#ffffff'
    offCtx.fillRect(0, 0, bw, bh)
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    offCtx.translate(-bbox.x0, -bbox.y0)
    offCtx.strokeStyle = '#0f172a'
    offCtx.lineWidth = 2.2
    offCtx.lineCap = 'round'
    offCtx.lineJoin = 'round'
    for (const stroke of strokes.value) {
        if (stroke.length < 2) continue
        offCtx.beginPath()
        offCtx.moveTo(stroke[0].x, stroke[0].y)
        for (let i = 1; i < stroke.length; i++) offCtx.lineTo(stroke[i].x, stroke[i].y)
        offCtx.stroke()
    }
    offCtx.setTransform(1, 0, 0, 1, 0, 0)

    const crops = segmentLines(off, offCtx, dpr, bbox.x0, bbox.y0)
    const blobs: Blob[] = []
    for (const crop of crops) {
        const lineCanvas = document.createElement('canvas')
        lineCanvas.width = crop.w
        lineCanvas.height = crop.h
        const lctx = lineCanvas.getContext('2d')
        if (!lctx) continue
        lctx.fillStyle = '#ffffff'
        lctx.fillRect(0, 0, crop.w, crop.h)
        lctx.drawImage(off, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h)
        const blob = await canvasToBlob(lineCanvas)
        if (blob) blobs.push(blob)
    }
    return blobs
}

function segmentLines(off: HTMLCanvasElement, offCtx: CanvasRenderingContext2D, dpr: number, originX: number, originY: number): Array<{ x: number; y: number; w: number; h: number }> {
    const { width, height } = off
    const data = offCtx.getImageData(0, 0, width, height).data
    const rowInk = new Array<number>(height).fill(0)
    for (let y = 0; y < height; y++) {
        let count = 0
        const rowOffset = y * width * 4
        for (let x = 0; x < width; x++) {
            if (data[rowOffset + x * 4 + 3] > 128) count++
        }
        rowInk[y] = count
    }

    const minGap = Math.round(8 * dpr)
    const lines: Array<{ y0: number; y1: number }> = []
    let y = 0
    while (y < height) {
        if (rowInk[y] > 1) {
            let yEnd = y
            let gap = 0
            while (yEnd < height) {
                if (rowInk[yEnd] > 1) {
                    yEnd++
                    gap = 0
                } else {
                    gap++
                    if (gap > minGap) break
                    yEnd++
                }
            }
            lines.push({ y0: y, y1: yEnd - 1 })
            y = yEnd
        } else {
            y++
        }
    }

    const crops: Array<{ x: number; y: number; w: number; h: number }> = []
    for (const line of lines) {
        let lx = Infinity, rx = -Infinity
        for (const stroke of strokes.value) {
            for (const p of stroke) {
                const py = (p.y - originY) * dpr
                if (py >= line.y0 && py <= line.y1) {
                    lx = Math.min(lx, (p.x - originX) * dpr)
                    rx = Math.max(rx, (p.x - originX) * dpr)
                }
            }
        }
        if (lx === Infinity || rx === Infinity) continue
        const x0 = Math.max(0, Math.floor(lx - 6 * dpr))
        const y0 = Math.max(0, line.y0)
        const x1 = Math.min(width, Math.ceil(rx + 6 * dpr))
        const y1 = Math.min(height, line.y1 + 1)
        crops.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 })
    }
    return crops
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
    })
}

function setupCanvas() {
    if (canvasRef.value) drawCanvas()
}

onMounted(() => {
    setupCanvas()
    const canvas = canvasRef.value
    if (canvas?.parentElement) {
        resizeObserver = new ResizeObserver(() => setupCanvas())
        resizeObserver.observe(canvas.parentElement)
    }
})

onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    if (convertTimer) clearTimeout(convertTimer)
})

watch(isOpen, (open) => {
    if (open) {
        status.value = 'idle'
        setTimeout(() => setupCanvas(), 0)
    }
})
</script>
