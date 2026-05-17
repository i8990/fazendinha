// ═══ STORAGE — Supabase direto ═══════════════════════════════════
import { supabaseClient } from './supabase.js'
import { TODAY } from './utils.js'

const DB_TABLE = 'app_state'
const KEYS     = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg']

let _userId = null
export const setCurrentUserId = (id) => { _userId = id }
export const getUserId = () => _userId

// Carrega todos os dados do usuario no Supabase
export const dbLoadAll = async (userId) => {
  if (!userId) return null
  try {
    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('key,value')
      .eq('user_id', userId)
      .in('key', KEYS)
    if (error || !data) return null
    const valid = data.filter(r => r.value !== null && r.value !== undefined)
    return Object.fromEntries(valid.map(r => [r.key, r.value]))
  } catch (e) {
    console.error('❌ dbLoadAll:', e)
    return null
  }
}

// Salva uma chave direto no Supabase
export const dbSet = async (key, value) => {
  if (!_userId) { console.warn('⚠️ dbSet sem userId, ignorado'); return }
  if (!navigator.onLine) { console.warn('⚠️ dbSet offline, ignorado'); return }
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

// Apaga todos os dados do usuario no Supabase
export const dbReset = async () => {
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
export const saveFin       = (v) => dbSet('fin', v)
export const saveMovs      = (v) => dbSet('movs', v)
export const saveSal       = (v) => dbSet('sal', v)
export const saveManejos   = (v) => dbSet('manejos', v)
export const saveAdubacoes = (v) => dbSet('adubacoes', v)
export const saveCfg       = (v) => dbSet('cfg', v)
