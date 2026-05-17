// ═══ STORAGE — IndexedDB local + sync Supabase ════════════════════
import { supabaseClient } from './supabase.js'
import { localGet, localSet, localClear } from './localdb.js'
import { TODAY } from './utils.js'

const DB_TABLE = 'app_state'
const KEYS     = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg']

let _userId = null

export const setCurrentUserId = (id) => { _userId = id }

export const getUserId = async () => {
  if (_userId) return _userId
  try {
    const { data: { session } } = await supabaseClient.auth.getSession()
    _userId = session?.user?.id ?? null
    return _userId
  } catch { return null }
}

export const dbLoad = async (key) => await localGet(key)

export const dbSet = async (key, value) => {
  await localSet(key, value)
  console.log('💾 dbSet:', key, '| online:', navigator.onLine, '| userId:', _userId)
  if (!navigator.onLine) return
  const userId = await getUserId()
  console.log('👤 userId resolvido:', userId)
  if (!userId) { console.warn('❌ sem userId — não sincronizou'); return }
  try {
    const { error } = await supabaseClient
      .from(DB_TABLE)
      .upsert(
        { key, value, user_id: userId, updated_at: new Date().toISOString() },
        { onConflict: 'key,user_id' }
      )
    console.log('☁️ upsert resultado — error:', error, '| status:', error?.code)
    if (error) console.error('❌ dbSet:', error.message)
  } catch (e) {
    console.error('❌ dbSet exception COMPLETO:', e)
  }
}

export const syncFromSupabase = async (userId) => {

  if (!userId) return false
  try {
    const { data, error } = await supabaseClient
      .from(DB_TABLE).select('key,value').eq('user_id', userId).in('key', KEYS)

    if (error || !data) return false
    await Promise.all(data.map(row => localSet(row.key, row.value)))
    await localSet('meta', { lastSync: new Date().toISOString() }, 'syncInfo')
    return true
  } catch { return false }
}

export const bootstrapFromSupabase = syncFromSupabase

export const dbReset = async () => {
  await localClear()
  const userId = await getUserId()
  if (!userId) return
  supabaseClient.from(DB_TABLE).delete().eq('user_id', userId).catch(() => {})
}

// Recebe dados em memória — exporta o que está na tela
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
