import { computed, ref } from 'vue'
import { COUNTRIES, getCountryByCode } from '~/data/countries'

const flagSvgCache = new Map<string, string>()
const flagLoaders = new Map<string, Promise<string>>()

async function loadFlagSvg(code: string): Promise<string> {
  if (flagSvgCache.has(code)) return flagSvgCache.get(code)!
  if (flagLoaders.has(code)) return flagLoaders.get(code)!

  const loader = (async () => {
    const mod = (await import('country-flag-icons/string/3x2')) as Record<string, string>
    const svg: string = mod[code] ?? ''
    const resolved = svg.startsWith('<svg') ? toDataUri(svg) : ''
    flagSvgCache.set(code, resolved)
    return resolved
  })()

  flagLoaders.set(code, loader)
  return loader
}

function toDataUri(svg: string): string {
  const cleaned = svg.replace(/\n/g, '').replace(/\s+/g, ' ')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleaned)}`
}

export const useCountries = () => {
  const { locale } = useI18n()
  const resolvedFlags = ref<Record<string, string>>({})

  const isFa = computed(() => locale.value === 'fa')

  const countryOptions = computed(() =>
    COUNTRIES.map((c) => ({
      code: c.code,
      flag: resolvedFlags.value[c.code] || '',
      name: isFa.value ? c.nameFa : c.nameEn,
      nameFa: c.nameFa,
      nameEn: c.nameEn,
      searchText: `${c.code} ${c.nameEn} ${c.nameFa}`.toLowerCase(),
    })),
  )

  async function resolveFlags(codes: string[]) {
    for (const code of codes) {
      if (resolvedFlags.value[code]) continue
      const svg = await loadFlagSvg(code)
      if (svg) resolvedFlags.value[code] = svg
    }
  }

  return {
    COUNTRIES,
    countryOptions,
    resolveFlags,
    iconFor: (code: string) => resolvedFlags.value[code] || '',
  }
}

export function countryName(code: string | null | undefined, lang: 'fa' | 'en' = 'fa'): string {
  const c = getCountryByCode(code)
  if (!c) return ''
  return lang === 'fa' ? c.nameFa : c.nameEn
}

export { getCountryByCode, loadFlagSvg }
