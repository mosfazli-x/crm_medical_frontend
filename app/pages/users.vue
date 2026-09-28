<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('users.title') }}</h1>
        <p class="dash-head__date">{{ t('users.subtitle') }}</p>
      </div>
      <div class="dash-head__actions">
        <button class="asa-btn asa-btn--ghost" :disabled="loading" :aria-label="t('users.refresh')"
          @click="fetchUsers">
          <v-icon size="16" :class="{ 'us-spin': loading }">mdi-refresh</v-icon>
          {{ t('users.refresh') }}
        </button>
      </div>
    </header>

    <!-- ─── Summary metrics (clickable = status filters) ─── -->
    <section class="asa-sec us-sec mb-4">
      <div class="grid! grid-cols-2! lg:grid-cols-4! gap-3! sm:gap-4!">
        <button v-for="m in metricCards" :key="m.key" type="button" class="asa-card us-metric"
          :class="{ 'us-metric--active': statusFilter === m.key }" @click="setStatus(m.key)">
          <span class="us-metric__icon asa-tint" :class="m.tint" aria-hidden="true">
            <v-icon size="20">{{ m.icon }}</v-icon>
          </span>
          <div class="us-metric__copy">
            <p class="us-metric__value">{{ m.count }}</p>
            <p class="us-metric__label">{{ m.label }}</p>
          </div>
          <p class="us-metric__foot">{{ m.desc }}</p>
        </button>
      </div>
    </section>

    <!-- ─── Toolbar: search / role filter / refresh ─── -->
    <div class="asa-toolbar">
      <div class="asa-field asa-field--search">
        <v-text-field v-model="searchQuery" variant="solo" density="comfortable" hide-details clearable
          :placeholder="t('users.searchPlaceholder')" prepend-inner-icon="mdi-magnify" />
      </div>
      <div class="asa-field asa-field--select">
        <v-select v-model="roleFilter" :items="roleFilterOptions" item-title="title" item-value="value"
          variant="solo" density="comfortable" hide-details :label="t('users.filterRole')" clearable />
      </div>
      <div class="flex-1! min-w-0" />
      <span class="asa-pill asa-pill--teal whitespace-nowrap!">
        {{ t('users.resultsCount', { count: filteredUsers.length }) }}
      </span>
      <button v-if="hasActiveFilters" type="button" class="asa-btn asa-btn--ghost asa-btn--sm" @click="clearFilters">
        <v-icon size="14">mdi-filter-remove-outline</v-icon>
        {{ t('users.clearFilters') }}
      </button>
    </div>

    <!-- ─── Loading skeletons ─── -->
    <div v-if="loading && !users.length" class="space-y-5!">
      <div class="grid! grid-cols-2! lg:grid-cols-4! gap-3! sm:gap-4!">
        <div v-for="n in 4" :key="`s-${n}`" class="asa-skel h-32! rounded-[22px]!" />
      </div>
      <div class="asa-skel h-80! rounded-[22px]!" />
    </div>

    <!-- ─── Empty: active filters ─── -->
    <div v-else-if="!filteredUsers.length && (hasActiveFilters || statusFilter !== 'all')" class="asa-card asa-empty">
      <span class="asa-tint asa-tint--indigo" aria-hidden="true">
        <v-icon icon="mdi-filter-off-outline" size="32" />
      </span>
      <p class="asa-empty__title">
        {{ statusFilter !== 'all' && !hasActiveFilters ? t('users.noUsersInCategory') : t('users.noFilterResults') }}
      </p>
      <button v-if="statusFilter !== 'all' || hasActiveFilters" type="button" class="asa-btn asa-btn--ghost asa-btn--sm"
        @click="clearFilters">
        <v-icon size="14">mdi-filter-remove-outline</v-icon>
        {{ t('users.clearFilters') }}
      </button>
    </div>

    <!-- ─── Empty: no users at all ─── -->
    <div v-else-if="!filteredUsers.length" class="asa-card asa-empty">
      <span class="asa-tint asa-tint--teal" aria-hidden="true">
        <v-icon icon="mdi-account-group-outline" size="32" />
      </span>
      <p class="asa-empty__title">{{ t('users.noUsersFound') }}</p>
    </div>

    <!-- ─── User list ─── -->
    <template v-else>
      <!-- Desktop table (lg and up) -->
      <section class="asa-sec hidden! lg:block!">
        <div class="asa-card asa-table-card">
          <div class="asa-table-wrap">
            <table class="asa-table">
              <thead>
                <tr>
                  <th>{{ t('users.fullName') }}</th>
                  <th>{{ t('users.phone') }}</th>
                  <th>{{ t('users.role') }}</th>
                  <th>{{ t('users.organization') }}</th>
                  <th>{{ t('users.status') }}</th>
                  <th class="text-center!">{{ t('users.sms') }}</th>
                  <th class="text-center!">{{ t('users.telegram') }}</th>
                  <th>{{ t('users.joinDate') }}</th>
                  <th class="text-center!">{{ t('common.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id" class="asa-tr">
                  <td>
                    <div class="flex items-center gap-3">
                      <span class="asa-tint asa-avatar asa-avatar--sm" :class="avatarTintOf(user)">
                        {{ initialsOf(user) }}
                      </span>
                      <div class="min-w-0">
                        <p class="asa-td-name">{{ user.fullName || t('users.noName') }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="crm-ltr font-mono text-[0.8125rem]! tracking-wider!">{{ user.phone }}</td>
                  <td>
                    <span :class="rolePillClass(user.role)">
                      {{ roleLabel(user.role) }}
                    </span>
                  </td>
                  <td class="us-td-org">{{ user.organizationName || '—' }}</td>
                  <td>
                    <span :class="statusPillClass(user.status)">
                      {{ statusLabel(user.status) }}
                    </span>
                  </td>
                  <td class="text-center!">
                    <v-icon :size="18" :class="user.smsEnabled ? 'us-icon-on' : 'us-icon-off'">
                      {{ user.smsEnabled ? 'mdi-check-circle' : 'mdi-minus-circle' }}
                    </v-icon>
                  </td>
                  <td class="text-center!">
                    <v-icon :size="18" :class="user.telegramEnabled ? 'us-icon-on' : 'us-icon-off'">
                      {{ user.telegramEnabled ? 'mdi-check-circle' : 'mdi-minus-circle' }}
                    </v-icon>
                  </td>
                  <td class="whitespace-nowrap!">{{ formatJalaliDate(user.createdAt) }}</td>
                  <td class="text-center!">
                    <div class="flex items-center justify-center gap-0.5">
                      <v-tooltip v-if="user.role === 'doctor'" :text="t('users.editDoctorProfile')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--blue"
                            :aria-label="t('users.editDoctorProfile')" :disabled="isBusy(user.id)"
                            @click="openDoctorProfileDialog(user)">
                            <v-icon size="18">mdi-stethoscope</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip v-if="user.status === 'pending' && user.role !== 'patient'" :text="t('users.approveUser')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--green"
                            :aria-label="t('users.approveUser')" :disabled="isBusy(user.id)"
                            @click="openConfirm('approve', user)">
                            <v-icon size="18">mdi-check-circle-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip v-if="user.status === 'pending' && user.role === 'patient'" :text="t('users.approveAndCreate')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--teal"
                            :aria-label="t('users.approveAndCreate')" :disabled="isBusy(user.id)"
                            @click="openApprovePatientDialog(user)">
                            <v-icon size="18">mdi-account-plus-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip v-if="user.status === 'pending'" :text="t('users.rejectRequest')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--rose"
                            :aria-label="t('users.rejectRequest')" :disabled="isBusy(user.id)"
                            @click="openConfirm('reject', user)">
                            <v-icon size="18">mdi-close-circle-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip v-if="user.status === 'approved'" :text="t('users.temporaryBlock')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--rose"
                            :aria-label="t('users.temporaryBlock')" :disabled="isBusy(user.id)"
                            @click="openConfirm('deactivate', user)">
                            <v-icon size="18">mdi-account-cancel-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>

                      <v-tooltip v-if="user.status === 'rejected'" :text="t('users.restoreAccount')" location="top">
                        <template #activator="{ props }">
                          <button v-bind="props" type="button" class="asa-icon-btn asa-icon-btn--green"
                            :aria-label="t('users.restoreAccount')" :disabled="isBusy(user.id)"
                            @click="openConfirm('activate', user)">
                            <v-icon size="18">mdi-account-check-outline</v-icon>
                          </button>
                        </template>
                      </v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Tablet / mobile card list -->
      <div class="lg:hidden! mt-4! space-y-3!">
        <article v-for="user in filteredUsers" :key="`c-${user.id}`" class="asa-card asa-pcard">
          <span class="asa-tint asa-avatar asa-avatar--lg" :class="avatarTintOf(user)">
            {{ initialsOf(user) }}
          </span>
          <div class="asa-pcard__main">
            <p class="asa-pcard__name">
              <span class="truncate!">{{ user.fullName || t('users.noName') }}</span>
              <span :class="rolePillClass(user.role)">{{ roleLabel(user.role) }}</span>
            </p>
            <p class="asa-pcard__meta">
              <span class="crm-ltr font-mono">{{ user.phone }}</span>
              <span class="asa-dot-inline" aria-hidden="true" />
              <span :class="statusPillClass(user.status)">{{ statusLabel(user.status) }}</span>
            </p>
            <p v-if="user.organizationName" class="asa-pcard__meta">
              <v-icon size="13" style="color: var(--asa-label-3)">mdi-hospital</v-icon>
              <span class="truncate!">{{ user.organizationName }}</span>
            </p>
          </div>
          <div class="asa-pcard__actions">
            <button v-if="user.role === 'doctor'" type="button" class="asa-icon-btn asa-icon-btn--blue"
              :aria-label="t('users.editDoctorProfile')" :disabled="isBusy(user.id)"
              @click="openDoctorProfileDialog(user)">
              <v-icon size="18">mdi-stethoscope</v-icon>
            </button>
            <template v-if="user.status === 'pending'">
              <button v-if="user.role === 'patient'" type="button" class="asa-icon-btn asa-icon-btn--teal"
                :aria-label="t('users.approveAndCreate')" :disabled="isBusy(user.id)"
                @click="openApprovePatientDialog(user)">
                <v-icon size="18">mdi-account-plus-outline</v-icon>
              </button>
              <button v-else type="button" class="asa-icon-btn asa-icon-btn--green"
                :aria-label="t('users.approveUser')" :disabled="isBusy(user.id)" @click="openConfirm('approve', user)">
                <v-icon size="18">mdi-check-circle-outline</v-icon>
              </button>
              <button type="button" class="asa-icon-btn asa-icon-btn--rose" :aria-label="t('users.rejectRequest')"
                :disabled="isBusy(user.id)" @click="openConfirm('reject', user)">
                <v-icon size="18">mdi-close-circle-outline</v-icon>
              </button>
            </template>
            <button v-else type="button" :class="user.status === 'approved' ? 'asa-icon-btn asa-icon-btn--rose' : 'asa-icon-btn asa-icon-btn--green'"
              :aria-label="user.status === 'approved' ? t('users.temporaryBlock') : t('users.restoreAccount')"
              :disabled="isBusy(user.id)"
              @click="openConfirm(user.status === 'approved' ? 'deactivate' : 'activate', user)">
              <v-icon size="18">{{ user.status === 'approved' ? 'mdi-account-cancel-outline' : 'mdi-account-check-outline' }}</v-icon>
            </button>
          </div>
        </article>
      </div>
    </template>

    <!-- ─── Confirm action dialog ─── -->
    <v-dialog v-model="confirmDialog" max-width="460">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="flex items-start gap-3 min-w-0">
            <span class="asa-tint" :class="confirmState.tint" aria-hidden="true">
              <v-icon size="20">{{ confirmState.icon }}</v-icon>
            </span>
            <div class="min-w-0 pt-0.5!">
              <h2 class="asa-dialog__title text-xl!">{{ confirmState.title }}</h2>
              <span class="asa-dialog__sub">{{ confirmState.desc }}</span>
            </div>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="confirmDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div v-if="confirmState.user" class="asa-note">
            <span class="asa-tint asa-tint--sm" :class="confirmState.tint" aria-hidden="true">
              <v-icon size="16">mdi-account-outline</v-icon>
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ t('users.confirmNoteLabel') }}</p>
              <p class="asa-note__value truncate!">
                {{ confirmState.user.fullName || t('users.noName') }}
                <span class="crm-ltr font-mono">&lrm;({{ confirmState.user.phone }})</span>
              </p>
            </div>
          </div>
          <p class="us-confirm-action">{{ confirmState.actionHint }}</p>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="confirmDialog = false">{{ t('common.cancel') }}</button>
          <button class="asa-btn" :class="confirmState.btnClass" :disabled="busyUserId !== null" @click="runConfirm">
            {{ confirmState.actionLabel }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Approve & create patient record dialog ─── -->
    <v-dialog v-model="approvePatientDialog" max-width="620" @update:model-value="onPatientDialogClose">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="min-w-0">
            <h2 class="asa-dialog__title">{{ t('users.approvePatientTitle') }}</h2>
            <span class="asa-dialog__sub">
              {{ t('users.approvePatientSub') }} {{ patientUser?.fullName || '' }}
            </span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="approvePatientDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="asa-note mb-5!">
            <span class="asa-tint asa-tint--sm asa-tint--teal" aria-hidden="true">
              <v-icon size="16">mdi-information-outline</v-icon>
            </span>
            <div class="min-w-0">
              <p class="asa-note__label">{{ t('users.confirmNoteLabel') }}</p>
              <p class="asa-note__value truncate!">
                {{ patientUser?.fullName || t('users.noName') }}
                <span class="crm-ltr font-mono">&lrm;({{ patientUser?.phone }})</span>
              </p>
            </div>
          </div>

          <p class="us-form-hint mb-4!">{{ t('users.patientFormHint') }}</p>

          <div class="grid grid-cols-1! sm:grid-cols-2! gap-x-4! gap-y-1.5!">
            <div class="asa-field">
              <label class="asa-field-label">{{ t('basicInfo.firstName') }} <span class="us-req">*</span></label>
              <v-text-field v-model="patientForm.firstName" variant="solo" density="comfortable" hide-details="auto"
                :placeholder="t('basicInfo.firstName')" :error="!!patientErrors.firstName"
                :error-messages="patientErrors.firstName ? [patientErrors.firstName] : []" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('basicInfo.lastName') }} <span class="us-req">*</span></label>
              <v-text-field v-model="patientForm.lastName" variant="solo" density="comfortable" hide-details="auto"
                :placeholder="t('basicInfo.lastName')" :error="!!patientErrors.lastName"
                :error-messages="patientErrors.lastName ? [patientErrors.lastName] : []" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('basicInfo.nationalId') }} <span class="us-req">*</span></label>
              <v-text-field v-model="patientForm.nationalId" variant="solo" density="comfortable" hide-details="auto"
                :placeholder="t('users.nationalIdPlaceholder')" class="crm-ltr font-mono!"
                :error="!!patientErrors.nationalId" :error-messages="patientErrors.nationalId ? [patientErrors.nationalId] : []" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('basicInfo.insuranceType') }}</label>
              <v-select v-model="patientForm.insuranceType" :items="insuranceOptions" item-title="label" item-value="key"
                variant="solo" density="comfortable" hide-details :placeholder="t('users.insuranceTypePlaceholder')" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('basicInfo.insuranceCode') }}</label>
              <v-text-field v-model="patientForm.insuranceCode" variant="solo" density="comfortable" hide-details
                :placeholder="t('users.insuranceCodePlaceholder')" class="crm-ltr font-mono!" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('basicInfo.birthDate') }}</label>
              <div class="us-date">
                <PersianDatetimePicker v-model="patientForm.birthDate" type="date" format="YYYY-MM-DD"
                  :placeholder="t('users.birthDatePlaceholder')" />
              </div>
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('basicInfo.maritalStatus') }}</label>
              <v-select v-model="patientForm.maritalStatus" :items="maritalOptions" item-title="label" item-value="value"
                variant="solo" density="comfortable" hide-details :placeholder="t('users.maritalStatusPlaceholder')" />
            </div>
            <div class="asa-field sm:col-span-2!">
              <label class="asa-field-label">{{ t('basicInfo.address') }}</label>
              <v-text-field v-model="patientForm.address" variant="solo" density="comfortable" hide-details
                :placeholder="t('users.addressPlaceholder')" />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="approvePatientDialog = false">{{ t('common.cancel') }}</button>
          <button class="asa-btn asa-btn--primary" :disabled="busyUserId !== null" @click="submitApprovePatient">
            <v-icon size="16">mdi-account-plus-outline</v-icon>
            {{ t('users.approvePatientSubmit') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Doctor profile dialog ─── -->
    <v-dialog v-model="doctorProfileDialog" max-width="640" @update:model-value="onDoctorDialogClose">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div class="min-w-0">
            <h2 class="asa-dialog__title">{{ t('users.editDoctorProfile') }}</h2>
            <span class="asa-dialog__sub">{{ doctorProfileUser?.fullName || '' }} • {{ t('users.doctorProfileHint') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="doctorProfileDialog = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="grid grid-cols-1! sm:grid-cols-2! gap-x-4! gap-y-3!">
            <div class="asa-field sm:col-span-2!">
              <label class="asa-field-label">{{ t('users.specialty') }}</label>
              <v-text-field v-model="profileForm.specialty" variant="solo" density="comfortable" hide-details
                :placeholder="t('users.specialtyPlaceholder')" />
            </div>
            <div class="asa-field sm:col-span-2!">
              <label class="asa-field-label">{{ t('users.bio') }}</label>
              <v-textarea v-model="profileForm.bio" variant="solo" density="comfortable" hide-details rows="3" auto-grow
                :placeholder="t('users.bioPlaceholder')" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('users.experienceYears') }}</label>
              <v-text-field v-model.number="profileForm.experienceYears" variant="solo" density="comfortable" hide-details
                type="number" min="0" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('users.patientsCount') }}</label>
              <v-text-field v-model.number="profileForm.patientsCount" variant="solo" density="comfortable" hide-details
                type="number" min="0" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('users.rating') }}</label>
              <v-text-field v-model.number="profileForm.rating" variant="solo" density="comfortable" hide-details
                type="number" min="0" max="5" step="0.1" />
            </div>
            <div class="asa-field">
              <label class="asa-field-label">{{ t('users.sortOrder') }}</label>
              <v-text-field v-model.number="profileForm.sortOrder" variant="solo" density="comfortable" hide-details
                type="number" />
            </div>
            <div class="asa-field sm:col-span-2! us-switch-field">
              <v-switch v-model="profileForm.showOnLanding" color="#00ADB5" inset :label="t('users.showOnLanding')"
                :hint="t('users.showOnLandingHint')" persistent-hint />
            </div>
            <div class="asa-field sm:col-span-2!">
              <label class="asa-field-label">{{ t('users.uploadPhoto') }}</label>
              <div class="flex items-center gap-4">
                <div class="us-photo-preview">
                  <img v-if="profilePhotoSrc" :src="profilePhotoSrc" alt="" class="w-full h-full object-cover">
                  <v-icon v-else color="slate-400" size="28">mdi-account-circle-outline</v-icon>
                </div>
                <v-file-input :label="t('users.uploadPhoto')" accept="image/png,image/jpeg,image/webp,image/gif"
                  prepend-icon="mdi-camera-outline" variant="solo" density="comfortable" :loading="photoUploading"
                  @update:model-value="onDoctorPhotoSelected" />
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="doctorProfileDialog = false">{{ t('common.cancel') }}</button>
          <button class="asa-btn asa-btn--primary" :disabled="profileSaving" @click="saveDoctorProfile">
            <v-icon size="16">mdi-content-save-outline</v-icon>
            {{ t('users.saveProfile') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import { INSURANCE_TYPE_VALUES } from '~/types/insurance'
import { useApi } from '~/composables/useApi'
import { useEventBus } from '~/composables/useEventBus'
import { useFormatting } from '~/composables/useFormatting'

const { t } = useI18n()
const { apiFetch } = useApi()
const { emit, on: onEventBus } = useEventBus()
const { $toast } = useNuxtApp()
const { formatJalaliDate } = useFormatting()

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'
type ConfirmAction = 'approve' | 'reject' | 'deactivate' | 'activate'

interface UserRow {
  id: string
  phone: string
  fullName: string | null
  role: string
  status: string
  organizationName: string | null
  patientId: string | null
  smsEnabled: boolean
  telegramEnabled: boolean
  createdAt: string
}

const users = ref<UserRow[]>([])
const loading = ref(true)
const statusFilter = ref<StatusFilter>('all')
const roleFilter = ref('')
const searchQuery = ref('')
const busyUserId = ref<string | null>(null)

// ─── Summary metric cards ───────────────────────
const metricCards = computed(() => [
  {
    key: 'all',
    label: t('users.statTotal'),
    desc: t('users.statTotalDesc'),
    tint: 'asa-tint--teal',
    icon: 'mdi-account-group-outline',
    count: users.value.length,
  },
  {
    key: 'pending',
    label: t('users.statPending'),
    desc: t('users.statPendingDesc'),
    tint: 'asa-tint--orange',
    icon: 'mdi-clock-outline',
    count: users.value.filter((u) => u.status === 'pending').length,
  },
  {
    key: 'approved',
    label: t('users.statApproved'),
    desc: t('users.statApprovedDesc'),
    tint: 'asa-tint--green',
    icon: 'mdi-shield-check-outline',
    count: users.value.filter((u) => u.status === 'approved').length,
  },
  {
    key: 'rejected',
    label: t('users.statRejected'),
    desc: t('users.statRejectedDesc'),
    tint: 'asa-tint--rose',
    icon: 'mdi-account-off-outline',
    count: users.value.filter((u) => u.status === 'rejected').length,
  },
])

// ─── Filters ────────────────────────────────────
const ROLES = ['admin_doctor', 'doctor', 'lab', 'pharmacy', 'patient', 'clinic_staff'] as const

const roleFilterOptions = computed(() =>
  ROLES.map((r) => ({ title: roleLabel(r), value: r }))
)

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' || roleFilter.value !== '' || statusFilter.value !== 'all'
)

const clearFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  statusFilter.value = 'all'
}

const setStatus = (key: StatusFilter) => {
  statusFilter.value = statusFilter.value === key ? 'all' : key
}

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return users.value.filter((u) => {
    if (statusFilter.value !== 'all' && u.status !== statusFilter.value) return false
    if (roleFilter.value && u.role !== roleFilter.value) return false
    if (q && !(`${u.fullName || ''}`.toLowerCase().includes(q) || `${u.phone}`.includes(q))) return false
    return true
  })
})

// ─── Role / status presentation ─────────────────
const roleConfig: Record<string, { pill: string }> = {
  admin_doctor: { pill: 'asa-pill--rose' },
  doctor: { pill: 'asa-pill--teal' },
  lab: { pill: 'asa-pill--indigo' },
  pharmacy: { pill: 'asa-pill--green' },
  patient: { pill: 'asa-pill--amber' },
  clinic_staff: { pill: 'asa-pill--neutral' },
}

const statusConfig: Record<string, { pill: string }> = {
  pending: { pill: 'asa-pill--amber' },
  approved: { pill: 'asa-pill--green' },
  rejected: { pill: 'asa-pill--neutral' },
}

const FULL_TINTS = [
  'asa-tint--teal',
  'asa-tint--green',
  'asa-tint--orange',
  'asa-tint--rose',
  'asa-tint--indigo',
]

const roleLabel = (role: string) => t(`users.roles.${role}`) || role
const statusLabel = (status: string) => t(`users.statuses.${status}`) || status
const rolePillClass = (role: string) => `asa-pill ${roleConfig[role]?.pill || 'asa-pill--neutral'}`
const statusPillClass = (status: string) => `asa-pill ${statusConfig[status]?.pill || 'asa-pill--neutral'}`

const avatarTintOf = (u: UserRow) => {
  const key = `${u.fullName || ''}${u.phone}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return FULL_TINTS[hash % FULL_TINTS.length]
}

const initialsOf = (u: UserRow) => {
  const name = (u.fullName || '').trim()
  if (!name) return '•'
  const parts = name.split(/\s+/)
  return `${parts[0]?.charAt(0) || ''}${parts.length > 1 ? parts[1]!.charAt(0) : ''}`.toUpperCase()
}

// ─── Data ───────────────────────────────────────
const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await apiFetch<{ success: boolean; data: UserRow[] }>('/api/users')
    if (response.success) {
      users.value = response.data
    } else {
      $toast.error(t('users.fetchError'))
    }
  } catch {
    $toast.error(t('users.serverError'))
  } finally {
    loading.value = false
  }
}

// ─── Confirm action dialog ──────────────────────
const confirmDialog = ref(false)
const confirmAction = ref<ConfirmAction>('approve')
const confirmUser = ref<UserRow | null>(null)

const confirmState = computed(() => {
  const u = confirmUser.value
  const name = u?.fullName || t('users.noName')
  const role = u ? roleLabel(u.role) : ''
  const isBlock = confirmAction.value === 'deactivate'
  const actionName = isBlock ? t('common.inactive') : t('common.active')

  const map = {
    approve: {
      title: t('users.confirmApproveTitle'),
      desc: t('users.approveConfirm', { name, role }),
      icon: 'mdi-check-circle-outline',
      tint: 'asa-tint--teal',
      btnClass: 'asa-btn--primary',
      actionLabel: t('users.approveUser'),
      actionHint: role,
    },
    reject: {
      title: t('users.confirmRejectTitle'),
      desc: t('users.rejectConfirm', { name }),
      icon: 'mdi-close-circle-outline',
      tint: 'asa-tint--rose',
      btnClass: 'asa-btn--rose',
      actionLabel: t('users.rejectRequest'),
      actionHint: role,
    },
    deactivate: {
      title: t('users.confirmBlockTitle'),
      desc: t('users.toggleConfirm', { action: actionName, name }),
      icon: 'mdi-account-cancel-outline',
      tint: 'asa-tint--rose',
      btnClass: 'asa-btn--rose',
      actionLabel: t('users.temporaryBlock'),
      actionHint: t('users.statRejectedDesc'),
    },
    activate: {
      title: t('users.confirmRestoreTitle'),
      desc: t('users.toggleConfirm', { action: actionName, name }),
      icon: 'mdi-account-check-outline',
      tint: 'asa-tint--green',
      btnClass: 'asa-btn--primary',
      actionLabel: t('users.restoreAccount'),
      actionHint: t('users.statApprovedDesc'),
    },
  }
  return map[confirmAction.value]
})

const openConfirm = (action: ConfirmAction, user: UserRow) => {
  confirmAction.value = action
  confirmUser.value = user
  confirmDialog.value = true
}

const runConfirm = async () => {
  const user = confirmUser.value
  if (!user) return
  busyUserId.value = user.id
  try {
    const action = confirmAction.value
    const response = await apiFetch<{ success: boolean }>(
      `/api/users/${action}/${user.id}`,
      { method: 'POST' }
    )
    if (response.success) {
      const msgMap = {
        approve: t('users.approvedSuccess'),
        reject: t('users.rejectedSuccess'),
        deactivate: t('users.toggleSuccess', { action: t('common.inactive') }),
        activate: t('users.toggleSuccess', { action: t('common.active') }),
      }
      $toast.success(msgMap[action])
      confirmDialog.value = false
      confirmUser.value = null
      emit('user:changed')
    } else {
      const errMap = {
        approve: t('users.approveError'),
        reject: t('users.rejectError'),
        deactivate: t('users.toggleError'),
        activate: t('users.toggleError'),
      }
      $toast.error(errMap[action])
    }
  } catch {
    const errMap = {
      approve: t('users.approveError'),
      reject: t('users.rejectError'),
      deactivate: t('users.toggleError'),
      activate: t('users.toggleError'),
    }
    $toast.error(errMap[confirmAction.value])
  } finally {
    busyUserId.value = null
  }
}

// ─── Approve & create patient dialog ────────────
const approvePatientDialog = ref(false)
const patientUser = ref<UserRow | null>(null)
const patientForm = ref({
  firstName: '',
  lastName: '',
  nationalId: '',
  insuranceType: '' as string,
  insuranceCode: '',
  birthDate: '',
  address: '',
  maritalStatus: '',
})
const patientErrors = ref<Record<string, string>>({})

const insuranceOptions = INSURANCE_TYPE_VALUES.map((item) => ({ label: item.label, key: item.key }))

const maritalOptions = computed(() => [
  { label: t('basicInfo.single'), value: 'single' },
  { label: t('basicInfo.married'), value: 'married' },
  { label: t('basicInfo.divorced'), value: 'divorced' },
  { label: t('basicInfo.widowed'), value: 'widowed' },
])

const openApprovePatientDialog = (user: UserRow) => {
  patientUser.value = user
  patientForm.value = {
    firstName: '',
    lastName: '',
    nationalId: '',
    insuranceType: '',
    insuranceCode: '',
    birthDate: '',
    address: '',
    maritalStatus: '',
  }
  patientErrors.value = {}
  approvePatientDialog.value = true
}

const onPatientDialogClose = (open: boolean) => {
  if (!open) {
    patientUser.value = null
    patientErrors.value = {}
  }
}

const validatePatientForm = () => {
  const errors: Record<string, string> = {}
  if (patientForm.value.firstName.trim().length < 2) errors.firstName = t('users.firstNameRequired')
  if (patientForm.value.lastName.trim().length < 2) errors.lastName = t('users.lastNameRequired')
  if (!/^\d{10}$/.test(patientForm.value.nationalId.trim())) errors.nationalId = t('users.nationalIdInvalid')
  patientErrors.value = errors
  return Object.keys(errors).length === 0
}

const submitApprovePatient = async () => {
  const user = patientUser.value
  if (!user) return
  if (!validatePatientForm()) return
  busyUserId.value = user.id
  try {
    const payload: Record<string, string> = {
      firstName: patientForm.value.firstName.trim(),
      lastName: patientForm.value.lastName.trim(),
      nationalId: patientForm.value.nationalId.trim(),
    }
    if (patientForm.value.insuranceType) payload.insuranceType = patientForm.value.insuranceType
    if (patientForm.value.insuranceCode.trim()) payload.insuranceCode = patientForm.value.insuranceCode.trim()
    if (patientForm.value.birthDate) payload.birthDate = patientForm.value.birthDate
    if (patientForm.value.address.trim()) payload.address = patientForm.value.address.trim()
    if (patientForm.value.maritalStatus) payload.maritalStatus = patientForm.value.maritalStatus

    const response = await apiFetch<{ success: boolean }>(`/api/users/approve-patient/${user.id}`, {
      method: 'POST',
      body: payload,
    })
    if (response.success) {
      $toast.success(t('users.patientApproved'))
      approvePatientDialog.value = false
      patientUser.value = null
      emit('user:changed')
    } else {
      $toast.error(t('users.approveError'))
    }
  } catch {
    $toast.error(t('users.approveError'))
  } finally {
    busyUserId.value = null
  }
}

// ─── Doctor profile dialog ──────────────────────
const doctorProfileDialog = ref(false)
const doctorProfileUser = ref<UserRow | null>(null)
const profileSaving = ref(false)
const photoUploading = ref(false)
const profileForm = ref({
  specialty: '',
  bio: '',
  experienceYears: null as number | null,
  patientsCount: null as number | null,
  rating: null as number | null,
  sortOrder: null as number | null,
  showOnLanding: true,
  photoUrl: null as string | null,
})
const profilePhotoPreview = ref<string | null>(null)
const profilePhotoFile = ref<File | null>(null)

const profilePhotoSrc = computed(() => {
  if (profilePhotoPreview.value) return profilePhotoPreview.value
  if (profileForm.value.photoUrl && doctorProfileUser.value?.id) {
    return `/api/doctor-profiles/${doctorProfileUser.value.id}/photo`
  }
  return null
})

const openDoctorProfileDialog = async (user: UserRow) => {
  doctorProfileUser.value = user
  profileForm.value = {
    specialty: '',
    bio: '',
    experienceYears: null,
    patientsCount: null,
    rating: null,
    sortOrder: null,
    showOnLanding: true,
    photoUrl: null,
  }
  profilePhotoPreview.value = null
  profilePhotoFile.value = null
  doctorProfileDialog.value = true

  try {
    const response = await apiFetch<{ success: boolean; data?: Record<string, unknown> }>(
      `/api/doctor-profiles/${user.id}`
    )
    if (response.success && response.data) {
      const p = response.data
      profileForm.value = {
        specialty: (p.specialty as string) || '',
        bio: (p.bio as string) || '',
        experienceYears: (p.experienceYears as number) ?? null,
        patientsCount: (p.patientsCount as number) ?? null,
        rating: p.rating != null ? Number(p.rating) : null,
        sortOrder: (p.sortOrder as number) ?? null,
        showOnLanding: (p.showOnLanding as boolean) ?? true,
        photoUrl: (p.photoUrl as string) || null,
      }
    }
  } catch {
    $toast.error(t('users.profileFetchError'))
  }
}

const onDoctorDialogClose = (open: boolean) => {
  if (!open) {
    profilePhotoFile.value = null
    profilePhotoPreview.value = null
  }
}

const onDoctorPhotoSelected = (file: File | null) => {
  profilePhotoFile.value = file ?? null
  profilePhotoPreview.value = file ? URL.createObjectURL(file) : null
}

const saveDoctorProfile = async () => {
  const user = doctorProfileUser.value
  if (!user) return
  profileSaving.value = true
  try {
    const payload: Record<string, string | number | boolean> = {}
    if (profileForm.value.specialty) payload.specialty = profileForm.value.specialty
    if (profileForm.value.bio) payload.bio = profileForm.value.bio
    if (profileForm.value.experienceYears != null) payload.experienceYears = profileForm.value.experienceYears
    if (profileForm.value.patientsCount != null) payload.patientsCount = profileForm.value.patientsCount
    if (profileForm.value.rating != null) payload.rating = profileForm.value.rating
    if (profileForm.value.sortOrder != null) payload.sortOrder = profileForm.value.sortOrder
    payload.showOnLanding = profileForm.value.showOnLanding

    const response = await apiFetch<{ success: boolean }>(`/api/doctor-profiles/${user.id}`, {
      method: 'PUT',
      body: payload,
    })
    if (!response.success) {
      $toast.error(t('users.profileSaveError'))
      return
    }

    if (profilePhotoFile.value) {
      const formData = new FormData()
      formData.append('photo', profilePhotoFile.value)
      const photoResponse = await apiFetch<{ success: boolean; data?: { photoUrl?: string } }>(
        `/api/doctor-profiles/${user.id}/photo`,
        { method: 'POST', body: formData }
      )
      if (!photoResponse.success) {
        $toast.error(t('users.photoUploadError'))
      } else {
        if (photoResponse.data?.photoUrl) {
          profileForm.value.photoUrl = photoResponse.data.photoUrl
        }
        $toast.success(t('users.photoUploaded'))
      }
    }

    $toast.success(t('users.profileSaved'))
    doctorProfileDialog.value = false
    emit('user:changed')
  } catch {
    $toast.error(t('users.profileSaveError'))
  } finally {
    profileSaving.value = false
  }
}

const isBusy = (id: string) => busyUserId.value === id

onMounted(() => {
  fetchUsers()
})

onEventBus('user:changed', () => {
  fetchUsers()
})

useSeoMeta({ title: t('users.titleSeo') })
</script>

<style scoped>
/* ── Status filter metric cards ──────────────── */
.us-sec {
  margin-top: 0.75rem;
}

.us-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.25rem 0.875rem;
  padding: 1rem 1.125rem;
  cursor: pointer;
  border: 1px solid var(--asa-card-ring);
  transition: transform 220ms var(--ease-premium), border-color 220ms var(--ease-premium),
    box-shadow 220ms var(--ease-premium);
  min-height: 7.25rem;
}

.us-metric:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 45%, transparent);
}

.us-metric--active {
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--asa-accent) 18%, transparent), var(--asa-card-shadow);
}

.us-metric__icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  grid-row: span 2;
}

.us-metric__copy {
  min-width: 0;
  text-align: end;
}

.us-metric__value {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.05;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.us-metric__label {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.us-metric__foot {
  grid-column: 1 / -1;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  border-top: 1px solid var(--asa-sep);
  margin-top: 0.625rem;
  padding-top: 0.625rem;
}

@media (max-width: 480px) {
  .us-metric {
    min-height: 0;
  }
}

/* ── Frosted, sticky toolbar ─────────────────── */
.asa-toolbar {
  position: sticky;
  top: 0.75rem;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  border-radius: 1.25rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-bg-card) 82%, transparent);
  -webkit-backdrop-filter: blur(18px) saturate(1.8);
  backdrop-filter: blur(18px) saturate(1.8);
  box-shadow: var(--asa-card-shadow);
  margin-bottom: 1.25rem;
}

.asa-field--search {
  flex: 1 1 16rem;
  min-width: 13rem;
}

.asa-field--select {
  flex: 0 1 12rem;
  min-width: 10.5rem;
}

/* Apple-styled Vuetify solo fields */
.asa-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.asa-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.asa-field :deep(.v-field__overlay) {
  background: transparent;
}

.asa-field :deep(.v-field__input),
.asa-field :deep(.v-field__input::placeholder),
.asa-field :deep(.v-select__selection),
.asa-field :deep(.v-label) {
  color: var(--asa-label);
}

.asa-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.asa-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.asa-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

.asa-field :deep(.v-text-field__details) {
  padding-inline-start: 0.25rem;
}

/* ── Avatar (initials, Apple tint) ───────────── */
.asa-avatar {
  font-size: 0.875rem;
  font-weight: 700;
}

.asa-avatar--sm {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
}

.asa-avatar--lg {
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  font-size: 1rem;
}

/* ── Compact icon buttons ────────────────────── */
.asa-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border: none;
  border-radius: 9999px;
  background: transparent;
  color: var(--asa-label-2);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.asa-icon-btn:hover {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label);
}

.dark .asa-icon-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.asa-icon-btn:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.asa-icon-btn--teal {
  color: var(--asa-accent-deep);
}

.dark .asa-icon-btn--teal {
  color: var(--asa-accent);
}

.asa-icon-btn--blue {
  color: #0a84ff;
}

.asa-icon-btn--green {
  color: var(--asa-green);
}

.asa-icon-btn--rose {
  color: var(--asa-rose);
}

/* ── Desktop table ───────────────────────────── */
.asa-table-card {
  padding: 0;
  overflow: hidden;
}

.asa-table-wrap {
  overflow-x: auto;
}

.asa-table {
  width: 100%;
  min-width: 56rem;
  border-collapse: collapse;
  text-align: start;
}

.asa-table thead th {
  padding: 0.875rem 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-align: start;
  white-space: nowrap;
  color: var(--asa-label-2);
  border-bottom: 1px solid var(--asa-sep);
}

.asa-table tbody td {
  padding: 0.875rem 1rem;
  font-size: 0.8125rem;
  color: var(--asa-label);
  border-top: 1px solid var(--asa-sep);
  white-space: nowrap;
  vertical-align: middle;
}

.asa-table tbody tr {
  cursor: default;
  transition: background-color 150ms var(--ease-default);
}

.asa-table tbody tr:hover {
  background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
}

.dark .asa-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.04);
}

.asa-td-name {
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 14rem;
}

.us-td-sub {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.us-td-org {
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--asa-label-2);
}

.us-icon-on {
  color: var(--asa-green);
}

.us-icon-off {
  color: var(--asa-label-3);
}

/* Neutral / indigo pills */
.asa-pill--neutral {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  color: var(--asa-label-2);
}

.asa-pill--indigo {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

/* ── Tablet / mobile cards ───────────────────── */
.asa-pcard {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
}

.asa-pcard__main {
  min-width: 0;
  flex: 1 1 auto;
}

.asa-pcard__name {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-pcard__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.asa-dot-inline {
  width: 3px;
  height: 3px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

.asa-pcard__actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  flex-shrink: 0;
}

/* ── Empty ───────────────────────────────────── */
.asa-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;
}

.asa-empty__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

/* ── Note (tinted card inside dialogs) ───────── */
.asa-note {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 1rem;
  background: var(--asa-accent-soft);
  color: var(--asa-label);
}

.asa-note__label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.asa-note__value {
  margin-top: 0.125rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
}

.us-confirm-action {
  margin-top: 0.875rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* ── Approve patient dialog ──────────────────── */
.us-form-hint {
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--asa-label-2);
}

.us-req {
  color: var(--asa-rose);
}

/* ── Persian date picker (matches asa-field look) ── */
.us-date :deep(.vpd-input-group) {
  position: relative;
  height: 3rem;
  overflow: hidden;
  border-radius: 0.875rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  transition: background-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.us-date :deep(.vpd-input-group input) {
  width: 100%;
  height: 100%;
  border: none;
  padding: 0 0.875rem;
  background: transparent;
  color: var(--asa-label);
  font-size: 0.9375rem;
  font-weight: 500;
  outline: none;
  cursor: pointer;
}

.us-date :deep(.vpd-input-group input::placeholder) {
  color: var(--asa-label-3);
}

.us-date :deep(.vpd-input-group input:focus) {
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.us-date :deep(.vpd-input-group label),
.us-date :deep(.vpd-icon-btn) {
  display: none;
}

/* ── Doctor profile dialog ───────────────────── */
.us-switch-field :deep(.v-input__details) {
  padding-inline: 0;
}

.us-photo-preview {
  width: 5rem;
  height: 5rem;
  border-radius: 1rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border: 1px solid var(--asa-sep);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── Misc ────────────────────────────────────── */
.us-spin {
  animation: us-rotate 0.8s linear infinite;
}

@keyframes us-rotate {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .asa-field--search,
  .asa-field--select {
    flex-basis: 100% !important;
  }

  .asa-pcard__actions {
    gap: 0;
  }
}
</style>