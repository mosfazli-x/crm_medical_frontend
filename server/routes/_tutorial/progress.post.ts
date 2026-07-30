import { defineEventHandler, getCookie, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody<{ completed: boolean }>(event)
  if (typeof body?.completed !== 'boolean') {
    throw createError({ statusCode: 400, message: 'Invalid body' })
  }

  const storage = useStorage('data')
  const key = `tutorial:${token}`

  await storage.setItem(key, { completed: body.completed })
  return { completed: body.completed }
})
