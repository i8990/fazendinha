// ═══ CURRAL TOOL — checklist de animais para manejos em lote ══════
// Exporta: CurralTool
// Props:
//   animais   : array — lista completa de animais
//   pastos    : array — para filtrar por pasto
//   onSalvar(manejo) : chamado ao confirmar — entrega objeto de manejo pronto
//   onFechar()       : fecha a ferramenta sem salvar

import { useState }        from 'react'
import { useT, TM }        from '../constants.js'
import { TODAY }           from '../utils.js'
import { Inp }             from '../ui.jsx'

// Ícones por categoria
const CAT_ICON = { Boi: '🐂', Vaca: '🐄', Novilha: '🐄', Bezerro: '🐮', Touro: '🐂' }

export function CurralTool({ animais, pastos, onSalvar, onFechar }) {
  const T = useT()

  // ── Configuração do manejo ────────────────────────────────────────
  const [cfgOpen, setCfgOpen] = useState(true)
  const [tipo,    setTipo]    = useState('ivermectina')
  const [nomeC,   setNomeC]   = useState('')
  const [dose,    setDose]    = useState('')
  const [data,    setData]    = useState(TODAY)
  const [obs,     setObs]     = useState('')

  // ── Seleção de animais ────────────────────────────────────────────
  const [pastoFiltro, setPastoFiltro] = useState('todos')
  const [checked,     setChecked]     = useState({})
  const [busca,       setBusca]       = useState('')
  const [salvo,       setSalvo]       = useState(false)

  const ti       = TM.find(t => t.v === tipo) || TM[0]
  const ativos   = animais.filter(a => a.status === 'ativo')
  const porPasto = pastoFiltro === 'todos'
    ? ativos
    : ativos.filter(a => String(a.pastoId) === pastoFiltro)
  const filtrados = busca
    ? porPasto.filter(a => a.ident.toLowerCase().includes(busca.toLowerCase()))
    : porPasto

  const nChecked = filtrados.filter(a => checked[a.id]).length

  // ── Handlers ──────────────────────────────────────────────────────
  const toggle     = id => setChecked(c => ({ ...c, [id]: !c[id] }))
  const checkAll   = () => { const n = { ...checked }; filtrados.forEach(a => { n[a.id] = true  }); setChecked(n) }
  const uncheckAll = () => { const n = { ...checked }; filtrados.forEach(a => { delete n[a.id] }); setChecked(n) }

  const salvar = () => {
    const marcados = filtrados.filter(a => checked[a.id])
    if (!marcados.length) return
    onSalvar({
      id: Date.now(),
      tipoManejo:    tipo,
      nomeManejo:    tipo === 'outro' ? (nomeC || 'Personalizado') : ti.l,
      animaisIds:    marcados.map(a => a.id),
      animaisIdents: marcados.map(a => a.ident),
      dose, data, obs
    })
    setSalvo(true)
    setTimeout(() => onFechar(), 1100)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', flexDirection: 'column', background: T.bg }}>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg,${T.gDark},${T.green})`,
        color: '#FFF',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 13px)',
        paddingBottom: 13, paddingLeft: 15, paddingRight: 15,
        flexShrink: 0,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>🏚️ Ferramenta de Curral</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
            {ti.icon} {ti.l}{dose ? ` · ${dose}` : ''} —{' '}
            <b style={{ fontSize: 15 }}>{nChecked}</b> marcados
          </div>
        </div>
        <button
          onClick={onFechar}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF', borderRadius: 9, padding: '7px 14px', fontWeight: 700, cursor: 'pointer' }}
        >✕</button>
      </div>

      {/* ── Painel de configuração (colapsável) ── */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <button
          onClick={() => setCfgOpen(o => !o)}
          style={{ width: '100%', background: 'none', border: 'none', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, color: T.text, fontSize: 13 }}
        >
          ⚙️ Configuração
          <span style={{ fontSize: 11, color: T.gray }}>{cfgOpen ? '▲' : '▼'}</span>
        </button>

        {cfgOpen && (
          <div style={{ padding: '0 14px 12px' }}>
            {/* Chips de tipo de manejo */}
            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 9, scrollbarWidth: 'none', marginBottom: 10 }}>
              {TM.map(t => (
                <button
                  key={t.v}
                  onClick={() => setTipo(t.v)}
                  style={{
                    border: `2px solid ${tipo === t.v ? t.c : T.border}`,
                    borderRadius: 20, padding: '7px 13px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                    background: tipo === t.v ? t.c + '18' : T.card,
                    color: tipo === t.v ? t.c : T.gray
                  }}
                >{t.icon} {t.l}</button>
              ))}
            </div>

            {tipo === 'outro' && <Inp label="Nome" value={nomeC} onChange={setNomeC} placeholder="Ex: Brucelose..." />}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Inp label="Dose/Produto" value={dose} onChange={setDose} placeholder="5ml" />
              <Inp label="Data"         value={data} onChange={setData} type="date" />
            </div>
            <Inp label="Observações" value={obs} onChange={setObs} placeholder="Opcional..." />

            {/* Filtro por pasto */}
            <div style={{ display: 'flex', gap: 7, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }}>
              {[{ id: 'todos', nome: '🐄 Todos' }, ...pastos].map(p => (
                <button
                  key={String(p.id)}
                  onClick={() => setPastoFiltro(String(p.id))}
                  style={{
                    border: 'none', borderRadius: 20, padding: '6px 13px',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    whiteSpace: 'nowrap', flexShrink: 0,
                    background: pastoFiltro === String(p.id) ? T.green : T.gPale,
                    color:      pastoFiltro === String(p.id) ? '#FFF'  : T.green
                  }}
                >{p.nome}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Barra de busca + controles de seleção ── */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: '7px 13px', flexShrink: 0 }}>
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="🔍 Buscar brinco..."
          style={{ width: '100%', border: `1.5px solid ${T.border}`, borderRadius: 9, padding: '9px 13px', fontSize: 13, outline: 'none', background: T.bg, color: T.text, marginBottom: 7, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: T.gray }}>{filtrados.length} animais · {nChecked} marcados</span>
          <div style={{ display: 'flex', gap: 7 }}>
            <button onClick={checkAll}   style={{ background: T.gPale,    border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: T.green, cursor: 'pointer' }}>✓ Todos</button>
            <button onClick={uncheckAll} style={{ background: '#FFE4E6',  border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 11, fontWeight: 700, color: T.red,   cursor: 'pointer' }}>✕ Limpar</button>
          </div>
        </div>
      </div>

      {/* ── Lista de animais (scrollável) ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '9px 13px' }}>
        {filtrados.map(a => {
          const ok = !!checked[a.id]
          const pt = pastos.find(p => p.id === a.pastoId)
          return (
            <div
              key={a.id}
              onClick={() => toggle(a.id)}
              style={{
                background: ok ? T.gPale : T.card,
                border: `2.5px solid ${ok ? T.green : T.border}`,
                borderRadius: 15, padding: '13px 15px', marginBottom: 9,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'pointer', userSelect: 'none', transition: 'all 0.1s'
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 30, flexShrink: 0, opacity: ok ? 1 : 0.65 }}>
                  {CAT_ICON[a.cat] || '🐄'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 19, color: ok ? T.green : T.text }}>{a.ident}</div>
                  <div style={{ fontSize: 11, color: T.gray }}>{a.cat} · Lote {a.lote}</div>
                  {pt && <div style={{ fontSize: 10, color: T.gLight }}>📍 {pt.nome}</div>}
                </div>
              </div>
              {/* Checkbox visual */}
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                border: `3px solid ${ok ? T.green : T.border}`,
                background: ok ? T.green : T.card,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {ok && <span style={{ color: '#FFF', fontSize: 20, fontWeight: 800, lineHeight: 1 }}>✓</span>}
              </div>
            </div>
          )
        })}
        <div style={{ height: 90 }} />
      </div>

      {/* ── Footer: botão salvar ── */}
      <div style={{ background: T.card, padding: '11px 14px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
        {salvo
          ? <div style={{ background: T.gPale, borderRadius: 13, padding: 15, textAlign: 'center', fontWeight: 700, color: T.green, fontSize: 15 }}>
              ✅ Manejo salvo!
            </div>
          : <button
              onClick={salvar}
              disabled={nChecked === 0}
              style={{
                background: nChecked === 0 ? T.border : ti.c,
                color: '#FFF', border: 'none', borderRadius: 13,
                padding: '15px', fontSize: 15, fontWeight: 700,
                width: '100%', cursor: nChecked === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {ti.icon} Salvar{nChecked > 0 ? ` — ${nChecked} animal${nChecked > 1 ? 'is' : ''}` : ''}
            </button>
        }
      </div>
    </div>
  )
}
