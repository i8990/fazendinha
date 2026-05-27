// ═══ STORAGE — offline-first com sync automático ══════════════════
import { supabaseClient } from './supabase.js'
import { localGet, localSet, localClear } from './localdb.js'
import { TODAY } from './utils.js'

const DB_TABLE = 'app_state'
const KEYS = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg','vendidos','finP']
const QUEUE_KEY = 'sync_queue'

let _userId = null
export const setCurrentUserId = (id) => { _userId = id }
export const getUserId = () => _userId

const getQueue = async () => (await localGet('meta', QUEUE_KEY)) ?? []
const setQueue = async (q) => localSet('meta', q, QUEUE_KEY)

const addToQueue = async (key, value) => {
  const q = await getQueue()
  const filtered = q.filter(item => item.key !== key)
  filtered.push({ key, value, ts: Date.now() })
  await setQueue(filtered)
}

const removeFromQueue = async (key) => {
  const q = await getQueue()
  await setQueue(q.filter(item => item.key !== key))
}

const pushToSupabase = async (key, value) => {
  if (!_userId) return false
  try {
    const { error } = await supabaseClient
      .from(DB_TABLE)
      .upsert(
        { key, value, user_id: _userId, updated_at: new Date().toISOString() },
        { onConflict: 'key,user_id' }
      )
    if (error) { console.error('❌ pushToSupabase:', error.message); return false }
    return true
  } catch (e) {
    console.error('❌ pushToSupabase:', e)
    return false
  }
}

export const processQueue = async () => {
  if (!_userId || !navigator.onLine) return
  const q = await getQueue()
  if (!q.length) return
  console.log(`🔄 Processando fila: ${q.length} item(s) pendente(s)`)
  for (const item of q) {
    const ok = await pushToSupabase(item.key, item.value)
    if (ok) await removeFromQueue(item.key)
  }
  console.log('✅ Fila sincronizada')
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Internet voltou — sincronizando fila...')
    processQueue()
  })
}

export const dbSet = async (key, value) => {
  if (!_userId) { console.warn('⚠️ dbSet sem userId'); return }
  await localSet(key, value)
  if (navigator.onLine) {
    const ok = await pushToSupabase(key, value)
    if (ok) await removeFromQueue(key)
  } else {
    await addToQueue(key, value)
    console.warn(`📦 Offline — "${key}" salvo localmente, aguardando conexão`)
  }
}

// Online → Supabase primeiro (iOS apaga IndexedDB entre sessões)
// Offline → IndexedDB local
export const dbLoadAll = async (userId) => {
  if (!userId) return null

  if (navigator.onLine) {
    try {
      const data = await fetchFromSupabase(userId)
      if (data) {
        await processQueue()
        return data
      }
    } catch (e) {
      console.error('❌ dbLoadAll Supabase falhou, tentando local:', e)
    }
  }

  // Fallback: IndexedDB local (offline ou Supabase falhou)
  const localData = {}
  for (const key of KEYS) {
    const val = await localGet(key)
    if (val != null) localData[key] = val
  }
  return Object.keys(localData).length > 0 ? localData : null
}

const fetchFromSupabase = async (userId) => {
  try {
    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('key,value')
      .eq('user_id', userId)
      .in('key', KEYS)
    if (error || !data) return null
    const result = Object.fromEntries(
      data.filter(r => r.value != null).map(r => [r.key, r.value])
    )
    for (const [key, value] of Object.entries(result)) {
      await localSet(key, value)
    }
    return result
  } catch (e) {
    console.error('❌ fetchFromSupabase:', e)
    return null
  }
}

export const mergeArrays = (local, remote) => {
  const map = {}
  for (const item of (remote || [])) map[item.id] = item
  for (const item of (local  || [])) {
    if (!map[item.id]) { map[item.id] = item; continue }
    const rAt = map[item.id].updatedAt ?? 0
    const lAt = item.updatedAt ?? 0
    if (lAt > rAt) map[item.id] = item
  }
  return Object.values(map)
}

export const dbSync = async (key, localArray) => {
  if (!_userId) return localArray
  try {
    const { data, error } = await supabaseClient
      .from(DB_TABLE).select('value')
      .eq('user_id', _userId).eq('key', key).single()
    const remote = (!error && data?.value) ? data.value : []
    const merged = mergeArrays(localArray, remote)
    await dbSet(key, merged)
    return merged
  } catch (e) {
    console.error('❌ dbSync:', e)
    return localArray
  }
}

export const dbReset = async () => {
  await localClear()
  if (!_userId) return
  try {
    await supabaseClient.from(DB_TABLE).delete().eq('user_id', _userId)
  } catch (e) {
    console.error('❌ dbReset:', e)
  }
}

export const dbExport = (data) => {
  const blob = new Blob(
    [JSON.stringify({ v: '9', ts: new Date().toISOString(), data }, null, 2)],
    { type: 'application/json' }
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `fazendinha-${TODAY}.json`
  a.click()
}

export const savePastos    = (v) => dbSet('pastos', v)
export const saveAnimais   = (v) => dbSet('animais', v)
export const saveVendidos  = (v) => dbSet('vendidos', v)
export const saveFin       = (v) => dbSet('fin', v)
export const saveFinP      = (v) => dbSet('finP', v)
export const saveMovs      = (v) => dbSet('movs', v)
export const saveSal       = (v) => dbSet('sal', v)
export const saveManejos   = (v) => dbSet('manejos', v)
export const saveAdubacoes = (v) => dbSet('adubacoes', v)
export const saveCfg       = (v) => dbSet('cfg', v)
