<template>
  <NuxtLayout>
    <Toaster :toastOptions="{
      style: { fontFamily: 'yekan-bakh', direction: 'rtl', gap: '12px' },
      class: 'toast',
      descriptionClass: 'my-toast-description'
    }" richColors position="top-right" :close-button=true closeButtonPosition="top-left" />
    <NuxtLoadingIndicator color="#5465ff" :height="3"/>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const { isAuthenticated } = useAuth()

</script>