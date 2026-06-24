<template>
    <div class="mx-auto max-w-7xl px-4 py-8 md:px-8 min-h-screen">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">تقویم ویزیت‌ها</h1>
        </div>

        <div class="bg-white dark:bg-slate-800! rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </div>

        <v-dialog v-model="visitDialog" persistent scrollable :fullscreen="isMobile"
            transition="dialog-bottom-transition" max-width="700px">
            <v-card class="md:rounded-2xl shadow-2xl border-0 overflow-hidden bg-white dark:bg-slate-800">
                <v-card-title class="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 py-5 px-6 md:px-8">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {{ isEditMode ? 'ویرایش اطلاعات نوبت' : 'ثبت نوبت جدید' }}
                        </h2>
                        <v-btn icon variant="text"
                            class="text-slate-400 dark:text-slate-500 hover:text-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full"
                            @click="closeVisitDialog">
                            <CloseCircle class="w-6 h-6" />
                        </v-btn>
                    </div>
                </v-card-title>

                <v-card-text class="pt-6 px-6 md:pt-8 md:px-8 bg-slate-50/50 dark:bg-slate-800/50">
                    <v-row>
                        <v-col cols="12">
                            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">بیمار <span
                                    class="text-red-500">*</span></label>
                            <v-autocomplete v-model="newVisit.patientId" :items="patients" item-title="fullName"
                                item-value="id" placeholder="جستجو و انتخاب بیمار..." variant="outlined"
                                density="comfortable" prepend-inner-icon="mdi-account-search-outline" clearable
                                hide-details="auto" :loading="patientsLoading">
                                <template v-slot:no-data>
                                    <div class="pa-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                                        {{ patientsLoading ? 'در حال جستجو...' : 'بیماری در سیستم یافت نشد.' }}
                                    </div>
                                </template>
                            </v-autocomplete>
                        </v-col>

                        <v-col cols="12" md="6">
                            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">زمان شروع <span
                                    class="text-red-500">*</span></label>
                            <PersianDatetimePicker v-model="newVisit.start" type="datetime"
                                display-format="jYYYY/jMM/jDD - HH:mm" format="YYYY-MM-DD HH:mm:ss" color="#5465ff"
                                auto-submit custom-input class="w-full" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">زمان پایان</label>
                            <PersianDatetimePicker v-model="newVisit.end" type="datetime"
                                display-format="jYYYY/jMM/jDD - HH:mm" format="YYYY-MM-DD HH:mm:ss" color="#5465ff"
                                auto-submit custom-input class="w-full" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">نوع ویزیت</label>
                            <v-select v-model="newVisit.type" :items="visitTypes" variant="outlined"
                                density="comfortable" hide-details="auto" />
                        </v-col>

                        <v-col cols="12" md="6">
                            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">وضعیت</label>
                            <v-select v-model="newVisit.status" :items="['تایید شده', 'در انتظار', 'لغو شده']"
                                variant="outlined" density="comfortable" hide-details="auto" />
                        </v-col>

                        <v-col cols="12">
                            <label class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">یادداشت پزشک</label>
                            <v-textarea v-model="newVisit.notes" placeholder="در صورت نیاز توضیحاتی وارد کنید..."
                                variant="outlined" rows="3" density="comfortable" hide-details="auto" />
                        </v-col>
                    </v-row>
                </v-card-text>

                <v-card-actions
                    class="px-6 py-5 md:px-8 md:py-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex flex-col-reverse md:flex-row gap-3">
                    <v-btn v-if="isEditMode" color="red-darken-1" variant="text" size="large"
                        class="w-full md:w-auto font-medium tracking-wide rounded-lg" @click="deleteVisit">
                        حذف نوبت
                    </v-btn>

                    <v-spacer class="hidden md:block" />

                    <v-btn color="slate-600" variant="tonal" size="large"
                        class="w-full md:w-auto font-medium tracking-wide rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600"
                        @click="closeVisitDialog">
                        انصراف
                    </v-btn>

                    <v-btn color="#5465ff" variant="flat" size="large"
                        class="px-8 w-full md:w-auto font-medium tracking-wide rounded-lg shadow-md shadow-periwinkle"
                        :loading="saving" @click="saveVisit">
                        {{ isEditMode ? 'ذخیره تغییرات' : 'ثبت نوبت' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import faLocale from '@fullcalendar/core/locales/fa'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import { useEventBus } from '~/composables/useEventBus'

// نوع دهی بهتر برای تقویم
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const isMobile = ref(window.innerWidth < 768)

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { emit } = useEventBus()

const patients = ref<any[]>([])
const patientsLoading = ref(false)

const visitDialog = ref(false)
const saving = ref(false)
const isEditMode = ref(false)
const currentVisitId = ref<string | null>(null)

const visitTypes = ['ویزیت اولیه', 'پیگیری', 'چکاپ بارداری', 'چکاپ دوره‌ای', 'اورژانسی']

const newVisit = ref({
    start: '',
    end: '',
    patientId: null as string | null,
    type: 'ویزیت اولیه',
    status: 'تایید شده',
    notes: '',
})

// مدیریت ریسایز و ویو تقویم به صورت مستقیم
const handleResize = () => {
    isMobile.value = window.innerWidth < 768
    const api = calendarRef.value?.getApi()
    if (api) {
        api.changeView(isMobile.value ? 'timeGridDay' : 'timeGridWeek')
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

// در این تابع، دریافت دیتا مستقیما در mounted صدا زده میشود اما برای رفرش شدن دستی هم در دسترس است
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

const saveVisit = async () => {
    if (!newVisit.value.patientId || !newVisit.value.start) {
        $toast.error('لطفاً بیمار و زمان شروع را انتخاب کنید.')
        return
    }

    saving.value = true
    try {
        // تبدیل امن‌تر تاریخ‌ها به استاندارد ISO
        const startISO = new Date(newVisit.value.start.replace(' ', 'T') + ':00').toISOString()
        let durationMinutes = 30

        if (newVisit.value.end) {
            const endISO = new Date(newVisit.value.end.replace(' ', 'T') + ':00').toISOString()
            durationMinutes = Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000)
        }

        const payload = {
            patientId: newVisit.value.patientId,
            visitDate: startISO,
            visitType: newVisit.value.type,
            reason: null,
            notes: newVisit.value.notes || null,
            durationMinutes: durationMinutes > 0 ? durationMinutes : 30, // جلوگیری از زمان منفی
        }

        const endpoint = isEditMode.value && currentVisitId.value ? `/api/visits/${currentVisitId.value}` : '/api/visits'
        const method = isEditMode.value && currentVisitId.value ? 'PUT' : 'POST'

        const response = await apiFetch(endpoint, { method, body: payload })

        if (response.success) {
            $toast.success(isEditMode.value ? 'نوبت با موفقیت به‌روزرسانی شد.' : 'نوبت جدید ثبت شد.')
            closeVisitDialog()
            calendarRef.value?.getApi()?.refetchEvents()
        } else {
            $toast.error(response.error || 'خطایی رخ داد.')
        }
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
    } finally {
        saving.value = false
    }
}

const deleteVisit = async () => {
    if (!currentVisitId.value || !confirm('آیا از حذف دائم این نوبت اطمینان دارید؟')) return

    try {
        const response = await apiFetch(`/api/visits/${currentVisitId.value}`, { method: 'DELETE' })
        if (response.success) {
            $toast.success('نوبت با موفقیت حذف شد.')
            closeVisitDialog()
            calendarRef.value?.getApi()?.refetchEvents()
        } else {
            $toast.error(response.error || 'خطا در حذف نوبت')
        }
    } catch (err: any) {
        $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
    }
}

// تنظیمات تقویم مینیمال
const calendarOptions = ref({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridDay,timeGridWeek,dayGridMonth'
    },
    height: 'auto',
    locale: faLocale,
    direction: 'rtl',
    nowIndicator: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    slotMinTime: '07:00:00',
    slotMaxTime: '22:00:00',
    slotDuration: '00:30:00',
    allDaySlot: false, // برای نوبت دهی پزشکی معمولاً نیاز نیست
    buttonText: {
        today: 'امروز',
        month: 'ماه',
        week: 'هفته',
        day: 'روز'
    },

    events: async (fetchInfo: any, successCallback: Function, failureCallback: Function) => {
        try {
            const events = await apiFetch('/api/visits', {
                query: { start: fetchInfo.startStr, end: fetchInfo.endStr },
            })
            successCallback(events)
        } catch (err) {
            failureCallback(err)
            $toast.error('خطا در بارگذاری تقویم')
        }
    },

    eventDrop: async (info: any) => {
        try {
            await apiFetch(`/api/visits/${info.event.id}`, {
                method: 'PUT',
                body: { visitDate: info.event.start.toISOString() },
            })
            $toast.success('زمان ویزیت تغییر کرد.')
        } catch {
            info.revert()
            $toast.error('امکان تغییر زمان وجود ندارد.')
        }
    },

    eventResize: async (info: any) => {
        try {
            const diffMins = Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60000)
            await apiFetch(`/api/visits/${info.event.id}`, {
                method: 'PUT',
                body: {
                    visitDate: info.event.start.toISOString(),
                    durationMinutes: diffMins
                },
            })
            $toast.success('مدت زمان ویزیت تغییر کرد.')
        } catch {
            info.revert()
            $toast.error('امکان تغییر زمان وجود ندارد.')
        }
    },

    select: (info: any) => {
        calendarRef.value?.getApi()?.unselect()
        newVisit.value.start = info.startStr.slice(0, 16).replace('T', ' ')
        newVisit.value.end = info.endStr ? info.endStr.slice(0, 16).replace('T', ' ') : ''

        isEditMode.value = false
        currentVisitId.value = null
        visitDialog.value = true
    },

    eventClick: (info: any) => {
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
    title: 'تقویم نوبت‌دهی | سیستم مدیریت',
})
</script>

<style scoped>
/* استایل‌های عمیق مینیمال شده برای تقویم */
:deep(.fc) {
    font-family: inherit;
    color: #334155;
    background: #ffffff;
}

.dark :deep(.fc) {
    color: #e2e8f0;
    background: #1e293b;
}

:deep(.fc-toolbar) {
    padding: 24px !important;
    margin-bottom: 0 !important;
    border-bottom: 1px solid #f1f5f9;
    background-color: #ffffff;
}

.dark :deep(.fc-toolbar) {
    border-bottom: 1px solid #334155;
    background-color: #1e293b;
}

:deep(.fc-toolbar-title) {
    font-size: 1rem !important;
    font-weight: 800;
    color: #1e293b;
}

.dark :deep(.fc-toolbar-title) {
    color: #e2e8f0;
}

:deep(.fc-button) {
    background-color: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    color: #475569 !important;
    border-radius: 8px !important;
    padding: 8px 16px !important;
    font-weight: 500;
    font-size: 0.875rem !important;
    box-shadow: none !important;
    text-transform: capitalize;
    transition: all 0.2s ease;
}

.dark :deep(.fc-button) {
    background-color: #334155 !important;
    border-color: #475569 !important;
    color: #e2e8f0 !important;
}

:deep(.fc-button:hover) {
    background-color: #f1f5f9 !important;
    color: #0f172a !important;
}

.dark :deep(.fc-button:hover) {
    background-color: #475569 !important;
    color: #f8fafc !important;
}

:deep(.fc-button-active) {
    background-color: #5465ff !important;
    border-color: #5465ff !important;
    color: white !important;
}

:deep(.fc-button:focus) {
    box-shadow: 0 0 0 2px #bfd7ff !important;
}

:deep(.fc-theme-standard th) {
    border: none;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px 0;
    background: #f8fafc;
    font-weight: 600;
    color: #64748b;
}

.dark :deep(.fc-theme-standard th) {
    border-bottom: 1px solid #334155;
    background: #1e293b;
    color: #94a3b8;
}

:deep(.fc-theme-standard td) {
    border-color: #f1f5f9;
}

.dark :deep(.fc-theme-standard td) {
    border-color: #334155;
}

:deep(.fc-scrollgrid) {
    border-color: #f1f5f9;
}

.dark :deep(.fc-scrollgrid) {
    border-color: #334155;
}

:deep(.fc-timegrid-col),
:deep(.fc-daygrid-day) {
    background: #ffffff;
}

.dark :deep(.fc-timegrid-col),
.dark :deep(.fc-daygrid-day) {
    background: #1e293b;
}

:deep(.fc-day-today) {
    background: #eef2ff !important;
}

.dark :deep(.fc-day-today) {
    background: #1a2744 !important;
}

:deep(.fc-non-business) {
    background: #f8fafc;
}

.dark :deep(.fc-non-business) {
    background: #162032;
}

:deep(.fc-highlight) {
    background: #bfd7ff !important;
    opacity: 0.3;
}

.dark :deep(.fc-highlight) {
    background: #3b5a9a !important;
}

:deep(.fc-timegrid-now-indicator-line) {
    border-color: #ef4444;
}

.dark :deep(.fc-timegrid-now-indicator-line) {
    border-color: #f87171;
}

.dark :deep(.fc-timegrid-slot) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-slot-lane) {
    background: #1e293b;
}

.dark :deep(.fc-scrollgrid-section > td) {
    background: #1e293b;
}

.dark :deep(.fc-scrollgrid-section-header > td) {
    background: #1e293b;
}

.dark :deep(.fc-scrollgrid-sync-table) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-axis) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-axis-frame) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-axis-cushion) {
    color: #64748b;
}

.dark :deep(.fc-col-header-cell-cushion) {
    color: #94a3b8;
}

.dark :deep(.fc-daygrid-day-top) {
    color: #cbd5e1;
}

.dark :deep(.fc-daygrid-day-number) {
    color: #cbd5e1;
}

.dark :deep(.fc-daygrid-day-events) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-col-events) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-col-frame) {
    background: #1e293b;
}

.dark :deep(.fc-view-harness) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-slots) {
    background: #1e293b;
}

.dark :deep(.fc-daygrid-body) {
    background: #1e293b;
}

.dark :deep(.fc-daygrid-body-unbalanced) {
    background: #1e293b;
}

.dark :deep(.fc-timegrid-body) {
    background: #1e293b;
}

.dark :deep(.fc-bg-event) {
    opacity: 0.15;
}

.dark :deep(.fc-popover) {
    background: #1e293b;
    border-color: #475569;
}

.dark :deep(.fc-popover-title) {
    color: #e2e8f0;
}

.dark :deep(.fc-daygrid-more-popover .fc-daygrid-event) {
    background: #1e3a5f;
    color: #93c5fd;
}

.dark :deep(.fc-view-harness-active) {
    background: #1e293b;
}

.dark :deep(.fc-scrollgrid-liquid) {
    background: #1e293b;
}

.dark :deep(.fc-scroller::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
}

.dark :deep(.fc-scroller::-webkit-scrollbar-track) {
    background: #1e293b;
}

.dark :deep(.fc-scroller::-webkit-scrollbar-thumb) {
    background: #475569;
    border-radius: 4px;
}

.dark :deep(.fc-scroller::-webkit-scrollbar-thumb:hover) {
    background: #64748b;
}

:deep(.fc-more-popover) {
    background: #ffffff;
    border-color: #e2e8f0;
}

.dark :deep(.fc-more-popover) {
    background: #1e293b;
    border-color: #475569;
}

.dark :deep(.fc-more-popover .fc-popover-title) {
    color: #e2e8f0;
}

.dark :deep(.fc-popover-header) {
    background: #334155;
}

.dark :deep(.fc-popover-body) {
    background: #1e293b;
}

/* استایل زیبای کارت رویدادها */
:deep(.fc-event) {
    border: none;
    border-right: 3px solid #5465ff;
    /* خط کنار رویداد (RTL) */
    background-color: #e2fdff;
    color: #5465ff;
    border-radius: 6px;
    padding: 3px 6px;
    font-size: 0.8rem;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    margin: 1px 2px;
}

:deep(.fc-event:hover) {
    background-color: #bfd7ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(84, 101, 255, 0.1);
}

.dark :deep(.fc-event) {
    border-right-color: #788bff;
    background-color: #1e3a5f;
    color: #93c5fd;
}

.dark :deep(.fc-event:hover) {
    background-color: #2a4a7a;
    box-shadow: 0 4px 6px -1px rgba(120, 139, 255, 0.2);
}

:deep(.fc-timegrid-slot-label-cushion) {
    color: #94a3b8;
    font-weight: 500;
    font-size: 0.8rem;
}

.dark :deep(.fc-timegrid-slot-label-cushion) {
    color: #64748b;
}

:deep(.fc-now-indicator-line) {
    border-color: #ef4444;
}

:deep(.fc-now-indicator-arrow) {
    border-color: #ef4444;
    background-color: #ef4444;
}

:deep(.fc-button-group) {
    gap: 4px
}

:deep(.fc-daygrid-more-link) {
    color: #5465ff;
    font-weight: 600;
}

.dark :deep(.fc-daygrid-more-link) {
    color: #93c5fd;
}

:deep(.fc-event-time),
:deep(.fc-event-title) {
    color: inherit;
}

/* استایل DatePicker که خواسته بودید مستقیم نوشته شود */
:deep(.vpd-input-group input) {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    height: 48px;
    padding: 0 16px;
    font-size: 0.95rem;
    background: #ffffff;
    transition: all 0.2s;
    color: #334155;
    width: 100%;
}

.dark :deep(.vpd-input-group input) {
    border-color: #475569;
    background: #334155;
    color: #e2e8f0;
}

:deep(.vpd-input-group input:focus) {
    border-color: #5465ff;
    box-shadow: 0 0 0 3px #bfd7ff;
    outline: none;
}

.dark :deep(.vpd-input-group input:focus) {
    border-color: #788bff;
    box-shadow: 0 0 0 3px #3b5a9a;
}

:deep(.vpd-icon-btn) {
    display: none;
}

:deep(.vpd-prev),
:deep(.vpd-next),
:deep(.vpd-up-arrow-btn),
:deep(.vpd-down-arrow-btn) {
    display: flex;
    align-items: center;
    justify-content: center;
}

:deep(.vpd-up-arrow-btn) {
    margin-bottom: 20px !important;
}

:deep(.vpd-time .vpd-time-h),
:deep(.vpd-time .vpd-time-m) {
    margin-top: 45px;
}

/* ریسپانسیو اختصاصی برای هدر تقویم در موبایل */
@media (max-width: 767px) {
    :deep(.fc-toolbar) {
        flex-direction: column;
        gap: 12px;
        padding: 16px !important;
    }

    :deep(.fc-toolbar-chunk) {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    :deep(.fc-toolbar-title) {
        font-size: 1.1rem !important;
    }
}
</style>