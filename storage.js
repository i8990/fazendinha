// ═══ STORAGE — Supabase realtime + fallback offline ══════════════

import { supabaseClient } from './supabase.js'
import { localGet, localSet, localClear } from './localdb.js'

const DB_TABLE = 'app_state'

const KEYS = [
  'pastos',
  'animais',
  'fin',
  'movs',
  'sal',
  'manejos',
  'adubacoes',
  'cfg'
]

// ── usuário atual ────────────────────────────────────────────────

let _userId = null

export const setCurrentUserId = (id) => {
  _userId = id
}

export const getUserId = async () => {
  if (_userId) return _userId

  try {
    const {
      data: { session }
    } = await supabaseClient.auth.getSession()

    _userId = session?.user?.id ?? null

    return _userId
  } catch {
    return null
  }
}

// ── leitura local ────────────────────────────────────────────────

export const dbLoad = async (key) => {
  return await localGet(key)
}

// ── escrita local + sync imediata ───────────────────────────────

export const dbSet = async (key, value) => {

  await localSet(key, value)

  console.log('💾 LOCAL SAVE:', key)

  if (!navigator.onLine) {
    console.log('📴 offline — aguardando internet')
    return
  }

  const userId = await getUserId()

  console.log('👤 USER ID:', userId)

  if (!userId) {
    console.warn('❌ sem userId')
    return
  }

  try {

    console.log('☁️ ENVIANDO:', key)

    const { error } = await supabaseClient
      .from(DB_TABLE)
      .upsert(
        {
          key,
          value,
          user_id: userId,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'key,user_id'
        }
      )

    if (error) {
      console.error('❌ ERRO SUPABASE:', error)
    } else {
      console.log('✅ SYNC OK:', key)
    }

  } catch (e) {
    console.error('❌ EXCEPTION:', e)
  }
}

// ── bootstrap remoto ────────────────────────────────────────────

export const syncFromSupabase = async (userId) => {

  if (!userId) return false

  try {

    console.log('🚀 bootstrap remoto')

    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('key,value')
      .eq('user_id', userId)
      .in('key', KEYS)

    if (error) {
      console.error('❌ BOOTSTRAP ERROR:', error)
      return false
    }

    if (!data) return false

    for (const row of data) {
      await localSet(row.key, row.value)
      console.log('✅ CACHE RESTAURADO:', row.key)
    }

    console.log('✅ bootstrap concluido')

    return true

  } catch (e) {

    console.error('❌ bootstrap exception:', e)

    return false
  }
}

// ── reset ───────────────────────────────────────────────────────

export const dbReset = async () => {

  await localClear()

  const userId = await getUserId()

  if (!userId) return

  await supabaseClient
    .from(DB_TABLE)
    .delete()
    .eq('user_id', userId)
}

// ── export backup ───────────────────────────────────────────────

export const dbExport = async () => {

  const out = {}

  for (const key of KEYS) {
    out[key] = await localGet(key)
  }

  return out
}

// ── aliases antigos ─────────────────────────────────────────────

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

export const bootstrapFromSupabase = syncFromSupabase

