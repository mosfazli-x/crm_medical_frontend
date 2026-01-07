<template>
    <div class="calendar-container px-4 py-6 md:px-8 lg:px-12">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl md:text-3xl font-bold text-slate-800 truncate">تقویم کاری</h1>
        </div>

        <FullCalendar ref="calendarRef" :options="calendarOptions" />

        <!-- مدال ثبت/ویرایش نوبت - حالا responsive -->
        <v-dialog v-model="visitDialog" persistent scrollable :fullscreen="isMobile" transition="dialog-bottom-transition">
            <v-card class="rounded-t-3xl md:rounded-2xl shadow-2xl">
                <v-card-title class="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-5 px-6 md:py-6 md:px-8">
                    <div class="flex items-center justify-between w-full">
                        <h2 class="text-xl md:text-2xl font-bold">
                            {{ isEditMode ? 'ویرایش نوبت ویزیت' : 'ثبت نوبت ویزیت جدید' }}
                        </h2>
                        <v-btn icon variant="text" size="large" class="text-white hover:opacity-50" @click="closeVisitDialog">
                            <CloseCircle class="w-7 h-7" />
                        </v-btn>
                    </div>
                </v-card-title>

                <v-card-text class="pt-6 px-6 md:pt-8 md:px-8">
                    <v-row dense>
                        <!-- انتخاب بیمار -->
                        <v-col cols="12">
                            <v-autocomplete v-model="selectedPatient" :items="patients" item-title="fullName" item-value="id" label="انتخاب بیمار *" variant="outlined" density="comfortable" prepend-inner-icon="mdi-account" clearable :loading="patientsLoading">
                                <template v-slot:no-data>
                                    <div class="pa-4 text-center text-slate-500">
                                        {{ patientsLoading ? 'در حال بارگذاری...' : 'بیماری یافت نشد' }}
                                    </div>
                                </template>
                            </v-autocomplete>
                        </v-col>

                        <!-- زمان شروع و پایان -->
                        <v-col cols="12" md="6">
                            <label class="text-sm font-medium text-slate-700 mb-2 block">زمان شروع *</label>
                            <PersianDatetimePicker v-model="newVisit.start" type="datetime" display-format="jYYYY/jMM/jDD - HH:mm" format="YYYY-MM-DD HH:mm:ss" color="#6366f1" auto-submit custom-input class="w-full" />
                        </v-col>
                        <v-col cols="12" md="6">
                            <label class="text-sm font-medium text-slate-700 mb-2 block">زمان پایان</label>
                            <PersianDatetimePicker v-model="newVisit.end" type="datetime" display-format="jYYYY/jMM/jDD - HH:mm" format="YYYY-MM-DD HH:mm:ss" color="#6366f1" auto-submit custom-input class="w-full" />
                        </v-col>

                        <!-- نوع ویزیت -->
                        <v-col cols="12" md="6">
                            <v-select v-model="newVisit.type" :items="visitTypes" label="نوع ویزیت" variant="outlined" density="comfortable" prepend-inner-icon="mdi-stethoscope" />
                        </v-col>

                        <!-- وضعیت نوبت -->
                        <v-col cols="12" md="6">
                            <v-select v-model="newVisit.status" :items="['تایید شده', 'در انتظار', 'لغو شده']" label="وضعیت نوبت" variant="outlined" density="comfortable" prepend-inner-icon="mdi-calendar-check" />
                        </v-col>

                        <!-- یادداشت -->
                        <v-col cols="12">
                            <v-textarea v-model="newVisit.notes" label="یادداشت پزشک (اختیاری)" variant="outlined" rows="4" density="comfortable" prepend-inner-icon="mdi-note-text" />
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions class="px-6 py-5 md:px-8 md:py-6 bg-slate-50 border-t flex flex-col-reverse md:flex-row gap-3">
                    <v-spacer class="hidden md:block" />
                    <v-btn v-if="isEditMode" color="error" variant="outlined" size="large" @click="deleteVisit">
                        حذف نوبت
                    </v-btn>
                    <v-btn color="grey-darken-1" variant="text" size="large" class="w-full md:w-auto" @click="closeVisitDialog">
                        انصراف
                    </v-btn>
                    <v-btn color="indigo-darken-1" variant="elevated" size="large" class="px-8 shadow-lg w-full md:w-auto" :loading="saving" @click="saveVisit">
                        {{ isEditMode ? 'به‌روزرسانی نوبت' : 'ثبت نوبت' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import faLocale from '@fullcalendar/core/locales/fa'
import { ref, onMounted } from 'vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import { useEventBus } from '~/composables/useEventBus'

const calendarRef = ref<any>(null)
const isMobile = ref(window.innerWidth < 768)

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { emit } = useEventBus()

// لیست بیماران از بک‌اند
const patients = ref<any[]>([])
const patientsLoading = ref(false)

// حالت مدال
const visitDialog = ref(false)
const saving = ref(false)
const isEditMode = ref(false) // جدید: ویرایش یا ثبت جدید
const currentVisitId = ref<string | null>(null) // id نوبت برای ویرایش/حذف

const newVisit = ref({
    start: '',
    end: '',
    patientId: null as string | null,
    type: 'ویزیت اولیه',
    status: 'تایید شده',
    notes: '',
})

const visitTypes = ['ویزیت اولیه', 'پیگیری', 'چکاپ بارداری', 'چکاپ دوره‌ای', 'اورژانسی']

const selectedPatient = computed({
    get: () => newVisit.value.patientId,
    set: (val) => (newVisit.value.patientId = val),
})

const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  const api = calendarRef.value?.getApi()
  if (!api) return

  if (isMobile.value) {
    api.changeView('timeGridDay')
  } else {
    api.changeView('timeGridWeek')
  }
}

const closeVisitDialog = () => {
    visitDialog.value = false
    isEditMode.value = false
    currentVisitId.value = null
    newVisit.value = {
        start: '',
        end: '',
        patientId: null,
        type: 'ویزیت اولیه',
        status: 'تایید شده',
        notes: '',
    }
}

// دریافت لیست بیماران
const fetchPatients = async () => {
    patientsLoading.value = true
    try {
        const response = await apiFetch('/api/visits/patients')
        if (response.success) {
            patients.value = response.data
        }
    } catch (err) {
        $toast.error('خطا در دریافت لیست بیماران')
    } finally {
        patientsLoading.value = false
    }
}

// ثبت یا ویرایش نوبت
const saveVisit = async () => {
    if (!newVisit.value.patientId || !newVisit.value.start) {
        $toast.error('لطفاً بیمار و زمان شروع را انتخاب کنید')
        return
    }

    saving.value = true
    try {
        const startISO = new Date(newVisit.value.start.replace(' ', 'T') + ':00').toISOString()

        const payload = {
            patientId: newVisit.value.patientId,
            visitDate: startISO,
            visitType: newVisit.value.type,
            reason: null,
            notes: newVisit.value.notes || null,
            durationMinutes: newVisit.value.end
                ? Math.round((new Date(newVisit.value.end.replace(' ', 'T') + ':00').getTime() - new Date(startISO).getTime()) / 60000)
                : 30,
        }

        let response
        if (isEditMode.value && currentVisitId.value) {
            response = await apiFetch(`/api/visits/${currentVisitId.value}`, {
                method: 'PUT',
                body: payload,
            })
        } else {
            response = await apiFetch('/api/visits', {
                method: 'POST',
                body: payload,
            })
        }

        if (response.success) {
            $toast.success(isEditMode.value ? 'نوبت به‌روزرسانی شد' : 'نوبت ثبت شد')
            closeVisitDialog()
            calendarRef.value?.getApi()?.refetchEvents()
        } else {
            $toast.error(response.error || 'خطا')
        }
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
    } finally {
        saving.value = false
    }
}


// حذف نوبت
const deleteVisit = async () => {
    if (!currentVisitId.value || !confirm('آیا از حذف این نوبت مطمئن هستید؟')) return

    try {
        const response = await apiFetch(`/api/visits/${currentVisitId.value}`, {
            method: 'DELETE',
        })

        if (response.success) {
            $toast.success('نوبت حذف شد')
            closeVisitDialog()
            calendarRef.value?.getApi()?.refetchEvents()
            // تقویم اتوماتیک رفرش می‌شه
        } else {
            $toast.error(response.error || 'خطا در حذف')
        }
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا')
    }
}

// دسترسی به API تقویم

const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    height: 'auto',
    locale: faLocale,
    direction: 'rtl',
    nowIndicator: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    buttonText: {
        today: 'امروز',
        month: 'ماه',
        week: 'هفته',
        day: 'روز'
    },

    // دریافت ویزیت‌ها از بک‌اند
    events: async (fetchInfo, successCallback, failureCallback) => {
        try {
            const events = await apiFetch('/api/visits', {
                query: {
                    start: fetchInfo.startStr,
                    end: fetchInfo.endStr,
                },
            })
            successCallback(events)
        } catch (err) {
            failureCallback(err)
            $toast.error('خطا در دریافت ویزیت‌ها')
        }
    },

    eventDrop: async (info) => {
        try {
            await apiFetch(`/api/visits/${info.event.id}`, {
                method: 'PUT',
                body: {
                    visitDate: info.event.start.toISOString(),
                    // duration اگر تغییر کرده
                },
            })
            $toast.success('زمان نوبت به‌روزرسانی شد')
            calendarRef.value?.getApi()?.refetchEvents()
        } catch {
            info.revert()
            $toast.error('خطا در به‌روزرسانی')
        }
    },
    eventResize: async (info) => {
        // مشابه eventDrop اما برای تغییر مدت زمان
    },

    // انتخاب بازه زمانی برای نوبت جدید
    select: (info) => {
        calendarRef.value?.getApi()?.unselect()
        newVisit.value.start = info.startStr.slice(0, 16).replace('T', ' ')
        newVisit.value.end = info.endStr ? info.endStr.slice(0, 16).replace('T', ' ') : ''

        isEditMode.value = false
        currentVisitId.value = null
        visitDialog.value = true
        calendarRef.value?.getApi()
    },

    eventClick: (info) => {
        const event = info.event

        newVisit.value = {
            start: event.startStr.slice(0, 16).replace('T', ' '),
            end: event.endStr ? event.endStr.slice(0, 16).replace('T', ' ') : '',
            patientId: event.extendedProps.patientId || null,
            type: event.extendedProps.type || 'ویزیت اولیه',
            status: 'تایید شده',
            notes: event.extendedProps.notes || '',
        }

        currentVisitId.value = event.id
        isEditMode.value = true
        visitDialog.value = true
    },

})

onMounted(() => {
    fetchPatients()
    handleResize()
    window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})


useSeoMeta({
    title: 'تقویم کاری',
    ogTitle: 'تقویم',
})

</script>

<style scoped>
.calendar-container {
    max-width: 1400px;
    margin: 0 auto;
    min-height: 100vh;
}

@media (max-width: 767px) {
  :deep(.fc-toolbar) {
    padding: 12px 16px !important;
    flex-direction: column;
    gap: 8px;
  }

  :deep(.fc-toolbar-chunk) {
    display: flex;
    justify-content: center;
  }

  :deep(.fc-toolbar-title) {
    font-size: 1.4rem !important;
  }

  :deep(.fc-button) {
    padding: 6px 12px !important;
    font-size: 0.875rem !important;
  }

  :deep(.fc-timegrid-slot-label) {
    font-size: 0.75rem !important;
  }

  :deep(.fc-event) {
    font-size: 0.8rem !important;
    padding: 4px 8px !important;
  }
}

:deep(.fc) {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

:deep(.fc-toolbar) {
    padding: 24px 32px 16px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
}

:deep(.fc-toolbar-title) {
    font-size: 1.8rem !important;
    font-weight: 700;
}

:deep(.fc-button) {
    background: rgba(255, 255, 255, 0.2) !important;
    border: none !important;
    color: white !important;
    border-radius: 12px !important;
    padding: 10px 20px !important;
    font-weight: 600;
    transition: all 0.3s ease;
}

:deep(.fc-button:hover) {
    background: rgba(255, 255, 255, 0.3) !important;
    transform: translateY(-2px);
}

:deep(.fc-button-active) {
    background: white !important;
    color: #6366f1 !important;
}

:deep(.fc-event) {
    border-radius: 12px;
    padding: 8px 12px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
}

:deep(.fc-event:hover) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

:deep(.fc-button-group) {
    gap: 4px !important;
}

:deep(.vpd-input-group input) {
    border: 1px solid #ABABAB;
    border-radius: 4px;
    height: 49px;
    padding: 0 16px;
    font-size: 1rem;
    background: white;
    transition: all 0.2s;
}

:deep(.vpd-icon-btn) {
    display: none;
}
</style>