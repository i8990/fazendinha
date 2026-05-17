// ═══ STORAGE — IndexedDB local + sync Supabase ════════════════════
import { supabaseClient } from './supabase.js'
import { localGet, localSet, localClear } from './localdb.js'
import { TODAY } from './utils.js'

const DB_TABLE = 'app_state'
const KEYS     = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg']

// ── userId em memória — setado pelo app.jsx ao autenticar ─────────
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

// ── Lê local imediatamente ────────────────────────────────────────
export const dbLoad = async (k) => {
  return await localGet(k)
}

// ── Salva local + remoto em background ───────────────────────────
export const dbSet = async (k, v) => {
  await localSet(k, v)

  console.log('💾 LOCAL SAVE:', k)

  getUserId().then(async userId => {
    console.log('👤 USER ID:', userId)

    if (!userId) {
      console.warn('❌ sem userId — nao sincronizou')
      return
    }

    try {
      console.log('☁️ ENVIANDO:', k)

      const { error } = await supabaseClient
        .from(DB_TABLE)
        .upsert(
          {
            key: k,
            value: v,
            user_id: userId,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'key,user_id' }
        )

      if (error) {
        console.error('❌ ERRO SUPABASE:', error)
      } else {
        console.log('✅ SYNC OK:', k)
      }

    } catch(e) {
      console.error('❌ EXCEPTION:', e)
    }
  }).catch(e => {
    console.error('❌ USER ERROR:', e)
  })
}

// ── Sincroniza Supabase → IndexedDB ──────────────────────────────
export const syncFromSupabase = async (userId) => {
  if (!userId) return false
  try {
    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('key,value,updated_at')
      .eq('user_id', userId)
      .in('key', KEYS)
    if (error || !data) return false
    await Promise.all(data.map(row => localSet(row.key, row.value)))
    await localSet('meta', { lastSync: new Date().toISOString() }, 'syncInfo')
    return true
  } catch { return false }
}

// ── Reset ─────────────────────────────────────────────────────────
export const dbReset = async () => {
  await localClear()
  const userId = await getUserId()
  if (!userId) return
  supabaseClient.from(DB_TABLE).delete().in('key', KEYS).eq('user_id', userId).catch(() => {})
}

// ── Export backup ─────────────────────────────────────────────────
export const dbExport = (data) => {
  const b = new Blob([JSON.stringify({ v: '9', ts: new Date().toISOString(), data }, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(b)
  a.download = `fazendinha-${TODAY}.json`
  a.click()
}

// ── API por entidade ──────────────────────────────────────────────
export const savePastos    = (v) => dbSet('pastos',    v)
export const saveAnimais   = (v) => dbSet('animais',   v)
export const saveFin       = (v) => dbSet('fin',       v)
export const saveMovs      = (v) => dbSet('movs',      v)
export const saveSal       = (v) => dbSet('sal',       v)
export const saveManejos   = (v) => dbSet('manejos',   v)
export const saveAdubacoes = (v) => dbSet('adubacoes', v)
export const saveCfg       = (v) => dbSet('cfg',       v)

export const loadPastos    = () => dbLoad('pastos')
export const loadAnimais   = () => dbLoad('animais')
export const loadFin       = () => dbLoad('fin')
export const loadMovs      = () => dbLoad('movs')
export const loadSal       = () => dbLoad('sal')
export const loadManejos   = () => dbLoad('manejos')
export const loadAdubacoes = () => dbLoad('adubacoes')
export const loadCfg       = () => dbLoad('cfg')


// ── Bootstrap inicial remoto → local ─────────────────────────────
export const bootstrapFromSupabase = async () => {
  try {
    const userId = await getUserId()

    console.log('🚀 BOOTSTRAP USER:', userId)

    if (!userId) return false

    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('key,value')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ BOOTSTRAP ERROR:', error)
      return false
    }

    console.log('📦 BOOTSTRAP DATA:', data)

    if (!data || !data.length) {
      console.warn('⚠️ sem dados remotos')
      return false
    }

    for (const row of data) {
      await localSet(row.key, row.value)
      console.log('✅ CACHE RESTAURADO:', row.key)
    }

    return true

  } catch(e) {
    console.error('❌ BOOTSTRAP EXCEPTION:', e)
    return false
  }
}
