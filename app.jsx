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

  useEffect(() => {

    let started = false

    const startApp = async (session) => {

      if (started) return
      started = true

      try {

        const userId = session?.user?.id ?? null

        console.log('👤 USER:', userId)

        setCurrentUserId(userId)

        // ── sync remoto ──────────────────────────────────────────

        if (navigator.onLine && userId) {

          console.log('☁️ baixando supabase')

          await syncFromSupabase(userId)
        }

        // ── carrega local ────────────────────────────────────────

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

        console.log('✅ APP OK')

      } catch (e) {

        console.error('❌ boot error:', e)

      } finally {

        setLoading(false)
      }
    }

    // ── listener auth ───────────────────────────────────────────

    const {
      data: { subscription }
    } = supabaseClient.auth.onAuthStateChange(
      async (_event, session) => {

        console.log('🔑 auth change')

        await startApp(session)
      }
    )

    // ── fallback ────────────────────────────────────────────────

    supabaseClient.auth.getSession()
      .then(async ({ data }) => {

        if (!started) {
          await startApp(data.session)
        }
      })

    return () => {
      subscription.unsubscribe()
    }

  }, [])

  // ════════════════════════════════════════════════════════════════
  // AUTO SAVE
  // ════════════════════════════════════════════════════════════════

  useEffect(() => { if (!loading) savePastos(pastos) }, [pastos])
  useEffect(() => { if (!loading) saveAnimais(animais) }, [animais])
  useEffect(() => { if (!loading) saveFin(fin) }, [fin])
  useEffect(() => { if (!loading) saveMovs(movs) }, [movs])
  useEffect(() => { if (!loading) saveSal(sal) }, [sal])
  useEffect(() => { if (!loading) saveManejos(manejos) }, [manejos])
  useEffect(() => { if (!loading) saveAdubacoes(adubacoes) }, [adubacoes])
  useEffect(() => { if (!loading) saveCfg(cfg) }, [cfg])

  // ════════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        color: '#fff'
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

      <p>Pastos: {pastos.length}</p>
      <p>Animais: {animais.length}</p>
      <p>Financeiro: {fin.length}</p>
    </div>
  )
}

export default App
