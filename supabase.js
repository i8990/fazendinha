// ═══ SUPABASE — cliente único da aplicação ════════════════════════
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: window.localStorage,
    storageKey: 'fzd-auth'
  }
})

console.log('Supabase conectado')

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

export async function getPerfil(userId) {
  const { data, error } = await supabaseClient
    .from('perfis').select('*').eq('id', userId).single()
  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

export async function savePerfil(userId, nomeFazenda) {
  const { data, error } = await supabaseClient
    .from('perfis').upsert({ id: userId, nome_fazenda: nomeFazenda }).select().single()
  if (error) throw error
  return data
}
