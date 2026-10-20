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
  fileType: string
  fileSize: number
  mimeType: string
  storagePath: string
  createdAt: string
  downloadUrl: string | null
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
    is_foreign?: boolean
    nationality?: string
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

// ─────────────────────────────────────────────────────────────
// Accurate shape of GET /api/patients/:id/profile
// The endpoint returns camelCase (see PatientProfileService), unlike
// the legacy GET /api/patients/:id which mixes both casings.
// ─────────────────────────────────────────────────────────────

export interface ProfileDisease {
  id: string
  name: string
  diagnosedAt?: string | null
  isActive?: boolean | null
  notes?: string | null
}

export interface ProfileMedication {
  id: string
  name: string
  dosage?: string | null
  isCurrent?: boolean | null
  notes?: string | null
}

export interface ProfileAllergy {
  id: string
  substance: string
  severity?: string | null
  createdAt?: string | null
}

export interface ProfileVaccination {
  id: string
  vaccineName: string
  doseNumber?: string | null
  dateAdministered?: string | null
  lotNumber?: string | null
  manufacturer?: string | null
  site?: string | null
  administeredBy?: string | null
  nextDoseDate?: string | null
  status?: string | null
  notes?: string | null
}

export interface ProfilePregnancy {
  id: string
  gravidaIndex?: number | null
  status?: string | null
  lmp?: string | null
  edd?: string | null
  endDate?: string | null
  gestationalAgeWeeks?: number | null
  gestationalAgeDays?: number | null
  outcome?: string | null
  deliveryMethod?: string | null
  anesthesiaType?: string | null
  maternalComplications?: unknown[] | null
  prenatalScreenings?: Record<string, unknown> | null
  newbornsDetails?: unknown[] | null
  notes?: string | null
}

export interface ProfileVisit {
  id: string
  visitType?: string | null
  visitReason?: string | null
  notes?: string | null
  visitDate: string
  durationMinutes?: number | null
  status?: string | null
  nextVisitDate?: string | null
  doctorId?: string | null
}

export interface ProfileScreeningSchedule {
  id: string
  screeningType: string
  dueDate: string
  status?: string | null
  riskLevel?: string | null
  notes?: string | null
}

export interface ProfileScreeningResult {
  id: string
  screeningType: string
  performedDate: string
  result?: string | null
  resultDetails?: Record<string, unknown> | null
  facilityName?: string | null
  notes?: string | null
  nextDueDate?: string | null
}

export interface ProfileLabResult {
  id: string
  category: string
  testName: string
  value?: string | null
  unit?: string | null
  referenceRangeLow?: string | null
  referenceRangeHigh?: string | null
  isAbnormal?: boolean | null
  performedDate: string
  notes?: string | null
}

export interface ProfileMenstrualHistory {
  menarcheAge?: number | null
  cycleLength?: number | null
  cycleLengthMax?: number | null
  flowDuration?: number | null
  flowSeverity?: string | null
  lmpDate?: string | null
  dysmenorrheaSeverity?: string | null
  dysmenorrheaVAS?: number | null
  pmsPmdd?: string | null
  intermenstrualBleeding?: boolean | null
  notes?: string | null
}

export interface ProfileSexualHistory {
  isActive?: boolean | null
  partnersCount?: number | null
  dyspareunia?: string | null
  dyspareuniaNotes?: string | null
  notes?: string | null
}

export interface ProfileSurgery {
  id: string
  surgeryType: string
  surgeryDate?: string | null
  hospital?: string | null
  surgeonName?: string | null
  indication?: string | null
  findings?: string | null
  notes?: string | null
}

export interface ProfileContraceptive {
  id: string
  method: string
  startDate?: string | null
  endDate?: string | null
  isCurrent?: boolean | null
  reasonForDiscontinuation?: string | null
  notes?: string | null
}

export interface ProfileFamilyHistory {
  id: string
  relationship: string
  condition: string
  ageAtDiagnosis?: number | null
  isDeceased?: boolean | null
  notes?: string | null
}

export interface ProfileReproductiveSummary {
  gravida?: number | null
  para?: number | null
  abortus?: number | null
  ectopics?: number | null
  liveBirths?: number | null
  pretermBirths?: number | null
  stillbirths?: number | null
  cSections?: number | null
  vaginalDeliveries?: number | null
}

export interface ProfileAttachment {
  id: string
  fileType: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  storagePath: string
  createdAt: string
  downloadUrl: string | null
}

export interface ProfileConsent {
  id: string
  consentType?: string
  type?: string
  grantedAt?: string
  date?: string
  revokedAt?: string | null
  status?: string
}

export interface PatientFullProfile {
  basicInfo: {
    id: string
    firstName: string | null
    lastName: string | null
    nationalId: string | null
    isForeign?: boolean | null
    nationality?: string | null
    insuranceCode: string | null
    insuranceType: string | null
    insuranceInfo?: { key: string; label: string; logo: string } | null
    birthDate: string | null
    birthDateExact?: boolean | null
    phone: string | null
    address: string | null
    maritalStatus: string | null
    smoking?: string | null
    bmi?: string | number | null
    exercise?: string | null
    alcohol?: string | null
    confidentialNotes?: string | null
    createdAt?: string
    updatedAt?: string
  }
  medicalHistory: {
    diseases: ProfileDisease[]
    medications: ProfileMedication[]
    allergies: ProfileAllergy[]
    vaccinations: ProfileVaccination[]
  }
  reproductiveHealth: {
    menstrualHistory: ProfileMenstrualHistory | null
    sexualHistory: ProfileSexualHistory | null
    surgeries: ProfileSurgery[]
    contraceptives: ProfileContraceptive[]
    familyHistory: ProfileFamilyHistory[]
    summary: ProfileReproductiveSummary | null
  }
  obstetricHistory: {
    pregnancies: ProfilePregnancy[]
    prenatalVisits: unknown[]
    fetalMeasurements: unknown[]
    postpartumCare: unknown | null
  }
  visits: ProfileVisit[]
  screenings: {
    schedules: ProfileScreeningSchedule[]
    results: ProfileScreeningResult[]
  }
  labResults: ProfileLabResult[]
  consents: ProfileConsent[]
  attachments: {
    ultrasound: ProfileAttachment[]
    lab: ProfileAttachment[]
    prescription: ProfileAttachment[]
    patientFiles: ProfileAttachment[]
    other: ProfileAttachment[]
  }
}

export interface PatientProfileResponse {
  success: boolean
  data: PatientFullProfile
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

// List / pagination types (GET /api/patients)
export interface PatientListItem {
  id: string
  firstName: string | null
  lastName: string | null
  nationalId: string | null
  isForeign: boolean | null
  nationality: string | null
  phone: string | null
  birthDate: string | null
  birthDateExact: boolean | null
  insuranceCode: string | null
  insuranceType: string | null
  maritalStatus: string | null
  createdAt: string
}

export interface PatientPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface PatientsListResponse {
  success: boolean
  data: PatientListItem[]
  pagination?: PatientPagination
}