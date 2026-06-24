export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  const publicPaths = ['/auth/login', '/auth/register']
  if (to.path === '/' || to.path.startsWith('/booking/')) {
    return
  }

  if (isAuthenticated.value && to.path.startsWith('/auth/')) {
    return navigateTo('/dashboard')
  }

  if (!isAuthenticated.value && !to.path.startsWith('/auth/') && to.path !== '/') {
    return navigateTo('/auth/login')
  }
})