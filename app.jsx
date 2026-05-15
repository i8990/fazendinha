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
  saveAdubacoes, saveCfg, dbReset
}                                        from './storage.js'
import { Dashboard }                     from './pages/Dashboard.jsx'
import { Animais }                       from './pages/Animais.jsx'
import { Financeiro }                    from './pages/Financeiro.jsx'
import { HistoricoManejo }               from './pages/Historico.jsx'
import { Settings }                      from './pages/Settings.jsx'
import { GlobalModals }                  from './pages/GlobalModals.jsx'
import { Ferramentas }                   from './tools/Ferramentas.jsx'

export function App() {
  const [dark, setDark] = useState(false)
  const T = dark ? DARK : LIGHT
  useEffect(() => { document.body.style.background = T.bg }, [T.bg])

  const [page,         setPage] = useState('home')
  const [globalAction, setGA]   = useState(null)
  const [loading,   setLoading] = useState(true)

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

  useEffect(() => {
    ;(async () => {
      try {
        const cfg = await loadCfg()
        if (cfg?.dark !== undefined) setDark(cfg.dark)
        const loaders = [
          [loadPastos,    setP,   'pastos'],
          [loadAnimais,   setA,   'animais'],
          [loadFin,       setF,   'fin'],
          [loadMovs,      setMv,  'movs'],
          [loadSal,       setSl,  'sal'],
          [loadManejos,   setMj,  'manejos'],
          [loadAdubacoes, setAdu, 'adubacoes'],
        ]
        for (const [loader, setter, name] of loaders) {
          const v = await loader()
          if (v !== null) {
            setter(v)
            console.log(`✅ ${name}: ${Array.isArray(v) ? v.length + ' registros' : 'OK'}`)
          } else {
            console.warn(`⚠️ ${name}: vazio ou não encontrado no banco`)
          }
        }
        console.log('🌿 Sincronização completa')
      } catch (e) {
        console.error('❌ Erro crítico ao carregar do Supabase:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const bezNovos = animais.filter(a =>
    a.status === 'ativo' && a.cat === 'Bezerro' &&
    a.dataNasc && calcIdade(a.dataNasc)?.dias < 7
  ).length

  // Pastos removido da nav — agora é aba interna de Animais
  const NAV = [
    { id: 'home',        icon: '🏠', label: 'Home'        },
    { id: 'animais',     icon: '🐄', label: 'Animais'     },
    { id: 'financeiro',  icon: '💰', label: 'Caixa'       },
    { id: 'historico',   icon: '📋', label: 'Manejo'      },
    { id: 'ferramentas', icon: '🧮', label: 'Ferramentas' },
  ]

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(160deg,${T.gDark} 0%,${T.green} 100%)`,
      gap: 20
    }}>
      <img
        src="/logo.png"
        alt="Fazendinha"
        style={{
          width: 110, height: 110,
          borderRadius: 28,
          objectFit: 'cover',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
          animation: 'fadeIn 0.5s ease'
        }}
      />
      <div>
        <div style={{ color: '#FFF', fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', textAlign: 'center' }}>Fazendinha</div>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', marginTop: 4, fontWeight: 400 }}>Sincronizando dados...</div>
      </div>
      <div style={{
        width: 36, height: 36,
        border: '3px solid rgba(255,255,255,0.2)',
        borderTop: '3px solid rgba(255,255,255,0.85)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite'
      }} />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.9) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  )

  return (
    <TC.Provider value={T}>
      <div style={{
        fontFamily: "'SF Pro Text','SF Pro Display',-apple-system,BlinkMacSystemFont,'Inter',system-ui,sans-serif",
        background: T.bg, minHeight: '100vh',
        maxWidth: 500, margin: '0 auto',
        position: 'relative', overflowX: 'hidden',
        height: '100dvh', overflowY: 'auto'
      }}>

        {page === 'home'        && <Dashboard
            pastos={pastos} animais={animais} fin={fin} sal={sal}
            setPage={setPage}
            setAction={a => a === 'settings'    ? setPage('settings')
                          : a === 'ferramentas' ? setPage('ferramentas')
                          : setGA(a)}
          />}

        {page === 'animais'     && <Animais
            animais={animais}   setAnimais={setAnimais}
            pastos={pastos}     setPastos={setPastos}
            movs={movs}         setMovs={setMovs}
            sal={sal}           setSal={setSal}
            manejos={manejos}
          />}

        {page === 'financeiro'  && <Financeiro fin={fin} setFin={setFin} />}

        {page === 'historico'   && <HistoricoManejo
            movs={movs}       setMovs={setMovs}
            manejos={manejos} setManejos={setManejos}
            animais={animais} fin={fin} setFin={setFin}
            pastos={pastos}
          />}

        {page === 'ferramentas' && <Ferramentas
            adubacoes={adubacoes} setAdubacoes={setAdubacoes}
            pastos={pastos}
          />}

        {page === 'settings'    && <Settings
            dark={dark}
            setDark={v => { setDark(v); saveCfg({ dark: v }) }}
            onReset={handleReset}
            onClose={() => setPage('home')}
            movs={movs}     manejos={manejos}
            animais={animais} fin={fin}
            pastos={pastos}   sal={sal}
          />}

        {globalAction && <GlobalModals
            action={globalAction}
            onClose={() => setGA(null)}
            pastos={pastos}   animais={animais}
            setAnimais={setAnimais}
            setSal={setSal}
            setMovs={setMovs}
          />}

        {page !== 'settings' && (
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
                    alignItems: 'center', gap: 3,
                    position: 'relative'
                  }}
                >
                  {n.id === 'animais' && bezNovos > 0 && (
                    <div style={{
                      position: 'absolute', top: 6, left: '55%',
                      background: T.pink, color: '#FFF',
                      borderRadius: 20, minWidth: 16, height: 16,
                      fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: '0 4px',
                      border: '2px solid ' + T.bg
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
                      position: 'absolute', bottom: 0,
                      left: '30%', right: '30%',
                      height: 2.5,
                      background: T.green,
                      borderRadius: '2px 2px 0 0'
                    }} />
                  )}
                </button>
              )
            })}
          </div>
        )}

      </div>
    </TC.Provider>
  )
}
