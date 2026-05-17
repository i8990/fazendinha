import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnon,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
)

// ── LOGIN ───────────────────────────────────────────────

export const signInGoogle = async () => {
  return await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })
}

// ── LOGOUT ──────────────────────────────────────────────

export const signOut = async () => {
  return await supabaseClient.auth.signOut()
}

// ── SESSION HELPERS ─────────────────────────────────────

export const getSessionUser = async () => {
  try {
    const { data, error } = await supabaseClient.auth.getUser()

    if (error) {
      console.error('❌ getUser error:', error)
      return null
    }

    return data?.user ?? null

  } catch (e) {
    console.error('❌ getUser exception:', e)
    return null
  }
}
