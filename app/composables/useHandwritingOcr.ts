import { ref } from 'vue'

/**
 * Handwriting-to-text recognition via the OCR.space API (Engine 3).
 *
 * The drawing is uploaded to our own backend, which forwards it to
 * OCR.space. The API key is kept server-side and is never exposed
 * to the browser.
 */
export function useHandwritingOcr() {
  const isConverting = ref(false)
  const { apiFetch } = useApi()

  /**
   * Recognize handwriting from a single image (Blob/File).
   * Returns the recognized text (may be empty when nothing is detected).
   */
  async function recognizeLine(image: Blob): Promise<string> {
    const formData = new FormData()
    formData.append('file', image, 'handwriting.png')

    isConverting.value = true
    try {
      const data = await apiFetch<{ success: boolean; text: string }>('/api/ocr/handwriting', {
        method: 'POST',
        body: formData,
      })
      return data?.text ?? ''
    } finally {
      isConverting.value = false
    }
  }

  return { recognizeLine, isConverting }
}
