// ═══ STORAGE — Supabase/app_state (fonte única de verdade) ════════
// Importado por: app.jsx (apenas)
// Nenhuma página acessa este módulo diretamente.

import { supabaseClient } from './supabase.js'
import { TODAY }          from './utils.js'

const DB_TABLE = 'app_state'

// ── Pega o user_id do usuário logado ─────────────────────────────
const getUserId = async () => {
  const { data: { user } } = await supabaseClient.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')
  return user.id
}

// ── Primitiva de escrita ──────────────────────────────────────────
export const dbSet = async (k, v) => {
  try {
    const userId = await getUserId()
    const { error } = await supabaseClient
      .from(DB_TABLE)
      .upsert(
        { key: k, value: v, user_id: userId, updated_at: new Date().toISOString() },
        { onConflict: 'key,user_id' }
      )
    if (error) console.error(`❌ dbSet [${k}] falhou:`, error.code, error.message, error.hint || '')
    else       console.log(`💾 dbSet [${k}] OK`)
  } catch (e) {
    console.error(`❌ dbSet [${k}] exceção:`, e.message)
  }
}

// ── Primitiva de leitura ──────────────────────────────────────────
export const dbLoad = async (k) => {
  try {
    const userId = await getUserId()
    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('value')
      .eq('key', k)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) {
      console.error(`❌ dbLoad [${k}] erro:`, error.code, error.message, error.hint || '')
      return null
    }
    return data != null ? data.value : null
  } catch (e) {
    console.error(`❌ dbLoad [${k}] exceção:`, e.message)
    return null
  }
}

// ── Reset completo ────────────────────────────────────────────────
export const dbReset = async () => {
  try {
    const userId = await getUserId()
    const KEYS = ['pastos', 'animais', 'fin', 'movs', 'sal', 'manejos', 'cfg', 'adubacoes']
    const { error } = await supabaseClient
      .from(DB_TABLE)
      .delete()
      .in('key', KEYS)
      .eq('user_id', userId)
    if (error) console.error('❌ dbReset falhou:', error.message)
    else       console.log('🗑️ dbReset OK')
  } catch (e) {
    console.error('❌ dbReset exceção:', e.message)
  }
}

// ── Exportação de backup ──────────────────────────────────────────
export const dbExport = (data) => {
  const b = new Blob(
    [JSON.stringify({ v: '9', ts: new Date().toISOString(), data }, null, 2)],
    { type: 'application/json' }
  )
  const a = document.createElement('a')
  a.href = URL.createObjectURL(b)
  a.download = `agrogestao-v11-${TODAY}.json`
  a.click()
}

// ── API nomeada por entidade ──────────────────────────────────────
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
