export const useTelegram = () => {
  const { apiFetch } = useApi()

  interface TelegramStatus {
    linked: boolean
    username: string | null
    firstName: string | null
  }

  interface LinkCodeResponse {
    code: string
    botUsername: string | null
    expires_in_minutes: number
  }

  const generateLinkCode = async (): Promise<LinkCodeResponse> => {
    const res: any = await apiFetch('/api/telegram/generate-link-code', {
      method: 'POST',
    })
    return res.data as LinkCodeResponse
  }

  const getStatus = async (): Promise<TelegramStatus> => {
    const res: any = await apiFetch('/api/telegram/status')
    return res.data as TelegramStatus
  }

  const unlink = async (): Promise<void> => {
    await apiFetch('/api/telegram/unlink', {
      method: 'POST',
    })
  }

  return { generateLinkCode, getStatus, unlink }
}
