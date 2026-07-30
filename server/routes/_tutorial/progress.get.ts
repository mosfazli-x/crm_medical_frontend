import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    return { completed: false }
  }

  const storage = useStorage('data')
  const key = `tutorial:${token}`

  try {
    const value = await storage.getItem<{ completed: boolean }>(key)
    return { completed: value?.completed === true }
  } catch {
    return { completed: false }
  }
})
