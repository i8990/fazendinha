// ═══ LOCALDB — armazenamento nativo persistente (iOS/Android) ═════
import { Preferences } from '@capacitor/preferences'

export const localGet = async (store, key = 'data') => {
  try {
    const k = store === 'meta' ? key : `${store}__${key}`
    const { value } = await Preferences.get({ key: k })
    return value ? JSON.parse(value) : null
  } catch { return null }
}

export const localSet = async (store, value, key = 'data') => {
  try {
    const k = store === 'meta' ? key : `${store}__${key}`
    await Preferences.set({ key: k, value: JSON.stringify(value) })
  } catch {}
}

export const localClear = async () => {
  try { await Preferences.clear() } catch {}
}
