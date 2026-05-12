// ═══ STORAGE — Supabase/app_state (fonte única de verdade) ════════
// Importado por: app.jsx (apenas)
// Nenhuma página acessa este módulo diretamente.
//
//  Tabela usada: app_state
//  Schema esperado:
//    key         text PRIMARY KEY
//    value       jsonb NOT NULL
//    updated_at  timestamptz DEFAULT now()
//
//  RLS mínimo necessário (rodar no SQL Editor do Supabase):
//    ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
//    CREATE POLICY "anon_all" ON app_state FOR ALL USING (true) WITH CHECK (true);

import { supabaseClient } from './supabase.js'
import { TODAY }          from './utils.js'

const DB_TABLE = 'app_state'

// ── Primitiva de escrita ──────────────────────────────────────────
// fire-and-forget: não bloqueia a UI, mas loga erros detalhados
export const dbSet = (k, v) => {
  supabaseClient
    .from(DB_TABLE)
    .upsert({ key: k, value: v, updated_at: new Date().toISOString() }, { onConflict: 'key' })
    .then(({ error }) => {
      if (error) console.error(`❌ dbSet [${k}] falhou:`, error.code, error.message, error.hint || '')
      else       console.log(`💾 dbSet [${k}] OK`)
    })
}

// ── Primitiva de leitura ──────────────────────────────────────────
export const dbLoad = async (k) => {
  try {
    const { data, error } = await supabaseClient
      .from(DB_TABLE)
      .select('value')
      .eq('key', k)
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
export const dbReset = () => {
  const KEYS = ['pastos', 'animais', 'fin', 'movs', 'sal', 'manejos', 'cfg', 'adubacoes']
  supabaseClient
    .from(DB_TABLE)
    .delete()
    .in('key', KEYS)
    .then(({ error }) => {
      if (error) console.error('❌ dbReset falhou:', error.message)
      else       console.log('🗑️ dbReset OK')
    })
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
// Cada função deixa claro O QUE está sendo salvo/carregado.
// Fácil de substituir por tabelas individuais no futuro.
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
