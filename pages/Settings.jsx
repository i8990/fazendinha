// ═══ SETTINGS — configurações gerais e calendário de eventos ══════
// Exporta: Settings
// Componentes locais (não reusados em outras páginas):
//   Toggle, SobreCard, CalendarView
// Props:
//   dark, setDark, onReset, onClose
//   movs, manejos, animais, fin, pastos, sal

import { useState, useMemo }              from 'react'
import { useT, MESES }                    from '../constants.js'
import { TODAY, fmtD, fmtR }              from '../utils.js'
import { Card, Btn }                      from '../ui.jsx'
import { dbReset, dbExport, dbSet }       from '../storage.js'
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
    <div style={{ fontWeight: 700, color: T.text, marginBottom: 8 }}>ℹ️ Sobre</div>
    <div style={{ fontSize: 13, color: T.gray, lineHeight: 1.8 }}>
      FazendinhaApp <span style={{ fontWeight: 700, color: T.green }}>v11.0</span><br />
      Gestão rural offline — pastagens, rebanho e financeiro.<br />
      Baependi, MG — Open-Meteo · Satélite ESRI · Supabase.<br />
      <span style={{ fontWeight: 700, color: T.green }}>Desenvolvido por Jblleite</span>
    </div>
    <button
      onClick={() => setExpandido(e => !e)}
      style={{
        marginTop: 12, background: 'none',
        border: `1.5px solid ${T.border}`, borderRadius: 9,
        padding: '7px 14px', fontSize: 12, fontWeight: 700,
        color: T.green, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6
      }}
    >
      📖 {expandido ? 'Ocultar' : 'Ver'} estrutura do app
      <span style={{ fontSize: 10, transition: 'transform .2s', display: 'inline-block', transform: expandido ? 'rotate(90deg)' : 'none' }}>›</span>
    </button>
    {expandido && (
      <div style={{
        marginTop: 10, background: T.bg, borderRadius: 12,
        padding: 14, border: `1px solid ${T.border}`,
        fontSize: 12, color: T.text, lineHeight: 2
      }}>
        <div>📦 <b>Dados</b> — salvos em tempo real no Supabase (cloud), chave por entidade.</div>
        <div>🌿 <b>Pastos</b> — status, estado, sal mineral e medição por satélite (ESRI).</div>
        <div>🐄 <b>Animais</b> — ficha individual, movimentação, linhagem e manejos vinculados.</div>
        <div>💰 <b>Financeiro</b> — caixa mensal com receitas, despesas e saldo consolidado.</div>
        <div>🧮 <b>Ferramentas</b> — calculadoras de UA, lotação, sal, GMD e adubação (Embrapa).</div>
        <div>🌱 <b>Adubação</b> — interpreta análise de solo e recomenda produtos e doses por ha.</div>
      </div>
    )}
  </>
}

// ── CalendarView ──────────────────────────────────────────────────
function CalendarView({ movs, manejos, animais, fin }) {
  const T = useT()
  const [cur, setCur] = useState(() => new Date())
  const [sel, setSel] = useState(null)

  const y        = cur.getFullYear(), m = cur.getMonth()
  const firstDow = new Date(y, m, 1).getDay()
  const daysInM  = new Date(y, m + 1, 0).getDate()
  const isoP     = `${y}-${String(m + 1).padStart(2, '0')}`

  const allEv = useMemo(() => {
    const e = []
    movs.forEach(x    => e.push({ ...x, _tipo: 'mov' }))
    manejos.forEach(x => e.push({ ...x, _tipo: 'manejo' }))
    animais.filter(a  => a.cat === 'Bezerro' && a.dataNasc)
           .forEach(b => e.push({ id: `n${b.id}`, data: b.dataNasc, ident: b.ident, _tipo: 'nasc' }))
    fin.forEach(f     => e.push({ ...f, _tipo: 'fin' }))
    return e
  }, [movs, manejos, animais, fin])

  const byDate = useMemo(() => {
    const map = {}
    allEv.forEach(e => {
      if (!e.data) return
      if (!map[e.data]) map[e.data] = []
      map[e.data].push(e)
    })
    return map
  }, [allEv])

  const selKey = sel ? `${isoP}-${String(sel).padStart(2, '0')}` : null
  const selEvs = selKey ? (byDate[selKey] || []) : []
  const tipoCor  = { mov: T.orange, manejo: T.purple, nasc: T.pink, fin: T.blue }
  const tipoIcon = { mov: '🔄', manejo: '💉', nasc: '🐮', fin: '💰' }

  return (
    <div>
      {/* Navegação mês */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() - 1))}
          style={{ background: T.bg, border: 'none', borderRadius: 9, width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >‹</button>
        <div style={{ fontWeight: 800, color: T.text, fontSize: 15 }}>{MESES[m]} {y}</div>
        <button
          onClick={() => setCur(d => new Date(d.getFullYear(), d.getMonth() + 1))}
          style={{ background: T.bg, border: 'none', borderRadius: 9, width: 36, height: 36, fontSize: 18, cursor: 'pointer', color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >›</button>
      </div>

      {/* Header dias da semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: 6 }}>
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
          <div key={i} style={{ fontSize: 10, fontWeight: 700, color: T.gray, paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      {/* Grid de dias */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInM }).map((_, i) => {
          const day    = i + 1
          const key    = `${isoP}-${String(day).padStart(2, '0')}`
          const evs    = byDate[key] || []
          const isToday = key === TODAY
          const isSel  = sel === day
          return (
            <div
              key={day}
              onClick={() => setSel(isSel ? null : day)}
              style={{
                borderRadius: 9, padding: '5px 2px', textAlign: 'center', cursor: 'pointer',
                background: isSel ? T.green : isToday ? T.gPale : 'transparent',
                border: `1.5px solid ${isSel ? T.green : isToday ? T.gLight : 'transparent'}`,
                minHeight: 42
              }}
            >
              <div style={{ fontSize: 12, fontWeight: isToday ? 800 : 400, color: isSel ? '#FFF' : T.text }}>{day}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2, flexWrap: 'wrap' }}>
                {[...new Set(evs.map(e => e._tipo))].slice(0, 3).map(t => (
                  <div key={t} style={{ width: 5, height: 5, borderRadius: '50%', background: tipoCor[t] || T.gray }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Eventos do dia selecionado */}
      {sel && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, color: T.text, marginBottom: 9 }}>
            📅 {String(sel).padStart(2, '0')}/{String(m + 1).padStart(2, '0')}/{y}
          </div>
          {selEvs.length === 0 && (
            <div style={{ color: T.gray, fontSize: 12, textAlign: 'center', padding: 14 }}>Nenhum evento</div>
          )}
          {selEvs.map((e, i) => (
            <div key={i} style={{ background: T.bg, borderRadius: 11, padding: '9px 13px', marginBottom: 7, display: 'flex', gap: 9, alignItems: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: (tipoCor[e._tipo] || T.gray) + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {tipoIcon[e._tipo] || '•'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: T.text, fontSize: 13 }}>{e.ident || e.nomeManejo || e.cat || e._tipo}</div>
                <div style={{ fontSize: 11, color: T.gray }}>{e.de && e.para ? `${e.de} → ${e.para}` : e.desc || e.dose || ''}</div>
              </div>
              {e.valor && (
                <div style={{ fontWeight: 700, color: e.tipo === 'receita' ? T.gLight : T.red, fontSize: 13 }}>
                  {e.tipo === 'receita' ? '+' : '-'}{fmtR(e.valor)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══ SETTINGS (tela principal) ════════════════════════════════════
export function Settings({ dark, setDark, onReset, onClose, movs, manejos, animais, fin, pastos, sal, setAnimais, setFin, setMovs, setSal, setPastos, setManejos, setAdubacoes }) {
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

          {/* Dados */}
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
