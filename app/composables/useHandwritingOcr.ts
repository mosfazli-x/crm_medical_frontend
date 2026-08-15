import { ref } from 'vue'

interface ProgressEvent {
  status: string
  loaded?: number
  total?: number
  progress?: number
}

let ocrPipelinePromise: Promise<unknown> | null = null

export const HANDWRITING_MODEL_ID = 'Xenova/trocr-small-handwritten'

/**
 * Client-side handwriting-to-text via Transformers.js (TrOCR).
 * The model is lazy-loaded on first use and cached for the whole session.
 * Runs entirely in the browser; no data leaves the device.
 */
export function useHandwritingOcr() {
  const isModelLoading = ref(false)
  const loadProgress = ref(0)

  function pctOf(event: ProgressEvent): number {
    if (typeof event.progress === 'number') return Math.min(100, Math.max(0, Math.round(event.progress * 100)))
    if (typeof event.loaded === 'number' && typeof event.total === 'number' && event.total > 0) {
      return Math.min(100, Math.max(0, Math.round((event.loaded / event.total) * 100)))
    }
    return loadProgress.value
  }

  async function getPipeline(): Promise<unknown> {
    if (!ocrPipelinePromise) {
      isModelLoading.value = true
      loadProgress.value = 0
      const { pipeline } = await import('@huggingface/transformers')
      ocrPipelinePromise = pipeline('image-to-text', HANDWRITING_MODEL_ID, {
        progress_callback: (event: ProgressEvent) => {
          if (event.status === 'progress') loadProgress.value = pctOf(event)
          else if (event.status === 'initiate') loadProgress.value = 0
          else if (event.status === 'done' || event.status === 'ready') isModelLoading.value = false
        },
      }).catch((error: unknown) => {
        ocrPipelinePromise = null
        isModelLoading.value = false
        throw error
      })
    }
    return ocrPipelinePromise
  }

  /**
   * Recognize a single line of handwritten text (a Blob/File image).
   */
  async function recognizeLine(image: Blob): Promise<string> {
    const ocr = await getPipeline()
    const output = await (ocr as (img: Blob, opts: Record<string, unknown>) => Promise<{ generated_text?: string }[]>)(image, {
      max_new_tokens: 64,
    })
    return output?.[0]?.generated_text?.trim() ?? ''
  }

  return { recognizeLine, getPipeline, isModelLoading, loadProgress }
}
