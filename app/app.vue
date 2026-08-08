<template>
  <NuxtLayout>
    <Toaster :toastOptions="{
      style: { fontFamily: 'IRANSansX', direction: 'rtl', gap: '12px' },
      class: 'toast',
      descriptionClass: 'my-toast-description'
    }" richColors position="top-right" :close-button=true closeButtonPosition="top-left" />
    <NuxtLoadingIndicator color="#4F46E5" :height="3"/>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
useHead({
  script: [
    {
      innerHTML: `
        if (!globalThis.crypto) globalThis.crypto = {};
        if (!globalThis.crypto.randomUUID) {
          globalThis.crypto.randomUUID = function() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
              return v.toString(16);
            });
          };
        }
      `,
    },
  ],
})

const { isAuthenticated } = useAuth()

</script>