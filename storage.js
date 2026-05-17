// ═══ STORAGE — IndexedDB local + sync Supabase ════════════════════
import { supabaseClient } from './supabase.js'
import { localGet, localSet, localClear } from './localdb.js'
import { TODAY } from './utils.js'

const DB_TABLE = 'app_state'
const KEYS     = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg']

let _userId = null
export const setCurrentUserId = (id) => { _userId = id }
export const getUserId = () => _userId

export const dbLoad = async (key) => await localGet(key)

export const dbSet = async (key, value) => {
  await localSet(key, value)
  if (!_userId || !navigator.onLine) return
  try {
    const { error } = await supabaseClient
      .from(DB_TABLE)
      .upsert(
        { key, value, user_id: _userId, updated_at: new Date().toISOString() },
        { onConflict: 'key,user_id' }
      )
    if (error) console.error('❌ dbSet:', error.message)
  } catch (e) {
    console.error('❌ dbSet exception:', e)
  }
}

// Retorna { key: value } diretamente — sem passar por IndexedDB
export const syncFromSupabase = async (userId) => {
  console.log("📡 syncFromSupabase chamado, userId:", userId)
  if (!userId) return null
  try {
    const { data, error } = await supabaseClient
      .from(DB_TABLE).select('key,value').eq('user_id', userId).in('key', KEYS)
    console.log("📦 resultado — error:", JSON.stringify(error), "rows:", data?.length)
    if (error || !data) return null
    // Grava no IndexedDB em background (cache offline)
    data.forEach(row => localSet(row.key, row.value))
    localSet('meta', { lastSync: new Date().toISOString() }, 'syncInfo')
    // Retorna mapa direto
    return Object.fromEntries(data.map(r => [r.key, r.value]))
  } catch { return null }
}

export const dbReset = async () => {
  await localClear()
  if (!_userId) return
  supabaseClient.from(DB_TABLE).delete().eq('user_id', _userId).catch(() => {})
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

export const loadPastos    = () => dbLoad('pastos')
export const loadAnimais   = () => dbLoad('animais')
export const loadFin       = () => dbLoad('fin')
export const loadMovs      = () => dbLoad('movs')
export const loadSal       = () => dbLoad('sal')
export const loadManejos   = () => dbLoad('manejos')
export const loadAdubacoes = () => dbLoad('adubacoes')
export const loadCfg       = () => dbLoad('cfg')

export const savePastos    = (v) => dbSet('pastos', v)
export const saveAnimais   = (v) => dbSet('animais', v)
export const saveFin       = (v) => dbSet('fin', v)
export const saveMovs      = (v) => dbSet('movs', v)
export const saveSal       = (v) => dbSet('sal', v)
export const saveManejos   = (v) => dbSet('manejos', v)
export const saveAdubacoes = (v) => dbSet('adubacoes', v)
export const saveCfg       = (v) => dbSet('cfg', v)
