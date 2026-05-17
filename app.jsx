import React, { useEffect, useState } from 'react'

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

  syncFromSupabase,
  setCurrentUserId
} from './storage.js'

import { supabaseClient } from './supabase.js'

export function App() {

  const [loading, setLoading] = useState(true)

  const [pastos, setPastos] = useState([])
  const [animais, setAnimais] = useState([])
  const [fin, setFin] = useState([])
  const [movs, setMovs] = useState([])
  const [sal, setSal] = useState([])
  const [manejos, setManejos] = useState([])
  const [adubacoes, setAdubacoes] = useState([])
  const [cfg, setCfg] = useState({})

  // ════════════════════════════════════════════════════════════════
  // BOOT
  // ════════════════════════════════════════════════════════════════

  useEffect(() => {

    const boot = async () => {

      try {

        // ── sessão ────────────────────────────────────────────────

        const { data: { session } } =
          await supabaseClient.auth.getSession()

        const userId = session?.user?.id ?? null

        setCurrentUserId(userId)

        console.log('👤 USER:', userId)

        // ── sempre busca remoto ao abrir ─────────────────────────

        if (navigator.onLine && userId) {

          console.log('☁️ sync remoto inicial')

          await syncFromSupabase(userId)
        }

        // ── carrega cache local ──────────────────────────────────

        const [
          p,
          a,
          f,
          m,
          s,
          man,
          ad,
          c
        ] = await Promise.all([
          loadPastos(),
          loadAnimais(),
          loadFin(),
          loadMovs(),
          loadSal(),
          loadManejos(),
          loadAdubacoes(),
          loadCfg()
        ])

        setPastos(p || [])
        setAnimais(a || [])
        setFin(f || [])
        setMovs(m || [])
        setSal(s || [])
        setManejos(man || [])
        setAdubacoes(ad || [])
        setCfg(c || {})

        console.log('✅ app carregado')

      } catch (e) {

        console.error('❌ boot error:', e)

      } finally {

        setLoading(false)
      }
    }

    boot()

  }, [])

  // ════════════════════════════════════════════════════════════════
  // AUTO SAVE
  // ════════════════════════════════════════════════════════════════

  useEffect(() => { savePastos(pastos) }, [pastos])
  useEffect(() => { saveAnimais(animais) }, [animais])
  useEffect(() => { saveFin(fin) }, [fin])
  useEffect(() => { saveMovs(movs) }, [movs])
  useEffect(() => { saveSal(sal) }, [sal])
  useEffect(() => { saveManejos(manejos) }, [manejos])
  useEffect(() => { saveAdubacoes(adubacoes) }, [adubacoes])
  useEffect(() => { saveCfg(cfg) }, [cfg])

  // ════════════════════════════════════════════════════════════════
  // ONLINE RE-SYNC
  // ════════════════════════════════════════════════════════════════

  useEffect(() => {

    const handleOnline = async () => {

      const { data: { session } } =
        await supabaseClient.auth.getSession()

      const userId = session?.user?.id

      if (!userId) return

      console.log('🌐 internet voltou')

      await syncFromSupabase(userId)
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }

  }, [])

  // ════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        color: '#fff',
        fontSize: 18
      }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#111',
      color: '#fff',
      padding: 24
    }}>
      <h1>Fazendinha</h1>

      <p>App carregado com sucesso.</p>

      <p>Pastos: {pastos.length}</p>
      <p>Animais: {animais.length}</p>
      <p>Financeiro: {fin.length}</p>
    </div>
  )
}

export default App
