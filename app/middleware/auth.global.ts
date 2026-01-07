export default defineNuxtRouteMiddleware((to, from) => {
  console.log('middleware running', process.server ? 'server' : 'client')

  const { isAuthenticated } = useAuth()

  console.log('Auth Middleware executed on client!', {
    path: to.path,
    isAuthenticated: isAuthenticated.value,
  })

  if (isAuthenticated.value && (to.path === '/auth/login' || to.path === '/auth/register')) {
    return navigateTo('/')
  }

  if (!isAuthenticated.value && !to.path.startsWith('/auth/')) {
    return navigateTo('/auth/login')
  }
})