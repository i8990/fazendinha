// ═══ APP — raiz da aplicação ══════════════════════════════════════
import { useState, useEffect }           from 'react'
import { TC, LIGHT, DARK }               from './constants.js'
import { calcIdade }                     from './utils.js'
import {
  loadPastos, loadAnimais, loadFin,
  loadMovs,   loadSal,    loadManejos,
  loadAdubacoes, loadCfg,
  savePastos, saveAnimais, saveFin,
  saveMovs,   saveSal,    saveManejos,
  saveAdubacoes, saveCfg, dbReset,
  syncFromSupabase, getUserId, bootstrapFromSupabase, setCurrentUserId
}                                        from './storage.js'
import { localGet }                      from './localdb.js'
import { supabaseClient, getPerfil }     from './supabase.js'
import { Dashboard }                     from './pages/Dashboard.jsx'
import { Animais }                       from './pages/Animais.jsx'
import { Financeiro }                    from './pages/Financeiro.jsx'
import { Settings }                      from './pages/Settings.jsx'
import { GlobalModals }                  from './pages/GlobalModals.jsx'
import { Ferramentas }                   from './tools/Ferramentas.jsx'
import Login                             from './pages/Login.jsx'

export function App() {
  const [dark, setDark] = useState(false)
  const T = dark ? DARK : LIGHT
  useEffect(() => { document.body.style.background = T.bg }, [T.bg])

  // ── Auth ──────────────────────────────────────────────────────
  const [user,      setUser]      = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [perfil,    setPerfil]    = useState(null)

  // ── Conexão e sync ────────────────────────────────────────────
  const [online,    setOnline]    = useState(navigator.onLine)
  const [lastSync,  setLastSync]  = useState(null)
  const [syncing,   setSyncing]   = useState(false)

  // ── Dados ─────────────────────────────────────────────────────
  const [loading,   setLoading]   = useState(true)
  const [page,      setPage]      = useState('home')
  const [globalAction, setGA]     = useState(null)

  const [pastos,    setP]   = useState([])
  const [animais,   setA]   = useState([])
  const [fin,       setF]   = useState([])
  const [movs,      setMv]  = useState([])
  const [sal,       setSl]  = useState([])
  const [manejos,   setMj]  = useState([])
  const [adubacoes, setAdu] = useState([])

  const SAVERS = {
    pastos: savePastos, animais: saveAnimais,
    fin: saveFin, movs: saveMovs, sal: saveSal,
    manejos: saveManejos, adubacoes: saveAdubacoes
  }
  const mk = (k, s) => fn => s(prev => {
    const next = typeof fn === 'function' ? fn(prev) : fn
    SAVERS[k]?.(next)
    return next
  })

  const setPastos    = mk('pastos',    setP)
  const setAnimais   = mk('animais',   setA)
  const setFin       = mk('fin',       setF)
  const setMovs      = mk('movs',      setMv)
  const setSal       = mk('sal',       setSl)
  const setManejos   = mk('manejos',   setMj)
  const setAdubacoes = mk('adubacoes', setAdu)

  const handleReset = () => {
    setP([]); setA([]); setF([]); setMv([])
    setSl([]); setMj([]); setAdu([])
    dbReset()
    setPage('home')
  }

  // ── 1. Carrega dados locais imediatamente ─────────────────────
  useEffect(() => {
    ;(async () => {
      const cfg = await loadCfg()
      if (cfg?.dark !== undefined) setDark(cfg.dark)

      const loaders = [
        [loadPastos,    setP],
        [loadAnimais,   setA],
        [loadFin,       setF],
        [loadMovs,      setMv],
        [loadSal,       setSl],
        [loadManejos,   setMj],
        [loadAdubacoes, setAdu],
      ]
      await Promise.all(loaders.map(async ([loader, setter]) => {
        const v = await loader()
        if (v !== null) setter(Array.isArray(v) ? v : [])
      }))

      // Última sync
      const meta = await localGet('meta', 'syncInfo')
      if (meta?.lastSync) setLastSync(new Date(meta.lastSync))

      // Se tudo vazio, tenta restaurar do Supabase
      const tudoVazio =
        (!pastos?.length) &&
        (!animais?.length) &&
        (!fin?.length)

      if (tudoVazio && navigator.onLine) {
        console.log('🚀 CACHE VAZIO — bootstrap remoto')

        const ok = await bootstrapFromSupabase()

        if (ok) {
          console.log('✅ bootstrap concluido — recarregando')

          const reloaders = [
            [loadPastos,    setP],
            [loadAnimais,   setA],
            [loadFin,       setF],
            [loadMovs,      setMv],
            [loadSal,       setSl],
            [loadManejos,   setMj],
            [loadAdubacoes, setAdu],
          ]

          await Promise.all(reloaders.map(async ([loader, setter]) => {
            const v = await loader()
            if (v !== null) setter(v)
          }))
        }
      }

      setLoading(false)
    })()
  }, [])

  // ── 2. Auth em background ─────────────────────────────────────
  useEffect(() => {
    let resolved = false
    const resolve = async (session) => {
      if (resolved) return
      resolved = true
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        setCurrentUserId(u.id)
        try {
          const p = await getPerfil(u.id)
          setPerfil(p ?? { nome_fazenda: 'Minha Fazenda' })
        } catch { setPerfil({ nome_fazenda: 'Minha Fazenda' }) }
      }
      setAuthReady(true)
    }

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_e, session) => {
      resolved = false
      await resolve(session)
    })

    supabaseClient.auth.getSession()
      .then(({ data: { session } }) => resolve(session))
      .catch(() => resolve(null))

    setTimeout(() => { if (!resolved) { resolved = true; setAuthReady(true) } }, 5000)

    return () => subscription.unsubscribe()
  }, [])

  // ── 3. Sync quando autenticar ─────────────────────────────────
  useEffect(() => {
    if (!user || !online) return
    doSync(user.id)
  }, [user, online])

  const doSync = async (userId) => {
    if (!userId || !navigator.onLine) return
    setSyncing(true)
    const ok = await syncFromSupabase(userId)
    if (ok) {
      // Recarrega dados do IndexedDB após sync
      const loaders = [
        [loadPastos,    setP],
        [loadAnimais,   setA],
        [loadFin,       setF],
        [loadMovs,      setMv],
        [loadSal,       setSl],
        [loadManejos,   setMj],
        [loadAdubacoes, setAdu],
      ]
      await Promise.all(loaders.map(async ([loader, setter]) => {
        const v = await loader()
        if (v !== null) setter(Array.isArray(v) ? v : [])
      }))
      setLastSync(new Date())
    }
    setSyncing(false)
  }

  // ── 4. Detector de conexão ────────────────────────────────────
  useEffect(() => {
    const goOn  = () => { setOnline(true);  if (user) doSync(user.id) }
    const goOff = () => setOnline(false)
    window.addEventListener('online',  goOn)
    window.addEventListener('offline', goOff)
    return () => { window.removeEventListener('online', goOn); window.removeEventListener('offline', goOff) }
  }, [user])

  const bezNovos = (animais ?? []).filter(a =>
    a.status === 'ativo' && a.cat === 'Bezerro' &&
    a.dataNasc && calcIdade(a.dataNasc)?.dias < 7
  ).length

  const fmtSync = (d) => {
    if (!d) return 'Nunca'
    const diff = Math.floor((Date.now() - d) / 1000)
    if (diff < 60)   return 'agora'
    if (diff < 3600) return `${Math.floor(diff/60)}min atrás`
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const NAV = [
    { id: 'home',        icon: '🏠', label: 'Home'        },
    { id: 'animais',     icon: '🐄', label: 'Animais'     },
    { id: 'financeiro',  icon: '💰', label: 'Caixa'       },
    { id: 'ferramentas', icon: '🧮', label: 'Ferramentas' },
    { id: 'settings',    icon: '⚙️',  label: 'Config.'     },
  ]

  const Splash = () => (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(160deg,${LIGHT.gDark} 0%,${LIGHT.green} 100%)`,
      gap: 20
    }}>
      <img src="/logo.png" alt="Fazendinha" style={{ width: 110, height: 110, borderRadius: 28, objectFit: 'cover', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }} />
      <div>
        <div style={{ color: '#FFF', fontSize: 26, fontWeight: 700, textAlign: 'center' }}>Fazendinha</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', marginTop: 4 }}>Carregando...</div>
      </div>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.2)', borderTop: '3px solid rgba(255,255,255,0.85)', borderRadius: '50%', animation: 'spin 0.75s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (loading)               return <Splash />
  if (authReady && !user)    return <Login onLogin={setUser} />

  return (
    <TC.Provider value={T}>
      <div style={{
        fontFamily: "'SF Pro Text','SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif",
        background: T.bg, minHeight: '100vh',
        maxWidth: 500, margin: '0 auto',
        position: 'relative', overflowX: 'hidden',
        height: '100dvh', overflowY: 'auto'
      }}>

        {/* ── Banner de status ── */}
        {!online && (
          <div style={{
            background: '#FF9500', color: '#FFF',
            fontSize: 12, fontWeight: 700,
            textAlign: 'center', padding: '6px 0',
            position: 'sticky', top: 0, zIndex: 999
          }}>
            ⚡ Modo offline — dados salvos localmente
          </div>
        )}
        {online && syncing && (
          <div style={{
            background: LIGHT.green, color: '#FFF',
            fontSize: 12, fontWeight: 700,
            textAlign: 'center', padding: '6px 0',
            position: 'sticky', top: 0, zIndex: 999
          }}>
            🔄 Sincronizando...
          </div>
        )}
        {online && !syncing && lastSync && (
          <div style={{
            background: 'rgba(0,0,0,0.04)', color: LIGHT.gray,
            fontSize: 11, fontWeight: 500,
            textAlign: 'center', padding: '4px 0'
          }}>
            ✅ Sincronizado {fmtSync(lastSync)}
          </div>
        )}

        {page === 'home'        && <Dashboard
            pastos={pastos} animais={animais} fin={fin} sal={sal}
            setPage={setPage}
            cfg={{ nomeFazenda: perfil?.nome_fazenda || 'Minha Fazenda' }}
            setAction={a => a === 'settings'    ? setPage('settings')
                          : a === 'ferramentas' ? setPage('ferramentas')
                          : setGA(a)}
          />}

        {page === 'animais'     && <Animais
            animais={animais}   setAnimais={setAnimais}
            pastos={pastos}     setPastos={setPastos}
            movs={movs}         setMovs={setMovs}
            sal={sal}           setSal={setSal}
            manejos={manejos}   setManejos={setManejos}
            fin={fin}           setFin={setFin}
          />}

        {page === 'financeiro'  && <Financeiro fin={fin} setFin={setFin} />}

        {page === 'ferramentas' && <Ferramentas
            adubacoes={adubacoes} setAdubacoes={setAdubacoes}
            pastos={pastos}
            animais={animais}     setManejos={setManejos}
          />}

        {page === 'settings'    && <Settings
            dark={dark}
            setDark={v => { setDark(v); saveCfg({ dark: v }) }}
            onReset={handleReset}
            onClose={() => setPage('home')}
            movs={movs}         manejos={manejos}
            animais={animais}   fin={fin}
            pastos={pastos}     sal={sal}
            setAnimais={setAnimais} setFin={setFin}
            setMovs={setMovs}   setSal={setSal}
            setPastos={setPastos} setManejos={setManejos}
            setAdubacoes={setAdubacoes}
          />}

        {globalAction && <GlobalModals
            action={globalAction}
            onClose={() => setGA(null)}
            pastos={pastos}   animais={animais}
            setAnimais={setAnimais}
            setSal={setSal}
            setMovs={setMovs}
            fin={fin}         setFin={setFin}
            setManejos={setManejos}
          />}

        <div style={{
          position: 'fixed', bottom: 0,
          left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 500,
          background: dark ? 'rgba(28,28,30,0.92)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: `1px solid ${dark ? 'rgba(56,56,58,0.6)' : 'rgba(0,0,0,0.06)'}`,
          display: 'flex', zIndex: 300,
          paddingBottom: 'env(safe-area-inset-bottom,0px)'
        }}>
          {NAV.map(n => {
            const isActive = page === n.id
            return (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                style={{
                  flex: 1, border: 'none', background: 'none',
                  padding: '10px 0 12px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', gap: 3, position: 'relative'
                }}
              >
                {n.id === 'animais' && bezNovos > 0 && (
                  <div style={{
                    position: 'absolute', top: 6, left: '55%',
                    background: T.pink, color: '#FFF',
                    borderRadius: 20, minWidth: 16, height: 16,
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 4px', border: '2px solid ' + T.bg
                  }}>{bezNovos}</div>
                )}
                <span style={{ fontSize: 21, lineHeight: 1, filter: isActive ? 'none' : 'grayscale(40%) opacity(0.6)' }}>
                  {n.icon}
                </span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? T.green : T.gray, letterSpacing: '-0.1px', lineHeight: 1 }}>
                  {n.label}
                </span>
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: '30%', right: '30%',
                    height: 2.5, background: T.green, borderRadius: '2px 2px 0 0'
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </TC.Provider>
  )
}
