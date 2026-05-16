// ═══ SUPABASE — cliente único da aplicação ════════════════════════
// Importado por: storage.js (apenas)
// Nenhuma outra camada acessa supabaseClient diretamente.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL      = 'https://orrskyytignlneoftpft.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_E11Kg5KjCQR6S_mo0gWt5g_9AGA2JWH'

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('Supabase conectado')

// ═══ AUTH ════════════════════════════════════════════════════════

export async function signIn(email, senha) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha })
  if (error) throw error
  return data.user
}

export async function signUp(email, senha) {
  const { data, error } = await supabaseClient.auth.signUp({ email, password: senha })
  if (error) throw error
  return data.user
}

export async function signOut() {
  const { error } = await supabaseClient.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  const { data: { user } } = await supabaseClient.auth.getUser()
  return user
}

// ═══ PERFIL (nome da fazenda) ═════════════════════════════════════

export async function getPerfil(userId) {
  const { data, error } = await supabaseClient
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function savePerfil(userId, nomeFazenda) {
  const { data, error } = await supabaseClient
    .from('perfis')
    .upsert({ id: userId, nome_fazenda: nomeFazenda })
    .select()
    .single()
  if (error) throw error
  return data
}
