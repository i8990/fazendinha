// ═══ SUPABASE — cliente único da aplicação ════════════════════════
// Importado por: storage.js (apenas)
// Nenhuma outra camada acessa supabaseClient diretamente.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL     = 'https://orrskyytignlneoftpft.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_E11Kg5KjCQR6S_mo0gWt5g_9AGA2JWH'

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

console.log('Supabase conectado')
