// ═══ SETTINGS — configurações gerais e calendário de eventos ══════
// Exporta: Settings
// Componentes locais (não reusados em outras páginas):
//   Toggle, SobreCard, CalendarView
// Props:
//   dark, setDark, onReset, onClose
//   movs, manejos, animais, fin, pastos, sal

import { useState }              from 'react'
import { useT }                   from '../constants.js'
import { fmtD, fmtR }             from '../utils.js'
import { Card, Btn }              from '../ui.jsx'
import { CalendarView }           from '../widgets.jsx'
import { dbReset, dbSet, dbExport } from '../storage.js'
import { signOut }                         from '../supabase.js'
import { Ajuda }                          from './Ajuda.jsx'

// ── Importar backup ──────────────────────────────────────────────
async function dbImport(file, setters) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result)
        const data = json.data || json
        const KEYS = ['pastos','animais','fin','movs','sal','manejos','adubacoes','cfg']
        for (const k of KEYS) {
          if (data[k] !== undefined) {
            await dbSet(k, data[k])
            if (setters[k]) setters[k](data[k])
          }
        }
        resolve()
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsText(file)
  })
}

// ── Toggle (iOS-style switch) ─────────────────────────────────────
function Toggle({ value, onChange, label, sub }) {
  const T = useT()
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 0', cursor: 'pointer',
        borderBottom: `1px solid ${T.border}`
      }}
    >
      <div>
        <div style={{ fontWeight: 500, color: T.text, fontSize: 16, letterSpacing: '-0.1px' }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: T.gray, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 51, height: 31, borderRadius: 20,
        background: value ? T.green : 'rgba(120,120,128,0.2)',
        display: 'flex', alignItems: 'center',
        padding: '0 3px',
        transition: 'background 0.2s ease',
        flexShrink: 0
      }}>
        <div style={{
          width: 25, height: 25, borderRadius: '50%',
          background: '#FFFFFF',
          transform: value ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.22s cubic-bezier(0.34,1.3,0.64,1)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }} />
      </div>
    </div>
  )
}

// ── SobreCard ─────────────────────────────────────────────────────
function SobreCard() {
  const T = useT()
  const [expandido, setExpandido] = useState(false)
  return <>
    <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>ℹ️ Sobre</div>
    <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.8 }}>
      FazendinhaApp <span style={{ fontWeight: 700, color: T.green }}>v11.0</span> — <span style={{ fontWeight: 500, color: T.text }}>Jblleite</span>
    </div>
    <div style={{ fontSize: 12, color: T.gray, lineHeight: 1.6, marginTop: 4 }}>
      React 18 · Supabase · Open-Meteo · Leaflet/ESRI · Vite 5 · Vercel · Baependi, MG
    </div>
    <button
      onClick={() => setExpandido(e => !e)}
      style={{
        marginTop: 10, background: 'none',
        border: `1.5px solid ${T.border}`, borderRadius: 9,
        padding: '6px 12px', fontSize: 12, fontWeight: 700,
        color: T.green, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6
      }}
    >
      📖 {expandido ? 'Ocultar' : 'Ver'} estrutura
      <span style={{ fontSize: 10, transition: 'transform .2s', display: 'inline-block', transform: expandido ? 'rotate(90deg)' : 'none' }}>›</span>
    </button>
    {expandido && (
      <div style={{
        marginTop: 8, background: T.bg, borderRadius: 10,
        padding: 12, border: `1px solid ${T.border}`,
        fontSize: 12, color: T.text, lineHeight: 2
      }}>
        <div>📦 <b>Dados</b> — <span style={{color:T.gray}}>Supabase key-value, fire-and-forget upsert</span></div>
        <div>🌿 <b>Pastos</b> — <span style={{color:T.gray}}>status, medição satélite, sal mineral</span></div>
        <div>🐄 <b>Animais</b> — <span style={{color:T.gray}}>ficha, movimentação, manejos, venda (12 meses)</span></div>
        <div>💰 <b>Financeiro</b> — <span style={{color:T.gray}}>caixa mensal + pessoal, gráfico 6 meses</span></div>
        <div>🧮 <b>Ferramentas</b> — <span style={{color:T.gray}}>UA, lotação, sal, GMD, adubação Embrapa, confinamento</span></div>
        <div>🌐 <b>Offline</b> — <span style={{color:T.gray}}>dados sincronizados em tempo real, PWA instalável</span></div>
      </div>
    )}
  </>
}

// ═══ SETTINGS (tela principal) ════════════════════════════════════
export function Settings({ syncing, onSync, dark, setDark, onReset, onClose, movs, manejos, animais, fin, pastos, sal, setAnimais, setFin, setMovs, setSal, setPastos, setManejos, setAdubacoes }) {
  const T = useT()
  const [confirmReset, setCR]  = useState(false)
  const [importing,    setImp]  = useState(false)
  const [importOk,     setImpOk] = useState(false)
  const [aba, setAba]          = useState('geral')
  const [ajudaOpen, setAjuda]  = useState(false)

  if (ajudaOpen) return <Ajuda onClose={() => setAjuda(false)} />

  const allData = { pastos, animais, fin, movs, manejos, sal }

  const handleReset = () => {
    dbReset()
    onReset()
    setCR(false)
  }

  return (
    <div style={{ paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(145deg,${T.gDark},${T.green})`,
        padding: '10px 16px 12px',
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.18)', border: 'none', color: '#FFF',
            borderRadius: 20, padding: '7px 14px 7px 10px',
            fontWeight: 600, cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0
          }}
        >
          <svg width="8" height="13" viewBox="0 0 9 15" fill="none">
            <path d="M8 1L1.5 7.5L8 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Voltar
        </button>
        <div style={{ color: '#FFF', fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>Configurações ⚙️</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: T.gDark, padding: '0 16px', gap: 4 }}>
        {[['geral', '⚙️ Geral'], ['historico', '📅 Histórico']].map(([id, lbl]) => (
          <button key={id} onClick={() => setAba(id)} style={{
            flex: 1, border: 'none', background: 'none',
            color: aba === id ? '#FFF' : 'rgba(255,255,255,0.45)',
            fontWeight: aba === id ? 600 : 400,
            fontSize: 14, padding: '13px 0', cursor: 'pointer',
            borderBottom: aba === id ? '2.5px solid #FFF' : '2.5px solid transparent'
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Aba Geral */}
        {aba === 'geral' && <>
          {/* Aparência */}
          <Card ch={<>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>🎨 Aparência</div>
            <Toggle value={dark} onChange={setDark} label="Modo Escuro" sub="Interface adaptada para uso noturno" />
          </>} />

          {/* Sync */}
          <Card ch={<>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>Sincronizacao</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 14, lineHeight: 1.6 }}>
              Busca os dados mais recentes do servidor.
            </div>
            <Btn l={syncing ? 'Sincronizando...' : 'Sincronizar Agora'} color={T.green} onClick={onSync} />
          </>} />
          <Card ch={<>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>💾 Dados</div>
            <div style={{ fontSize: 12, color: T.gray, marginBottom: 14, lineHeight: 1.6 }}>
              Dados salvos localmente no dispositivo. Exporte regularmente para backup.
            </div>
            <Btn
              l={importing ? 'Importando...' : importOk ? '✅ Importado!' : '📥 Importar Backup (JSON)'}
              color={importOk ? T.green : T.blue}
              onClick={() => {
                const input = document.createElement('input')
                input.type = 'file'
                input.accept = '.json'
                input.onchange = async (e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  setImp(true); setImpOk(false)
                  try {
                    await dbImport(file, {
                      pastos:    v => { setPastos(v) },
                      animais:   v => { setAnimais(v) },
                      fin:       v => { setFin(v) },
                      movs:      v => { setMovs(v) },
                      sal:       v => { setSal(v) },
                      manejos:   v => { setManejos(v) },
                      adubacoes: v => { setAdubacoes(v) },
                    })
                    setImpOk(true)
                  } catch {
                    alert('Arquivo inválido ou corrompido.')
                  }
                  setImp(false)
                }
                input.click()
              }}
              style={{ marginBottom: 10 }}
            />
            <Btn l="📤 Exportar Backup (JSON)" color={T.blue} onClick={() => dbExport(allData)} style={{ marginBottom: 10 }} />
            {!confirmReset
              ? <Btn l="🗑️ Resetar Todos os Dados" color={T.red} onClick={() => setCR(true)} />
              : <div style={{ background: '#FFE4E6', borderRadius: 12, padding: 14, marginTop: 4 }}>
                  <div style={{ fontWeight: 700, color: T.red, marginBottom: 10, fontSize: 15 }}>⚠️ Confirmar reset?</div>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 14 }}>Todos os dados serão apagados permanentemente.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      onClick={() => setCR(false)}
                      style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer', color: T.gray, fontSize: 14 }}
                    >Cancelar</button>
                    <button
                      onClick={handleReset}
                      style={{ background: T.red, border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, cursor: 'pointer', color: '#FFF', fontSize: 14 }}
                    >🗑️ Sim, apagar</button>
                  </div>
                </div>
            }
          </>} />

          {/* Ajuda */}
          <Card ch={<>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>📖 Ajuda</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 14, lineHeight: 1.6 }}>
              Manuais do usuário e do desenvolvedor com instruções detalhadas do app.
            </div>
            <Btn l="📖 Abrir Ajuda" color={T.green} onClick={() => setAjuda(true)} />
          </>} />

          {/* Sair */}
          <Card ch={<>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: 4 }}>🚪 Conta</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 14, lineHeight: 1.6 }}>
              Sair da conta neste dispositivo.
            </div>
            <Btn
              l="🚪 Sair"
              color={T.red}
              onClick={async () => { await signOut(); window.location.reload() }}
            />
          </>} />

          {/* Sobre */}
          <Card ch={<SobreCard />} />
        </>}

        {/* Aba Histórico / Calendário */}
        {aba === 'historico' && <>
          <div style={{ fontWeight: 700, color: T.text, marginBottom: 12, fontSize: 16 }}>📅 Calendário de Eventos</div>
          <Card ch={<CalendarView movs={movs} manejos={manejos} animais={animais} fin={fin} />} />
        </>}

      </div>
    </div>
  )
}
