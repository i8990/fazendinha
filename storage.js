// ═══ STORAGE — IndexedDB local + Supabase remoto ════════════════
import { supabaseClient } from './supabase.js'
import { localGet, localSet, localClear } from './localdb.js'
import { TODAY } from './utils.js'

const DB_TABLE = 'app_state'

// ── user_id seguro ────────────────────────────────────────────────
const getUserId = async () => {
  const { data: { session } } = await supabaseClient.auth.getSession()
  if (session?.user) return session.user.id
  const { data: { user } } = await supabaseClient.auth.getUser()
  return user?.id ?? null
}

// ── Leitura: local primeiro, remoto como fallback ─────────────────
export const dbLoad = async (k) => {
  // 1. Tenta local primeiro — instantâneo
  const cached = await localGet(k)
  if (cached !== null) {
    // Atualiza do remoto em background sem bloquear
    getUserId().then(userId => {
      if (!userId) return
      supabaseClient
        .from(DB_TABLE)
        .select('value')
        .eq('key', k)
        .eq('user_id', userId)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.value !== undefined) localSet(k, data.value)
        })
        .catch(() => {})
    }).catch(() => {})
    return cached
  }

  // 2. Sem cache local — busca do remoto
  try {
    const userId = await getUserId()
    if (!userId) return null
    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('value')
      .eq('key', k)
      .eq('user_id', userId)
      .maybeSingle()
    if (error || data == null) return null
    await localSet(k, data.value)
    return data.value
  } catch(e) {
    console.error(`❌ dbLoad [${k}]:`, e.message)
    return null
  }
}

// ── Escrita: local imediato + remoto em background ────────────────
export const dbSet = async (k, v) => {
  // 1. Salva local imediatamente
  await localSet(k, v)

  // 2. Sincroniza com Supabase em background
  getUserId().then(userId => {
    if (!userId) return
    supabaseClient
      .from(DB_TABLE)
      .upsert(
        { key: k, value: v, user_id: userId, updated_at: new Date().toISOString() },
        { onConflict: 'key,user_id' }
      )
      .then(({ error }) => {
        if (error) console.error(`❌ dbSet remoto [${k}]:`, error.message)
      })
      .catch(() => {})
  }).catch(() => {})
}

// ── Reset ─────────────────────────────────────────────────────────
export const dbReset = async () => {
  await localClear()
  try {
    const userId = await getUserId()
    if (!userId) return
    const KEYS = ['pastos','animais','fin','movs','sal','manejos','cfg','adubacoes']
    await supabaseClient.from(DB_TABLE).delete().in('key', KEYS).eq('user_id', userId)
  } catch(e) {
    console.error('❌ dbReset:', e.message)
  }
}

// ── Export backup ─────────────────────────────────────────────────
export const dbExport = (data) => {
  const b = new Blob(
    [JSON.stringify({ v: '9', ts: new Date().toISOString(), data }, null, 2)],
    { type: 'application/json' }
  )
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
