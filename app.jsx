// ═══ APP — raiz da aplicacao ══════════════════════════════════════
import { useState, useEffect }               from 'react'
import { TC, LIGHT, DARK }                   from './constants.js'
import { calcIdade }                         from './utils.js'
import {
  savePastos, saveAnimais, saveVendidos, saveFin,
  saveMovs,   saveSal,    saveManejos,
  saveAdubacoes, saveCfg, dbReset,
  dbLoadAll, setCurrentUserId
}                                            from './storage.js'
import { supabaseClient, getPerfil }         from './supabase.js'
import { Dashboard }                         from './pages/Dashboard.jsx'
import { Animais }                           from './pages/Animais.jsx'
import { Financeiro }                        from './pages/Financeiro.jsx'
import { Settings }                          from './pages/Settings.jsx'
import { GlobalModals }                      from './pages/GlobalModals.jsx'
import { Ferramentas }                       from './tools/Ferramentas.jsx'
import Login                                 from './pages/Login.jsx'

function Splash() {
  return (
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
}

export function App() {
  const [dark, setDark] = useState(false)
  const T = dark ? DARK : LIGHT
  useEffect(() => { document.body.style.background = T.bg }, [T.bg])

  const [user,      setUser]      = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [perfil,    setPerfil]    = useState(null)

  const [loading,      setLoading]   = useState(true)
  const [syncing,      setSyncing]   = useState(false)
  const [page,         setPage]      = useState('home')
  const [globalAction, setGA]        = useState(null)

  const [pastos,    setP]   = useState([])
  const [animais,   setA]   = useState([])
  const [fin,       setF]   = useState([])
  const [vendidos,  setV]   = useState([])
  const [movs,      setMv]  = useState([])
  const [sal,       setSl]  = useState([])
  const [manejos,   setMj]  = useState([])
  const [adubacoes, setAdu] = useState([])

  // Wrappers: toda mudanca de estado salva no Supabase automaticamente
  const SAVERS = {
    pastos: savePastos, animais: saveAnimais, vendidos: saveVendidos,
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
  const setVendidos  = mk('vendidos',  setV)
  const setMovs      = mk('movs',      setMv)
  const setSal       = mk('sal',       setSl)
  const setManejos   = mk('manejos',   setMj)
  const setAdubacoes = mk('adubacoes', setAdu)

  // Busca dados do Supabase — usa setters RAW para nao re-salvar
  const loadFromSupabase = async (userId) => {
    setSyncing(true)
    try {
      const snap = await dbLoadAll(userId)
      if (snap) {
        if (snap.pastos    != null) setP(  Array.isArray(snap.pastos)    ? snap.pastos    : [])
        if (snap.animais   != null) setA(  Array.isArray(snap.animais)   ? snap.animais   : [])
        if (snap.fin       != null) setF(  Array.isArray(snap.fin)       ? snap.fin       : [])
        if (snap.vendidos  != null) setV(  Array.isArray(snap.vendidos)  ? snap.vendidos  : [])
        if (snap.movs      != null) setMv( Array.isArray(snap.movs)      ? snap.movs      : [])
        if (snap.sal       != null) setSl( Array.isArray(snap.sal)       ? snap.sal       : [])
        if (snap.manejos   != null) setMj( Array.isArray(snap.manejos)   ? snap.manejos   : [])
        if (snap.adubacoes != null) setAdu(Array.isArray(snap.adubacoes) ? snap.adubacoes : [])
        if (snap.cfg?.dark != null) setDark(snap.cfg.dark)
      }
    } catch (e) {
      console.error('❌ loadFromSupabase:', e)
    } finally {
      setSyncing(false)
    }
  }

  const handleReset = () => {
    setP([]); setA([]); setF([]); setMv([])
    setSl([]); setMj([]); setAdu([])
    dbReset()
    setPage('home')
  }

  // Auth — onAuthStateChange captura login, logout e sessao inicial
  useEffect(() => {
    let initialDone = false
    const finish = () => {
      if (initialDone) return
      initialDone = true
      setAuthReady(true)
      setLoading(false)
    }

    // Carrega sessao imediatamente no boot (nao espera o listener)
    supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null
      if (u) {
        setUser(u)
        setCurrentUserId(u.id)
        try {
          const p = await getPerfil(u.id)
          setPerfil(p ?? { nome_fazenda: 'Minha Fazenda' })
        } catch {
          setPerfil({ nome_fazenda: 'Minha Fazenda' })
        }
        await loadFromSupabase(u.id)
      }
      finish()
    }).catch(() => finish())

    // Listener para login/logout em tempo real (ignora evento inicial, ja tratado pelo getSession)
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      if (!initialDone) return
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        setCurrentUserId(u.id)
        try {
          const p = await getPerfil(u.id)
          setPerfil(p ?? { nome_fazenda: 'Minha Fazenda' })
        } catch {
          setPerfil({ nome_fazenda: 'Minha Fazenda' })
        }
        await loadFromSupabase(u.id)
      } else {
        setP([]); setA([]); setF([]); setMv([])
        setSl([]); setMj([]); setAdu([])
      }
      finish()
    })

    // Fallback: se tudo falhar em 8s
    setTimeout(finish, 8000)

    return () => subscription.unsubscribe()
  }, [])

  const bezNovos = (animais ?? []).filter(a =>
    a.status === 'ativo' && a.cat === 'Bezerro' &&
    a.dataNasc && calcIdade(a.dataNasc)?.dias < 7
  ).length

  const NAV = [
    { id: 'home',        icon: '/abaHome.png',   label: 'Home'    },
    { id: 'animais',     icon: '/iconeVACA.png', label: 'Animais' },
    { id: 'financeiro',  icon: '/abaCAIXA.png',         label: 'Caixa'       },
    { id: 'ferramentas', icon: '/abaFERRAMENTAS.png',    label: 'Ferramentas' },
    { id: 'settings',    icon: '/abaCONFIGURACOES.png', label: 'Config.'     },
  ]

  if (loading)            return <Splash />
  if (authReady && !user) return <Login onLogin={setUser} />

  return (
    <TC.Provider value={T}>
      <div style={{
        fontFamily: "'SF Pro Text','SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif",
        background: T.bg, minHeight: '100vh',
        maxWidth: 500, margin: '0 auto',
        position: 'relative', overflowX: 'hidden',
        height: '100dvh', overflowY: 'auto'
      }}>

        {!navigator.onLine && (
          <div style={{
            background: '#FF9500', color: '#FFF',
            fontSize: 12, fontWeight: 700,
            textAlign: 'center', padding: '6px 0',
            position: 'sticky', top: 0, zIndex: 999
          }}>
            ⚡ Sem conexao — dados nao serao salvos
          </div>
        )}

        {syncing && (
          <div style={{
            background: LIGHT.green, color: '#FFF',
            fontSize: 12, fontWeight: 700,
            textAlign: 'center', padding: '6px 0',
            position: 'sticky', top: 0, zIndex: 999
          }}>
            🔄 Sincronizando...
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
            vendidos={vendidos} setVendidos={setVendidos}
          />}

        {page === 'financeiro'  && <Financeiro fin={fin} setFin={setFin} />}

        {page === 'ferramentas' && <Ferramentas
            adubacoes={adubacoes} setAdubacoes={setAdubacoes}
            pastos={pastos}
            animais={animais}     setManejos={setManejos}
          />}

        {page === 'settings'    && <Settings
            dark={dark}
            syncing={syncing}
            onSync={async () => { if (user?.id) await loadFromSupabase(user.id) }}
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
                  {n.icon.startsWith('/') ? <img src={n.icon} alt={n.label} style={{ width: 36, height: 36, objectFit: 'contain', display: 'block' }} /> : n.icon}
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
