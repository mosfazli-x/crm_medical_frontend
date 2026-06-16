export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  const publicPaths = ['/auth/login', '/auth/register']
  if (to.path.startsWith('/booking/')) {
    return
  }

  if (isAuthenticated.value && (to.path === '/auth/login' || to.path === '/auth/register')) {
    return navigateTo('/')
  }

  if (!isAuthenticated.value && !to.path.startsWith('/auth/')) {
    return navigateTo('/auth/login')
  }
})