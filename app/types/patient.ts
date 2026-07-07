// ─────────────────────────────────────────────────────────────
// Unified Patient Profile Types
// Based on GET /api/patients/:id/profile endpoint
// ─────────────────────────────────────────────────────────────

export interface PatientAllergy {
  substance: string
  severity: 'خفیف' | 'متوسط' | 'شدید'
  onset_date?: string
  reaction?: string
}

export interface PatientDisease {
  name: string
  diagnosed_at: string
  status?: 'active' | 'resolved' | 'chronic'
  notes?: string
}

export interface PatientMedication {
  name: string
  dosage: string
  frequency?: string
  start_date?: string
  end_date?: string
  notes?: string
}

export interface MedicalHistory {
  diseases: PatientDisease[]
  allergies: PatientAllergy[]
  medications: PatientMedication[]
  family_history?: Array<{
    relation: string
    condition: string
    brca_mutation?: 'بله' | 'خیر' | 'نامشخص'
    notes?: string
  }>
  general_notes?: string
}

export interface MenstrualHistory {
  menarche_age?: number
  cycle_length?: number
  cycle_length_max?: number
  flow_duration?: number
  flow_volume?: string
  lmp?: string | null
  dysmenorrhea_vas?: number
  pms?: string
  pmdd?: string
}

export interface SexualHistory {
  sexually_active?: string
  current_contraceptive_method?: string
  past_methods: string[]
  partner_count?: number
  dyspareunia?: string
  notes?: string
}

export interface GynecologicSurgery {
  surgery_type: string
  surgery_date: string | null
  hospital: string
  notes: string
}

export interface ContraceptiveHistory {
  method: string
  start_date: string | null
  end_date: string | null
  reason_stopped?: string
}

export interface ReproductiveSummary {
  gravida?: number
  para?: number
  abortus?: number
  ectopics?: number
  live_births?: number
  preterm_births?: number
  stillbirths?: number
  c_sections?: number
  vaginal_deliveries?: number
}

export interface ReproductiveHealth {
  menstrual_history?: MenstrualHistory
  sexual_history?: SexualHistory
  gynecologic_surgeries?: GynecologicSurgery[]
  contraceptive_history?: ContraceptiveHistory[]
  reproductive_summary?: ReproductiveSummary
}

export interface PregnancyRecord {
  id?: string
  gravida_index: number
  status: 'current' | 'completed'
  lmp?: string | null
  edd?: string | null
  gestational_age_weeks?: number
  gestational_age_days?: number
  end_date?: string | null
  outcome?: string
  delivery_method?: string
  anesthesia_type?: string
  maternal_complications: Array<{
    title: string
    severity: 'mild' | 'moderate' | 'severe'
    onset_date?: string
    notes?: string
  }>
  prenatal_screenings: {
    nt_done: boolean
    anomaly_done: boolean
    nipt_done: boolean
    gdm_done: boolean
  }
  newborns_details: Array<{
    gender: string
    weight?: number
    height?: number
    head_circumference?: number
    apgar1?: number
    apgar5?: number
    nicu: boolean
  }>
  notes?: string
}

export interface ObstetricHistory {
  records: PregnancyRecord[]
  general_notes?: string
}

export interface ScreeningSchedule {
  id: string
  test_name: string
  scheduled_date: string
  status: 'pending' | 'done' | 'overdue'
  notes?: string
  risk_level?: 'normal' | 'elevated' | 'high'
  created_at?: string
}

export interface ScreeningResult {
  id: string
  test_name: string
  result: string
  test_date: string
  normal: boolean
  notes?: string
  reference_range?: string
}

export interface Screenings {
  schedules: ScreeningSchedule[]
  results: ScreeningResult[]
  overdue: ScreeningSchedule[]
}

export interface LabResult {
  id: string
  test_name: string
  result: string
  reference_range?: string
  abnormal: boolean
  performed_date: string
  notes?: string
  patient_id?: string
  created_at?: string
}

export interface LabResults {
  results: LabResult[]
}

export interface ConsentRecord {
  id: string
  type: string
  description?: string
  date: string
  revoked_at?: string
  status: 'active' | 'revoked'
}

export interface Consents {
  records: ConsentRecord[]
}

export interface Attachment {
  id: string
  category: 'ultrasound' | 'lab' | 'prescription'
  name: string
  fileName?: string
  filePath: string
  uploaded_at?: string
  size?: number
}

export interface Attachments {
  ultrasound: Attachment[]
  lab: Attachment[]
  prescription: Attachment[]
}

// Main unified profile structure
export interface PatientProfile {
  basicInfo: {
    id: string
    first_name: string
    last_name: string
    national_id: string
    insurance_code?: string
    insurance_type?: string
    phone?: string
    marital_status?: string
    birth_date?: string
    address?: string
    smoking?: string
    bmi?: number
    exercise?: string
    alcohol?: string
    latest_visit?: {
      pregnancy_notes?: string
      visit_date?: string
    }
    createdAt?: string
    updatedAt?: string
  }

  medicalHistory: MedicalHistory
  reproductiveHealth: ReproductiveHealth
  obstetricHistory: ObstetricHistory
  screenings: Screenings
  labResults: LabResults
  consents: Consents
  attachments: Attachments
}

// Form models for editing
export interface LifestyleForm {
  smoking: string
  bmi: number | null
  exercise: string
  alcohol: string
}

export interface ReproForm {
  menstrual: MenstrualHistory
  sexual: SexualHistory
  surgeries: GynecologicSurgery[]
  contraceptives: ContraceptiveHistory[]
  family_history: Array<{
    relation: string
    condition: string
    brca_mutation: string
    notes: string
  }>
  summary: ReproductiveSummary
}