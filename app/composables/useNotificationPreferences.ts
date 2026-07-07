export interface NotificationPrefs {
  smsEnabled: boolean
  telegramEnabled: boolean
}

export const useNotificationPreferences = () => {
  const { apiFetch } = useApi()

  const getPreferences = async (userId: string): Promise<NotificationPrefs> => {
    const res: any = await apiFetch(`/api/users/${userId}/notification-preferences`)
    return { smsEnabled: res.data.smsEnabled, telegramEnabled: res.data.telegramEnabled }
  }

  const updatePreferences = async (
    userId: string,
    prefs: NotificationPrefs,
  ): Promise<NotificationPrefs> => {
    const res: any = await apiFetch(`/api/users/${userId}/notification-preferences`, {
      method: 'PUT',
      body: JSON.stringify(prefs),
      headers: { 'Content-Type': 'application/json' },
    })
    return { smsEnabled: res.data.smsEnabled, telegramEnabled: res.data.telegramEnabled }
  }

  return { getPreferences, updatePreferences }
}
