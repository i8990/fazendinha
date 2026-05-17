// ═══ DEVICE — identificação persistente do dispositivo ═══════════

const KEY = 'fazendinha-device-id'

export const DEVICE_ID = (() => {
  let id = localStorage.getItem(KEY)

  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }

  return id
})()

export const getDeviceName = () => {
  const ua = navigator.userAgent

  if (/iPhone/i.test(ua)) return 'iPhone'
  if (/iPad/i.test(ua))   return 'iPad'
  if (/Mac/i.test(ua))    return 'Mac'
  if (/Android/i.test(ua)) return 'Android'

  return 'Dispositivo'
}
