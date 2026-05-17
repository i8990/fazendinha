import { useEffect, useState } from 'react'

import {
  loadPastos,
  loadAnimais,
  loadFin,
  loadMovs,
  loadSal,
  loadManejos,
  loadAdubacoes,
  loadCfg,

  savePastos,
  saveAnimais,
  saveFin,
  saveMovs,
  saveSal,
  saveManejos,
  saveAdubacoes,
  saveCfg,

  dbReset,
  syncFromSupabase,
  bootstrapFromSupabase,
  setCurrentUserId

} from './storage.js'

import { supabaseClient } from './supabase.js'

export function App() {

  const [ready, setReady] = useState(false)

  useEffect(() => {

    const init = async () => {

      try {

        const {
          data: { session }
        } = await supabaseClient.auth.getSession()

        const user = session?.user

        if (!user) {
          console.warn('⚠️ sem sessão')
          setReady(true)
          return
        }

        console.log('👤 USER:', user.id)

        setCurrentUserId(user.id)

        await bootstrapFromSupabase(user.id)

        console.log('✅ bootstrap concluído')

      } catch (e) {

        console.error('❌ INIT ERROR:', e)

      } finally {

        setReady(true)

      }
    }

    init()

  }, [])

  if (!ready) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18
      }}>
        Carregando...
      </div>
    )
  }

  return (
    <div>
      APP OK
    </div>
  )
}

