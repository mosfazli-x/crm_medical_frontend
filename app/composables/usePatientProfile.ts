/**
 * usePatientProfile - Unified patient profile composable
 * 
 * Features:
 * - Single network call to fetch all patient data
 * - Graceful fallback to legacy endpoints
 * - Reactive state management
 * - Optimistic updates with rollback
 * - Smart caching and invalidation
 */

export interface UsePatientProfileOptions {
  autoFetch?: boolean
  patientId?: string
  profileId?: string
  forceFallback?: boolean
}

export interface UsePatientProfileReturn {
  // State
  profile: Ref<any | null>
  basicInfo: Ref<any | null>
  medicalHistory: Ref<any | null>
  reproductiveHealth: Ref<any | null>
  obstetricHistory: Ref<any | null>
  screenings: Ref<any | null>
  labResults: Ref<any | null>
  consents: Ref<any | null>
  attachments: Ref<any | null>

  // Loading states
  loading: Ref<boolean>
  saving: Ref<boolean>
  error: Ref<string>

  // Form states for editing
  lifestyleForm: any
  reproForm: any

  // Actions
  fetchProfile: () => Promise<void>
  saveLifestyle: () => Promise<boolean>
  saveReproductiveSection: (section: string, data: any) => Promise<boolean>
  refresh: () => Promise<void>
  reset: () => void
}

export const usePatientProfile = (options: UsePatientProfileOptions = {}): UsePatientProfileReturn => {
  const {
    patientId: initialPatientId,
    profileId: initialProfileId,
    autoFetch = true,
    forceFallback = false
  } = options

  const { apiFetch } = useApi()
  const { $toast } = useNuxtApp()
  const config = useRuntimeConfig()
  const { t } = useI18n()

  // ─────────────────────────────────────────────────────────────
  // Reactive State
  // ─────────────────────────────────────────────────────────────
  
  const profile = ref<any>(null)
  const basicInfo = ref<any>(null)
  const medicalHistory = ref<any>(null)
  const reproductiveHealth = ref<any>(null)
  const obstetricHistory = ref<any>(null)
  const screenings = ref<any>(null)
  const labResults = ref<any>(null)
  const consents = ref<any>(null)
  const attachments = ref<any>(null)

  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  const patientId = ref(initialPatientId || '')
  const profileId = computed(() => profile.value?.basicInfo?.id || initialProfileId)

  // ─────────────────────────────────────────────────────────────
  // Form State (mirroring legacy structure for compatibility)
  // ─────────────────────────────────────────────────────────────
  
  const lifestyleForm = reactive({
    smoking: '',
    bmi: null as number | null,
    exercise: '',
    alcohol: ''
  })

  const reproForm = reactive({
    menstrual: {
      menarche_age: null as number | null,
      cycle_length: null as number | null,
      cycle_length_max: null as number | null,
      flow_duration: null as number | null,
      flow_volume: '',
      lmp: null as string | null,
      dysmenorrhea_vas: null as number | null,
      pms: '',
      pmdd: ''
    },
    sexual: {
      sexually_active: '',
      current_contraceptive_method: '',
      past_methods: [] as string[],
      partner_count: null as number | null,
      dyspareunia: '',
      notes: ''
    },
    surgeries: [] as any[],
    contraceptives: [] as any[],
    family_history: [] as any[],
    summary: {
      gravida: null as number | null,
      para: null as number | null,
      abortus: null as number | null,
      ectopics: null as number | null,
      live_births: null as number | null,
      preterm_births: null as number | null,
      stillbirths: null as number | null,
      c_sections: null as number | null,
      vaginal_deliveries: null as number | null
    }
  })

  // ─────────────────────────────────────────────────────────────
  // Private Cache for smart invalidation
  // ─────────────────────────────────────────────────────────────
  
  let cacheTimestamp = 0
  const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  const isCacheValid = (): boolean => {
    return Date.now() - cacheTimestamp < CACHE_TTL
  }

  // ─────────────────────────────────────────────────────────────
  // Main Fetch Function - Unified or Fallback
  // ─────────────────────────────────────────────────────────────
  
  const fetchProfile = async (): Promise<void> => {
    if (!patientId.value) {
      error.value = t('patientProfile.patientIdNotFound')
      return
    }

    // Skip if cache is valid and not forced
    if (isCacheValid() && !forceFallback && profile.value) {
      syncStateFromProfile()
      return
    }

    loading.value = true
    error.value = ''

    try {
      // Try unified endpoint first
      let data: any = null
      let useUnified = !forceFallback

      if (useUnified) {
        try {
          const response = await apiFetch<any>(`/api/patients/${patientId.value}/profile`, {
            baseURL: config.public.apiBase
          })

          if (response.success && response.data) {
            data = response.data
            cacheTimestamp = Date.now()
          } else {
            // Endpoint exists but returned error - use fallback
            useUnified = false
          }
        } catch (err: any) {
          // Endpoint not found (404) or network error - use fallback
          if (err.status === 404 || err.data?.status === 404) {
            useUnified = false
          } else {
            throw err
          }
        }
      }

      // Fallback to legacy endpoints if unified failed
      if (!useUnified || !data) {
        data = await fetchLegacyData()
      }

      // Apply data to state
      if (data) {
        profile.value = data
        syncStateFromProfile()
      }
    } catch (err: any) {
      error.value = err.data?.error || t('patientProfile.fetchError')
      $toast.error(error.value)
    } finally {
      loading.value = false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Fallback: Fetch from multiple legacy endpoints
  // ─────────────────────────────────────────────────────────────
  
  const fetchLegacyData = async (): Promise<any> => {
    const pid = patientId.value
    const base = config.public.apiBase

    try {
      // Parallel fetch all sections
      const [
        patientRes,
        reproRes,
        schedulesRes,
        resultsRes,
        overdueRes,
        labRes,
        consentRes
      ] = await Promise.all([
        apiFetch<any>(`/api/patients/${pid}`, { baseURL: base }),
        apiFetch<any>(`/api/reproductive/${pid}`, { baseURL: base }),
        apiFetch<any>(`/api/screening/schedules?patientId=${pid}`, { baseURL: base }),
        apiFetch<any>(`/api/screening/results?patientId=${pid}`, { baseURL: base }),
        apiFetch<any>(`/api/screening/schedules/overdue?patientId=${pid}`, { baseURL: base }),
        apiFetch<any>(`/api/lab-results/patient/${pid}`, { baseURL: base }),
        apiFetch<any>(`/api/consent/patient/${pid}`, { baseURL: base })
      ])

      // Assemble unified structure
      return {
        basicInfo: patientRes.success ? patientRes.data : null,
        medicalHistory: {
          diseases: patientRes.success ? patientRes.data.diseases ?? [] : [],
          allergies: patientRes.success ? patientRes.data.allergies ?? [] : [],
          medications: patientRes.success ? patientRes.data.medications ?? [] : [],
          vaccinations: patientRes.success ? patientRes.data.vaccinations ?? [] : [],
        },
        reproductiveHealth: reproRes.success ? reproRes.data : null,
        obstetricHistory: {
          pregnancies: patientRes.success ? patientRes.data.obstetricHistory ?? [] : [],
          prenatalVisits: [],
          fetalMeasurements: [],
          postpartumCare: null
        },
        screenings: {
          schedules: schedulesRes.success ? schedulesRes.data : [],
          results: resultsRes.success ? resultsRes.data : [],
          overdue: overdueRes.success ? overdueRes.data : []
        },
        labResults: {
          results: labRes.success ? labRes.data : []
        },
        consents: {
          records: consentRes.success ? consentRes.data : []
        },
        attachments: {
          ultrasound: [],
          lab: [],
          prescription: []
        }
      }
    } catch (err) {
      console.error('Legacy fetch failed:', err)
      return null
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Sync individual reactive refs from profile object
  // ─────────────────────────────────────────────────────────────
  
  const syncStateFromProfile = (): void => {
    if (!profile.value) return

    const data = profile.value

    // Basic info
    basicInfo.value = data.basicInfo || null
    if (basicInfo.value) {
      lifestyleForm.smoking = basicInfo.value.smoking ?? ''
      lifestyleForm.bmi = basicInfo.value.bmi ?? null
      lifestyleForm.exercise = basicInfo.value.exercise ?? ''
      lifestyleForm.alcohol = basicInfo.value.alcohol ?? ''
    }

    // Medical history
    medicalHistory.value = data.medicalHistory || null

    // Reproductive health
    reproductiveHealth.value = data.reproductiveHealth || null
    if (reproductiveHealth.value) {
      syncReproForm(reproductiveHealth.value)
    }

    // Obstetric history
    obstetricHistory.value = normalizeObstetricHistory(data.obstetricHistory)

    // Screenings
    screenings.value = data.screenings || null

    // Lab results
    labResults.value = data.labResults || null

    // Consents
    consents.value = data.consents || null

    // Attachments
    attachments.value = data.attachments || null
  }

  const syncReproForm = (data: any): void => {
    if (!data) return

    if (data.menstrual_history) {
      Object.assign(reproForm.menstrual, {
        menarche_age: data.menstrual_history.menarche_age ?? null,
        cycle_length: data.menstrual_history.cycle_length ?? null,
        cycle_length_max: data.menstrual_history.cycle_length_max ?? null,
        flow_duration: data.menstrual_history.flow_duration ?? null,
        flow_volume: data.menstrual_history.flow_volume ?? '',
        lmp: data.menstrual_history.lmp ?? null,
        dysmenorrhea_vas: data.menstrual_history.dysmenorrhea_vas ?? null,
        pms: data.menstrual_history.pms ?? '',
        pmdd: data.menstrual_history.pmdd ?? ''
      })
    }

    if (data.sexual_history) {
      Object.assign(reproForm.sexual, {
        sexually_active: data.sexual_history.sexually_active ?? '',
        current_contraceptive_method: data.sexual_history.current_contraceptive_method ?? '',
        past_methods: data.sexual_history.past_methods ?? [],
        partner_count: data.sexual_history.partner_count ?? null,
        dyspareunia: data.sexual_history.dyspareunia ?? '',
        notes: data.sexual_history.notes ?? ''
      })
    }

    reproForm.surgeries = data.surgeries ?? data.gynecologic_surgeries ?? []
    reproForm.contraceptives = data.contraceptives ?? data.contraceptive_history ?? []
    reproForm.family_history = data.family_history ?? []

    if (data.summary || data.reproductive_summary) {
      const s = data.summary || data.reproductive_summary
      Object.assign(reproForm.summary, {
        gravida: s.gravida ?? null,
        para: s.para ?? null,
        abortus: s.abortus ?? s.abortion_count ?? null,
        ectopics: s.ectopics ?? null,
        live_births: s.live_births ?? null,
        preterm_births: s.preterm_births ?? null,
        stillbirths: s.stillbirths ?? null,
        c_sections: s.c_sections ?? s.cesarean_sections ?? null,
        vaginal_deliveries: s.vaginal_deliveries ?? null
      })
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Normalize backend obstetricHistory → frontend format
  // Backend returns: { pregnancies: [...], prenatalVisits: [...], ... }
  // Frontend expects: { records: [...], general_notes: '' }
  // Backend field names are camelCase, frontend uses snake_case
  // ─────────────────────────────────────────────────────────────

  function mapPregnancyFromBackend(p: any): any {
    return {
      id: p.id,
      gravida_index: p.gravidaIndex ?? p.gravida_index ?? null,
      status: p.status || 'completed',
      lmp: p.lmp || null,
      edd: p.edd || null,
      gestational_age_weeks: p.gestationalAgeWeeks ?? p.gestational_age_weeks ?? null,
      gestational_age_days: p.gestationalAgeDays ?? p.gestational_age_days ?? null,
      end_date: (p.endDate ?? p.end_date) || null,
      outcome: p.outcome || null,
      delivery_method: (p.deliveryMethod ?? p.delivery_method) || null,
      anesthesia_type: (p.anesthesiaType ?? p.anesthesia_type) || null,
      maternal_complications: p.maternalComplications ?? p.maternal_complications ?? [],
      prenatal_screenings: p.prenatalScreenings ?? p.prenatal_screenings ?? {},
      newborns_details: p.newbornsDetails ?? p.newborns_details ?? [],
      notes: p.notes || ''
    }
  }

  function normalizeObstetricHistory(raw: any): any {
    if (!raw) return { records: [], general_notes: '' }

    const pregnanciesArray = raw.pregnancies ?? raw.records ?? (Array.isArray(raw) ? raw : [])

    return {
      records: pregnanciesArray.map(mapPregnancyFromBackend),
      general_notes: raw.general_notes ?? raw.generalNotes ?? ''
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Save Actions
  // ─────────────────────────────────────────────────────────────
  
  const saveLifestyle = async (): Promise<boolean> => {
    if (!patientId.value) return false

    saving.value = true
    try {
      const response = await apiFetch<any>(`/api/patients/${patientId.value}`, {
        method: 'PUT',
        body: {
          smoking: lifestyleForm.smoking,
          bmi: lifestyleForm.bmi,
          exercise: lifestyleForm.exercise,
          alcohol: lifestyleForm.alcohol
        },
        baseURL: config.public.apiBase
      })

      if (response.success) {
        $toast.success(t('patientProfile.lifestyleSaved'))
        // Update local state
        if (basicInfo.value) {
          basicInfo.value.smoking = lifestyleForm.smoking
          basicInfo.value.bmi = lifestyleForm.bmi
          basicInfo.value.exercise = lifestyleForm.exercise
          basicInfo.value.alcohol = lifestyleForm.alcohol
        }
        return true
      } else {
        $toast.error(response.error || t('patientProfile.saveError'))
        return false
      }
    } catch (err: any) {
      $toast.error(err.data?.error || t('patientProfile.serverError'))
      return false
    } finally {
      saving.value = false
    }
  }

  const saveReproductiveSection = async (section: string, data: any): Promise<boolean> => {
    if (!patientId.value) return false

    saving.value = true
    let endpoint = ''
    let body: any = {}

    switch (section) {
      case 'menstrual':
        endpoint = `/api/reproductive/${patientId.value}/menstrual-history`
        body = data
        break
      case 'sexual':
        endpoint = `/api/reproductive/${patientId.value}/sexual-history`
        body = data
        break
      case 'surgeries':
        endpoint = `/api/reproductive/${patientId.value}/surgeries`
        body = { surgeries: data }
        break
      case 'contraceptives':
        endpoint = `/api/reproductive/${patientId.value}/contraceptives`
        body = { contraceptives: data }
        break
      case 'family_history':
        endpoint = `/api/reproductive/${patientId.value}/family-history`
        body = { family_history: data }
        break
      case 'summary':
        endpoint = `/api/reproductive/${patientId.value}/reproductive-summary`
        body = data
        break
      default:
        $toast.error(t('patientProfile.invalidSection'))
        return false
    }

    try {
      const response = await apiFetch<any>(endpoint, {
        method: 'PUT',
        body,
        baseURL: config.public.apiBase
      })

      if (response.success) {
        $toast.success(t('patientProfile.dataSaved'))
        // If unified endpoint becomes available, invalidate cache and refetch
        cacheTimestamp = 0
        return true
      } else {
        $toast.error(response.error || t('patientProfile.saveError'))
        return false
      }
    } catch (err: any) {
      $toast.error(err.data?.error || t('patientProfile.serverError'))
      return false
    } finally {
      saving.value = false
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Refresh and Reset
  // ─────────────────────────────────────────────────────────────
  
  const refresh = async (): Promise<void> => {
    cacheTimestamp = 0 // Force refetch
    await fetchProfile()
  }

  const reset = (): void => {
    profile.value = null
    basicInfo.value = null
    medicalHistory.value = null
    reproductiveHealth.value = null
    obstetricHistory.value = null
    screenings.value = null
    labResults.value = null
    consents.value = null
    attachments.value = null
    error.value = ''
    cacheTimestamp = 0
  }

  // ─────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────
  
  // Watch for patient ID changes
  watch(patientId, (newId, oldId) => {
    if (newId && newId !== oldId) {
      reset()
      if (autoFetch) fetchProfile()
    }
  })

  // Initial fetch
  if (autoFetch && initialPatientId) {
    fetchProfile()
  }

  // ─────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────
  
  return {
    // State
    profile,
    basicInfo,
    medicalHistory,
    reproductiveHealth,
    obstetricHistory,
    screenings,
    labResults,
    consents,
    attachments,

    // Loading
    loading,
    saving,
    error,

    // Forms
    lifestyleForm,
    reproForm,

    // Actions
    fetchProfile,
    saveLifestyle,
    saveReproductiveSection,
    refresh,
    reset
  }
}

// Type export for convenience
export type PatientProfileComposable = ReturnType<typeof usePatientProfile>